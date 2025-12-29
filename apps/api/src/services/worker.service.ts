/**
 * Worker Threads Service
 * 
 * @description Implements worker threads for CPU-intensive operations
 * that would block the event loop. Node.js Worker Threads run in
 * parallel V8 instances with their own event loops.
 * 
 * Interview Discussion Points:
 * - Worker threads vs Cluster: threads share memory, clusters don't
 * - Use for CPU-intensive tasks (parsing, compression, crypto)
 * - SharedArrayBuffer for zero-copy data sharing
 * - Message passing via postMessage/on('message')
 * - Worker pool for efficiency (avoid spawning overhead)
 * 
 * @example
 * ```typescript
 * // Heavy computation
 * const result = await workerService.runTask('heavyComputation', { data: largeArray });
 * 
 * // Image processing
 * const optimized = await workerService.runTask('imageProcessing', { 
 *   buffer: imageBuffer, 
 *   width: 800 
 * });
 * ```
 * 
 * @module workers
 * @category Performance
 */

import os from 'os';
import path from 'path';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { logger } from '../utils/logger';

// Task types that workers can handle
export type TaskType = 
  | 'heavyComputation'
  | 'imageProcessing'
  | 'dataTransformation'
  | 'csvParsing'
  | 'jsonParsing'
  | 'encryption'
  | 'hashing';

interface WorkerTask {
  id: string;
  type: TaskType;
  data: unknown;
}

interface WorkerResult {
  id: string;
  success: boolean;
  result?: unknown;
  error?: string;
}

interface PooledWorker {
  worker: Worker;
  busy: boolean;
}

/**
 * Worker Thread Pool
 * 
 * @description Manages a pool of worker threads to avoid the overhead
 * of creating new threads for each task. Implements a queue for
 * tasks when all workers are busy.
 */
class WorkerPool {
  private workers: PooledWorker[] = [];
  private taskQueue: Array<{
    task: WorkerTask;
    resolve: (result: unknown) => void;
    reject: (error: Error) => void;
  }> = [];
  private poolSize: number;

  constructor(poolSize?: number) {
    // Default to number of CPUs minus 1 (leave one for main thread)
    this.poolSize = poolSize || Math.max(1, os.cpus().length - 1);
    this.initializePool();
  }

  /**
   * Initialize the worker pool
   */
  private initializePool(): void {
    logger.info(`🔧 Initializing worker pool with ${this.poolSize} workers`);

    for (let i = 0; i < this.poolSize; i++) {
      this.addWorker();
    }
  }

  /**
   * Add a worker to the pool
   */
  private addWorker(): void {
    const worker = new Worker(path.join(__dirname, 'worker.thread.js'));
    
    const pooledWorker: PooledWorker = {
      worker,
      busy: false,
    };

    worker.on('message', (result: WorkerResult) => {
      pooledWorker.busy = false;
      this.processNextTask(pooledWorker);
    });

    worker.on('error', (error) => {
      logger.error('Worker thread error:', error);
      pooledWorker.busy = false;
      // Remove failed worker and add a new one
      this.removeWorker(pooledWorker);
      this.addWorker();
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        logger.warn(`Worker exited with code ${code}`);
      }
    });

    this.workers.push(pooledWorker);
  }

  /**
   * Remove a worker from the pool
   */
  private removeWorker(pooledWorker: PooledWorker): void {
    const index = this.workers.indexOf(pooledWorker);
    if (index > -1) {
      this.workers.splice(index, 1);
      pooledWorker.worker.terminate();
    }
  }

  /**
   * Process the next task in the queue
   */
  private processNextTask(pooledWorker: PooledWorker): void {
    if (this.taskQueue.length === 0) return;

    const { task, resolve, reject } = this.taskQueue.shift()!;
    this.executeTask(pooledWorker, task, resolve, reject);
  }

  /**
   * Execute a task on a worker
   */
  private executeTask(
    pooledWorker: PooledWorker,
    task: WorkerTask,
    resolve: (result: unknown) => void,
    reject: (error: Error) => void
  ): void {
    pooledWorker.busy = true;

    const messageHandler = (result: WorkerResult) => {
      pooledWorker.worker.off('message', messageHandler);
      
      if (result.id === task.id) {
        if (result.success) {
          resolve(result.result);
        } else {
          reject(new Error(result.error || 'Unknown worker error'));
        }
        pooledWorker.busy = false;
        this.processNextTask(pooledWorker);
      }
    };

    pooledWorker.worker.on('message', messageHandler);
    pooledWorker.worker.postMessage(task);
  }

  /**
   * Run a task in the worker pool
   */
  async runTask<T>(type: TaskType, data: unknown): Promise<T> {
    const task: WorkerTask = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
    };

    return new Promise<T>((resolve, reject) => {
      // Find an available worker
      const availableWorker = this.workers.find((w) => !w.busy);

      if (availableWorker) {
        this.executeTask(availableWorker, task, resolve as (result: unknown) => void, reject);
      } else {
        // Queue the task
        this.taskQueue.push({
          task,
          resolve: resolve as (result: unknown) => void,
          reject,
        });
      }
    });
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    totalWorkers: number;
    busyWorkers: number;
    availableWorkers: number;
    queuedTasks: number;
  } {
    const busyWorkers = this.workers.filter((w) => w.busy).length;
    return {
      totalWorkers: this.workers.length,
      busyWorkers,
      availableWorkers: this.workers.length - busyWorkers,
      queuedTasks: this.taskQueue.length,
    };
  }

  /**
   * Shutdown the worker pool
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down worker pool...');
    
    await Promise.all(
      this.workers.map((pooledWorker) => pooledWorker.worker.terminate())
    );
    
    this.workers = [];
    this.taskQueue = [];
    
    logger.info('Worker pool shutdown complete');
  }
}

// Singleton instance
let workerPool: WorkerPool | null = null;

/**
 * Get or create the worker pool
 */
export function getWorkerPool(): WorkerPool {
  if (!workerPool) {
    workerPool = new WorkerPool();
  }
  return workerPool;
}

/**
 * Worker Service
 * 
 * @description High-level API for running CPU-intensive tasks
 * in worker threads.
 */
export class WorkerService {
  private pool: WorkerPool;

  constructor() {
    this.pool = getWorkerPool();
  }

  /**
   * Run a CPU-intensive task in a worker thread
   */
  async runTask<T>(type: TaskType, data: unknown): Promise<T> {
    return this.pool.runTask<T>(type, data);
  }

  /**
   * Heavy computation example (sorting, filtering large arrays)
   */
  async heavyComputation<T>(data: T[]): Promise<T[]> {
    return this.runTask<T[]>('heavyComputation', data);
  }

  /**
   * Parse large CSV data
   */
  async parseCsv(csvData: string): Promise<Record<string, string>[]> {
    return this.runTask<Record<string, string>[]>('csvParsing', csvData);
  }

  /**
   * Parse large JSON data
   */
  async parseJson<T>(jsonData: string): Promise<T> {
    return this.runTask<T>('jsonParsing', jsonData);
  }

  /**
   * Transform large datasets
   */
  async transformData<T, R>(data: T[], transformFn: string): Promise<R[]> {
    return this.runTask<R[]>('dataTransformation', { data, transformFn });
  }

  /**
   * Hash data (for large files or multiple items)
   */
  async hashData(data: string | Buffer, algorithm: string = 'sha256'): Promise<string> {
    return this.runTask<string>('hashing', { data, algorithm });
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return this.pool.getStats();
  }

  /**
   * Shutdown the worker pool
   */
  async shutdown(): Promise<void> {
    await this.pool.shutdown();
    workerPool = null;
  }
}

// Export singleton instance
export const workerService = new WorkerService();

export default workerService;

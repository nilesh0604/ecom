/**
 * Queue Service (Job Queue / Message Queue)
 * 
 * @description Implements a job queue for async task processing using
 * an in-memory queue (can be extended to use Bull/BullMQ with Redis).
 * Essential for background jobs, email sending, and async processing.
 * 
 * Interview Discussion Points:
 * - Why queues: Decouple producers/consumers, retry logic, rate limiting
 * - Bull vs BullMQ: BullMQ is newer, better TypeScript support
 * - Redis requirement: Persistence, distributed workers
 * - Job types: Delayed, repeated, prioritized
 * - Dead letter queue: Handle failed jobs
 * - Backoff strategies: Exponential, fixed, custom
 * 
 * @example
 * ```typescript
 * // Add a job to the queue
 * await queueService.addJob('email', {
 *   type: 'orderConfirmation',
 *   to: 'user@example.com',
 *   orderId: '123'
 * });
 * 
 * // Add a delayed job
 * await queueService.addJob('reminder', { userId: 1 }, { delay: 3600000 });
 * 
 * // Add a recurring job
 * await queueService.addRecurringJob('cleanup', {}, '0 0 * * *'); // Daily at midnight
 * ```
 * 
 * @module queue
 * @category Architecture
 */

import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

// Job status enum
export enum JobStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
}

// Job interface
export interface Job<T = unknown> {
  id: string;
  name: string;
  data: T;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  delay?: number;
  priority: number;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  result?: unknown;
}

// Job options
export interface JobOptions {
  delay?: number; // Delay in milliseconds
  priority?: number; // Higher number = higher priority
  attempts?: number; // Max retry attempts
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number; // Base delay in ms
  };
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
}

// Job handler type
export type JobHandler<T = unknown> = (job: Job<T>) => Promise<unknown>;

/**
 * In-Memory Queue Implementation
 * 
 * @description A simple in-memory queue for demonstration.
 * In production, use Bull/BullMQ with Redis for:
 * - Persistence across restarts
 * - Distributed workers
 * - Better reliability
 */
class Queue<T = unknown> extends EventEmitter {
  private name: string;
  private jobs: Map<string, Job<T>> = new Map();
  private waitingQueue: string[] = [];
  private handler: JobHandler<T> | null = null;
  private isProcessing = false;
  private concurrency: number;
  private activeCount = 0;

  constructor(name: string, options?: { concurrency?: number }) {
    super();
    this.name = name;
    this.concurrency = options?.concurrency || 1;
  }

  /**
   * Add a job to the queue
   */
  async add(data: T, options: JobOptions = {}): Promise<Job<T>> {
    const job: Job<T> = {
      id: `${this.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: this.name,
      data,
      status: options.delay ? JobStatus.DELAYED : JobStatus.WAITING,
      attempts: 0,
      maxAttempts: options.attempts || 3,
      delay: options.delay,
      priority: options.priority || 0,
      createdAt: new Date(),
    };

    this.jobs.set(job.id, job);

    if (options.delay) {
      // Schedule delayed job
      setTimeout(() => {
        job.status = JobStatus.WAITING;
        this.waitingQueue.push(job.id);
        this.sortQueue();
        this.processNext();
      }, options.delay);
    } else {
      this.waitingQueue.push(job.id);
      this.sortQueue();
      this.processNext();
    }

    this.emit('added', job);
    logger.debug(`Job added to queue ${this.name}:`, { jobId: job.id });

    return job;
  }

  /**
   * Sort queue by priority (higher priority first)
   */
  private sortQueue(): void {
    this.waitingQueue.sort((a, b) => {
      const jobA = this.jobs.get(a);
      const jobB = this.jobs.get(b);
      return (jobB?.priority || 0) - (jobA?.priority || 0);
    });
  }

  /**
   * Register a job processor
   */
  process(handler: JobHandler<T>): void {
    this.handler = handler;
    this.processNext();
  }

  /**
   * Process the next job in the queue
   */
  private async processNext(): Promise<void> {
    if (!this.handler) return;
    if (this.activeCount >= this.concurrency) return;
    if (this.waitingQueue.length === 0) return;

    const jobId = this.waitingQueue.shift();
    if (!jobId) return;

    const job = this.jobs.get(jobId);
    if (!job) return;

    this.activeCount++;
    job.status = JobStatus.ACTIVE;
    job.processedAt = new Date();
    job.attempts++;

    this.emit('active', job);

    try {
      const result = await this.handler(job);
      job.status = JobStatus.COMPLETED;
      job.completedAt = new Date();
      job.result = result;
      
      this.emit('completed', job, result);
      logger.debug(`Job completed:`, { jobId: job.id, queue: this.name });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (job.attempts < job.maxAttempts) {
        // Retry with exponential backoff
        job.status = JobStatus.DELAYED;
        const delay = Math.pow(2, job.attempts) * 1000; // Exponential backoff
        
        setTimeout(() => {
          job.status = JobStatus.WAITING;
          this.waitingQueue.push(job.id);
          this.sortQueue();
          this.processNext();
        }, delay);
        
        this.emit('retrying', job, error);
        logger.warn(`Job retrying:`, { 
          jobId: job.id, 
          attempt: job.attempts, 
          delay,
          error: errorMessage 
        });
      } else {
        job.status = JobStatus.FAILED;
        job.failedAt = new Date();
        job.error = errorMessage;
        
        this.emit('failed', job, error);
        logger.error(`Job failed:`, { jobId: job.id, error: errorMessage });
      }
    } finally {
      this.activeCount--;
      this.processNext();
    }
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): Job<T> | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs with a specific status
   */
  getJobsByStatus(status: JobStatus): Job<T>[] {
    return Array.from(this.jobs.values()).filter((job) => job.status === status);
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    name: string;
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  } {
    const jobs = Array.from(this.jobs.values());
    return {
      name: this.name,
      waiting: jobs.filter((j) => j.status === JobStatus.WAITING).length,
      active: jobs.filter((j) => j.status === JobStatus.ACTIVE).length,
      completed: jobs.filter((j) => j.status === JobStatus.COMPLETED).length,
      failed: jobs.filter((j) => j.status === JobStatus.FAILED).length,
      delayed: jobs.filter((j) => j.status === JobStatus.DELAYED).length,
    };
  }

  /**
   * Pause the queue
   */
  pause(): void {
    this.isProcessing = false;
    this.emit('paused');
  }

  /**
   * Resume the queue
   */
  resume(): void {
    this.isProcessing = true;
    this.processNext();
    this.emit('resumed');
  }

  /**
   * Clean completed/failed jobs
   */
  clean(status: JobStatus.COMPLETED | JobStatus.FAILED, olderThan?: number): number {
    const cutoff = olderThan ? Date.now() - olderThan : 0;
    let removed = 0;

    for (const [id, job] of this.jobs.entries()) {
      if (job.status === status) {
        const timestamp = status === JobStatus.COMPLETED 
          ? job.completedAt?.getTime() 
          : job.failedAt?.getTime();
        
        if (!timestamp || timestamp < cutoff) {
          this.jobs.delete(id);
          removed++;
        }
      }
    }

    return removed;
  }
}

/**
 * Queue Service
 * 
 * @description Manages multiple queues for different job types.
 */
export class QueueService {
  private queues: Map<string, Queue> = new Map();

  /**
   * Get or create a queue
   */
  getQueue<T = unknown>(name: string, options?: { concurrency?: number }): Queue<T> {
    if (!this.queues.has(name)) {
      const queue = new Queue<T>(name, options);
      this.queues.set(name, queue as Queue);
      logger.info(`Queue created: ${name}`);
    }
    return this.queues.get(name) as Queue<T>;
  }

  /**
   * Add a job to a named queue
   */
  async addJob<T>(
    queueName: string,
    data: T,
    options?: JobOptions
  ): Promise<Job<T>> {
    const queue = this.getQueue<T>(queueName);
    return queue.add(data, options);
  }

  /**
   * Register a processor for a queue
   */
  registerProcessor<T>(queueName: string, handler: JobHandler<T>): void {
    const queue = this.getQueue<T>(queueName);
    queue.process(handler);
    logger.info(`Processor registered for queue: ${queueName}`);
  }

  /**
   * Get statistics for all queues
   */
  getAllStats(): Record<string, ReturnType<Queue['getStats']>> {
    const stats: Record<string, ReturnType<Queue['getStats']>> = {};
    for (const [name, queue] of this.queues.entries()) {
      stats[name] = queue.getStats();
    }
    return stats;
  }

  /**
   * Initialize common queues and their processors
   */
  initializeQueues(): void {
    // Email queue
    this.registerProcessor('email', async (job) => {
      const { type, to, data } = job.data as { type: string; to: string; data: unknown };
      logger.info(`Processing email job: ${type} to ${to}`);
      // In production, call emailService here
      return { sent: true };
    });

    // Order processing queue
    this.registerProcessor('orders', async (job) => {
      const { orderId, action } = job.data as { orderId: string; action: string };
      logger.info(`Processing order job: ${action} for order ${orderId}`);
      // Process order action
      return { processed: true };
    });

    // Analytics queue
    this.registerProcessor('analytics', async (job) => {
      const event = job.data as { type: string; data: unknown };
      logger.info(`Processing analytics event: ${event.type}`);
      // Send to analytics service
      return { tracked: true };
    });

    // Cleanup queue (for scheduled tasks)
    this.registerProcessor('cleanup', async (job) => {
      logger.info('Running cleanup job');
      // Perform cleanup tasks
      return { cleaned: true };
    });

    logger.info('Queue processors initialized');
  }
}

// Export singleton instance
export const queueService = new QueueService();

export default queueService;

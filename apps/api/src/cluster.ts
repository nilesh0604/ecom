/**
 * Cluster Module Implementation
 * 
 * @description Enables multi-core utilization by forking worker processes.
 * Each worker runs its own instance of the Express server, and the master
 * process handles load balancing using round-robin (default on most platforms).
 * 
 * Interview Discussion Points:
 * - Node.js is single-threaded, cluster enables multi-core usage
 * - Master process manages workers, doesn't handle requests
 * - Workers share the same port via IPC
 * - Graceful restart on worker crash
 * - Sticky sessions for stateful connections (WebSockets)
 * 
 * @example
 * ```bash
 * # Start in cluster mode
 * NODE_ENV=production node dist/cluster.js
 * 
 * # Or with ts-node for development
 * npx ts-node src/cluster.ts
 * ```
 * 
 * @module cluster
 * @category Performance
 */

import cluster from 'cluster';
import os from 'os';
import { logger } from './utils/logger';

// Get number of CPU cores (or use environment variable)
const numCPUs = parseInt(process.env.CLUSTER_WORKERS || '', 10) || os.cpus().length;

// Minimum and maximum workers
const MIN_WORKERS = 2;
const MAX_WORKERS = Math.min(numCPUs, 8); // Cap at 8 to prevent resource exhaustion

/**
 * Start the application in cluster mode
 * 
 * @description The master process forks worker processes equal to the number
 * of CPU cores. Each worker runs the Express server independently.
 * The OS load balancer distributes incoming connections.
 */
export function startCluster(): void {
  if (cluster.isPrimary) {
    // Master process
    const workerCount = Math.max(MIN_WORKERS, Math.min(numCPUs, MAX_WORKERS));
    
    logger.info(`🚀 Master process ${process.pid} is running`);
    logger.info(`📊 CPU cores available: ${numCPUs}`);
    logger.info(`👷 Starting ${workerCount} workers...`);

    // Track worker states
    const workerStates = new Map<number, { startTime: Date; restarts: number }>();

    // Fork workers
    for (let i = 0; i < workerCount; i++) {
      const worker = cluster.fork();
      workerStates.set(worker.id, { startTime: new Date(), restarts: 0 });
    }

    // Handle worker exit
    cluster.on('exit', (worker, code, signal) => {
      const state = workerStates.get(worker.id);
      const uptime = state ? Date.now() - state.startTime.getTime() : 0;
      
      logger.warn(`💀 Worker ${worker.process.pid} died`, {
        code,
        signal,
        uptime: `${Math.round(uptime / 1000)}s`,
      });

      // Check for rapid restarts (crash loop detection)
      if (state && uptime < 5000 && state.restarts > 3) {
        logger.error(`🔄 Worker ${worker.id} is in a crash loop, not restarting`);
        return;
      }

      // Respawn worker
      logger.info('🔄 Starting a new worker...');
      const newWorker = cluster.fork();
      workerStates.set(newWorker.id, {
        startTime: new Date(),
        restarts: (state?.restarts || 0) + 1,
      });
      workerStates.delete(worker.id);
    });

    // Handle worker online
    cluster.on('online', (worker) => {
      logger.info(`✅ Worker ${worker.process.pid} is online`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);
      
      // Disconnect all workers
      for (const id in cluster.workers) {
        const worker = cluster.workers[id];
        if (worker) {
          worker.send('shutdown');
          worker.disconnect();
        }
      }

      // Wait for workers to exit (max 30 seconds)
      const timeout = setTimeout(() => {
        logger.warn('Forcing shutdown after timeout');
        process.exit(1);
      }, 30000);

      // Check if all workers have exited
      const checkWorkers = setInterval(() => {
        const activeWorkers = Object.keys(cluster.workers || {}).length;
        if (activeWorkers === 0) {
          clearInterval(checkWorkers);
          clearTimeout(timeout);
          logger.info('All workers have exited. Master shutting down.');
          process.exit(0);
        }
      }, 1000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Inter-process communication
    cluster.on('message', (worker, message) => {
      // Broadcast message to all workers (e.g., cache invalidation)
      if (message.type === 'broadcast') {
        for (const id in cluster.workers) {
          cluster.workers[id]?.send(message);
        }
      }
    });

  } else {
    // Worker process - start the Express app
    logger.info(`👷 Worker ${process.pid} starting...`);
    
    // Import and start the app
    import('./app').catch((error) => {
      logger.error('Failed to start worker:', error);
      process.exit(1);
    });

    // Handle shutdown message from master
    process.on('message', (message: any) => {
      if (message === 'shutdown') {
        logger.info(`Worker ${process.pid} received shutdown signal`);
        // The app.ts handles graceful shutdown via SIGTERM
      }
    });
  }
}

/**
 * Get cluster status information
 * 
 * @description Returns information about the cluster including
 * master PID, worker count, and individual worker status.
 */
export function getClusterStatus(): {
  isClustered: boolean;
  isMaster: boolean;
  workerId: number | undefined;
  workerPid: number;
  totalWorkers: number;
  workers: Array<{ id: number; pid: number | undefined }>;
} {
  const workers = cluster.isPrimary
    ? Object.entries(cluster.workers || {}).map(([id, worker]) => ({
        id: parseInt(id),
        pid: worker?.process.pid,
      }))
    : [];

  return {
    isClustered: cluster.isPrimary || cluster.isWorker,
    isMaster: cluster.isPrimary,
    workerId: cluster.isWorker ? cluster.worker?.id : undefined,
    workerPid: process.pid,
    totalWorkers: workers.length,
    workers,
  };
}

// Start cluster if this file is run directly
if (require.main === module) {
  startCluster();
}

export default startCluster;

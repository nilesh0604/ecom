/**
 * Stream Service
 * 
 * @description Implements Node.js Streams for efficient data processing.
 * Streams allow processing data in chunks without loading entire files
 * into memory - essential for large file handling.
 * 
 * Interview Discussion Points:
 * - Types: Readable, Writable, Duplex, Transform
 * - Backpressure: What happens when consumer is slower than producer
 * - Piping: pipe() vs pipeline() (async-friendly)
 * - Modes: Flowing vs Paused
 * - Object mode: Stream objects instead of buffers
 * - Memory efficiency: Process GB files with MB memory
 * 
 * @example
 * ```typescript
 * // Export large dataset as CSV stream
 * const csvStream = streamService.createCsvExportStream(products);
 * csvStream.pipe(res);
 * 
 * // Process uploaded file in chunks
 * await streamService.processLargeFile(filePath, (chunk) => {
 *   // Process each chunk
 * });
 * ```
 * 
 * @module streams
 * @category Performance
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
    PassThrough,
    Readable,
    Transform,
    Writable,
    pipeline,
} from 'stream';
import { promisify } from 'util';
import zlib from 'zlib';
import { logger } from '../utils/logger';

// Promisified pipeline for async/await usage
const pipelineAsync = promisify(pipeline);

/**
 * JSON to CSV Transform Stream
 * 
 * @description Transforms JSON objects to CSV format in streaming fashion.
 * Demonstrates Transform stream implementation.
 */
export class JsonToCsvTransform extends Transform {
  private headers: string[] | null = null;
  private isFirstChunk = true;

  constructor(options?: { headers?: string[] }) {
    super({ objectMode: true });
    if (options?.headers) {
      this.headers = options.headers;
    }
  }

  _transform(
    chunk: Record<string, unknown>,
    encoding: BufferEncoding,
    callback: (error?: Error | null, data?: string) => void
  ): void {
    try {
      // Extract headers from first object if not provided
      if (!this.headers) {
        this.headers = Object.keys(chunk);
      }

      // Write headers on first chunk
      if (this.isFirstChunk) {
        this.push(this.headers.join(',') + '\n');
        this.isFirstChunk = false;
      }

      // Convert object to CSV row
      const values = this.headers.map((header) => {
        const value = chunk[header];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      });

      this.push(values.join(',') + '\n');
      callback();
    } catch (error) {
      callback(error as Error);
    }
  }
}

/**
 * Line-by-line Transform Stream
 * 
 * @description Splits incoming data into lines. Useful for
 * processing log files or CSV files line by line.
 */
export class LineTransform extends Transform {
  private buffer = '';

  constructor() {
    super({ encoding: 'utf8' });
  }

  _transform(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');
    
    // Keep the last incomplete line in buffer
    this.buffer = lines.pop() || '';
    
    // Push complete lines
    for (const line of lines) {
      if (line.trim()) {
        this.push(line + '\n');
      }
    }
    
    callback();
  }

  _flush(callback: (error?: Error | null) => void): void {
    // Push any remaining data
    if (this.buffer.trim()) {
      this.push(this.buffer);
    }
    callback();
  }
}

/**
 * Progress Transform Stream
 * 
 * @description Tracks progress of data flowing through stream.
 * Useful for large file uploads/downloads.
 */
export class ProgressTransform extends Transform {
  private bytesProcessed = 0;
  private totalBytes: number;
  private lastReportedProgress = 0;
  private onProgress?: (progress: number, bytes: number) => void;

  constructor(options: {
    totalBytes: number;
    onProgress?: (progress: number, bytes: number) => void;
  }) {
    super();
    this.totalBytes = options.totalBytes;
    this.onProgress = options.onProgress;
  }

  _transform(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: (error?: Error | null, data?: Buffer) => void
  ): void {
    this.bytesProcessed += chunk.length;
    
    const progress = Math.round((this.bytesProcessed / this.totalBytes) * 100);
    
    // Report progress every 5%
    if (progress - this.lastReportedProgress >= 5) {
      this.lastReportedProgress = progress;
      this.onProgress?.(progress, this.bytesProcessed);
    }
    
    callback(null, chunk);
  }

  getProgress(): { bytes: number; percent: number } {
    return {
      bytes: this.bytesProcessed,
      percent: Math.round((this.bytesProcessed / this.totalBytes) * 100),
    };
  }
}

/**
 * Stream Service
 * 
 * @description High-level API for common streaming operations.
 */
export class StreamService {
  /**
   * Create a readable stream from an array of objects
   */
  createReadableFromArray<T>(data: T[]): Readable {
    let index = 0;
    
    return new Readable({
      objectMode: true,
      read() {
        if (index < data.length) {
          this.push(data[index++]);
        } else {
          this.push(null); // Signal end of stream
        }
      },
    });
  }

  /**
   * Create a CSV export stream from data
   */
  createCsvExportStream<T extends Record<string, unknown>>(
    data: T[],
    headers?: string[]
  ): Readable {
    const readable = this.createReadableFromArray(data);
    const transform = new JsonToCsvTransform({ headers });
    
    return readable.pipe(transform);
  }

  /**
   * Stream a large file and process chunks
   */
  async processLargeFile(
    filePath: string,
    processor: (chunk: Buffer) => Promise<void> | void
  ): Promise<void> {
    const readable = fs.createReadStream(filePath, {
      highWaterMark: 64 * 1024, // 64KB chunks
    });

    const writable = new Writable({
      async write(chunk, encoding, callback) {
        try {
          await processor(chunk);
          callback();
        } catch (error) {
          callback(error as Error);
        }
      },
    });

    await pipelineAsync(readable, writable);
  }

  /**
   * Stream file with compression
   */
  async compressFile(inputPath: string, outputPath: string): Promise<void> {
    const readable = fs.createReadStream(inputPath);
    const gzip = zlib.createGzip();
    const writable = fs.createWriteStream(outputPath);

    await pipelineAsync(readable, gzip, writable);
    logger.info(`Compressed ${inputPath} to ${outputPath}`);
  }

  /**
   * Stream file with decompression
   */
  async decompressFile(inputPath: string, outputPath: string): Promise<void> {
    const readable = fs.createReadStream(inputPath);
    const gunzip = zlib.createGunzip();
    const writable = fs.createWriteStream(outputPath);

    await pipelineAsync(readable, gunzip, writable);
    logger.info(`Decompressed ${inputPath} to ${outputPath}`);
  }

  /**
   * Calculate file hash using streams (memory efficient)
   */
  async calculateFileHash(
    filePath: string,
    algorithm: string = 'sha256'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(algorithm);
      const stream = fs.createReadStream(filePath);

      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Copy file with progress tracking
   */
  async copyFileWithProgress(
    source: string,
    destination: string,
    onProgress?: (progress: number, bytes: number) => void
  ): Promise<void> {
    const stats = await fs.promises.stat(source);
    const readable = fs.createReadStream(source);
    const progress = new ProgressTransform({
      totalBytes: stats.size,
      onProgress,
    });
    const writable = fs.createWriteStream(destination);

    await pipelineAsync(readable, progress, writable);
  }

  /**
   * Merge multiple files into one
   */
  async mergeFiles(inputPaths: string[], outputPath: string): Promise<void> {
    const writable = fs.createWriteStream(outputPath);

    for (const inputPath of inputPaths) {
      const readable = fs.createReadStream(inputPath);
      await pipelineAsync(readable, writable, { end: false });
    }

    writable.end();
    logger.info(`Merged ${inputPaths.length} files into ${outputPath}`);
  }

  /**
   * Stream JSON array from file (for large JSON arrays)
   */
  createJsonArrayStream(filePath: string): Readable {
    const readable = fs.createReadStream(filePath, { encoding: 'utf8' });
    let buffer = '';
    let inArray = false;
    let depth = 0;
    let objectStart = -1;

    const transform = new Transform({
      objectMode: true,
      transform(chunk: string, encoding, callback) {
        buffer += chunk;

        while (buffer.length > 0) {
          if (!inArray) {
            // Look for array start
            const arrayStart = buffer.indexOf('[');
            if (arrayStart === -1) {
              buffer = '';
              break;
            }
            buffer = buffer.slice(arrayStart + 1);
            inArray = true;
          }

          // Parse objects from the array
          for (let i = 0; i < buffer.length; i++) {
            const char = buffer[i];
            
            if (char === '{') {
              if (depth === 0) objectStart = i;
              depth++;
            } else if (char === '}') {
              depth--;
              if (depth === 0 && objectStart !== -1) {
                const objectStr = buffer.slice(objectStart, i + 1);
                try {
                  const obj = JSON.parse(objectStr);
                  this.push(obj);
                } catch (e) {
                  // Invalid JSON, skip
                }
                buffer = buffer.slice(i + 1);
                objectStart = -1;
                break;
              }
            } else if (char === ']' && depth === 0) {
              inArray = false;
              buffer = buffer.slice(i + 1);
              break;
            }
          }

          if (objectStart !== -1) break; // Incomplete object, wait for more data
        }

        callback();
      },
    });

    return readable.pipe(transform);
  }

  /**
   * Create a passthrough stream for logging/debugging
   */
  createLoggingStream(label: string): PassThrough {
    let totalBytes = 0;
    
    const passThrough = new PassThrough();
    
    passThrough.on('data', (chunk) => {
      totalBytes += chunk.length;
    });
    
    passThrough.on('end', () => {
      logger.debug(`[${label}] Stream ended. Total bytes: ${totalBytes}`);
    });
    
    return passThrough;
  }
}

// Export singleton instance
export const streamService = new StreamService();

export default streamService;

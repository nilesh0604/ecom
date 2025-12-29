/**
 * Worker Thread Implementation
 * 
 * @description This file runs inside a worker thread and handles
 * CPU-intensive tasks. It receives messages from the main thread,
 * processes them, and sends back results.
 * 
 * Interview Discussion Points:
 * - Worker threads have their own V8 instance and event loop
 * - Communication via message passing (postMessage)
 * - Can share memory using SharedArrayBuffer
 * - Useful for: parsing, compression, crypto, image processing
 * 
 * @module worker.thread
 * @category Performance
 */

import crypto from 'crypto';
import { parentPort } from 'worker_threads';

interface WorkerTask {
  id: string;
  type: string;
  data: unknown;
}

interface WorkerResult {
  id: string;
  success: boolean;
  result?: unknown;
  error?: string;
}

// Ensure we're in a worker thread
if (!parentPort) {
  throw new Error('This file must be run as a worker thread');
}

/**
 * Heavy computation handler
 * Simulates CPU-intensive work like sorting large arrays
 */
function heavyComputation(data: unknown[]): unknown[] {
  // Deep clone to avoid mutation
  const arr = JSON.parse(JSON.stringify(data));
  
  // Example: Sort large array (CPU intensive)
  if (Array.isArray(arr)) {
    return arr.sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      }
      return String(a).localeCompare(String(b));
    });
  }
  
  return arr;
}

/**
 * Parse CSV data
 */
function parseCsv(csvData: string): Record<string, string>[] {
  const lines = csvData.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    results.push(row);
  }

  return results;
}

/**
 * Parse JSON data (for very large JSON)
 */
function parseJson(jsonData: string): unknown {
  return JSON.parse(jsonData);
}

/**
 * Transform data with a serialized function
 */
function transformData(params: { data: unknown[]; transformFn: string }): unknown[] {
  const { data, transformFn } = params;
  
  // Create function from string (be careful with untrusted input!)
  // In production, use predefined transform functions instead
  const fn = new Function('item', `return ${transformFn}`);
  
  return data.map((item) => fn(item));
}

/**
 * Hash data using crypto
 */
function hashData(params: { data: string | Buffer; algorithm: string }): string {
  const { data, algorithm } = params;
  return crypto.createHash(algorithm).update(data).digest('hex');
}

/**
 * Image processing placeholder
 * In production, use sharp or other image libraries
 */
function imageProcessing(params: { buffer: Buffer; width?: number; height?: number }): Buffer {
  // Placeholder - in production use sharp:
  // const sharp = require('sharp');
  // return sharp(params.buffer).resize(params.width, params.height).toBuffer();
  return params.buffer;
}

/**
 * Encryption handler
 */
function encryption(params: { data: string; key: string; algorithm?: string }): string {
  const { data, key, algorithm = 'aes-256-cbc' } = params;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key.padEnd(32, '0').slice(0, 32)), iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Task router - handles incoming tasks
 */
function handleTask(task: WorkerTask): WorkerResult {
  try {
    let result: unknown;

    switch (task.type) {
      case 'heavyComputation':
        result = heavyComputation(task.data as unknown[]);
        break;
      case 'csvParsing':
        result = parseCsv(task.data as string);
        break;
      case 'jsonParsing':
        result = parseJson(task.data as string);
        break;
      case 'dataTransformation':
        result = transformData(task.data as { data: unknown[]; transformFn: string });
        break;
      case 'hashing':
        result = hashData(task.data as { data: string | Buffer; algorithm: string });
        break;
      case 'imageProcessing':
        result = imageProcessing(task.data as { buffer: Buffer; width?: number; height?: number });
        break;
      case 'encryption':
        result = encryption(task.data as { data: string; key: string; algorithm?: string });
        break;
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }

    return {
      id: task.id,
      success: true,
      result,
    };
  } catch (error) {
    return {
      id: task.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Listen for messages from the main thread
parentPort.on('message', (task: WorkerTask) => {
  const result = handleTask(task);
  parentPort!.postMessage(result);
});

// Signal that worker is ready
parentPort.postMessage({ type: 'ready' });

import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Response {
      locals: {
        requestId?: string;
        startTime?: number;
        [key: string]: any;
      };
    }
  }
}

/**
 * Request ID Middleware
 * Attaches a unique request ID to each request for tracing
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Use existing request ID from header or generate new one
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  
  // Store request start time for response time calculation
  res.locals.requestId = requestId;
  res.locals.startTime = Date.now();
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

/**
 * Response Time Middleware
 * Adds response time header to responses
 */
export const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Hook into response finish event
  res.on('finish', () => {
    if (res.locals.startTime) {
      const duration = Date.now() - res.locals.startTime;
      // Log could be added here if needed
    }
  });
  
  next();
};

export default requestIdMiddleware;

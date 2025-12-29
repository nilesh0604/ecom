import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import config from '../config';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';

/**
 * Global error handler middleware
 * 
 * @description Catches all errors thrown in the application and returns
 * appropriate HTTP responses. Handles:
 * - Custom AppError instances with proper status codes
 * - Prisma database errors (unique constraint, not found, etc.)
 * - JWT authentication errors
 * - JSON parsing errors
 * - Generic unhandled errors (500)
 * 
 * In development mode, includes additional error details in response.
 * All errors are logged with context (path, method, user ID).
 * 
 * @example
 * ```typescript
 * // Applied as last middleware in Express app
 * app.use(errorHandler);
 * 
 * // Errors thrown in routes are caught automatically
 * router.get('/resource', async (req, res, next) => {
 *   throw new NotFoundError('Resource');
 * });
 * ```
 * 
 * @middleware
 * @category Middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  // Handle known errors
  if (err instanceof AppError) {
    ApiResponse.error(
      res,
      err.statusCode,
      err.message,
      err.code,
      config.isDevelopment ? err.details : undefined
    );
    return;
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(err, res);
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    ApiResponse.badRequest(res, 'Invalid data provided');
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    ApiResponse.unauthorized(res, 'Invalid token');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    ApiResponse.unauthorized(res, 'Token expired');
    return;
  }

  // Handle syntax errors (malformed JSON)
  if (err instanceof SyntaxError && 'body' in err) {
    ApiResponse.badRequest(res, 'Invalid JSON format');
    return;
  }

  // Default to 500 internal server error
  ApiResponse.internalError(
    res,
    config.isDevelopment ? err.message : 'An unexpected error occurred'
  );
};

/**
 * Handle Prisma ORM specific database errors
 * 
 * @description Converts Prisma error codes to user-friendly HTTP responses:
 * - P2002: Unique constraint violation → 409 Conflict
 * - P2003: Foreign key violation → 400 Bad Request
 * - P2025: Record not found → 404 Not Found
 * - P2014: Required relation violation → 400 Bad Request
 * - Default: 400 Bad Request
 * 
 * @param error - Prisma client error
 * @param res - Express response object
 * @private
 */
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
  res: Response
): void {
  switch (error.code) {
    case 'P2002': {
      // Unique constraint violation
      const target = (error.meta?.target as string[]) || [];
      const field = target.join(', ');
      ApiResponse.conflict(res, `A record with this ${field} already exists`);
      break;
    }
    case 'P2003': {
      // Foreign key constraint violation
      ApiResponse.badRequest(res, 'Referenced record does not exist');
      break;
    }
    case 'P2025': {
      // Record not found
      ApiResponse.notFound(res, 'Record not found');
      break;
    }
    case 'P2014': {
      // Required relation violation
      ApiResponse.badRequest(res, 'Required relation is missing');
      break;
    }
    default:
      ApiResponse.internalError(res, 'Database error occurred');
  }
}

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  ApiResponse.notFound(res, `Route ${req.method} ${req.path} not found`);
};

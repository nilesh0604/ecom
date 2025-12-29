import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { ApiResponse } from '../utils/response';

/**
 * Creates a validation middleware for request body
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        ApiResponse.badRequest(res, 'Validation failed', errors);
        return;
      }
      next(error);
    }
  };
};

/**
 * Creates a validation middleware for query parameters
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        ApiResponse.badRequest(res, 'Invalid query parameters', errors);
        return;
      }
      next(error);
    }
  };
};

/**
 * Creates a validation middleware for URL parameters
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params) as typeof req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        ApiResponse.badRequest(res, 'Invalid URL parameters', errors);
        return;
      }
      next(error);
    }
  };
};

/**
 * Combined validation middleware for body, query, and params
 */
export const validate = (options: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (options.body) {
        req.body = options.body.parse(req.body);
      }
      if (options.query) {
        req.query = options.query.parse(req.query);
      }
      if (options.params) {
        req.params = options.params.parse(req.params) as typeof req.params;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        ApiResponse.badRequest(res, 'Validation failed', errors);
        return;
      }
      next(error);
    }
  };
};

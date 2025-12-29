import { Response } from 'express';

/**
 * Standard API Response Data Structure
 * 
 * @description All API responses follow this consistent structure:
 * - success: Boolean indicating request success
 * - message: Optional human-readable message
 * - data: Response payload (on success)
 * - error: Error details (on failure)
 * - meta: Pagination info (for list endpoints)
 * 
 * @typeParam T - Type of the data payload
 * @interface ApiResponseData
 * @category Types
 */
export interface ApiResponseData<T = unknown> {
  /** Whether the request was successful */
  success: boolean;
  /** Optional message for the client */
  message?: string;
  /** Response data payload */
  data?: T;
  /** Error information (present when success is false) */
  error?: {
    /** Machine-readable error code */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Additional error details (development only) */
    details?: unknown;
  };
  /** Pagination metadata for list responses */
  meta?: {
    /** Total number of items */
    total?: number;
    /** Number of items skipped */
    skip?: number;
    /** Page size */
    limit?: number;
    /** Current page number (1-indexed) */
    page?: number;
    /** Total number of pages */
    totalPages?: number;
  };
}

/**
 * Standardized API Response Utility Class
 * 
 * @description Provides static methods for consistent API responses.
 * All endpoints should use these methods rather than raw res.json().
 * 
 * @example
 * ```typescript
 * // Success response
 * ApiResponse.success(res, { user }, 'User retrieved');
 * 
 * // Created response
 * ApiResponse.created(res, { product }, 'Product created');
 * 
 * // Paginated response
 * ApiResponse.paginated(res, products, total, skip, limit);
 * 
 * // Error responses
 * ApiResponse.badRequest(res, 'Invalid email format');
 * ApiResponse.notFound(res, 'Product not found');
 * ```
 * 
 * @class ApiResponse
 * @category Utilities
 */
export class ApiResponse {
  /**
   * Send a success response (200 OK by default)
   * 
   * @param res - Express response object
   * @param data - Response payload
   * @param message - Optional success message
   * @param statusCode - HTTP status code (default: 200)
   * @returns Express response
   */
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200
  ): Response {
    const response: ApiResponseData<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send a created response (201 Created)
   * 
   * @param res - Express response object
   * @param data - Created resource data
   * @param message - Optional success message
   * @returns Express response
   */
  static created<T>(res: Response, data?: T, message?: string): Response {
    return this.success(res, data, message || 'Created successfully', 201);
  }

  /**
   * Send a no content response (204 No Content)
   * 
   * @description Used for successful operations that don't return data (e.g., DELETE)
   * @param res - Express response object
   * @returns Express response with no body
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send a paginated list response with metadata
   * 
   * @description Automatically calculates page and totalPages from skip/limit
   * @param res - Express response object
   * @param data - Array of items for current page
   * @param total - Total count of items across all pages
   * @param skip - Number of items skipped (offset)
   * @param limit - Page size
   * @param message - Optional success message
   * @returns Express response with pagination metadata
   */
  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    skip: number,
    limit: number,
    message?: string
  ): Response {
    const page = Math.floor(skip / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponseData<T[]> = {
      success: true,
      message,
      data,
      meta: {
        total,
        skip,
        limit,
        page,
        totalPages,
      },
    };
    return res.status(200).json(response);
  }

  /**
   * Send a generic error response
   * 
   * @param res - Express response object
   * @param statusCode - HTTP status code
   * @param message - Error message
   * @param code - Machine-readable error code
   * @param details - Additional error details (dev only)
   * @returns Express response
   */
  static error(
    res: Response,
    statusCode: number,
    message: string,
    code: string = 'ERROR',
    details?: unknown
  ): Response {
    const response: ApiResponseData = {
      success: false,
      error: {
        code,
        message,
        details,
      },
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Bad request (400)
   */
  static badRequest(res: Response, message: string, details?: unknown): Response {
    return this.error(res, 400, message, 'BAD_REQUEST', details);
  }

  /**
   * Unauthorized (401)
   */
  static unauthorized(res: Response, message: string = 'Authentication required'): Response {
    return this.error(res, 401, message, 'UNAUTHORIZED');
  }

  /**
   * Forbidden (403)
   */
  static forbidden(res: Response, message: string = 'Insufficient permissions'): Response {
    return this.error(res, 403, message, 'FORBIDDEN');
  }

  /**
   * Not found (404)
   */
  static notFound(res: Response, message: string = 'Resource not found'): Response {
    return this.error(res, 404, message, 'NOT_FOUND');
  }

  /**
   * Conflict (409)
   */
  static conflict(res: Response, message: string): Response {
    return this.error(res, 409, message, 'CONFLICT');
  }

  /**
   * Unprocessable entity (422)
   */
  static unprocessable(res: Response, message: string, details?: unknown): Response {
    return this.error(res, 422, message, 'UNPROCESSABLE_ENTITY', details);
  }

  /**
   * Too many requests (429)
   */
  static tooManyRequests(res: Response, message: string = 'Too many requests'): Response {
    return this.error(res, 429, message, 'TOO_MANY_REQUESTS');
  }

  /**
   * Internal server error (500)
   */
  static internalError(
    res: Response,
    message: string = 'Internal server error'
  ): Response {
    return this.error(res, 500, message, 'INTERNAL_ERROR');
  }
}

export default ApiResponse;

/**
 * Custom Application Error Classes
 * 
 * @description Provides a hierarchy of error classes for consistent error handling
 * throughout the application. All errors extend AppError and include:
 * - HTTP status code
 * - Error code for client-side handling
 * - Operational flag (distinguishes expected vs unexpected errors)
 * - Optional details object for additional context
 * 
 * @example
 * ```typescript
 * // Throw a not found error
 * throw new NotFoundError('Product');
 * // Results in: { statusCode: 404, message: 'Product not found', code: 'NOT_FOUND' }
 * 
 * // Throw a validation error with details
 * throw new ValidationError('Invalid input', { fields: ['email', 'password'] });
 * ```
 * 
 * @module utils/errors
 * @category Utilities
 */

/**
 * Base application error class
 * 
 * @description All custom errors should extend this class. Provides consistent
 * error structure for the error handler middleware.
 * 
 * @example
 * ```typescript
 * throw new AppError('Custom error message', 400, 'CUSTOM_ERROR');
 * ```
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);

    // Set prototype explicitly for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation error (400 Bad Request)
 * 
 * @description Thrown when request data fails validation.
 * Include details about which fields failed validation.
 * 
 * @example
 * ```typescript
 * throw new ValidationError('Invalid input', {
 *   fields: { email: 'Invalid email format', password: 'Too short' }
 * });
 * ```
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
  }
}

/**
 * Authentication error (401 Unauthorized)
 * 
 * @description Thrown when user is not authenticated or token is invalid.
 * 
 * @example
 * ```typescript
 * throw new AuthenticationError('Token expired');
 * ```
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Authorization error (403 Forbidden)
 * 
 * @description Thrown when authenticated user lacks required permissions.
 * 
 * @example
 * ```typescript
 * throw new AuthorizationError('Admin access required');
 * ```
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Not found error (404 Not Found)
 * 
 * @description Thrown when a requested resource doesn't exist.
 * 
 * @example
 * ```typescript
 * throw new NotFoundError('Product');
 * // Message: "Product not found"
 * ```
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/**
 * Conflict error (409 Conflict)
 * 
 * @description Thrown when operation conflicts with existing data
 * (e.g., duplicate email, already reviewed).
 * 
 * @example
 * ```typescript
 * throw new ConflictError('Email already registered');
 * ```
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Rate limit error (429 Too Many Requests)
 * 
 * @description Thrown when user exceeds API rate limits.
 * 
 * @example
 * ```typescript
 * throw new RateLimitError('Too many login attempts, try again later');
 * ```
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * Database error (500 Internal Server Error)
 * 
 * @description Thrown for unexpected database errors. Marked as non-operational
 * to indicate a serious issue requiring investigation.
 * 
 * @example
 * ```typescript
 * throw new DatabaseError('Connection pool exhausted');
 * ```
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database error occurred') {
    super(message, 500, 'DATABASE_ERROR', false);
  }
}

/**
 * External service error (503 or 500)
 * 
 * @description Thrown when an external service (Stripe, S3, email) fails.
 * 
 * @example
 * ```typescript
 * throw new ExternalServiceError('Stripe', 'Payment processing unavailable');
 * ```
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `External service error: ${service}`,
      502,
      'EXTERNAL_SERVICE_ERROR',
      false
    );
  }
}

export default AppError;

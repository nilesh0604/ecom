import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { prisma } from '../config/database';
import { AuthRequest, TokenPayload } from '../types';
import { ApiResponse } from '../utils/response';

// Re-export AuthRequest for convenience
export type { AuthRequest } from '../types';

/**
 * Authentication middleware - requires valid JWT
 * 
 * @description Validates JWT token from Authorization header and attaches
 * user info to the request object. Returns 401 if:
 * - No token provided
 * - Token is invalid or expired
 * - User doesn't exist or is deactivated
 * 
 * @example
 * ```typescript
 * // Apply to routes that require authentication
 * router.get('/profile', authenticate, profileController);
 * 
 * // Access user in controller
 * const userId = req.user.id;
 * ```
 * 
 * @middleware
 * @category Middleware
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ApiResponse.unauthorized(res, 'Authentication required');
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    const decoded = jwt.verify(token, config.jwt.secret) as unknown as TokenPayload;

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      ApiResponse.unauthorized(res, 'User not found');
      return;
    }

    if (!user.isActive) {
      ApiResponse.unauthorized(res, 'Account is deactivated');
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      ApiResponse.unauthorized(res, 'Token expired');
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      ApiResponse.unauthorized(res, 'Invalid token');
      return;
    }
    next(error);
  }
};

/**
 * Authorization middleware factory - requires specific user roles
 * 
 * @description Creates middleware that checks if the authenticated user
 * has one of the specified roles. Must be used after `authenticate`.
 * Returns 403 if user lacks required role.
 * 
 * @param roles - Array of role names that are allowed access
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * // Admin only route
 * router.delete('/users/:id', authenticate, authorize('ADMIN'), deleteUser);
 * 
 * // Admin or moderator
 * router.put('/posts/:id', authenticate, authorize('ADMIN', 'MODERATOR'), updatePost);
 * ```
 * 
 * @middleware
 * @category Middleware
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.unauthorized(res, 'Authentication required');
      return;
    }

    if (!roles.includes(req.user.role)) {
      ApiResponse.forbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * 
 * @description Attempts to authenticate user from JWT if present, but
 * allows request to continue even without valid token. Useful for
 * endpoints that behave differently for authenticated vs guest users.
 * 
 * @example
 * ```typescript
 * // Cart endpoint that works for both guests and logged-in users
 * router.get('/cart', optionalAuth, getCart);
 * 
 * // In controller: check if user is authenticated
 * if (req.user) {
 *   // Return user's cart
 * } else {
 *   // Return session cart
 * }
 * ```
 * 
 * @middleware
 * @category Middleware
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, config.jwt.secret) as unknown as TokenPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, role: true, isActive: true },
      });

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    }
  } catch {
    // Ignore errors for optional auth
  }

  next();
};

/**
 * Admin only middleware
 */
export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    ApiResponse.unauthorized(res, 'Authentication required');
    return;
  }

  if (req.user.role !== 'ADMIN') {
    ApiResponse.forbidden(res, 'Admin access required');
    return;
  }

  next();
};

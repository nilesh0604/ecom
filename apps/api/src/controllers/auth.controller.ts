import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest, CreateUserDto, LoginDto } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const userData: CreateUserDto = req.body;
  const result = await authService.register(userData);

  ApiResponse.created(res, result, 'User registered successfully');
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const credentials: LoginDto = req.body;
  const result = await authService.login(credentials);

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  ApiResponse.success(
    res,
    {
      user: result.user,
      token: result.token,
      expiresAt: result.expiresAt,
    },
    'Login successful'
  );
});

/**
 * Validate token
 * GET /api/v1/auth/validate
 */
export const validate = asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return ApiResponse.unauthorized(res, 'No token provided');
  }

  const user = await authService.validateToken(token);

  if (!user) {
    return ApiResponse.unauthorized(res, 'Invalid token');
  }

  ApiResponse.success(
    res,
    {
      isValid: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    },
    'Token is valid'
  );
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return ApiResponse.unauthorized(res, 'No refresh token provided');
  }

  const result = await authService.refreshToken(refreshToken);

  ApiResponse.success(res, result, 'Token refreshed successfully');
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  ApiResponse.success(res, null, 'Logged out successfully');
});

/**
 * Logout from all devices
 * POST /api/v1/auth/logout-all
 */
export const logoutAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  await authService.logoutAll(req.user!.id);

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  ApiResponse.success(res, null, 'Logged out from all devices');
});

/**
 * Request password reset
 * POST /api/v1/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  await authService.forgotPassword(email);

  // Always return success to prevent user enumeration
  ApiResponse.success(res, null, 'If the email exists, a reset link has been sent');
});

/**
 * Reset password with token
 * POST /api/v1/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  await authService.resetPassword(token, newPassword);

  ApiResponse.success(res, null, 'Password reset successfully');
});

/**
 * Change password (authenticated)
 * POST /api/v1/auth/change-password
 */
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(req.user!.id, currentPassword, newPassword);

  ApiResponse.success(res, null, 'Password changed successfully');
});

/**
 * Get current user
 * GET /api/v1/auth/me
 */
export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await authService.validateToken(
    req.headers.authorization?.replace('Bearer ', '') || ''
  );

  if (!user) {
    return ApiResponse.unauthorized(res, 'Invalid token');
  }

  ApiResponse.success(res, user);
});

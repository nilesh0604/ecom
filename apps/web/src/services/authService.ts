import type { LoginPayload, LoginResponse, User } from '@/types';
import { authClient } from '@/utils';

/**
 * Authentication Service - Handles user authentication
 * 
 * Uses authClient (separate API endpoint for auth)
 * 
 * Why separate from other services:
 * - Auth often has different base URL and security requirements
 * - Auth tokens shouldn't be sent to login/register endpoints
 * - Can be replaced with OAuth, Firebase, etc. without affecting other services
 * 
 * Usage in components:
 * import { authService } from '@/services/authService';
 * 
 * await authService.login(email, password);
 * await authService.logout();
 */

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export interface ValidateTokenResponse {
  isValid: boolean;
  user?: User;
}

export const authService = {
  /**
   * Login user with email and password
   * 
   * What happens:
   * 1. Send credentials to auth server
   * 2. Server validates and returns user + token
   * 3. Component stores token in localStorage
   * 4. Token is automatically sent in future requests via apiClient
   * 
   * @param email - User email
   * @param password - User password
   * @returns User data and authentication token
   * 
   * Example:
   * const { user, token } = await authService.login('user@example.com', 'password');
   * localStorage.setItem('authToken', token);
   */
  login: (payload: LoginPayload) =>
    authClient.post<LoginResponse>('/auth/login', payload, {
      skipAuthToken: true, // Public endpoint, no token needed
    }),

  /**
   * Register a new user account
   * 
   * @param data - Registration form data
   * @returns New user data and authentication token
   * 
   * Example:
   * const { user, token } = await authService.register({
   *   email: 'newuser@example.com',
   *   password: 'secure123',
   *   firstName: 'John',
   *   lastName: 'Doe',
   * });
   */
  register: (data: RegisterRequest) =>
    authClient.post<RegisterResponse>('/auth/register', data, {
      skipAuthToken: true, // Public endpoint, no token needed
    }),

  /**
   * Validate current authentication token
   * 
   * Purpose:
   * - Check if stored token is still valid
   * - Refresh auth state on app load
   * - Detect if user was logged out elsewhere
   * 
   * @returns Whether token is valid and current user data
   * 
   * Example:
   * const { isValid, user } = await authService.validateToken();
   * if (isValid) {
   *   // User is logged in, update app state
   * } else {
   *   // Token expired, redirect to login
   * }
   */
  validateToken: () =>
    authClient.get<ValidateTokenResponse>('/auth/validate', {
      // Uses authToken from localStorage automatically
    }),

  /**
   * Logout current user
   * 
   * What happens:
   * 1. Notify server to invalidate token
   * 2. Component removes token from localStorage
   * 3. Clear user state and redirect to login
   * 
   * Example:
   * await authService.logout();
   * localStorage.removeItem('authToken');
   * navigate('/login');
   */
  logout: () =>
    authClient.post('/auth/logout', {}, {
      // Sends token to identify which user is logging out
    }),

  /**
   * Request password reset
   * 
   * @param email - User email to send reset link
   * @returns Confirmation message
   * 
   * Example:
   * await authService.requestPasswordReset('user@example.com');
   */
  requestPasswordReset: (email: string) =>
    authClient.post<{ message: string }>('/auth/forgot-password', { email }, {
      skipAuthToken: true,
    }),

  /**
   * Reset password with token from email
   * 
   * @param token - Token from password reset email
   * @param newPassword - New password
   * @returns Success message
   * 
   * Example:
   * await authService.resetPassword('token_from_email', 'newPassword123');
   */
  resetPassword: (token: string, newPassword: string) =>
    authClient.post<{ message: string }>(
      '/auth/reset-password',
      { token, newPassword },
      { skipAuthToken: true }
    ),

  /**
   * Change password for logged-in user
   * 
   * @param currentPassword - Current password for verification
   * @param newPassword - New password to set
   * @returns Success message
   * 
   * Example:
   * await authService.changePassword('oldPassword', 'newPassword123');
   */
  changePassword: (currentPassword: string, newPassword: string) =>
    authClient.post<{ message: string }>(
      '/auth/change-password',
      { currentPassword, newPassword }
      // Uses authToken automatically
    ),

  /**
   * Refresh access token using refresh token
   * 
   * Purpose:
   * - Get a new access token when current one expires
   * - Maintain user session without re-login
   * 
   * @param refreshToken - The refresh token from initial login
   * @returns New access and refresh tokens
   * 
   * Example:
   * const refreshToken = localStorage.getItem('refreshToken');
   * const { token, refreshToken: newRefresh } = await authService.refreshToken(refreshToken);
   * localStorage.setItem('authToken', token);
   * localStorage.setItem('refreshToken', newRefresh);
   */
  refreshToken: (refreshToken: string) =>
    authClient.post<{ token: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
      { skipAuthToken: true }
    ),

  /**
   * Get current authenticated user
   * 
   * Returns the user data for the currently logged-in user.
   * Uses the auth token to identify the user.
   * 
   * @returns Current user data
   * 
   * Example:
   * const user = await authService.getCurrentUser();
   * console.log(`Logged in as: ${user.email}`);
   */
  getCurrentUser: () =>
    authClient.get<User>('/auth/me'),

  /**
   * Logout from all devices
   * 
   * Invalidates all refresh tokens for the user,
   * effectively logging them out everywhere.
   * 
   * Use case:
   * - User suspects account compromise
   * - User wants to secure their account
   * 
   * @returns Success message
   * 
   * Example:
   * await authService.logoutAll();
   * // User must re-login on all devices
   */
  logoutAll: () =>
    authClient.post<{ message: string }>('/auth/logout-all'),
};

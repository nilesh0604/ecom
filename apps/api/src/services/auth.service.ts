import { Role, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { prisma } from '../config/database';
import { CreateUserDto, LoginDto, TokenPayload } from '../types';
import { AppError, AuthenticationError, ConflictError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Authentication Service
 * 
 * @description Handles all authentication operations including:
 * - User registration and login
 * - JWT token generation and validation
 * - Refresh token management
 * - Password reset flows
 * 
 * @example
 * ```typescript
 * import { authService } from './services/auth.service';
 * 
 * // Register a new user
 * const { user, token } = await authService.register({
 *   email: 'user@example.com',
 *   password: 'securePassword123',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 * 
 * // Login
 * const { token, refreshToken } = await authService.login({
 *   email: 'user@example.com',
 *   password: 'securePassword123'
 * });
 * ```
 * 
 * @class AuthService
 * @category Services
 */
export class AuthService {
  /**
   * Register a new user
   * 
   * @description Creates a new user account with the provided credentials.
   * - Validates email uniqueness
   * - Hashes password using bcrypt
   * - Creates default user preferences
   * - Generates initial JWT access token
   * 
   * @param userData - User registration data
   * @returns Object containing user (without password) and JWT token
   * @throws {ConflictError} If email is already registered
   * 
   * @example
   * ```typescript
   * const result = await authService.register({
   *   email: 'newuser@example.com',
   *   password: 'MySecurePass123!',
   *   firstName: 'Jane',
   *   lastName: 'Smith'
   * });
   * console.log(result.token); // JWT access token
   * ```
   */
  async register(userData: CreateUserDto): Promise<{ user: Omit<User, 'password'>; token: string }> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, config.security.bcryptRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...userData,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        preferences: {
          create: {
            theme: 'light',
            notifications: true,
            emailNotifications: true,
            currency: 'USD',
            language: 'en',
          },
        },
      },
    });

    // Generate JWT
    const token = this.generateAccessToken(user.id, user.email, user.role);

    logger.info(`New user registered: ${user.email}`);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  /**
   * Authenticate user with email and password
   * 
   * @description Validates credentials and returns JWT tokens for authenticated sessions.
   * - Verifies email exists and password matches
   * - Checks account is active (not deactivated)
   * - Returns both access token (15min) and refresh token (7 days)
   * 
   * @param credentials - Login credentials (email and password)
   * @returns Object containing user, access token, refresh token, and expiration
   * @throws {AuthenticationError} If credentials are invalid
   * @throws {AppError} If account is deactivated (status 423)
   * 
   * @example
   * ```typescript
   * const { token, refreshToken, expiresAt } = await authService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   * ```
   */
  async login(credentials: LoginDto): Promise<{
    user: Omit<User, 'password'>;
    token: string;
    refreshToken: string;
    expiresAt: string;
  }> {
    const email = credentials.email.toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 423, 'ACCOUNT_LOCKED');
    }

    // Generate tokens
    const token = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);

    // Calculate expiration
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    logger.info(`User logged in: ${user.email}`);

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token, refreshToken, expiresAt };
  }

  /**
   * Validate an access token and retrieve the associated user
   * 
   * @description Verifies JWT signature and expiration, then fetches the user from database.
   * Returns null for invalid tokens or inactive users (rather than throwing).
   * 
   * @param token - JWT access token to validate
   * @returns User object (without password) if valid, null otherwise
   * 
   * @example
   * ```typescript
   * const user = await authService.validateToken(bearerToken);
   * if (user) {
   *   // Token is valid, user is authenticated
   * }
   * ```
   */
  async validateToken(token: string): Promise<Omit<User, 'password'> | null> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as unknown as TokenPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user || !user.isActive) {
        return null;
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch {
      return null;
    }
  }

  /**
   * Generate a new access token using a valid refresh token
   * 
   * @description Allows obtaining a new access token without re-authenticating.
   * The refresh token must exist in the database and not be expired.
   * 
   * @param refreshTokenValue - The refresh token string
   * @returns Object containing new access token and expiration time
   * @throws {AuthenticationError} If refresh token is invalid or expired
   * @throws {AppError} If user account is deactivated
   * 
   * @example
   * ```typescript
   * const { token, expiresAt } = await authService.refreshToken(refreshToken);
   * // Use new token for subsequent requests
   * ```
   */
  async refreshToken(refreshTokenValue: string): Promise<{ token: string; expiresAt: string }> {
    // Verify refresh token
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenValue },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    if (!storedToken.user.isActive) {
      throw new AppError('Account is deactivated', 423, 'ACCOUNT_LOCKED');
    }

    // Generate new access token
    const token = this.generateAccessToken(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role
    );

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return { token, expiresAt };
  }

  /**
   * Logout user by invalidating a specific refresh token
   * 
   * @description Removes the refresh token from the database, preventing future
   * token refreshes with that token. Access tokens remain valid until expiration.
   * 
   * @param refreshTokenValue - The refresh token to invalidate
   * @returns void
   * 
   * @example
   * ```typescript
   * await authService.logout(refreshToken);
   * // User must re-authenticate to get new tokens
   * ```
   */
  async logout(refreshTokenValue: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshTokenValue },
    });
  }

  /**
   * Logout user from all devices by invalidating all refresh tokens
   * 
   * @description Removes ALL refresh tokens for the user, effectively logging them
   * out from all devices and sessions.
   * 
   * @param userId - The user ID to logout from all devices
   * @returns void
   * 
   * @example
   * ```typescript
   * await authService.logoutAll(userId);
   * // User logged out from all devices
   * ```
   */
  async logoutAll(userId: number): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    logger.info(`User logged out from all devices: ${userId}`);
  }

  /**
   * Initiate password reset flow by sending reset email
   * 
   * @description Generates a password reset token (valid for 1 hour) and sends
   * it to the user's email. Returns success even for non-existent emails
   * to prevent user enumeration attacks.
   * 
   * @param email - Email address to send reset link to
   * @returns void (always succeeds to prevent user enumeration)
   * 
   * @example
   * ```typescript
   * await authService.forgotPassword('user@example.com');
   * // Email sent (or silently ignored if email doesn't exist)
   * ```
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent user enumeration
    if (!user) {
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Generate reset token
    const resetToken = this.generateResetToken(user.id);

    // Send email with reset token
    const { emailService } = await import('./email.service');
    await emailService.sendPasswordResetEmail(email, resetToken);

    logger.info(`Password reset email sent to: ${email}`);
  }

  /**
   * Complete password reset using token from email
   * 
   * @description Verifies the reset token, updates the password, and invalidates
   * all existing refresh tokens for security.
   * 
   * @param token - Password reset token from email
   * @param newPassword - New password to set
   * @returns void
   * @throws {AppError} If token is invalid or expired
   * 
   * @example
   * ```typescript
   * await authService.resetPassword(resetToken, 'newSecurePassword123');
   * ```
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as unknown as { sub: number; type: string };

      if (decoded.type !== 'password_reset') {
        throw new AppError('Invalid reset token', 400, 'INVALID_TOKEN');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);

      // Update password
      await prisma.user.update({
        where: { id: decoded.sub },
        data: { password: hashedPassword },
      });

      // Invalidate all refresh tokens
      await prisma.refreshToken.deleteMany({
        where: { userId: decoded.sub },
      });

      logger.info(`Password reset for user ID: ${decoded.sub}`);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Reset token expired', 400, 'TOKEN_EXPIRED');
      }
      throw error;
    }
  }

  /**
   * Change password for authenticated user
   * 
   * @description Allows authenticated users to change their password.
   * Requires the current password for verification before updating.
   * 
   * @param userId - ID of the authenticated user
   * @param currentPassword - Current password for verification
   * @param newPassword - New password to set
   * @returns void
   * @throws {AppError} If user not found or current password is incorrect
   * 
   * @example
   * ```typescript
   * await authService.changePassword(userId, 'currentPass', 'newPass123');
   * ```
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
    }

    // Hash and update new password
    const hashedNewPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    logger.info(`Password changed for user ID: ${userId}`);
  }

  /**
   * Generate a JWT access token
   * 
   * @description Creates a signed JWT with user claims. Token includes
   * subject (user ID), email, role, and a unique JWT ID (jti).
   * 
   * @param userId - User ID for the subject claim
   * @param email - User email to include in payload
   * @param role - User role (USER, ADMIN) for authorization
   * @returns Signed JWT access token string
   * @private
   */
  private generateAccessToken(userId: number, email: string, role: Role): string {
    const payload = {
      sub: userId,
      email,
      role,
      jti: uuidv4(),
    };
    return jwt.sign(payload, config.jwt.secret, { 
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn']
    });
  }

  /**
   * Generate and persist a refresh token
   * 
   * @description Creates a long-lived refresh token and stores it in the database.
   * Refresh tokens are valid for 7 days and can be used to obtain new access tokens.
   * 
   * @param userId - User ID to associate with the refresh token
   * @returns The refresh token string
   * @private
   */
  private async generateRefreshToken(userId: number): Promise<string> {
    const payload = {
      sub: userId,
      type: 'refresh',
    };
    const token = jwt.sign(payload, config.jwt.refreshSecret, { 
      expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn']
    });

    // Store in database
    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return token;
  }

  /**
   * Generate a password reset token
   * 
   * @description Creates a short-lived JWT (1 hour) for password reset flows.
   * Token type is set to 'password_reset' to distinguish from other tokens.
   * 
   * @param userId - User ID requesting password reset
   * @returns Signed JWT reset token string
   * @private
   */
  private generateResetToken(userId: number): string {
    return jwt.sign(
      {
        sub: userId,
        type: 'password_reset',
      },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
  }
}

export const authService = new AuthService();
export default authService;

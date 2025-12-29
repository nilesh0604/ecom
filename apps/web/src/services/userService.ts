import type { User } from '@/types';
import { apiClient } from '@/utils';

/**
 * User Service - Handles user profile and account management
 * 
 * Separate from auth service because:
 * - Auth handles login/logout/registration
 * - User service handles profile management and settings
 * - Can be called only when user is authenticated
 * 
 * Usage in components:
 * import { userService } from '@/services/userService';
 * 
 * const user = await userService.getProfile();
 * await userService.updateProfile({ firstName: 'Jane' });
 */

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
  image?: string;
}

export interface UserPreferencesRequest {
  theme?: 'light' | 'dark';
  notifications?: boolean;
  emailNotifications?: boolean;
  currency?: string;
}

export const userService = {
  /**
   * Get current logged-in user's profile
   * 
   * @returns Current user details
   * 
   * Example:
   * const user = await userService.getProfile();
   * console.log(user.email, user.firstName);
   */
  getProfile: () =>
    apiClient.get<User>('/users/me'),

  /**
   * Get user by ID
   * 
   * @param id - User ID
   * @returns User public profile
   * 
   * Example:
   * const user = await userService.getUserById(5);
   */
  getUserById: (id: number) =>
    apiClient.get<User>(`/users/${id}`),

  /**
   * Update current user's profile
   * 
   * @param updates - Fields to update (partial update)
   * @returns Updated user data
   * 
   * Example:
   * const updated = await userService.updateProfile({
   *   firstName: 'Jane',
   *   phone: '+1234567890'
   * });
   */
  updateProfile: (updates: UpdateProfileRequest) =>
    apiClient.put<User>('/users/me', updates),

  /**
   * Update user preferences/settings
   * 
   * @param preferences - User preferences (theme, notifications, etc.)
   * @returns Updated preferences
   * 
   * Example:
   * await userService.updatePreferences({
   *   theme: 'dark',
   *   notifications: true
   * });
   */
  updatePreferences: (preferences: UserPreferencesRequest) =>
    apiClient.put<UserPreferencesRequest>('/users/me/preferences', preferences),

  /**
   * Get user's preferences
   * 
   * @returns Current user preferences
   * 
   * Example:
   * const prefs = await userService.getPreferences();
   */
  getPreferences: () =>
    apiClient.get<UserPreferencesRequest>('/users/me/preferences'),

  /**
   * Upload user avatar/profile picture
   * 
   * @param file - Image file to upload
   * @returns Updated user with new image URL
   * 
   * Example:
   * const input = document.querySelector('input[type="file"]');
   * const user = await userService.uploadAvatar(input.files[0]);
   */
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return apiClient.post<User>('/users/me/avatar', formData, {
      headers: {
        // Don't set Content-Type, let browser set it for FormData
      } as any,
    });
  },

  /**
   * Delete user account
   * 
   * Warning: This is permanent and cannot be undone
   * 
   * @param password - Current password for confirmation
   * @returns Confirmation message
   * 
   * Example:
   * await userService.deleteAccount('password123');
   */
  deleteAccount: (password: string) =>
    apiClient.post<{ message: string }>(
      '/users/me/delete',
      { password }
    ),

  /**
   * Get user's addresses
   * 
   * @returns List of saved addresses
   * 
   * Example:
   * const addresses = await userService.getAddresses();
   */
  getAddresses: () =>
    apiClient.get<any[]>('/users/me/addresses'),

  /**
   * Add a new address
   * 
   * @param address - Address data
   * @returns Newly created address with ID
   * 
   * Example:
   * const newAddr = await userService.addAddress({
   *   street: '123 Main St',
   *   city: 'New York',
   *   ...
   * });
   */
  addAddress: (address: any) =>
    apiClient.post<any>('/users/me/addresses', address),

  /**
   * Update an existing address
   * 
   * @param addressId - Address ID to update
   * @param address - Updated address data
   * @returns Updated address
   * 
   * Example:
   * const updated = await userService.updateAddress(1, { city: 'Boston' });
   */
  updateAddress: (addressId: number, address: any) =>
    apiClient.put<any>(`/users/me/addresses/${addressId}`, address),

  /**
   * Set an address as default
   * 
   * @param addressId - Address ID to set as default
   * @returns Updated address
   * 
   * Example:
   * await userService.setDefaultAddress(1);
   */
  setDefaultAddress: (addressId: number) =>
    apiClient.put<any>(`/users/me/addresses/${addressId}/default`, {}),

  /**
   * Delete an address
   * 
   * @param addressId - Address ID to delete
   * 
   * Example:
   * await userService.deleteAddress(1);
   */
  deleteAddress: (addressId: number) =>
    apiClient.delete(`/users/me/addresses/${addressId}`),
};

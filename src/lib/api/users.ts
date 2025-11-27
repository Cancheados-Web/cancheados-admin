/**
 * Users API Client
 * API functions for user management operations
 */

import { apiClient } from '../api';
import type {
  User,
  UserDetail,
  UserFilters,
  UsersResponse,
  SuspendUserRequest,
  ActivateUserRequest,
  DeleteUserRequest,
} from '../types/users';

export const usersApi = {
  /**
   * Get all users with optional filters and pagination
   */
  getUsers: async (filters?: UserFilters): Promise<UsersResponse> => {
    const { data } = await apiClient.get<UsersResponse>('/api/admin/users', {
      params: filters,
    });
    return data;
  },

  /**
   * Get detailed information for a specific user
   */
  getUserById: async (id: string): Promise<UserDetail> => {
    const { data } = await apiClient.get<UserDetail>(`/api/admin/users/${id}`);
    return data;
  },

  /**
   * Suspend a user account
   */
  suspendUser: async (id: string, request: SuspendUserRequest): Promise<void> => {
    await apiClient.patch(`/api/admin/users/${id}/suspend`, request);
  },

  /**
   * Activate (unsuspend) a user account
   */
  activateUser: async (id: string, request?: ActivateUserRequest): Promise<void> => {
    await apiClient.patch(`/api/admin/users/${id}/activate`, request || {});
  },

  /**
   * Soft delete a user account
   */
  deleteUser: async (id: string, request: DeleteUserRequest): Promise<void> => {
    await apiClient.delete(`/api/admin/users/${id}`, { data: request });
  },
};
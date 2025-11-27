/**
 * User Management Types
 * TypeScript interfaces for user-related data structures
 */

// User Types
export interface User {
  id: string;
  email: string;
  nombre: string;
  telefono: string;
  is_admin: boolean;
  suspended: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  teams_count: number;
  disputes_filed: number;
  disputes_against: number;
}

export interface UserTeam {
  id: string;
  nombre: string;
  zona: string;
  rol: string;
}

export interface UserActivity {
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  metadata: any;
}

export interface UserDetail extends Omit<User, 'teams_count' | 'disputes_filed' | 'disputes_against'> {
  teams: UserTeam[];
  recent_activity: UserActivity[];
}

export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface UserFilters {
  search?: string;
  status?: UserStatus;
  is_admin?: boolean;
  limit?: number;
  offset?: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
}

export interface UserStats {
  total_users: number;
  suspended_users: number;
  verified_users: number;
  new_users_7d: number;
  new_users_30d: number;
}

export interface SuspendUserRequest {
  reason: string;
  duration_days?: number;
}

export interface ActivateUserRequest {
  notes?: string;
}

export interface DeleteUserRequest {
  reason: string;
}

// User status configuration for UI display
export const USER_STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: 'green' as const,
    bgColor: 'bg-green-100' as const,
    textColor: 'text-green-800' as const,
  },
  suspended: {
    label: 'Suspended',
    color: 'red' as const,
    bgColor: 'bg-red-100' as const,
    textColor: 'text-red-800' as const,
  },
  deleted: {
    label: 'Deleted',
    color: 'gray' as const,
    bgColor: 'bg-gray-100' as const,
    textColor: 'text-gray-800' as const,
  },
} as const;

// Helper function to get user status
export function getUserStatus(user: User): UserStatus {
  if (user.deleted_at) return 'deleted';
  if (user.suspended) return 'suspended';
  return 'active';
}

// Helper function to format user display name
export function formatUserName(user: Pick<User, 'nombre' | 'email'>): string {
  return user.nombre || user.email;
}
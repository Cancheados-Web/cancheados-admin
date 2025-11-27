/**
 * TypeScript Type Definitions for Cancheados Admin
 * Defines all entity types used across the application
 */

// =====================================================
// USER TYPES
// =====================================================

export interface User {
  id: string;
  email: string;
  nombre: string;
  telefono?: string;
  is_admin: boolean;
  suspended: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  nombre: string;
  is_admin: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// =====================================================
// DISPUTE TYPES
// =====================================================
// Note: Dispute types are now defined in ./types/disputes
// Import from './types/disputes' or from this file (re-exported at bottom)

// =====================================================
// TEAM TYPES
// =====================================================

export interface Team {
  id: string;
  nombre: string;
  nivel: string;
  zona: string;
  capitan_id: string;
  suspended: boolean;
  created_at: string;
  updated_at: string;
  // Populated fields
  capitan?: {
    id: string;
    nombre: string;
    email: string;
  };
  member_count?: number;
  match_count?: number;
}

// =====================================================
// VENUE TYPES
// =====================================================

export interface Venue {
  id: string;
  owner_id: string;
  nombre: string;
  direccion: string;
  precio_hora: number;
  tipo_cancha: string;
  disponibilidad: Record<string, any>;
  verified: boolean;
  suspended: boolean;
  created_at: string;
  updated_at: string;
  // Populated fields
  owner?: {
    id: string;
    nombre: string;
    email: string;
  };
  booking_count?: number;
  rating?: number;
}

// =====================================================
// BOOKING TYPES
// =====================================================

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'disputed';

export interface Booking {
  id: string;
  match_id: string;
  venue_id: string;
  fecha_hora: string;
  monto_total: number;
  estado: BookingStatus;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// AUDIT LOG TYPES
// =====================================================

export type EntityType = 
  | 'user'
  | 'team'
  | 'venue'
  | 'booking'
  | 'match'
  | 'dispute'
  | 'payment'
  | 'other';

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: EntityType;
  entity_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  metadata: Record<string, any>;
  created_at: string;
  admin?: {
    id: string;
    nombre: string;
    email: string;
  };
}

// =====================================================
// REPORT TYPES
// =====================================================

export interface OverviewReport {
  total_users: number;
  total_teams: number;
  total_venues: number;
  total_bookings: number;
  pending_disputes: number;
  completed_matches: number;
}

export interface BookingsReport {
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  completed_bookings: number;
  disputed_bookings: number;
  total_revenue: number;
}

export interface DisputesReport {
  total_disputes: number;
  pending: number;
  under_review: number;
  resolved: number;
  no_show_disputes: number;
  payment_disputes: number;
}

export interface UsersReport {
  total_users: number;
  active_users: number;
  suspended_users: number;
  admin_users: number;
  new_users_this_month: number;
}

export interface VenuesReport {
  total_venues: number;
  verified_venues: number;
  suspended_venues: number;
  pending_verification: number;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode?: number;
}

// =====================================================
// FILTER TYPES
// =====================================================
// Note: DisputeFilters is now defined in ./types/disputes

export interface UserFilters {
  search?: string;
  status?: 'active' | 'suspended' | 'deleted';
  is_admin?: boolean;
  limit?: number;
  offset?: number;
}

export interface TeamFilters {
  search?: string;
  zona?: string;
  nivel?: string;
  suspended?: boolean;
  limit?: number;
  offset?: number;
}

export interface VenueFilters {
  search?: string;
  verified?: boolean;
  suspended?: boolean;
  zona?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogFilters {
  action?: string;
  entity_type?: EntityType;
  admin_id?: string;
  limit?: number;
  offset?: number;
}

// =====================================================
// RE-EXPORT DISPUTES MODULE
// =====================================================
// Note: The dispute types above are legacy/placeholder types.
// The actual dispute types matching the backend API are in ./types/disputes
// Import from './types/disputes' for the correct types.
export * from './types/disputes';
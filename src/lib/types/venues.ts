/**
 * Venue Types
 * Type definitions for venue management
 */

export interface Venue {
  id: string;
  nombre: string;
  direccion: string;
  zona: string;
  owner_id: string;
  owner: {
    id: string;
    nombre: string;
    email: string;
  };
  verified: boolean;
  suspended: boolean;
  avg_rating: number | null;
  review_count: number;
  precio_por_hora: number;
  capacidad: number;
  tipo_superficie: string;
  techada: boolean;
  iluminacion: boolean;
  vestuarios: boolean;
  estacionamiento: boolean;
  created_at: string;
  updated_at: string;
}

export interface VenueFilters {
  search?: string;
  verified?: boolean;
  suspended?: boolean;
  limit?: number;
  offset?: number;
}

export interface VenuesResponse {
  venues: Venue[];
  total: number;
}

export type VenueStatus = 'verified' | 'unverified' | 'suspended';

export const VENUE_STATUS_CONFIG: Record<VenueStatus, { label: string; color: 'green' | 'yellow' | 'red' }> = {
  verified: { label: 'Verified', color: 'green' },
  unverified: { label: 'Unverified', color: 'yellow' },
  suspended: { label: 'Suspended', color: 'red' },
};

export function getVenueStatus(venue: Venue): VenueStatus {
  if (venue.suspended) return 'suspended';
  if (venue.verified) return 'verified';
  return 'unverified';
}
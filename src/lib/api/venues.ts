/**
 * Venues API Client
 * API functions for venue management
 */

import { apiClient } from '../api';
import type { Venue, VenueFilters, VenuesResponse } from '../types/venues';

export const venuesApi = {
  /**
   * Get all venues with filters
   */
  getVenues: async (filters: VenueFilters): Promise<VenuesResponse> => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.verified !== undefined) params.append('verified', String(filters.verified));
    if (filters.suspended !== undefined) params.append('suspended', String(filters.suspended));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.offset) params.append('offset', String(filters.offset));

    const response = await apiClient.get(`/api/admin/venues?${params.toString()}`);
    return response.data;
  },

  /**
   * Get venue by ID
   */
  getVenue: async (id: string): Promise<Venue> => {
    const response = await apiClient.get(`/api/admin/venues/${id}`);
    return response.data;
  },

  /**
   * Verify venue
   */
  verifyVenue: async (id: string, notes?: string): Promise<void> => {
    await apiClient.patch(`/api/admin/venues/${id}/verify`, { notes });
  },

  /**
   * Suspend venue
   */
  suspendVenue: async (id: string, data: { reason: string }): Promise<void> => {
    await apiClient.patch(`/api/admin/venues/${id}/suspend`, data);
  },

  /**
   * Activate venue
   */
  activateVenue: async (id: string): Promise<void> => {
    await apiClient.patch(`/api/admin/venues/${id}/activate`);
  },
};
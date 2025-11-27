/**
 * Teams API Client
 * API functions for team management operations
 */

import { apiClient } from '../api';
import type {
  Team,
  TeamDetail,
  TeamFilters,
  TeamsResponse,
  SuspendTeamRequest,
} from '../types/teams';

export const teamsApi = {
  /**
   * Get all teams with optional filters and pagination
   */
  getTeams: async (filters?: TeamFilters): Promise<TeamsResponse> => {
    const { data } = await apiClient.get<TeamsResponse>('/api/admin/teams', {
      params: filters,
    });
    return data;
  },

  /**
   * Get detailed information for a specific team
   */
  getTeamById: async (id: string): Promise<TeamDetail> => {
    const { data } = await apiClient.get<TeamDetail>(`/api/admin/teams/${id}`);
    return data;
  },

  /**
   * Suspend a team
   */
  suspendTeam: async (id: string, request: SuspendTeamRequest): Promise<void> => {
    await apiClient.patch(`/api/admin/teams/${id}/suspend`, request);
  },

  /**
   * Activate (unsuspend) a team
   */
  activateTeam: async (id: string): Promise<void> => {
    await apiClient.patch(`/api/admin/teams/${id}/activate`);
  },
};
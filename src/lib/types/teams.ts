/**
 * Team Management Types
 * TypeScript interfaces for team-related data structures
 */

// Team Types
export interface TeamCaptain {
  id: string;
  nombre: string;
  email: string;
}

export interface Team {
  id: string;
  nombre: string;
  zona: string;
  suspended: boolean;
  created_at: string;
  updated_at: string;
  capitan: TeamCaptain;
  members_count: number;
}

export interface TeamMemberUser {
  id: string;
  nombre: string;
  email: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  rol: string;
  joined_at: string;
  user: TeamMemberUser;
}

export interface TeamDetail extends Omit<Team, 'members_count'> {
  members: TeamMember[];
}

export interface TeamFilters {
  search?: string;
  zona?: string;
  suspended?: boolean;
  limit?: number;
  offset?: number;
}

export interface TeamsResponse {
  teams: Team[];
  total: number;
}

export interface TeamStats {
  total_teams: number;
  active_teams: number;
  suspended_teams: number;
  avg_members_per_team: number;
}

export interface SuspendTeamRequest {
  reason: string;
}

// Team status configuration for UI display
export const TEAM_STATUS_CONFIG = {
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
} as const;

// Common zones in the system
export const TEAM_ZONES = [
  'Norte',
  'Sur',
  'Este',
  'Oeste',
  'Centro',
] as const;

export type TeamZone = typeof TEAM_ZONES[number];

// Helper function to get team status
export function getTeamStatus(team: Team): 'active' | 'suspended' {
  return team.suspended ? 'suspended' : 'active';
}

// Helper function to format team display name
export function formatTeamName(team: Pick<Team, 'nombre' | 'zona'>): string {
  return `${team.nombre} (${team.zona})`;
}

// Helper function to get captain display name
export function formatCaptainName(captain: TeamCaptain): string {
  return captain.nombre || captain.email;
}
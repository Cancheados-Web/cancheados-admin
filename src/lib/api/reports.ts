import api from '../api';

export interface OverviewReport {
  total_users: number;
  new_users_30d: number;
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
  total_revenue: string;
}

export interface RevenueReport {
  month: string;
  revenue: string;
  booking_count: number;
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
  suspended_users: number;
  verified_users: number;
  new_users_7d: number;
  new_users_30d: number;
}

export interface VenuesReport {
  total_venues: number;
  verified_venues: number;
  suspended_venues: number;
  avg_rating: string;
}

export interface TeamsReport {
  total_teams: number;
  new_teams_30d: number;
  new_teams_7d: number;
  avg_members_per_team: string;
  teams_with_7_plus: number;
  teams_with_11_plus: number;
}

export interface BookingCalendarEntry {
  booking_id: string;
  match_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  booking_status: string;
  match_status: string;
  team1_name: string;
  team2_name: string | null;
  venue_name: string | null;
  venue_zone: string | null;
}

export interface BookingDetail extends BookingCalendarEntry {
  duracion_minutos: number;
  notas: string | null;
  requisitos_especiales: string | null;
  venue_address: string | null;
  venue_surface: string | null;
  venue_price_hour: string | null;
  match_zone: string | null;
  match_court: string | null;
  team1_confirmed: boolean;
  team2_confirmed: boolean;
  created_at: string;
  updated_at: string;
  created_by_name: string | null;
  created_by_email: string | null;
  scores: any;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  nombre: string;
  telefono: string | null;
  is_admin: boolean;
  suspended: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  teams_count: number;
  disputes_filed: number;
  disputes_against: number;
}

export interface AdminUserDetail extends AdminUserListItem {
  deleted_at: string | null;
  teams: Array<{ id: string; nombre: string; zona: string | null; rol: string | null }>;
  recent_activity: Array<{ action: string; entity_type: string; entity_id: string; created_at: string; metadata: any }>;
}

export interface TeamListItem {
  id: string;
  nombre: string;
  zona: string | null;
  nivel: string | null;
  created_at: string;
  member_count: number | null;
  capitan_nombre: string | null;
  capitan_email: string | null;
}

export interface TeamDetail extends TeamListItem {
  capitan_id?: string;
  descripcion: string | null;
  capitan_id: string | null;
  members: Array<{ user_id: string; role: string; joined_at: string; nombre: string; email: string }>;
}

export const reportsApi = {
  getOverview: async (): Promise<OverviewReport> => {
    const response = await api.get('/api/admin/reports/overview');
    return response.data;
  },

  getBookings: async (startDate?: string, endDate?: string): Promise<BookingsReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/api/admin/reports/bookings?${params.toString()}`);
    return response.data;
  },

  getBookingsCalendar: async (startDate?: string, endDate?: string): Promise<BookingCalendarEntry[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await api.get(`/api/admin/reports/bookings/calendar?${params.toString()}`);
    return response.data;
  },

  getBookingDetail: async (bookingId: string): Promise<BookingDetail> => {
    const response = await api.get(`/api/admin/reports/bookings/${bookingId}`);
    return response.data;
  },

  getRevenue: async (): Promise<RevenueReport[]> => {
    const response = await api.get('/api/admin/reports/revenue');
    return response.data;
  },

  getDisputes: async (): Promise<DisputesReport> => {
    const response = await api.get('/api/admin/reports/disputes');
    return response.data;
  },

  getUsers: async (): Promise<UsersReport> => {
    const response = await api.get('/api/admin/reports/users');
    return response.data;
  },

  getVenues: async (): Promise<VenuesReport> => {
    const response = await api.get('/api/admin/reports/venues');
    return response.data;
  },

  getTeams: async (): Promise<TeamsReport> => {
    const response = await api.get('/api/admin/reports/teams');
    return response.data;
  },

  getUsersList: async (search = ''): Promise<{ users: AdminUserListItem[]; total: number }> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', '100');
    const response = await api.get(`/api/admin/users?${params.toString()}`);
    return response.data;
  },

  getUserDetail: async (id: string): Promise<AdminUserDetail> => {
    const response = await api.get(`/api/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, payload: Partial<Pick<AdminUserDetail, 'nombre' | 'telefono' | 'is_admin' | 'suspended'>>): Promise<AdminUserDetail> => {
    const response = await api.patch(`/api/admin/users/${id}`, payload);
    return response.data;
  },

  suspendUser: async (id: string, reason = 'Admin action'): Promise<void> => {
    await api.patch(`/api/admin/users/${id}/suspend`, { reason });
  },

  activateUser: async (id: string, notes = 'Admin action'): Promise<void> => {
    await api.patch(`/api/admin/users/${id}/activate`, { notes });
  },

  getTeamsList: async (search = ''): Promise<TeamListItem[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', '100');
    const response = await api.get(`/api/admin/reports/teams/list?${params.toString()}`);
    return response.data;
  },

  getTeamDetail: async (id: string): Promise<TeamDetail> => {
    const response = await api.get(`/api/admin/reports/teams/${id}`);
    return response.data;
  },

  updateTeam: async (id: string, payload: Partial<Pick<TeamDetail, 'nombre' | 'zona' | 'nivel'>>): Promise<TeamDetail> => {
    const response = await api.patch(`/api/admin/reports/teams/${id}`, payload);
    return response.data;
  },

  addTeamMember: async (teamId: string, payload: { user_id?: string; email?: string; role?: 'capitan' | 'co-capitan' | 'member' }) => {
    const response = await api.post(`/api/admin/reports/teams/${teamId}/members`, payload);
    return response.data;
  },

  removeTeamMember: async (teamId: string, userId: string) => {
    const response = await api.delete(`/api/admin/reports/teams/${teamId}/members/${userId}`);
    return response.data;
  }
};

export default reportsApi;

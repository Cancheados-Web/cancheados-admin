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
  }
};

export default reportsApi;
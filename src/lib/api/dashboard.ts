import api from '../api';

// Dashboard statistics interface
export interface DashboardStats {
  total_users: number;
  new_users_7d: number;
  new_users_30d: number;
  active_teams: number;
  total_venues: number;
  verified_venues: number;
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  pending_disputes: number;
  completed_matches: number;
  revenue_today: string;
  revenue_week: string;
  revenue_month: string;
}

// Activity item interface
export interface ActivityItem {
  type: 'user' | 'team' | 'booking' | 'dispute' | 'venue';
  action: string;
  entity_id: string;
  description: string;
  timestamp: string;
  user_data?: {
    id: string;
    nombre: string;
    email?: string;
  };
}

// Dashboard API functions
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/api/admin/dashboard/stats');
    return response.data;
  },

  getActivity: async (limit = 10): Promise<ActivityItem[]> => {
    const response = await api.get(`/api/admin/dashboard/activity?limit=${limit}`);
    return response.data;
  }
};

// Default export
export default dashboardApi;
import { useEffect, useState } from 'react';
import { dashboardApi } from '../lib/api/dashboard';
import type { DashboardStats, ActivityItem } from '../lib/api/dashboard';
// import { reportsApi, RevenueReport } from '../lib/api/reports';
import StatsCard from '../components/dashboard/StatsCard';
// import RevenueChart from '../components/dashboard/RevenueChart';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import QuickActions from '../components/dashboard/QuickActions';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  // const [revenueData, setRevenueData] = useState<RevenueReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, activityData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getActivity(10),
        // reportsApi.getRevenue()
      ]);
      
      setStats(statsData);
      setActivity(activityData);
      // setRevenueData(revenueDataResponse.map(item => ({
      //   ...item,
      //   revenue: parseFloat(item.revenue)
      // })));
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={stats.total_users.toLocaleString()}
          change={{ value: stats.new_users_7d, period: '7d' }}
          trend={stats.new_users_7d > 0 ? 'up' : 'neutral'}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          }
        />
        
        <StatsCard
          title="Active Teams"
          value={stats.active_teams.toLocaleString()}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          }
        />
        
        <StatsCard
          title="Total Venues"
          value={stats.total_venues.toLocaleString()}
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          }
        />
        
        <StatsCard
          title="Total Bookings"
          value={stats.total_bookings.toLocaleString()}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          }
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Pending Disputes"
          value={stats.pending_disputes.toLocaleString()}
          color="red"
          trend={stats.pending_disputes > 0 ? 'down' : 'neutral'}
        />
        
        <StatsCard
          title="Verified Venues"
          value={`${stats.verified_venues} / ${stats.total_venues}`}
          color="green"
        />
        
        <StatsCard
          title="Revenue (30d)"
          value={`$${parseFloat(stats.revenue_month).toLocaleString()}`}
          color="blue"
        />
      </div>

      {/* Charts and Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card title="Revenue Trends (Last 12 Months)">
            <div className="flex items-center justify-center h-64 text-gray-500">
              Chart temporarily disabled for testing
            </div>
          </Card>
        </div>
        
        <div>
          <Card title="Quick Actions">
            <QuickActions />
          </Card>
        </div>
      </div>

      {/* Activity Feed */}
      <Card title="Recent Activity">
        <ActivityFeed activities={activity} loading={false} />
      </Card>
    </div>
  );
}
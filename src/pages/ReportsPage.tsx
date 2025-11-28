import { useState, useEffect } from 'react';
import { reportsApi } from '../lib/api/reports';
import type { OverviewReport, BookingsReport, RevenueReport, DisputesReport } from '../lib/api/reports';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { exportToCSV, exportToPDF } from '../lib/utils/export';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ReportTab = 'overview' | 'bookings' | 'revenue' | 'disputes';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [loading, setLoading] = useState(false);
  
  // Overview data
  const [overviewData, setOverviewData] = useState<OverviewReport | null>(null);
  
  // Bookings data
  const [bookingsData, setBookingsData] = useState<BookingsReport | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Revenue data
  const [revenueData, setRevenueData] = useState<RevenueReport[]>([]);
  
  // Disputes data
  const [disputesData, setDisputesData] = useState<DisputesReport | null>(null);

  useEffect(() => {
    loadReportData();
  }, [activeTab]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'overview':
          const overview = await reportsApi.getOverview();
          setOverviewData(overview);
          break;
        case 'bookings':
          const bookings = await reportsApi.getBookings(startDate, endDate);
          setBookingsData(bookings);
          break;
        case 'revenue':
          const revenue = await reportsApi.getRevenue();
          setRevenueData(revenue.map(item => ({
            ...item,
            revenue: parseFloat(item.revenue)
          })));
          break;
        case 'disputes':
          const disputes = await reportsApi.getDisputes();
          setDisputesData(disputes);
          break;
      }
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    let data: any[] = [];
    let filename = '';
    let title = '';

    switch (activeTab) {
      case 'overview':
        if (overviewData) {
          data = [overviewData];
          filename = 'overview-report';
          title = 'Overview Report';
        }
        break;
      case 'bookings':
        if (bookingsData) {
          data = [bookingsData];
          filename = 'bookings-report';
          title = 'Bookings Report';
        }
        break;
      case 'revenue':
        data = revenueData;
        filename = 'revenue-report';
        title = 'Revenue Report';
        break;
      case 'disputes':
        if (disputesData) {
          data = [disputesData];
          filename = 'disputes-report';
          title = 'Disputes Report';
        }
        break;
    }

    if (format === 'csv') {
      exportToCSV(data, filename);
    } else {
      exportToPDF(data, filename, title);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'bookings', label: 'Bookings' },
            { id: 'revenue', label: 'Revenue' },
            { id: 'disputes', label: 'Disputes' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportTab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Overview Report */}
          {activeTab === 'overview' && overviewData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card title="Users">
                <div className="text-4xl font-bold text-blue-600">{overviewData.total_users.toLocaleString()}</div>
                <p className="text-sm text-gray-500 mt-2">
                  +{overviewData.new_users_30d} in last 30 days
                </p>
              </Card>
              <Card title="Teams">
                <div className="text-4xl font-bold text-green-600">{overviewData.total_teams.toLocaleString()}</div>
              </Card>
              <Card title="Venues">
                <div className="text-4xl font-bold text-yellow-600">{overviewData.total_venues.toLocaleString()}</div>
              </Card>
              <Card title="Bookings">
                <div className="text-4xl font-bold text-purple-600">{overviewData.total_bookings.toLocaleString()}</div>
              </Card>
              <Card title="Pending Disputes">
                <div className="text-4xl font-bold text-red-600">{overviewData.pending_disputes.toLocaleString()}</div>
              </Card>
              <Card title="Completed Matches">
                <div className="text-4xl font-bold text-indigo-600">{overviewData.completed_matches.toLocaleString()}</div>
              </Card>
            </div>
          )}

          {/* Bookings Report */}
          {activeTab === 'bookings' && (
            <div>
              <Card title="Date Range Filter">
                <div className="flex space-x-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={loadReportData}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>
              </Card>

              {bookingsData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <Card title="Bookings Statistics">
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500">Total Bookings</div>
                        <div className="text-3xl font-bold">{bookingsData.total_bookings.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Confirmed</div>
                        <div className="text-2xl font-bold text-green-600">{bookingsData.confirmed_bookings.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Cancelled</div>
                        <div className="text-2xl font-bold text-red-600">{bookingsData.cancelled_bookings.toLocaleString()}</div>
                      </div>
                    </div>
                  </Card>

                  <Card title="Revenue">
                    <div className="text-4xl font-bold text-blue-600">
                      ${parseFloat(bookingsData.total_revenue).toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Total revenue from bookings</p>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Revenue Report */}
          {activeTab === 'revenue' && revenueData.length > 0 && (
            <div className="space-y-6">
              <Card title="Monthly Revenue Trend">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                      />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        formatter={(value: number, name: string) => {
                          if (name === 'revenue') return [`$${value.toLocaleString()}`, 'Revenue'];
                          return [value, 'Bookings'];
                        }}
                      />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                      <Line yAxisId="right" type="monotone" dataKey="booking_count" stroke="#10b981" strokeWidth={2} name="Bookings" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Monthly Bookings">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      />
                      <Legend />
                      <Bar dataKey="booking_count" fill="#3b82f6" name="Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {/* Disputes Report */}
          {activeTab === 'disputes' && disputesData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Disputes by Status">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: disputesData.pending },
                          { name: 'Under Review', value: disputesData.under_review },
                          { name: 'Resolved', value: disputesData.resolved }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0, 1, 2].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Disputes Statistics">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Total Disputes</div>
                    <div className="text-3xl font-bold">{disputesData.total_disputes.toLocaleString()}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Pending</div>
                      <div className="text-2xl font-bold text-yellow-600">{disputesData.pending}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Under Review</div>
                      <div className="text-2xl font-bold text-blue-600">{disputesData.under_review}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Resolved</div>
                      <div className="text-2xl font-bold text-green-600">{disputesData.resolved}</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium text-gray-700 mb-2">By Type</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">No Show</span>
                        <span className="text-sm font-medium">{disputesData.no_show_disputes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment Issues</span>
                        <span className="text-sm font-medium">{disputesData.payment_disputes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
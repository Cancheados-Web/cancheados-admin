import { useState, useEffect } from 'react';
import { reportsApi } from '../lib/api/reports';
import type { OverviewReport, BookingsReport, RevenueReport, DisputesReport, BookingCalendarEntry, BookingDetail, UsersReport, TeamsReport, AdminUserListItem, AdminUserDetail, TeamListItem, TeamDetail } from '../lib/api/reports';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { exportToCSV, exportToPDF } from '../lib/utils/export';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ReportTab = 'overview' | 'bookings' | 'revenue' | 'disputes' | 'users' | 'teams';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [loading, setLoading] = useState(false);
  
  // Overview data
  const [overviewData, setOverviewData] = useState<OverviewReport | null>(null);
  
  // Bookings data
  const [bookingsData, setBookingsData] = useState<BookingsReport | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [calendarEvents, setCalendarEvents] = useState<BookingCalendarEntry[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<BookingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [usersReport, setUsersReport] = useState<UsersReport | null>(null);
  const [teamsReport, setTeamsReport] = useState<TeamsReport | null>(null);
  const [usersList, setUsersList] = useState<AdminUserListItem[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersSearch, setUsersSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [teamsList, setTeamsList] = useState<TeamListItem[]>([]);
  const [teamsSearch, setTeamsSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<TeamDetail | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'member' | 'capitan'>('member');
  const [memberError, setMemberError] = useState<string | null>(null);
  
  // Revenue data
  const [revenueData, setRevenueData] = useState<RevenueReport[]>([]);
  
  // Disputes data
  const [disputesData, setDisputesData] = useState<DisputesReport | null>(null);

  useEffect(() => {
    loadReportData();
  }, [activeTab]);

  const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    // include the following month to surface nearby bookings (e.g., seeded December data when viewing November)
    const end = new Date(date.getFullYear(), date.getMonth() + 2, 0);
    const toDate = (d: Date) => d.toISOString().split('T')[0];

    return { start: toDate(start), end: toDate(end) };
  };

  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

  const isDateInMonth = (dateKey: string | null, month: Date) => {
    if (!dateKey) return false;
    const d = new Date(dateKey);
    return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
  };

  const confirmAction = (message: string) => window.confirm(message);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const loadReportData = async (monthOverride?: Date, targetDateKey?: string | null) => {
    setLoading(true);
    try {
      const monthForQuery = monthOverride || currentMonth;
      const { start, end } = getMonthRange(monthForQuery);
      const selectionCandidate = targetDateKey ?? selectedDate;

      switch (activeTab) {
        case 'overview':
          const overview = await reportsApi.getOverview();
          setOverviewData(overview);
          break;
        case 'bookings':
          const [bookings, calendar] = await Promise.all([
            reportsApi.getBookings(startDate, endDate),
            reportsApi.getBookingsCalendar(start, end)
          ]);
          setBookingsData(bookings);
          setCalendarEvents(calendar);
          const selectionInMonth = isDateInMonth(selectionCandidate, monthForQuery);
          const firstEventDate = calendar.length > 0 ? calendar[0].fecha : null;
          const hasCurrentMonthEvents = calendar.some((event) => isDateInMonth(event.fecha, monthForQuery));

          if (hasCurrentMonthEvents) {
            const nextSelection = selectionInMonth ? selectionCandidate : firstEventDate;
            setSelectedDate(nextSelection);
          } else {
            // If empty, fetch all events and jump to the first available month
            const allCalendar = await reportsApi.getBookingsCalendar();
            setCalendarEvents(allCalendar);
            const first = allCalendar.length > 0 ? allCalendar[0].fecha : null;
            if (first) {
              const firstDateObj = new Date(first);
              const normalized = new Date(firstDateObj.getFullYear(), firstDateObj.getMonth(), 1);
              setCurrentMonth(normalized);
              setSelectedDate(first);
            } else {
              setSelectedDate(selectionInMonth ? selectionCandidate : null);
            }
          }
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
        case 'users':
          const [usersSummary, usersListResponse] = await Promise.all([
            reportsApi.getUsers(),
            reportsApi.getUsersList(usersSearch)
          ]);
          setUsersReport(usersSummary);
          setUsersList(usersListResponse.users);
          setUsersTotal(usersListResponse.total);
          break;
        case 'teams':
          const [teamsSummary, teamsListResponse] = await Promise.all([
            reportsApi.getTeams(),
            reportsApi.getTeamsList(teamsSearch)
          ]);
          setTeamsReport(teamsSummary);
          setTeamsList(teamsListResponse);
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
      case 'users':
        if (usersReport) {
          data = [usersReport];
          filename = 'users-report';
          title = 'Users Report';
        }
        break;
      case 'teams':
        if (teamsReport) {
          data = [teamsReport];
          filename = 'teams-report';
          title = 'Teams Report';
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

  const handleMonthChange = (delta: number) => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1);
    setCurrentMonth(next);
    setSelectedDate(null);
    loadReportData(next, null);
  };

  const resetToCurrentMonth = () => {
    const today = new Date();
    const normalized = new Date(today.getFullYear(), today.getMonth(), 1);
    setCurrentMonth(normalized);
    const todayKey = formatDateKey(today);
    setSelectedDate(todayKey);
    loadReportData(normalized, todayKey);
  };

  const loadBookingDetail = async (event: BookingCalendarEntry) => {
    // optimistic: show basic info from calendar while fetching full detail
    setSelectedBookingDetail({
      ...event,
      duracion_minutos: 90,
      notas: null,
      requisitos_especiales: null,
      venue_address: null,
      venue_surface: null,
      venue_price_hour: null,
      match_zone: null,
      match_court: null,
      team1_confirmed: false,
      team2_confirmed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by_name: null,
      created_by_email: null,
      scores: null
    });
    setSelectedBookingId(event.booking_id);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const detail = await reportsApi.getBookingDetail(event.booking_id);
      setSelectedBookingDetail(detail);
    } catch (error) {
      console.error('Failed to load booking detail:', error);
      setDetailError('Failed to load booking details. Showing calendar data.');
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshUsersList = async () => {
    setUsersLoading(true);
    try {
      const [usersSummary, usersListResponse] = await Promise.all([
        reportsApi.getUsers(),
        reportsApi.getUsersList(usersSearch)
      ]);
      setUsersReport(usersSummary);
      setUsersList(usersListResponse.users);
      setUsersTotal(usersListResponse.total);
    } finally {
      setUsersLoading(false);
    }
  };

  const refreshTeamsList = async () => {
    setTeamsLoading(true);
    try {
      const [teamsSummary, teamsListResponse] = await Promise.all([
        reportsApi.getTeams(),
        reportsApi.getTeamsList(teamsSearch)
      ]);
      setTeamsReport(teamsSummary);
      setTeamsList(teamsListResponse);
    } finally {
      setTeamsLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    if (!confirmAction('Save changes to this user?')) return;
    try {
      await reportsApi.updateUser(selectedUser.id, {
        nombre: selectedUser.nombre,
        telefono: selectedUser.telefono,
        is_admin: selectedUser.is_admin,
        suspended: selectedUser.suspended
      });
      const detail = await reportsApi.getUserDetail(selectedUser.id);
      setSelectedUser(detail);
      await refreshUsersList();
      showToast('success', 'User updated successfully');
    } catch (err) {
      console.error('Failed to update user', err);
      showToast('error', 'Failed to update user');
    }
  };

  const handleToggleSuspend = async (user: AdminUserListItem | AdminUserDetail) => {
    const action = user.suspended ? 'activate' : 'suspend';
    if (!confirmAction(`Are you sure you want to ${action} this user?`)) return;
    try {
      if (user.suspended) {
        await reportsApi.activateUser(user.id, 'Re-activate from reports');
      } else {
        await reportsApi.suspendUser(user.id, 'Suspended from reports view');
      }
      await refreshUsersList();
      if (selectedUser?.id === user.id) {
        const detail = await reportsApi.getUserDetail(user.id);
        setSelectedUser(detail);
      }
      showToast('success', `User ${action}d`);
    } catch (err) {
      console.error('Failed to toggle suspension', err);
      // Best-effort: refresh to see real state, and show message accordingly
      await refreshUsersList();
      if (selectedUser?.id === user.id) {
        const detail = await reportsApi.getUserDetail(user.id);
        setSelectedUser(detail);
        if (detail.suspended === user.suspended) {
          showToast('error', `Failed to ${action} user`);
        } else {
          showToast('success', `User ${action}d`);
        }
      } else {
        showToast('error', `Failed to ${action} user`);
      }
    }
  };

  const handleSaveTeam = async () => {
    if (!selectedTeam) return;
    if (!confirmAction('Save changes to this team?')) return;
    try {
      await reportsApi.updateTeam(selectedTeam.id, {
        nombre: selectedTeam.nombre,
        zona: selectedTeam.zona || null,
        nivel: selectedTeam.nivel || null
      });
      const detail = await reportsApi.getTeamDetail(selectedTeam.id);
      setSelectedTeam(detail);
      await refreshTeamsList();
      showToast('success', 'Team updated successfully');
    } catch (err) {
      console.error('Failed to update team', err);
      showToast('error', 'Failed to update team');
    }
  };

  const handleAddMember = async () => {
    if (!selectedTeam || !newMemberEmail.trim()) return;
    try {
      setMemberError(null);
      await reportsApi.addTeamMember(selectedTeam.id, { email: newMemberEmail.trim(), role: newMemberRole });
      const detail = await reportsApi.getTeamDetail(selectedTeam.id);
      setSelectedTeam(detail);
      setNewMemberEmail('');
      setNewMemberRole('member');
      await refreshTeamsList();
      showToast('success', 'Member added');
    } catch (err) {
      console.error('Failed to add member', err);
      const resp = (err as any)?.response;
      const message =
        (resp?.data && (resp.data.message || resp.data.error)) ||
        (err as any)?.message ||
        'Failed to add member. Check email and role.';
      setMemberError(message);
      showToast('error', message);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam) return;
    if (!confirmAction('Remove this member from the team?')) return;
    try {
      await reportsApi.removeTeamMember(selectedTeam.id, userId);
      const detail = await reportsApi.getTeamDetail(selectedTeam.id);
      setSelectedTeam(detail);
      await refreshTeamsList();
      showToast('success', 'Member removed');
    } catch (err) {
      console.error('Failed to remove member', err);
      showToast('error', 'Failed to remove member');
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const eventsByDate = calendarEvents.reduce<Record<string, BookingCalendarEntry[]>>((acc, event) => {
    const dateKey = event.fecha;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {});
  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];


  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();
  const calendarCells: Array<Date | null> = [];

  for (let i = 0; i < startDay; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
  }

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
            { id: 'disputes', label: 'Disputes' },
            { id: 'users', label: 'Users' },
            { id: 'teams', label: 'Teams' }
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
      {toast && (
        <div className={`mb-4 rounded px-4 py-3 border ${toast.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          {toast.message}
        </div>
      )}

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

          {/* Users Report */}
          {activeTab === 'users' && usersReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Users Overview">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total Users</span>
                      <span className="text-2xl font-bold text-blue-600">{usersReport.total_users.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Verified</span>
                      <span className="text-xl font-semibold text-green-600">{usersReport.verified_users.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Suspended</span>
                      <span className="text-xl font-semibold text-red-600">{usersReport.suspended_users.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
                <Card title="Growth (7d)">
                  <div className="text-4xl font-bold text-purple-600">{usersReport.new_users_7d.toLocaleString()}</div>
                  <p className="text-sm text-gray-500 mt-2">New users in the last 7 days</p>
                </Card>
                <Card title="Growth (30d)">
                  <div className="text-4xl font-bold text-indigo-600">{usersReport.new_users_30d.toLocaleString()}</div>
                  <p className="text-sm text-gray-500 mt-2">New users in the last 30 days</p>
                </Card>
              </div>

              <Card title="Users List">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={usersSearch}
                      onChange={(e) => setUsersSearch(e.target.value)}
                      placeholder="Search by name or email"
                      className="border border-gray-300 rounded px-3 py-2"
                    />
                    <button
                      onClick={refreshUsersList}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={usersLoading}
                    >
                      {usersLoading ? 'Loading...' : 'Search'}
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">Total: {usersTotal}</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">Name</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">Email</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">Status</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">Admin</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">Teams</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((user) => (
                        <tr key={user.id} className={selectedUser?.id === user.id ? 'bg-blue-50' : 'bg-white'}>
                          <td className="px-3 py-2 border-b text-gray-900">
                            <div className="font-semibold">{user.nombre || 'Sin nombre'}</div>
                            <div className="text-xs text-gray-600">Created: {new Date(user.created_at).toLocaleDateString()}</div>
                          </td>
                          <td className="px-3 py-2 border-b text-gray-900">
                            <div className="font-medium">{user.email}</div>
                            <div className="text-xs text-gray-600">{user.telefono || ''}</div>
                          </td>
                          <td className="px-3 py-2 border-b">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              user.suspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {user.suspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td className="px-3 py-2 border-b text-gray-900">{user.is_admin ? 'Yes' : 'No'}</td>
                          <td className="px-3 py-2 border-b text-gray-900 font-medium">{user.teams_count ?? 0}</td>
                          <td className="px-3 py-2 border-b space-x-2">
                            <button
                              className="px-2 py-1 text-blue-700 hover:underline"
                              onClick={async () => {
                                try {
                                  const detail = await reportsApi.getUserDetail(user.id);
                                  setSelectedUser(detail);
                                } catch (err) {
                                  console.error('Failed to load user detail', err);
                                }
                              }}
                            >
                              Details
                            </button>
                            <button
                              className="px-2 py-1 text-indigo-700 hover:underline"
                              onClick={async () => {
                                try {
                                  const detail = await reportsApi.getUserDetail(user.id);
                                  setSelectedUser(detail);
                                } catch (err) {
                                  console.error('Failed to load user detail', err);
                                }
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="px-2 py-1 text-red-700 hover:underline"
                              onClick={() => handleToggleSuspend(user)}
                            >
                              {user.suspended ? 'Activate' : 'Suspend'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card title="User Details / Edit">
                {selectedUser ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
                    <div className="space-y-3">
                      <label className="block">
                        <span className="text-gray-700 font-semibold">Name</span>
                        <input
                          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900"
                          value={selectedUser.nombre || ''}
                          onChange={(e) => setSelectedUser({ ...selectedUser, nombre: e.target.value })}
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700 font-semibold">Phone</span>
                        <input
                          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900"
                          value={selectedUser.telefono || ''}
                          onChange={(e) => setSelectedUser({ ...selectedUser, telefono: e.target.value })}
                        />
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedUser.is_admin}
                          onChange={(e) => setSelectedUser({ ...selectedUser, is_admin: e.target.checked })}
                        />
                        <span className="text-gray-700">Admin</span>
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!selectedUser.suspended}
                          onChange={(e) => setSelectedUser({ ...selectedUser, suspended: !e.target.checked })}
                        />
                        <span className="text-gray-700">Active</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={handleSaveUser}
                        >
                          Save
                        </button>
                        <button
                          className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                          onClick={async () => {
                            if (!selectedUser) return;
                            try {
                              const detail = await reportsApi.getUserDetail(selectedUser.id);
                              setSelectedUser(detail);
                            } catch (err) {
                              console.error('Failed to reload user', err);
                            }
                          }}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Teams</p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {selectedUser.teams.length === 0 ? (
                          <li>No teams</li>
                        ) : (
                          selectedUser.teams.map((t) => (
                            <li key={t.id}>{t.nombre} {t.zona ? `(${t.zona})` : ''} — {t.rol || 'member'}</li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">Select a user to view/edit details.</div>
                )}
              </Card>
            </div>
          )}

          {/* Teams Report */}
          {activeTab === 'teams' && teamsReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Teams Overview">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total Teams</span>
                      <span className="text-2xl font-bold text-blue-600">{teamsReport.total_teams.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">New (7d)</span>
                      <span className="text-xl font-semibold text-green-600">{teamsReport.new_teams_7d.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">New (30d)</span>
                      <span className="text-xl font-semibold text-indigo-600">{teamsReport.new_teams_30d.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
                <Card title="Roster Depth">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Avg Members / Team</span>
                      <span className="text-2xl font-bold text-purple-600">{parseFloat(teamsReport.avg_members_per_team).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Teams with 7+</span>
                      <span className="text-xl font-semibold text-blue-700">{teamsReport.teams_with_7_plus.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Teams with 11+</span>
                      <span className="text-xl font-semibold text-amber-600">{teamsReport.teams_with_11_plus.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
                <Card title="Insights">
                  <p className="text-sm text-gray-700">
                    Track growth and roster depth to identify regions or divisions needing outreach. Consider nudging teams below 7 players to recruit.
                  </p>
                </Card>
              </div>

              <Card title="Teams List">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={teamsSearch}
                      onChange={(e) => setTeamsSearch(e.target.value)}
                      placeholder="Search by team name"
                      className="border border-gray-300 rounded px-3 py-2"
                    />
                    <button
                      onClick={refreshTeamsList}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={teamsLoading}
                    >
                      {teamsLoading ? 'Loading...' : 'Search'}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">Name</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">Captain</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">Members</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">Zone</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">Level</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamsList.map((team) => (
                        <tr key={team.id} className={selectedTeam?.id === team.id ? 'bg-blue-50' : 'bg-white'}>
                          <td className="px-3 py-2 border-b text-gray-900">
                            <div className="font-semibold">{team.nombre}</div>
                            <div className="text-xs text-gray-600">Created: {new Date(team.created_at).toLocaleDateString()}</div>
                          </td>
                          <td className="px-3 py-2 border-b text-gray-900">
                            <div className="font-medium">{team.capitan_nombre || 'N/A'}</div>
                            <div className="text-xs text-gray-600">{team.capitan_email || ''}</div>
                          </td>
                          <td className="px-3 py-2 border-b text-gray-900 font-medium">{team.member_count ?? 0}</td>
                          <td className="px-3 py-2 border-b text-gray-900">{team.zona || '—'}</td>
                          <td className="px-3 py-2 border-b text-gray-900">{team.nivel || '—'}</td>
                          <td className="px-3 py-2 border-b space-x-2">
                            <button
                              className="px-2 py-1 text-blue-700 hover:underline"
                              onClick={async () => {
                                try {
                                  const detail = await reportsApi.getTeamDetail(team.id);
                                  setSelectedTeam(detail);
                                } catch (err) {
                                  console.error('Failed to load team detail', err);
                                }
                              }}
                            >
                              Details
                            </button>
                            <button
                              className="px-2 py-1 text-indigo-700 hover:underline"
                              onClick={async () => {
                                try {
                                  const detail = await reportsApi.getTeamDetail(team.id);
                                  setSelectedTeam(detail);
                                } catch (err) {
                                  console.error('Failed to load team detail', err);
                                }
                              }}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card title="Team Details / Edit">
                {selectedTeam ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
                    <div className="space-y-3">
                      <label className="block">
                        <span className="text-gray-700 font-semibold">Name</span>
                        <input
                          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900"
                          value={selectedTeam.nombre}
                          onChange={(e) => setSelectedTeam({ ...selectedTeam, nombre: e.target.value })}
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700 font-semibold">Zone</span>
                        <input
                          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900"
                          value={selectedTeam.zona || ''}
                          onChange={(e) => setSelectedTeam({ ...selectedTeam, zona: e.target.value })}
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700 font-semibold">Level</span>
                        <input
                          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900"
                          value={selectedTeam.nivel || ''}
                          onChange={(e) => setSelectedTeam({ ...selectedTeam, nivel: e.target.value })}
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={handleSaveTeam}
                        >
                          Save
                        </button>
                        <button
                          className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                          onClick={async () => {
                            if (!selectedTeam) return;
                            try {
                              const detail = await reportsApi.getTeamDetail(selectedTeam.id);
                              setSelectedTeam(detail);
                            } catch (err) {
                              console.error('Failed to reload team', err);
                            }
                          }}
                        >
                          Reset
                        </button>
                      </div>
                      <div className="border-t pt-3 space-y-2">
                        <p className="font-semibold text-gray-900">Add member</p>
                        {memberError && (
                          <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded px-3 py-2">
                            {memberError}
                          </div>
                        )}
                        <input
                          type="email"
                          placeholder="user email"
                          className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                        />
                        <select
                          className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900"
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value as 'member' | 'capitan')}
                        >
                          <option value="member">Member</option>
                          <option value="capitan">Captain</option>
                        </select>
                        <button
                          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          onClick={handleAddMember}
                        >
                          Add Member
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Members</p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {selectedTeam.members.length === 0 ? (
                          <li>No members</li>
                        ) : (
                          selectedTeam.members.map((m) => (
                            <li key={m.user_id} className="flex items-center justify-between">
                              <span>{m.nombre} ({m.email}) — {m.role}</span>
                              {m.user_id !== selectedTeam.capitan_id && (
                                <button
                                  className="text-red-600 text-xs hover:underline"
                                  onClick={() => handleRemoveMember(m.user_id)}
                                >
                                  Remove
                                </button>
                              )}
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">Select a team to view/edit details.</div>
                )}
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

              <Card className="mt-6" title="Scheduled Matches Calendar">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Month</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMonthChange(-1)}
                      className="p-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                      aria-label="Previous month"
                    >
                      ‹
                    </button>
                    <button
                      onClick={resetToCurrentMonth}
                      className="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => handleMonthChange(1)}
                      className="p-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                      aria-label="Next month"
                    >
                      ›
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-500 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-3">
                  {calendarCells.map((date, idx) => {
                    if (!date) {
                      return <div key={`empty-${idx}`} className="h-28 bg-gray-50 rounded border border-dashed border-gray-200" />;
                    }

                    const dateKey = date.toISOString().split('T')[0];
                    const events = eventsByDate[dateKey] || [];
                    const statusCounts = events.reduce(
                      (acc, event) => {
                        acc[event.booking_status] = (acc[event.booking_status] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>
                    );
                    const isToday = new Date().toDateString() === date.toDateString();
                    const isSelected = selectedDate === dateKey;

                    return (
                      <div
                        key={dateKey}
                        onClick={() => setSelectedDate(dateKey)}
                        className={`h-28 rounded border p-2 text-left overflow-hidden cursor-pointer transition ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 shadow-sm'
                            : isToday
                              ? 'border-blue-300 bg-blue-50'
                              : 'border-gray-200 bg-gray-50 hover:border-blue-200 hover:bg-white'
                        }`}
                      >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">{date.getDate()}</span>
                      <span
                        className={`min-w-[1.75rem] h-6 px-2 rounded-full text-[11px] font-semibold flex items-center justify-center ${
                          events.length > 0
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                        title={`${events.length} reservation${events.length === 1 ? '' : 's'}`}
                      >
                        {events.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {[
                        { label: 'accepted', count: (statusCounts.confirmed || 0) + (statusCounts.completed || 0) },
                        { label: 'cancelled', count: statusCounts.cancelled || 0 }
                      ].map(({ label, count }) => {
                        if (count === 0) return null;
                        const styles =
                          label === 'accepted'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-red-100 text-red-800 border-red-200';
                        return (
                          <span
                            key={label}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles}`}
                            title={`${count} ${label}`}
                          >
                            {label}: {count}
                          </span>
                        );
                      })}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-2">
                      {events.length === 0 ? 'No reservations' : 'Select this day to view details below'}
                    </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {selectedDate
                        ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                        : 'Select a day'}
                    </h4>
                    {selectedEvents.length > 0 && (
                      <span className="text-sm text-gray-600">{selectedEvents.length} reservation{selectedEvents.length > 1 ? 's' : ''}</span>
                    )}
                  </div>
                  {selectedEvents.length === 0 ? (
                    <div className="text-sm text-gray-600">No reservations scheduled on this day.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedEvents.map((event) => (
                        <button
                          key={event.booking_id}
                          onClick={() => loadBookingDetail(event)}
                          className={`text-left border rounded-lg p-3 bg-white shadow-sm hover:border-blue-300 hover:shadow transition ${
                            selectedBookingId === event.booking_id ? 'border-blue-500 ring-1 ring-blue-200' : ''
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatTime(event.hora_inicio)} - {formatTime(event.hora_fin)}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                event.booking_status === 'confirmed' || event.booking_status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : event.booking_status === 'pending' || event.booking_status === 'venue_requested'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : event.booking_status === 'cancelled'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {event.booking_status}
                            </span>
                          </div>
                          <div className="text-gray-900 font-medium">
                            {event.team1_name} vs {event.team2_name || 'TBD'}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Match: {event.match_status}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {event.venue_name ? `${event.venue_name}${event.venue_zone ? ` • ${event.venue_zone}` : ''}` : 'Venue TBC'}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <Card title="Match & Booking Details">
                    {detailLoading && (
                      <div className="text-sm text-gray-600">Loading details...</div>
                    )}
                    {!detailLoading && !selectedBookingDetail && !detailError && (
                      <div className="text-sm text-gray-600">Select a reservation to view details.</div>
                    )}
                    {detailError && (
                      <div className="text-sm text-red-600 mb-2">{detailError}</div>
                    )}
                    {!detailLoading && selectedBookingDetail && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Match</div>
                          <p>Status: <span className="font-medium">{selectedBookingDetail.match_status}</span></p>
                          <p>Teams: <span className="font-medium">{selectedBookingDetail.team1_name} vs {selectedBookingDetail.team2_name || 'TBD'}</span></p>
                          <p>Kickoff: <span className="font-medium">{selectedBookingDetail.fecha} {formatTime(selectedBookingDetail.hora_inicio)} - {formatTime(selectedBookingDetail.hora_fin)}</span></p>
                          <p>Zone/Court: <span className="font-medium">{selectedBookingDetail.match_zone || 'N/A'} {selectedBookingDetail.match_court ? `• ${selectedBookingDetail.match_court}` : ''}</span></p>
                          <p>Confirmations: <span className="font-medium">Team1 {selectedBookingDetail.team1_confirmed ? '✅' : '❌'} / Team2 {selectedBookingDetail.team2_confirmed ? '✅' : '❌'}</span></p>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Booking</div>
                          <p>Status: <span className="font-medium">{selectedBookingDetail.booking_status}</span></p>
                          <p>Duration: <span className="font-medium">{selectedBookingDetail.duracion_minutos} min</span></p>
                          <p>Venue: <span className="font-medium">{selectedBookingDetail.venue_name || 'TBC'}{selectedBookingDetail.venue_zone ? ` • ${selectedBookingDetail.venue_zone}` : ''}</span></p>
                          <p>Address: <span className="font-medium">{selectedBookingDetail.venue_address || 'N/A'}</span></p>
                          <p>Surface/Price: <span className="font-medium">{selectedBookingDetail.venue_surface || 'N/A'}{selectedBookingDetail.venue_price_hour ? ` • €${parseFloat(selectedBookingDetail.venue_price_hour).toFixed(2)}/h` : ''}</span></p>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Audit</div>
                          <p>Created by: <span className="font-medium">{selectedBookingDetail.created_by_name || 'N/A'}</span> ({selectedBookingDetail.created_by_email || 'N/A'})</p>
                          <p>Created at: <span className="font-medium">{new Date(selectedBookingDetail.created_at).toLocaleString()}</span></p>
                          <p>Updated at: <span className="font-medium">{new Date(selectedBookingDetail.updated_at).toLocaleString()}</span></p>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Notes</div>
                          <p className="text-gray-700">{selectedBookingDetail.notas || 'No notes'}</p>
                          {selectedBookingDetail.requisitos_especiales && (
                            <p className="text-gray-700 mt-1">Requirements: {selectedBookingDetail.requisitos_especiales}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>

              </Card>
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

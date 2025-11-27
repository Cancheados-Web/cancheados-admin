import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi } from '../lib/api';
import type { Team, TeamFilters } from '../lib/types/teams';
import { getTeamStatus, TEAM_STATUS_CONFIG } from '../lib/types/teams';
import { Table } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import Badge from '../components/common/Badge';

export default function TeamsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TeamFilters>({
    limit: 50,
    offset: 0,
  });
  const [actionModal, setActionModal] = useState<{
    type: 'suspend' | 'activate' | null;
    team: Team | null;
  }>({ type: null, team: null });
  const [actionReason, setActionReason] = useState('');

  // Fetch teams
  const { data: teamsData, isLoading } = useQuery({
    queryKey: ['teams', filters],
    queryFn: () => teamsApi.getTeams(filters),
  });

  // Mutations
  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      teamsApi.suspendTeam(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setActionModal({ type: null, team: null });
      setActionReason('');
      alert('Team suspended successfully');
    },
    onError: (error: any) => {
      alert(`Failed to suspend team: ${error.message}`);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => teamsApi.activateTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setActionModal({ type: null, team: null });
      alert('Team activated successfully');
    },
    onError: (error: any) => {
      alert(`Failed to activate team: ${error.message}`);
    },
  });

  const handleAction = () => {
    if (!actionModal.team || !actionModal.type) return;

    if (actionModal.type === 'suspend') {
      if (!actionReason.trim()) {
        alert('Please provide a reason for suspension');
        return;
      }
      suspendMutation.mutate({ id: actionModal.team.id, reason: actionReason });
    } else if (actionModal.type === 'activate') {
      activateMutation.mutate(actionModal.team.id);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      offset: (newPage - 1) * (prev.limit || 50),
    }));
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (team: Team) => (
        <span className="font-mono text-xs">{team.id.substring(0, 8)}...</span>
      ),
    },
    {
      key: 'nombre',
      header: 'Team Name',
      render: (team: Team) => (
        <div>
          <div className="font-medium">{team.nombre}</div>
          <div className="text-sm text-gray-500">Zone: {team.zona}</div>
        </div>
      ),
    },
    {
      key: 'capitan',
      header: 'Captain',
      render: (team: Team) => (
        <div>
          <div className="font-medium">{team.capitan.nombre}</div>
          <div className="text-sm text-gray-500">{team.capitan.email}</div>
        </div>
      ),
    },
    {
      key: 'members_count',
      header: 'Members',
      render: (team: Team) => (
        <span className="font-semibold">{team.members_count || 0}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (team: Team) => {
        const status = getTeamStatus(team);
        const config = TEAM_STATUS_CONFIG[status];
        return <Badge color={config.color}>{config.label}</Badge>;
      },
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (team: Team) => new Date(team.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (team: Team) => {
        const status = getTeamStatus(team);
        return (
          <div className="flex gap-2">
            {status === 'active' && (
              <button
                onClick={() => setActionModal({ type: 'suspend', team })}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Suspend
              </button>
            )}
            {status === 'suspended' && (
              <button
                onClick={() => setActionModal({ type: 'activate', team })}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Activate
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const currentPage = Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1;
  const totalPages = Math.ceil((teamsData?.total || 0) / (filters.limit || 50));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Teams Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Team name..."
              value={filters.search || ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value, offset: 0 }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zone
            </label>
            <select
              value={filters.zona || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  zona: e.target.value || undefined,
                  offset: 0,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Zones</option>
              <option value="Norte">Norte</option>
              <option value="Sur">Sur</option>
              <option value="Este">Este</option>
              <option value="Oeste">Oeste</option>
              <option value="Centro">Centro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.suspended === undefined ? '' : filters.suspended.toString()}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  suspended: e.target.value === '' ? undefined : e.target.value === 'true',
                  offset: 0,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Teams</option>
              <option value="false">Active Only</option>
              <option value="true">Suspended Only</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ limit: 50, offset: 0 })}
              className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading teams...</div>
        ) : (
          <>
            <Table columns={columns} data={teamsData?.teams || []} />
            {totalPages > 1 && (
              <div className="p-4 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Modal */}
      {actionModal.type && actionModal.team && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {actionModal.type === 'suspend' && 'Suspend Team'}
              {actionModal.type === 'activate' && 'Activate Team'}
            </h3>
            <p className="text-gray-600 mb-4">
              {actionModal.type === 'suspend' &&
                `Are you sure you want to suspend ${actionModal.team.nombre}?`}
              {actionModal.type === 'activate' &&
                `Are you sure you want to activate ${actionModal.team.nombre}?`}
            </p>
            {actionModal.type === 'suspend' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter reason..."
                />
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setActionModal({ type: null, team: null });
                  setActionReason('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={suspendMutation.isPending || activateMutation.isPending}
                className={`px-4 py-2 text-white rounded-md ${
                  actionModal.type === 'suspend'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-green-600 hover:bg-green-700'
                } disabled:opacity-50`}
              >
                {suspendMutation.isPending || activateMutation.isPending
                  ? 'Processing...'
                  : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
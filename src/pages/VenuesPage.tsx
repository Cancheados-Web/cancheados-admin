import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { venuesApi } from '../lib/api/venues';
import type { Venue, VenueFilters } from '../lib/types/venues';
import { getVenueStatus, VENUE_STATUS_CONFIG } from '../lib/types/venues';
import { Table } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import Badge from '../components/common/Badge';

export default function VenuesPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<VenueFilters>({
    limit: 50,
    offset: 0,
  });
  const [actionModal, setActionModal] = useState<{
    type: 'verify' | 'suspend' | 'activate' | null;
    venue: Venue | null;
  }>({ type: null, venue: null });
  const [actionInput, setActionInput] = useState('');

  // Fetch venues
  const { data: venuesData, isLoading } = useQuery({
    queryKey: ['venues', filters],
    queryFn: () => venuesApi.getVenues(filters),
  });

  // Mutations
  const verifyMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      venuesApi.verifyVenue(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      setActionModal({ type: null, venue: null });
      setActionInput('');
      alert('Venue verified successfully');
    },
    onError: (error: any) => {
      alert(`Failed to verify venue: ${error.message}`);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      venuesApi.suspendVenue(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      setActionModal({ type: null, venue: null });
      setActionInput('');
      alert('Venue suspended successfully');
    },
    onError: (error: any) => {
      alert(`Failed to suspend venue: ${error.message}`);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => venuesApi.activateVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      setActionModal({ type: null, venue: null });
      alert('Venue activated successfully');
    },
    onError: (error: any) => {
      alert(`Failed to activate venue: ${error.message}`);
    },
  });

  const handleAction = () => {
    if (!actionModal.venue || !actionModal.type) return;

    if (actionModal.type === 'verify') {
      verifyMutation.mutate({ id: actionModal.venue.id, notes: actionInput || undefined });
    } else if (actionModal.type === 'suspend') {
      if (!actionInput.trim()) {
        alert('Please provide a reason for suspension');
        return;
      }
      suspendMutation.mutate({ id: actionModal.venue.id, reason: actionInput });
    } else if (actionModal.type === 'activate') {
      activateMutation.mutate(actionModal.venue.id);
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
      render: (venue: Venue) => (
        <span className="font-mono text-xs">{venue.id.substring(0, 8)}...</span>
      ),
    },
    {
      key: 'nombre',
      header: 'Venue Name',
      render: (venue: Venue) => (
        <div>
          <div className="font-medium">{venue.nombre}</div>
          <div className="text-sm text-gray-500">{venue.direccion}</div>
          <div className="text-xs text-gray-400">Zone: {venue.zona}</div>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (venue: Venue) => (
        <div>
          <div className="font-medium">{venue.owner.nombre}</div>
          <div className="text-sm text-gray-500">{venue.owner.email}</div>
        </div>
      ),
    },
    {
      key: 'stats',
      header: 'Stats',
      render: (venue: Venue) => (
        <div>
          <div className="text-sm">
            {venue.avg_rating ? (
              <span className="font-semibold">⭐ {venue.avg_rating.toFixed(1)}</span>
            ) : (
              <span className="text-gray-400">No ratings</span>
            )}
          </div>
          <div className="text-xs text-gray-500">{venue.review_count} reviews</div>
        </div>
      ),
    },
    {
      key: 'amenities',
      header: 'Amenities',
      render: (venue: Venue) => (
        <div className="flex gap-1 text-xs">
          {venue.techada && <span title="Covered">🏠</span>}
          {venue.iluminacion && <span title="Lighting">💡</span>}
          {venue.vestuarios && <span title="Locker rooms">🚿</span>}
          {venue.estacionamiento && <span title="Parking">🅿️</span>}
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      render: (venue: Venue) => (
        <div className="text-xs">
          <div>Capacity: {venue.capacidad}</div>
          <div>${venue.precio_por_hora}/hr</div>
          <div className="text-gray-500">{venue.tipo_superficie}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (venue: Venue) => {
        const status = getVenueStatus(venue);
        const config = VENUE_STATUS_CONFIG[status];
        return <Badge color={config.color}>{config.label}</Badge>;
      },
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (venue: Venue) => new Date(venue.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (venue: Venue) => {
        const status = getVenueStatus(venue);
        return (
          <div className="flex gap-2">
            {status === 'unverified' && (
              <button
                onClick={() => setActionModal({ type: 'verify', venue })}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Verify
              </button>
            )}
            {(status === 'verified' || status === 'unverified') && (
              <button
                onClick={() => setActionModal({ type: 'suspend', venue })}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Suspend
              </button>
            )}
            {status === 'suspended' && (
              <button
                onClick={() => setActionModal({ type: 'activate', venue })}
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
  const totalPages = Math.ceil((venuesData?.total || 0) / (filters.limit || 50));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Venues Management</h1>
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
              placeholder="Venue name..."
              value={filters.search || ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value, offset: 0 }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification
            </label>
            <select
              value={filters.verified === undefined ? '' : filters.verified.toString()}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  verified: e.target.value === '' ? undefined : e.target.value === 'true',
                  offset: 0,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Venues</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
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
              <option value="">All Venues</option>
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

      {/* Venues Table */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading venues...</div>
        ) : (
          <>
            <Table columns={columns} data={venuesData?.venues || []} />
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
      {actionModal.type && actionModal.venue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {actionModal.type === 'verify' && 'Verify Venue'}
              {actionModal.type === 'suspend' && 'Suspend Venue'}
              {actionModal.type === 'activate' && 'Activate Venue'}
            </h3>
            <p className="text-gray-600 mb-4">
              {actionModal.type === 'verify' &&
                `Are you sure you want to verify ${actionModal.venue.nombre}?`}
              {actionModal.type === 'suspend' &&
                `Are you sure you want to suspend ${actionModal.venue.nombre}?`}
              {actionModal.type === 'activate' &&
                `Are you sure you want to activate ${actionModal.venue.nombre}?`}
            </p>
            {(actionModal.type === 'verify' || actionModal.type === 'suspend') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {actionModal.type === 'verify' ? 'Notes (optional)' : 'Reason *'}
                </label>
                <textarea
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder={actionModal.type === 'verify' ? 'Add notes...' : 'Enter reason...'}
                />
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setActionModal({ type: null, venue: null });
                  setActionInput('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={verifyMutation.isPending || suspendMutation.isPending || activateMutation.isPending}
                className={`px-4 py-2 text-white rounded-md ${
                  actionModal.type === 'verify'
                    ? 'bg-green-600 hover:bg-green-700'
                    : actionModal.type === 'suspend'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } disabled:opacity-50`}
              >
                {verifyMutation.isPending || suspendMutation.isPending || activateMutation.isPending
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
import { useState, useEffect } from 'react';
import { auditLogsApi } from '../lib/api/auditLogs';
import type { AuditLog, AuditLogFilters } from '../lib/api/auditLogs';
import AuditLogDetailModal from '../components/auditLogs/AuditLogDetailModal';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filters, setFilters] = useState<AuditLogFilters>({
    limit: 50,
    offset: 0
  });

  useEffect(() => {
    loadAuditLogs();
  }, [filters.offset, filters.limit]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await auditLogsApi.list(filters);
      setLogs(response.logs);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<AuditLogFilters>) => {
    setFilters({ ...filters, ...newFilters, offset: 0 });
  };

  const handleApplyFilters = () => {
    loadAuditLogs();
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, offset: (page - 1) * (filters.limit || 50) });
  };

  const currentPage = Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1;
  const totalPages = Math.ceil(total / (filters.limit || 50));

  const getEntityTypeBadgeColor = (type: string) => {
    const colors: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'> = {
      user: 'blue',
      team: 'green',
      venue: 'yellow',
      booking: 'purple',
      match: 'blue',
      dispute: 'red',
      payment: 'green',
      other: 'gray'
    };
    return colors[type] || 'gray';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <button
          onClick={loadAuditLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <Card title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="audit-entity-type" className="block text-sm font-medium text-gray-700 mb-1">
              Entity Type
            </label>
            <select
              id="audit-entity-type"
              value={filters.entity_type || ''}
              onChange={(e) => handleFilterChange({ entity_type: e.target.value || undefined })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="user">User</option>
              <option value="team">Team</option>
              <option value="venue">Venue</option>
              <option value="booking">Booking</option>
              <option value="match">Match</option>
              <option value="dispute">Dispute</option>
              <option value="payment">Payment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="audit-action" className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <input
              id="audit-action"
              type="text"
              placeholder="Filter by action..."
              value={filters.action || ''}
              onChange={(e) => handleFilterChange({ action: e.target.value || undefined })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin ID
            </label>
            <input
              type="text"
              placeholder="Filter by admin ID..."
              value={filters.admin_id || ''}
              onChange={(e) => handleFilterChange({ admin_id: e.target.value || undefined })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {(filters.entity_type || filters.action || filters.admin_id) && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.entity_type && (
              <Badge variant="blue">
                Type: {filters.entity_type}
                <button
                  onClick={() => handleFilterChange({ entity_type: undefined })}
                  className="ml-1 hover:text-blue-800"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.action && (
              <Badge variant="blue">
                Action: {filters.action}
                <button
                  onClick={() => handleFilterChange({ action: undefined })}
                  className="ml-1 hover:text-blue-800"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.admin_id && (
              <Badge variant="blue">
                Admin: {filters.admin_id}
                <button
                  onClick={() => handleFilterChange({ admin_id: undefined })}
                  className="ml-1 hover:text-blue-800"
                >
                  ×
                </button>
              </Badge>
            )}
            <button
              onClick={() => setFilters({ limit: 50, offset: 0 })}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all
            </button>
          </div>
        )}
      </Card>

      {/* Results */}
      <div className="mt-6">
        <Card title={`Audit Logs (${total} total)`}>
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No audit logs found
            </div>
          ) : (
            <>
              <Table
                columns={[
                  {
                    key: 'created_at',
                    header: 'Timestamp',
                    render: (log: AuditLog) => (
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    )
                  },
                  {
                    key: 'admin',
                    header: 'Admin',
                    render: (log: AuditLog) => (
                      <div>
                        <div className="font-medium">{log.admin.nombre}</div>
                        <div className="text-gray-500 text-xs">{log.admin.email}</div>
                      </div>
                    )
                  },
                  {
                    key: 'action',
                    header: 'Action',
                    render: (log: AuditLog) => (
                      <Badge variant="blue">{log.action}</Badge>
                    )
                  },
                  {
                    key: 'entity_type',
                    header: 'Entity Type',
                    render: (log: AuditLog) => (
                      <Badge variant={getEntityTypeBadgeColor(log.entity_type)}>
                        {log.entity_type}
                      </Badge>
                    )
                  },
                  {
                    key: 'entity_id',
                    header: 'Entity ID',
                    render: (log: AuditLog) => (
                      <span className="font-mono text-gray-500">
                        {log.entity_id.slice(0, 8)}...
                      </span>
                    )
                  },
                  {
                    key: 'actions',
                    header: 'Actions',
                    render: (log: AuditLog) => (
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View Details
                      </button>
                    )
                  }
                ]}
                data={logs}
                emptyMessage="No audit logs found"
              />

              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Detail Modal */}
      <AuditLogDetailModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}

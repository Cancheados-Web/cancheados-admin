import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, type TableColumn } from '../common';
import { DisputeStatusBadge } from './DisputeStatusBadge';
import type { Dispute, DisputePriority } from '../../lib/types/disputes';
import { DISPUTE_TYPE_CONFIG, DISPUTE_PRIORITY_CONFIG } from '../../lib/types/disputes';

/**
 * DisputeList Component
 * 
 * Displays a list of disputes in a table format with sorting
 */

export interface DisputeListProps {
  disputes: Dispute[];
  loading?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

export function DisputeList({
  disputes,
  loading = false,
  onSort,
  sortKey,
  sortDirection,
}: DisputeListProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityBadge = (priority: DisputePriority | null) => {
    if (!priority) return <span className="text-gray-400">-</span>;
    
    const config = DISPUTE_PRIORITY_CONFIG[priority];
    const colorClasses = {
      gray: 'bg-gray-100 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[config.color]}`}>
        {config.label}
      </span>
    );
  };

  const columns: TableColumn<Dispute>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      width: '100px',
      render: (dispute) => (
        <span className="font-mono text-xs text-gray-900">
          #{dispute.id.toString().slice(0, 8)}...
        </span>
      ),
    },
    {
      key: 'dispute_type',
      header: 'Type',
      sortable: true,
      width: '120px',
      render: (dispute) => (
        <span className="text-sm text-gray-900">
          {DISPUTE_TYPE_CONFIG[dispute.dispute_type].label}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: '130px',
      render: (dispute) => <DisputeStatusBadge status={dispute.status} />,
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      width: '100px',
      render: (dispute) => getPriorityBadge(dispute.priority),
    },
    {
      key: 'reporter',
      header: 'Reporter',
      render: (dispute) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {dispute.reporter?.name || 'Unknown'}
          </div>
          <div className="text-gray-500">{dispute.reporter?.email}</div>
        </div>
      ),
    },
    {
      key: 'reported',
      header: 'Reported',
      render: (dispute) => {
        if (dispute.reported_user) {
          return (
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {dispute.reported_user.name}
              </div>
              <div className="text-gray-500">{dispute.reported_user.email}</div>
            </div>
          );
        }
        if (dispute.reported_team) {
          return (
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                Team: {dispute.reported_team.name}
              </div>
            </div>
          );
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (dispute) => (
        <span className="text-sm text-gray-500">
          {formatDate(dispute.created_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '130px',
      render: (dispute) => (
        <button
          onClick={() => navigate(`/disputes/${dispute.id}`)}
          className="text-blue-600 hover:text-blue-900 text-sm font-medium whitespace-nowrap"
        >
          View Details →
        </button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={disputes}
      loading={loading}
      emptyMessage="No disputes found"
      onSort={onSort}
      sortKey={sortKey}
      sortDirection={sortDirection}
    />
  );
}

export default DisputeList;
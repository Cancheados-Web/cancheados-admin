import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DisputeFilters } from '../components/disputes/DisputeFilters';
import { DisputeList } from '../components/disputes/DisputeList';
import { Pagination } from '../components/common';
import { getDisputesPending, getDisputesResolved, disputeKeys } from '../lib/api/disputes';
import type { DisputeQueryParams } from '../lib/types/disputes';

/**
 * DisputesPage Component
 * 
 * Main page for viewing and managing disputes with tabs for pending and resolved
 */

type TabType = 'pending' | 'resolved';

export function DisputesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [filters, setFilters] = useState<DisputeQueryParams>({
    page: 1,
    limit: 20,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  // Fetch pending disputes
  const {
    data: pendingData,
    isLoading: pendingLoading,
    error: pendingError,
  } = useQuery({
    queryKey: disputeKeys.pending(filters),
    queryFn: () => getDisputesPending(filters),
    enabled: activeTab === 'pending',
  });

  // Fetch resolved disputes
  const {
    data: resolvedData,
    isLoading: resolvedLoading,
    error: resolvedError,
  } = useQuery({
    queryKey: disputeKeys.resolved(filters),
    queryFn: () => getDisputesResolved(filters),
    enabled: activeTab === 'resolved',
  });

  const activeData = activeTab === 'pending' ? pendingData : resolvedData;
  const isLoading = activeTab === 'pending' ? pendingLoading : resolvedLoading;
  const error = activeTab === 'pending' ? pendingError : resolvedError;

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.type) count++;
    if (filters.priority) count++;
    if (filters.search) count++;
    if (filters.date_from) count++;
    if (filters.date_to) count++;
    return count;
  }, [filters]);

  const handleFiltersChange = (newFilters: DisputeQueryParams) => {
    setFilters({
      ...newFilters,
      page: 1, // Reset to first page when filters change
    });
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setFilters({
      ...filters,
      sort_by: key as any,
      sort_order: direction,
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters({
      ...filters,
      page,
    });
  };

  const handleItemsPerPageChange = (limit: number) => {
    setFilters({
      ...filters,
      limit,
      page: 1,
    });
  };

  const tabs = [
    {
      id: 'pending' as TabType,
      label: 'Pending',
      count: pendingData?.pagination.total,
    },
    {
      id: 'resolved' as TabType,
      label: 'Resolved',
      count: resolvedData?.pagination.total,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Disputes Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and resolve disputes reported by users
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                      isActive
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters */}
      <DisputeFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading disputes</h3>
              <p className="mt-1 text-sm text-red-700">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Disputes List */}
      <DisputeList
        disputes={activeData?.disputes || []}
        loading={isLoading}
        onSort={handleSort}
        sortKey={filters.sort_by}
        sortDirection={filters.sort_order}
      />

      {/* Pagination */}
      {activeData && activeData.pagination.total > 0 && (
        <Pagination
          currentPage={activeData.pagination.page}
          totalPages={activeData.pagination.totalPages}
          totalItems={activeData.pagination.total}
          itemsPerPage={activeData.pagination.limit}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          itemsPerPageOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  );
}

export default DisputesPage;
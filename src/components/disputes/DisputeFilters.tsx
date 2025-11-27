import React from 'react';
import { FilterBar, FilterSelect, FilterSearch, FilterDateRange } from '../common';
import type { DisputeQueryParams, DisputeStatus, DisputeType, DisputePriority } from '../../lib/types/disputes';

/**
 * DisputeFilters Component
 * 
 * Provides filtering controls for the disputes list
 */

export interface DisputeFiltersProps {
  filters: DisputeQueryParams;
  onFiltersChange: (filters: DisputeQueryParams) => void;
  activeFiltersCount: number;
}

export function DisputeFilters({ filters, onFiltersChange, activeFiltersCount }: DisputeFiltersProps) {
  const handleFilterChange = (key: keyof DisputeQueryParams, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit,
    });
  };

  const statusOptions: Array<{ value: DisputeStatus; label: string }> = [
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'info_requested', label: 'Info Requested' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  const typeOptions: Array<{ value: DisputeType; label: string }> = [
    { value: 'match_result', label: 'Match Result' },
    { value: 'player_conduct', label: 'Player Conduct' },
    { value: 'venue_issue', label: 'Venue Issue' },
    { value: 'payment', label: 'Payment' },
    { value: 'other', label: 'Other' },
  ];

  const priorityOptions: Array<{ value: DisputePriority; label: string }> = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  return (
    <FilterBar onClearFilters={handleClearFilters} activeFiltersCount={activeFiltersCount}>
      <FilterSearch
        value={filters.search || ''}
        onChange={(value) => handleFilterChange('search', value)}
        placeholder="Search disputes..."
        className="flex-1 min-w-[250px]"
      />

      <FilterSelect
        label="Status"
        value={(filters.status as string) || ''}
        onChange={(value) => handleFilterChange('status', value as DisputeStatus)}
        options={statusOptions}
        placeholder="All Statuses"
      />

      <FilterSelect
        label="Type"
        value={(filters.type as string) || ''}
        onChange={(value) => handleFilterChange('type', value as DisputeType)}
        options={typeOptions}
        placeholder="All Types"
      />

      <FilterSelect
        label="Priority"
        value={(filters.priority as string) || ''}
        onChange={(value) => handleFilterChange('priority', value as DisputePriority)}
        options={priorityOptions}
        placeholder="All Priorities"
      />

      <FilterDateRange
        label="Date Range"
        startDate={filters.date_from || ''}
        endDate={filters.date_to || ''}
        onStartDateChange={(value) => handleFilterChange('date_from', value)}
        onEndDateChange={(value) => handleFilterChange('date_to', value)}
      />
    </FilterBar>
  );
}

export default DisputeFilters;
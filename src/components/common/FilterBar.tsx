import React from 'react';

/**
 * FilterBar Component
 * 
 * A reusable filter bar component that displays active filters,
 * provides clear filters functionality, and supports responsive layout.
 */

export interface FilterBarProps {
  children: React.ReactNode;
  onClearFilters?: () => void;
  activeFiltersCount?: number;
  className?: string;
}

export function FilterBar({
  children,
  onClearFilters,
  activeFiltersCount = 0,
  className = '',
}: FilterBarProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Filter controls */}
        <div className="flex-1 flex flex-wrap items-center gap-3">
          {children}
        </div>

        {/* Clear filters button */}
        {onClearFilters && activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * FilterSelect Component
 * 
 * A select dropdown for use within FilterBar
 */
export interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'All',
  className = '',
}: FilterSelectProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
        {label}:
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full sm:w-auto rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * FilterSearch Component
 * 
 * A search input for use within FilterBar
 */
export interface FilterSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function FilterSearch({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}: FilterSearchProps) {
  return (
    <div className={`relative flex-1 min-w-[200px] ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * FilterDateRange Component
 * 
 * A date range picker for use within FilterBar
 */
export interface FilterDateRangeProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  label?: string;
  className?: string;
}

export function FilterDateRange({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  label = 'Date Range',
  className = '',
}: FilterDateRangeProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
        {label}:
      </label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="block rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500"
      />
      <span className="text-gray-500">to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        min={startDate}
        className="block rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  );
}

export default FilterBar;
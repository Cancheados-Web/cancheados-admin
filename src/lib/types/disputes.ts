/**
 * Disputes Type Definitions
 * 
 * Complete TypeScript types for the disputes management system.
 * These types match the backend API contracts and database schema.
 */

// ============================================================================
// Core Dispute Types
// ============================================================================

/**
 * Dispute status enum
 */
export type DisputeStatus =
  | 'pending'           // Initial state when dispute is created
  | 'under_review'      // Admin has started reviewing
  | 'awaiting_info'     // Admin requested additional information
  | 'resolved'          // Dispute has been resolved
  | 'closed'            // Dispute is closed (no further action)
  | 'escalated';        // Dispute has been escalated

/**
 * Dispute type enum
 */
export type DisputeType =
  | 'no_show'           // Team/player didn't show up
  | 'payment_issue'     // Dispute about payment issues
  | 'venue_issue'       // Dispute about venue problems
  | 'behavior'          // Dispute about player/team behavior
  | 'cancellation'      // Dispute about cancellations
  | 'other';            // Other types of disputes

/**
 * Dispute priority enum (set by admin)
 */
export type DisputePriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

/**
 * Dispute resolution outcome
 */
export type DisputeResolutionOutcome = 
  | 'favor_reporter'    // Resolved in favor of the reporter
  | 'favor_reported'    // Resolved in favor of the reported party
  | 'no_action'         // No action taken
  | 'both_warned'       // Both parties warned
  | 'other';            // Other outcome

/**
 * Main Dispute entity
 */
export interface Dispute {
  id: string;
  match_id: string | null;
  reporter_id: string | null;
  reported_user_id: string | null;
  reported_team_id: string | null;
  dispute_type: DisputeType;
  status: DisputeStatus;
  priority: DisputePriority | null;
  description: string;
  admin_notes: string | null;
  resolution: string | null;
  resolution_outcome?: DisputeResolutionOutcome | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Populated relations (when included in response)
  reporter?: {
    id: string;
    name?: string;
    nombre?: string;
    email: string;
  };
  reported_user?: {
    id: string;
    name?: string;
    nombre?: string;
    email: string;
  } | null;
  reported_team?: {
    id: string;
    name?: string;
  } | null;
  match?: {
    id: string;
    date: string;
    venue_name: string;
  };
  resolver?: {
    id: string;
    name?: string;
    nombre?: string;
    email: string;
  } | null;
}

/**
 * Dispute evidence/attachment
 */
export interface DisputeEvidence {
  id: string;
  dispute_id: string;
  file_url: string;
  file_type?: string;
  uploaded_by: string;
  uploaded_at?: string;
  
  // Populated relations
  uploader?: {
    id: string;
    name?: string;
    nombre?: string;
  };
}

/**
 * Dispute comment/activity
 */
export interface DisputeComment {
  id: string;
  dispute_id: string;
  user_id: string | null;
  comment: string;
  is_internal: boolean;
  created_at: string;
  display_name?: string;
  
  // Populated relations
  user?: {
    id: string;
    name?: string;
    nombre?: string;
    email: string;
    is_admin: boolean;
  };
}

// ============================================================================
// API Request Types
// ============================================================================

/**
 * Request body for reviewing a dispute
 */
export interface ReviewDisputeRequest {
  admin_notes: string;
  priority: DisputePriority;
}

/**
 * Request body for resolving a dispute
 */
export interface ResolveDisputeRequest {
  resolution: string;
  resolution_outcome: DisputeResolutionOutcome;
  admin_notes?: string;
}

/**
 * Request body for requesting additional information
 */
export interface RequestDisputeInfoRequest {
  message: string;
  requested_from: 'reporter' | 'reported' | 'both';
}

// Type aliases for consistency (both naming conventions supported)
export type DisputeReviewRequest = ReviewDisputeRequest;
export type DisputeResolutionRequest = ResolveDisputeRequest;
export type DisputeRequestInfoRequest = RequestDisputeInfoRequest;

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Paginated disputes list response
 */
export interface DisputesListResponse {
  disputes: Dispute[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Single dispute detail response
 */
export interface DisputeDetailResponse {
  dispute: Dispute;
  evidence: DisputeEvidence[];
  comments: DisputeComment[];
}

/**
 * Generic success response
 */
export interface DisputeActionResponse {
  success: boolean;
  message: string;
  dispute: Dispute;
}

// ============================================================================
// Filter and Query Types
// ============================================================================

/**
 * Filters for disputes list
 */
export interface DisputeFilters {
  status?: DisputeStatus | DisputeStatus[];
  type?: DisputeType | DisputeType[];
  priority?: DisputePriority | DisputePriority[];
  reporter_id?: number;
  reported_user_id?: number;
  reported_team_id?: number;
  match_id?: number;
  resolved_by?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Sort parameters
 */
export interface SortParams {
  sort_by?: 'created_at' | 'updated_at' | 'priority' | 'status';
  sort_order?: 'asc' | 'desc';
}

/**
 * Complete query parameters for disputes list
 */
export interface DisputeQueryParams extends DisputeFilters, PaginationParams, SortParams {}

// ============================================================================
// Form Data Types
// ============================================================================

/**
 * Form data for dispute review
 */
export interface DisputeReviewFormData {
  admin_notes: string;
  priority: DisputePriority;
}

/**
 * Form data for dispute resolution
 */
export interface DisputeResolutionFormData {
  resolution: string;
  resolution_outcome: DisputeResolutionOutcome;
  admin_notes?: string;
}

/**
 * Form data for requesting info
 */
export interface DisputeRequestInfoFormData {
  message: string;
  requested_from: 'reporter' | 'reported' | 'both';
}

// ============================================================================
// UI Helper Types
// ============================================================================

/**
 * Dispute status display configuration
 */
export interface DisputeStatusConfig {
  label: string;
  color: 'gray' | 'blue' | 'yellow' | 'green' | 'red';
  icon?: string;
}

/**
 * Dispute type display configuration
 */
export interface DisputeTypeConfig {
  label: string;
  icon?: string;
}

/**
 * Dispute priority display configuration
 */
export interface DisputePriorityConfig {
  label: string;
  color: 'gray' | 'blue' | 'yellow' | 'red';
}

/**
 * Tab configuration for disputes page
 */
export interface DisputeTab {
  id: 'pending' | 'resolved';
  label: string;
  count?: number;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Status display configurations
 */
export const DISPUTE_STATUS_CONFIG: Record<DisputeStatus, DisputeStatusConfig> = {
  pending: {
    label: 'Pending',
    color: 'yellow',
  },
  under_review: {
    label: 'Under Review',
    color: 'blue',
  },
  awaiting_info: {
    label: 'Awaiting Info',
    color: 'yellow',
  },
  resolved: {
    label: 'Resolved',
    color: 'green',
  },
  closed: {
    label: 'Closed',
    color: 'gray',
  },
  escalated: {
    label: 'Escalated',
    color: 'red',
  },
};

/**
 * Type display configurations
 */
export const DISPUTE_TYPE_CONFIG: Record<DisputeType, DisputeTypeConfig> = {
  no_show: {
    label: 'No Show',
  },
  payment_issue: {
    label: 'Payment Issue',
  },
  venue_issue: {
    label: 'Venue Issue',
  },
  behavior: {
    label: 'Behavior',
  },
  cancellation: {
    label: 'Cancellation',
  },
  other: {
    label: 'Other',
  },
};

/**
 * Priority display configurations
 */
export const DISPUTE_PRIORITY_CONFIG: Record<DisputePriority, DisputePriorityConfig> = {
  low: {
    label: 'Low',
    color: 'gray',
  },
  medium: {
    label: 'Medium',
    color: 'blue',
  },
  high: {
    label: 'High',
    color: 'yellow',
  },
  urgent: {
    label: 'Urgent',
    color: 'red',
  },
};

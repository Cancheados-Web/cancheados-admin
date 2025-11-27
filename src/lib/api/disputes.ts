/**
 * Disputes API Client
 * 
 * API client functions for disputes management.
 * All functions use the configured axios instance with authentication.
 */

import { apiClient } from '../api';
import type {
  Dispute,
  DisputesListResponse,
  DisputeDetailResponse,
  DisputeActionResponse,
  DisputeQueryParams,
  ReviewDisputeRequest,
  ResolveDisputeRequest,
  RequestDisputeInfoRequest,
  DisputeEvidence,
  DisputeComment,
} from '../types/disputes';

// ============================================================================
// Query Functions (GET requests)
// ============================================================================

/**
 * Get pending disputes with optional filters
 * 
 * @param params - Query parameters for filtering, pagination, and sorting
 * @returns Paginated list of pending disputes
 * 
 * @example
 * ```ts
 * const { disputes, pagination } = await getDisputesPending({
 *   priority: 'high',
 *   page: 1,
 *   limit: 20
 * });
 * ```
 */
export async function getDisputesPending(
  params?: DisputeQueryParams
): Promise<DisputesListResponse> {
  const response = await apiClient.get<{ disputes: Dispute[]; total: number }>(
    '/api/admin/disputes/pending',
    { params }
  );
  
  // Transform backend response to match expected format
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const total = response.data.total;
  const totalPages = Math.ceil(total / limit);
  
  return {
    disputes: response.data.disputes,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/**
 * Get resolved disputes with optional filters
 * 
 * @param params - Query parameters for filtering, pagination, and sorting
 * @returns Paginated list of resolved disputes
 * 
 * @example
 * ```ts
 * const { disputes, pagination } = await getDisputesResolved({
 *   date_from: '2024-01-01',
 *   page: 1,
 *   limit: 20
 * });
 * ```
 */
export async function getDisputesResolved(
  params?: DisputeQueryParams
): Promise<DisputesListResponse> {
  const response = await apiClient.get<{ disputes: Dispute[]; total: number }>(
    '/api/admin/disputes/resolved',
    { params }
  );
  
  // Transform backend response to match expected format
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const total = response.data.total;
  const totalPages = Math.ceil(total / limit);
  
  return {
    disputes: response.data.disputes,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/**
 * Get a single dispute by ID with full details
 * 
 * @param disputeId - The dispute ID
 * @returns Dispute details including evidence and comments
 * 
 * @example
 * ```ts
 * const { dispute, evidence, comments } = await getDisputeById(123);
 * ```
 */
export async function getDisputeById(
  disputeId: number
): Promise<DisputeDetailResponse> {
  const response = await apiClient.get<DisputeDetailResponse>(
    `/api/disputes/${disputeId}`
  );
  return response.data;
}

/**
 * Get evidence files for a dispute
 * 
 * @param disputeId - The dispute ID
 * @returns Array of evidence files
 * 
 * @example
 * ```ts
 * const evidence = await getDisputeEvidence(123);
 * ```
 */
export async function getDisputeEvidence(
  disputeId: number
): Promise<DisputeEvidence[]> {
  const response = await apiClient.get<{ evidence: DisputeEvidence[] }>(
    `/api/disputes/${disputeId}/evidence`
  );
  return response.data.evidence;
}

/**
 * Get comments/activity timeline for a dispute
 * 
 * @param disputeId - The dispute ID
 * @returns Array of comments ordered by creation date
 * 
 * @example
 * ```ts
 * const comments = await getDisputeComments(123);
 * ```
 */
export async function getDisputeComments(
  disputeId: number
): Promise<DisputeComment[]> {
  const response = await apiClient.get<{ comments: DisputeComment[] }>(
    `/api/disputes/${disputeId}/comments`
  );
  return response.data.comments;
}

// ============================================================================
// Mutation Functions (POST/PATCH requests)
// ============================================================================

/**
 * Admin reviews a dispute
 * 
 * Changes dispute status to 'under_review' and adds admin notes and priority.
 * 
 * @param disputeId - The dispute ID
 * @param data - Review data (admin notes and priority)
 * @returns Updated dispute
 * 
 * @example
 * ```ts
 * const result = await reviewDispute(123, {
 *   admin_notes: 'Reviewing evidence provided',
 *   priority: 'high'
 * });
 * ```
 */
export async function reviewDispute(
  disputeId: number,
  data: ReviewDisputeRequest
): Promise<DisputeActionResponse> {
  const response = await apiClient.post<DisputeActionResponse>(
    `/api/admin/disputes/${disputeId}/review`,
    data
  );
  return response.data;
}

/**
 * Admin resolves a dispute
 * 
 * Changes dispute status to 'resolved' and records the resolution outcome.
 * 
 * @param disputeId - The dispute ID
 * @param data - Resolution data (resolution text, outcome, optional notes)
 * @returns Updated dispute
 * 
 * @example
 * ```ts
 * const result = await resolveDispute(123, {
 *   resolution: 'Match result stands as reported',
 *   resolution_outcome: 'favor_reporter',
 *   admin_notes: 'Evidence supports reporter claim'
 * });
 * ```
 */
export async function resolveDispute(
  disputeId: number,
  data: ResolveDisputeRequest
): Promise<DisputeActionResponse> {
  const response = await apiClient.post<DisputeActionResponse>(
    `/api/admin/disputes/${disputeId}/resolve`,
    data
  );
  return response.data;
}

/**
 * Admin requests additional information
 * 
 * Changes dispute status to 'info_requested' and sends a message to specified parties.
 * 
 * @param disputeId - The dispute ID
 * @param data - Request info data (message and who to request from)
 * @returns Updated dispute
 * 
 * @example
 * ```ts
 * const result = await requestDisputeInfo(123, {
 *   message: 'Please provide additional evidence',
 *   requested_from: 'reporter'
 * });
 * ```
 */
export async function requestDisputeInfo(
  disputeId: number,
  data: RequestDisputeInfoRequest
): Promise<DisputeActionResponse> {
  const response = await apiClient.post<DisputeActionResponse>(
    `/api/admin/disputes/${disputeId}/request-info`,
    data
  );
  return response.data;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build query string from dispute filters
 * 
 * Helper function to convert filter object to URL query parameters.
 * Handles arrays and undefined values properly.
 * 
 * @param filters - Dispute filters object
 * @returns URLSearchParams object
 * 
 * @example
 * ```ts
 * const params = buildDisputeQueryParams({
 *   status: ['pending', 'under_review'],
 *   priority: 'high',
 *   page: 1
 * });
 * // Returns: status=pending,under_review&priority=high&page=1
 * ```
 */
export function buildDisputeQueryParams(
  filters: DisputeQueryParams
): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        // Join array values with comma
        params.append(key, value.join(','));
      } else {
        params.append(key, String(value));
      }
    }
  });

  return params;
}

/**
 * Get dispute statistics
 * 
 * Fetches summary statistics for disputes (counts by status, priority, etc.)
 * This is useful for dashboard widgets.
 * 
 * @returns Dispute statistics object
 * 
 * @example
 * ```ts
 * const stats = await getDisputeStats();
 * // { pending: 15, under_review: 8, resolved: 142, ... }
 * ```
 */
export async function getDisputeStats(): Promise<{
  pending: number;
  under_review: number;
  info_requested: number;
  resolved: number;
  total: number;
  by_priority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  by_type: {
    match_result: number;
    player_conduct: number;
    venue_issue: number;
    payment: number;
    other: number;
  };
}> {
  const response = await apiClient.get('/api/admin/disputes/stats');
  return response.data;
}

// ============================================================================
// React Query Key Factories
// ============================================================================

/**
 * Query key factory for disputes
 * 
 * Provides consistent query keys for React Query cache management.
 * Use these keys with useQuery and useMutation hooks.
 * 
 * @example
 * ```ts
 * // In a component:
 * const { data } = useQuery({
 *   queryKey: disputeKeys.pending({ priority: 'high' }),
 *   queryFn: () => getDisputesPending({ priority: 'high' })
 * });
 * ```
 */
export const disputeKeys = {
  all: ['disputes'] as const,
  lists: () => [...disputeKeys.all, 'list'] as const,
  list: (filters: DisputeQueryParams) => [...disputeKeys.lists(), filters] as const,
  pending: (filters?: DisputeQueryParams) => 
    [...disputeKeys.all, 'pending', filters] as const,
  resolved: (filters?: DisputeQueryParams) => 
    [...disputeKeys.all, 'resolved', filters] as const,
  details: () => [...disputeKeys.all, 'detail'] as const,
  detail: (id: number) => [...disputeKeys.details(), id] as const,
  evidence: (id: number) => [...disputeKeys.detail(id), 'evidence'] as const,
  comments: (id: number) => [...disputeKeys.detail(id), 'comments'] as const,
  stats: () => [...disputeKeys.all, 'stats'] as const,
};

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a dispute is pending
 */
export function isDisputePending(dispute: Dispute): boolean {
  return dispute.status === 'pending';
}

/**
 * Type guard to check if a dispute is under review
 */
export function isDisputeUnderReview(dispute: Dispute): boolean {
  return dispute.status === 'under_review';
}

/**
 * Type guard to check if a dispute is resolved
 */
export function isDisputeResolved(dispute: Dispute): boolean {
  return dispute.status === 'resolved' || dispute.status === 'closed';
}

/**
 * Type guard to check if a dispute can be reviewed
 */
export function canReviewDispute(dispute: Dispute): boolean {
  return dispute.status === 'pending' || dispute.status === 'info_requested';
}

/**
 * Type guard to check if a dispute can be resolved
 */
export function canResolveDispute(dispute: Dispute): boolean {
  return dispute.status === 'under_review' || dispute.status === 'info_requested';
}

/**
 * Type guard to check if info can be requested for a dispute
 */
export function canRequestInfo(dispute: Dispute): boolean {
  return dispute.status === 'pending' || dispute.status === 'under_review';
}

// ============================================================================
// Default Export Object
// ============================================================================

/**
 * Disputes API object
 *
 * Provides all disputes API functions and utilities in a single object.
 * Can be imported as a named export for convenience.
 */
export const disputesApi = {
  // Query functions
  getPendingDisputes: getDisputesPending,
  getResolvedDisputes: getDisputesResolved,
  getDisputeById,
  getDisputeEvidence,
  getDisputeComments,
  getDisputeStats,
  
  // Mutation functions
  reviewDispute,
  resolveDispute,
  requestDisputeInfo,
  
  // Helper functions
  buildDisputeQueryParams,
  
  // Query keys
  disputeKeys,
  
  // Type guards
  isDisputePending,
  isDisputeUnderReview,
  isDisputeResolved,
  canReviewDispute,
  canResolveDispute,
  canRequestInfo,
};
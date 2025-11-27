import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, LoadingSpinner } from '../components/common';
import { DisputeDetail } from '../components/disputes/DisputeDetail';
import { DisputeEvidence } from '../components/disputes/DisputeEvidence';
import { DisputeComments } from '../components/disputes/DisputeComments';
import { DisputeResolutionForm } from '../components/disputes/DisputeResolutionForm';
import { disputesApi } from '../lib/api/disputes';
import type { Dispute, DisputeEvidence as DisputeEvidenceType, DisputeComment } from '../lib/types/disputes';

/**
 * DisputeDetailPage Component
 * 
 * Full dispute detail page with:
 * - Dispute information
 * - Evidence gallery
 * - Comments timeline
 * - Admin action buttons
 */

type ResolutionAction = 'review' | 'resolve' | 'request-info' | null;

export function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resolutionAction, setResolutionAction] = useState<ResolutionAction>(null);

  // Fetch dispute details
  const { data: dispute, isLoading: disputeLoading, error: disputeError } = useQuery<Dispute>({
    queryKey: disputesApi.disputeKeys.detail(id!),
    queryFn: () => disputesApi.getDisputeById(id!),
    enabled: !!id,
  });

  // Fetch evidence
  const { data: evidence = [], isLoading: evidenceLoading } = useQuery<DisputeEvidenceType[]>({
    queryKey: disputesApi.disputeKeys.evidence(id!),
    queryFn: () => disputesApi.getDisputeEvidence(id!),
    enabled: !!id,
  });

  // Fetch comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery<DisputeComment[]>({
    queryKey: disputesApi.disputeKeys.comments(id!),
    queryFn: () => disputesApi.getDisputeComments(id!),
    enabled: !!id,
  });

  const handleBack = () => {
    navigate('/disputes');
  };

  const handleReview = () => {
    setResolutionAction('review');
  };

  const handleResolve = () => {
    setResolutionAction('resolve');
  };

  const handleRequestInfo = () => {
    setResolutionAction('request-info');
  };

  const handleCloseResolutionForm = () => {
    setResolutionAction(null);
  };

  // Loading state
  if (disputeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (disputeError || !dispute) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Dispute Not Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The dispute you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <div className="mt-6">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Disputes
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const canTakeAction = dispute.status === 'pending' || dispute.status === 'under_review';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Disputes
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dispute #{dispute.id}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Created {new Date(dispute.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Action Buttons */}
          {canTakeAction && (
            <div className="flex gap-3">
              <button
                onClick={handleReview}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Review
              </button>
              <button
                onClick={handleRequestInfo}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Request Info
              </button>
              <button
                onClick={handleResolve}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Resolve
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <DisputeDetail dispute={dispute} />
          <DisputeEvidence evidence={evidence} loading={evidenceLoading} />
        </div>

        {/* Right Column - Timeline */}
        <div className="lg:col-span-1">
          <DisputeComments comments={comments} loading={commentsLoading} />
        </div>
      </div>

      {/* Resolution Form Modal */}
      {resolutionAction && (
        <DisputeResolutionForm
          disputeId={id!}
          isOpen={!!resolutionAction}
          onClose={handleCloseResolutionForm}
          defaultAction={resolutionAction}
        />
      )}
    </div>
  );
}

export default DisputeDetailPage;
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Modal } from '../common';
import { disputesApi } from '../../lib/api/disputes';
import type {
  DisputeReviewRequest,
  DisputeResolutionRequest,
  DisputeRequestInfoRequest,
  DisputeResolutionOutcome
} from '../../lib/types/disputes';

/**
 * DisputeResolutionForm Component
 * 
 * Modal form with 3 action tabs:
 * - Review: Set priority and add admin notes
 * - Resolve: Provide resolution with outcome
 * - Request Info: Ask for additional information
 */

export interface DisputeResolutionFormProps {
  disputeId: string;
  isOpen: boolean;
  onClose: () => void;
  defaultAction?: 'review' | 'resolve' | 'request-info';
}

type ActionTab = 'review' | 'resolve' | 'request-info';

export function DisputeResolutionForm({ 
  disputeId, 
  isOpen, 
  onClose,
  defaultAction = 'review'
}: DisputeResolutionFormProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActionTab>(defaultAction);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Review form state
  const [reviewData, setReviewData] = useState<DisputeReviewRequest>({
    admin_notes: '',
    priority: 'medium',
  });

  // Resolve form state
  const [resolveData, setResolveData] = useState<DisputeResolutionRequest>({
    resolution: '',
    resolution_outcome: 'favor_reporter',
    admin_notes: '',
  });

  // Request info form state
  const [requestInfoData, setRequestInfoData] = useState<DisputeRequestInfoRequest>({
    message: '',
    requested_from: 'reporter',
  });

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: () => disputesApi.reviewDispute(disputeId, reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputesApi.disputeKeys.all });
      queryClient.invalidateQueries({ queryKey: disputesApi.disputeKeys.detail(disputeId) });
      handleSuccess('Dispute reviewed successfully');
    },
    onError: (error: any) => {
      handleError(error);
    },
  });

  // Resolve mutation
  const resolveMutation = useMutation({
    mutationFn: () => disputesApi.resolveDispute(disputeId, resolveData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputesApi.disputeKeys.all });
      queryClient.invalidateQueries({ queryKey: disputesApi.disputeKeys.detail(disputeId) });
      handleSuccess('Dispute resolved successfully');
    },
    onError: (error: any) => {
      handleError(error);
    },
  });

  // Request info mutation
  const requestInfoMutation = useMutation({
    mutationFn: () => disputesApi.requestDisputeInfo(disputeId, requestInfoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputesApi.disputeKeys.all });
      queryClient.invalidateQueries({ queryKey: disputesApi.disputeKeys.detail(disputeId) });
      queryClient.invalidateQueries({ queryKey: disputesApi.disputeKeys.comments(disputeId) });
      handleSuccess('Information request sent successfully');
    },
    onError: (error: any) => {
      handleError(error);
    },
  });

  const handleSuccess = (message: string) => {
    alert(message); // TODO: Replace with toast notification
    onClose();
    resetForms();
  };

  const handleError = (error: any) => {
    const message = error.response?.data?.message || 'An error occurred';
    alert(`Error: ${message}`); // TODO: Replace with toast notification
  };

  const resetForms = () => {
    setReviewData({ admin_notes: '', priority: 'medium' });
    setResolveData({ resolution: '', resolution_outcome: 'favor_reporter', admin_notes: '' });
    setRequestInfoData({ message: '', requested_from: 'reporter' });
    setShowConfirmation(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    
    switch (activeTab) {
      case 'review':
        reviewMutation.mutate();
        break;
      case 'resolve':
        resolveMutation.mutate();
        break;
      case 'request-info':
        requestInfoMutation.mutate();
        break;
    }
  };

  const isLoading = reviewMutation.isPending || resolveMutation.isPending || requestInfoMutation.isPending;

  const isFormValid = () => {
    switch (activeTab) {
      case 'review':
        return reviewData.admin_notes.trim().length > 0;
      case 'resolve':
        return resolveData.resolution.trim().length > 0;
      case 'request-info':
        return requestInfoData.message.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Dispute Actions" size="lg">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('review')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'review'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Review
            </button>
            <button
              onClick={() => setActiveTab('resolve')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'resolve'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resolve
            </button>
            <button
              onClick={() => setActiveTab('request-info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'request-info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Request Info
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Review Tab */}
          {activeTab === 'review' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  value={reviewData.priority}
                  onChange={(e) => setReviewData({ ...reviewData, priority: e.target.value as any })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label htmlFor="review-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="review-notes"
                  rows={6}
                  value={reviewData.admin_notes}
                  onChange={(e) => setReviewData({ ...reviewData, admin_notes: e.target.value })}
                  placeholder="Add your review notes here..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Internal notes visible only to admins
                </p>
              </div>
            </div>
          )}

          {/* Resolve Tab */}
          {activeTab === 'resolve' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution Outcome <span className="text-red-500">*</span>
                </label>
                <select
                  id="outcome"
                  value={resolveData.resolution_outcome}
                  onChange={(e) => setResolveData({ ...resolveData, resolution_outcome: e.target.value as DisputeResolutionOutcome })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="favor_reporter">Favor Reporter</option>
                  <option value="favor_reported">Favor Reported</option>
                  <option value="no_action">No Action Required</option>
                  <option value="both_warned">Both Parties Warned</option>
                </select>
              </div>

              <div>
                <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="resolution"
                  rows={6}
                  value={resolveData.resolution}
                  onChange={(e) => setResolveData({ ...resolveData, resolution: e.target.value })}
                  placeholder="Explain the resolution and actions taken..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will be visible to involved parties
                </p>
              </div>

              <div>
                <label htmlFor="resolve-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes (Optional)
                </label>
                <textarea
                  id="resolve-notes"
                  rows={3}
                  value={resolveData.admin_notes}
                  onChange={(e) => setResolveData({ ...resolveData, admin_notes: e.target.value })}
                  placeholder="Add internal notes..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Internal notes visible only to admins
                </p>
              </div>
            </div>
          )}

          {/* Request Info Tab */}
          {activeTab === 'request-info' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="requested-from" className="block text-sm font-medium text-gray-700 mb-1">
                  Request Information From <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="reporter"
                      checked={requestInfoData.requested_from === 'reporter'}
                      onChange={(e) => setRequestInfoData({ ...requestInfoData, requested_from: e.target.value as any })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Reporter</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="reported"
                      checked={requestInfoData.requested_from === 'reported'}
                      onChange={(e) => setRequestInfoData({ ...requestInfoData, requested_from: e.target.value as any })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Reported User</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="both"
                      checked={requestInfoData.requested_from === 'both'}
                      onChange={(e) => setRequestInfoData({ ...requestInfoData, requested_from: e.target.value as any })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Both Parties</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows={6}
                  value={requestInfoData.message}
                  onChange={(e) => setRequestInfoData({ ...requestInfoData, message: e.target.value })}
                  placeholder="What additional information do you need?"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  This message will be sent to the selected party/parties
                </p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Submit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <Modal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          title="Confirm Action"
          size="sm"
        >
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Are you sure you want to {activeTab === 'review' ? 'review' : activeTab === 'resolve' ? 'resolve' : 'request information for'} this dispute?
            </p>
            {activeTab === 'resolve' && (
              <p className="mt-2 text-sm text-yellow-600">
                ⚠️ This action cannot be undone. The dispute will be marked as resolved.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowConfirmation(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export default DisputeResolutionForm;
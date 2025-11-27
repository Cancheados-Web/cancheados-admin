import React from 'react';
import { Card } from '../common';
import type { DisputeComment as DisputeCommentType } from '../../lib/types/disputes';

/**
 * DisputeComments Component
 * 
 * Displays comments timeline with internal/external distinction
 */

export interface DisputeCommentsProps {
  comments: DisputeCommentType[];
  loading?: boolean;
}

export function DisputeComments({ comments, loading = false }: DisputeCommentsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Activity Timeline</h3>
        </div>
        <div className="px-6 py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading comments...</p>
        </div>
      </Card>
    );
  }

  if (comments.length === 0) {
    return (
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Activity Timeline</h3>
        </div>
        <div className="px-6 py-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">No comments yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Activity Timeline ({comments.length})
        </h3>
      </div>
      <div className="px-6 py-4">
        <div className="flow-root">
          <ul className="-mb-8">
            {comments.map((comment, idx) => (
              <li key={comment.id}>
                <div className="relative pb-8">
                  {/* Timeline line */}
                  {idx !== comments.length - 1 && (
                    <span
                      className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}

                  <div className="relative flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white ${
                        comment.is_internal ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        {comment.user?.is_admin ? (
                          <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {comment.user?.name || 'Unknown User'}
                            </p>
                            {comment.user?.is_admin && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Admin
                              </span>
                            )}
                            {comment.is_internal && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                Internal
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatDate(comment.created_at)}
                          </p>
                        </div>
                        {comment.user?.email && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {comment.user.email}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <p className="whitespace-pre-wrap">{comment.comment}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

export default DisputeComments;
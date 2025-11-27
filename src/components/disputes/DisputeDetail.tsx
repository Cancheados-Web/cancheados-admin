import React from 'react';
import { Card } from '../common';
import { DisputeStatusBadge } from './DisputeStatusBadge';
import type { Dispute } from '../../lib/types/disputes';
import { DISPUTE_TYPE_CONFIG, DISPUTE_PRIORITY_CONFIG } from '../../lib/types/disputes';

/**
 * DisputeDetail Component
 * 
 * Displays full dispute information
 */

export interface DisputeDetailProps {
  dispute: Dispute;
}

export function DisputeDetail({ dispute }: DisputeDetailProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityBadge = () => {
    if (!dispute.priority) return null;
    
    const config = DISPUTE_PRIORITY_CONFIG[dispute.priority];
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

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Dispute #{dispute.id}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {DISPUTE_TYPE_CONFIG[dispute.dispute_type].label}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DisputeStatusBadge status={dispute.status} />
              {getPriorityBadge()}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{dispute.description}</p>
          </div>

          {/* Reporter Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Reporter</h3>
              {dispute.reporter ? (
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {dispute.reporter.nombre || dispute.reporter.name || (dispute.reporter.email ? dispute.reporter.email.split('@')[0] : 'Unknown')}
                  </p>
                  {dispute.reporter.email && (
                    <p className="text-gray-500">{dispute.reporter.email}</p>
                  )}
                  <p className="text-gray-500">ID: {dispute.reporter_id}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Unknown</p>
              )}
            </div>

            {/* Reported Party Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Reported Party</h3>
              {dispute.reported_user ? (
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {dispute.reported_user.nombre || dispute.reported_user.name || (dispute.reported_user.email ? dispute.reported_user.email.split('@')[0] : 'Unknown')}
                  </p>
                  {dispute.reported_user.email && (
                    <p className="text-gray-500">{dispute.reported_user.email}</p>
                  )}
                  <p className="text-gray-500">User ID: {dispute.reported_user_id}</p>
                </div>
              ) : dispute.reported_team ? (
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Team: {dispute.reported_team.name || dispute.reported_team.nombre || 'Unknown team'}</p>
                  <p className="text-gray-500">Team ID: {dispute.reported_team_id}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Not specified</p>
              )}
            </div>
          </div>

          {/* Match Information */}
          {dispute.match && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Related Match</h3>
              <div className="text-sm">
                <p className="text-gray-900">Match ID: {dispute.match_id}</p>
                <p className="text-gray-500">Date: {formatDate(dispute.match.date)}</p>
                <p className="text-gray-500">Venue: {dispute.match.venue_name}</p>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {dispute.admin_notes && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Admin Notes</h3>
              <p className="text-sm text-gray-900 whitespace-pre-wrap bg-yellow-50 p-3 rounded-md">
                {dispute.admin_notes}
              </p>
            </div>
          )}

          {/* Resolution */}
          {dispute.resolution && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Resolution</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-900 whitespace-pre-wrap bg-green-50 p-3 rounded-md">
                  {dispute.resolution}
                </p>
                {dispute.resolution_outcome && (
                  <p className="text-sm text-gray-500">
                    Outcome: <span className="font-medium">{dispute.resolution_outcome.replace(/_/g, ' ')}</span>
                  </p>
                )}
                {dispute.resolver && (
                  <p className="text-sm text-gray-500">
                    Resolved by: <span className="font-medium">{dispute.resolver.name}</span> on {formatDate(dispute.resolved_at!)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Created</h3>
              <p className="text-sm text-gray-500">{formatDate(dispute.created_at)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Last Updated</h3>
              <p className="text-sm text-gray-500">{formatDate(dispute.updated_at)}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DisputeDetail;

import React from 'react';
import { Card } from '../common';
import type { DisputeEvidence as DisputeEvidenceType } from '../../lib/types/disputes';

/**
 * DisputeEvidence Component
 * 
 * Displays evidence files in a gallery format
 */

export interface DisputeEvidenceProps {
  evidence: DisputeEvidenceType[];
  loading?: boolean;
}

export function DisputeEvidence({ evidence, loading = false }: DisputeEvidenceProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return (
        <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (fileType.startsWith('video/')) {
      return (
        <svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  if (loading) {
    return (
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Evidence</h3>
        </div>
        <div className="px-6 py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading evidence...</p>
        </div>
      </Card>
    );
  }

  if (evidence.length === 0) {
    return (
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Evidence</h3>
        </div>
        <div className="px-6 py-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">No evidence files uploaded</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Evidence ({evidence.length})
        </h3>
      </div>
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {evidence.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Preview */}
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {item.file_type.startsWith('image/') ? (
                  <img
                    src={item.file_url}
                    alt="Evidence"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    {getFileIcon(item.file_type)}
                    <span className="mt-2 text-xs text-gray-500">
                      {item.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formatDate(item.uploaded_at)}
                  </span>
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View →
                  </a>
                </div>
                {item.uploader && (
                  <p className="text-xs text-gray-600">
                    Uploaded by: {item.uploader.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default DisputeEvidence;
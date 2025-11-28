import type { AuditLog } from '../../lib/api/auditLogs';
import Modal from '../common/Modal';

interface AuditLogDetailModalProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

function AuditLogDetailModal({ log, isOpen, onClose }: AuditLogDetailModalProps) {
  if (!log) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Audit Log Details">
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Basic Information</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <dt className="text-sm font-medium text-gray-500">Timestamp:</dt>
            <dd className="text-sm text-gray-900">{new Date(log.created_at).toLocaleString()}</dd>
            
            <dt className="text-sm font-medium text-gray-500">Admin:</dt>
            <dd className="text-sm text-gray-900">{log.admin.nombre} ({log.admin.email})</dd>
            
            <dt className="text-sm font-medium text-gray-500">Action:</dt>
            <dd className="text-sm text-gray-900">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {log.action}
              </span>
            </dd>
            
            <dt className="text-sm font-medium text-gray-500">Entity Type:</dt>
            <dd className="text-sm text-gray-900">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {log.entity_type}
              </span>
            </dd>
            
            <dt className="text-sm font-medium text-gray-500">Entity ID:</dt>
            <dd className="text-sm text-gray-900 font-mono">{log.entity_id}</dd>
          </dl>
        </div>

        {/* Old Values */}
        {log.old_values && Object.keys(log.old_values).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Previous Values</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-800 overflow-x-auto">
                {JSON.stringify(log.old_values, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* New Values */}
        {log.new_values && Object.keys(log.new_values).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">New Values</h3>
            <div className="bg-green-50 rounded-lg p-4">
              <pre className="text-sm text-gray-800 overflow-x-auto">
                {JSON.stringify(log.new_values, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Reason */}
        {log.reason && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Reason</h3>
            <p className="text-sm text-gray-700 bg-yellow-50 rounded-lg p-4">{log.reason}</p>
          </div>
        )}

        {/* Technical Details */}
        {(log.ip_address || log.user_agent) && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Technical Details</h3>
            <dl className="grid grid-cols-1 gap-y-3">
              {log.ip_address && (
                <>
                  <dt className="text-sm font-medium text-gray-500">IP Address:</dt>
                  <dd className="text-sm text-gray-900 font-mono">{log.ip_address}</dd>
                </>
              )}
              {log.user_agent && (
                <>
                  <dt className="text-sm font-medium text-gray-500">User Agent:</dt>
                  <dd className="text-sm text-gray-900 break-all">{log.user_agent}</dd>
                </>
              )}
            </dl>
          </div>
        )}

        {/* Metadata */}
        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Additional Metadata</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-800 overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default AuditLogDetailModal;
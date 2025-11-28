import api from '../api';

export interface AuditLog {
  id: string;
  admin_id: string;
  admin: {
    id: string;
    nombre: string;
    email: string;
  };
  action: string;
  entity_type: 'user' | 'team' | 'venue' | 'booking' | 'match' | 'dispute' | 'payment' | 'other';
  entity_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
}

export interface AuditLogsFilters {
  action?: string;
  entity_type?: string;
  admin_id?: string;
  limit?: number;
  offset?: number;
}

export const auditLogsApi = {
  list: async (filters: AuditLogsFilters): Promise<AuditLogsResponse> => {
    const params = new URLSearchParams();
    if (filters.action) params.append('action', filters.action);
    if (filters.entity_type) params.append('entity_type', filters.entity_type);
    if (filters.admin_id) params.append('admin_id', filters.admin_id);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const response = await api.get(`/api/admin/audit-logs?${params.toString()}`);
    return response.data;
  },

  getByEntity: async (entityType: string, entityId: string): Promise<AuditLog[]> => {
    const response = await api.get(`/api/admin/audit-logs/${entityType}/${entityId}`);
    return response.data;
  }
};

export default auditLogsApi;
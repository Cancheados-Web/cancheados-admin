import { ReactNode } from 'react';

type BadgeVariant = 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info' 
  | 'gray'
  | 'purple'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'red';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800',
  purple: 'bg-purple-100 text-purple-800',
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
};

export default function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// Helper functions for common status badges
export function DisputeStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeVariant> = {
    pending: 'yellow',
    under_review: 'blue',
    awaiting_info: 'purple',
    resolved: 'green',
    closed: 'gray',
    escalated: 'red',
  };

  return <Badge variant={variantMap[status] || 'gray'}>{status.replace('_', ' ')}</Badge>;
}

export function DisputePriorityBadge({ priority }: { priority: string }) {
  const variantMap: Record<string, BadgeVariant> = {
    low: 'gray',
    medium: 'blue',
    high: 'yellow',
    urgent: 'red',
  };

  return <Badge variant={variantMap[priority] || 'gray'}>{priority}</Badge>;
}

export function UserStatusBadge({ status }: { status: 'active' | 'suspended' | 'deleted' }) {
  const variantMap: Record<string, BadgeVariant> = {
    active: 'green',
    suspended: 'red',
    deleted: 'gray',
  };

  return <Badge variant={variantMap[status] || 'gray'}>{status}</Badge>;
}
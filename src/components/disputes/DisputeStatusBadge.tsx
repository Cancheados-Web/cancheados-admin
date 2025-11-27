import React from 'react';
import { Badge } from '../common';
import { DISPUTE_STATUS_CONFIG } from '../../lib/types/disputes';
import type { DisputeStatus } from '../../lib/types/disputes';

/**
 * DisputeStatusBadge Component
 * 
 * Displays a colored badge for dispute status with appropriate styling
 */

export interface DisputeStatusBadgeProps {
  status: DisputeStatus;
  className?: string;
}

export function DisputeStatusBadge({ status, className = '' }: DisputeStatusBadgeProps) {
  const config = DISPUTE_STATUS_CONFIG[status];
  
  return (
    <Badge variant={config.color} className={className}>
      {config.label}
    </Badge>
  );
}

export default DisputeStatusBadge;
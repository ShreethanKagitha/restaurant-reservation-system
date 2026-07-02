import React from 'react';
import Badge from './Badge';

/**
 * Maps reservation status strings to visual Badge states.
 * @param {string} status - PENDING | CONFIRMED | CANCELLED | COMPLETED | NO_SHOW
 */
const StatusBadge = ({ status, className = '' }) => {
  const getBadgeProperties = () => {
    switch (status) {
      case 'CONFIRMED':
        return { variant: 'success', label: 'Confirmed' };
      case 'PENDING':
        return { variant: 'warning', label: 'Pending Review' };
      case 'COMPLETED':
        return { variant: 'info', label: 'Completed' };
      case 'CANCELLED':
        return { variant: 'danger', label: 'Cancelled' };
      case 'NO_SHOW':
        return { variant: 'default', label: 'No Show' };
      default:
        return { variant: 'default', label: status || 'Unknown' };
    }
  };

  const { variant, label } = getBadgeProperties();

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};

export default StatusBadge;

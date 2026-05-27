// src/components/ui/StatusBadge.tsx
import React from 'react';
import styles from './StatusBadge.module.css';

export type OrderStatus = 'received' | 'washing' | 'drying' | 'ironing' | 'ready' | 'delivered' | 'cancelled';

interface StatusBadgeProps {
  status: OrderStatus;
  animate?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  animate = false
}) => {
  const getStatusText = (s: OrderStatus) => {
    switch (s) {
      case 'received': return 'Recibido';
      case 'washing': return 'Lavando';
      case 'drying': return 'Secando';
      case 'ironing': return 'Planchando';
      case 'ready': return 'Listo';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return s;
    }
  };

  const badgeClass = [
    styles.badge,
    styles[status],
    animate && status === 'ready' ? 'animate-pulse-soft' : '',
    'transition-all'
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClass}>
      <span className={styles.dot}></span>
      {getStatusText(status)}
    </span>
  );
};

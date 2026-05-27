// src/components/ui/BigButton.tsx
import React from 'react';
import styles from './BigButton.module.css';

interface BigButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: string;
  badge?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
}

export const BigButton: React.FC<BigButtonProps> = ({
  children,
  active = false,
  icon,
  badge,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const btnClass = [
    styles.bigBtn,
    styles[variant],
    active ? styles.active : '',
    'transition-all',
    'active-press',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={btnClass} {...props}>
      {badge && <span className={styles.badge}>{badge}</span>}
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{children}</span>
    </button>
  );
};

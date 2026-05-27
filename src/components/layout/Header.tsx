// src/components/layout/Header.tsx
import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'danger' | 'primary';
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  badgeText,
  badgeVariant = 'primary'
}) => {
  return (
    <header className={styles.header}>
      <div>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      
      {badgeText && (
        <div className={styles.actions}>
          <span className={`badge badge-${badgeVariant}`}>{badgeText}</span>
        </div>
      )}
    </header>
  );
};

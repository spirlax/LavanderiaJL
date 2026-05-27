// src/components/layout/BottomNav.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const isLinkActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className={`${styles.bottomNav} glassmorphism`}>
      <Link
        href="/"
        className={`${styles.navItem} ${isLinkActive('/') && !pathname.startsWith('/nuevo') && !pathname.startsWith('/buscar') ? styles.navItemActive : ''} active-press`}
      >
        <span className={styles.navIcon}>📋</span>
        <span className={styles.navLabel}>Pedidos</span>
      </Link>

      <Link
        href="/nuevo"
        className={`${styles.navItem} ${isLinkActive('/nuevo') ? styles.navItemActive : ''} active-press`}
      >
        <span className={styles.navIconBig}>➕</span>
        <span className={styles.navLabel}>Nuevo</span>
      </Link>

      <Link
        href="/buscar"
        className={`${styles.navItem} ${isLinkActive('/buscar') ? styles.navItemActive : ''} active-press`}
      >
        <span className={styles.navIcon}>🔍</span>
        <span className={styles.navLabel}>Buscar</span>
      </Link>
    </nav>
  );
};

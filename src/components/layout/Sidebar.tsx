// src/components/layout/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const isLinkActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') return true;
    if (path !== '/admin' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logoCircle}>J&L</div>
        <div>
          <h1 className={styles.brandName}>J&L Lavandería</h1>
          <span className={styles.brandSubtitle}>Control Financiero</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <Link
          href="/admin"
          className={`${styles.navLink} ${isLinkActive('/admin') && !pathname.startsWith('/admin/pedidos') && !pathname.startsWith('/admin/clientes') && !pathname.startsWith('/admin/caja') && !pathname.startsWith('/admin/reportes') && !pathname.startsWith('/admin/maquinas') && !pathname.startsWith('/admin/configuracion') ? styles.navLinkActive : ''}`}
        >
          <span className={styles.navIcon}>📊</span> Dashboard
        </Link>
        
        <Link
          href="/admin/pedidos"
          className={`${styles.navLink} ${isLinkActive('/admin/pedidos') ? styles.navLinkActive : ''}`}
        >
          <span className={styles.navIcon}>📋</span> Pedidos
        </Link>

        <Link
          href="/admin/clientes"
          className={`${styles.navLink} ${isLinkActive('/admin/clientes') ? styles.navLinkActive : ''}`}
        >
          <span className={styles.navIcon}>👥</span> Clientes
        </Link>

        <Link
          href="/admin/caja"
          className={`${styles.navLink} ${isLinkActive('/admin/caja') ? styles.navLinkActive : ''}`}
        >
          <span className={styles.navIcon}>💰</span> Control de Caja
        </Link>

        <Link
          href="/admin/reportes"
          className={`${styles.navLink} ${isLinkActive('/admin/reportes') ? styles.navLinkActive : ''}`}
        >
          <span className={styles.navIcon}>📈</span> Inteligencia Financiera
        </Link>

        <Link
          href="/admin/maquinas"
          className={`${styles.navLink} ${isLinkActive('/admin/maquinas') ? styles.navLinkActive : ''}`}
        >
          <span className={styles.navIcon}>🔧</span> Máquinas
        </Link>

        <Link
          href="/admin/configuracion"
          className={`${styles.navLink} ${isLinkActive('/admin/configuracion') ? styles.navLinkActive : ''}`}
        >
          <span className={styles.navIcon}>⚙️</span> Configuración
        </Link>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userInfo}>
          <span style={{ fontWeight: 'var(--weight-semibold)', display: 'block' }}>Administrador</span>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)' }}>dueño@lavanderiajl.com</span>
        </div>
      </div>
    </aside>
  );
};

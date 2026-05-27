// src/app/(empleada)/layout.tsx
import React from 'react';
import Link from 'next/link';
import styles from './empleada.module.css';

export default function EmpleadaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mobile-container">
      {/* Cabecera Fija */}
      <header className={`${styles.header} glassmorphism`}>
        <div className={styles.logoArea}>
          <div className={styles.logoCircle}>J&L</div>
          <div>
            <h2 className={styles.businessName}>Lavandería J&L</h2>
            <span className={styles.location}>S.M.P., Lima</span>
          </div>
        </div>
        <div className={styles.userBadge}>
          <span className="badge badge-primary">Operadora</span>
        </div>
      </header>

      {/* Área de Contenido con Scroll */}
      <main className="scrollable-y no-scrollbar">
        <div className={styles.content}>
          {children}
        </div>
      </main>

      {/* Barra de Navegación Inferior (Estilo App Nativa) */}
      <nav className={`${styles.bottomNav} glassmorphism`}>
        <Link href="/" className={`${styles.navItem} active-press`}>
          <span className={styles.navIcon}>📋</span>
          <span className={styles.navLabel}>Pedidos</span>
        </Link>
        <Link href="/nuevo" className={`${styles.navItem} ${styles.navItemActive} active-press`}>
          <span className={styles.navIconBig}>➕</span>
          <span className={styles.navLabel}>Nuevo</span>
        </Link>
        <Link href="/buscar" className={`${styles.navItem} active-press`}>
          <span className={styles.navIcon}>🔍</span>
          <span className={styles.navLabel}>Buscar</span>
        </Link>
      </nav>
    </div>
  );
}

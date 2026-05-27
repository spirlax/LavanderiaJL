// src/app/(admin)/layout.tsx
import React from 'react';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      {/* Sidebar de Escritorio */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logoCircle}>J&L</div>
          <div>
            <h1 className={styles.brandName}>J&L Lavandería</h1>
            <span className={styles.brandSubtitle}>Control de Caja & BI</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <Link href="/admin" className={`${styles.navLink} ${styles.navLinkActive}`}>
            <span className={styles.navIcon}>📊</span> Dashboard
          </Link>
          <Link href="/admin/pedidos" className={styles.navLink}>
            <span className={styles.navIcon}>📋</span> Pedidos
          </Link>
          <Link href="/admin/clientes" className={styles.navLink}>
            <span className={styles.navIcon}>👥</span> Clientes
          </Link>
          <Link href="/admin/caja" className={styles.navLink}>
            <span className={styles.navIcon}>💰</span> Control de Caja
          </Link>
          <Link href="/admin/reportes" className={styles.navLink}>
            <span className={styles.navIcon}>📈</span> Inteligencia Financiera
          </Link>
          <Link href="/admin/maquinas" className={styles.navLink}>
            <span className={styles.navIcon}>🔧</span> Máquinas
          </Link>
          <Link href="/admin/configuracion" className={styles.navLink}>
            <span className={styles.navIcon}>⚙️</span> Configuración
          </Link>
          <Link href="/admin/datos" className={styles.navLink}>
            <span className={styles.navIcon}>💾</span> Cargar Datos
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <span style={{ fontWeight: 'var(--weight-semibold)', display: 'block' }}>Administrador</span>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)' }}>dueño@lavanderiajl.com</span>
          </div>
        </div>
      </aside>

      {/* Área Principal */}
      <div className={styles.mainArea}>
        {/* Cabecera */}
        <header className={styles.header}>
          <div>
            <h2 className={styles.pageTitle}>Dashboard Operativo</h2>
            <p className={styles.pageSubtitle}>Resumen financiero y logístico de hoy</p>
          </div>
          <div className={styles.headerActions}>
            <span className="badge badge-success">Conectado a Supabase</span>
          </div>
        </header>

        {/* Contenido Dinámico */}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

// src/app/(admin)/admin/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';

export default function AdminDashboard() {
  // Datos financieros simulados para las pruebas de BI en Fase 1
  const kpis = [
    { title: 'Ingresos del Día', value: 'S/ 285.50', change: '+12% vs ayer', icon: '💰', color: 'var(--success)' },
    { title: 'Pedidos Totales', value: '18', change: '4 listos por entregar', icon: '📋', color: 'var(--primary)' },
    { title: 'Clientes Registrados', value: '124', change: '+3 esta semana', icon: '👥', color: 'var(--secondary)' },
    { title: 'Máquinas Activas', value: '6 / 6', change: 'Todas operativas', icon: '🔧', color: 'var(--warning)' },
  ];

  const cashFlows = [
    { employee: 'Esposa del Dueño (Confianza)', ordersCount: 8, cash: 120.00, yape: 45.00, plin: 0.00, total: 165.00 },
    { employee: 'Empleada #2', ordersCount: 10, cash: 85.00, yape: 20.00, plin: 15.50, total: 120.50 },
  ];

  const recentOrders = [
    { number: 'JL-0004', customer: 'Cliente Rápido', date: 'Hace 10 min', amount: 'S/ 9.00', status: 'Entregado', statusColor: 'badge-secondary' },
    { number: 'JL-0003', customer: 'Ana Paredes (Frazada)', date: 'Hace 50 min', amount: 'S/ 25.00', status: 'Listo para entregar', statusColor: 'badge-success animate-pulse-soft' },
    { number: 'JL-0002', customer: 'Carlos Quispe', date: 'Hace 1 hora', amount: 'S/ 16.80', status: 'En Proceso', statusColor: 'badge-warning' },
    { number: 'JL-0001', customer: 'María Gómez', date: 'Hace 2 horas', amount: 'S/ 12.60', status: 'En Proceso', statusColor: 'badge-warning' },
  ];

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
      {/* Sección KPI Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-lg)' }}>
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="glassmorphism hover-premium transition-all"
            style={{
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius-md)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
              <span style={{ fontSize: 'var(--font-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--gray-600)' }}>
                {kpi.title}
              </span>
              <span style={{ fontSize: '1.5rem' }}>{kpi.icon}</span>
            </div>
            <strong style={{ fontSize: 'var(--font-3xl)', color: kpi.color, display: 'block', marginBottom: '4px' }}>
              {kpi.value}
            </strong>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)' }}>{kpi.change}</span>
          </div>
        ))}
      </section>

      {/* Control de Caja (Quién cobró qué) */}
      <section className="glassmorphism" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-md)' }}>
        <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--spacing-md)' }}>
          💵 Cuadre de Caja Diario — Transparencia de Efectivo
        </h3>
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-lg)' }}>
          Monitorea en tiempo real los ingresos cobrados por cada una de tus empleadas físicamente en el local.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--gray-200)', color: 'var(--gray-800)', fontSize: 'var(--font-sm)' }}>
                <th style={{ padding: '12px' }}>Personal de Turno</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Pedidos</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Efectivo (S/)</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Yape (S/)</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Plin (S/)</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'var(--weight-bold)' }}>Total Cobrado</th>
              </tr>
            </thead>
            <tbody>
              {cashFlows.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--gray-100)', fontSize: 'var(--font-sm)' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 'var(--weight-semibold)', color: 'var(--dark)' }}>
                    {row.employee}
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'center' }}>{row.ordersCount}</td>
                  <td style={{ padding: '16px 12px', textAlign: 'right', color: 'var(--gray-800)' }}>{row.cash.toFixed(2)}</td>
                  <td style={{ padding: '16px 12px', textAlign: 'right', color: 'var(--primary)' }}>{row.yape.toFixed(2)}</td>
                  <td style={{ padding: '16px 12px', textAlign: 'right', color: 'var(--secondary)' }}>{row.plin.toFixed(2)}</td>
                  <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 'var(--weight-bold)', color: 'var(--success)' }}>
                    S/ {row.total.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr style={{ backgroundColor: 'var(--primary-light)', fontWeight: 'var(--weight-bold)', borderTop: '2px solid var(--primary)' }}>
                <td style={{ padding: '16px 12px', color: 'var(--primary)' }}>Total General de Caja</td>
                <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                  {cashFlows.reduce((sum, r) => sum + r.ordersCount, 0)}
                </td>
                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                  S/ {cashFlows.reduce((sum, r) => sum + r.cash, 0).toFixed(2)}
                </td>
                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                  S/ {cashFlows.reduce((sum, r) => sum + r.yape, 0).toFixed(2)}
                </td>
                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                  S/ {cashFlows.reduce((sum, r) => sum + r.plin, 0).toFixed(2)}
                </td>
                <td style={{ padding: '16px 12px', textAlign: 'right', color: 'var(--success)', fontSize: 'var(--font-md)' }}>
                  S/ {cashFlows.reduce((sum, r) => sum + r.total, 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Grid de Secciones Secundarias (Pedidos Recientes & Acciones Rápidas) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)' }}>
        {/* Tabla de Pedidos Recientes */}
        <section className="glassmorphism" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-md)' }}>
          <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--spacing-md)' }}>📋 Pedidos Recientes en el Local</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {recentOrders.map((order, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--spacing-md) 0',
                  borderBottom: idx === recentOrders.length - 1 ? 'none' : '1px solid var(--gray-100)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <strong style={{ color: 'var(--dark)' }}>{order.number}</strong>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)' }}>{order.date}</span>
                  </div>
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-800)', marginTop: '2px' }}>{order.customer}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <span className={`badge ${order.statusColor}`} style={{ fontSize: '0.7rem' }}>{order.status}</span>
                  <strong style={{ color: 'var(--dark)' }}>{order.amount}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Acciones del Administrador */}
        <section className="glassmorphism" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--spacing-xs)' }}>⚡ Acciones Rápidas</h3>
          <Link href="/admin/datos" style={{ textDecoration: 'none', display: 'block' }}>
            <button className="active-press transition-all" style={{ width: '100%', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-sm)', background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', color: 'var(--white)', fontWeight: 'var(--weight-semibold)', border: 'none', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📥 Cargar Excel Histórico</span>
              <span>➔</span>
            </button>
          </Link>
          <button className="active-press transition-all" style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-sm)', background: 'var(--white)', border: '1px solid var(--gray-200)', color: 'var(--dark)', fontWeight: 'var(--weight-semibold)', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>💰 Realizar Cierre de Caja</span>
            <span>➔</span>
          </button>
          <button className="active-press transition-all" style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-sm)', background: 'var(--white)', border: '1px solid var(--gray-200)', color: 'var(--dark)', fontWeight: 'var(--weight-semibold)', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📊 Descargar Reporte en PDF</span>
            <span>➔</span>
          </button>
        </section>
      </div>
    </div>
  );
}

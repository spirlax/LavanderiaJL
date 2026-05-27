// src/app/(empleada)/page.tsx
'use client';

import React, { useState } from 'react';
import styles from './empleada.module.css';

interface Order {
  id: string;
  number: string;
  customerName: string;
  weight: number;
  total: number;
  status: 'received' | 'washing' | 'drying' | 'ready' | 'delivered';
  paymentMethod: 'efectivo' | 'yape' | 'plin';
  time: string;
}

export default function EmpleadaDashboard() {
  // Datos simulados de pedidos para pruebas iniciales en la Fase 1
  const [orders, setOrders] = useState<Order[]>([
    { id: '1', number: 'JL-0001', customerName: 'María Gómez', weight: 4.5, total: 12.60, status: 'drying', paymentMethod: 'yape', time: '09:30 AM' },
    { id: '2', number: 'JL-0002', customerName: 'Carlos Quispe', weight: 6.0, total: 16.80, status: 'received', paymentMethod: 'efectivo', time: '10:15 AM' },
    { id: '3', number: 'JL-0003', customerName: 'Ana Paredes (Frazada)', weight: 0, total: 25.00, status: 'ready', paymentMethod: 'plin', time: '11:00 AM' },
    { id: '4', number: 'JL-0004', customerName: 'Cliente Rápido', weight: 3.2, total: 9.00, status: 'delivered', paymentMethod: 'efectivo', time: '11:45 AM' },
  ]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received': return 'Recibido';
      case 'washing': return 'Lavando';
      case 'drying': return 'Secando';
      case 'ready': return 'Listo';
      case 'delivered': return 'Entregado';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'received': return 'badge-primary';
      case 'washing': return 'badge-warning';
      case 'drying': return 'badge-warning';
      case 'ready': return 'badge-success animate-pulse-soft';
      case 'delivered': return 'badge-secondary';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Resumen del Día */}
      <section style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: 'var(--font-lg)', color: 'var(--gray-800)', marginBottom: 'var(--spacing-sm)' }}>
          Resumen de Hoy
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
          <div className="glassmorphism" style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)', display: 'block' }}>Pedidos Recibidos</span>
            <strong style={{ fontSize: 'var(--font-2xl)', color: 'var(--primary)' }}>{orders.length}</strong>
          </div>
          <div className="glassmorphism" style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)', display: 'block' }}>Caja Estimada</span>
            <strong style={{ fontSize: 'var(--font-2xl)', color: 'var(--success)' }}>
              S/ {orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
            </strong>
          </div>
        </div>
      </section>

      {/* Lista de Pedidos */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h2 style={{ fontSize: 'var(--font-lg)', color: 'var(--gray-800)', marginBottom: 0 }}>
            Pedidos Recientes
          </h2>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)' }}>Total: {orders.length}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              className="glassmorphism hover-premium transition-all active-press"
              style={{
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--border-radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderLeft: `5px solid ${
                  order.status === 'ready' ? 'var(--success)' : 
                  order.status === 'delivered' ? 'var(--gray-400)' : 'var(--primary)'
                }`
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: '4px' }}>
                  <strong style={{ fontSize: 'var(--font-md)', color: 'var(--dark)' }}>{order.number}</strong>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)' }}>{order.time}</span>
                </div>
                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--gray-800)', marginBottom: '4px' }}>
                  {order.customerName}
                </div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)' }}>
                  {order.weight > 0 ? `${order.weight} kg` : 'Artículo especial'} · {order.paymentMethod.toUpperCase()}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--spacing-xs)' }}>
                <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                <strong style={{ fontSize: 'var(--font-md)', color: 'var(--dark)' }}>
                  S/ {order.total.toFixed(2)}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

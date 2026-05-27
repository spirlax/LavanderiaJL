// src/app/(empleada)/buscar/page.tsx
import React, { Suspense } from 'react';
import Link from 'next/link';
import { StatusBadge, OrderStatus } from '@/components/ui/StatusBadge';
import { SearchInputClient } from '@/components/orders/SearchInputClient';
import { getOrders } from '@/lib/queries/orders';
import styles from './buscar.module.css';

interface OrderItem {
  id: string;
  number: string;
  customerName: string;
  weight: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  time: string;
}

const MOCK_ORDERS: OrderItem[] = [
  { id: '1', number: 'JL-0001', customerName: 'María Gómez', weight: 4.5, total: 12.60, status: 'drying', paymentMethod: 'yape', time: 'Hoy, 09:30 AM' },
  { id: '2', number: 'JL-0002', customerName: 'Carlos Quispe', weight: 6.0, total: 16.80, status: 'received', paymentMethod: 'efectivo', time: 'Hoy, 10:15 AM' },
  { id: '3', number: 'JL-0003', customerName: 'Ana Paredes (Frazada)', weight: 0, total: 25.00, status: 'ready', paymentMethod: 'plin', time: 'Hoy, 11:00 AM' },
  { id: '4', number: 'JL-0004', customerName: 'Cliente Rápido', weight: 3.2, total: 9.00, status: 'delivered', paymentMethod: 'efectivo', time: 'Hoy, 11:45 AM' },
  { id: '5', number: 'JL-0010', customerName: 'Jorge Valdivia', weight: 5.0, total: 14.00, status: 'delivered', paymentMethod: 'yape', time: 'Ayer, 04:20 PM' },
  { id: '6', number: 'JL-0012', customerName: 'Martha Hildebrandt', weight: 0, total: 40.00, status: 'ready', paymentMethod: 'plin', time: 'Ayer, 05:10 PM' },
];

export default async function BuscarPedidoPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || '';
  const cleanQuery = q.trim().toUpperCase();

  let results: OrderItem[] = [];

  if (cleanQuery.length >= 2) {
    try {
      const data = await getOrders();
      results = data
        .filter(order =>
          order.order_number.toUpperCase().includes(cleanQuery) ||
          order.customers.full_name.toUpperCase().includes(cleanQuery) ||
          (order.talonario_number && order.talonario_number.includes(cleanQuery))
        )
        .map(order => ({
          id: order.id,
          number: order.order_number,
          customerName: order.customers.full_name,
          weight: Number(order.total_weight_kg || 0),
          total: Number(order.total),
          status: order.status as OrderStatus,
          paymentMethod: order.payment_method,
          time: new Date(order.created_at).toLocaleDateString()
        }));
    } catch (err) {
      console.error('Error al realizar búsqueda en el servidor:', err);
    }

    // Fallback a mock en local si no hay base
    if (results.length === 0) {
      results = MOCK_ORDERS.filter(order =>
        order.number.toUpperCase().includes(cleanQuery) ||
        order.customerName.toUpperCase().includes(cleanQuery)
      );
    }
  }

  return (
    <div className={`${styles.container} animate-fade-in-up`}>
      <h1 className={styles.title}>Buscar Pedido 🔍</h1>
      <p className={styles.subtitle}>Encuentra órdenes rápidamente por número de ticket, talonario o cliente.</p>

      <Suspense fallback={<div>Cargando barra de búsqueda...</div>}>
        <SearchInputClient />
      </Suspense>

      <div className={styles.resultsList}>
        {results.length > 0 ? (
          results.map((order) => (
            <Link
              href={`/pedidos/${order.id}`}
              key={order.id}
              className={`${styles.resultCard} glassmorphism hover-premium transition-all active-press`}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: '4px' }}>
                  <strong style={{ fontSize: 'var(--font-md)', color: 'var(--dark)' }}>{order.number}</strong>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)' }}>{order.time}</span>
                </div>
                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--gray-800)' }}>
                  {order.customerName}
                </div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)', marginTop: '2px' }}>
                  {order.weight > 0 ? `${order.weight} kg` : 'Artículo especial'} · {order.paymentMethod.toUpperCase()}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--spacing-xs)' }}>
                <StatusBadge status={order.status} />
                <strong style={{ fontSize: 'var(--font-md)', color: 'var(--success)' }}>
                  S/ {order.total.toFixed(2)}
                </strong>
              </div>
            </Link>
          ))
        ) : (
          cleanQuery.length >= 2 && (
            <div className={styles.noResults}>
              📭 No se encontraron coincidencias para "{q}".<br />
              Asegúrate de escribir el nombre o el ticket correctamente.
            </div>
          )
        )}
      </div>
    </div>
  );
}

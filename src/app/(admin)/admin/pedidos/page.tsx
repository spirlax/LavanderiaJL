// src/app/(admin)/pedidos/page.tsx
import React from 'react';
import { getOrders } from '@/lib/queries/orders';
import OrdersClient from './OrdersClient';

// Forzar renderizado en el servidor para que los datos siempre estén frescos
export const dynamic = 'force-dynamic';

export default async function PedidosAdminPage() {
  let initialOrders: any[] = [];
  
  try {
    initialOrders = await getOrders();
  } catch (error) {
    console.error('Error al precargar historial de pedidos desde el servidor:', error);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <div>
        <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--dark)', marginBottom: '2px' }}>
          📋 Historial de Pedidos y Trazabilidad
        </h2>
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-md)' }}>
          Audita el estado de todos los tickets registrados en J&L, filtra por fechas y descarga reportes.
        </p>
      </div>
      
      <OrdersClient initialOrders={initialOrders} />
    </div>
  );
}

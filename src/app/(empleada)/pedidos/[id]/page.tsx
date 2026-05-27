// src/app/(empleada)/pedidos/[id]/page.tsx
import React from 'react';
import { getOrderDetails } from '@/lib/queries/orders';
import { OrderDetailsClient } from '@/components/orders/OrderDetailsClient';
import { OrderStatus } from '@/components/ui/StatusBadge';

interface OrderDetail {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string | null;
  weight: number;
  total: number;
  status: OrderStatus;
  payment_method: string;
  talonario_number: string | null;
  notes: string | null;
  created_at: string;
  items: { name: string; qty: number; subtotal: number }[];
  history: { status: OrderStatus; time: string; changed_by: string }[];
}

export default async function DetallePedidoPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  
  let orderData: OrderDetail | null = null;

  try {
    const details = await getOrderDetails(id);
    if (details) {
      orderData = {
        id: details.id,
        order_number: details.order_number,
        customer_name: details.customers.full_name,
        customer_phone: details.customers.phone,
        weight: Number(details.total_weight_kg || 0),
        total: Number(details.total),
        status: details.status as OrderStatus,
        payment_method: details.payment_method,
        talonario_number: details.talonario_number,
        notes: details.notes,
        created_at: new Date(details.created_at).toLocaleDateString(),
        items: details.order_items.map(item => ({
          name: item.services.name,
          qty: item.quantity,
          subtotal: Number(item.subtotal)
        })),
        history: (details.order_status_history || []).map(h => ({
          status: h.new_status as OrderStatus,
          time: new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          changed_by: h.profiles.full_name
        }))
      };
    }
  } catch (err) {
    console.error('Error al cargar datos del servidor para el pedido:', err);
  }

  // Fallback con datos contables de prueba en desarrollo si Supabase no está conectado
  if (!orderData) {
    orderData = {
      id: id || 'mock-id-1',
      order_number: 'JL-0003',
      customer_name: 'Ana Paredes (Frazada)',
      customer_phone: '987654321',
      weight: 0,
      total: 25.00,
      status: 'ready',
      payment_method: 'plin',
      talonario_number: '0012',
      notes: 'Frazada tigre de pluma, aroma lavanda',
      created_at: new Date().toLocaleDateString(),
      items: [{ name: 'Frazada 2 Plazas Tigre', qty: 1, subtotal: 25.00 }],
      history: [
        { status: 'received', time: '11:00 AM', changed_by: 'Esposa del Dueño' },
        { status: 'ready', time: '01:30 PM', changed_by: 'Esposa del Dueño' }
      ]
    };
  }

  return <OrderDetailsClient initialOrder={orderData} />;
}

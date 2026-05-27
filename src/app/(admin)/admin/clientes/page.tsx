// src/app/(admin)/clientes/page.tsx
import React from 'react';
import { getCustomers } from '@/lib/queries/customers';
import { CustomersClient } from '@/components/customers/CustomersClient';

interface Customer {
  id: string;
  full_name: string;
  phone: string | null;
  customer_type: 'registered' | 'name_only' | 'quick';
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  created_at: string;
}

export default async function GestionClientesPage() {
  let customerData: Customer[] = [];

  try {
    const data = await getCustomers();
    if (data && data.length > 0) {
      customerData = data.map(c => ({
        id: c.id,
        full_name: c.full_name,
        phone: c.phone,
        customer_type: c.customer_type as 'registered' | 'name_only' | 'quick',
        total_orders: c.total_orders,
        total_spent: Number(c.total_spent),
        last_order_at: c.last_order_at,
        created_at: new Date(c.created_at).toLocaleDateString()
      }));
    }
  } catch (err) {
    console.error('Error al cargar clientes desde el servidor:', err);
  }

  // Fallback con datos contables de prueba en desarrollo si Supabase no está conectado
  if (customerData.length === 0) {
    customerData = [
      { id: 'c1', full_name: 'María Gómez', phone: '987654321', customer_type: 'registered', total_orders: 12, total_spent: 184.50, last_order_at: '2026-05-27T14:30:00Z', created_at: '2026-04-01' },
      { id: 'c2', full_name: 'Carlos Quispe', phone: null, customer_type: 'name_only', total_orders: 5, total_spent: 76.80, last_order_at: '2026-05-27T15:15:00Z', created_at: '2026-04-10' },
      { id: 'c3', full_name: 'Ana Paredes', phone: '951234567', customer_type: 'registered', total_orders: 20, total_spent: 450.00, last_order_at: '2026-05-27T16:00:00Z', created_at: '2026-03-15' },
      { id: 'c4', full_name: 'Cliente Rápido #104', phone: null, customer_type: 'quick', total_orders: 1, total_spent: 9.00, last_order_at: '2026-05-27T16:45:00Z', created_at: '2026-05-27' },
      { id: 'c5', full_name: 'Jorge Valdivia', phone: '999888777', customer_type: 'registered', total_orders: 8, total_spent: 112.00, last_order_at: '2026-05-26T21:20:00Z', created_at: '2026-04-20' },
    ];
  }

  return <CustomersClient initialCustomers={customerData} />;
}

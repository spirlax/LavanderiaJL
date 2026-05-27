// src/lib/queries/orders.ts
import { createClient } from '../supabase/server';
import { Database } from '@/types/database';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type OrderStatusHistory = Database['public']['Tables']['order_status_history']['Row'];

export interface OrderWithCustomerAndItems extends Order {
  customers: {
    full_name: string;
    phone: string | null;
    customer_type: 'registered' | 'name_only' | 'quick';
  };
  profiles: {
    full_name: string;
  };
  order_items: (OrderItem & {
    services: {
      name: string;
      service_type: string;
    };
  })[];
  order_status_history?: (OrderStatusHistory & {
    profiles: {
      full_name: string;
    };
  })[];
}

/**
 * Obtiene los pedidos del día actual (Hoy)
 * Optimizado para la pantalla de inicio del celular de las empleadas
 */
export async function getTodayOrders(): Promise<OrderWithCustomerAndItems[]> {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers (
        full_name,
        phone,
        customer_type
      ),
      profiles (
        full_name
      ),
      order_items (
        *,
        services (
          name,
          service_type
        )
      )
    `)
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener pedidos de hoy:', error.message);
    throw new Error('No se pudieron recuperar los pedidos de hoy.');
  }

  return (data as any) || [];
}

/**
 * Obtiene todos los pedidos con soporte de filtros opcionales
 * Optimizado para las tablas avanzadas del dueño en su laptop (admin)
 */
export async function getOrders(filters?: {
  status?: Order['status'];
  customerId?: string;
  startDate?: string;
  endDate?: string;
  receivedBy?: string;
}): Promise<OrderWithCustomerAndItems[]> {
  const supabase = await createClient();
  let query = supabase
    .from('orders')
    .select(`
      *,
      customers (
        full_name,
        phone,
        customer_type
      ),
      profiles (
        full_name
      ),
      order_items (
        *,
        services (
          name,
          service_type
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (filters) {
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.customerId) query = query.eq('customer_id', filters.customerId);
    if (filters.receivedBy) query = query.eq('received_by', filters.receivedBy);
    if (filters.startDate) query = query.gte('created_at', filters.startDate);
    if (filters.endDate) query = query.lte('created_at', filters.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error en consulta avanzada de pedidos:', error.message);
    throw new Error('No se pudo obtener el historial de pedidos.');
  }

  return (data as any) || [];
}

/**
 * Obtiene la información al completo de un solo pedido (ficha técnica)
 * Incluye el historial de estados de trazabilidad y quién los ejecutó
 */
export async function getOrderDetails(id: string): Promise<OrderWithCustomerAndItems | null> {
  const supabase = await createClient();

  // 1. Obtener cabecera, cliente e items del pedido
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select(`
      *,
      customers (
        full_name,
        phone,
        customer_type
      ),
      profiles (
        full_name
      ),
      order_items (
        *,
        services (
          name,
          service_type
        )
      )
    `)
    .eq('id', id)
    .single();

  if (orderError || !orderData) {
    console.error(`Error al obtener pedido ${id}:`, orderError?.message);
    return null;
  }

  // 2. Obtener historial de auditoría de estados
  const { data: historyData, error: historyError } = await supabase
    .from('order_status_history')
    .select(`
      *,
      profiles (
        full_name
      )
    `)
    .eq('order_id', id)
    .order('created_at', { ascending: true });

  if (historyError) {
    console.error(`Error al obtener historial para el pedido ${id}:`, historyError.message);
  }

  const result: OrderWithCustomerAndItems = {
    ...(orderData as any),
    order_status_history: historyData || [],
  };

  return result;
}

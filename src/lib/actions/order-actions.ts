// src/lib/actions/order-actions.ts
'use server';

import { createClient } from '../supabase/server';
import { orderSchema, OrderInput, UpdateOrderStatusInput } from '../validations/order';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from './customer-actions';

/**
 * Registra un nuevo pedido al completo (Transaccional)
 * Pagado por adelantado por el cliente en el local
 */
export async function createOrder(input: OrderInput): Promise<ActionResponse<any>> {
  // 1. Validar esquema con Zod
  const validationResult = orderSchema.safeParse(input);
  if (!validationResult.success) {
    const formattedErrors: Record<string, string[]> = {};
    const errorDetails = validationResult.error.flatten().fieldErrors;
    
    Object.keys(errorDetails).forEach((key) => {
      formattedErrors[key] = errorDetails[key as keyof typeof errorDetails] || [];
    });

    return {
      success: false,
      message: 'Error de validación en los datos del pedido.',
      errors: formattedErrors
    };
  }

  const {
    customer_id,
    received_by,
    talonario_number,
    total_weight_kg,
    total,
    payment_method,
    payment_reference,
    notes,
    items
  } = validationResult.data;

  const supabase = await createClient();

  // 2. Autogenerar número de orden secuencial correlativo (JL-0001, JL-0002...)
  // Para el MVP contamos los pedidos actuales de forma segura y veloz
  const { count, error: countError } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true });

  if (countError) {
    console.error('Error al calcular el número correlativo de orden:', countError.message);
    return {
      success: false,
      message: 'Error al inicializar el número del pedido.'
    };
  }

  const currentCount = count || 0;
  const orderNumber = `JL-${String(currentCount + 1).padStart(4, '0')}`;

  // Estimamos la fecha de entrega por defecto en 24 horas a partir de ahora
  const estimatedDelivery = new Date();
  estimatedDelivery.setHours(estimatedDelivery.getHours() + 24);

  // 3. Insertar Cabecera del Pedido
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      order_number: orderNumber,
      customer_id,
      received_by,
      status: 'received',
      total_weight_kg,
      total,
      payment_method,
      payment_reference,
      notes,
      talonario_number,
      estimated_delivery: estimatedDelivery.toISOString()
    }] as any)
    .select()
    .single() as any;

  if (orderError || !order) {
    console.error('Error al insertar cabecera del pedido:', orderError?.message);
    return {
      success: false,
      message: 'No se pudo crear la orden en el sistema contable.'
    };
  }

  // 4. Insertar los ítems de detalle asociados a la orden
  const itemsPayload = items.map((item) => ({
    order_id: order.id,
    service_id: item.service_id,
    description: item.description || null,
    quantity: item.quantity,
    weight_kg: item.weight_kg || null,
    unit_price: item.unit_price,
    subtotal: item.subtotal
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsPayload as any);

  if (itemsError) {
    console.error('Error al insertar ítems del pedido:', itemsError.message);
    // Para robustez borramos la cabecera huérfana de inmediato
    await supabase.from('orders').delete().eq('id', order.id);
    return {
      success: false,
      message: 'Error al registrar el desglose del pedido. Operación cancelada.'
    };
  }

  // 5. Registrar estado inicial 'received' en el historial de trazabilidad
  const { error: historyError } = await supabase
    .from('order_status_history')
    .insert([{
      order_id: order.id,
      previous_status: null,
      new_status: 'received',
      changed_by: received_by,
      notes: 'Pedido recibido y cobrado en el local'
    }] as any);

  if (historyError) {
    console.error('Error al registrar historial de auditoría de orden:', historyError.message);
  }

  // 6. Actualizar las estadísticas de consumo acumulado del cliente de forma asíncrona
  const { data: customer } = await supabase
    .from('customers')
    .select('total_orders, total_spent')
    .eq('id', customer_id)
    .single() as any;

  if (customer) {
    const newTotalOrders = (customer.total_orders || 0) + 1;
    const newTotalSpent = Number(customer.total_spent || 0) + total;

    await (supabase.from('customers') as any)
      .update({
        total_orders: newTotalOrders,
        total_spent: newTotalSpent,
        last_order_at: new Date().toISOString()
      })
      .eq('id', customer_id);
  }

  // 7. Revalidar cachés de rutas claves para refrescar la UI al instante
  revalidatePath('/'); // Móvil operadora (pedidos de hoy)
  revalidatePath('/admin'); // Dashboard dueño (métricas BI)
  revalidatePath('/admin/pedidos'); // Lista contable de pedidos

  return {
    success: true,
    message: `Pedido ${orderNumber} registrado y pagado con éxito.`,
    data: order
  };
}

/**
 * Actualiza el estado operativo de un pedido e inserta evento de auditoría
 * Para celulares de las operadoras (botones rápidos)
 */
export async function updateOrderStatus(input: UpdateOrderStatusInput): Promise<ActionResponse<any>> {
  const { order_id, new_status, changed_by, notes } = input;
  const supabase = await createClient();

  // 1. Obtener el estado actual del pedido para auditar el cambio
  const { data: currentOrder, error: currentOrderError } = await supabase
    .from('orders')
    .select('status')
    .eq('id', order_id)
    .single() as any;

  if (currentOrderError || !currentOrder) {
    console.error('Error al obtener estado actual del pedido:', currentOrderError?.message);
    return {
      success: false,
      message: 'No se encontró el pedido a actualizar.'
    };
  }

  const oldStatus = currentOrder.status;

  // Evitar escrituras redundantes del mismo estado
  if (oldStatus === new_status) {
    return {
      success: true,
      message: 'El pedido ya se encuentra en el estado indicado.'
    };
  }

  // 2. Modificar el estado en la cabecera
  const updatePayload: any = {
    status: new_status
  };

  // Si pasa a entregado, registrar fecha de entrega
  if (new_status === 'delivered') {
    updatePayload.delivered_at = new Date().toISOString();
  }

  const { error: updateError } = await (supabase.from('orders') as any)
      .update(updatePayload)
      .eq('id', order_id);

  if (updateError) {
    console.error('Error al cambiar estado del pedido:', updateError.message);
    return {
      success: false,
      message: 'No se pudo cambiar el estado del pedido en la base de datos.'
    };
  }

  // 3. Crear el log en el historial de trazabilidad (auditoría obligatoria de caja/pedidos)
  const { error: historyError } = await supabase
    .from('order_status_history')
    .insert([{
      order_id,
      previous_status: oldStatus,
      new_status,
      changed_by,
      notes: notes || `Cambio de estado operativo a ${new_status}`
    }] as any);

  if (historyError) {
    console.error('Error al insertar historial de cambios:', historyError.message);
  }

  // 4. Revalidar rutas para refrescar listados instantáneamente en celular y laptop
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/pedidos');

  return {
    success: true,
    message: 'Estado del pedido actualizado exitosamente.'
  };
}

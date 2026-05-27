// src/lib/queries/reports.ts
import { createClient } from '../supabase/server';

export interface CashierSummary {
  employee_id: string;
  employee_name: string;
  orders_count: number;
  cash_total: number;
  yape_total: number;
  plin_total: number;
  transfer_total: number;
  grand_total: number;
}

export interface TodayStats {
  revenue_total: number;
  orders_count: number;
  cash_total: number;
  yape_total: number;
  plin_total: number;
  transfer_total: number;
}

/**
 * Obtiene el resumen financiero rápido de Hoy
 * Para mostrar en las tarjetas KPI del Dashboard del Dueño
 */
export async function getTodayFinancialSummary(): Promise<TodayStats> {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await (supabase
    .from('orders')
    .select('total, payment_method')
    .gte('created_at', today.toISOString())
    .neq('status', 'cancelled') as any); // Omitir cancelados en la sumatoria contable

  if (error) {
    console.error('Error al calcular resumen financiero de hoy:', error.message);
    return { revenue_total: 0, orders_count: 0, cash_total: 0, yape_total: 0, plin_total: 0, transfer_total: 0 };
  }

  const stats = (data || []).reduce((acc: TodayStats, order: any) => {
    acc.orders_count += 1;
    const amount = Number(order.total);
    acc.revenue_total += amount;

    if (order.payment_method === 'cash') acc.cash_total += amount;
    else if (order.payment_method === 'yape') acc.yape_total += amount;
    else if (order.payment_method === 'plin') acc.plin_total += amount;
    else if (order.payment_method === 'transfer') acc.transfer_total += amount;

    return acc;
  }, {
    revenue_total: 0,
    orders_count: 0,
    cash_total: 0,
    yape_total: 0,
    plin_total: 0,
    transfer_total: 0
  });

  return stats;
}

/**
 * Obtiene el reporte de caja diario desglosado por empleada ("quién cobró qué")
 * Este es el core del BI del Dueño para evitar robos y cruzar información
 */
export async function getDailyCashClosingData(dateStr?: string): Promise<{
  cashiers: CashierSummary[];
  grand_totals: {
    orders_count: number;
    cash_total: number;
    yape_total: number;
    plin_total: number;
    transfer_total: number;
    grand_total: number;
  };
  is_closed: boolean;
}> {
  const supabase = await createClient();
  
  // Si no se provee fecha, asumimos el día de hoy en hora local de Lima
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Obtener todas las órdenes del día con datos del receptor (empleada)
  const { data: orders, error: ordersError } = await (supabase
    .from('orders')
    .select(`
      total,
      payment_method,
      received_by,
      profiles (
        full_name
      )
    `)
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString())
    .neq('status', 'cancelled') as any);

  if (ordersError) {
    console.error('Error al agrupar caja diaria:', ordersError.message);
    throw new Error('No se pudo procesar el cuadre de caja diario.');
  }

  // 2. Comprobar si la caja de este día ya tiene un cierre oficial registrado
  const dateOnlyStr = startOfDay.toISOString().split('T')[0];
  const { data: closeData } = await supabase
    .from('daily_cash_close')
    .select('id')
    .eq('date', dateOnlyStr)
    .maybeSingle();

  // 3. Procesar agrupación por empleada ("quién cobró qué")
  const cashierMap: Record<string, CashierSummary> = {};

  (orders || []).forEach((order: any) => {
    const cashierId = order.received_by;
    const cashierName = order.profiles?.full_name || 'Personal Desconocido';
    const amount = Number(order.total);

    if (!cashierMap[cashierId]) {
      cashierMap[cashierId] = {
        employee_id: cashierId,
        employee_name: cashierName,
        orders_count: 0,
        cash_total: 0,
        yape_total: 0,
        plin_total: 0,
        transfer_total: 0,
        grand_total: 0
      };
    }

    const cashier = cashierMap[cashierId];
    cashier.orders_count += 1;
    cashier.grand_total += amount;

    if (order.payment_method === 'cash') cashier.cash_total += amount;
    else if (order.payment_method === 'yape') cashier.yape_total += amount;
    else if (order.payment_method === 'plin') cashier.plin_total += amount;
    else if (order.payment_method === 'transfer') cashier.transfer_total += amount;
  });

  const cashiers = Object.values(cashierMap);

  // 4. Calcular Totales Generales
  const grand_totals = cashiers.reduce((acc, c) => {
    acc.orders_count += c.orders_count;
    acc.cash_total += c.cash_total;
    acc.yape_total += c.yape_total;
    acc.plin_total += c.plin_total;
    acc.transfer_total += c.transfer_total;
    acc.grand_total += c.grand_total;
    return acc;
  }, {
    orders_count: 0,
    cash_total: 0,
    yape_total: 0,
    plin_total: 0,
    transfer_total: 0,
    grand_total: 0
  });

  return {
    cashiers,
    grand_totals,
    is_closed: !!closeData
  };
}

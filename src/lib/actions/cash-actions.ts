// src/lib/actions/cash-actions.ts
'use server';

import { createClient } from '../supabase/server';
import { DailyCashCloseInput } from '../validations/order';
import { getDailyCashClosingData } from '../queries/reports';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from './customer-actions';

/**
 * Ejecuta el cierre de caja oficial contable para un día específico
 * Acción exclusiva para el Dueño (Admin)
 */
export async function closeDailyCash(input: DailyCashCloseInput): Promise<ActionResponse<any>> {
  const { date, closed_by, notes } = input;
  const supabase = await createClient();

  // 1. Validar a nivel de seguridad en el servidor que quien ejecuta es un Admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', closed_by)
    .single() as any;

  if (profileError || !profile || profile.role !== 'admin') {
    return {
      success: false,
      message: 'Acceso denegado. Solo el dueño puede realizar el cierre de caja oficial.'
    };
  }

  // 2. Comprobar si ya existe un cierre de caja para esa fecha (evitar duplicados)
  const { data: existingClose } = await supabase
    .from('daily_cash_close')
    .select('id')
    .eq('date', date)
    .maybeSingle();

  if (existingClose) {
    return {
      success: false,
      message: `La caja para la fecha ${date} ya se encuentra cerrada oficialmente.`
    };
  }

  // 3. Obtener los totales matemáticos exactos del día desde el servidor
  let closingData;
  try {
    closingData = await getDailyCashClosingData(date);
  } catch (err) {
    return {
      success: false,
      message: 'No se pudieron recuperar los totales del día para cerrar la caja.'
    };
  }

  const { grand_totals } = closingData;

  // 4. Insertar el registro oficial de Cierre de Caja Diario en Supabase
  const { data: closeRecord, error: closeError } = await supabase
    .from('daily_cash_close')
    .insert([{
      date,
      total_orders: grand_totals.orders_count,
      total_cash: grand_totals.cash_total,
      total_yape: grand_totals.yape_total,
      total_plin: grand_totals.plin_total,
      total_transfer: grand_totals.transfer_total,
      grand_total: grand_totals.grand_total,
      closed_by,
      notes: notes || 'Cierre de caja diario ejecutado exitosamente'
    }] as any)
    .select()
    .single() as any;

  if (closeError) {
    console.error('Error al guardar registro oficial de cierre de caja:', closeError.message);
    return {
      success: false,
      message: 'No se pudo guardar el registro del cierre de caja oficial.'
    };
  }

  // 5. Revalidar rutas para actualizar el dashboard del dueño de forma inmediata
  revalidatePath('/admin');
  revalidatePath('/admin/caja');

  return {
    success: true,
    message: `Cierre de caja para el día ${date} completado con éxito por un total de S/ ${grand_totals.grand_total.toFixed(2)}.`,
    data: closeRecord
  };
}

// src/lib/actions/service-actions.ts
'use server';

import { createClient } from '../supabase/server';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from './customer-actions';

export interface ServiceInput {
  name: string;
  service_type: 'wash_per_kg' | 'drying' | 'drying_spin' | 'ironing' | 'special_item';
  price_per_kg?: number | null;
  price_per_unit?: number | null;
  estimated_hours?: number;
  sort_order?: number;
}

/**
 * Obtiene todos los servicios y artículos especiales desde la base de datos
 */
export async function getServices(): Promise<any[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error al obtener catálogo de servicios:', error.message);
    return [];
  }

  return data || [];
}

/**
 * Registra un nuevo servicio o artículo especial en Supabase
 */
export async function createService(input: ServiceInput): Promise<ActionResponse<any>> {
  const supabase = await createClient();

  if (!input.name.trim()) {
    return { success: false, message: 'El nombre del servicio es obligatorio.' };
  }

  const payload = {
    name: input.name.trim(),
    service_type: input.service_type,
    price_per_kg: input.service_type === 'special_item' ? null : (input.price_per_kg || 0),
    price_per_unit: input.service_type === 'special_item' ? (input.price_per_unit || 0) : null,
    estimated_hours: input.estimated_hours || 24,
    sort_order: input.sort_order || 0,
    is_active: true
  };

  const { data, error } = await ((supabase.from('services') as any)
    .insert([payload])
    .select()
    .single() as any);

  if (error) {
    console.error('Error al guardar servicio:', error.message);
    return { success: false, message: 'No se pudo guardar el servicio: ' + error.message };
  }

  revalidatePath('/admin/configuracion');
  revalidatePath('/nuevo');
  revalidatePath('/');

  return {
    success: true,
    message: 'Servicio registrado exitosamente en la base de datos.',
    data
  };
}

/**
 * Actualiza un servicio o artículo especial existente en la base de datos
 */
export async function updateService(id: string, input: ServiceInput): Promise<ActionResponse<any>> {
  const supabase = await createClient();

  if (!input.name.trim()) {
    return { success: false, message: 'El nombre del servicio es obligatorio.' };
  }

  const payload = {
    name: input.name.trim(),
    service_type: input.service_type,
    price_per_kg: input.service_type === 'special_item' ? null : (input.price_per_kg || 0),
    price_per_unit: input.service_type === 'special_item' ? (input.price_per_unit || 0) : null,
    estimated_hours: input.estimated_hours || 24,
    sort_order: input.sort_order || 0
  };

  const { data, error } = await ((supabase.from('services') as any)
    .update(payload)
    .eq('id', id)
    .select()
    .single() as any);

  if (error) {
    console.error('Error al actualizar servicio:', error.message);
    return { success: false, message: 'No se pudo actualizar el servicio: ' + error.message };
  }

  revalidatePath('/admin/configuracion');
  revalidatePath('/nuevo');
  revalidatePath('/');

  return {
    success: true,
    message: 'Servicio actualizado exitosamente.',
    data
  };
}

/**
 * Elimina (o desactiva) un servicio de la base de datos
 */
export async function deleteService(id: string): Promise<ActionResponse<any>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar servicio:', error.message);
    return { success: false, message: 'No se pudo eliminar el servicio porque podría tener pedidos vinculados.' };
  }

  revalidatePath('/admin/configuracion');
  revalidatePath('/nuevo');
  revalidatePath('/');

  return {
    success: true,
    message: 'Servicio eliminado exitosamente.'
  };
}

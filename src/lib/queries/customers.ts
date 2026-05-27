// src/lib/queries/customers.ts
import { createClient } from '../supabase/server';
import { Database } from '@/types/database';

type Customer = Database['public']['Tables']['customers']['Row'];

/**
 * Obtiene todos los clientes registrados
 */
export async function getCustomers(): Promise<Customer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener clientes:', error.message);
    throw new Error('No se pudo obtener la lista de clientes.');
  }

  return data || [];
}

/**
 * Obtiene el detalle de un cliente específico por su ID
 */
export async function getCustomerById(id: string): Promise<Customer | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error al obtener cliente ${id}:`, error.message);
    return null;
  }

  return data;
}

/**
 * Busca clientes de forma rápida por coincidencia en Nombre o Teléfono
 * Optimizado para autocompletar en el formulario del celular de las operadoras
 */
export async function searchCustomers(query: string): Promise<Customer[]> {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`full_name.ilike.%${cleanQuery}%,phone.ilike.%${cleanQuery}%`)
    .limit(10);

  if (error) {
    console.error('Error en búsqueda rápida de clientes:', error.message);
    return [];
  }

  return data || [];
}

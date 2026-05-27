// src/lib/queries/customers-client.ts
import { createClient } from '../supabase/client';
import { Database } from '@/types/database';

type Customer = Database['public']['Tables']['customers']['Row'];

/**
 * Busca clientes de forma rápida por coincidencia en Nombre o Teléfono (Ejecutado en el cliente/navegador)
 * Optimizado para autocompletar en el formulario del celular de las operadoras
 */
export async function searchCustomersClient(query: string): Promise<Customer[]> {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) return [];

  // Usamos el cliente del navegador de Supabase (sin next/headers)
  const supabase = createClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`full_name.ilike.%${cleanQuery}%,phone.ilike.%${cleanQuery}%`)
    .limit(10);

  if (error) {
    console.error('Error en búsqueda rápida de clientes en navegador:', error.message);
    return [];
  }

  return data || [];
}

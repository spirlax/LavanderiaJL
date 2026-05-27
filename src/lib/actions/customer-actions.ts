// src/lib/actions/customer-actions.ts
'use server';

import { createClient } from '../supabase/server';
import { customerSchema, CustomerInput } from '../validations/customer';
import { revalidatePath } from 'next/cache';

export interface ActionResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Registra un cliente de forma segura en la base de datos (Zod validado)
 * Funciona tanto para el registro rápido móvil como para el panel del administrador
 */
export async function createCustomer(input: CustomerInput): Promise<ActionResponse<any>> {
  // 1. Validar esquema en el servidor con Zod
  const validationResult = customerSchema.safeParse(input);
  if (!validationResult.success) {
    const formattedErrors: Record<string, string[]> = {};
    const errorDetails = validationResult.error.flatten().fieldErrors;
    
    Object.keys(errorDetails).forEach((key) => {
      formattedErrors[key] = errorDetails[key as keyof typeof errorDetails] || [];
    });

    return {
      success: false,
      message: 'Error de validación en los datos del cliente.',
      errors: formattedErrors
    };
  }

  const { full_name, phone, customer_type, whatsapp_opt_in, notes } = validationResult.data;

  // 2. Inicializar cliente Supabase del servidor
  const supabase = await createClient();

  // 3. Crear el payload de inserción
  const insertPayload: any = {
    full_name,
    customer_type,
    phone: phone || null,
    whatsapp_opt_in,
    notes: notes || null
  };

  // Guardar fecha de consentimiento si se aceptó WhatsApp (requisito legal en Perú)
  if (whatsapp_opt_in) {
    insertPayload.whatsapp_opt_in_at = new Date().toISOString();
  }

  // 4. Ejecutar inserción en Supabase
  const { data, error } = await supabase
    .from('customers')
    .insert([insertPayload] as any)
    .select()
    .single() as any;

  if (error) {
    console.error('Error al insertar cliente:', error.message);
    return {
      success: false,
      message: 'No se pudo registrar el cliente en el sistema. Inténtalo de nuevo.'
    };
  }

  // 5. Revalidar caché de Next.js para actualizar la UI en tiempo real
  revalidatePath('/admin/clientes');
  revalidatePath('/'); // Dashboard móvil de empleadas

  return {
    success: true,
    message: 'Cliente registrado exitosamente.',
    data
  };
}

/**
 * Importa clientes en lote desde una plantilla o copiado directo de Excel
 */
export async function bulkImportCustomers(
  customers: Array<{ full_name: string; phone?: string | null; notes?: string | null }>
): Promise<ActionResponse<any>> {
  const supabase = await createClient();

  const payload = customers.map((c) => ({
    full_name: c.full_name,
    phone: c.phone || null,
    customer_type: 'registered' as const,
    whatsapp_opt_in: false,
    notes: c.notes || 'Importado de Excel',
  }));

  const { data, error } = await (supabase
    .from('customers')
    .insert(payload as any)
    .select() as any);

  if (error) {
    console.error('Error al importar clientes en lote:', error.message);
    return {
      success: false,
      message: 'Error al importar los clientes: ' + error.message,
    };
  }

  revalidatePath('/admin/clientes');
  revalidatePath('/');

  return {
    success: true,
    message: `${data.length} clientes importados con éxito desde el archivo Excel.`,
    data,
  };
}

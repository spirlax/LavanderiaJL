// src/lib/validations/order.ts
import { z } from 'zod';

// Esquema de validación para cada ítem del pedido
export const orderItemSchema = z.object({
  service_id: z.string().uuid({ message: 'Servicio no válido.' }),
  description: z.string().max(200).optional().nullable(),
  quantity: z.number().int().min(1, { message: 'La cantidad mínima es 1.' }),
  weight_kg: z.number().positive({ message: 'El peso debe ser un número positivo.' }).optional().nullable(),
  unit_price: z.number().min(0, { message: 'El precio unitario no puede ser negativo.' }),
  subtotal: z.number().min(0),
});

// Esquema de validación para el Pedido completo
export const orderSchema = z.object({
  customer_id: z.string().uuid({ message: 'Cliente seleccionado no válido.' }),
  received_by: z.string().uuid({ message: 'Debe registrar la empleada que cobró.' }),
  talonario_number: z.string()
    .transform((val) => val?.trim())
    .optional()
    .nullable(),
  total_weight_kg: z.number()
    .nonnegative({ message: 'El peso total no puede ser negativo.' })
    .optional()
    .nullable(),
  total: z.number()
    .positive({ message: 'El total del cobro debe ser mayor a cero.' }),
  payment_method: z.enum(['cash', 'yape', 'plin', 'transfer'], {
    message: 'Método de pago no soportado.',
  }),
  payment_reference: z.string()
    .transform((val) => val?.trim())
    .optional()
    .nullable(),
  notes: z.string().max(300, { message: 'La nota del pedido no puede superar los 300 caracteres.' }).optional().nullable(),
  items: z.array(orderItemSchema).min(1, { message: 'El pedido debe tener al menos 1 servicio registrado.' }),
}).refine((data) => {
  // Regla contable: Si el pago se realiza por Yape o Plin, se recomienda registrar el número de operación
  if ((data.payment_method === 'yape' || data.payment_method === 'plin') && 
      (!data.payment_reference || data.payment_reference === '')) {
    // Es una recomendación, pero podemos alertar o hacerlo flexible para agilizar el MVP
    return true;
  }
  return true;
});

export type OrderInput = z.infer<typeof orderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type UpdateOrderStatusInput = {
  order_id: string;
  new_status: 'received' | 'washing' | 'drying' | 'ironing' | 'ready' | 'delivered' | 'cancelled';
  changed_by: string;
  notes?: string;
};
export type DailyCashCloseInput = {
  date: string;
  closed_by: string;
  notes?: string;
};

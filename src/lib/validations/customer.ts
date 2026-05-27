// src/lib/validations/customer.ts
import { z } from 'zod';

export const customerSchema = z.object({
  customer_type: z.enum(['registered', 'name_only', 'quick']).default('registered'),
  full_name: z.string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
    .max(80, { message: 'El nombre es demasiado largo.' }),
  phone: z.string()
    .transform((val) => val?.trim())
    .optional()
    .nullable()
    .refine((val) => {
      if (!val) return true;
      // Validar formato de celular en Perú: empieza con 9 y tiene 9 dígitos
      const phoneRegex = /^9\d{8}$/;
      return phoneRegex.test(val);
    }, {
      message: 'El teléfono debe ser un celular peruano válido de 9 dígitos (empieza con 9).',
    }),
  whatsapp_opt_in: z.boolean().default(false),
  notes: z.string().max(300, { message: 'La nota no puede superar los 300 caracteres.' }).optional().nullable(),
}).refine((data) => {
  // Regla legal: Si acepta avisos de WhatsApp, DEBE registrarse un número telefónico
  if (data.whatsapp_opt_in && (!data.phone || data.phone === '')) {
    return false;
  }
  return true;
}, {
  message: 'Para activar las notificaciones por WhatsApp debes registrar el número telefónico.',
  path: ['phone'],
});

export type CustomerInput = z.infer<typeof customerSchema>;

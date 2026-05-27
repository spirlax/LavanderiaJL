// src/lib/supabase/admin.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Cliente administrativo con service_role key que salta las RLS (Row Level Security)
// Debe utilizarse EXCLUSIVAMENTE en el entorno del servidor para tareas que requieran privilegios de administrador.
export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Variables de entorno de administrador de Supabase ausentes.');
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

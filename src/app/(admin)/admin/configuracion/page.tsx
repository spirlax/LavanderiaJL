// src/app/(admin)/admin/configuracion/page.tsx
import React from 'react';
import { getServices } from '@/lib/actions/service-actions';
import ConfiguracionClient from './ConfiguracionClient';

export const dynamic = 'force-dynamic';

export default async function ConfiguracionPage() {
  let initialServices: any[] = [];

  try {
    initialServices = await getServices();
  } catch (error) {
    console.error('Error al precargar servicios desde Supabase:', error);
  }

  return (
    <ConfiguracionClient initialServices={initialServices} />
  );
}

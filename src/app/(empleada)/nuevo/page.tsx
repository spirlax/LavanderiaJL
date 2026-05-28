// src/app/(empleada)/nuevo/page.tsx
import React from 'react';
import { getServices } from '@/lib/actions/service-actions';
import NuevoOrderClient from './NuevoOrderClient';

export const dynamic = 'force-dynamic';

export default async function NuevoPedidoPage() {
  let initialServices: any[] = [];
  
  try {
    initialServices = await getServices();
  } catch (error) {
    console.error('Error al cargar catálogo de servicios desde el servidor:', error);
  }

  return (
    <NuevoOrderClient initialServices={initialServices} />
  );
}

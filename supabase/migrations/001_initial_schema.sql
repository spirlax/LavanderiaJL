-- supabase/migrations/001_initial_schema.sql
-- Esquema de Base de Datos inicial para Lavandería J&L MVP

-- ============================================
-- 1. ENUMS (Tipos definidos)
-- ============================================
CREATE TYPE user_role AS ENUM ('admin', 'operator');

CREATE TYPE order_status AS ENUM (
  'received',      -- Recibido
  'washing',       -- Lavando
  'drying',        -- Secando
  'ironing',       -- Planchando
  'ready',         -- Listo para recoger
  'delivered',     -- Entregado
  'cancelled'      -- Cancelado
);

CREATE TYPE payment_method AS ENUM (
  'cash',          -- Efectivo
  'yape',          -- Yape
  'plin',          -- Plin
  'transfer'       -- Transferencia bancaria
);

CREATE TYPE service_type AS ENUM (
  'wash_per_kg',   -- Lavado x Kilo
  'drying',        -- Secado solo
  'drying_spin',   -- Secado + Centrifugado
  'ironing',       -- Planchado
  'special_item'   -- Artículos especiales (Frazadas, casacas, zapatillas, etc.)
);

CREATE TYPE customer_type AS ENUM (
  'registered',    -- Registrado con Nombre + Teléfono (Avisos WhatsApp)
  'name_only',     -- Solo nombre (Sin teléfono)
  'quick'          -- Cliente rápido autogenerado (ej: Cliente #104)
);

CREATE TYPE machine_status AS ENUM (
  'working',       -- Funcionando
  'review',        -- En revisión
  'repair',        -- En reparación
  'out_of_service' -- Fuera de servicio
);

CREATE TYPE machine_type AS ENUM (
  'washer',        -- Lavadora
  'dryer',         -- Secadora
  'ironer',        -- Plancha / Rodillo
  'other'          -- Otros
);

-- ============================================
-- 2. TABLAS
-- ============================================

-- A. Perfiles de usuario (Extiende auth.users de Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'operator',
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- B. Clientes
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_type customer_type NOT NULL DEFAULT 'registered',
  full_name TEXT NOT NULL,
  phone TEXT, -- Opcional
  whatsapp_opt_in BOOLEAN NOT NULL DEFAULT false,
  whatsapp_opt_in_at TIMESTAMPTZ, -- Cumplimiento Ley 29733 Perú
  notes TEXT,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  last_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_phone_for_whatsapp CHECK (
    (whatsapp_opt_in = false) OR (whatsapp_opt_in = true AND phone IS NOT NULL AND phone <> '')
  )
);

-- C. Catálogo de Servicios
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  service_type service_type NOT NULL,
  price_per_kg NUMERIC(8,2), -- Nulo si es cobro por unidad
  price_per_unit NUMERIC(8,2), -- Nulo si es cobro por peso
  estimated_hours INTEGER NOT NULL DEFAULT 24,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_price_defined CHECK (
    (price_per_kg IS NOT NULL) OR (price_per_unit IS NOT NULL)
  )
);

-- D. Pedidos (Cabecera — Pago 100% Adelantado)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- JL-0001, JL-0002...
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  received_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT, -- Trazabilidad de caja
  status order_status NOT NULL DEFAULT 'received',
  total_weight_kg NUMERIC(6,2),
  total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  payment_method payment_method NOT NULL,
  payment_reference TEXT, -- Nro de Yape/Plin para cuadre contable
  notes TEXT,
  talonario_number TEXT, -- Coexistencia con talonario físico
  estimated_delivery TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  delivered_to TEXT, -- Nombre de quien recoge si es un tercero
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- E. Items de Pedidos (Detalle)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  description TEXT, -- Opciones (ej: "Con mucho suavizante", "Frazada tigre")
  quantity INTEGER NOT NULL DEFAULT 1,
  weight_kg NUMERIC(6,2), -- Opcional
  unit_price NUMERIC(8,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- F. Historial de Cambios de Estado (Trazabilidad operativa)
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  previous_status order_status,
  new_status order_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- G. Cierre de Caja Diario (BI y Control Financiero)
CREATE TABLE IF NOT EXISTS public.daily_cash_close (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_cash NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_yape NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_plin NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_transfer NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  grand_total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  closed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT, -- Solo Dueño (Admin)
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- H. Control de Maquinaria
CREATE TABLE IF NOT EXISTS public.machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  machine_type machine_type NOT NULL,
  capacity_kg NUMERIC(6,2),
  status machine_status NOT NULL DEFAULT 'working',
  status_note TEXT,
  last_maintenance TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- I. Inventario de Suministros
CREATE TABLE IF NOT EXISTS public.supplies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL, -- 'litros', 'kg', 'bolsas'
  current_stock NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  min_stock NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  cost_per_unit NUMERIC(8,2),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- J. Configuración del Negocio
CREATE TABLE IF NOT EXISTS public.business_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL DEFAULT 'Lavandería J&L',
  address TEXT NOT NULL DEFAULT 'Av. Carlos Izaguirre Mz B Lt 19 Urb. Kama - S.M.P.',
  phone TEXT,
  currency TEXT NOT NULL DEFAULT 'PEN',
  logo_url TEXT,
  order_prefix TEXT NOT NULL DEFAULT 'JL',
  next_order_number INTEGER NOT NULL DEFAULT 1,
  schedule TEXT NOT NULL DEFAULT 'Lunes a Sábado, 8am - 7pm',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 3. TRIGGERS Y FUNCIONES DE ACTUALIZACIÓN
-- ============================================

-- A. Función para mantener actualizados los campos 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- B. Triggers de actualización automática de fecha de modificación
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_machines_updated_at BEFORE UPDATE ON public.machines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_supplies_updated_at BEFORE UPDATE ON public.supplies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_business_config_updated_at BEFORE UPDATE ON public.business_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

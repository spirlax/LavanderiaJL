-- supabase/migrations/002_rls_policies.sql
-- Políticas de Seguridad de Fila (RLS) para Lavandería J&L MVP

-- ============================================
-- 1. ACTIVACIÓN DE RLS EN TABLAS CLAVE
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_cash_close ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_config ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. FUNCIONES AUXILIARES DE ANÁLISIS DE ROL
-- ============================================

-- Obtener el rol del usuario autenticado actual desde la tabla 'profiles'
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Comprobar si el usuario actual es un Administrador (Dueño)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Comprobar si el usuario actual está activo en el sistema
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_active FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- 3. POLÍTICAS DE ACCESO DETALLADAS
-- ============================================

-- --------------------------------------------
-- A. Tabla: PROFILES
-- --------------------------------------------
-- Cualquier usuario activo puede leer perfiles (para ver los nombres de las compañeras)
CREATE POLICY "Usuarios activos pueden leer perfiles" ON public.profiles
  FOR SELECT USING (public.is_active_user());

-- Solo los administradores pueden crear, modificar o desactivar perfiles
CREATE POLICY "Admins controlan perfiles completamente" ON public.profiles
  FOR ALL USING (public.is_admin());

-- --------------------------------------------
-- B. Tabla: CUSTOMERS
-- --------------------------------------------
-- Cualquier usuario activo puede leer y crear clientes (necesario al registrar un pedido)
CREATE POLICY "Cualquier usuario activo lee clientes" ON public.customers
  FOR SELECT USING (public.is_active_user());

CREATE POLICY "Cualquier usuario activo crea clientes" ON public.customers
  FOR INSERT WITH CHECK (public.is_active_user());

-- Cualquier usuario activo puede actualizar información básica de clientes (ej. sumas acumuladas, teléfono)
CREATE POLICY "Cualquier usuario activo edita clientes" ON public.customers
  FOR UPDATE USING (public.is_active_user());

-- Solo los administradores pueden eliminar registros de clientes
CREATE POLICY "Solo admins eliminan clientes" ON public.customers
  FOR DELETE USING (public.is_admin());

-- --------------------------------------------
-- C. Tabla: SERVICES
-- --------------------------------------------
-- Todos los usuarios activos pueden ver el catálogo de servicios y sus precios
CREATE POLICY "Usuarios activos leen servicios" ON public.services
  FOR SELECT USING (public.is_active_user());

-- Solo los administradores pueden añadir o modificar precios del catálogo
CREATE POLICY "Solo admins modifican servicios" ON public.services
  FOR ALL USING (public.is_admin());

-- --------------------------------------------
-- D. Tabla: ORDERS
-- --------------------------------------------
-- Todos los usuarios activos pueden ver, registrar y actualizar pedidos
CREATE POLICY "Usuarios activos leen pedidos" ON public.orders
  FOR SELECT USING (public.is_active_user());

CREATE POLICY "Usuarios activos crean pedidos" ON public.orders
  FOR INSERT WITH CHECK (public.is_active_user());

CREATE POLICY "Usuarios activos editan pedidos" ON public.orders
  FOR UPDATE USING (public.is_active_user());

-- Está estrictamente prohibido eliminar pedidos del sistema para mantener la transparencia financiera. 
-- Solo los administradores pueden hacerlo en casos excepcionales de auditoría.
CREATE POLICY "Solo admins eliminan pedidos" ON public.orders
  FOR DELETE USING (public.is_admin());

-- --------------------------------------------
-- E. Tabla: ORDER_ITEMS (Detalle del pedido)
-- --------------------------------------------
CREATE POLICY "Usuarios activos leen items de pedido" ON public.order_items
  FOR SELECT USING (public.is_active_user());

CREATE POLICY "Usuarios activos crean items de pedido" ON public.order_items
  FOR INSERT WITH CHECK (public.is_active_user());

CREATE POLICY "Admins editan/eliminan items de pedido" ON public.order_items
  FOR ALL USING (public.is_admin());

-- --------------------------------------------
-- F. Tabla: ORDER_STATUS_HISTORY (Trazabilidad)
-- --------------------------------------------
CREATE POLICY "Usuarios activos leen historial de pedidos" ON public.order_status_history
  FOR SELECT USING (public.is_active_user());

CREATE POLICY "Usuarios activos registran cambios de estado" ON public.order_status_history
  FOR INSERT WITH CHECK (public.is_active_user());

-- El historial no se puede modificar ni borrar para asegurar auditorías limpias
CREATE POLICY "Solo admins auditan historial" ON public.order_status_history
  FOR ALL USING (public.is_admin());

-- --------------------------------------------
-- G. Tabla: DAILY_CASH_CLOSE (Caja)
-- --------------------------------------------
-- Solo los administradores tienen acceso a leer, crear o modificar los cierres de caja contables
CREATE POLICY "Acceso exclusivo de admins a caja" ON public.daily_cash_close
  FOR ALL USING (public.is_admin());

-- --------------------------------------------
-- H. Tabla: MACHINES (Maquinaria)
-- --------------------------------------------
-- Todos los usuarios activos pueden ver las máquinas y su estado de reparación
CREATE POLICY "Usuarios activos leen maquinas" ON public.machines
  FOR SELECT USING (public.is_active_user());

-- Las operadoras pueden actualizar el estado de las máquinas (ej. si reportan una avería)
CREATE POLICY "Usuarios activos cambian estado de maquinas" ON public.machines
  FOR UPDATE USING (public.is_active_user());

-- Solo los administradores pueden añadir nuevas máquinas o borrarlas
CREATE POLICY "Solo admins crean o borran maquinas" ON public.machines
  FOR ALL USING (public.is_admin());

-- --------------------------------------------
-- I. Tabla: SUPPLIES (Suministros)
-- --------------------------------------------
-- Todos los usuarios activos pueden ver el stock de insumos y registrar consumos (UPDATE)
CREATE POLICY "Usuarios activos leen insumos" ON public.supplies
  FOR SELECT USING (public.is_active_user());

CREATE POLICY "Usuarios activos modifican stock de insumos" ON public.supplies
  FOR UPDATE USING (public.is_active_user());

-- Solo los administradores pueden añadir insumos nuevos o borrarlos
CREATE POLICY "Solo admins crean/borran insumos" ON public.supplies
  FOR ALL USING (public.is_admin());

-- --------------------------------------------
-- J. Tabla: BUSINESS_CONFIG (Configuraciones generales)
-- --------------------------------------------
-- Todos los usuarios activos leen la configuración del negocio (nombre, dirección, logo)
CREATE POLICY "Cualquier usuario activo lee config negocio" ON public.business_config
  FOR SELECT USING (public.is_active_user());

-- Solo los administradores pueden cambiar los ajustes o precios base globales
CREATE POLICY "Solo admins modifican config negocio" ON public.business_config
  FOR ALL USING (public.is_admin());

-- supabase/migrations/003_seed_services.sql
-- Datos Iniciales (Seeds) para Lavandería J&L MVP

-- ============================================
-- 1. CARGA DE CATÁLOGO DE SERVICIOS
-- ============================================

-- A. Servicios Basados en Peso (Cobro x Kilo)
INSERT INTO public.services (name, service_type, price_per_kg, price_per_unit, estimated_hours, sort_order) VALUES
('Lavado x Kilo Completo', 'wash_per_kg', 2.80, NULL, 24, 1), -- Lavado + Secado + Centrifugado + Perfumado + Doblado + Bolsa
('Secado x Kilo', 'drying', 1.50, NULL, 12, 2),
('Secado + Centrifugado x Kilo', 'drying_spin', 2.00, NULL, 12, 3),
('Planchado x Kilo', 'ironing', 3.00, NULL, 24, 4);

-- B. Artículos Especiales (Cobro x Unidad)
INSERT INTO public.services (name, service_type, price_per_kg, price_per_unit, estimated_hours, sort_order) VALUES
('Frazada 2 Plazas (Tigre/Pesada)', 'special_item', NULL, 25.00, 48, 10),
('Frazada 1.5 Plazas', 'special_item', NULL, 20.00, 48, 11),
('Edredón Plumas (King Size)', 'special_item', NULL, 35.00, 72, 12),
('Edredón Sintético (2 Plazas)', 'special_item', NULL, 20.00, 48, 13),
('Edredón Sintético (1.5 Plazas)', 'special_item', NULL, 18.00, 48, 14),
('Zapatillas (Par)', 'special_item', NULL, 15.00, 48, 15),
('Casaca (Pesada/Cuero)', 'special_item', NULL, 15.00, 48, 16),
('Casaca Cortaviento/Liviana', 'special_item', NULL, 10.00, 24, 17),
('Cortinas (Juego Completo)', 'special_item', NULL, 30.00, 72, 18),
('Peluche Mediano', 'special_item', NULL, 12.00, 48, 19),
('Peluche Grande', 'special_item', NULL, 20.00, 48, 20),
('Sábanas (Juego)', 'special_item', NULL, 8.00, 24, 21);

-- ============================================
-- 2. CARGA DE CONFIGURACIÓN DEL NEGOCIO
-- ============================================
INSERT INTO public.business_config (business_name, address, phone, currency, order_prefix, next_order_number, schedule) VALUES
('Lavandería J&L', 'Av. Carlos Izaguirre Mz B Lt 19 Urb. Kama - S.M.P., Lima', '987654321', 'PEN', 'JL', 1, 'Lunes a Sábado, 8:00 AM - 7:00 PM');

-- ============================================
-- 3. REGISTRO INICIAL DE MAQUINARIA (3 Lavadoras + 3 Secadoras)
-- ============================================
INSERT INTO public.machines (name, brand, machine_type, capacity_kg, status, status_note) VALUES
('Lavadora #1', 'Samsung', 'washer', 18.00, 'working', 'Operando normal'),
('Lavadora #2', 'LG', 'washer', 18.00, 'working', 'Operando normal'),
('Lavadora #3 (Industrial)', 'Speed Queen', 'washer', 22.00, 'working', 'Ideal para frazadas pesadas'),
('Secadora #1', 'General Electric', 'dryer', 15.00, 'working', 'Operando normal'),
('Secadora #2', 'Samsung', 'dryer', 18.00, 'working', 'Operando normal'),
('Secadora #3 (Fuerte)', 'Speed Queen', 'dryer', 20.00, 'working', 'Secado rápido de edredones');

-- ============================================
-- 4. SUMINISTROS INICIALES (Inventario)
-- ============================================
INSERT INTO public.supplies (name, unit, current_stock, min_stock, cost_per_unit) VALUES
('Detergente Líquido Industrial', 'litros', 50.00, 10.00, 8.50),
('Suavizante de Lavanda Premium', 'litros', 30.00, 5.00, 6.00),
('Perfume Textil Citrus', 'litros', 5.00, 1.00, 12.00),
('Bolsas de Plástico Grandes (Paquete x100)', 'unidades', 10.00, 2.00, 15.00),
('Bolsas de Plástico Medianas (Paquete x100)', 'unidades', 12.00, 3.00, 12.00);

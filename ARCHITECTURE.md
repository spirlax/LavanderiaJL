# Arquitectura y Diseño de Software — Lavandería J&L

Este documento define la arquitectura técnica, las convenciones de código y el esquema de base de datos para la plataforma de gestión operativa de **Lavandería J&L**. Sirve de guía tanto para desarrolladores como para agentes de IA autónomos (Grok Build, Codex, etc.) que trabajen en esta base de código.

---

## 🚀 Principios de Diseño y Stack Tecnológico

1. **Next.js 15 (App Router):** Estructura basada en Server Components por defecto, minimizando el JavaScript en el cliente.
2. **Vanilla CSS + CSS Modules:** Cero frameworks CSS externos (sin TailwindCSS). El diseño debe ser responsivo, vibrante, con micro-animaciones premium y tokens CSS centralizados en `src/styles/tokens.css`.
3. **Supabase (PostgreSQL):** Base de datos relacional con políticas RLS (Row Level Security) activadas para diferenciar accesos entre el dueño (Admin) y las empleadas (Operator).
4. **Mobile-First para Operadores:** La interfaz para las empleadas en su celular debe estar optimizada para pantallas pequeñas (320px+), usar botones gigantes (mínimo 56px de alto) y evitar tipeos complejos.
5. **Costo Mensual Cero (Free Tier):** Aprovechamiento de planes gratuitos de Vercel y Supabase.

---

## 📁 Estructura del Proyecto

El proyecto sigue una estructura organizada por roles a nivel de rutas:

```
lavanderia-jl/
├── src/
│   ├── app/
│   │   ├── (auth)/             # Flujo de Login y recuperación
│   │   ├── (empleada)/         # Interfaz ultra-simplificada para el celular de las empleadas
│   │   │   ├── nuevo/          # Registro de pedido rápido (botones grandes, peso)
│   │   │   ├── pedidos/        # Lista de pedidos del día e historial básico
│   │   │   └── buscar/         # Buscador ágil de órdenes
│   │   ├── (admin)/            # Interfaz de escritorio para el dueño (Laptop)
│   │   │   ├── caja/           # Control financiero diario e ingresos por empleada
│   │   │   ├── clientes/       # Panel de clientes e importación/exportación
│   │   │   ├── reportes/       # Análisis de métricas e inteligencia de negocio (BI)
│   │   │   └── maquinas/       # Estado operativo y manual de lavadoras/secadoras
│   │   ├── api/                # Endpoints auxiliares e importación/exportación
│   │   ├── layout.tsx          # Configuración global
│   │   └── globals.css         # Importación de tokens y resets globales
│   ├── components/
│   │   ├── ui/                 # Componentes interactivos base (BigButton, Counter, ChipSelector)
│   │   └── layout/             # Componentes de envoltura (Sidebar para laptop, BottomNav para móvil)
│   ├── lib/
│   │   ├── supabase/           # Configuración de clientes (Client, Server, Admin)
│   │   ├── actions/            # Server Actions para mutaciones (Zod validados)
│   │   ├── queries/            # Consultas de lectura type-safe
│   │   └── export/             # Lógica para generación de CSV y PDF
│   ├── styles/
│   │   ├── tokens.css          # Variables de diseño (Colores HSL, espaciados, tipografía)
│   │   ├── globals.css         # Estilos y reseteos globales
│   │   └── animations.css      # Transiciones y micro-animaciones premium
│   └── types/                  # Tipos de TypeScript generados desde Supabase
```

---

## 🗄️ Esquema de Base de Datos (Supabase / PostgreSQL)

### Enums
* `user_role`: `('admin', 'operator')`
* `order_status`: `('received', 'washing', 'drying', 'ironing', 'ready', 'delivered', 'cancelled')`
* `payment_method`: `('cash', 'yape', 'plin', 'transfer')`
* `service_type`: `('wash_per_kg', 'drying', 'drying_spin', 'ironing', 'special_item')`
* `customer_type`: `('registered', 'name_only', 'quick')`
* `machine_status`: `('working', 'review', 'repair', 'out_of_service')`
* `machine_type`: `('washer', 'dryer', 'ironer', 'other')`

### Tablas Principales

#### 1. `profiles`
Extiende el esquema de autenticación nativo de Supabase (`auth.users`).
* `id` UUID (PK, FK a `auth.users`)
* `full_name` TEXT (Nombre completo de la empleada o dueño)
* `role` `user_role` (Rol en el sistema)
* `is_active` BOOLEAN (Para habilitar/deshabilitar accesos)

#### 2. `customers`
* `id` UUID (PK)
* `customer_type` `customer_type` (Tipo de cliente)
* `full_name` TEXT (Nombre o "Cliente #X" autogenerado)
* `phone` TEXT (Opcional, obligatorio solo si acepta avisos)
* `whatsapp_opt_in` BOOLEAN (Consentimiento para recibir mensajes)
* `whatsapp_opt_in_at` TIMESTAMPTZ (Registro de fecha de consentimiento legal)

#### 3. `services`
* `id` UUID (PK)
* `name` TEXT (ej. "Lavado x Kilo", "Edredón Pluma")
* `service_type` `service_type`
* `price_per_kg` NUMERIC(8,2) (Para servicios de peso)
* `price_per_unit` NUMERIC(8,2) (Para artículos especiales)
* `is_active` BOOLEAN

#### 4. `orders`
* `id` UUID (PK)
* `order_number` TEXT (Único, ej: `JL-0001`)
* `customer_id` UUID (FK a `customers`)
* `received_by` UUID (FK a `profiles`, registra qué empleada cobró y recibió)
* `status` `order_status`
* `total` NUMERIC(10,2) (Siempre pagado por adelantado)
* `payment_method` `payment_method`
* `talonario_number` TEXT (Número de ticket físico del talonario)
* `created_at` TIMESTAMPTZ

#### 5. `daily_cash_close`
Control de flujo de dinero diario. Solo accesible por el Dueño.
* `id` UUID (PK)
* `date` DATE (Único)
* `total_cash` NUMERIC(10,2)
* `total_yape` NUMERIC(10,2)
* `total_plin` NUMERIC(10,2)
* `total_transfer` NUMERIC(10,2)
* `grand_total` NUMERIC(10,2)
* `closed_by` UUID (FK a `profiles`)

---

## 🎨 Guía de Estilo y UI (Vanilla CSS CSS Modules)

### Tokens de Diseño (`tokens.css`)
Centralizamos los colores usando HSL para mantener un esquema armonioso y moderno (colores de alta gama, no genéricos):

```css
:root {
  --primary-hue: 260; /* Púrpura Premium */
  --primary: hsl(var(--primary-hue), 70%, 55%);
  --primary-hover: hsl(var(--primary-hue), 70%, 45%);
  --primary-light: hsl(var(--primary-hue), 70%, 95%);
  
  --secondary-hue: 195; /* Azul Celeste Limpieza */
  --secondary: hsl(var(--secondary-hue), 85%, 50%);
  
  --dark: hsl(220, 20%, 12%);
  --light: hsl(220, 20%, 98%);
  
  --success: hsl(145, 65%, 45%);
  --warning: hsl(40, 90%, 50%);
  --danger: hsl(0, 75%, 55%);
  
  --border-radius-sm: 8px;
  --border-radius-md: 16px;
  --border-radius-lg: 24px; /* Para botones gigantes */
  
  --shadow-premium: 0 8px 30px rgba(0, 0, 0, 0.05);
}
```

### Reglas CSS Modules
Para componentes interactivos (`/components`), se debe usar CSS Modules (`Component.module.css`) para evitar colisiones de clases y asegurar modularidad absoluta.

---

## 🤖 Guía para Agentes Externos (Grok Build, Codex)

Si eres un agente externo trabajando en esta base de código:
1. **Mantén los Estilos Limpios:** No agregues Tailwind. Escribe CSS nativo en los archivos `.module.css` usando las variables definidas en `tokens.css`.
2. **TypeScript Estricto:** Asegúrate de tipar todas las respuestas de API, props de componentes y Server Actions usando `src/types/database.ts`.
3. **No alteres el flujo de Caja:** El campo `received_by` en la tabla `orders` es obligatorio. Cualquier acción que cree un pedido debe registrar la ID del perfil que inició sesión para asegurar la trazabilidad del dinero de la caja.
4. **Respeta el Flujo Mobile-First:** No modifiques los componentes táctiles (`BigButton.tsx`, `Counter.tsx`) sin probarlos en pantallas de 320px de ancho.

# Guía de Coordinación para Agentes de IA (Grok Build, Codex)

Este archivo define las instrucciones, límites y patrones que deben seguir todos los agentes de IA autónomos que editen o extiendan esta base de código.

---

## 🎯 Prioridades Clave del Proyecto

1. **UX de Empleada (Mobile-first):** La interfaz para operadoras (`src/app/(empleada)/`) debe ser extremadamente minimalista. Botones táctiles enormes (mínimo 56px de alto), tipografías grandes (18px+ en cuerpo) y sin barras laterales. Cero complejidad técnica en la UI móvil.
2. **Control de Caja y Trazabilidad:** Todo pedido (`orders`) DEBE registrar la ID de la empleada que cobró (`received_by`). Cualquier código que manipule pagos o pedidos debe asegurar la consistencia del flujo de caja.
3. **Estilos Vanilla CSS:** Está estrictamente prohibido usar TailwindCSS en nuevos componentes o páginas. Todos los estilos deben usar CSS Modules (`.module.css`) o los tokens globales definidos en `src/styles/tokens.css`.
4. **Respeto a ARCHITECTURE.md:** Lee `ARCHITECTURE.md` para entender el esquema de la base de datos de Supabase y las políticas RLS antes de crear nuevas tablas o queries.

---

## 🛠️ Reglas Técnicas Obligatorias

### 1. Manejo de Estilos (CSS Modules)
Cuando crees un componente, crea su archivo de estilos CSS Module homónimo:
* Componente: `src/components/ui/BigButton.tsx`
* Estilos: `src/components/ui/BigButton.module.css`

Utiliza siempre las variables globales HSL de `tokens.css`:
```css
/* CORRECTO */
.button {
  background-color: var(--primary);
  border-radius: var(--border-radius-lg);
  padding: 1rem 2rem;
  transition: all 0.2s ease;
}

/* INCORRECTO */
.button {
  background-color: #7c3aed; /* Usar valor hardcoded */
}
```

### 2. TypeScript y Base de Datos
* No uses `any`. Define interfaces estrictas o utiliza los tipos generados en `src/types/database.ts`.
* Las operaciones de base de datos se manejan a través de los archivos del repositorio en `src/lib/queries/` y las mutaciones a través de Server Actions en `src/lib/actions/`.

### 3. Validaciones con Zod
Toda Server Action o API Route que reciba datos del cliente debe validar la información usando Zod schemas. Define los esquemas en `src/lib/validations/`.

---

## 📋 Flujo de Trabajo para Agentes CLI (Grok Build)

Si estás ejecutando tareas vía CLI:
1. **Analiza primero:** Ejecuta las pruebas unitarias y de formato locales (`pnpm lint`, `pnpm type-check`) antes de proponer cambios para asegurar que partas de un estado limpio.
2. **Planifica:** Escribe tu plan técnico detallado antes de modificar archivos.
3. **Desarrolla en una rama:** Nunca trabajes directamente sobre `main`. Crea ramas con el prefijo `feat/` o `fix/`.
4. **Valida antes de entregar:** Ejecuta `pnpm build` para asegurar que el proyecto compila perfectamente.

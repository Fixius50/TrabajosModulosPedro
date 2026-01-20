# Log de Prompts

## 1. Init Project
**Prompt:** Construir una app para la gestión de finanzas personales. (Obtenido de prompt inicial)
**Acciones:**
- Creación de estructura de carpetas `DesarrolloInterfaces/FinanzasApp`.
- Definición de Manifiesto en `Docs/manifiesto.md`.
- Scaffolding de proyecto React + Ionic + Capacitor.
- Instalación de dependencias (Vite, Ionic, Capacitor, Supabase Client, React Router).
- Configuración inicial de `src/App.tsx` y `capacitor.config.ts`.

## 2. Auth Module
**Prompt:** adelante (Continuar con autenticación)
**Acciones:**
- Creación de `src/pages/Login.tsx` y `src/pages/Register.tsx`.
- Implementación de lógica auth con `supabase.auth.signInWithPassword` y `signUp`.
- Configuración de Rutas protegidas (inicio en Login).
- Corrección de hooks de React Router v6 (`useHistory` -> `useNavigate`).

## 3. UI Core
**Prompt:** "Luego arrancame el proyecto"
**Acciones:**
- Creación de páginas: `Dashboard`, `Transactions`, `Settings`.
- Implementación de `MainTabs` con `IonTabs` y enrutamiento anidado (`/app/dashboard`, etc.).
- Integración en `App.tsx` redirigiendo `/app/*` a `MainTabs`.
- Corrección de sintaxis V6 en `MainTabs.tsx`.

## 4. Debugging
**Error:** Fallo en `npm run dev` por incompatibilidad de `react-router-dom` v7/v6.
**Acciones:** Downgrade a `react-router-dom@5` (requerido por Ionic 8). Refactorización de componentes a sintaxis v5.

## 5. Recurring Transactions
**Prompt:** "Continuar" (Fase 7: Transacciones Recurrentes)
**Acciones:**
- Creación de tabla SQL `recurring_transactions`.
- Implementación de `recurring.service.ts` para procesar cobros automáticos al abrir la app.
- Creación de página `RecurringTransactions.tsx` con modal de alta.
- Agregado al Menú Lateral.

## 6. Fixes & Improvements
**Prompt:** "al iniciar me debe salir la pantalla de login y no el dashboard directamente"
**Acciones:**
- Implementación de **Auth Guard** global en `App.tsx`.
- Monitorización de `onAuthStateChange` de Supabase.
- Redirección automática Login <-> Dashboard según estado de sesión.

## 7. Critical Migration (Blank Screen Fix)
**Error:** Pantalla blanca perpetua por incompatibilidad Ionic 8 / React Router 5.
**Acciones:**
- **UPGRADE OBLIGATORIO**: React Router 6.
- Eliminación de `@ionic/react-router`.
- Refactor completo de `App.tsx`, `MainTabs.tsx` y Páginas (`useHistory` -> `useNavigate`).
## 8. UX Optimization & Performance
**Prompt:** "no quiero que se monte de nuevo al ir" / "quita el dialogo de Iniciando"
**Acciones:**
- **Persistent Tabs**: Cambio de arquitectura en `MainTabs.tsx`. Reemplazo de routing reactivo (`Routes`) por vistas persistentes (`display: block/none`).
- **Eliminación de Blocking UI**: Retirada del diálogo "Iniciando..." en `App.tsx` para arranque instantáneo.
- **Build Fixes**: Optimización de imports dinámicos en `Settings.tsx` para evitar circular dependencies. Build exitoso.

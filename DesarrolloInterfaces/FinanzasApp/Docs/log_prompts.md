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

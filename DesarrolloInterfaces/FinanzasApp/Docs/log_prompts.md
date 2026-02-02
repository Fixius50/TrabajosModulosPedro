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

## 9. UI Polish & 3D Restoration

**Prompt:** Refinar UI y Funcionalidades 3D (Eliminar superposiciones, reactivar 3D, desactivar persistencia).
**Acciones:**

- Eliminación de `GlobalHUD` y Ticker Bar en `Layout` y `MainTabs`.
- Activación de `SceneCanvas` en `App.tsx`.
- Desactivación de `persistSession` en Supabase.
- Verificación de modelos procedimentales (D20, Cofre, Runa).

## 10. Unlock-Based Navigation

**Prompt:** "habilitar la transición entre las distintas paginas tras meter la contraseña"
**Acciones:**

- Implementación de estado global `isAppUnlocked` en `App.tsx`.
- Creación de componente `NavRune.tsx` (Runa Mística de Navegación).
- Propagación de señal `onUnlock` desde `BankAccountDashboard` hasta `App`.
- Condicionamiento de visibilidad de navegación al estado de desbloqueo del banco.

## 11. Responsive Navigation (Mobile)

**Prompt:** "para la version movil, haz que esto cambie a un desplegable en la parte superior"
**Acciones:**

- Refactor de `NavRune.tsx` con soporte dual.
- **Desktop**: Runa mística flotante animada.
- **Mobile**: Menú desplegable "El Oráculo" en el top-bar central.

## 12. Reimagined Navigation (Anti-Overlap)

**Prompt:** "el navegador de pestañas este el problema que hay es que esta encima de botones de algunas funcionalidades de la app, entonces reimaginalo"
**Acciones:**

- Transformación de la Desktop NavRune en un **Portal de Esquina** compacto que se expande al hacer hover.
- Migración de la navegación móvil de la cabecera a un **Mystical Bottom Dock** (inferior).
- Optimización de ergonomía y eliminación de solapamientos con botones de acción global.

## 13. Advanced 3D Login & Documentation

**Prompt:** "Login 3D, animación, aleatoriedad y documentación"
**Acciones:**

- **Reimplementación Login 3D:** Creación de `D20DiceWithLogin` integrando modelo GLB, formulario React-Three-Html y entorno espacial.
- **Efecto Surface Reveal:** Ajuste de cámaras y escalas para transición de "Superficie 2D" a "Espacio 3D".
- **Optimización Móvil:** Implementación de `dpr capping` y reducción de geometría.
- **Lógica de Animación:** Corrección de `App.tsx` para diferir la navegación hasta completar la secuencia 3D.
- **Aleatoriedad:** Generación de vectores de spin únicos en cada login.
- **Documentación:** Generación de reporte final en `Docs/Documentacion.html`.

# 05. Bitácora de Desarrollo

## Historial de Cambios y Decisiones Técnicas

---

## [Fecha: 2026-02-17] | Fase 2.5 | Estabilidad y Resiliencia

- **Usuario**: Roberto Monedero Alonso
- **Cambios**:
  - **BUG FIX**: Corregido problema de cierre de sesión involuntario en `QuickAddMenu`.
    - Las opciones del menú (incluyendo "Huir") seguían siendo clickeables aunque fueran invisibles debido a un conflicto de clases `pointer-events`.
    - Se eliminó la clase estática `pointer-events-auto` y se movió a la lógica condicional del estado `isOpen`.
  - **Gamification**: Añadidas 20 nuevas misiones y logros de temática RPG.
  - **Hogar Analytics**: Implementado sistema de estadísticas de contribución por miembro con filtros dinámicos.
  - **GlobalErrorBoundary**: Implementado para capturar crashes de renderizado.
  - **Auth Resilience**: Añadido logging de eventos de Supabase Auth para debug.
  - **UX**: Incremento de Session Timeout a 30m.
  - **Docs**: Sincronización masiva de la Suite Documental (Roadmap, Estrategia, Bitácora).
- [x] **Entorno**: Ajuste de `vite.config.ts` y scripts de `package.json` para despliegue correcto en Vercel.
- **Estado**: ✅ Completado.

---

## [Fecha: 2026-02-17] | Fase 2.6 | Household Realtime & Vercel Fix

- **Usuario**: Roberto Monedero Alonso
- **Cambios**:
  - **Supabase Realtime**: Implementada suscripción a `postgres_changes` en `SharedAccounts.tsx` para sincronización instantánea.
  - **Verification Script**: Creado `simulate_spouse.ts` para pruebas E2E de concurrencia.
    - *Tech*: Uso de token de sesión inyectado vía variables de entorno para saltar RLS.
  - **DevOps / Vercel**:
    - Reconfiguración del `package.json` raíz para construir `PersonalFinanceApp` correctamente.
    - Ajuste de `vercel.json` para redirección SPA (`rewrites` a `/index.html`) eliminando config legacy.
- **Estado**: ✅ Verificado y Desplegable.

---

## [Fecha: 2026-02-16] | Fase 22 | Gestión de Hogares y Multijugador

- **Usuario**: Roberto Monedero Alonso
- **Cambios**:
  - Implementación de **Gestión de Hogares**:
    - Creación y Unión a hogares mediante ID.
    - Visualización de miembros y roles (Admin/Member).
    - Servicio `HouseholdService` conectado a Supabase.
  - Refactorización de **Cuentas Compartidas**:
    - Adaptación de `SharedAccounts` para usar datos reales del hogar.
    - Eliminación de lógica legacy basada en LocalStorage.
- **Estado**: En Progreso (Falta sincronización de transacciones).

---

## [Fecha: 2026-02-16] | Fase 19 | Refactorización de Navegación y Pulido UI

- **Usuario**: Roberto Monedero Alonso
- **Cambios**:
  - **Refactor**: Reemplazo de barra de navegación inferior estática por menú flotante central (`QuickAddMenu`).
  - **Diseño**: Implementación de menú estilo "Hamburguesa Vertical" con iconos y etiquetas claras.
  - **Fix**: Eliminación de cabecera duplicada "FinFlow" y restauración de tema Grimorio.
  - **Fix**: Resolución de conflicto de Z-index y scroll doble en Dashboard.
  - **Fix**: Eliminación de renderizado duplicado de `<Outlet />` en `ProtectedLayout` (causante de duplicación de interfaz).
  - **Mejora**: `AdventurerLicense` ahora ocupa toda la pantalla con scroll vertical natural; eliminado botón de retroceso redundante.
- **Estado**: Production Ready (Version 1.1).

---

## [Fecha: 2026-02-15] | Fase 16-19 | Implementación Marketplace y Pulido UI

- **Usuario**: Roberto Monedero Alonso
- **Cambios**:
  - Implementación completa del **Marketplace** (compra de items, inventario) con tablas en Supabase.
  - Refactorización del **Rastreador de Deudas** con persistencia y gamificación.
  - Implementación de **Suscripciones** y **Cuentas Conjuntas**.
  - **Localización**: Soporte completo para español y selector de moneda (EUR, USD, GBP) en perfil.
  - **UI/UX**: Rediseño de encabezados (título centrado, menú logout), animaciones con Framer Motion.
  - **Fixes**: Corrección de bug en categorías (base de datos vacía), limpieza de imports y validaciones.
- **Decisiones Técnicas**:
  - Uso de `useTranslation` para textos dinámicos.
  - Almacenamiento de preferencia de moneda en `storageService` y sincronización con `UserProfile`.
  - Inserción de categorías por defecto vía SQL migration para garantizar estado inicial consistente.
- **Estado**: Production Ready (Version 1.0).

---

## [Fecha: 2026-02-06] | Fase 12-14 | Testing, Performance & PWA

- **Usuario**: Roberto Monedero Alonso
- **Cambios**:
  - Configuración completa de Vitest y entorno de testing.
  - Implementación de code splitting y lazy loading.
  - Configuración de PWA con Workbox y soporte offline.
  - Optimización de assets y bundle size.
- **Estado**: Pre-Production.

---

## [Fecha: 2026-02-05] | Fase 1-11 | Desarrollo Core

- **Usuario**: Roberto Monedero Alonso
- **Cambios**:
  - Inicialización del proyecto con Vite + React + Supabase.
  - Diseño del sistema UI "Fantasy Finance" (Glassmorphism).
  - Implementación de módulos core: Transacciones, Gamificación, Dashboard.
  - Integración de autenticación y base de datos.
- **Estado**: Development.

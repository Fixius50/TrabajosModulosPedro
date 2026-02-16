# 05. Bitácora de Desarrollo

## Historial de Cambios y Decisiones Técnicas

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

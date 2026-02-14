# 01. Estrategia Técnica y Stack (Redo)

## 1. Core Stack

* **Runtime**: Node.js (v20+)
* **Framework**: React 18.2 + TypeScript
* **UI Toolkit**: Ionic Framework 8.2 (React integration)
* **Styling**: TailwindCSS (Custom "Dungeon" Config)
* **Mobile Engine**: Capacitor (Android target)

## 2. Backend & Data Layer (Advanced Supabase)

Exploración profunda de capacidades de Supabase:

### A. Base de Datos (PostgreSQL)

* Uso de **Triggers** para cálculos automáticos (ej: actualizar balance al insertar transacción).
* **RLS (Row Level Security)** estricto para aislamiento de usuarios.

### B. Storage (Buckets)

Estructura de almacenamiento avanzada:

* Bucket `treasury_docs` (Private):
  * `/receipts/{user_id}/{year}/{month}/`: Imágenes de tickets.
  * `/invoices/{user_id}/`: Facturas PDF.
* Bucket `guild_assets` (Public):
  * Assets de UI (texturas, iconos de rango) si es necesario.

### C. Edge Functions (Serverless Deno)

Lógica de negocio compleja fuera del cliente:

* `process-receipt`: (Futuro) OCR de tickets usando IA.
* `monthly-report`: Generación de resumen mensual y envío por email.
* `market-prices`: Proxy seguro para consultar APIs financieras (CoinGecko) sin exponer keys.

## Proposed Changes

### [DONE] Internationalization (i18n)

- Centralized all labels (Auth, Registration, Vaults) in `json/es.json` and `json/en.json`.
* Integrated `useTranslation` in all reborn components.

### [EXECUTION] Real Auth & Connectivity

- [MODIFY] [AuthPage.tsx](file:///c:/Users/rober/Desktop/TrabajosModulosPedro/DesarrolloInterfaces/FinanzasApp/resources/frontend/tsx/AuthPage.tsx): Swapping mock logic for real Supabase Auth.
* [MODIFY] [App.tsx](file:///c:/Users/rober/Desktop/TrabajosModulosPedro/DesarrolloInterfaces/FinanzasApp/resources/frontend/tsx/App.tsx): Fetching real accounts from `bank_accounts` table.

### [NEW] Persistence & Storage (Supabase Buckets)

- [MODIFY] `supabaseClient.ts`: Configure storage helpers.
* [NEW] `storageService.ts`: Service to upload/download user JSON data to/from personal buckets.
* [MODIFY] `settings.tsx`: Update export/import logic to use Cloud Storage instead of local filesystem where appropriate.

## Verification Plan

1. **Real Login**: Create a new account via "Guild Inscription" and verify it appears in Supabase Auth and `profiles` table.
2. **Vault Sync**: Add a transaction to a vault and verify it persists in `bank_accounts` and `transactions` tables.
3. **Cloud Storage**: Export data and verify the JSON file appears in the user's private Supabase Bucket.

### D. Realtime

Sincronización instantánea:

* Suscripción a cambios en tabla `transactions` para actualizar el "Cofre de Oro" (Balance) en el Dashboard instantáneamente si se añade un gasto desde otro dispositivo.

## 3. Integraciones Externas (Ecosistema MCP Reg-Free)

### A. Datos Financieros ("The Market")

* **Yahoo Finance MCP**:
  * **Ventaja**: Sin API Keys. Datos de Mercado, Crypto y Divisas.
  * Uso: Actualizar precios en `MarketPage`.
* **DefeatBeta MCP**: Análisis financiero y estadísticas locales.

### B. Divisas y Conversión

* **Fetch MCP** + **Frankfurter API**:
  * API Open Source sin registro.
  * Uso: Conversión precisa de divisas para el Inventario.

### C. Infraestructura Agéntica

* **PostgreSQL MCP**: Gestión directa de Supabase DB.
* **Sequential Thinking**: Motor de razonamiento para cálculos de impuestos/intereses.
* **Filesystem & Search**: Herramientas base para operación del Agente.

## 4. Estrategia de Refactor

1. **Limpieza**: Eliminar componentes "Cosmic".
2. **Core**: Implementar `AuthProvider` y `SupabaseClient` optimizado.

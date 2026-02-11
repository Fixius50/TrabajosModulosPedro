# 01. Estrategia Técnica y Stack

## 1. Core Stack

* **Runtime**: Node.js (v18+)
* **Framework**: React 18.2 + TypeScript
* **UI Toolkit**: Ionic Framework 8.2 (React integration)
* **Build Tool**: Vite
* **Mobile Engine**: Capacitor (Android target)

## 2. Backend & Data Layer

* **Platform**: Supabase (BaaS)
  * **Database**: PostgreSQL
  * **Auth**: Supabase Auth (Email/Password)
  * **Storage**: Supabase Storage (Buckets para recibos)
* **Offline Strategy**:
  * **Local**: `localStorage` (Config), IndexedDB (Data Cache)
  * **Remote**: Supabase Client (`@supabase/supabase-js`)

## 3. Librerías Clave

| Librería | Propósito | Versión (Aprox) |
| :--- | :--- | :--- |
| `react-router-dom` | Navegación SPA | v6 |
| `chart.js` / `react-chartjs-2` | Visualización de datos | Latest |
| `i18next` | Internacionalización (ES/EN) | Latest |
| `jspdf` | Generación de reportes | Latest |

## 4. Convenciones de Código

* **Estilo**: ESLint standard config + Prettier.
* **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
* **Estructura**: Feature-based folder structure (ver `04_Arquitectura_Workspaces.md`).

## 5. Requisitos de Entorno

* Archivo `.env` con:
  * `VITE_SUPABASE_URL`
  * `VITE_SUPABASE_ANON_KEY`

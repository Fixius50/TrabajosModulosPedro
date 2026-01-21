# Changelog - Phase 8: UI/UX Refactor & Consolidation

## Summary
Complete overhaul of the navigation structure and page layout to simplify the user experience. Consolidated multiple fragmented pages into unified views and resolved duplicate navigation issues.

## 🗑️ Removed / Deprecated
*   **Files Deleted/Obsolete:**
    *   `src/pages/Login.tsx` (Replaced)
    *   `src/pages/Register.tsx` (Replaced)
    *   `src/pages/FantasyMarket.tsx` (Logic moved to `GlobalMarketPage.tsx`)
    *   Separate Routes for `/login` and `/register` (Now handled by `/auth`)
*   **Components/Structures Removed:**
    *   Duplicate `IonPage`, `IonHeader`, `IonMenuButton` inside sub-pages:
        *   `Transactions.tsx`
        *   `Budgets.tsx`
        *   `RecurringTransactions.tsx`
        *   `Profile.tsx`
        *   `Settings.tsx`
    *   Old Side Menu links pointing to individual pages (Transactions, Budgets, etc.)

## 🔄 Replaced / Consolidated
*   **Authentication:**
    *   **New:** `src/pages/AuthPage.tsx`
    *   **Function:** Combines Login and Registration in a single component with tabbed switching.
*   **Navigation:**
    *   **New Structure:** 4 Core Tabs
        1.  **Resumen** (`Dashboard.tsx`)
        2.  **Finanzas** (`FinancesPage.tsx`) -> Contains: Movimientos, Presupuestos, Recurrentes.
        3.  **Mercado** (`GlobalMarketPage.tsx`) -> Contains: Noticias, Cripto (Bitcoin), Mercado Fantasía.
        4.  **Cuenta** (`AccountPage.tsx`) -> Contains: Perfil, Ajustes.
*   **Pages:**
    *   `GlobalMarketPage.tsx`: Replaces separate Market/News widgets. Implementing a 2-column layout (Info + Market).
    *   `FinancesPage.tsx`: New container for financial tools.
    *   `AccountPage.tsx`: New container for user management.

## 🛠️ Fixes
*   **Infinite Loading:** Fixed `Budgets.tsx` loading state by removing page wrapper conflicts and using `useEffect`.
*   **Double Headers:** Removed internal headers from sub-components to prevent double navigation bars.
*   **Layout Collapse:** Fixed Dashboard height issues by switching to `vh` units.
*   **Build Errors:** Cleaned up unused imports (Ionic components, icons) in all refactored files.

# 04_Arquitectura_Workspaces.md

## Estructura del Proyecto (Dungeon Edition)

`[Root]/`
├── `Docs/` (Cerebro del Proyecto)
│   ├── `schema_snapshot.sql` (Estructura BD Supabase)
│   ├── `00_Reglas_Maestras.md`
│   ├── `01_Estrategia_Tecnica.md`
│   ├── `02_Diseño_UI_UX.md`
│   └── `04_Arquitectura_Workspaces.md`
│
├── `resources/frontend/`
│   ├── `tsx/`
│   │   ├── `AuthPage.tsx` (Login Temático)
│   │   ├── `MainTabs.tsx` (Navegación Inferior Mobile)
│   │   ├── `AccountPage.tsx` (Contenedor de Perfil/Ajustes)
│   │   └── `components/dungeon/` (Núcleo del Sistema de Diseño)
│   │       ├── `Dashboard.tsx` (Vista Principal / Tesorería)
│   │       ├── `TransactionsPage.tsx` (Vista de Movimientos / Ledger)
│   │       ├── `TransactionModal.tsx` (Formulario de Inscripción)
│   │       ├── `TransactionList.tsx` (Lista optimizada para móvil)
│   │       ├── `DungeonCard.tsx` (Contenedor UI Base)
│   │       ├── `DungeonButton.tsx` (Botón Temático)
│   │       └── `DungeonInput.tsx` (Input Temático)
│   └── `ts/` (Lógica de Negocio)
│       ├── `supabaseClient.ts`
│       └── `profileService.ts`
│
└── `tailwind.config.js` (Configuración de Tema: Colors, Fonts)

## Flujo de Datos

1. **Auth**: Supabase Auth -> `AuthPage`
2. **Dashboard**: `supabase.from('transactions').select()` -> Cálculo de Balance
3. **Ledger**: `supabase.from('transactions')` con filtros -> `TransactionsPage`
4. **Realtime**: Suscripciones activas en Dashboard y TransactionsPage para actualizaciones en vivo.

## Patrones Arquitectónicos

* **Mobile-First**: Toda la UI está pensada para pantallas verticales y uso táctil (botones grandes, inputs espaciosos).
* **Component-Based**: Los componentes en `components/dungeon/` encapsulan estilos y lógica de presentación, manteniendo las páginas limpias.
* **Service Layer**: `profileService.ts` y las llamadas directas a Supabase centralizan la lógica de datos.

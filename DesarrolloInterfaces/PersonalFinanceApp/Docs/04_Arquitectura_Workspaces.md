# 04. Arquitectura de Workspaces

## Mapa de Directorios y Módulos

Este documento describe la estructura completa del proyecto y la responsabilidad de cada módulo.

---

## 📂 Estructura del Proyecto

```
PersonalFinanceApp/
├── Docs/                           # 📚 Documentación del Proyecto
│   ├── 00_Reglas_Maestras.md       # Visión y reglas de negocio
│   ├── 01_Estrategia_Tecnica.md    # Stack y arquitectura técnica
│   ├── 02_Diseño_UI_UX.md          # Sistema de diseño
│   ├── 03_Roadmap_Vivo.md          # Estado y próximos pasos
│   ├── 05_Bitacora_Dev.md          # Historial técnico
│   ├── Funcionalidades.md          # Especificación de features
│   ├── Skills/                     # Procedimientos estandarizados
│   └── MCP/                        # Configuración de herramientas
│
├── src/                            # 💻 Código Fuente
│   ├── assets/                     # 🎨 Recursos estáticos
│   │   └── (imágenes, fuentes)
│   │
│   ├── components/                 # 🧩 Componentes Reutilizables
│   │   └── (botones, inputs, etc.)
│   │
│   ├── data/                       # 📊 Datos Iniciales
│   │   └── initialData.json        # Semilla de datos para desarrollo
│   │
│   ├── features/                   # 🎮 Módulos de Funcionalidad
│   │   ├── auth/                   # Autenticación
│   │   │   ├── HeroHall.tsx        # Selector de perfil
│   │   │   └── LoginScreen.tsx     # Pantalla de login
│   │   │
│   │   └── fantasy/                # Módulos Core del Grimorio
│   │       ├── GrimoireDashboard.tsx    # Dashboard principal
│   │       ├── DebtTracker.tsx          # Gestión de deudas (Refactorizado)
│   │       ├── FinancialScore.tsx       # Score financiero
│   │       ├── SharedAccounts.tsx       # Cuentas compartidas
│   │       ├── MercenaryContracts.tsx   # Contratos/Suscripciones
│   │       ├── TreasureChests.tsx       # Presupuestos/Cofres
│   │       ├── AdventurerLicense.tsx    # Perfil y Configuración (Moneda)
│   │       ├── MarketplaceScreen.tsx    # Tienda de items y personalización
│   │       ├── QuickAddMenu.tsx         # Menú rápido de acciones
│   │       └── fantasy.css              # Estilos compartidos
│   │
│   ├── hooks/                      # 🪝 Custom Hooks
│   │   └── (lógica reutilizable)
│   │
│   ├── services/                   # ⚙️ Capa de Servicios
│   │   ├── storageService.ts       # Persistencia local (CRUD)
│   │   ├── gamificationService.ts  # Sistema XP/Niveles
│   │   ├── marketplaceService.ts   # Sistema de compra e inventario
│   │   ├── dataSyncService.ts      # Sincronización automática
│   │   ├── coinGeckoService.ts     # API de criptomonedas
│   │   ├── currencyService.ts      # API de divisas
│   │   └── oracleService.ts        # Predicciones financieras
│   │
│   ├── types/                      # 📝 Definiciones TypeScript
│   │   └── (interfaces globales)
│   │
│   ├── App.tsx                     # 🚀 Componente raíz + Routing
│   ├── main.tsx                    # 🎯 Entry point
│   └── index.css                   # 🎨 Estilos globales + Variables CSS
│
├── public/                         # 📦 Archivos públicos
├── dist/                           # 🏗️ Build de producción
├── node_modules/                   # 📚 Dependencias
├── package.json                    # 📋 Configuración del proyecto
├── tsconfig.json                   # ⚙️ Configuración TypeScript
├── vite.config.ts                  # ⚙️ Configuración Vite
└── tailwind.config.js              # 🎨 Configuración Tailwind
```

---

## 🎯 Responsabilidades de Módulos

### 📚 Documentación (`Docs/`)

- **Reglas Maestras**: Visión del producto, reglas de negocio inmutables
- **Estrategia Técnica**: Stack, arquitectura, decisiones técnicas
- **Diseño UI/UX**: Sistema de diseño, paleta de colores, componentes
- **Roadmap Vivo**: Estado actual, hitos completados, próximos pasos
- **Bitácora Dev**: Historial técnico, problemas resueltos, lecciones aprendidas

### 🎮 Features (`src/features/`)

#### Auth

- **HeroHall**: Selector de perfil de usuario (modo familia)
- **LoginScreen**: Pantalla de autenticación (Google OAuth)

#### Fantasy (Grimorio Oscuro)

- **GrimoireDashboard**: Dashboard principal con navegación y resumen financiero.
- **DebtTracker**: Gestión de deudas con sistema de "Pergaminos de Deuda".
- **FinancialScore**: Score financiero gamificado.
- **SharedAccounts**: Cuentas compartidas para gremios.
- **MercenaryContracts**: Gestión de suscripciones recurrentes.
- **TreasureChests**: Metas de ahorro y presupuestos.
- **AdventurerLicense**: Perfil de usuario, estadísticas y configuración de moneda.
- **MarketplaceScreen**: Tienda para gastar XP/Oro en personalización (skins, avatares).

### ⚙️ Services (`src/services/`)

#### StorageService

**Responsabilidad**: Persistencia de datos offline-first
**Estrategia**: LocalStorage + JSON, con fallback a `initialData.json` y sincronización con Supabase.

#### GamificationService

**Responsabilidad**: Sistema de XP, niveles y recompensas (Oro).
**Mecánicas**: 1000 XP = 1 nivel. Toast notifications para feedback.

#### MarketplaceService

**Responsabilidad**: Gestión de inventario y transacciones de items.
**Funciones**: `getMarketplaceItems()`, `purchaseItem(itemId)`, `getUserInventory()`.
**Integración**: Verifica saldo en `GamificationService` antes de permitir compra.

#### DataSyncService

**Responsabilidad**: Sincronización automática de datos externos (Crypto, Divisas).
**Integraciones**: CoinGecko API, ExchangeRate-API.

---

## 🔄 Flujo de Datos (Marketplace)

```
┌─────────────────┐
│  User Action    │ (Click "Buy Item")
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ MarketplaceSvc  │ (Validate Funds)
└────────┬────────┘
         │
         ▼
┌─────────────────┐       ┌─────────────────┐
│ GamificationSvc │ <───> │  Supabase DB    │
│ (Deduct Price)  │       │ (Insert Item)   │
└────────┬────────┘       └─────────────────┘
         │
         ▼
┌─────────────────┐
│  StorageService │ (Update Local Inventory)
└─────────────────┘
```

---

## 🎨 Sistema de Diseño

### Tema: Grimoire Dark (Fantasía Oscura)

**Paleta de Colores**:

- Background: `#101622` (Azul oscuro profundo)
- Parchment: `#dcd3bc` (Pergamino envejecido)
- Primary: `#135bec` (Azul mágico)
- Gold: `#f4c025` (Dorado brillante)
- Text: `#e2e8f0` (Slate claro)

**Componentes Visuales**:

- Glassmorphism para overlays
- Sombras profundas para depth
- Bordes dorados para elementos premium
- Animaciones `framer-motion` para transiciones

---

## 📊 Métricas del Proyecto

- **Componentes**: 20+
- **Servicios**: 7
- **Rutas**: 12
- **Build time**: ~3.8s ✅
- **PWA**: Completamente funcional ✅
- **Estado**: Production Ready (Version 1.0) 🚀

---

**Última actualización**: 2026-02-16
**Versión**: 1.0 (Phase 19 - Localization & Marketplace)

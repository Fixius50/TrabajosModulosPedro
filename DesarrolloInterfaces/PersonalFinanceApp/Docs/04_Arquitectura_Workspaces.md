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
│   │       ├── DebtTracker.tsx          # Gestión de deudas
│   │       ├── FinancialScore.tsx       # Score financiero
│   │       ├── SharedAccounts.tsx       # Cuentas compartidas
│   │       ├── MercenaryContracts.tsx   # Contratos/Suscripciones
│   │       ├── TreasureChests.tsx       # Presupuestos/Cofres
│   │       ├── AdventurerLicense.tsx    # Perfil de usuario
│   │       ├── QuickAddMenu.tsx         # Menú rápido de acciones
│   │       └── fantasy.css              # Estilos compartidos
│   │
│   ├── hooks/                      # 🪝 Custom Hooks
│   │   └── (lógica reutilizable)
│   │
│   ├── services/                   # ⚙️ Capa de Servicios
│   │   ├── storageService.ts       # Persistencia local (CRUD)
│   │   ├── gamificationService.ts  # Sistema XP/Niveles
│   │   ├── dataSyncService.ts      # Sincronización automática
│   │   ├── coinGeckoService.ts     # API de criptomonedas
│   │   └── currencyService.ts      # API de divisas
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
- **LoginScreen**: Pantalla de autenticación

#### Fantasy (Grimorio Oscuro)

- **GrimoireDashboard**: Dashboard principal con navegación
- **DebtTracker**: Gestión de deudas (Splitwise-style)
- **FinancialScore**: Score financiero (Fintonic-style)
- **SharedAccounts**: Cuentas compartidas (Guild)
- **MercenaryContracts**: Suscripciones/Contratos recurrentes
- **TreasureChests**: Presupuestos/Objetivos de ahorro
- **AdventurerLicense**: Perfil de usuario y stats
- **QuickAddMenu**: Menú rápido de acciones (Monefy-style)

### ⚙️ Services (`src/services/`)

#### StorageService

**Responsabilidad**: Persistencia de datos offline-first

**Funciones clave**:

- `getUserProfile()`: Obtener perfil de usuario
- `updateUserProfile()`: Actualizar stats de usuario
- `getDebts()`, `updateDebt()`: CRUD de deudas
- `getContracts()`, `updateContract()`: CRUD de contratos
- `getChests()`, `updateChest()`: CRUD de cofres
- `updateNetWorth()`: Actualizar riqueza total

**Estrategia**: LocalStorage + JSON, con fallback a `initialData.json`

#### GamificationService

**Responsabilidad**: Sistema de XP, niveles y gamificación

**Funciones clave**:

- `awardXP(amount, source)`: Otorgar XP por acciones
- `awardGold(amount, source)`: Otorgar oro
- `getLevel(xp)`: Calcular nivel actual
- `getTitleForLevel(level)`: Obtener título según nivel

**Mecánicas**:

- 1000 XP = 1 nivel
- 7 rangos de títulos (Novice → Guild Master)
- Toast notifications para feedback

#### DataSyncService

**Responsabilidad**: Sincronización automática de datos externos

**Funciones clave**:

- `startSync()`: Iniciar sincronización automática (60s)
- `stopSync()`: Detener sincronización
- `sync()`: Actualizar precios crypto/divisas
- `calculateTotalWealth()`: Calcular riqueza total

**Integraciones**:

- CoinGecko API (precios crypto)
- Currency API (tasas de cambio)

#### CoinGeckoService

**Responsabilidad**: Obtener precios de criptomonedas

**Funciones clave**:

- `getTopCoins(currency)`: Top 10 cryptos por market cap

#### CurrencyService

**Responsabilidad**: Obtener tasas de cambio de divisas

**Funciones clave**:

- `getRates()`: Tasas de cambio actualizadas

---

## 🔄 Flujo de Datos

```
┌─────────────────┐
│  User Action    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Component     │ (React State)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GamificationSvc │ (Award XP/Gold)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  StorageService │ (Persist to LocalStorage)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  LocalStorage   │
└─────────────────┘

         ┌─────────────────┐
         │ DataSyncService │ (Background, 60s interval)
         └────────┬────────┘
                  │
         ┌────────┴────────┐
         ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│ CoinGeckoService│ │ CurrencyService │
└────────┬────────┘ └────────┬────────┘
         │                   │
         └────────┬──────────┘
                  ▼
         ┌─────────────────┐
         │  StorageService │ (Update NetWorth)
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

**Tipografía**:

- Display: Custom fantasy font
- Body: System fonts

**Unidades**:

- ✅ **Usar `rem`** para sizing y spacing
- ❌ **Evitar `px` hardcoded**
- Tailwind utilities preferidas

**Componentes Visuales**:

- Glassmorphism para overlays
- Sombras profundas para depth
- Bordes dorados para elementos premium
- Animaciones sutiles para feedback

---

## 🔧 Configuración Técnica

### TypeScript

- Strict mode habilitado
- Path aliases configurados
- Type checking en build

### Vite

- Fast refresh para desarrollo
- Build optimizado para producción
- Asset handling automático

### Tailwind CSS

- JIT mode habilitado
- Custom colors en config
- Purge CSS en producción

---

## 📊 Métricas del Proyecto

- **Componentes**: 15+
- **Servicios**: 5
- **Rutas**: 10
- **Build time**: 3.73s ✅
- **Bundle size**: Optimizado (code splitting, lazy loading)
- **PWA**: Completamente funcional ✅
- **Tests**: Vitest configurado (refactorización pendiente)

---

**Última actualización**: 2026-02-15 19:50 CET  
**Versión**: 1.0 (Phase 15 - Production Build completado)

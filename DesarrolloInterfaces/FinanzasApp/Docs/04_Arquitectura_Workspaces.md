# 04. Arquitectura de Workspaces

## Estructura del Proyecto (`src/`)

El código fuente se organiza siguiendo una arquitectura modular por funcionalidad y capas técnicas.

```text
src/
├── components/       # Componentes UI reutilizables ("Dumb components")
│   ├── ui/           # Atomos y moléculas básicos (Botones, Inputs)
│   └── business/     # Componentes con lógica específica de negocio (Modales)
├── pages/            # Vistas principales (Screens) - Gestores de estado
├── services/         # Capa de comunicación con Backend (Supabase)
│   ├── auth.ts
│   ├── transactions.ts
│   └── storage.ts
├── hooks/            # Custom Hooks (Lógica reutilizable)
├── context/          # React Context (Estado global ligero)
├── theme/            # Configuración de estilos y variables globales
├── i18n/             # Archivos de traducción
└── types/            # Definiciones TypeScript (Interfaces/Types)
```

## Patrones Arquitectónicos

### Service Repository Pattern

* Las **Vistas (Pages)** no conocen la implementación de la base de datos.
* Las Vistas llaman a **Servicios** (ej: `TransactionService.getAll()`).
* Los Servicios manejan la lógica de Supabase, caché local y manejo de errores.

### State Management

* **Local State**: `useState` para formularios y UI efímera.
* **Server State**: `useEffect` + Servicios para datos persistentes.
* **Global State**: Mínimo uso de Context API (solo para Auth y Theme).

### Separación de Responsabilidades

* **Components**: Solo renderizan props. No hacen fetch de datos (salvo excepciones muy específicas).
* **Pages**: Orquestan la carga de datos y pasan props a componentes.

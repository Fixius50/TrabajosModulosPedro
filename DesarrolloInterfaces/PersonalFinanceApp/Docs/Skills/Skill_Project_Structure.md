# Skill: Estructura del Proyecto (Feature-First)

## Descripción

Organización del código fuente para escalabilidad y mantenimiento.

## 1. Arquitectura "Feature-First"

En lugar de agrupar por tipo (todos los componentes juntos, todos los hooks juntos), agrupamos por **Dominio Funcional**.

- **`src/features/`**: El núcleo de la aplicación.
  - `fantasy/`: Lógica específica del tema (Grimorio, Licencia).
  - `dashboard/`: Componentes del panel principal.
  - `transactions/`: Gestión de gastos e ingresos.
  - `auth/`: Login, Registro, Recuperación.

## 2. Componentes Compartidos (`src/components/`)

Solo para componentes "tontos" y reutilizables que NO dependen de lógica de negocio específica.

- `ui/`: Botones, Inputs, Cards (Genéricos).
- `layout/`: Estructuras de página (Header, Sidebar).

## 3. Servicios (`src/services/`)

Capa de comunicación de datos. **Desacoplada de React**.

- `storageService.ts`: Persistencia Local.
- `supabase.ts`: Cliente DB.
- `gamificationService.ts`: Lógica de juego.

## 4. Convenciones de Naming

- **Componentes**: `PascalCase.tsx` (ej: `QuickAddMenu.tsx`).
- **Hooks**: `camelCase.ts` (ej: `useMarketData.ts`).
- **Servicios**: `camelCase.ts` (ej: `authService.ts`).
- **Tipos**: `PascalCase.ts` (ej: `UserProfile.ts`).

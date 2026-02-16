# Skill: Autenticación y Seguridad (Supabase Auth)

## Descripción

Estándares para el manejo de sesiones de usuario, rutas protegidas y seguridad de datos.

## 1. Contexto de Autenticación (`AuthContext`)

- **Propósito**: Proveer el estado global del usuario (`user`, `session`, `loading`) a toda la app.
- **Implementación**: `src/context/AuthContext.tsx`.
- **Uso**:

    ```typescript
    const { user, signIn, signOut } = useAuth();
    ```

## 2. Protección de Rutas (`ProtectedLayout`)

- **Estrategia**: No proteger rutas individualmente. Envolver todas las rutas privadas dentro de `ProtectedLayout`.
- **Comportamiento**:
  - Si `loading`: Mostrar spinner.
  - Si `!user`: Redirigir a `/login`.
  - Si `user`: Renderizar `<Outlet />` y `QuickAddMenu`.

## 3. Row Level Security (RLS)

- **Regla de Oro**: "Un usuario solo puede ver y editar sus propios datos".
- **Implementación en Supabase**:
  - Habilitar RLS en todas las tablas.
  - Política SELECT: `auth.uid() = user_id`.
  - Política INSERT: `auth.uid() = user_id`.
  - Política UPDATE: `auth.uid() = user_id`.

## 4. Manejo de Errores de Auth

- **Sesión Expirada**: El cliente de Supabase maneja el refresco de tokens automáticamente.
- **Error Crítico**: Si falla el refresco, el `onAuthStateChange` detectará `SIGNED_OUT` y redirigirá al login.

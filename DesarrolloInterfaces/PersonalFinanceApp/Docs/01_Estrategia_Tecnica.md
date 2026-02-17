# 01. Estrategia Técnica

## Stack Tecnológico

- **Frontend Core**: React (Vite) + TypeScript.
- **Estado**:
  - Global: React Hooks + Context (para autenticación y temas).
  - Persistencia: `StorageService` personalizado basado en JSON y LocalStorage (Estrategia "Offline-First" simplificada).
- **Estilos**: Tailwind CSS + Variables CSS personalizadas (`fantasy.css`).
  - Tema: **Grimoire Dark** (Fantasía Oscura, Pergaminos, Dorados).
- **Base de Datos Local**: Archivo `initialData.json` como semilla + LocalStorage.
- **Backend (BaaS)**: Supabase (Integración preparada para Auth y DB, actualmente en modo persistencia local para prototipo).
- **Generación UI**: Stitch (IA para componentes visuales complejos).
- **Routing**: `react-router-dom`.

## Arquitectura de Directorios

```
src/
  assets/         # Imágenes y fuentes estáticas
  components/     # UI Reutilizable (Botones, Inputs)
  data/           # Schema inicial (initialData.json)
  features/       
    fantasy/      # Módulos Core del Grimorio (Deudas, Cofres, Score)
  hooks/          # Logic hooks
  services/       # Capa de Servicio (storageService.ts, api.ts)
  types/          # Definiciones TypeScript
  main.tsx
```

## Estrategia de Datos (Implementado)

1. **Lectura**: `StorageService` lee de `localStorage`. Si está vacío, carga de `src/data/initialData.json`.
2. **Escritura**: Las mutaciones (añadir deuda, pagar cofre) actualizan el estado local y persisten inmediatamente en `localStorage`.
3. **Sincronización**: ✅ **Implementado**
    - `DataSyncService` actualiza precios de cripto/divisas cada 60s en segundo plano.
    - Integración con CoinGecko API y Currency API.
    - Cálculo automático de riqueza total (crypto holdings + gold balance).
4. **Gamificación**: ✅ **Implementado**
    - `GamificationService` gestiona XP, niveles y títulos.
    - Sistema de notificaciones toast para feedback inmediato.
    - Persistencia de stats de usuario en `localStorage`.

## Seguridad y Resiliencia

- **Manejo de Excepciones**:
  - `GlobalErrorBoundary`: Intercepta fallos críticos de renderizado para evitar cierres de app.
  - Bloques `try-catch` preventivos en servicios de persistencia.
- **Monitoreo**: Configuración base de Sentry para telemetría.
- **Sesión**: Sistema de tiempo de espera (30m) con advertencia visual.
- **Validación**: Interfaces TypeScript estrictas para todos los modelos de datos.

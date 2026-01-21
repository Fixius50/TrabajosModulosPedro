# ☁️ Guía de Implementación: Supabase Edge Functions

## 🎯 Objetivo
Implementar una arquitectura **Serverless** utilizando Supabase Edge Functions para actuar como un **Proxy de API**.
Esto resuelve los siguientes problemas:
1.  **Bloqueos CORS:** Muchas APIs (Binance, CoinGecko) bloquean peticiones directas desde el navegador web (`localhost` o tu dominio).
2.  **Seguridad:** Permite ocultar API Keys privadas en el servidor (en variables de entorno) en lugar de exponerlas en el código del cliente.

## 🏗️ Arquitectura Implementada

`Frontend (App)` -> `api.proxy.ts` -> `Supabase Edge Function` -> `API Externa (Binance/Finnhub)`

## 🚀 Pasos de Configuración Realizados

### 1. Inicialización del CLI
Se inicializó la estructura local de Supabase en el proyecto:
```powershell
npx supabase init
```
Esto creó el directorio `/supabase`.

### 2. Creación de la Función `fetch-external-data`
Se generó el esqueleto de la función:
```powershell
npx supabase functions new fetch-external-data
```

### 3. Implementación del Proxy (Deno)
Se modificó `supabase/functions/fetch-external-data/index.ts` para crear un servidor HTTP con `Deno.serve`.
*   **Funcionalidad:** Recibe una URL y un método, y realiza la petición `fetch` desde el entorno seguro del servidor.
*   **CORS:** Añade las cabeceras `Access-Control-Allow-Origin: *` a la respuesta para permitir que nuestra App la consuma.

### 4. Servicio Frontend (`api.proxy.ts`)
Se creó un servicio en `src/services/api.proxy.ts` para estandarizar las llamadas:
```typescript
import { proxyService } from './api.proxy';
// Uso:
const data = await proxyService.fetch('https://api.binance.com/...');
```

## 📦 Despliegue (Deployment)

Para subir cambios a la nube de Supabase:

1.  **Login (solo la primera vez):**
    ```powershell
    npx supabase login
    ```

2.  **Deploy:**
    ```powershell
    npx supabase functions deploy fetch-external-data --no-verify-jwt
    ```
    *Nota: `--no-verify-jwt` permite llamar a la función sin necesidad de que el usuario esté logueado (pública/anon), ideal para datos de mercado generales.*

## 🛠️ Archivos Clave
*   `supabase/functions/fetch-external-data/index.ts`: Lógica del Proxy.
*   `src/services/api.proxy.ts`: Cliente para consumir la función.
*   `src/services/market.service.ts`: Ejemplo de integración (consumiendo Binance).

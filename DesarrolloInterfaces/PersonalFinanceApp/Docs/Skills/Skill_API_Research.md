# Skill: Investigación e Integración de APIs

## Descripción

Protocolo estándar para el **Role: Ingeniero de Integración** al conectar servicios externos.

## 1. Fase de Reconocimiento (Investigación)

Antes de escribir una sola línea de código en la app:

1. **Lectura de Documentación Oficial**:
    - Buscar endpoints de autenticación, rate limits y estructura de datos.
    - *Herramienta*: Usar `read_url_content` en la documentación del proveedor.
2. **Prueba de Concepto (PoC) Aislada**:
    - Crear un script temporal o usar `curl` para validar la conexión.
    - **Objetivo**: Obtener un "200 OK" y un JSON de respuesta real.
3. **Análisis de Costes/Límites**:
    - Verificar si la API es gratuita, freemium o de pago.
    - Documentar límites (ej. 100 req/día) en `Docs/01_Estrategia_Tecnica.md`.

## 2. Gestión de Secretos (Seguridad)

- **Regla Inviolable**: NUNCA commitear API Keys al repositorio.
- **Flujo**:
    1. Agregar variable a `.env` (ej. `VITE_API_KEY_GECKO`).
    2. Documentar la variable requerida en `.env.example`.
    3. Acceder en código vía `import.meta.env`.

## 3. Integración en Arquitectura (Service Layer)

Las llamadas a API externas **SIEMPRE** deben encapsularse en un Servicio.

- **Incorrecto**: Llamar a `fetch()` dentro de un componente UI.
- **Correcto**:
  - Crear `src/services/external/coingeckoService.ts`.
  - Definir interfaces TypeScript para las respuestas (`CoinGeckoResponse`).
  - Exponer métodos limpios (`getPrice('bitcoin')`) que devuelvan datos de dominio, no el JSON crudo.

## 4. Manejo de Fallos (Resiliencia)

- **Timeouts**: Configurar tiempos de espera máximos.
- **Fallbacks**: Si la API falla, ¿qué muestra la UI? (ej. Cache local, valor por defecto, mensaje de error amigable).
- **Circuit Breaker**: Si la API falla repetidamente, dejar de llamar por un tiempo.

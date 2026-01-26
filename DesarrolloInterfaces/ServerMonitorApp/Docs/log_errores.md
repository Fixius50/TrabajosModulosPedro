# Log de Errores

| Fecha | Error | Causa | SoluciÃ³n |
|-------|-------|-------|----------|
| 2026-01-20 | EPERM (-4048) en create-next-app | Posible bloqueo de archivos o cachÃ© de npm | Reintento de ejecuciÃ³n de comando. |
| 2026-01-20 | EPERM (Persistente) en create-next-app | Problema de entorno local/permisos | Solicitud manual al usuario. |
| 2026-01-20 | EPERM (Persistente) en create-next-app | Problema de entorno local/permisos | Solicitud manual al usuario. |
| 2026-01-20 | EPERM (mkdir AppData\Roaming) | Bloqueo de escritura en config de create-next-app | **ESTRATEGIA:** Scaffolding manual de archivos. |

***
**ERROR:** "Tema no cambia y simulación se queda pegada"

**DIAGNÓSTICO:**
1. 	ailwind.config.ts faltaba darkMode: 'class'.
2. Dashboard.tsx no limpiaba el estado al salir de simulación.

**SOLUCIÓN:**
- Añadido darkMode: 'class'.
- Forzado setContainers([]) y setHostMetrics(null) al desactivar simulación.

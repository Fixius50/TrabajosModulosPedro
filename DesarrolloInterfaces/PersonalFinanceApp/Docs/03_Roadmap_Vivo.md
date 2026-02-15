# 03. Roadmap Vivo

## Estado Actual: FASE 8 COMPLETADA (Persistencia y Core UI)

El proyecto ha avanzado significativamente. Toda la interfaz de usuario base (Fantasía Oscura) está implementada y funcional, respaldada por un sistema de persistencia local (JSON + LocalStorage).

### Hitos Completados

- [x] **Fase 0-1: Fundamentos**: Setup de proyecto, Vite, Estructura de directorios.
- [x] **Fase 2-3: Core Financiero**: Transacciones, Categorías, Navegación.
- [x] **Fase 4: Integración UI (Stitch)**: Diseño base "Grimoire Dark".
- [x] **Fase 5: Datos Externos (Base)**: APIs de Cripto y Divisas (visualización).
- [x] **Fase 6: Integración Apps Referencia**: Menú Rápido (Monefy), Deudas (Splitwise-style), Score (Fintonic-style).
- [x] **Fase 7: Pantallas Finales**: Contratos (Suscripciones), Cofres (Presupuestos), Licencia (Perfil).
- [x] **Fase 8: Persistencia de Datos**:
  - Implementación de `initialData.json` como semilla.
  - Creación de `StorageService` para gestión de datos offline.
  - Refactorización de todos los componentes Core para usar el servicio.

## Próximos Pasos (Backlog Inmediato)

1. **Lógica de Gamificación (Fase 9)**:
    - [ ] Sistema de XP y Niveles real (conectar acciones a subida de nivel).
    - [ ] Desbloqueo de logros/títulos nuevos.

2. **Sincronización de Datos (Fase 10)**:
    - [ ] `DataSyncService` para actualizar precios de cripto/divisas en segundo plano.
    - [ ] Conexión real con Supabase (opcional, si se quiere persistencia en nube).

3. **Pulido Final**:
    - [ ] Animaciones de transición entre pantallas.
    - [ ] Sonidos de interfaz (opcional).

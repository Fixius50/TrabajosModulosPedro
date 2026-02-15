# Skill: Arquitectura de Servicios y Tareas en Segundo Plano

## Descripción

Cómo crear y mantener servicios que ejecutan lógica de negocio o sincronización de datos fuera del ciclo de vida de los componentes React.

## Patrón Singleton

Los servicios deben instanciarse como Singletons para mantener el estado y las referencias durante la vida de la sesión.

```typescript
class MiServicio {
    // Estado interno (si es necesario)
    private data: any = null;

    constructor() {
        // Inicialización
    }

    async metodoAsync() {
        // Lógica
    }
}

// Exportar una ÚNICA instancia
export const miServicio = new MiServicio();
```

## Servicios en Segundo Plano (Background Services)

Para tareas como sincronización de datos (`DataSyncService`):

1. **Inicialización**: Iniciar el servicio en `App.tsx` dentro de un `useEffect` de montaje.
2. **Limpieza**: Exponer un método `stop()` o `cleanup()` para detener intervalos o suscripciones al desmontar la app.

### Ejemplo de Implementación

```typescript
class BackgroundWorker {
    private intervalId: number | null = null;

    start() {
        if (this.intervalId) return;
        this.intervalId = window.setInterval(() => this.tick(), 60000);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private async tick() {
        console.log("Ejecutando tarea...");
        // Lógica de sincronización
    }
}
```

## Integración con React

No inyectar servicios en componentes. Importar la instancia exportada directamente.
Si el servicio actualiza datos que la UI debe reflejar:

1. El servicio actualiza el almacén de datos (`StorageService` / `localStorage`).
2. El componente lee los datos actualizados (reactiva o explícitamente al montar/enfocar).

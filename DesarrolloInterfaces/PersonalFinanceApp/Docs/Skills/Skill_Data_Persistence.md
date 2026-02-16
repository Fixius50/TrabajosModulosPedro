# Skill: Persistencia de Datos (StorageService)

## Descripción

Guía para manejar la lectura y escritura de datos en la aplicación utilizando `localStorage` y `initialData.json`.

## Arquitectura de Datos

1. **Fuente de Verdad**: `localStorage` bajo la clave `grimoire_data_v1`.
2. **Respaldo**: `src/data/initialData.json` actúa como semilla inicial si no hay datos en `localStorage`.
3. **Servicio Central**: `StorageService` (`src/services/storageService.ts`) es la **ÚNICA** vía permitida para acceder o modificar datos.
4. **Estrategia Híbrida**: "Offline-first".
    - Leer siempre de local para velocidad inmediata.
    - Escribir en local + intentar sincronizar en segundo plano (Supabase).
    - Permitir exportación manual a JSON (`Backup`).
5. **Estrategia Híbrida**: "Offline-first".
    - Leer siempre de local para velocidad inmediata.
    - Escribir en local + intentar sincronizar en segundo plano (Supabase).
    - Permitir exportación manual a JSON (`Backup`).

## Uso de StorageService

### Lectura

```typescript
import { storageService } from '../services/storageService';

// Obtener todos los contratos
const contracts = storageService.getContracts();

// Obtener perfil de usuario
const profile = storageService.getUserProfile();
```

### Escritura (Mutaciones)

Siempre usar métodos explícitos en el servicio. Si no existe, créalo.

```typescript
// Actualizar un contrato
const updatedContract = { ...contract, status: 'Paused' };
storageService.updateContract(updatedContract);

// Actualizar patrimonio neto
storageService.updateNetWorth(50000);
```

## Reglas de Migración

Si agregas un nuevo campo a `initialData.json`:

1. Actualiza la interfaz TypeScript correspondiente en `storageService.ts`.
2. Agrega una validación en el constructor de `StorageService` para inyectar un valor por defecto si el campo no existe en los datos guardados del usuario (ver ejemplo de `netWorth`).

## Estructura de Tipos Clave

- `UserProfile`: Datos del héroe, nivel, XP, avatar.
- `Debt`: Deudas (a pagar o a cobrar).
- `Contract`: Suscripciones recurrentes.
- `FinancialScoreData`: Puntuación de crédito/héroe.
- `BudgetChest`: Presupuestos mensuales.

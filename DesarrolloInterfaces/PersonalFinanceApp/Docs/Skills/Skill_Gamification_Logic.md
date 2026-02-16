# Skill: Lógica de Gamificación (XP, Oro, Niveles)

## Descripción

Implementación de mecánicas de juego para incentivar hábitos financieros saludables.

## Conceptos Core

1. **XP (Experiencia)**: Se gana por acciones positivas (pagar deuda, ahorrar). Determina el Nivel del Héroe.
2. **Oro (GP)**: Moneda virtual. 1 GP ≈ 1 Unidad de Moneda Real (para simplificar inmersión).
3. **Hitos (Tiers)**: Clasificación basada en el Score Financiero (Novice, Apprentice, Adept, Master).

## GamificationService

Ubicación: `src/services/gamificationService.ts`

### Otorgar Recompensas

```typescript
import { gamificationService } from '../services/gamificationService';

// Otorgar XP (ej: al completar una tarea)
gamificationService.awardXP(50, "Misión Completada");

// Otorgar Oro (ej: ingreso recibido)
gamificationService.awardGold(100, "Botín de Guerra");
```

### Cálculo de Niveles

- La experiencia requerida para el siguiente nivel escala progresivamente.
- La lógica de nivelación es manejada internamente por el servicio.

## Integración en UI

- **Toasts**: El servicio emite notificaciones visuales automáticas al otorgar recompensas.
- **Barra de Progreso**: Componentes como `FinancialScore` o `AdventurerLicense` deben suscribirse a los cambios del perfil (`storageService.getUserProfile()`) para reflejar el progreso en tiempo real.

## 4. Mercado (Marketplace)

- **Moneda**: Oro (Gold) ganado por misiones.
- **Items**: Cosméticos y funcionales (Skins, Potions).
- **Validación**: `MarketplaceService` gestiona inventario y transacciones seguras.

## 5. Sistema de Rangos de Gremio

- **Bronce (Novato)**: 0 - 999 XP
- **Plata (Aventurero)**: 1000 - 4999 XP
- **Oro (Veterano)**: 5000 - 9999 XP
- **Platino (Leyenda)**: 10000+ XP

## Eventos Estándar

| Acción | XP Base | Mensaje Sugerido |
| :--- | :--- | :--- |
| Pagar Deuda | 100 XP | "Burden Lifted" |
| Cobrar Deuda | 50 XP | "Tribute Received" |
| Depositar Ahorro | 10 XP | "Gold Hoarded" |
| Pagar Servicio | 25 XP | "Contract Renewed" |
| Login Diario | 5 XP | "Daily Awakening" |

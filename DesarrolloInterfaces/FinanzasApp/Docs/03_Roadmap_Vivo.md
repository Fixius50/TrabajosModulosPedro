# 03_Roadmap_Vivo.md

## Estado Actual: Fase 1 Completada (Base Dungeon)

- [x] Arquitectura Mobile-First
- [x] Sistema de Diseño Dungeon Theme
- [x] CRUD Transacciones (Ingresos/Gastos)
- [x] Persistencia Supabase

---

## FASES FUTURAS (Diseño "Toda la App")

### 🛡️ Fase 2: The Market & Rumors (Información)

**Objetivo**: Convertir la app en un terminal de información financiera inmersiva.

1. **Mercado Global (`GlobalMarketPage.tsx`)**:
   - Pestaña nueva en `MainTabs`.
   - Visualización de Crypto (CoinGecko) como "Artefactos Exóticos".
   - Visualización de Stocks (Finnhub) como "Inversiones del Reino".
2. **Rumores de Taverna**:
   - Feed de noticias financieras (Finnhub News) estilizado como pergaminos breves.

### ⚔️ Fase 3: The Guild & Inventory (Gamificación)

**Objetivo**: Dar sentido al ahorro mediante mecánicas RPG.

1. **Sistema de Inventario**:
   - Conectar `dnd5eapi`: Mapear saldo total a items de D&D.
   - *Feature*: "Tu tesoro actual equivale a: 1 Espada Larga + 2 Pociones".
2. **Misiones (Presupuestos)**:
   - "Misión: La Torre del Mago" (Ahorrar 500€ para un PC nuevo).
   - Barra de progreso visual (XP Bar).

### 🔮 Fase 4: The Oracle (Inteligencia)

**Objetivo**: Asistencia financiera automatizada.

1. **Análisis de Gastos**:
   - Gráficos de quesitos/barras pero con estilo "Mapas Astrales".
2. **Predicciones**:
   - Algoritmo simple que proyecta gastos futuros basado en el historial.

---

## Backlog Técnico

- [ ] Implementar `FinnhubService.ts`
- [ ] Implementar `DnDService.ts`
- [ ] Crear contexto `GamificationContext`

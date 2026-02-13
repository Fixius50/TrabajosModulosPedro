# 02_Diseño_UI_UX.md

## Sistema de Diseño: "Dungeon Ledger"

### Filosofía

- **Mobile First**: Elementos grandes, tocables, navegación inferior.
- **Inmersión**: Texturas de madera, pergamino, bordes de hierro.
- **Claridad Financiera**: A pesar de la fantasía, los números y estados son claros (Verde Esmeralda / Rojo Rubí).

### Paleta de Colores (Tailwind Config)

Los tokens de diseño están definidos en `tailwind.config.js`:

| Token | Valor Hex | Uso |
|-------|-----------|-----|
| `dungeon-bg` | `#1a1614` | Fondo Principal (Madera Oscura) |
| `parchment` | `#dcd0b3` | Cartas y Modales (Papel Viejo) |
| `ink` | `#2b2118` | Texto Principal |
| `gold-coin` | `#ffcc00` | Acentos, Botones Primarios |
| `iron-border` | `#4a4a4a` | Bordes Estructurales |
| `ruby-expense` | `#8a1c1c` | Gastos / Errores |
| `emerald-income` | `#1c5c2e` | Ingresos / Éxito |
| `mana-blue` | `#1c3d5c` | Info / Neutral |

### Tipografía

- **Títulos**: `Cinzel` (Serif, Capitales, Épico).
- **Cuerpo**: `Merriweather` (Serif, Legible en tamaños pequeños).
- **Técnico/Números**: `Manrope` (Sans-serif, para montos y fechas).

### Componentes Core (`components/dungeon/`)

1. **DungeonCard**: Contenedor con borde de hierro y fondo de pergamino (`bg-parchment-texture`).
2. **DungeonButton**:
   - *Primary*: Oro sobre Negro, borde dorado.
   - *Secondary*: Fondo transparente, borde hierro.
   - *Danger*: Rojo Rubí para acciones destructivas.
3. **TransactionList**: Lista vertical sin tablas, optimizada para scroll infinito.
4. **Modales**: Ventanas emergentes centradas con animaciones de entrada (`scale-100 rotate-1`).

### UX Patterns

* **Loaders**: Texto pulsante ("Loading Ledger...") o indicadores dorados.
- **Empty States**: Mensajes temáticos ("No inscriptions yet...").
- **Feedback**: Toasts flotantes para confirmar acciones ("Saved").

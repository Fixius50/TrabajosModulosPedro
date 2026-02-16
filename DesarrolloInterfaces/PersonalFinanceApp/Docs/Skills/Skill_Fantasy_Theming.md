# Skill: Temática de Fantasía (Grimoire UI)

## Descripción

Guía de diseño para mantener la inmersión en el tema "Grimorio Oscuro" (Dark Fantasy).

## Paleta de Colores

| Color | Tailwind Class | Código Hex | Uso |
| :--- | :--- | :--- | :--- |
| **Fondo Base** | `bg-[#0c0a09]` | `#0c0a09` | Stone-950. Fondo principal profundo. |
| **Acento Mágico** | `text-primary` | `#f59e0b` | Amber-500. Oro, XP, Elementos activos. |
| **Superficie** | `bg-stone-900/90` | `#1c1917` | Paneles con glassmorphism (backdrop-blur). |
| **Texto** | `text-stone-200` | `#e7e5e4` | Texto legible sobre fondo oscuro. |
| **Peligro** | `text-red-500` | `#ef4444` | Deudas, Errores, "Huir". |
| **Maná** | `text-violet-500` | `#8b5cf6` | Elementos místicos, sabiduría. |

## Tipografía

- **Principal (Display)**: `Cinzel` o `MedievalSharp` (usar `font-display`). Para encabezados y títulos.
- **Cuerpo (Body)**: `Inter` o `Lato` (usar `font-sans`). Para legibilidad en listas y detalles.

## Metáforas Visuales

- **Deudas** → "Cadenas", "Maldiciones", "Cargas".
- **Ahorros** → "Tesoros", "Cofres", "Botín".
- **Suscripciones** → "Contratos de Mercenarios", "Pactos".
- **Perfil** → "Licencia de Aventurero".
- **Configuración** → "Grimorio de Ajustes".

## Assets

- Usar iconos de `Material Icons` que encajen con la fantasía: `swords`, `shield`, `castle`, `scroll`, `backpack`, `token`, `local_fire_department`.
- Texturas de fondo sutiles (piedra, papel viejo) usando superposiciones CSS con baja opacidad.

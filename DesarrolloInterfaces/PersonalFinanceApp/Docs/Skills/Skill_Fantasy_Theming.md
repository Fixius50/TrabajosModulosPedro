# Skill: Temática de Fantasía (Grimoire UI)

## Descripción

Guía de diseño para mantener la inmersión en el tema "Grimorio Oscuro" (Dark Fantasy).

## Paleta de Colores

| Color | Tailwind Class | Código Hex | Uso |
| :--- | :--- | :--- | :--- |
| **Fondo Profundo** | `bg-[#101622]` | `#101622` | Color base de la aplicación. |
| **Acento Dorado** | `text-primary` | `#f4c025` | Títulos, iconos importantes, oro. |
| **Pergamino** | `bg-[#dcd3bc]` | `#dcd3bc` | Contenedores de contenido (cartas, listas). |
| **Texto Oscuro** | `text-stone-900` | `#1c1917` | Texto sobre pergamino. |
| **Rojo Sangre** | `text-[#8b0000]` | `#8b0000` | Botones de peligro, deudas, alertas. |
| **Azul Arcano** | `text-blue-500` | `#3b82f6` | Elementos mágicos, energía, maná. |

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

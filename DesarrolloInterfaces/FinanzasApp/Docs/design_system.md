# Design System: El Prisma del Patrimonio Híbrido (Unified)

Based on references: `círculo_del_patrimonio`, `galería_reliquias`, `ritual_sincronización`

## 1. Color Palette & Themes

The app uses a "Cosmic Financial" aesthetic with section-specific color identities.

| Token | Hex | Usage |
|-------|-----|-------|
| **Base Colors** | | |
| `deep-charcoal` | `#0a0c12` | Main background gradient start. |
| `midnight` | `#05070a` | Deep background, gradients end. |
| `vault-panel` | `#191022` | Panel backgrounds (Glass/Purple tint). |
| `silver-zen` | `#e2e8f0` | Primary text. |
| `silver-muted` | `#cbd5e1` | Secondary text. |
| **Theme 1: Ecosystem (Dashboard)** | | |
| `primary` | `#d4af37` | **Gold**. Wealth indicators, main actions. |
| `electric-cyan` | `#00f5ff` | **Cyan**. Data visualization, active states, growth. |
| **Theme 2: Vault (Assets)** | | |
| `primary-purple` | `#7f13ec` | **Purple**. Rare items, "Relics", physical assets. |
| **Theme 3: Ritual (Sync)** | | |
| `primary-red` | `#d41132` | **Crimson**. Sync processes, alerts, "Portal" states. |
| `gold-accent` | `#c5a059` | **Muted Gold**. Secondary accents in rituals. |

## 2. Typography

### Primary UI Font

- **Family:** `Manrope`, sans-serif
- **Usage:** Body text, buttons, general UI elements.
- **Weights:** Light (300) to ExtraBold (800).

### Display/Prestige Font

- **Family:** `Newsreader`, serif
- **Usage:** Section headings ("El Astrolabio"), high-value numbers, "human" elements.
- **Weights:** Light (300), Regular (400), Italic.

### Technical Font

- **Family:** `JetBrains Mono`, monospace
- **Usage:** Tickers, financial tables, coordinates, identifying codes.
- **Weights:** Regular (400), Bold (700).

## 3. UI Components

### Containers

- **Zen Card:** Glassmorphism (`blur(20px)`) with subtle white/blue borders.
- **Metallic Panel:** Darker, heavy gradients (Purple/Black) for "Vault" items.
- **Portal Container:** Circular elements with rotating borders (Sync states).

### Special Visuals

- **Hologram Effect:** Box-shadow glow (`0 0 40px primary`) + Scanlines.
- **Data Fractal:** Conic gradients used in backgrounds.
- **Stardust:** Radial gradient dots pattern.

## 4. Implementation Strategy (Tailwind)

```javascript
// tailwind.config.ts extension
extend: {
    colors: {
        "primary": "#d4af37",      // Gold
        "secondary": "#00f5ff",    // Cyan
        "background": "#05070a",   // Midnight
        "surface": "#0a0c12",      // Deep Charcoal
        "vault": "#7f13ec",        // Purple
        "ritual": "#d41132",       // Red
        "panel": "#191022",        // Vault Panel
    },
    fontFamily: {
        "sans": ["Manrope", "sans-serif"],
        "serif": ["Newsreader", "serif"],
        "mono": ["JetBrains Mono", "monospace"]
    },
    backgroundImage: {
        'stardust': "radial-gradient(circle, #fff 1px, transparent 1px)",
    }
}
```

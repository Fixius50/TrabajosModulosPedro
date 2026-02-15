# 02. Diseño UI/UX

## Filosofía Visual: "El Grimorio Financiero"

El diseño ya no es un "Glassmorphism" genérico, sino una **Interfaz de Fantasía Oscura de Alta Fidelidad**. La aplicación se siente como un artefacto mágico antiguo.

- **Tema Principal**: **Grimoire Dark** (Oscuro, Místico, Premium).
- **Metáfora Visual**: El usuario es un aventurero gestionando sus recursos en un mundo de rol.
- **Tipografía**:
  - `Cinzel` / `Playfair Display` (Títulos, Headers, Sensación Épica).
  - `Inter` / `Lato` (Cuerpo de texto, para legibilidad en datos financieros).

## Paleta de Colores (Variables CSS)

El sistema se basa en tonos tierra oscuros, dorados brillantes y acentos mágicos.

```css
:root {
  /* Fondos */
  --bg-dark: #0c0b06;       /* Negro casi absoluto */
  --bg-panel: #16140d;      /* Marrón muy oscuro */
  --bg-scroll: #eaddcf;     /* Pergamino claro (para contratos) */
  
  /* Acentos */
  --color-gold: #f4c025;    /* Oro principal */
  --color-gold-dim: #b8860b; /* Oro apagado */
  --color-magic: #8b5cf6;   /* Violeta mágico (encantamientos) */
  --color-fire: #ef4444;    /* Rojo (peligro, deudas) */
  --color-forest: #10b981;  /* Verde (ingresos, éxito) */

  /* Bordes y Texturas */
  --border-gold: rgba(244, 192, 37, 0.3);
  --shadow-glow: 0 0 15px rgba(244, 192, 37, 0.15);
}
```

## Componentes Clave

1. **Cofres (Budgets)**: Contenedores físicos que se abren/cierran con animaciones. Barras de progreso con texturas metálicas.
2. **Pergaminos (Contratos)**: Listas con fondo de papel envejecido, tipografía serif y bordes rasgados.
3. **Medallones (Score)**: Indicadores circulares con efectos de partículas y brillo.
4. **Licencia de Aventurero (Perfil)**: Tarjeta de identificación con efecto holográfico sutil y sellos de cera.

## Interacciones

- **Hover**: Los elementos dorados brillan más intenso.
- **Click**: Efecto de "prensa" física o sonido sutil (futuro).
- **Transiciones**: Suaves, como pasar páginas de un libro.

# 02. Diseño UI/UX - Sistema "Fantasy Finance"

## Filosofía de Diseño

Estética "Dark Glassmorphism" combinada con elementos de rol y fantasía medieval.

- **Look & Feel**: Oscuro, misterioso, pero limpio y usable.
- **Paleta**: Tonos oscuros de piedra, acentos dorados/ámbar (Primary), y efectos de neón rúnico.

---

## 1. Paleta de Colores

### Primary (Gold/Amber)

- **Base**: `#f59e0b` (Amber-500)
- **Glow**: `rgba(245, 158, 11, 0.5)`
- **Uso**: Botones principales, acentos, iconos activos, bordes de cartas raras.

### Backgrounds

- **App Bg**: `#0c0a09` (Stone-950)
- **Card Bg**: `rgba(28, 25, 23, 0.7)` (Stone-900 con opacidad)
- **Overlay**: `rgba(0, 0, 0, 0.8)`

### Texturizado

- **Leather**: Fondo con patrón de cuero sutil.
- **Parchment**: Usado para tooltips o notas.

---

## 2. Componentes UI

### 2.1 Glass Cards

- **Clase**: `.glass-panel`
- **Estilo**: Fondo semitransparente, borde sutil blanco/10, backdrop-blur.
- **Uso**: Contenedores principales de información.

### 2.2 Botones "Runic"

- **Clase**: `.btn-primary`
- **Estilo**: Gradiente ámbar, texto oscuro, shadow glow, uppercase.
- **Estado**: Scale on active, brightness on hover.

### 2.3 Tipografía

- **Títulos**: `Cinzel` o `Serif` (Toque medieval).
- **Cuerpo**: `Inter` o `Sans-serif` (Legibilidad moderna).
- **Números**: `Monospace` (Para datos financieros).

---

## 3. Feedback & Animaciones

- **Transiciones**: `Framer Motion` para cambios de página (Fade/Slide).
- **Micro-interacciones**: Escala al pulsar botones, brillo al hover en items.
- **Success**: Partículas doradas o brillo verde.
- **Error**: Vibración roja y mensaje de "Maldición".

---

## 4. Nuevos Patrones UI (Fase 16-19)

### 4.1 Encabezados Centrados

- **Estructura**: `ArrowLeft` (izquierda), `Título` (centro), `Acción` (derecha).
- **Estilo**: Fondo `bg-stone-900/90` con `backdrop-blur`.
- **Interacción**: Chevron en dashboard para menú desplegable (Logout).

### 4.2 Marketplace Grid

- **Layout**: Grid responsivo (2 col móvil, 3-4 col desktop).
- **Cards**: Estilo "Glass" con borde dorado al seleccionar.
- **Feedback**: Animación de desbloqueo y deducción de monedas.

### 4.3 Selector de Moneda

- **Ubicación**: Perfil de usuario (Adventurer License).
- **Opciones**: Taros (EUR), Áureos (USD), Libras (GBP).
- **Persistencia**: LocalStorage + Supabase.

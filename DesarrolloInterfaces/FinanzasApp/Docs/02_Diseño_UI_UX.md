# 02. Diseño UI/UX y Sistema "Cosmic Financial"

## 1. Filosofía de Diseño

Inspirado en "El Prisma del Patrimonio Híbrido", buscando una estética financiera futurista y sólida.

### Temas Visuales

* **Ecosystem (Dashboard)**: `Gold` (#d4af37) & `Cyan` (#00f5ff). Riqueza y Crecimiento.
* **Vault (Activos)**: `Purple` (#7f13ec). Valor almacenado, activos raros.
* **Ritual (Sync)**: `Crimson` (#d41132). Procesos críticos, alertas.

## 2. Sistema de Componentes (Stitch Ready)

Este proyecto utiliza **Stitch** como herramienta de diseño asistida por IA.

### Paleta de Colores (Tailwind Tokens)

```javascript
colors: {
    "primary": "#d4af37",      // Gold
    "secondary": "#00f5ff",    // Cyan
    "background": "#05070a",   // Midnight
    "surface": "#0a0c12",      // Deep Charcoal
    "vault": "#7f13ec",        // Purple
    "ritual": "#d41132",       // Red
    "panel": "#191022",        // Vault Panel
}
```

### Tipografía

* **Cuerpo**: `Manrope` (Legibilidad moderna).
* **Display**: `Newsreader` (Elegancia clásica para títulos).
* **Datos**: `JetBrains Mono` (Precisión numérica).

## 3. Integración con Stitch (MCP)

Utilizamos el servidor MCP de Stitch para conectar el diseño visual directamente con el código.

* **Flujo de Trabajo**:
    1. Diseñar pantalla/componente en Stitch.
    2. Consultar especificaciones vía MCP (`get_stitch_screen`).
    3. Generar código React/Tailwind alineado con los tokens del sistema.

## 4. UX Patterns

* **Modales**: Para formularios de edición/creación (Context preservation).
* **Toasts**: Feedback no bloqueante.
* **Pull-to-Refresh**: Actualización manual de datos.

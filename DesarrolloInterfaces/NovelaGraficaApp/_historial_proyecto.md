# Historial del Proyecto: NovelaGraficaApp

## PROMPTS
**Usuario:**
> Actúa como un Lead Full-Stack Engineer & Cloud Architect. Tu misión es construir la arquitectura completa aplicando Ingeniería Defensiva e Investigación Profunda. [...] Esta app va a consistir en Crear una novela gráfica interactiva con imágenes y texto. Los usuarios pueden decidir por donde transcurre parte de la trama y así habrá diferentes finales. Un comic de viñetas se valorará mejor.

## STACK
*   **Frontend**: React (Vite)
*   **Motor Gráfico**: PixiJS (v8)
*   **Estado/Lógica**: Custom Story Engine
*   **Estilos**: Vanilla CSS
*   **Datos**: Local JSON (Current) -> Supabase (Planned)

## CÓDIGO CLAVE

### Estrategia de Datos (JSON Schema - Actual)
```json
{
  "id": "story_001",
  "title": "El Misterio del Bosque Digital",
  "nodes": {
    "start": {
      "type": "panel",
      "image": "/assets/images/panel1.png",
      "text": "Todo comenzó una noche oscura...",
      "next": "decision_1"
    }
  }
}
```

### Arquitectura de Base de Datos (Supabase SQL - Futuro)
Hemos definido el esquema relacional para cuando migremos a la nube (`src/db/schema.sql`):
- `story_nodes`: Maneja las viñetas y efectos.
- `dialogues`: Separados de la imagen para accesibilidad.
- `story_choices`: Grafo de decisiones.
- `user_progress`: Persistencia en nube.

### Seed Data (Datos de Prueba)
Guardado en `src/db/seed.sql`. Este script SQL rellena la base de datos con la historia de prueba del "Bosque Digital", conectando nodos y diálogos automáticamente.


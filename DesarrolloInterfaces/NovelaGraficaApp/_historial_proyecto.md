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


**Usuario:**
> Route Map Navigation (Enhancement): The user's main objective is to enhance the route map feature by allowing players to navigate back to previously visited nodes. This includes implementing a confirmation step that warns the player about potential point loss if they return to a path not yet completed. The user also wants to remove the non-functional legend button from the route map interface.

**Funcionalidad Implementada:**
*   **Gestión de Rutas**: Implementada lógica para volver a nodos visitados desde el mapa.
*   **UI/UX**: Eliminado botón "Leyenda" obsoleto. Añadido popup de advertencia (alerta de pérdida de puntos) antes de navegar atrás.
*   **Fix**: Solucionado bug de propagación de eventos click en el mapa.

**Código Clave:**
`src/components/RouteMap.jsx`:
```javascript
// Propagación detenida para evitar cierre del mapa
<button onClick={(e) => { e.stopPropagation(); setShowConfirmation(true); }}>
    ↩️ Volver aquí
</button>

// Lógica de confirmación y callback
if (onNavigateToNode) {
    onNavigateToNode(selectedNode.id);
}
```

**Usuario:**
> Vamos a probar ahora a recibir y enviar cosas a la base de datos. Para esto vamos a hacer el panel de login/registro nada mas entrar a la app (correom contraseña y google oauth)

**Funcionalidad Implementada:**
*   **Autenticación**: Sistema completo de Login y Registro con Supabase.
*   **UI**: Nueva página `Login.jsx` con diseño Cyberpunk, animaciones y tabs para Login/Registro.
*   **Seguridad**: Componente `AuthGuard` para proteger rutas privadas (`/`, `/read/:id`). Redirección automática a `/login` si no hay sesión.

**Código Clave:**
`src/components/auth/AuthGuard.jsx`:
```javascript
// Protección de rutas
useEffect(() => {
    if (!loading && !session) {
        navigate('/login');
    }
}, [session, loading, navigate]);
```

`src/pages/Login.jsx`:
```javascript
// Integración con Supabase Auth (Email + Google)
const { error } = await supabase.auth.signUp({ email, password });
const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', ... });
```

`src/App.jsx`:
```javascript
// Rutas Protegidas
<Route path="/" element={<AuthGuard><MainMenu /></AuthGuard>} />
<Route path="/login" element={<Login />} />
```

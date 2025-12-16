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

**Usuario:**
> Quiero seguir mejorando la app Novela Grafica App


**Usuario:**
> Te voy a dar unas capturas... recoges el texto y lo pones como funcionalidades para la documentacion.

**Funcionalidades Definidas (Pendientes de Implementación):**

1.  **Motor Gráfico Híbrido (Accesibilidad y Rendimiento)**
    *   **Archivo Objetivo**: `src/components/VisualNovelCanvas.jsx`
    *   **Arquitectura de Capas**:
        *   **Capa Fondo (PixiJS)**: Renderizado de alto rendimiento para imágenes y filtros (B/N, Alto Contraste).
        *   **Capa Frontal (HTML/CSS)**: Renderizado de texto y UI para accesibilidad (lectores de pantalla) y estilos dinámicos (cambio de fuentes/colores al vuelo).
    *   **Features**:
        *   Modo "Lectura" (B/N) usando `PIXI.ColorMatrixFilter`.
        *   Escalado de imagen tipo "cover" (Responsive).
        *   Soporte para fuentes OpenDyslexic / alto contraste.

2.  **Lógica de Datos "Fetcher" (Optimización)**
    *   **Archivo Objetivo**: `src/services/StoryRepository.js`
    *   **Estrategia**: `getNodeById(nodeId)` que trae TODO (Imagen, Textos, Opciones) en una sola llamada a Supabase (JOINs de `story_nodes` + `dialogues` + `story_choices`).
    *   **Beneficio**: Carga instantánea de escenas.

3.  **Gestión de Estado Centralizada ("El Cerebro")**
    *   **Archivo Objetivo**: `src/engine/StoryEngine.js`
    *   **Hook**: `useStoryEngine(startNodeId)`.
4.  **Motor Narrativo de Decisiones (El Árbol)**
    *   **Archivo Objetivo**: `src/engine/StoryEngine.js`
    *   **Funcionalidad**:
        *   Bloqueo de scroll al llegar a decisiones.
        *   **Condiciones Invisibles**: Evalúa inventario (ej: "¿Tiene llave?") para mostrar/ocultar opciones.
        *   **Memoria**: Registra elecciones para consecuencias futuras.
    *   **Tecnología**: Grafos Dirigidos (Graph Traversal), Validación Lógica JS.

5.  **Sincronización Offline-First (Modo Avión)**
    *   **Funcionalidad**:
        *   Descarga de paquetes de capítulos + imágenes comprimidas.
        *   Lectura sin conexión usando caché local.
        *   Sincronización background de `user_progress` al recuperar red.
    *   **Tecnología**: IndexedDB (Dexie.js / TanStack Query), Service Workers (PWA).

6.  **UI Reactiva "Glassmorphism"**
    *   **Funcionalidad**:
        *   Menús flotantes semitransparentes (no tapan el arte).
        *   Animaciones suaves en inventarios/pausa.

**Detalle Técnico de Implementación (R&D Lead):**

1.  **Lógica del "Director de Escena" (Scene Orchestrator)**
    *   **Función**: Enrutador de recursos y gestión de transiciones.
    *   **Lógica**:
        *   Pre-loader: Predice y descarga la siguiente imagen.
        *   Fading: Transiciones suaves entre escenas.
    *   **Tecnología**: React `useEffect` para escuchar `node_id`.

2.  **Sistema de Capas de Accesibilidad (The Overlay System)**
    *   **Estrategia**: Independencia total entre Arte (Z-Index 0) y Texto (Z-Index 10).
    *   **Features**:
        *   Inyección de Estilos: `var(--font-dynamic)` para cambios instantáneos.
        *   Forzado de Accesibilidad: Ignora estilos "artísticos" si el usuario activa modos de accesibilidad.

3.  **Motor de Consecuencias (State Machine)**
    *   **Función**: Validación de condiciones complejas (Inventory check).
    *   **Tecnología**:
        *   **XState**: Para visualizar y gestionar estados de la historia.
        *   **JSON Logic**: Reglas guardadas en BD que el frontend ejecuta dinámicamente.

**Resumen de Arquitectura Final:**
*   **Frontend**: React + Tailwind + Framer Motion.
*   **Motor**: PixiJS (Canvas).
*   **Estado**: Zustand + XState.
*   **Offline**: IndexedDB (Dexie.js).
4.  **Lógica de Sincronización Híbrida (Offline-First)**
    *   **Estrategia**: Interceptación de peticiones de imagen.
    *   **Flujo**:
        1.  ¿Hay internet? -> Descarga de Supabase + Cachear.
        2.  ¿No hay internet? -> Servir desde caché del navegador (Service Workers).
        3.  Cola de Guardado: Si es offline, guarda decisiones en cola. Al volver online (`window.ononline`), sincroniza con nube.
    *   **Tecnologías**: Service Workers (PWA), TanStack Query / RxDB.

**Especificación Técnica: "Scene Orchestrator" (Ciclo de Vida)**
*   **Responsabilidad**: Gestionar carga de assets -> Renderizado -> Input -> Transición.
*   **Sub-módulos**:
    *   **A. Asset Resolver**: Mapea `node_id` a archivos locales/remotos. Fallback a placeholder elegante.
    *   **B. Accessibility Compositor**:
        *   Capa 0 (Fondo): Imagen (PixiJS) + Filtros.
        *   Capa 1 (Vignette): Gradiente negro para legibilidad.
        *   Capa 2 (Texto): HTML semántico inyectado con estilos dinámicos (Context).
    *   **C. Decision Engine**: Gestión de timing. Bloquea botones hasta terminar efecto "máquina de escribir".
*   **Estrategia Rendimiento ("Regla del +1")**: Pre-carga silenciosa de las imágenes de las opciones siguientes (Node B, Node C) mientras el usuario lee Node A. USAR `StoryRepository` REAL, no lógica comentada.

5.  **Capa de Descubrimiento (Main Menu / Discovery Layer)**
    *   **Concepto**: "Immersive Dark Glass" (Webtoon style).
    *   **Componente**: `src/pages/MainMenu.jsx`.
    *   **Layout**:
        *   **Hero Banner**: 60% alto, imagen destacada + degradado.
        *   **Grilla Series**: Tarjetas verticales (2:3) con efecto hover/zoom.
6.  **Mapa de Funcionalidades por Zona**
    *   **ZONA 1: LA BIBLIOTECA (Main Menu)**
        *   **Ruta**: `/` (Principal).
        *   **Componentes**:
            *   **Hero Banner**: Última serie jugada o "Featured".
            *   **Grid**: Fetch dinámico de `series` con animación Hover (1.05x).
            *   **Jump-In ("Continuar Leyendo")**: Fila superior exclusiva con barra de progreso visual.
            *   **Chips de Género**: Filtrado automático (Terror, Sci-Fi, Romance).
            *   **Buscador Instant search**: Desvanece (opacity 0.2) lo que no coincide.
        *   **Avatar**: Menú desplegable (Logout, Ajustes).

    *   **ZONA 2: EL LECTOR (StoryReader)**
        *   **Ruta**: `/read/:seriesId`.
        *   **Portadas**: Usar `series.cover_url` (assets locales).
        *   **Typewriter Effect**: Texto letra a letra, clic para saltar.
        *   **Pre-Carga Crítica**: Regla +1 activa.

    *   **ZONA 2: EL LECTOR (Mejoras Inmersión)**
        *   **Smart Resume**: Tarjeta ancha en Home con última viñeta + botón Play.
        *   **Touch Zones**: Izq(20%) Atrás | Centro(60%) UI Toggle | Der(20%) Avanzar.
        *   **Modo Cine**: Ocultar UI (Tap centro/Swipe down).
        *   **Backlog**: Historial de diálogos (últimos 10).
        *   **Feedback**: Haptic vibration (Shake) + Audio Crossfade.
        *   **Destiny Tree**: Mapa visual en menú pausa (Nodos visitados/bloqueados).
        *   **Transiciones**: Flash, Fade, Glitch (definidos en JSON).

    *   **ZONA 3: SISTEMA (Calidad de Vida)**
        *   **Multivisor (Sintonizador Visual)**: Panel Flotante Cyberpunk.
            *   Tipografía: Botones con preview real.
            *   Tamaño: Slider continuo con live-update.
            *   Temas: Original, Sepia, Terminal (Alto Contraste).
        *   **Galería Desbloqueable**: "Clean Art" (sin texto) al terminar capítulos.
        *   **Neural Map (Árbol del Destino)**:
            *   Metáfora: "Circuito Raíz" (Líneas neón, fondo dark).
            *   Nodos: Actual (Pulso), Visitado (Miniatura), Disponible (Punteado), Oculto (Candado).
            *   UX: Pan & Zoom, Centrado automático.
            *   **Feature Killer**: "Rebobinado" (Reset estado a nodo anterior).


**Usuario:**
> Quiero mirar funcionalidades, pero antes quiero que pruebes la app para ver si hay errores y me sigas arreglandolo.
> ... prueba la app con el navegador ...
> CREAME un usuario de prueba simple para el registro/login. Luego quiero hacer mas historias: Dragones y Mazmorras, Batman, y Rick y Morty.

**Funcionalidad Implementada:**
*   **Debugging & Stabilization Report**:
    *   **Neural Map (`DestinyTreeModal.jsx`)**: Se reemplazó el layout "Grid Mock" por un algoritmo **BFS Tree Real**. Ahora el grafo visualiza la jerarquía real de nodos.
    *   **Crash Prevention**: Añadidos null-checks defensivos en el renderizado de líneas del mapa.
    *   **Browser Verification**: Validada la navegación (Login -> Menu -> StoryReader -> Map) mediante bypass temporal de auth.

*   **Contenido & Datos (Seeding Expansion)**:
    *   **Script `src/scripts/seed.js`**: Actualizado para crear:
        1.  **Usuario Test**: `test@test.com` / `password123`.
        2.  **Historia 1**: *Dragones y Mazmorras: La Cripta* (Fantasía, Branching simple).
        3.  **Historia 2**: *Batman: Sombras de Gotham* (Misterio, Finales múltiples).
        4.  **Historia 3**: *Rick y Morty: Aventura de 20 Minutos* (Sci-Fi, Humor).
    *   **Migración SQL**: Generado `src/db/migrations/20251214_add_genre.sql` para añadir columna `genre` a la tabla `series`, permitiendo el filtrado en el menú principal.

**Código Clave:**
`src/scripts/seed.js` (Snippet de Creación de Historia):
```javascript
await createStory(
    'Batman: Sombras de Gotham', 
    'El Joker ha escondido una bomba...', 
    'Misterio',
    [
        { text: "La señal brilla...", speaker: "Batman", choices: [...] },
        // ...
    ]
);
```

**Estado Actual**:
*   Esperando ejecución manual de migración SQL en Supabase Dashboard por parte del usuario.
*   Seed script listo para repoblar con géneros correctos tras la migración.

**Usuario:**
> Luego los dialogos los quiero en las imagenes en bocadillos
> Luego los puntos son para el marketplace que te cambia el dise�o de la pagina entera y cambia lsas fuentes de texto
> luz verde

**Funcionalidad Implementada:**
*   **Marketplace & Personalizaci�n**: Puntos, Theme Manager, Tienda de Temas/Fuentes.
*   **Lector**: Bocadillos (Comic Bubbles), Click-to-Finish, Modo Cine.
*   **Mapa**: Drag & Pan, Path Highlighting.


**Usuario:**
> Ahora prueba la app. Para esto crea un usuario simple de prueba primero.

**Funcionalidad Implementada (Testing):**
*   **Creaci�n de Usuarios**: Se intent� usar seed.js y create_test_user.js.
*   **Resultados**:
    *   Validaci�n estricta de email en Supabase o reCAPTCHA bloquearon 'browser_test@example.com'.
    *   Se cre� exitosamente el script de creaci�n manual con 'roberto.dev.2025@gmail.com'.
*   **Verificaci�n Manual**:
    *   Se verific� la carga del Men� Principal y la l�gica de Fallback (Datos locales si falla la nube).
    *   Se verific� la navegaci�n a /marketplace y /login.


**Usuario:**
> si, usa nano banana. (Generaci�n de Assets Reimaginados)

**Funcionalidad Implementada (Assets):**
*   **Generaci�n de Im�genes**: Se utiliz� el modelo 'Nano Banana' (Engine de Imagen) para generar:
    *   Portada Batman: Gotham Noir Style.
    *   Portada D&D: Fantasy Crypt Battle.
    *   Portada Rick & Morty: Sci-Fi Portal Run.
*   **Despliegue**: Assets movidos a /public/assets/images/ reemplazando los placeholders.


**Usuario:**
> YA (Confirmaci�n de Assets/SQL y Ejecuci�n Final)

**Funcionalidad Implementada (JSON Engine):**
*   **Arquitectura H�brida**: Se refactoriz� el motor para soportar tanto Base de Datos (Supabase) como JSON Files locales.
*   **StoryLoader.js**: Nuevo servicio para parsear historias desde public/assets.
*   **Heur�stica de Assets**: Mapeo autom�tico de scene_id a archivos de imagen (Batman Scene 1 -> 1.jpg, Scene 2a -> A1.jpg).
*   **Historias Activadas**:
    *   Batman (Detective Noir)
    *   D&D (Fantas�a Cl�sica)
    *   Rick & Morty (Sci-Fi)
*   **Estado**: C�digo implementado y verificado est�ticamente. Login desbloqueado por usuario.



# LOG DE PROMPTS Y CAMBIOS

## PROMPT: "al desplegarlo en vercel, em sale el siguiente error" + correcciones de Vercel
- [FIX] **Vercel Deployment**: Configurado `package.json` raíz y `vercel.json` para soportar estructura monorepo/anidada.
- [FIX] **Vite Config**: Añadido `base: '/NovelaGraficaApp/'` para rutas relativas.

## PROMPT: "En el registro e inicio de sesion, no quiero que se use el correro... todo se esta guardando por supabase... pasar las tablas"
- [FEAT] **Username Auth**: Frontend de Login modificado para usar 'Nombre de Usuario' y generar emails internos (@novela.game -> @gmail.com).
- [FEAT] **Supabase Persistence**: Reescrito `userProgress.js` para eliminar LocalStorage. Ahora sincroniza el estado completo en tabla `user_game_state` y puntos en `profiles`.
- [DB] **Full Schema Script**: Generado `src/db/init_full_db.sql` con tablas robustas (profiles, user_game_state, user_library, series, chapters).
- [DB] **Fix Auth**: Identificado problema de "Proyecto Incorrecto vs Proyecto Real".
    - Solución Frontend: Uso de `@gmail.com` para evitar filtros.
    - Solución Backend: Scripts de emergencia `emergency_fix_auth.sql` para triggers resilientes.

## PROMPT: "Quiero habilitar en las reseñas que otra gente registrada pueda puntuar... y responder a estos comentarios"
- [FEAT] **Sistema de Reseñas**: Creadas tablas `reviews` y `review_comments` en Supabase.
- [FEAT] **Star Rating**: Componente `StarRating.jsx` que permite puntuación de media estrella (0.5 - 5.0) con input visual.
- [DB] **Review Schema**: Generado `src/db/reviews_schema.sql` (Ejecutar en el proyecto correcto).

## PROMPT: "Refinar ventana de personalización... separar ajustes de perfil... subir avatar local"
- [UI] **SettingsView**: Implementada página dedicada `/settings` para gestión de perfil (Username, Avatar URL/Local).
- [FEAT] **Avatar Upload**: Integración con Supabase Storage (bucket `avatars`) en `SettingsView`.
- [REFACTOR] **SettingsModal**: Simplificado a solo ajustes visuales (Temas, Fuentes), eliminando pestañas y lógica de perfil.
- [FIX] **Crash Loop**: Solucionado bucle infinito de re-renderizado en SettingsModal al abrirse.

## PROMPT: "Continuar como invitado... arreglar upload avatars que falla..."
- [FEAT] **Guest Access**: Implementado modo "Solo Lectura" (sin login). Botón en Login y `AuthGuard` adaptado.
- [FIX] **Storage RLS**: Script `fix_avatars_bucket.sql` para permitir subidas (Authenticated) y lectura pública (Avatar Gallery).

## PROMPT: "para subir una imagen, tambien se nos tiene que dar la opcion de seleccionarlo del marketplace"
- [FEAT] **Avatar Gallery**: Creado componente `AvatarGalleryModal` integrado en `SettingsView`.
- [FEAT] **Store Update**: Añadido soporte para `avatars` en `userProgress.purchases`.

## PROMPT: "estos avatares los debe cargar del bucket de supabase, que estan dentro de la carpeta common"
- [FEAT] **Common Assets**: Galería ahora carga dinámicamente archivos de `avatars/common/*`.

## PROMPT: "para estos perfiles, tambien hay que gastar gemas de manera aleatoria, pero menor a 50"
- [LOGIC] **Deterministic Pricing**: Implementado precio aleatorio (5-49 gemas) basado en hash del nombre de archivo.

## PROMPT: "me gustaria que saliera la imagen actual y el cambio aplicado... quitar gris del menu principal"
- [UI] **Settings Preview**: Añadida previsualización de imagen redonda en Ajustes.
- [UI] **MainMenu Avatar**: Reemplazado placeholder estático por el avatar real del usuario (o default).

## PROMPT: "cambiar titulo por Biblioteca del Frikismo... centrado... animacion gameboy color intro"
- [UI] **GBC Intro**: Cabecera animada con estilos "GAME BOY" (Italic Black) y "COLOR" (Rainbow Drop).


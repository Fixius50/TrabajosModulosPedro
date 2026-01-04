
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
- [UI] **ReviewsSection**: Integrado en `StoryDetails`.
- [DB] **Review Schema**: Generado `src/db/reviews_schema.sql` (Ejecutar en el proyecto correcto).

-- 🔧 FIX ORPHANED USERS & CONFIRM EMAILS
-- Ejecuta esto en Supabase SQL Editor para arreglar cuentas rotas o no confirmadas.

-- 1. Auto-confirmar correos electrónicos (Para que no pida verificar email)
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- 2. Crear Perfiles faltantes (Sync Auth -> Public)
INSERT INTO public.profiles (id, username, avatar_url, points)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)), 
    '', 
    500
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 3. Crear Estado de Juego faltante
INSERT INTO public.user_game_state (user_id, state_data)
SELECT 
    id, 
    '{"points": 500, "activeTheme": "default"}'::jsonb
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_game_state);

-- 4. Crear Biblioteca vacía (opcional, por si acaso)
-- No es necesario insertar nada, la tabla puede estar vacía.

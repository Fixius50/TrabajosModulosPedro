-- INSTRUCCIONES:
-- Copia y pega este código en el "SQL Editor" de tu panel de Supabase para confirmar manualmente a los usuarios.

-- 1. Confirmar usuario 'roberto.dev.2025@gmail.com'
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'roberto.dev.2025@gmail.com';

-- 2. Confirmar usuario 'prueba@prueba.com'
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'prueba@prueba.com';

-- 🚨 RESET COMPLETE & SEED DATA (Novela Gráfica App)
-- EJECUTA ESTO EN EL SQL EDITOR DE SUPABASE PARA REINICIAR Y CARGAR TODO

-- =====================================================================================
-- 1. LIMPIEZA DRÁSTICA (SCHEMA DROP)
-- =====================================================================================
-- Esto asegura que no queden restos de tablas viejas o conflictos.
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- IMPORTANTE: Dar permisos por defecto a tablas futuras y existentes
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

-- Permisos específicos para tablas que ya se creen abajo (aunque el default debería cubrirlo, esto asegura)
-- Se aplicarán al final, pero lo ponemos aquí para contexto o usamos un bloque al final.

-- =====================================================================================
-- 2. RECREACIÓN DE TABLAS (SCHEMA V3 - FINAL)
-- =====================================================================================

-- 👤 PERFILES
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username text UNIQUE,
  avatar_url text,
  points int DEFAULT 500,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 🎮 ESTADO DE JUEGO
CREATE TABLE public.user_game_state (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  state_data jsonb DEFAULT '{"points": 500, "activeTheme": "default"}'::jsonb,
  last_updated timestamp with time zone DEFAULT now()
);

-- 📚 BIBLIOTECA
CREATE TABLE public.user_library (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  item_type text NOT NULL, -- 'theme', 'series'
  item_id text NOT NULL,
  acquired_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

-- 📖 SERIES (Cómics)
CREATE TABLE public.series (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  cover_url text,
  price int DEFAULT 0,
  is_premium boolean DEFAULT false,
  status text DEFAULT 'active', -- 'active', 'coming_soon'
  reading_time text, -- New column
  genre text, -- New column
  created_at timestamp with time zone DEFAULT now()
);

-- 📑 CAPÍTULOS (O Páginas del Cómic)
-- Simplificado: Cada serie tiene una lista de imágenes (páginas) en JSON o una tabla relacionada.
-- Para esta app, usaremos una tabla de capítulos/páginas para ser más robustos.
CREATE TABLE public.chapters (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    series_id uuid REFERENCES public.series(id) ON DELETE CASCADE NOT NULL,
    title text DEFAULT 'Chapter 1',
    pages jsonb NOT NULL, -- Array de URLs de imágenes: ["url1", "url2"]
    order_index int DEFAULT 1,
    created_at timestamp with time zone DEFAULT now()
);

-- 🧩 NODOS DE HISTORIA (Interactivo)
CREATE TABLE public.story_nodes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    chapter_id uuid REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
    image_url text,
    fx_config jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 🗣️ DIÁLOGOS
CREATE TABLE public.dialogues (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    node_id uuid REFERENCES public.story_nodes(id) ON DELETE CASCADE NOT NULL,
    speaker_name text,
    content text,
    style_override jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 🔀 OPCIONES / TRANSICIONES
CREATE TABLE public.story_choices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    from_node_id uuid REFERENCES public.story_nodes(id) ON DELETE CASCADE NOT NULL,
    to_node_id uuid REFERENCES public.story_nodes(id) ON DELETE SET NULL, -- Puede ser null si termina
    label text NOT NULL,
    condition_logic jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 🛍️ TIENDA (Themes & Items)
CREATE TABLE public.shop_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL, -- 'theme', 'font'
  asset_value text NOT NULL UNIQUE,
  display_name text NOT NULL,
  price int DEFAULT 0, -- ¡AQUÍ ESTÁ LA COLUMNA PRICE!
  description text,
  style_config jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- ⭐ RESEÑAS
CREATE TABLE public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id uuid REFERENCES public.series(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  rating numeric(3,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  content text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(series_id, user_id)
);

-- 💬 COMENTARIOS
CREATE TABLE public.review_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES public.review_comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =====================================================================================
-- 3. SEGURIDAD (RLS)
-- =====================================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dialogues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;

-- Lectura Pública
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Series" ON public.series FOR SELECT USING (true);
CREATE POLICY "Public Read Chapters" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Public Read Nodes" ON public.story_nodes FOR SELECT USING (true);
CREATE POLICY "Public Read Dialogues" ON public.dialogues FOR SELECT USING (true);
CREATE POLICY "Public Read Choices" ON public.story_choices FOR SELECT USING (true);
CREATE POLICY "Public Read Shop" ON public.shop_items FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Read Comments" ON public.review_comments FOR SELECT USING (true);

-- Escritura Usuarios
CREATE POLICY "User Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "User Insert Own Profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "User CRUD Game State" ON public.user_game_state FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "User View Own Library" ON public.user_library FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User Insert Own Library" ON public.user_library FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User Create Review" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User Delete Own Review" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "User Create Comment" ON public.review_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User Delete Own Comment" ON public.review_comments FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================================
-- 4. FUNCTIONES & TRIGGERS
-- =====================================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, username, avatar_url, points)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), '', 500);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    INSERT INTO public.user_game_state (user_id, state_data)
    VALUES (new.id, '{"points": 500, "activeTheme": "default"}'::jsonb);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================================================================================
-- 5. SEED DATA (CONTENIDO INICIAL)
-- =====================================================================================

-- 🎨 TEMAS (Shop Items)
INSERT INTO public.shop_items (type, asset_value, display_name, price, description, style_config) VALUES
('theme', 'neon', 'Tema Neón', 500, 'Estilo cyberpunk con brillos neón.', '{"bg": "#1a0b2e", "accent": "#d946ef", "font": "Orbitron", "cardBorder": "2px solid #d946ef"}'),
('theme', 'comic', 'Tema Cómic', 300, 'Estilo cómic clásico con bordes negros.', '{"bg": "#ffffff", "accent": "#facc15", "font": "Bangers", "cardBorder": "4px solid black"}'),
('theme', 'manga', 'Tema Manga', 500, 'Blanco y negro con tramas.', '{"bg": "#ffffff", "accent": "#000000", "font": "Bangers", "cardBorder": "3px solid black"}'),
('theme', 'inverse', 'Modo Inverso', 0, 'Interfaz clara y accesible.', '{"bg": "#f0f0f0", "accent": "#333333", "font": "Inter", "cardBorder": "1px solid #ccc"}');


-- 📚 SERIES (Basado en tus buckets)
-- Nota: La URL base de almacenamiento debe ser correcta. Asumimos el estándar de Supabase.
-- Reemplaza 'PROJECT_ID' si tu URL es diferente, pero normalmente es relativa o construida en el front.
-- Aquí usaremos rutas relativas que el frontend deberá resolver o URLs absolutas de ejemplo.

INSERT INTO public.series (id, title, description, cover_url, price, is_premium, reading_time, genre) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dungeons & Dragons', 'Aventuras en los Reinos Olvidados.', 'https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/DnD/1.jpg', 0, false, '45m', 'Fantasía'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Batman', 'El Caballero Oscuro regresa.', 'https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/Batman/1.jpg', 100, true, '30m', 'Superhéroes'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Rick and Morty', 'Ciencia loca y viajes interdimensionales.', 'https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/RickAndMorty/A1.jpg', 0, false, '20m', 'Ciencia Ficción'),
-- BoBoBo
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'BoBoBo', 'Absurdo y batallas de pelo nasal.', 'https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/BoBoBo/1.jpg', 50, false, '15m', 'Humor'),

-- Neon Rain
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Neon Rain', 'Thriller Cyberpunk Hiperrealista.', '/assets/NeonRain/cover.jpg', 0, false, '25m', 'Cyberpunk');


-- 📑 CAPÍTULOS (Links a imágenes en Storage)
INSERT INTO public.chapters (series_id, title, order_index, pages) VALUES
-- DnD
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Inicio de la Campaña', 1, '[
  "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/DnD/1.jpg",
  "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/DnD/2.jpg",
  "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/DnD/3.jpg"
]'::jsonb),

-- Batman
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Shadows of Gotham', 1, '[
  "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/Batman/1.jpg",
  "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/Batman/2.jpg"
]'::jsonb),

-- Rick & Morty
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Multiverse Madness', 1, '[
  "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/RickAndMorty/A1.jpg",
  "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/RickAndMorty/A2.jpg",
  "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/RickAndMorty/B1.jpg",
  "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/RickAndMorty/B2.jpg"
]'::jsonb),

-- BoBoBo
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Fist of the Nose Hair', 1, '[
  "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/BoBoBo/1.jpg",
  "https://itvwrrsaigfejbooewjb.supabase.co/storage/v1/object/public/comics/BoBoBo/2.jpg"
]'::jsonb),

-- Neon Rain
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Protocolo Fantasma', 1, '[
  "/assets/NeonRain/1.jpg",
  "/assets/NeonRain/2.jpg"
]'::jsonb);

-- =====================================================================================
-- 6. PERMISOS FINALES (CRÍTICO PARA EVITAR 403)
-- =====================================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;


-- =====================================================================================
-- 6. PERMISOS FINALES (CRÍTICO PARA EVITAR 403)
-- =====================================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;



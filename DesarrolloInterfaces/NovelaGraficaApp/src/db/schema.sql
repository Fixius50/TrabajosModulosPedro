-- 1. PERFILES DE USUARIO (UX y Accesibilidad)
-- Aquí guardamos si el usuario prefiere "Alto Contraste", tamaño de fuente, etc.
create table profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  preferences jsonb default '{"theme": "system", "font_scale": 1.0, "high_contrast": false}'::jsonb,
  updated_at timestamp with time zone
);

-- 2. SERIES (El Cómic en general)
create table series (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  cover_url text,
  created_at timestamp with time zone default now()
);

-- 3. CAPÍTULOS
create table chapters (
  id uuid default gen_random_uuid() primary key,
  series_id uuid references series(id) not null,
  order_index int not null, -- Para ordenar cap 1, 2, 3...
  title text not null,
  is_published boolean default false
);

-- 4. NODOS DE HISTORIA (El corazón del motor)
-- Un nodo = Una pantalla/viñeta específica
create table story_nodes (
  id uuid default gen_random_uuid() primary key,
  chapter_id uuid references chapters(id) not null,
  image_url text not null, -- La imagen LIMPIA (sin texto)
  type text default 'panel', -- 'panel', 'video', 'interactive'
  fx_config jsonb, -- Ej: { "shake": true, "filter": "sepia" }
  created_at timestamp with time zone default now()
);

-- 5. DIÁLOGOS (Texto flotante)
-- Se renderizarán SOBRE la imagen usando coordenadas % (0-100)
create table dialogues (
  id uuid default gen_random_uuid() primary key,
  node_id uuid references story_nodes(id) on delete cascade not null,
  speaker_name text, -- Quién habla
  content text not null, -- El texto en sí
  position_x float not null, -- Coordenada X (0.0 a 1.0)
  position_y float not null, -- Coordenada Y (0.0 a 1.0)
  style_override jsonb -- Para estilos especiales (gritos, susurros)
);

-- 6. DECISIONES (RAMAS)
-- Conecta un nodo con el siguiente
create table story_choices (
  id uuid default gen_random_uuid() primary key,
  from_node_id uuid references story_nodes(id) on delete cascade not null,
  to_node_id uuid references story_nodes(id) on delete cascade not null,
  label text not null, -- Lo que lee el usuario: "Abrir la puerta izquierda"
  condition_logic jsonb -- Opcional: Requisitos (ej: tener llave)
);

-- 7. PROGRESO DEL USUARIO (Save Data)
create table user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  chapter_id uuid references chapters(id) not null,
  current_node_id uuid references story_nodes(id) not null,
  history jsonb default '[]'::jsonb, -- Historial de decisiones tomadas
  updated_at timestamp with time zone default now(),
  unique(user_id, chapter_id) -- Solo un guardado por capítulo por usuario
);

-- Habilitar seguridad (RLS)
alter table profiles enable row level security;
alter table user_progress enable row level security;

-- Política simple: El usuario solo ve/edita su propio perfil y progreso
create policy "Users can own profile" on profiles for all using (auth.uid() = id);
create policy "Users can own progress" on user_progress for all using (auth.uid() = user_id);

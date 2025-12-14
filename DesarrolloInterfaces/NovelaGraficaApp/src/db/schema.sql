-- 1. PERFILES DE USUARIO (UX y Accesibilidad)
-- Aquí guardamos si el usuario prefiere "Alto Contraste", tamaño de fuente, etc.
create table profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  preferences jsonb default '{"theme": "system", "font_scale": 1.0, "high_contrast": false}'::jsonb,
  points int default 50,
  updated_at timestamp with time zone
);

-- 2. SERIES (El Cómic en general)
create table series (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  cover_url text,
  price int default 0,
  is_premium boolean default false,
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

-- ... (Existing Tables 4-6: story_nodes, dialogues, story_choices) ...

-- 8. BIBLIOTECA DEL USUARIO (Compras)
create table user_library (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  series_id uuid references series(id) not null,
  acquired_at timestamp with time zone default now(),
  unique(user_id, series_id)
);

-- Habilitar seguridad (RLS)
alter table profiles enable row level security;
alter table user_progress enable row level security;
alter table user_library enable row level security;

-- Política simple: El usuario solo ve/edita su propio perfil y progreso
create policy "Users can own profile" on profiles for all using (auth.uid() = id);
create policy "Users can own progress" on user_progress for all using (auth.uid() = user_id);
create policy "Users can view own library" on user_library for all using (auth.uid() = user_id);


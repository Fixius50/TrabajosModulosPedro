-- schema.sql: Tablas para ServerMonitorApp

-- 1. Tabla de Contenedores (sm_containers)
-- Estado actual de cada contenedor
create table if not exists sm_containers (
  id text primary key,
  name text not null,
  image text not null,
  state text not null, -- 'running', 'exited'
  status text, -- 'Up 2 hours'
  cpu_usage float default 0, -- % de uso del contenedor
  memory_usage float default 0, -- % de uso del contenedor
  last_updated timestamptz default now()
);

-- 2. Tabla de Métricas del Host (sm_metrics) - NUEVA
-- Histórico de consumo del servidor (Backend VM)
create table if not exists sm_metrics (
  id uuid default gen_random_uuid() primary key,
  hostname text,
  cpu_usage text, -- Guardado como texto para flexibilidad o float si prefieres
  ram_usage text,
  memory_usage text, -- Redundante con ram_usage, pero lo mantenemos por compatibilidad con tu imagen
  created_at timestamptz default now()
);

-- 3. Tabla de Comandos (sm_commands)
-- Cola de ejecución remota
create table if not exists sm_commands (
  id uuid default gen_random_uuid() primary key,
  target_container_id text,
  command text not null,
  status text default 'pending',
  result text,
  created_at timestamptz default now(),
  executed_at timestamptz
);

-- 4. Publicaciones Realtime
alter publication supabase_realtime add table sm_containers;
alter publication supabase_realtime add table sm_commands;
alter publication supabase_realtime add table sm_metrics; -- Opcional: Si quieres gráficas en vivo

-- 5. Políticas de Seguridad (RLS)
alter table sm_containers enable row level security;
alter table sm_metrics enable row level security;
alter table sm_commands enable row level security;

-- Políticas permisivas para desarrollo en red local
create policy "Allow all access" on sm_containers for all using (true);
create policy "Allow all access" on sm_metrics for all using (true);
create policy "Allow all access" on sm_commands for all using (true);

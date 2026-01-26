-- schema.sql: Tablas para ServerMonitorApp
-- Ejecuta esto en el SQL Editor de Supabase (http://<TU-IP>:54323)

-- 1. Tabla de Contenedores (sm_containers)
-- Estado actual de cada contenedor Docker
create table if not exists sm_containers (
  id text primary key,
  name text not null,
  image text not null,
  state text not null, -- 'running', 'exited'
  status text, -- 'Up 2 hours'
  cpu_usage float default 0, -- % de uso del contenedor
  last_updated timestamptz default now()
);

-- 2. Tabla de Métricas del Host (sm_metrics)
-- Histórico de consumo del servidor (Backend VM)
create table if not exists sm_metrics (
  id uuid default gen_random_uuid() primary key,
  cpu_usage float, -- Ej: 45.5
  ram_usage float, -- Ej: 60.1
  memory_usage text, -- Ej: "9.6 GB / 16 GB"
  disk_usage_gb text, -- Ej: "450 GB / 980 GB" (Crucial para el gráfico de disco)
  net_rx_mb float, -- Mbps Bajada
  net_tx_mb float, -- Mbps Subida
  uptime text, -- Ej: "15 days"
  created_at timestamptz default now()
);

-- 3. Tabla de Comandos (sm_commands)
-- Cola de ejecución remota (Frontend -> DB -> Agente)
create table if not exists sm_commands (
  id uuid default gen_random_uuid() primary key,
  target_container_id text, -- ID del contenedor o NULL para comandos de host
  command text not null, -- 'start', 'stop', 'restart'
  status text default 'pending', -- 'pending', 'executed', 'failed'
  result text, -- Output del comando
  created_at timestamptz default now(),
  executed_at timestamptz
);

-- 4. Publicaciones Realtime (Para que el Dashboard se mueva solo)
-- Eliminamos publicación previa por si acaso y la recreamos
drop publication if exists supabase_realtime;
create publication supabase_realtime for table sm_containers, sm_metrics, sm_commands;

-- 5. Políticas de Seguridad (RLS) - Permisivas para LAN
alter table sm_containers enable row level security;
alter table sm_metrics enable row level security;
alter table sm_commands enable row level security;

create policy "LAN Access Containers" on sm_containers for all using (true);
create policy "LAN Access Metrics" on sm_metrics for all using (true);
create policy "LAN Access Commands" on sm_commands for all using (true);

-- Limpieza automática (Opcional): Mantener solo las últimas 10k métricas
-- (Requiere extensión pg_cron o un trigger manual, omitido por simplicidad inicial)

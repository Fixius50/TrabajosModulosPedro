-- ==============================================================================
-- SCHEMA V2: CONSOLIDATED & IDEMPOTENT
-- Include: Base Tables, Rewards, Marketplace, Storage Fixes, Cleanup
-- ==============================================================================

-- 1. BASE TABLES (From schema.sql)
-- ==========================

-- Profiles
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  preferences jsonb default '{"theme": "system", "font_scale": 1.0, "high_contrast": false}'::jsonb,
  points int default 50,
  updated_at timestamp with time zone
);

-- Series
create table if not exists series (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  cover_url text,
  price int default 0,
  is_premium boolean default false,
  created_at timestamp with time zone default now()
);

-- Chapters
create table if not exists chapters (
  id uuid default gen_random_uuid() primary key,
  series_id uuid references series(id) not null,
  order_index int not null,
  title text not null,
  is_published boolean default false
);

-- User Library
create table if not exists user_library (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  series_id uuid references series(id) not null,
  acquired_at timestamp with time zone default now(),
  unique(user_id, series_id)
);

-- Note: 'story_nodes', 'dialogues', 'story_choices' are assumed to exist. 
-- Schema.sql contained a placeholder comment for them.

-- 2. REWARDS & MARKETPLACE (From rewards_and_shop.sql)
-- ==========================

-- User Routes (Endings)
create table if not exists user_routes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  series_id uuid references series(id) not null,
  ending_node_id text not null,
  achieved_at timestamp with time zone default now(),
  unique(user_id, series_id, ending_node_id)
);

-- Shop Items
create table if not exists shop_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  type text not null check (type in ('font', 'theme', 'avatar', 'sticker')),
  cost int not null default 100,
  asset_value text not null,
  preview_url text,
  is_active boolean default true
);

-- User Unlocks (Inventory)
create table if not exists user_unlocks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  item_id uuid references shop_items(id) not null,
  unlocked_at timestamp with time zone default now(),
  unique(user_id, item_id)
);

-- 3. ROW LEVEL SECURITY (Policies)
-- ==========================
-- Enable RLS (Idempotent basically)
alter table profiles enable row level security;
alter table user_library enable row level security;
alter table user_routes enable row level security;
alter table shop_items enable row level security;
alter table user_unlocks enable row level security;

-- Helper to safely drop policies
do $$ 
begin
    -- Profiles
    drop policy if exists "Users can own profile" on profiles;
    
    -- Library
    drop policy if exists "Users can view own library" on user_library;

    -- Routes
    drop policy if exists "Users can view own routes" on user_routes;
    drop policy if exists "Users can insert own routes" on user_routes;

    -- Shop
    drop policy if exists "Anyone can view active shop items" on shop_items;

    -- Unlocks
    drop policy if exists "Users can view own unveils" on user_unlocks;
    drop policy if exists "Users can insert own unveils" on user_unlocks;
end $$;

-- Create Policies
create policy "Users can own profile" on profiles for all using (auth.uid() = id);
create policy "Users can view own library" on user_library for all using (auth.uid() = user_id);

create policy "Users can view own routes" on user_routes for select using (auth.uid() = user_id);
create policy "Users can insert own routes" on user_routes for insert with check (auth.uid() = user_id);

create policy "Anyone can view active shop items" on shop_items for select using (is_active = true);

create policy "Users can view own unveils" on user_unlocks for select using (auth.uid() = user_id);
create policy "Users can insert own unveils" on user_unlocks for insert with check (auth.uid() = user_id);

-- 4. FUNCTIONS (Stored Procedures)
-- ==========================

create or replace function award_points(amount int)
returns void as $$
begin
  update profiles
  set points = points + amount
  where id = auth.uid();
end;
$$ language plpgsql security definer;

create or replace function buy_shop_item(item_uuid uuid)
returns jsonb as $$
declare
  item_cost int;
  user_points int;
begin
  select cost into item_cost from shop_items where id = item_uuid;
  select points into user_points from profiles where id = auth.uid();
  
  if item_cost is null then
    return '{"success": false, "message": "Item not found"}'::jsonb;
  end if;
  
  if user_points < item_cost then
    return '{"success": false, "message": "Not enough points"}'::jsonb;
  end if;
  
  update profiles set points = points - item_cost where id = auth.uid();
  insert into user_unlocks (user_id, item_id) values (auth.uid(), item_uuid);
  
  return '{"success": true, "message": "Purchase successful"}'::jsonb;
  
exception when unique_violation then
  return '{"success": false, "message": "Item already owned"}'::jsonb;
end;
$$ language plpgsql security definer;

-- 5. STORAGE CONFIGURATION (Fix RLS)
-- ==========================
insert into storage.buckets (id, name, public)
values ('novel-assets', 'novel-assets', true)
on conflict (id) do nothing;

do $$
begin
    drop policy if exists "Public Access" on storage.objects;
    drop policy if exists "Allow Uploads" on storage.objects;
    drop policy if exists "Allow Updates" on storage.objects;
end $$;

create policy "Public Access" on storage.objects for select using ( bucket_id = 'novel-assets' );
create policy "Allow Uploads" on storage.objects for insert with check ( bucket_id = 'novel-assets' );
create policy "Allow Updates" on storage.objects for update using ( bucket_id = 'novel-assets' );

-- 6. DATA CLEANUP (Remove Demos)
-- ==========================
do $$
begin
    -- 1. Borrar items de biblioteca
    delete from user_library
    where series_id in (select id from series where title ilike '%Demo%');

    -- 2. Borrar capítulos
    delete from chapters
    where series_id in (select id from series where title ilike '%Demo%');

    -- 3. Borrar la serie
    delete from series
    where title ilike '%Demo%';
end $$;

-- FIN DE SCHEMA V2

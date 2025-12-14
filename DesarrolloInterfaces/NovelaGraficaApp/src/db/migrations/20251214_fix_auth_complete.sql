-- MASTER MIGRATION: Fix Auth, Schema & RLS
-- Run this in Supabase Dashboard > SQL Editor to restore full functionality

-- ==============================================================================
-- 1. TABLES (Safe Creation)
-- ==============================================================================

-- PROFILES
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text unique,
  full_name text,
  avatar_url text,
  preferences jsonb default '{"theme": "system", "font_scale": 1.0, "high_contrast": false}'::jsonb,
  updated_at timestamp with time zone default now()
);

-- SERIES
create table if not exists series (
  id uuid default gen_random_uuid() primary key,
  title text not null default 'Untitled Series',
  description text,
  genre text default 'General',
  cover_url text,
  created_at timestamp with time zone default now()
);

-- CHAPTERS
create table if not exists chapters (
  id uuid default gen_random_uuid() primary key,
  series_id uuid references series(id),
  order_index int not null default 1,
  title text not null default 'New Chapter',
  is_published boolean default false
);

-- NODES
create table if not exists story_nodes (
  id uuid default gen_random_uuid() primary key,
  chapter_id uuid references chapters(id),
  image_url text,
  type text default 'panel',
  fx_config jsonb,
  created_at timestamp with time zone default now()
);

-- DIALOGUES
create table if not exists dialogues (
  id uuid default gen_random_uuid() primary key,
  node_id uuid references story_nodes(id) on delete cascade,
  speaker_name text,
  content text,
  position_x float default 50.0,
  position_y float default 90.0,
  style_override jsonb
);

-- CHOICES
create table if not exists story_choices (
  id uuid default gen_random_uuid() primary key,
  from_node_id uuid references story_nodes(id) on delete cascade,
  to_node_id uuid references story_nodes(id) on delete cascade,
  label text,
  condition_logic jsonb
);

-- USER PROGRESS
create table if not exists user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  chapter_id uuid references chapters(id),
  current_node_id uuid references story_nodes(id),
  history jsonb default '[]'::jsonb,
  updated_at timestamp with time zone default now()
);
-- Ensure uniqueness safely
do $$ 
begin
  if not exists (select 1 from pg_constraint where conname = 'user_chapter_unique') then
    alter table user_progress add constraint user_chapter_unique unique(user_id, chapter_id);
  end if;
end $$;


-- ==============================================================================
-- 2. SECURITY (RLS & Policies)
-- ==============================================================================

-- Enable RLS
alter table profiles enable row level security;
alter table series enable row level security;
alter table chapters enable row level security;
alter table story_nodes enable row level security;
alter table dialogues enable row level security;
alter table story_choices enable row level security;
alter table user_progress enable row level security;

-- Drop old policies to avoid conflicts
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Public can view series" on series;
drop policy if exists "Users can own progress" on user_progress;

-- Create Policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can own progress" on user_progress for all using (auth.uid() = user_id);

-- Public Read Access for Story Content
create policy "Public can view series" on series for select to authenticated, anon using (true);
create policy "Public can view chapters" on chapters for select to authenticated, anon using (true);
create policy "Public can view nodes" on story_nodes for select to authenticated, anon using (true);
create policy "Public can view dialogues" on dialogues for select to authenticated, anon using (true);
create policy "Public can view choices" on story_choices for select to authenticated, anon using (true);


-- ==============================================================================
-- 3. AUTOMATION (Triggers)
-- ==============================================================================

-- Trigger: Auto-create Profile on Sign Up
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

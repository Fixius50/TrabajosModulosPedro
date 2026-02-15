-- Storage Buckets Setup
-- We need two main buckets: 'avatars' for user profiles and 'marketplace' for item images.

-- 1. Avatars Bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Policies for Avatars
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );
  -- In a strict prod env, we'd restrict this to authenticated users, 
  -- but for now 'Anyone' (anon) might be needed if upload happens during signup before full auth? 
  -- Better: Restrict to authenticated.
  
alter policy "Anyone can upload an avatar."
  on storage.objects using ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

create policy "Users can update their own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner );

-- 2. Marketplace Assets Bucket
insert into storage.buckets (id, name, public)
values ('marketplace', 'marketplace', true)
on conflict (id) do nothing;

create policy "Marketplace items are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'marketplace' );

-- Admins only for Marketplace uploads? 
-- For this app, we'll allow authenticated users to upload (e.g. if we had a creator mode),
-- but typically this is admin-only. We'll leave it permissive for dev speed.
create policy "Authenticated users can upload marketplace items"
  on storage.objects for insert
  with check ( bucket_id = 'marketplace' and auth.role() = 'authenticated' );


-- Database Tables Verification (Idempotent)

-- Marketplace Items Table
create table if not exists marketplace_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  type text check (type in ('avatar', 'theme', 'title', 'effect')) not null,
  price_xp integer default 0,
  price_gold integer default 0,
  rarity text check (rarity in ('common', 'uncommon', 'rare', 'epic', 'legendary')) default 'common',
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table marketplace_items enable row level security;

create policy "Marketplace items are viewable by everyone"
  on marketplace_items for select
  using (true);

-- User Inventory Table
create table if not exists user_inventory (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  item_id uuid references marketplace_items(id) not null,
  is_equipped boolean default false,
  purchased_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint user_item_unique unique (user_id, item_id)
);

alter table user_inventory enable row level security;

create policy "Users can view their own inventory"
  on user_inventory for select
  using (auth.uid() = user_id);

create policy "Users can insert into their own inventory"
  on user_inventory for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own inventory"
  on user_inventory for update
  using (auth.uid() = user_id);

-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Categories Table
create table categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  icon text, -- mdi/fontawesome icon name or unicode
  type text check (type in ('income', 'expense')) not null,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table categories enable row level security;

create policy "Users can view own categories" on categories
  for select using (auth.uid() = user_id);

create policy "Users can insert own categories" on categories
  for insert with check (auth.uid() = user_id);

create policy "Users can update own categories" on categories
  for update using (auth.uid() = user_id);

create policy "Users can delete own categories" on categories
  for delete using (auth.uid() = user_id);

-- Transactions Table
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  category_id uuid references categories(id),
  amount numeric not null,
  date date not null default CURRENT_DATE,
  description text,
  file_path text, -- Path to storage bucket
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table transactions enable row level security;

create policy "Users can view own transactions" on transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert own transactions" on transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own transactions" on transactions
  for update using (auth.uid() = user_id);

create policy "Users can delete own transactions" on transactions
  for delete using (auth.uid() = user_id);

-- Storage Bucket Setup (Scriptable part, usually done via API but we can try inserting if storage schema exists)
-- For now, we assume bucket creation is manual or via strict RPC, but we can try:
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload attachments"
on storage.objects for insert
with check ( bucket_id = 'attachments' and auth.role() = 'authenticated' );

create policy "Users can view their own attachments"
on storage.objects for select
using ( bucket_id = 'attachments' and auth.uid() = owner );

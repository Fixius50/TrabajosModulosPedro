-- Create budgets table if it doesn't exist
create table if not exists budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  category text not null,
  amount numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, category)
);

-- Enable RLS (safe to run multiple times)
alter table budgets enable row level security;

-- Drop existing policies to avoid errors when re-running
drop policy if exists "Users can view their own budgets" on budgets;
drop policy if exists "Users can insert their own budgets" on budgets;
drop policy if exists "Users can update their own budgets" on budgets;
drop policy if exists "Users can delete their own budgets" on budgets;

-- Create policies
create policy "Users can view their own budgets"
  on budgets for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own budgets"
  on budgets for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own budgets"
  on budgets for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own budgets"
  on budgets for delete
  using ( auth.uid() = user_id );
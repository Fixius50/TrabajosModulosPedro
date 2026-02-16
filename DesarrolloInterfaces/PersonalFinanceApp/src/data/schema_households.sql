-- Create Households Table
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency text default 'EUR',
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Households
alter table public.households enable row level security;

-- Create Household Members Table
create table public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text check (role in ('admin', 'member')) default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(household_id, user_id)
);

-- Enable RLS for Members
alter table public.household_members enable row level security;

-- Create Shared Accounts Table
create table public.shared_accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade not null,
  name text not null,
  balance numeric default 0,
  currency text default 'EUR',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Shared Accounts
alter table public.shared_accounts enable row level security;

-- RLS POLICIES

-- Household Policies
create policy "Users can view households they belong to"
  on public.households for select
  using (
    auth.uid() in (
      select user_id from public.household_members
      where household_id = public.households.id
    )
  );

create policy "Users can insert households (creation)"
  on public.households for insert
  with check (auth.uid() = created_by);

-- Member Policies
create policy "Members can view other members in their household"
  on public.household_members for select
  using (
    household_id in (
      select household_id from public.household_members
      where user_id = auth.uid()
    )
  );

-- Shared Account Policies
create policy "Members can view shared accounts in their household"
  on public.shared_accounts for select
  using (
    household_id in (
      select household_id from public.household_members
      where user_id = auth.uid()
    )
  );

create policy "Members can update shared accounts in their household"
  on public.shared_accounts for update
  using (
    household_id in (
      select household_id from public.household_members
      where user_id = auth.uid()
    )
  );

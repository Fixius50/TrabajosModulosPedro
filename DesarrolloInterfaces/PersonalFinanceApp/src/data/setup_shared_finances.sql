-- Create shared_account_transactions table
create table if not exists shared_account_transactions (
    id uuid default gen_random_uuid() primary key,
    shared_account_id uuid references shared_accounts(id) on delete cascade not null,
    created_by uuid references auth.users(id) not null,
    amount numeric not null,
    description text not null,
    category text,
    created_at timestamptz default now() not null
  );
  
  -- Create notifications table
  create table if not exists notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    type text not null, -- 'invite', 'transaction', 'system'
    title text not null,
    message text not null,
    payload jsonb,
    is_read boolean default false,
    created_at timestamptz default now() not null
  );
  
  -- Enable RLS
  alter table shared_account_transactions enable row level security;
  alter table notifications enable row level security;
  
  -- Policies for shared_account_transactions
  create policy "Users can view transactions of accounts in their households"
  on shared_account_transactions for select
  using (
    exists (
      select 1 from shared_accounts sa
      join household_members hm on sa.household_id = hm.household_id
      where sa.id = shared_account_transactions.shared_account_id
      and hm.user_id = auth.uid()
    )
  );
  
  create policy "Users can insert transactions to accounts in their households"
  on shared_account_transactions for insert
  with check (
    exists (
      select 1 from shared_accounts sa
      join household_members hm on sa.household_id = hm.household_id
      where sa.id = shared_account_transactions.shared_account_id
      and hm.user_id = auth.uid()
    )
  );
  
  -- Policies for notifications
  create policy "Users can view their own notifications"
  on notifications for select
  using (auth.uid() = user_id);
  
  create policy "Users can update their own notifications"
  on notifications for update
  using (auth.uid() = user_id);
  
  create policy "Anyone can insert notifications"
  on notifications for insert
  with check (true);

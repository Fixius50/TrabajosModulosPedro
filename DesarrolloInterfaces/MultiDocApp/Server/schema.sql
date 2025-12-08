-- Create a table for documents
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  file_url text,
  file_type text, -- 'text', 'pdf', 'image', 'video'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.documents enable row level security;

-- Policy: Allow all access for demo purposes (Secure this in production!)
create policy "Allow public access" on public.documents for all using (true);

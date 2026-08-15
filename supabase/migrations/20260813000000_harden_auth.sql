-- 1. Create public.admin_users table if not exists
create table if not exists public.admin_users (
    id uuid default gen_random_uuid() primary key,
    email text unique not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.admin_users enable row level security;

-- 2. Seed approved administrator placeholder
insert into public.admin_users (email) values
('owner@tpgjewellers.com')
on conflict (email) do nothing;

-- 3. Replace public.is_admin() with hardened check checking against public.admin_users
-- Executed as SECURITY DEFINER with restricted search_path for security
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
    return (
        auth.role() = 'authenticated'
        and exists (
            select 1 from public.admin_users
            where admin_users.email = auth.jwt() ->> 'email'
        )
    );
end;
$$;

-- 4. RLS access policies for public.admin_users table
-- We avoid calling public.is_admin() to prevent any potential RLS policy recursion
create policy "Allow select read access for own email"
    on public.admin_users for select
    using (auth.jwt() ->> 'email' = email);

create policy "Allow administrative owner write access"
    on public.admin_users for all
    using (auth.jwt() ->> 'email' = 'owner@tpgjewellers.com')
    with check (auth.jwt() ->> 'email' = 'owner@tpgjewellers.com');

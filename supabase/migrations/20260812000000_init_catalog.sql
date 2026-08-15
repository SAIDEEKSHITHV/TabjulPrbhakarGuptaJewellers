-- Create public.is_admin() security helper function
-- This encapsulates the admin permission check, allowing roles or policies to change
-- without altering table definitions or individual policies later.
create or replace function public.is_admin()
returns boolean as $$
begin
    -- Currently, any authenticated user is treated as admin for CRUD access.
    -- Later, this can be restricted to specific email lists or custom JWT role claims:
    -- e.g., return (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');
    return (auth.role() = 'authenticated');
end;
$$ language plpgsql security definer;

-- Create updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- 1. Create collections table
create table public.collections (
    id uuid default gen_random_uuid() primary key,
    slug text unique not null,
    name_en text not null,
    name_te text,
    description_en text,
    description_te text,
    cover_image_url text,
    sort_order integer default 0,
    is_published boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint collections_slug_min_len check (char_length(slug) >= 2)
);

-- Trigger for collections updated_at
create trigger update_collections_updated_at
    before update on public.collections
    for each row
    execute function public.update_updated_at_column();

-- 2. Create products table
create table public.products (
    id uuid default gen_random_uuid() primary key,
    slug text unique not null,
    collection_id uuid references public.collections(id) on delete restrict not null,
    name_en text not null,
    name_te text,
    tagline_en text,
    tagline_te text,
    description_en text,
    description_te text,
    is_featured boolean default false,
    is_published boolean default true,
    sort_order integer default 0,
    meta_title_en text,
    meta_title_te text,
    meta_description_en text,
    meta_description_te text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint products_slug_min_len check (char_length(slug) >= 2)
);

-- Trigger for products updated_at
create trigger update_products_updated_at
    before update on public.products
    for each row
    execute function public.update_updated_at_column();

-- 3. Create product_images table
create table public.product_images (
    id uuid default gen_random_uuid() primary key,
    product_id uuid references public.products(id) on delete cascade not null,
    cloudinary_public_id text not null,
    secure_url text not null,
    alt_text_en text,
    alt_text_te text,
    sort_order integer default 0,
    is_primary boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Database Indexes for optimization
create index idx_collections_slug on public.collections(slug);
create index idx_collections_is_published on public.collections(is_published);
create index idx_collections_sort_order on public.collections(sort_order);

create index idx_products_slug on public.products(slug);
create index idx_products_collection_id on public.products(collection_id);
create index idx_products_is_published on public.products(is_published);
create index idx_products_is_featured on public.products(is_featured);
create index idx_products_sort_order on public.products(sort_order);

create index idx_product_images_product_id on public.product_images(product_id);
create index idx_product_images_sort_order on public.product_images(sort_order);

-- 5. Row Level Security Configuration
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

-- Policies for public.collections
create policy "Allow public read access for published collections"
    on public.collections for select
    using (is_published = true);

create policy "Allow admin read access for all collections"
    on public.collections for select
    using (public.is_admin());

create policy "Allow admin write access for collections"
    on public.collections for all
    using (public.is_admin())
    with check (public.is_admin());

-- Policies for public.products
create policy "Allow public read access for published products"
    on public.products for select
    using (is_published = true);

create policy "Allow admin read access for all products"
    on public.products for select
    using (public.is_admin());

create policy "Allow admin write access for products"
    on public.products for all
    using (public.is_admin())
    with check (public.is_admin());

-- Policies for public.product_images
create policy "Allow public read access for images of published products"
    on public.product_images for select
    using (
        exists (
            select 1 from public.products
            where products.id = product_images.product_id
            and products.is_published = true
        )
    );

create policy "Allow admin read access for all product images"
    on public.product_images for select
    using (public.is_admin());

create policy "Allow admin write access for product images"
    on public.product_images for all
    using (public.is_admin())
    with check (public.is_admin());

-- 6. Seed initial collections
insert into public.collections (slug, name_en, name_te, sort_order) values
('bridal', 'Bridal Jewellery', 'పెళ్లి నగలు', 1),
('gold', 'Gold Jewellery', 'బంగారు నగలు', 2),
('diamond', 'Diamond Jewellery', 'వజ్రాల నగలు', 3),
('temple', 'Temple Jewellery', 'టెంపుల్ డిజైన్స్', 4),
('daily-wear', 'Daily Wear Jewellery', 'రోజువారీ నగలు', 5);

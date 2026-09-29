-- ============================================================
-- SJS FROZEN FOOD — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- 1. PROFILES (extends auth.users, holds admin role)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- 2. CATEGORIES
-- ------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. PRODUCTS
-- ------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12,2) not null default 0 check (price >= 0),
  discount_price numeric(12,2) check (discount_price is null or discount_price >= 0),
  image_path text,
  stock_status text not null default 'available' check (stock_status in ('available', 'limited', 'out_of_stock')),
  active boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(active);

-- ------------------------------------------------------------
-- 4. PROMOS
-- ------------------------------------------------------------
create table if not exists public.promos (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  image_path text,
  discount numeric(5,2),
  start_at timestamptz,
  end_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 5. PROMO_PRODUCTS (many-to-many)
-- ------------------------------------------------------------
create table if not exists public.promo_products (
  promo_id uuid not null references public.promos(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  primary key (promo_id, product_id)
);

-- ------------------------------------------------------------
-- 6. WHATSAPP DESTINATIONS
-- ------------------------------------------------------------
create table if not exists public.whatsapp_destinations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null default 'Karyawan',
  phone text not null,
  active boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Hapus duplikat nomor (aman bila seed pernah dijalankan dua kali), lalu pasang constraint
delete from public.whatsapp_destinations a
  using public.whatsapp_destinations b
  where a.phone = b.phone and a.ctid > b.ctid;
create unique index if not exists whatsapp_destinations_phone_key on public.whatsapp_destinations(phone);
-- Hanya boleh ada satu kontak default
create unique index if not exists whatsapp_single_default on public.whatsapp_destinations(is_default) where is_default;

-- ------------------------------------------------------------
-- 7. SETTINGS (key-value store for website customization)
-- ------------------------------------------------------------
create table if not exists public.settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- updated_at auto-touch trigger (generic)
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_categories on public.categories;
create trigger touch_categories before update on public.categories
  for each row execute procedure public.touch_updated_at();

drop trigger if exists touch_products on public.products;
create trigger touch_products before update on public.products
  for each row execute procedure public.touch_updated_at();

drop trigger if exists touch_promos on public.promos;
create trigger touch_promos before update on public.promos
  for each row execute procedure public.touch_updated_at();

drop trigger if exists touch_whatsapp on public.whatsapp_destinations;
create trigger touch_whatsapp before update on public.whatsapp_destinations
  for each row execute procedure public.touch_updated_at();

drop trigger if exists touch_settings on public.settings;
create trigger touch_settings before update on public.settings
  for each row execute procedure public.touch_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.promos enable row level security;
alter table public.promo_products enable row level security;
alter table public.whatsapp_destinations enable row level security;
alter table public.settings enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ---------- profiles ----------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ---------- categories ----------
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (active = true or public.is_admin());

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- products ----------
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (active = true or public.is_admin());

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- promos ----------
drop policy if exists "promos_public_read" on public.promos;
create policy "promos_public_read" on public.promos
  for select using (active = true or public.is_admin());

drop policy if exists "promos_admin_write" on public.promos;
create policy "promos_admin_write" on public.promos
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- promo_products ----------
drop policy if exists "promo_products_public_read" on public.promo_products;
create policy "promo_products_public_read" on public.promo_products
  for select using (true);

drop policy if exists "promo_products_admin_write" on public.promo_products;
create policy "promo_products_admin_write" on public.promo_products
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- whatsapp_destinations ----------
drop policy if exists "whatsapp_public_read" on public.whatsapp_destinations;
create policy "whatsapp_public_read" on public.whatsapp_destinations
  for select using (active = true or public.is_admin());

drop policy if exists "whatsapp_admin_write" on public.whatsapp_destinations;
create policy "whatsapp_admin_write" on public.whatsapp_destinations
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- settings ----------
drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read" on public.settings
  for select using (true);

drop policy if exists "settings_admin_write" on public.settings;
create policy "settings_admin_write" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('promo-images', 'promo-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

-- Public read for all three buckets
drop policy if exists "public_read_product_images" on storage.objects;
create policy "public_read_product_images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "public_read_promo_images" on storage.objects;
create policy "public_read_promo_images" on storage.objects
  for select using (bucket_id = 'promo-images');

drop policy if exists "public_read_site_images" on storage.objects;
create policy "public_read_site_images" on storage.objects
  for select using (bucket_id = 'site-images');

-- Only admins can upload/update/delete
drop policy if exists "admin_write_product_images" on storage.objects;
create policy "admin_write_product_images" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admin_update_product_images" on storage.objects;
create policy "admin_update_product_images" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admin_delete_product_images" on storage.objects;
create policy "admin_delete_product_images" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admin_write_promo_images" on storage.objects;
create policy "admin_write_promo_images" on storage.objects
  for insert with check (bucket_id = 'promo-images' and public.is_admin());
drop policy if exists "admin_update_promo_images" on storage.objects;
create policy "admin_update_promo_images" on storage.objects
  for update using (bucket_id = 'promo-images' and public.is_admin());
drop policy if exists "admin_delete_promo_images" on storage.objects;
create policy "admin_delete_promo_images" on storage.objects
  for delete using (bucket_id = 'promo-images' and public.is_admin());

drop policy if exists "admin_write_site_images" on storage.objects;
create policy "admin_write_site_images" on storage.objects
  for insert with check (bucket_id = 'site-images' and public.is_admin());
drop policy if exists "admin_update_site_images" on storage.objects;
create policy "admin_update_site_images" on storage.objects
  for update using (bucket_id = 'site-images' and public.is_admin());
drop policy if exists "admin_delete_site_images" on storage.objects;
create policy "admin_delete_site_images" on storage.objects
  for delete using (bucket_id = 'site-images' and public.is_admin());

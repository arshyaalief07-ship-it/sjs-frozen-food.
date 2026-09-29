-- ============================================================
-- SJS FROZEN FOOD — SEED DATA
-- Run this AFTER schema.sql. Safe to re-run (uses upsert-style guards).
-- ============================================================

-- ------------------------------------------------------------
-- Categories
-- ------------------------------------------------------------
insert into public.categories (name, slug, active, sort_order) values
  ('Nugget', 'nugget', true, 1),
  ('Sosis', 'sosis', true, 2),
  ('Bakso', 'bakso', true, 3),
  ('Seafood', 'seafood', true, 4),
  ('Kentang', 'kentang', true, 5),
  ('Snack', 'snack', true, 6),
  ('Frozen Food Lainnya', 'frozen-food-lainnya', true, 7)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- Products (sample/demo — fully manageable from admin dashboard)
-- ------------------------------------------------------------
insert into public.products (category_id, name, slug, description, price, discount_price, stock_status, active, featured, sort_order)
select c.id, v.name, v.slug, v.description, v.price, v.discount_price, v.stock_status, true, v.featured, v.sort_order
from (values
  ('nugget', 'Nugget Ayam 500g', 'nugget-ayam-500g', 'Nugget ayam renyah, isi daging ayam pilihan. Cocok untuk camilan atau lauk keluarga.', 32000, null, 'available', true, 1),
  ('sosis', 'Sosis Sapi 500g', 'sosis-sapi-500g', 'Sosis sapi premium dengan tekstur juicy, cocok untuk sarapan atau BBQ.', 35000, 29900, 'available', true, 2),
  ('bakso', 'Bakso Sapi 500g', 'bakso-sapi-500g', 'Bakso sapi kenyal khas SJS, siap untuk kuah bakso atau mie ayam.', 38000, null, 'limited', true, 3),
  ('seafood', 'Udang Kupas 500g', 'udang-kupas-500g', 'Udang kupas segar beku, praktis untuk tumis atau goreng tepung.', 65000, null, 'available', true, 4),
  ('kentang', 'Kentang Goreng Shoestring 1kg', 'kentang-goreng-shoestring-1kg', 'Kentang goreng potongan shoestring, renyah tanpa perlu banyak minyak.', 42000, null, 'available', false, 5),
  ('snack', 'Dimsum Ayam 10 pcs', 'dimsum-ayam-10-pcs', 'Dimsum ayam isi 10 pcs, tinggal kukus atau goreng, cocok untuk camilan keluarga.', 30000, 25000, 'available', true, 6)
) as v(cat_slug, name, slug, description, price, discount_price, stock_status, featured, sort_order)
join public.categories c on c.slug = v.cat_slug
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- WhatsApp destinations
-- ------------------------------------------------------------
insert into public.whatsapp_destinations (name, role, phone, active, is_default) values
  ('Alif', 'Karyawan', '6281469858740', true, false),
  ('Alfin', 'Karyawan', '6289654565594', true, false),
  ('Alfi', 'Owner', '6281380330137', true, true)
on conflict (phone) do nothing;

-- ------------------------------------------------------------
-- Settings (website customization defaults)
-- ------------------------------------------------------------
insert into public.settings (key, value) values
  ('site_name', 'SJS Frozen Food'),
  ('slogan', 'Semua Favoritmu, Ada di SJS.'),
  ('hero_title', 'Semua Favoritmu, Ada di SJS.'),
  ('hero_subtitle', 'Temukan berbagai pilihan frozen food SJS, cek ketersediaan, lalu pesan dengan mudah.'),
  ('logo_path', ''),
  ('favicon_path', ''),
  ('hero_image_path', ''),
  ('hero_cta_text', 'Belanja Sekarang'),
  ('hero_cta_secondary_text', 'Lihat Promo'),
  ('promo_section_title', 'Promo Pilihan SJS'),
  ('category_section_title', 'Kategori Favorit'),
  ('featured_section_title', 'Produk Pilihan'),
  ('how_to_order_title', 'Cara Pesan'),
  ('location_section_title', 'Kunjungi Toko Kami'),
  ('store_address', 'Jl. Raya Pengasinan Kebon Kopi, RT 01/RW 06, Pengasinan, Kec. Sawangan, Kota Depok, Jawa Barat 16518'),
  ('google_maps_url', 'https://www.google.com/maps/search/?api=1&query=SJS+FROZEN+FOOD%2C+Jl.+Raya+Pengasinan+Kebon+Kopi%2C+Pengasinan%2C+Sawangan%2C+Depok'),
  ('seo_title', 'SJS Frozen Food | Semua Favoritmu, Ada di SJS.'),
  ('seo_description', 'Temukan berbagai pilihan frozen food SJS, cek ketersediaan, promo, dan pesan dengan mudah.')
on conflict (key) do nothing;

-- ------------------------------------------------------------
-- NOTE: To make yourself an admin after creating your account
-- via Supabase Auth (email/password), run this (replace email):
--
-- update public.profiles set role = 'admin' where email = 'your-admin-email@example.com';
-- ------------------------------------------------------------

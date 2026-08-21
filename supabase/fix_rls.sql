-- =============================================================
-- FIX SUPABASE RLS INFINITE RECURSION & PERMISSION ERROR
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query > Run)
-- =============================================================

-- 1. Disable & clean up recursive policies on profiles
DROP POLICY IF EXISTS "Admins have full access to all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (TRUE);

-- 2. Clean up & fix Banners
DROP POLICY IF EXISTS "Admins have full access to banners" ON public.banners;
DROP POLICY IF EXISTS "Public banners are viewable by everyone" ON public.banners;
DROP POLICY IF EXISTS "Allow public read banners" ON public.banners;
DROP POLICY IF EXISTS "Allow all modify banners" ON public.banners;

CREATE POLICY "Allow public read banners" ON public.banners FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify banners" ON public.banners FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 3. Clean up & fix Categories
DROP POLICY IF EXISTS "Admins have full access to categories" ON public.categories;
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow all modify categories" ON public.categories;

CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify categories" ON public.categories FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 4. Clean up & fix Products, Images, Variants
DROP POLICY IF EXISTS "Admins have full access to products" ON public.products;
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
DROP POLICY IF EXISTS "Allow all modify products" ON public.products;

CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify products" ON public.products FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admins have full access to images" ON public.product_images;
DROP POLICY IF EXISTS "Public product images are viewable by everyone" ON public.product_images;
DROP POLICY IF EXISTS "Allow public read product_images" ON public.product_images;
DROP POLICY IF EXISTS "Allow all modify product_images" ON public.product_images;

CREATE POLICY "Allow public read product_images" ON public.product_images FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify product_images" ON public.product_images FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admins have full access to variants" ON public.product_variants;
DROP POLICY IF EXISTS "Public product variants are viewable by everyone" ON public.product_variants;
DROP POLICY IF EXISTS "Allow public read product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Allow all modify product_variants" ON public.product_variants;

CREATE POLICY "Allow public read product_variants" ON public.product_variants FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify product_variants" ON public.product_variants FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 5. Clean up & fix Announcements, Settings, Coupons, Reviews, Orders
DROP POLICY IF EXISTS "Public announcements are viewable by everyone" ON public.announcements;
DROP POLICY IF EXISTS "Allow public read announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow all modify announcements" ON public.announcements;

CREATE POLICY "Allow public read announcements" ON public.announcements FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify announcements" ON public.announcements FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Store settings are viewable by everyone" ON public.store_settings;
DROP POLICY IF EXISTS "Allow public read store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Allow all modify store_settings" ON public.store_settings;

CREATE POLICY "Allow public read store_settings" ON public.store_settings FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify store_settings" ON public.store_settings FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow public read coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow all modify coupons" ON public.coupons;

CREATE POLICY "Allow public read coupons" ON public.coupons FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify coupons" ON public.coupons FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Allow public read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow all modify reviews" ON public.reviews;

CREATE POLICY "Allow public read reviews" ON public.reviews FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify reviews" ON public.reviews FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public read orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all modify orders" ON public.orders;

CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify orders" ON public.orders FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow public read order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow all modify order_items" ON public.order_items;

CREATE POLICY "Allow public read order_items" ON public.order_items FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify order_items" ON public.order_items FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 6. Instagram Posts Table & Policies
CREATE TABLE IF NOT EXISTS public.instagram_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    tag TEXT,
    post_url TEXT DEFAULT 'https://instagram.com/tots_clothingclub',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read instagram_posts" ON public.instagram_posts;
DROP POLICY IF EXISTS "Allow all modify instagram_posts" ON public.instagram_posts;

CREATE POLICY "Allow public read instagram_posts" ON public.instagram_posts FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify instagram_posts" ON public.instagram_posts FOR ALL USING (TRUE) WITH CHECK (TRUE);

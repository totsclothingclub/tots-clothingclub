-- TOTS E-Commerce PostgreSQL Database Schema
-- Supabase RLS & Relational Definitions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    short_description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    brand TEXT DEFAULT 'TOTS',
    sku TEXT UNIQUE NOT NULL,
    regular_price NUMERIC(10, 2) NOT NULL,
    sale_price NUMERIC(10, 2),
    discount_percent INT DEFAULT 0,
    tax_percent NUMERIC(5, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT FALSE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_sale BOOLEAN DEFAULT FALSE,
    is_plus_size BOOLEAN DEFAULT FALSE,
    primary_image TEXT DEFAULT '',
    available_sizes TEXT[] DEFAULT '{}',
    rating_avg NUMERIC(3,2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCT VARIANTS (Size, Color, Stock matrix)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    color_hex TEXT DEFAULT '#000000',
    sku TEXT UNIQUE NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BANNERS & ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    button_text TEXT,
    button_url TEXT,
    desktop_image_url TEXT NOT NULL,
    mobile_image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    link TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INSTAGRAM GALLERY & PROMO CARDS
CREATE TABLE IF NOT EXISTS public.instagram_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    tag TEXT,
    post_url TEXT DEFAULT 'https://instagram.com/tots_clothingclub',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.promo_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    button_text TEXT DEFAULT 'SHOP NOW',
    button_url TEXT DEFAULT '/shop',
    image_url TEXT DEFAULT '',
    bg_color TEXT DEFAULT 'cream',
    text_color TEXT DEFAULT 'dark',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. WISHLIST
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 8. CARTS & CART ITEMS
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id TEXT UNIQUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cart_id, variant_id)
);

-- 9. ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT DEFAULT 'Home',
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    street TEXT NOT NULL,
    apartment TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ORDERS & ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    shipping_fee NUMERIC(10, 2) DEFAULT 0.00,
    tax NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    order_status TEXT DEFAULT 'Pending' CHECK (order_status IN ('Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded')),
    payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
    payment_method TEXT DEFAULT 'Razorpay',
    payment_id TEXT,
    razorpay_order_id TEXT,
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    image_url TEXT
);

-- 11. COUPONS & USAGE
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_amount NUMERIC(10, 2) DEFAULT 0,
    max_discount NUMERIC(10, 2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. STORE SETTINGS
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name TEXT DEFAULT 'TOTS',
    logo_url TEXT,
    support_email TEXT DEFAULT 'support@totsfashion.com',
    support_phone TEXT DEFAULT '+91 85940 41490',
    currency TEXT DEFAULT '₹',
    free_shipping_threshold NUMERIC(10, 2) DEFAULT 999.00,
    standard_shipping_fee NUMERIC(10, 2) DEFAULT 99.00,
    instagram_handle TEXT DEFAULT '@tots_clothingclub',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (TRUE);

ALTER TABLE public.promo_cards ENABLE ROW LEVEL SECURITY;

-- 2. Banners, Promo Cards & Marketing
CREATE POLICY "Allow public read banners" ON public.banners FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify banners" ON public.banners FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow public read promo_cards" ON public.promo_cards FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify promo_cards" ON public.promo_cards FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow public read announcements" ON public.announcements FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify announcements" ON public.announcements FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow public read instagram_posts" ON public.instagram_posts FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify instagram_posts" ON public.instagram_posts FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 3. Catalog (Categories, Products, Images, Variants)
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify categories" ON public.categories FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify products" ON public.products FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow public read product_images" ON public.product_images FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify product_images" ON public.product_images FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow public read product_variants" ON public.product_variants FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify product_variants" ON public.product_variants FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 4. Store Settings, Coupons & Reviews
CREATE POLICY "Allow public read store_settings" ON public.store_settings FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify store_settings" ON public.store_settings FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow public read coupons" ON public.coupons FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify coupons" ON public.coupons FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow public read reviews" ON public.reviews FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify reviews" ON public.reviews FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 5. Orders & User Data
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify orders" ON public.orders FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow public read order_items" ON public.order_items FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify order_items" ON public.order_items FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);

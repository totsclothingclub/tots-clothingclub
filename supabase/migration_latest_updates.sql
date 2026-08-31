-- ==============================================================================
-- TOTS CLOTHING CLUB — SAFE DELTA MIGRATION SCRIPT
-- ==============================================================================
-- Use this script if your base database schema has ALREADY been executed.
-- It applies only the new/updated fields, tables, triggers, and RLS policies safely.
-- Run in: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. ADDRESSES TABLE (Add custom labels: Home, Office, Other)
ALTER TABLE IF EXISTS public.addresses 
ADD COLUMN IF NOT EXISTS label TEXT DEFAULT 'Home';

ALTER TABLE IF EXISTS public.addresses 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- 2. ORDERS TABLE (Razorpay gateway tracking & shipping ID)
ALTER TABLE IF EXISTS public.orders 
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

ALTER TABLE IF EXISTS public.orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

ALTER TABLE IF EXISTS public.orders 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. PROMO CARDS TABLE (Dynamic Homepage Promotional Cards)
CREATE TABLE IF NOT EXISTS public.promo_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

ALTER TABLE public.promo_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read promo_cards" ON public.promo_cards;
CREATE POLICY "Allow public read promo_cards" ON public.promo_cards FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Allow all modify promo_cards" ON public.promo_cards;
CREATE POLICY "Allow all modify promo_cards" ON public.promo_cards FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Seed initial promo cards if empty
INSERT INTO public.promo_cards (label, title, description, button_text, button_url, image_url, bg_color, text_color, display_order, is_active)
VALUES
  ('SPECIAL DROP', 'STYLE UNDER ₹499', 'Everything you love. Nothing over ₹499.', 'SHOP NOW', '/shop?maxPrice=499', '', 'wine', 'white', 1, true),
  ('XS TO 7XL', 'PLUS SIZE COLLECTION', 'Fashion that fits beautifully and feels amazing.', 'EXPLORE NOW', '/shop?category=plus-size', '', 'cream', 'dark', 2, true),
  ('NEW SEASON', 'NEW ARRIVALS', 'Fresh styles. Just for you.', 'SHOP NOW', '/shop?category=new-arrivals', '', 'cream', 'dark', 3, true)
ON CONFLICT DO NOTHING;

-- 4. AUTOMATIC USER PROFILE CREATION (Sync Supabase Auth -> public.profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'customer'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. ENSURE RLS POLICIES FOR USER DATA ACCESS
DROP POLICY IF EXISTS "Allow public read addresses" ON public.addresses;
CREATE POLICY "Allow public read addresses" ON public.addresses FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Allow all modify addresses" ON public.addresses;
CREATE POLICY "Allow all modify addresses" ON public.addresses FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow public read orders" ON public.orders;
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Allow all modify orders" ON public.orders;
CREATE POLICY "Allow all modify orders" ON public.orders FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 6. AUTO-CONFIRM ALL USERS (No email confirmation required)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 7. STORE SETTINGS FLAT SHIPPING
ALTER TABLE IF EXISTS public.store_settings 
ADD COLUMN IF NOT EXISTS standard_shipping_fee NUMERIC(10, 2) DEFAULT 80.00;

-- Verification query
SELECT 'Migration applied successfully! Users auto-confirmed.' AS status;

-- =============================================================
-- PROMO CARDS TABLE — Dynamic Promotional Cards for Homepage
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================

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

ALTER TABLE public.promo_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read promo_cards" ON public.promo_cards;
DROP POLICY IF EXISTS "Allow all modify promo_cards" ON public.promo_cards;

CREATE POLICY "Allow public read promo_cards" ON public.promo_cards FOR SELECT USING (TRUE);
CREATE POLICY "Allow all modify promo_cards" ON public.promo_cards FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Seed with the 3 sample cards (admin can edit or delete these)
INSERT INTO public.promo_cards (label, title, description, button_text, button_url, image_url, bg_color, text_color, display_order, is_active)
VALUES
  ('SPECIAL DROP', 'STYLE UNDER ₹499', 'Everything you love. Nothing over ₹499.', 'SHOP NOW', '/shop?maxPrice=499', '', 'wine', 'white', 1, true),
  ('XS TO 7XL', 'PLUS SIZE COLLECTION', 'Fashion that fits beautifully and feels amazing.', 'EXPLORE NOW', '/shop?category=plus-size', '', 'cream', 'dark', 2, true),
  ('NEW SEASON', 'NEW ARRIVALS', 'Fresh styles. Just for you.', 'SHOP NOW', '/shop?category=new-arrivals', '', 'cream', 'dark', 3, true)
ON CONFLICT DO NOTHING;

-- Verify
SELECT id, label, title, button_url, bg_color, display_order, is_active FROM public.promo_cards ORDER BY display_order;

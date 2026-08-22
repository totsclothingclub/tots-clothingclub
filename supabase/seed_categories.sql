-- =============================================================
-- SEED / ADD CATEGORIES (including Salwar)
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================

INSERT INTO public.categories (name, slug, description, image_url, display_order, is_active)
VALUES
  ('Salwar', 'salwar', 'Traditional and contemporary salwar suits designed for elegance.', '/images/placeholder.jpg', 1, true),
  ('Kurtis & Kurtas', 'kurtis-kurtas', 'Everyday and festive ethnic kurtis with premium detailing.', '/images/placeholder.jpg', 2, true),
  ('Dresses', 'dresses', 'Flared, A-line, and maxi dresses crafted for all sizes.', '/images/placeholder.jpg', 3, true),
  ('Plus Size', 'plus-size', 'Size-inclusive styles tailored specifically from XS to 7XL.', '/images/placeholder.jpg', 4, true),
  ('Co-ord Sets', 'co-ord-sets', 'Matching sets and stylish ethnic two-piece wear.', '/images/placeholder.jpg', 5, true),
  ('Bottomwear', 'bottomwear', 'Palazzos, pants, and churidars with stretch comfort.', '/images/placeholder.jpg', 6, true)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order;

-- Verify
SELECT id, name, slug, display_order, is_active FROM public.categories ORDER BY display_order;

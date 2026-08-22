-- =============================================================
-- TOTS DYNAMIC NAVIGATION & CATEGORY HIERARCHY SETUP
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================

-- 1. Add navigation location and dropdown columns to categories if missing
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS nav_location TEXT DEFAULT 'shop_dropdown';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_dropdown BOOLEAN DEFAULT FALSE;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- 2. Unlink existing products temporarily to prevent foreign key errors
UPDATE public.products SET category_id = NULL;

-- 3. Clear existing categories to establish fresh dynamic tree
DELETE FROM public.categories;

-- 4. Insert Top-Level Navigation Categories
WITH top_cats AS (
  INSERT INTO public.categories (id, name, slug, description, image_url, display_order, is_active, nav_location, is_dropdown)
  VALUES
    ('11111111-1111-4111-a111-111111111111', 'NEW ARRIVALS', 'new-arrivals', 'Fresh styles and newest season luxury drops.', '/images/placeholder.jpg', 1, true, 'navbar', false),
    ('22222222-2222-4222-a222-222222222222', 'SHOP', 'shop', 'Explore our complete ready-to-wear and budget collections.', '/images/placeholder.jpg', 2, true, 'navbar', true),
    ('33333333-3333-4333-a333-333333333333', 'PLUS SIZE', 'plus-size', 'XS to 7XL — Size inclusive fashion crafted for every body.', '/images/placeholder.jpg', 3, true, 'navbar', true),
    ('44444444-4444-4444-a444-444444444444', 'SALE', 'sale', 'Exclusive clearance offers, deals and festive discounts.', '/images/placeholder.jpg', 4, true, 'navbar', false)
  RETURNING id, name, slug
)
SELECT * FROM top_cats;

-- 5. Insert SHOP Dropdown Categories (Parent: SHOP)
INSERT INTO public.categories (name, slug, description, image_url, display_order, is_active, nav_location, parent_id)
VALUES
  ('Under ₹199', 'under-199', 'Budget-friendly styles and essentials under ₹199.', '/images/placeholder.jpg', 1, true, 'shop_dropdown', '22222222-2222-4222-a222-222222222222'),
  ('Under ₹499', 'under-499', 'Best-selling fashion and tops under ₹499.', '/images/placeholder.jpg', 2, true, 'shop_dropdown', '22222222-2222-4222-a222-222222222222'),
  ('99 Store', '99-store', 'Steal deals starting at just ₹99.', '/images/placeholder.jpg', 3, true, 'shop_dropdown', '22222222-2222-4222-a222-222222222222'),
  ('Salwar Sets', 'salwar-sets', 'Elegant stitched and unstitched salwar suits.', '/images/placeholder.jpg', 4, true, 'shop_dropdown', '22222222-2222-4222-a222-222222222222'),
  ('Chikankari', 'chikankari', 'Authentic Lucknowi handcrafted Chikankari kurtas.', '/images/placeholder.jpg', 5, true, 'shop_dropdown', '22222222-2222-4222-a222-222222222222'),
  ('Hijabs', 'hijabs', 'Premium georgette, chiffon, and cotton modal hijabs.', '/images/placeholder.jpg', 6, true, 'shop_dropdown', '22222222-2222-4222-a222-222222222222'),
  ('Bottoms', 'bottoms', 'Trousers, palazzos, leggings, and comfort pants.', '/images/placeholder.jpg', 7, true, 'shop_dropdown', '22222222-2222-4222-a222-222222222222');

-- 6. Insert PLUS SIZE Dropdown & Page Subcategories (Parent: PLUS SIZE)
INSERT INTO public.categories (name, slug, description, image_url, display_order, is_active, nav_location, parent_id)
VALUES
  ('All Plus Size', 'all-plus-size', 'Explore the complete size-inclusive collection from XS to 7XL.', '/images/placeholder.jpg', 1, true, 'plus_size_dropdown', '33333333-3333-4333-a333-333333333333'),
  ('Modest Wear', 'modest-wear', 'Modest dresses, abayas, and full-coverage sets.', '/images/placeholder.jpg', 2, true, 'plus_size_dropdown', '33333333-3333-4333-a333-333333333333'),
  ('Salwar', 'salwar', 'Plus size ethnic salwar suits and kurta sets.', '/images/placeholder.jpg', 3, true, 'plus_size_dropdown', '33333333-3333-4333-a333-333333333333'),
  ('Daily Wear', 'daily-wear', 'Comfortable everyday tops, kurtis, and tunics.', '/images/placeholder.jpg', 4, true, 'plus_size_dropdown', '33333333-3333-4333-a333-333333333333'),
  ('Bottoms', 'plus-size-bottoms', 'Stretchable and plus size tailored bottoms.', '/images/placeholder.jpg', 5, true, 'plus_size_dropdown', '33333333-3333-4333-a333-333333333333');

-- 7. Re-link plus-size products to PLUS SIZE main category by default
UPDATE public.products SET category_id = '33333333-3333-4333-a333-333333333333' WHERE is_plus_size = true;

-- 8. Verify categories hierarchy
SELECT 
  c.id,
  c.name,
  c.slug,
  c.nav_location,
  c.display_order,
  p.name AS parent_name,
  c.is_active
FROM public.categories c
LEFT JOIN public.categories p ON c.parent_id = p.id
ORDER BY c.nav_location, c.display_order;

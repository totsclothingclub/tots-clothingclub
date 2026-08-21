-- ============================================================
-- TOTS E-Commerce - Complete Seed Data
-- Paste this in Supabase SQL Editor after running schema.sql
-- ============================================================

-- ============================================================
-- 1. STORE SETTINGS
-- ============================================================
INSERT INTO public.store_settings (
  id, store_name, logo_url, support_email, support_phone,
  currency, free_shipping_threshold, standard_shipping_fee, instagram_handle
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'TOTS',
  '/images/tots-logo.png',
  'care@totsfashion.com',
  '+91 98765 43210',
  '₹',
  999.00,
  99.00,
  '@tots_clothingclub'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. ANNOUNCEMENTS
-- ============================================================
INSERT INTO public.announcements (id, text, link, is_active) VALUES
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    '🚚 Free Shipping on Orders Above ₹999 | Use Code: TOTS10 for 10% Off',
    '/shop',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. BANNERS (Hero Slider)
-- ============================================================
INSERT INTO public.banners (
  id, title, subtitle, button_text, button_url,
  desktop_image_url, mobile_image_url, is_active, display_order
) VALUES
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'FASHION THAT FITS YOU',
    'STYLE HAS NO SIZE.',
    'SHOP NEW ARRIVALS',
    '/shop?category=new-arrivals',
    '/images/placeholder.jpg',
    '/images/placeholder.jpg',
    true, 1
  ),
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34',
    'PLUS SIZE COLLECTION',
    'XS TO 7XL — MADE FOR YOU.',
    'EXPLORE PLUS SIZE',
    '/shop?category=plus-size',
    '/images/placeholder.jpg',
    '/images/placeholder.jpg',
    true, 2
  ),
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35',
    'MODEST & WESTERN WEAR',
    'TIMELESS ELEGANCE.',
    'SHOP NOW',
    '/shop',
    '/images/placeholder.jpg',
    '/images/placeholder.jpg',
    true, 3
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. CATEGORIES
-- UUID scheme: 10000000-0000-0000-0000-00000000000X
-- ============================================================
INSERT INTO public.categories (
  id, name, slug, description, image_url, display_order, is_active
) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'New Arrivals',
    'new-arrivals',
    'Latest luxury arrivals engineered for effortless elegance.',
    '/images/placeholder.jpg',
    1, true
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Plus Size',
    'plus-size',
    'XS to 7XL — Made for every body.',
    '/images/placeholder.jpg',
    2, true
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'Western Wear',
    'western-wear',
    'Contemporary dresses, shirt dresses, and tailored tops.',
    '/images/placeholder.jpg',
    3, true
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'Salwar & Modest Wear',
    'salwar-modest-wear',
    'Graceful abayas, kurta sets, and modest silhouettes.',
    '/images/placeholder.jpg',
    4, true
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. PRODUCTS (8 products)
-- UUID scheme: 20000000-0000-0000-0000-00000000000X
-- ============================================================
INSERT INTO public.products (
  id, name, slug, description, short_description,
  category_id, brand, sku,
  regular_price, sale_price, discount_percent, tax_percent,
  status, is_featured, is_new_arrival, is_best_seller, is_sale, is_plus_size,
  meta_title, meta_description
) VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'Floral Printed Maxi Dress',
    'floral-printed-maxi-dress',
    'Elevate your wardrobe with our signature Floral Printed Maxi Dress. Crafted from lightweight, breathable rayon chiffon with a flattering cinched waist and flowy modest skirt. Perfect for casual wear, festive gatherings, and evening outings.',
    'Comfortable, flowy floral maxi dress designed for all-day comfort.',
    '10000000-0000-0000-0000-000000000002',
    'TOTS', 'TOTS-DR-001',
    799.00, 599.00, 25, 5.00,
    'published', true, true, true, true, true,
    'Floral Printed Maxi Dress - TOTS Plus Size Collection',
    'Shop premium Floral Printed Maxi Dress available in sizes XS to 7XL at TOTS.'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Embroidered Kurta Set',
    'embroidered-kurta-set',
    'Rich deep wine embroidery along the neck and cuffs. Paired with comfortable straight trousers. Perfect blend of traditional craft and modern fit.',
    'Intricate neck embroidery kurta with trousers in rich maroon.',
    '10000000-0000-0000-0000-000000000004',
    'TOTS', 'TOTS-KS-002',
    999.00, 699.00, 30, 5.00,
    'published', true, false, true, true, true,
    'Embroidered Kurta Set - TOTS Salwar & Modest Wear',
    'Shop premium Embroidered Kurta Set available in sizes S to 5XL at TOTS.'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'Floral A-Line Dress',
    'floral-a-line-dress',
    'Elegant dark navy A-line silhouette with delicate micro floral motifs. Breathable rayon fabric with soft gathers.',
    'Dark navy floral dress with easy A-line flare.',
    '10000000-0000-0000-0000-000000000003',
    'TOTS', 'TOTS-DR-003',
    799.00, 499.00, 37, 5.00,
    'published', false, true, false, true, true,
    'Floral A-Line Dress - TOTS Western Wear',
    'Shop stylish Floral A-Line Dress in sizes XS to 5XL at TOTS.'
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'Casual Shirt Dress',
    'casual-shirt-dress',
    'Striped grey and white utility shirt dress featuring button-down front, belt waist tie, and side pockets.',
    'Smart casual grey striped button-down dress.',
    '10000000-0000-0000-0000-000000000003',
    'TOTS', 'TOTS-SD-004',
    609.00, 599.00, 2, 5.00,
    'published', false, false, false, false, true,
    'Casual Shirt Dress - TOTS Western Wear',
    'Shop comfortable Casual Shirt Dress in sizes S to 7XL at TOTS.'
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    'Rayon Kurta Set',
    'rayon-kurta-set',
    'Olive green tunic kurta set with empire tie waist, breathable premium rayon fabric.',
    'Olive green rayon kurta set with relaxed waist fit.',
    '10000000-0000-0000-0000-000000000004',
    'TOTS', 'TOTS-KS-005',
    1199.00, 749.00, 37, 5.00,
    'published', true, false, true, true, true,
    'Rayon Kurta Set - TOTS Salwar & Modest Wear',
    'Shop premium Rayon Kurta Set in sizes S to 5XL at TOTS.'
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    'Printed Western Top',
    'printed-western-top',
    'Dark indigo printed tunic top with shirt collar and cuffed sleeves.',
    'Versatile printed top ideal for everyday denim pairing.',
    '10000000-0000-0000-0000-000000000003',
    'TOTS', 'TOTS-TP-006',
    609.00, 499.00, 18, 5.00,
    'published', false, false, false, true, true,
    'Printed Western Top - TOTS Western Wear',
    'Shop stylish Printed Western Top in sizes S to 4XL at TOTS.'
  ),
  (
    '20000000-0000-0000-0000-000000000007',
    'Cotton Long Dress',
    'cotton-long-dress',
    '100% pure organic cotton long floral dress with front button placket and tiered skirt.',
    'Soft organic cotton long dress for supreme summer comfort.',
    '10000000-0000-0000-0000-000000000003',
    'TOTS', 'TOTS-DR-007',
    899.00, 649.00, 27, 5.00,
    'published', true, true, false, true, true,
    'Cotton Long Dress - TOTS Western Wear',
    'Shop premium Cotton Long Dress in sizes S to 6XL at TOTS.'
  ),
  (
    '20000000-0000-0000-0000-000000000008',
    'Embroidered Abaya',
    'embroidered-abaya',
    'Deep plum purple modesty abaya featuring gold thread work around cuffs and chest.',
    'Graceful purple embroidered abaya for modest occasions.',
    '10000000-0000-0000-0000-000000000004',
    'TOTS', 'TOTS-AB-008',
    1299.00, 899.00, 30, 5.00,
    'published', true, false, true, true, true,
    'Embroidered Abaya - TOTS Salwar & Modest Wear',
    'Shop elegant Embroidered Abaya in sizes M to 7XL at TOTS.'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. PRODUCT IMAGES
-- UUID scheme: 30000000-0000-0000-0000-00000000000X
-- ============================================================
INSERT INTO public.product_images (id, product_id, image_url, is_primary, display_order) VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '/images/placeholder.jpg', true,  1),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '/images/placeholder.jpg', false, 2),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '/images/placeholder.jpg', false, 3),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', '/images/placeholder.jpg', true,  1),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', '/images/placeholder.jpg', true,  1),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000004', '/images/placeholder.jpg', true,  1),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', '/images/placeholder.jpg', true,  1),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000006', '/images/placeholder.jpg', true,  1),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000007', '/images/placeholder.jpg', true,  1),
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000008', '/images/placeholder.jpg', true,  1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. PRODUCT VARIANTS
-- UUID scheme: 40000000-0000-0000-0000-00000000000X
-- ============================================================
INSERT INTO public.product_variants (
  id, product_id, size, color, color_hex, sku, price, stock_quantity
) VALUES
  -- Product 1: Floral Printed Maxi Dress — Black Floral (XL to 7XL)
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'XL',  'Black Floral', '#1a1a1a', 'TOTS-DR-001-XL',  599.00, 5),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '2XL', 'Black Floral', '#1a1a1a', 'TOTS-DR-001-2XL', 599.00, 8),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '3XL', 'Black Floral', '#1a1a1a', 'TOTS-DR-001-3XL', 599.00, 3),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', '4XL', 'Black Floral', '#1a1a1a', 'TOTS-DR-001-4XL', 599.00, 6),
  ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', '5XL', 'Black Floral', '#1a1a1a', 'TOTS-DR-001-5XL', 599.00, 4),
  ('40000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', '6XL', 'Black Floral', '#1a1a1a', 'TOTS-DR-001-6XL', 599.00, 2),
  ('40000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', '7XL', 'Black Floral', '#1a1a1a', 'TOTS-DR-001-7XL', 599.00, 1),
  -- Product 2: Embroidered Kurta Set — Wine Maroon
  ('40000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000002', '3XL', 'Wine Maroon',  '#701a2b', 'TOTS-KS-002-3XL', 699.00, 10),
  ('40000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000002', '4XL', 'Wine Maroon',  '#701a2b', 'TOTS-KS-002-4XL', 699.00, 7),
  -- Product 3: Floral A-Line Dress — Navy Blue
  ('40000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000003', '2XL', 'Navy Blue',    '#111827', 'TOTS-DR-003-2XL', 499.00, 6),
  -- Product 4: Casual Shirt Dress — Grey Stripe
  ('40000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000004', 'XL',  'Grey Stripe',  '#4b5563', 'TOTS-SD-004-XL',  599.00, 4),
  -- Product 5: Rayon Kurta Set — Olive Green
  ('40000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000005', '2XL', 'Olive Green',  '#3f6212', 'TOTS-KS-005-2XL', 749.00, 9),
  -- Product 6: Printed Western Top — Indigo
  ('40000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000006', 'XL',  'Indigo',       '#1e1b4b', 'TOTS-TP-006-XL',  499.00, 8),
  -- Product 7: Cotton Long Dress — Black Print
  ('40000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000007', '3XL', 'Black Print',  '#1a1a1a', 'TOTS-DR-007-3XL', 649.00, 5),
  -- Product 8: Embroidered Abaya — Plum Purple
  ('40000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000008', '3XL', 'Plum Purple',  '#581c87', 'TOTS-AB-008-3XL', 899.00, 6)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 8. COUPONS
-- UUID scheme: 50000000-0000-0000-0000-00000000000X
-- ============================================================
INSERT INTO public.coupons (
  id, code, discount_type, discount_value,
  min_order_amount, max_discount, usage_limit, used_count, is_active
) VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    'TOTS10',
    'percentage',
    10.00,
    499.00,
    NULL,
    500,
    42,
    true
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    'WELCOME100',
    'fixed',
    100.00,
    999.00,
    NULL,
    1000,
    128,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 9. REVIEWS
-- UUID scheme: 60000000-0000-0000-0000-00000000000X
-- ============================================================
INSERT INTO public.reviews (
  id, product_id, customer_name, rating, title, comment,
  is_verified_purchase, is_approved, created_at
) VALUES
  (
    '60000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Ananya Sharma', 5,
    'Perfect fit for 3XL!',
    'Finding stylish plus size clothing that actually fits well has been impossible until I found TOTS. High quality fabric, soft feel, and beautiful floral pattern.',
    true, true, '2026-08-10T10:00:00Z'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'Priya V.', 5,
    'Loved the comfort',
    'Lightweight and elegant. Received so many compliments at a family lunch. Highly recommend!',
    true, true, '2026-08-12T14:30:00Z'
  ),
  (
    '60000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000002',
    'Meera Nair', 5,
    'Stunning embroidery',
    'The wine color is very rich and royal. Fits true to size chart.',
    true, true, '2026-08-15T09:15:00Z'
  ),
  (
    '60000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000005',
    'Lakshmi Krishnan', 5,
    'Excellent quality fabric',
    'The olive green color is beautiful and the rayon fabric is so breathable. Perfect for Kerala weather!',
    true, true, '2026-08-17T11:00:00Z'
  ),
  (
    '60000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000008',
    'Zainab Ali', 5,
    'Gorgeous abaya!',
    'The gold embroidery is absolutely stunning. Perfect length and very elegant for Eid.',
    true, true, '2026-08-19T08:30:00Z'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DONE! Seeded:
--   store_settings   → 1 row
--   announcements    → 1 row
--   banners          → 3 rows  (hero slider)
--   categories       → 4 rows
--   products         → 8 rows
--   product_images   → 10 rows
--   product_variants → 15 rows
--   coupons          → 2 rows  (TOTS10, WELCOME100)
--   reviews          → 5 rows
-- ============================================================

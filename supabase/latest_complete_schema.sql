-- ==============================================================================
-- TOTS APPAREL: CLEAN SUPABASE DATABASE SCHEMA MIGRATION
-- Adds necessary columns without inserting any hardcoded data or hardcoded images.
-- All data and images are managed dynamically via the Admin Panel.
-- ==============================================================================

-- 1. Ensure Columns on `categories` Table
ALTER TABLE public.categories 
  ADD COLUMN IF NOT EXISTS nav_location text DEFAULT 'shop_dropdown',
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_dropdown boolean DEFAULT false;

-- 2. Ensure `category_ids` Array on `products` Table for Multi-Category Assignment
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS category_ids text[] DEFAULT '{}';

-- 3. Create Index on parent_id and nav_location for Fast Queries
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_nav_location ON public.categories(nav_location);
CREATE INDEX IF NOT EXISTS idx_products_category_ids ON public.products USING GIN (category_ids);

-- 4. Remove unneeded 'all-plus-size' and 'western-wear' categories
DELETE FROM public.categories WHERE slug IN ('all-plus-size', 'western-wear');

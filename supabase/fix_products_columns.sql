-- =============================================================
-- FIX: Products Table — Add missing columns
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================

-- 1. Add primary_image column (was missing — this is why products couldn't be saved!)
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS primary_image TEXT DEFAULT '';

-- 2. Add available_sizes column
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS available_sizes TEXT[] DEFAULT '{}';

-- 3. Add rating_avg and review_count columns  
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(3,2) DEFAULT 5.0;

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0;

-- 4. Fix: make description nullable (was NOT NULL — caused silent failures when description was empty)
ALTER TABLE public.products 
  ALTER COLUMN description SET DEFAULT '';

ALTER TABLE public.products 
  ALTER COLUMN description DROP NOT NULL;

-- 5. Verify the fix — this should show all the new columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products'
  AND table_schema = 'public'
ORDER BY ordinal_position;

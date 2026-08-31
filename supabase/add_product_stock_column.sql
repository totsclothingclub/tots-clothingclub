-- Add stock_quantity column to products table in Supabase
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 25;

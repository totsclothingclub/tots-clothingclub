-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query → Run)
-- Adds video_url, caption, and author_name columns to instagram_posts table

ALTER TABLE public.instagram_posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.instagram_posts ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE public.instagram_posts ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE public.instagram_posts ADD COLUMN IF NOT EXISTS embed_html TEXT;

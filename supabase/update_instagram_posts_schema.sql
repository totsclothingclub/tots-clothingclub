-- =============================================================
-- Instagram Posts & Images Schema Update
-- Replaces old video columns with clean image posts & Instagram URLs
-- =============================================================

-- 1. Create table if it does not exist
CREATE TABLE IF NOT EXISTS public.instagram_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    instagram_url TEXT,
    post_url TEXT,
    caption TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure new required columns exist
ALTER TABLE public.instagram_posts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.instagram_posts ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.instagram_posts ADD COLUMN IF NOT EXISTS post_url TEXT;
ALTER TABLE public.instagram_posts ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE public.instagram_posts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.instagram_posts ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE public.instagram_posts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.instagram_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. (Optional Cleanup) Remove old video-specific columns if they exist
ALTER TABLE public.instagram_posts DROP COLUMN IF EXISTS video_url;
ALTER TABLE public.instagram_posts DROP COLUMN IF EXISTS embed_html;
ALTER TABLE public.instagram_posts DROP COLUMN IF EXISTS author_name;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

-- 5. Policies for public reading & admin modifications
DROP POLICY IF EXISTS "Allow public read instagram_posts" ON public.instagram_posts;
CREATE POLICY "Allow public read instagram_posts" ON public.instagram_posts FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Allow all modify instagram_posts" ON public.instagram_posts;
CREATE POLICY "Allow all modify instagram_posts" ON public.instagram_posts FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 6. Setup Supabase Storage Bucket for Instagram Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('instagram', 'instagram', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage public read policy
DROP POLICY IF EXISTS "Public Access Instagram Bucket" ON storage.objects;
CREATE POLICY "Public Access Instagram Bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'instagram');

-- Storage insert policy
DROP POLICY IF EXISTS "Allow Admin Upload Instagram Bucket" ON storage.objects;
CREATE POLICY "Allow Admin Upload Instagram Bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'instagram');

-- Storage update / delete policies
DROP POLICY IF EXISTS "Allow Admin Update Instagram Bucket" ON storage.objects;
CREATE POLICY "Allow Admin Update Instagram Bucket" ON storage.objects
FOR UPDATE USING (bucket_id = 'instagram');

DROP POLICY IF EXISTS "Allow Admin Delete Instagram Bucket" ON storage.objects;
CREATE POLICY "Allow Admin Delete Instagram Bucket" ON storage.objects
FOR DELETE USING (bucket_id = 'instagram');

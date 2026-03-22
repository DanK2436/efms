-- EFMS Database Schema for Supabase
-- Run this script in the Supabase SQL Editor

-- 1. Create the 'requests' table (Demandes de Devis)
CREATE TABLE IF NOT EXISTS public.requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  vehicule TEXT,
  service TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create the 'annonces' table
CREATE TABLE IF NOT EXISTS public.annonces (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL,
  contenu TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT, -- 'image' or 'video'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create the 'portfolio' table (Projets réalisés)
CREATE TABLE IF NOT EXISTS public.portfolio (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  client TEXT,
  date_realisation DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Create the 'products' table (Boutique / Market)
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT NOT NULL,
  prix DECIMAL(10,2),
  image_url TEXT,
  categorie TEXT, -- 'Accessoires', 'Logiciels', etc.
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Create the 'users' table (Administration)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Haché de préférence, ici en clair pour la demande mais à sécuriser via Supabase Auth idéalement
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insertion de l'administrateur par défaut (comme demandé)
INSERT INTO public.users (email, password)
VALUES ('admin@efms.outlook.com', 'Guelord123')
ON CONFLICT (email) DO NOTHING;

-- 6. Storage Setup Instructions:
-- IMPORTANT: You must manually create the following storage buckets in the Supabase Dashboard:
-- a. 'annonces-media' (Public)
-- b. 'portfolio-images' (Public)
-- c. 'products-images' (Public)

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies (Allow read for everyone, all for service_role)
DROP POLICY IF EXISTS "Allow public read" ON public.annonces;
CREATE POLICY "Allow public read" ON public.annonces FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow public read" ON public.portfolio;
CREATE POLICY "Allow public read" ON public.portfolio FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow public read" ON public.products;
CREATE POLICY "Allow public read" ON public.products FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow insert for everyone" ON public.requests;
CREATE POLICY "Allow insert for everyone" ON public.requests FOR INSERT TO anon WITH CHECK (true);

-- Allow everything for service_role (backend)
CREATE POLICY "Full access for service_role" ON public.annonces FOR ALL TO service_role USING (true);
CREATE POLICY "Full access for service_role" ON public.requests FOR ALL TO service_role USING (true);
CREATE POLICY "Full access for service_role" ON public.portfolio FOR ALL TO service_role USING (true);
CREATE POLICY "Full access for service_role" ON public.products FOR ALL TO service_role USING (true);
CREATE POLICY "Full access for service_role" ON public.users FOR ALL TO service_role USING (true);

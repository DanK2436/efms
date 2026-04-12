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
  password TEXT NOT NULL, 
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Create the 'reviews' table (Avis clients)
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  commentaire TEXT NOT NULL,
  note INTEGER CHECK (note >= 1 AND note <= 5),
  approuve BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Create the 'visits' table (Statistiques de visites)
CREATE TABLE IF NOT EXISTS public.visits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Create 'keep_alive' table to prevent project pausing
CREATE TABLE IF NOT EXISTS public.keep_alive (
  id SERIAL PRIMARY KEY,
  last_ping TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Initialisation/Mise à jour du ping (id 1)
INSERT INTO public.keep_alive (id, last_ping) 
VALUES (1, NOW()) 
ON CONFLICT (id) DO UPDATE SET last_ping = NOW();

-- 9. Insertion de l'administrateur par défaut
INSERT INTO public.users (email, password)
VALUES ('admin@efms.outlook.com', 'Guelord123')
ON CONFLICT (email) DO NOTHING;

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keep_alive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies (Idempotent using DROP POLICY IF EXISTS)

-- Policies for public READ access
DROP POLICY IF EXISTS "Allow public read" ON public.annonces;
CREATE POLICY "Allow public read" ON public.annonces FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow public read" ON public.portfolio;
CREATE POLICY "Allow public read" ON public.portfolio FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow public read" ON public.products;
CREATE POLICY "Allow public read" ON public.products FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow public read" ON public.reviews;
CREATE POLICY "Allow public read" ON public.reviews FOR SELECT TO anon USING (approuve = true);

-- Policies for public INSERT access
DROP POLICY IF EXISTS "Allow insert for everyone" ON public.requests;
CREATE POLICY "Allow insert for everyone" ON public.requests FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for everyone" ON public.reviews;
CREATE POLICY "Allow insert for everyone" ON public.reviews FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for everyone" ON public.visits;
CREATE POLICY "Allow insert for everyone" ON public.visits FOR INSERT TO anon WITH CHECK (true);

-- Policies for service_role FULL access (Backend/Admin)
DROP POLICY IF EXISTS "Full access for service_role" ON public.annonces;
CREATE POLICY "Full access for service_role" ON public.annonces FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Full access for service_role" ON public.requests;
CREATE POLICY "Full access for service_role" ON public.requests FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Full access for service_role" ON public.portfolio;
CREATE POLICY "Full access for service_role" ON public.portfolio FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Full access for service_role" ON public.products;
CREATE POLICY "Full access for service_role" ON public.products FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Full access for service_role" ON public.reviews;
CREATE POLICY "Full access for service_role" ON public.reviews FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Full access for service_role" ON public.visits;
CREATE POLICY "Full access for service_role" ON public.visits FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Full access for service_role" ON public.keep_alive;
CREATE POLICY "Full access for service_role" ON public.keep_alive FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Full access for service_role" ON public.users;
CREATE POLICY "Full access for service_role" ON public.users FOR ALL TO service_role USING (true);

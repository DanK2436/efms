-- RECAPITULATIF DES CODES SQL AJOUTES (Version Corrigée et Sécurisée)
-- Utilisez ce code dans l'éditeur SQL de Supabase.

-- 1. Table des Avis Clients
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  commentaire TEXT NOT NULL,
  note INTEGER CHECK (note >= 1 AND note <= 5),
  approuve BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Table des Statistiques de Visites
CREATE TABLE IF NOT EXISTS public.visits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Table Keep-Alive (Empêche la mise en pause de Supabase)
CREATE TABLE IF NOT EXISTS public.keep_alive (
  id SERIAL PRIMARY KEY,
  last_ping TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Initialisation/Mise à jour du ping (id 1)
INSERT INTO public.keep_alive (id, last_ping) 
VALUES (1, NOW()) 
ON CONFLICT (id) DO UPDATE SET last_ping = NOW();

-- 4. Sécurité (RLS) - Activation
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keep_alive ENABLE ROW LEVEL SECURITY;

-- 5. Politiques de Sécurité (Idempotentes)

-- Avis : Lecture publique (si approuvé)
DROP POLICY IF EXISTS "Allow public read" ON public.reviews;
CREATE POLICY "Allow public read" ON public.reviews FOR SELECT TO anon USING (approuve = true);

-- Avis : Insertion publique
DROP POLICY IF EXISTS "Allow insert for everyone" ON public.reviews;
CREATE POLICY "Allow insert for everyone" ON public.reviews FOR INSERT TO anon WITH CHECK (true);

-- Visites : Insertion publique
DROP POLICY IF EXISTS "Allow insert for everyone" ON public.visits;
CREATE POLICY "Allow insert for everyone" ON public.visits FOR INSERT TO anon WITH CHECK (true);

-- Accès complet pour le Backend (service_role)
DROP POLICY IF EXISTS "Full access for service_role" ON public.reviews;
CREATE POLICY "Full access for service_role" ON public.reviews FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Full access for service_role" ON public.visits;
CREATE POLICY "Full access for service_role" ON public.visits FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Full access for service_role" ON public.keep_alive;
CREATE POLICY "Full access for service_role" ON public.keep_alive FOR ALL TO service_role USING (true);

-- Message de succès
-- "Les tables 'reviews', 'visits' et 'keep_alive' sont prêtes."

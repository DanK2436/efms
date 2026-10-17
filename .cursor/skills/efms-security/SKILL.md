---
name: efms-security
description: >-
  Règles de sécurité pour le site EFMS (Supabase, admin, API Express).
  À lire avant toute modification de backend/, admin/js, ou appels fetch/Supabase
  côté client. Couvre secrets, auth, RLS, XSS, upload et CORS.
paths:
  - "backend/**"
  - "admin/**"
  - "assets/js/**"
  - "pages/**"
  - "index.html"
---

# EFMS — Sécurité (obligatoire)

Plan : `docs/PLAN-CORRECTION-EFMS.md` §3–5.

## Interdits absolus

1. **Jamais** de clé Supabase `service_role` dans HTML/JS/CSS client, commits, ou issues.
2. **Jamais** de mot de passe en clair en base ni comparaison `eq.password` via REST public.
3. **Jamais** d’auth admin basée uniquement sur `localStorage` / flag booléen.
4. **Jamais** de token admin hardcodé dans le dépôt (`efms-admin-secure-token-2026` et équivalents).
5. **Jamais** d’appel PostgREST admin depuis le navigateur avec une clé privilégiée.

Si tu découvres une clé service_role dans le code : la retirer du client **et** rappeler de la **révoquer/régénérer** dans le dashboard Supabase.

## Architecture cible

```
Navigateur (anon optionnel / pas de secret)
    → HTTPS → backend Express (seul détenteur de SUPABASE_SERVICE_ROLE / SUPABASE_KEY)
        → Supabase (RLS + service role serveur uniquement)
```

- Public : `POST /api/requests`, `GET /api/annonces`, `POST|GET /api/reviews` (avis approuvés), etc.
- Admin : toutes les routes mutatives derrière middleware JWT/session réel.
- Frontend admin : stocke seulement un **access token** opaque/JWT court ; chaque requête `Authorization: Bearer …` vers le backend.

## Auth

- Hasher les mots de passe avec **bcrypt** (ou argon2) ; migration des comptes existants.
- Login : `POST /api/login` côté backend uniquement ; répondre JWT signé (`JWT_SECRET` env) avec expiration.
- Middleware : vérifier signature + expiration ; pas de comparaison à une chaîne fixe.
- Invalider sessions au logout côté client (suppression token) ; idéalement blacklist/rotating refresh plus tard.
- Supprimer le login direct `rest/v1/users?email=eq.…&password=eq.…`.

## Secrets & config

Variables d’environnement attendues (exemples) :

```
SUPABASE_URL=
SUPABASE_KEY=          # service role — serveur seulement
JWT_SECRET=
ADMIN_BOOTSTRAP_HASH=  # optionnel
CORS_ORIGINS=https://efms-kolwezi.com
API_PUBLIC_URL=https://api.efms-kolwezi.com
```

- Pas de fallback mot de passe faible (`monmotdepasseadmin`).
- Client public : URL API via config relative ou meta ; **pas** `http://localhost:3000` en prod.

## API hardening

- Restreindre `cors({ origin: […] })`.
- Rate-limit login, contact, avis (ex. express-rate-limit).
- Upload : whitelist MIME (`image/jpeg`, `image/png`, `image/webp`, `video/mp4`), taille max, nom de fichier généré serveur.
- Valider / sanitizer entrées ; plafonner longueurs (`nom`, `message`, etc.).
- Éviter `innerHTML` avec données utilisateur ; préférer `textContent` ou escape.
- Headers : `helmet` (CSP adaptée au site statique + admin).

## Supabase / RLS

- Tables sensibles (`users`, `requests`, `visits`) : RLS deny-by-default pour `anon` / `authenticated` sauf politiques explicites.
- Lecture publique limitée (ex. `annonces`, `reviews` où `approuve = true`).
- Inserts publics uniquement via backend ou politiques très strictes + pas de lecture croisée.
- Après rotation de clé : vérifier qu’aucune ancienne clé n’apparaît dans `git log` / pages.

## Checklist avant merge

- [ ] `rg -n "service_role|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" --glob '!*.md'` sans secrets client
- [ ] Admin ne lit/écrit Supabase que via backend authentifié
- [ ] Pas de token statique / password default dans le code
- [ ] CORS + rate-limit + validation upload en place (ou ticket suivi explicite)
- [ ] Données user affichées sans XSS (`innerHTML` non raw)

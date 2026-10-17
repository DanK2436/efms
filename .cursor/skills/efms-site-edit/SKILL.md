---
name: efms-site-edit
description: >-
  Workflow pour modifier le site EFMS (statique HTML/CSS/JS + Express +
  admin). Utiliser pour toute évolution fonctionnelle, redesign, ou fix :
  ordre des lots, fichiers touchés, et renvoi vers efms-brand / efms-security.
---

# EFMS — Workflow d’édition du site

Avant de coder : lire `docs/PLAN-CORRECTION-EFMS.md`, puis selon le sujet :

| Besoin | Skill |
| --- | --- |
| Couleurs, typos, logo, hero, CSS | `efms-brand` |
| Auth, Supabase, secrets, API | `efms-security` |

## Carte du dépôt

```
index.html, pages/*.html, qr.html     # site public
assets/css/index.css                  # design system public
assets/js/index.js                    # tracking, formulaires, annonces
assets/brand/                         # logos officiels mint/noir
assets/images/                        # photos services / hero
admin/index.html + js/router.js + css # back-office SPA légère
backend/server.js                     # API Express + Supabase
docs/PLAN-CORRECTION-EFMS.md          # plan design + sécu
```

Stack : HTML/CSS/JS vanilla, Express, Supabase. Pas de React/Next.

## Ordre de travail (ne pas inverser)

1. **Secrets** — retirer clés du client ; configurer `.env` serveur (`efms-security`).
2. **Tokens marque** — `:root` CSS + polices + logo (`efms-brand`).
3. **API** — endpoints stables ; frontend pointe vers URL prod configurable.
4. **Admin** — cesser les appels PostgREST directs ; utiliser `/api/*` + Bearer.
5. **Pages** — hero, nav, footer, pages métier en cohérence marque.
6. **QA** — desktop/mobile + smoke login + formulaires.

## Conventions d’édition

- Préférer variables CSS aux hex hardcodés.
- Une source de vérité API : le backend ; le fallback Supabase navigateur est temporaire et doit disparaître.
- Conserver le SEO existant (meta, JSON-LD) sauf contradiction marque (nom légal, logo OG).
- FR pour contenus UI ; ne pas inventer d’adresse/téléphone non présents dans le HTML actuel.
- Après changement CSS global, vérifier aussi `admin/css/admin.css`.

## Tests manuels minimaux

1. Accueil charge sans erreur console liée aux fonts/CSS.
2. Navigation pages + mobile menu.
3. Formulaire contact : succès via API (pas localhost cassé).
4. Admin : login refusé sans credentials ; actions protégées 401 sans token.
5. Aucune clé JWT longue visible dans les sources servies au public.

## Livrable agent

- Commits clairs (séparer « security: … » et « design: … » si possible).
- Ne pas committer `.env` ni nouvelles clés.
- Si tu ne fais qu’une partie du plan, mettre à jour l’état dans `docs/PLAN-CORRECTION-EFMS.md` (cases / notes).

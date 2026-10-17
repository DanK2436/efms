# Plan de correction EFMS — Design & Sécurité

Source marque : guide de marque EFMS (logos mint/noir) · Analyse code : octobre 2026  
Assets référence : `assets/brand/logo-efms-centered.png`, `assets/brand/logo-efms-horizontal.png`  
Skills agents : `.cursor/skills/efms-brand`, `efms-security`, `efms-site-edit`

---

## 1. Synthèse

**Lots 0 et 1 appliqués** (oct 2026) : secrets retirés du client, admin via API JWT, tokens mint `#78F0A8` + Montserrat + logos brand.  
Reste **manuel** : rotation des clés Supabase (voir `docs/SECURITY-ROTATION.md`).  
Lots suivants : hash bcrypt complet / RLS audit (2), hardening CSP (5), allègement hero (partie design restante).

---

## 2. Écarts design (actuel → cible)

| Élément | Actuel | Cible marque |
| --- | --- | --- |
| Primaire | `#7ccf2b` | `#78F0A8` (mint) |
| Fond | `#0b0d0e` | `#000000` / surfaces proches |
| Display | Outfit | Montserrat ExtraBold / Bold |
| Corps | Inter | Montserrat Regular / Medium |
| Logo | JPEG rond (`logo_efms.jpeg`) | PNG hexagone + voiture + pulse |
| Tagline | peu présente | `ELECTRONICS FULL MULTI SERVICE` + `DIAGNOSTIC & CONTRÔLE AUTO` |
| Hero | badge + stats + particules | marque dominante, 1 titre, 1 phrase, 1 CTA, visuel plein cadre |
| Cartes / glow | nombreuses cartes + glow | cartes uniquement si interaction ; glow réduit |

### Phases design

1. **Tokens CSS** — remplacer `:root` dans `assets/css/index.css` et `admin/css/admin.css` (voir skill `efms-brand`).
2. **Typo** — Google Fonts Montserrat ; tracking élevé sur taglines ; uppercase marque.
3. **Logo** — remplacer favicon / header / OG image par assets brand ; version horizontale en nav, centrée si splash.
4. **Hero & pages** — alléger hero (moins de stats/overlays) ; harmoniser pages `services`, `about`, `contact`, `annonces`, `avis`.
5. **Admin UI** — aligner `--neon-green` et polices sur les mêmes tokens.
6. **QA visuelle** — desktop + mobile, contraste WCAG AA mint/noir.

---

## 3. Risques sécurité (par sévérité)

### Critique

| ID | Problème | Fichiers |
| --- | --- | --- |
| S1 | JWT **service_role** hardcodé dans le navigateur → bypass RLS, accès total DB/Storage | `assets/js/index.js`, `admin/js/router.js` |
| S2 | Auth admin = `localStorage.efms_logged_in === 'true'` (spoofable) | `admin/js/router.js` |
| S3 | Login admin via filtre URL `password=eq.…` + clé service | `admin/js/router.js` |
| S4 | Mots de passe stockés / comparés en clair dans Supabase | `backend/server.js`, table `users` |

### Élevé

| ID | Problème |
| --- | --- |
| S5 | Token admin statique `efms-admin-secure-token-2026` |
| S6 | Mot de passe admin par défaut `monmotdepasseadmin` |
| S7 | CORS ouvert `cors()` sans origine restreinte |
| S8 | Upload multer sans limite type/taille |
| S9 | `innerHTML` avec données utilisateur (XSS potentiel) |

### Moyen

| ID | Problème |
| --- | --- |
| S10 | Frontend appelle `http://localhost:3000` (prod cassée / mixed content) |
| S11 | Pas de rate-limit sur contact / avis / login |
| S12 | Pas de headers sécurité (CSP, HSTS, etc.) |
| S13 | Fallback direct Supabase depuis le navigateur |

### Phases sécurité (ordre strict)

1. **Révoquer** immédiatement la clé service_role compromise dans le dashboard Supabase ; en générer une nouvelle **uniquement** côté serveur (`.env`).
2. **Retirer toute clé** des fichiers HTML/JS publics ; ne garder éventuellement que la clé **anon** + RLS strictes.
3. **Auth réelle** : bcrypt + JWT/session signée (ou Supabase Auth) ; supprimer le flag localStorage comme preuve d’auth.
4. **Proxy API** : tout CRUD admin via `backend/server.js` ; admin n’appelle plus PostgREST directement.
5. **Durcir** : rate-limit, validation upload, sanitize sorties, CORS whitelist, helmet.
6. **Nettoyer** secrets du dépôt Git (rotation + historique si déjà poussé).

---

## 4. Plan d’exécution recommandé

| Ordre | Lot | Contenu | Skill | Statut |
| --- | --- | --- | --- | --- |
| 0 | Urgence sécu | Secrets hors client + API JWT + admin via backend | `efms-security` | **Fait** (rotation dashboard = manuel) |
| 1 | Tokens design | CSS mint, Montserrat, logos brand | `efms-brand` | **Fait** |
| 2 | Auth backend | bcrypt upgrade + `REJECT_PLAINTEXT_PASSWORDS` + hash script | `efms-security` | **Fait** |
| 3 | Admin refactor | router.js → API backend uniquement | `efms-site-edit` | **Fait** |
| 4 | Pages publiques | hero brand-first + taglines footer | `efms-brand` | **Fait** |
| 5 | Hardening | helmet + CSP meta + rate-limit + upload | `efms-security` | **Fait** |
| 6 | QA | smoke `/api/health` + scan secrets client | `efms-site-edit` | **Fait** |

Rotation manuelle des clés : `docs/SECURITY-ROTATION.md`.

---

## 5. Critères de done

- [x] Aucune clé `service_role` / secret dans le bundle client actuel
- [x] Admin accessible seulement avec JWT signé (`JWT_SECRET`)
- [x] Variables CSS = tokens marque ; logo brand en header
- [x] Formulaires publics → API backend (`meta efms-api-base`)
- [ ] Rotation clés dans le dashboard Supabase (manuel)
- [ ] Checklist skill `efms-security` 100 % (CSP / historique Git)

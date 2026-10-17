---
name: efms-brand
description: >-
  Applique le guide de marque EFMS (couleurs mint/noir, typo Montserrat,
  logos hexagone) lors de toute modification UI/CSS/HTML du site
  efms-kolwezi. À lire avant de toucher assets/css, pages, header, hero ou admin UI.
paths:
  - "assets/css/**"
  - "assets/brand/**"
  - "admin/css/**"
  - "index.html"
  - "pages/**"
  - "qr.html"
  - "docs/brand/**"
---

# EFMS — Guide de marque (application UI)

Références visuelles : `assets/brand/logo-efms-centered.png`, `assets/brand/logo-efms-horizontal.png`.  
Plan global : `docs/PLAN-CORRECTION-EFMS.md`.

## Tokens obligatoires

Utiliser uniquement ces variables (ou les mapper depuis l’existant) :

```css
:root {
  --brand-mint: #78F0A8;
  --brand-mint-dim: #70E098;
  --brand-mint-glow: rgba(120, 240, 168, 0.18);
  --brand-black: #000000;
  --brand-surface: #0A0A0A;
  --brand-surface-2: #121212;
  --brand-border: rgba(120, 240, 168, 0.22);
  --brand-text: #F5F7F6;
  --brand-text-muted: #9AA3A0;
  --font-display: "Montserrat", sans-serif;
  --font-body: "Montserrat", sans-serif;
}
```

Mapper l’ancien système :

| Ancien | Nouveau |
| --- | --- |
| `--primary: #7ccf2b` | `--brand-mint` / `--primary: #78F0A8` |
| `--primary-dark: #5fa31f` | `--brand-mint-dim` |
| `--dark: #0b0d0e` | `--brand-black` ou `--brand-surface` |
| `--neon-green` (admin) | même mint `#78F0A8` |
| `Outfit` / `Inter` | `Montserrat` (700–900 display, 400–500 body) |

Ne pas introduire de violet, cream `#F4F1EA`, terracotta, ni stacks Inter/Roboto/Arial/system comme polices principales.

## Typographie

- Marque / titres : Montserrat Bold ou ExtraBold, `uppercase` pour sigle **EFMS**.
- Taglines : Regular/Medium, `letter-spacing: 0.2em–0.35em`, uppercase :
  - `ELECTRONICS FULL MULTI SERVICE`
  - `DIAGNOSTIC & CONTRÔLE AUTO`
- Corps : Montserrat 400/500, line-height ~1.6–1.7.
- Charger via Google Fonts : `Montserrat:wght@400;500;600;700;800;900`.

## Logo & iconographie

- Forme : hexagone + silhouette voiture + ligne pulse (ECG).
- Couleur logo : mint sur fond noir uniquement (pas de fond blanc sauf documents print).
- Header : préférer `logo-efms-horizontal.png` (pas de `border-radius: 50%` sur le logo marque).
- Favicon / OG : version centrée ou export carré mint/noir.
- Remplacer progressivement `assets/images/logo_efms.jpeg` quand le branding est appliqué.

## Layout & composants

- Thème **dark-first** (fond noir / quasi-noir).
- Accent mint pour CTA, liens actifs, focus, icônes clés.
- Hero landing : une composition — marque, 1 headline, 1 phrase, 1 groupe CTA, 1 visuel plein cadre. Pas de bandeau de stats / badges flottants / pastilles promo dans le premier viewport.
- Cartes : uniquement si conteneur d’interaction ; pas de cartes décoratives dans le hero.
- Glow / ombres multi-couches : usage minimal (accent focus ou hover léger).
- Motion : 2–3 animations intentionnelles max (reveal, hover CTA, pulse logo) — pas de particules décoratives excessives.

## Fichiers à synchroniser

Quand tu changes les tokens, mets à jour **tous** :

1. `assets/css/index.css` (`:root` + hardcodes `rgba(124, 207, 43, …)`)
2. `admin/css/admin.css`
3. SVG / inline styles avec `#7ccf2b` (`pages/about.html`, etc.)
4. Textes d’attente admin (`#7ccf2b` dans `admin/index.html`)

## Checklist avant de terminer une tâche UI

- [ ] Aucun `#7ccf2b` / `124, 207, 43` restant (sauf commentaire de migration temporaire)
- [ ] Polices = Montserrat
- [ ] Logo header conforme (pas de JPEG rond si l’asset brand est disponible)
- [ ] Contraste mint sur noir lisible pour textes UI
- [ ] Mobile : nav + hero OK sans overflow

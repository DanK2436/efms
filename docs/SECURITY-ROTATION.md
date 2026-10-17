# Rotation clés Supabase (Lot 0 — action manuelle)

Les anciennes clés (`service_role` / `anon`) ont été **retirées du code client**. Elles restent potentiellement dans l’historique Git et ont pu être exposées publiquement.

**État actuel :** le projet Supabase est de nouveau joignable ; le login admin fonctionne et le mot de passe a été migré en **bcrypt**. La clé `service_role` locale est **encore l’ancienne clé exposée** — à régénérer dès que possible dans le dashboard, puis à coller dans `backend/.env` (PC + hébergement).

## À faire dans le dashboard Supabase

1. **Project Settings → API** : révoquer / régénérer la clé **service_role**.
2. Régénérer aussi la clé **anon** (exposée auparavant dans le HTML).
3. Activer / vérifier les **RLS** sur `users`, `requests`, `visits`, `reviews`, `annonces`.
4. Mettre la nouvelle `service_role` uniquement dans `backend/.env` (`SUPABASE_KEY`), jamais dans le front.
5. Définir `JWT_SECRET` (≥ 32 caractères aléatoires) dans `backend/.env`.

## Déploiement API

Configurer sur le site :

```html
<meta name="efms-api-base" content="https://VOTRE-API">
```

ou reverse-proxy `/api` vers le backend Express.

## Mots de passe admin (bcrypt)

```bash
cd backend
node scripts/hash-password.js "MotDePasseFort!"
# Copier le hash dans Supabase : UPDATE users SET password = '$2b$...' WHERE email = '...';
```

Quand tous les comptes sont hashés, passer `REJECT_PLAINTEXT_PASSWORDS=1` dans `.env`.


## PC local

Les clés sur ta machine (`D:\\Sites_web\\Efms`) : voir `docs/SETUP-WINDOWS.md`.

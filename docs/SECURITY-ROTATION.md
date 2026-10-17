# Rotation clés Supabase (Lot 0 — action manuelle)

Les anciennes clés (`service_role` / `anon`) ont été **retirées du code client**. Elles restent potentiellement dans l’historique Git et ont pu être exposées publiquement.

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

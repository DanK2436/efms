# EFMS — Electronics Full Multi Service

Site vitrine + API Express + admin pour EFMS Kolwezi (diagnostic & électronique automobile).

## Stack

- Front : HTML / CSS / JS (`index.html`, `pages/`, `assets/`)
- Admin : `admin/`
- API : `backend/` (Express + Supabase)

## Démarrage rapide (Windows)

Voir **[docs/SETUP-WINDOWS.md](docs/SETUP-WINDOWS.md)** si ton clone est sous `D:\Sites_web\Efms`.

```powershell
cd backend
copy .env.example .env   # puis coller SUPABASE_KEY + JWT_SECRET
npm install
npm start
```

Ne jamais committer `backend/.env`.

## Docs

- [Plan correction design/sécu](docs/PLAN-CORRECTION-EFMS.md)
- [Rotation clés Supabase](docs/SECURITY-ROTATION.md)
- [Setup Windows](docs/SETUP-WINDOWS.md)
- Skills agents : `.cursor/skills/efms-*`

## Marque

Tokens : mint `#78F0A8` / noir — logos dans `assets/brand/`.

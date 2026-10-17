# Configuration depuis le PC local (`D:\Sites_web\Efms`)

Cet agent cloud **ne peut pas lire** `D:\Sites_web\Efms`. Les secrets restent sur ta machine.

## 1. Copier le `.env` backend (sur ton PC)

Dans PowerShell :

```powershell
cd D:\Sites_web\Efms
# Si un .env existe déjà à la racine ou dans backend :
Get-ChildItem -Recurse -Filter ".env" -ErrorAction SilentlyContinue |
  Select-Object FullName

# Créer backend\.env à partir de tes clés (exemple) :
@"
PORT=3000
SUPABASE_URL=https://fgjbcvczxrzkffeqfndk.supabase.co
SUPABASE_KEY=COLLER_ICI_LA_SERVICE_ROLE_REGENEREE
JWT_SECRET=COLLER_ICI_32_CARACTERES_ALEATOIRES_MINIMUM
JWT_EXPIRES_IN=8h
CORS_ORIGINS=https://efms-kolwezi.com,http://localhost:5500,http://127.0.0.1:5500
REJECT_PLAINTEXT_PASSWORDS=0
"@ | Set-Content -Encoding utf8 backend\.env
```

**Important :**

- Utilise une clé **service_role régénérée** (l’ancienne a fuité dans le repo).
- Ne committe jamais `backend\.env` (déjà dans `.gitignore`).
- `JWT_SECRET` : génère avec `[Convert]::ToBase64String((1..48|%{Get-Random -Max 256}) -as [byte[]])`.

## 2. Lancer l’API en local

```powershell
cd D:\Sites_web\Efms\backend
npm install
npm start
```

Smoke test : ouvrir `http://localhost:3000/api/health` → `{"ok":true,...}`.

## 3. Site statique

Ouvre `index.html` (Live Server / autre). Sur localhost, `assets/js/config.js` pointe déjà vers `http://localhost:3000`.

En production, mets :

```html
<meta name="efms-api-base" content="https://URL-DE-TON-API">
```

## 4. Mettre à jour GitHub depuis le PC

```powershell
cd D:\Sites_web\Efms
git fetch origin
git checkout cursor/efms-brand-security-plan-d79e
git pull origin cursor/efms-brand-security-plan-d79e
# Vérifier que backend\.env n'est PAS listé :
git status
```

PR : https://github.com/DanK2436/efms/pull/1

## 5. Hasher le mot de passe admin

```powershell
cd D:\Sites_web\Efms\backend
node scripts\hash-password.js "TonMotDePasse"
# Coller le hash dans Supabase SQL Editor (UPDATE users ...)
```

Puis `REJECT_PLAINTEXT_PASSWORDS=1` dans `.env`.

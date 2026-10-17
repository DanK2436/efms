# Run on Windows at D:\Sites_web\Efms (or your clone path).
# Does NOT print secrets. Creates backend\.env if missing.

$Root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $Root "backend"))) {
  $Root = Get-Location
}

$EnvPath = Join-Path $Root "backend\.env"
$Example = Join-Path $Root "backend\.env.example"

if (Test-Path $EnvPath) {
  Write-Host "OK: backend\.env existe deja — rien n'a ete ecrase."
  exit 0
}

if (-not (Test-Path $Example)) {
  Write-Error "backend\.env.example introuvable."
  exit 1
}

Copy-Item $Example $EnvPath
Write-Host "Cree: $EnvPath"
Write-Host "Edite ce fichier et colle SUPABASE_KEY (service_role regenerée) + JWT_SECRET."
Write-Host "Ne committe JAMAIS ce fichier."

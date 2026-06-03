# nexoCRMVendas - Start no HOST (postgres+redis+minio no Docker + backend no PM2)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

Write-Host "[1/5] Subindo postgres + redis + minio (loopback)..." -ForegroundColor Cyan
docker compose -f docker-compose.yml -f docker-compose.host.yml up -d postgres redis minio
if ($LASTEXITCODE -ne 0) { throw "falha ao subir banco/storage" }

Write-Host "[2/5] Aguardando postgres (127.0.0.1:5435)..." -ForegroundColor Cyan
$ok = $false
for ($i = 0; $i -lt 30; $i++) { if ((Test-NetConnection 127.0.0.1 -Port 5435 -WarningAction SilentlyContinue).TcpTestSucceeded) { $ok = $true; break }; Start-Sleep 1 }
if (-not $ok) { throw "postgres nao respondeu em 5435" }
Write-Host "   postgres OK." -ForegroundColor Green

Write-Host "[3/5] Copiando uploads do volume p/ o host (1a vez)..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force "$root\backend\uploads" | Out-Null
docker cp crmvendas-backend-1:/app/uploads/. "$root\backend\uploads\" 2>$null
Write-Host "   uploads: $((Get-ChildItem "$root\backend\uploads" -ErrorAction SilentlyContinue).Count) item(s)" -ForegroundColor DarkGray

Write-Host "[4/5] Removendo containers de APP do crmvendas (backend/frontend/admin/nginx)..." -ForegroundColor Cyan
foreach ($c in 'crmvendas-backend-1','crmvendas-frontend-1','crmvendas-admin-1','crmvendas-nginx-1') { try { docker rm -f $c 2>$null | Out-Null } catch {} }
Write-Host "   (postgres/redis/minio mantidos; outros projetos intactos)" -ForegroundColor DarkGray

Write-Host "[5/5] Subindo/recarregando backend no PM2..." -ForegroundColor Cyan
pm2 startOrReload ecosystem.config.js
if ($LASTEXITCODE -ne 0) { throw "pm2 startOrReload falhou" }
pm2 save | Out-Null
pm2 status | Select-String "crmvendas-backend"
Write-Host "Pronto. backend 3001 -> sales-api.oxlify.com" -ForegroundColor Green

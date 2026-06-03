# nexoCRMVendas - instala deps (Bun) e builda o backend para o host (PM2)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
function Run($n, $b) { Write-Host "==== $n ====" -ForegroundColor Cyan; & $b; if ($LASTEXITCODE -ne 0) { throw "$n FALHOU ($LASTEXITCODE)" } }

Push-Location "$root\backend"
Run "backend: bun install" { bun install }
Run "backend: build" { bun run build }
Pop-Location
Write-Host "BUILD-HOST (nexoCRMVendas) OK" -ForegroundColor Green

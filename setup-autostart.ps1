# nexoCRMVendas - Auto-start no boot (RODAR UMA VEZ COMO ADMINISTRADOR)
# Reserva a porta 3001 e garante a tarefa compartilhada 'SysBPO-PM2-Resurrect'.
# Rode com o backend PARADO (pm2 stop crmvendas-backend).
$ErrorActionPreference = "Stop"
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) { Write-Host "Rode COMO ADMINISTRADOR." -ForegroundColor Red; return }

$p = 3001
$ja = (netsh int ipv4 show excludedportrange protocol=tcp | Select-String ("^\s*{0}\s+{0}\b" -f $p))
if ($ja) { Write-Host "porta $p ja reservada (ok)." -ForegroundColor DarkGray }
else { netsh int ipv4 add excludedportrange protocol=tcp startport=$p numberofports=1 store=persistent | Out-Null; Write-Host "porta $p reservada." -ForegroundColor Green }

if (-not (Get-ScheduledTask -TaskName "SysBPO-PM2-Resurrect" -ErrorAction SilentlyContinue)) {
  $pm2Cmd = Join-Path $env:APPDATA "npm\pm2.cmd"
  $action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c timeout /t 25 /nobreak >nul & `"$pm2Cmd`" resurrect"
  $trigger = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
  $principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
  $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 0)
  Register-ScheduledTask -TaskName "SysBPO-PM2-Resurrect" -Action $action -Trigger $trigger -Principal $principal -Settings $settings | Out-Null
  Write-Host "tarefa de auto-start criada." -ForegroundColor Green
} else { Write-Host "tarefa 'SysBPO-PM2-Resurrect' ja existe (compartilhada)." -ForegroundColor DarkGray }

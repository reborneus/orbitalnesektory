@echo off
rem ================================================================
rem  Orbitalne Sektory - spustac pre Windows
rem  Stiahne aktualny spustaci panel z GitHubu a otvori ho.
rem  Staci mat tento jeden subor (napr. na ploche) a dvakrat nan kliknut.
rem ================================================================
set "OS_DIR=%LOCALAPPDATA%\OrbitalneSektory"
if not exist "%OS_DIR%" mkdir "%OS_DIR%"
powershell -NoProfile -ExecutionPolicy Bypass -Command "try{[Net.ServicePointManager]::SecurityProtocol='Tls12';$ProgressPreference='SilentlyContinue';$u='https://raw.githubusercontent.com/reborneus/orbitalnesektory/main/launcher/spustac.ps1?t='+[DateTime]::UtcNow.Ticks;Invoke-WebRequest $u -OutFile (Join-Path $env:LOCALAPPDATA 'OrbitalneSektory\spustac.ps1') -UseBasicParsing -TimeoutSec 15}catch{}"
if not exist "%OS_DIR%\spustac.ps1" (
  echo Spustaci panel sa nepodarilo stiahnut. Skontroluj pripojenie na internet a skus znova.
  pause
  exit /b 1
)
start "" powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%OS_DIR%\spustac.ps1"

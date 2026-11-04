# =====================================================================
#  STARÝ NÁZOV spúšťacieho panela (do verzie 0.8.0) – ponechaný kvôli kompatibilite.
#  Starší súbor Orbitalne-Sektory.bat sťahuje práve tento súbor. Ten len stiahne nový panel
#  launcher/windows/spustac-windows.ps1 aj nový spúšťač Orbitalne-Sektory-Windows.bat a spustí ich.
#  Nový panel potom pri vytvorení odkazu na ploche už použije nový spúšťač.
# =====================================================================
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}
$ProgressPreference = 'SilentlyContinue'
$Root = Join-Path $env:LOCALAPPDATA 'OrbitalneSektory'
$Raw  = 'https://raw.githubusercontent.com/reborneus/orbitalnesektory/main/launcher/windows'
New-Item -ItemType Directory -Force -Path $Root | Out-Null
foreach ($f in 'spustac-windows.ps1','Orbitalne-Sektory-Windows.bat') {
  try { Invoke-WebRequest -Uri ("$Raw/$f" + '?t=' + [DateTime]::UtcNow.Ticks) -OutFile (Join-Path $Root $f) -UseBasicParsing -TimeoutSec 15 } catch {} }
$new = Join-Path $Root 'spustac-windows.ps1'
if (Test-Path $new) { & $new }

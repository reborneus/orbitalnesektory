# =====================================================================
#  ORBITÁLNE SEKTORY – spúšťací panel pre Windows
#  Skontroluje verziu hry na GitHube, v prípade potreby stiahne najnovšiu
#  a spustí hru v samostatnom okne prehliadača (Edge alebo Chrome).
#
#  Kde sú súbory:   %LOCALAPPDATA%\OrbitalneSektory\
#     hra\           stiahnutá hra (predvolené miesto; v paneli sa dá zvoliť iný priečinok)
#     profil\        profil prehliadača hry – tu sú ULOŽENÉ HRY, aktualizácia ani zmena priečinka ich nemaže
#     icon.ico        ikona hry pre okno panela a odkaz na ploche
#     nastavenia.json nastavenia panela (vrátane zvoleného priečinka hry)
#     verzie\<verzia>\ staršie verzie hry na porovnanie (výber „Verzia hry“), každá má vlastný profil profil-<verzia>\
#  Spúšťa sa súborom Orbitalne-Sektory-Windows.bat (stiahne vždy aktuálnu verziu tohto panela).
#  Verzia pre Mac je v launcher/mac/ (spustac-mac.sh).
# =====================================================================
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}
$ProgressPreference = 'SilentlyContinue'   # rýchlejšie sťahovanie v PowerShell 5
# v0.23: skryje prázdne okno PowerShellu (ak panel nespustil skrytý spúšťač .vbs) a umožní tmavý titulok okna (Windows 10/11)
$osSig = @'
[DllImport("kernel32.dll")] public static extern System.IntPtr GetConsoleWindow();
[DllImport("user32.dll")] public static extern bool ShowWindow(System.IntPtr h, int n);
[DllImport("dwmapi.dll")] public static extern int DwmSetWindowAttribute(System.IntPtr h, int a, ref int v, int s);
'@
try { Add-Type -Name Win -Namespace OsLauncher -MemberDefinition $osSig } catch {}
try { $cw = [OsLauncher.Win]::GetConsoleWindow(); if ($cw -ne [IntPtr]::Zero) { [void][OsLauncher.Win]::ShowWindow($cw, 0) } } catch {}

# --- nastavenie repozitára a priečinkov ---
$Repo       = 'reborneus/orbitalnesektory'
$Branch     = 'main'
$Root       = Join-Path $env:LOCALAPPDATA 'OrbitalneSektory'
$DefaultDir = Join-Path $Root 'hra'
$ProfileDir = Join-Path $Root 'profil'
$IconFile   = Join-Path $Root 'icon.ico'
$CfgFile    = Join-Path $Root 'nastavenia.json'
$RawBase    = "https://raw.githubusercontent.com/$Repo/$Branch"
$ZipUrl     = "https://github.com/$Repo/archive/refs/heads/$Branch.zip"
$ApiBase    = "https://api.github.com/repos/$Repo"
# Pozn.: raw.githubusercontent.com drží súbory z vetvy main v cache ~5 minút (aj s ?t=…), preto panel najprv zistí cez GitHub API
# posledný commit a súbory číta podľa jeho SHA – taká adresa sa nikdy „nezasekne“ na starej verzii.
New-Item -ItemType Directory -Force -Path $Root | Out-Null

# --- nastavenia panela (automatická aktualizácia, celá obrazovka) ---
$Cfg = [pscustomobject]@{ autoUpdate = $true; fullscreen = $false; keepOpen = $false; gameDir = $DefaultDir }
if (Test-Path $CfgFile) { try { $c = Get-Content $CfgFile -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($null -ne $c.autoUpdate) { $Cfg.autoUpdate = [bool]$c.autoUpdate }; if ($null -ne $c.fullscreen) { $Cfg.fullscreen = [bool]$c.fullscreen }; if ($null -ne $c.keepOpen) { $Cfg.keepOpen = [bool]$c.keepOpen }
  if ($c.gameDir) { $Cfg.gameDir = [string]$c.gameDir } } catch {} }
$GameDir = $Cfg.gameDir
# priečinok patrí hre, ak obsahuje index.html a version.json (inak ho panel nikdy nezmaže)
function Test-GameDir($d) { return (Test-Path (Join-Path $d 'index.html')) -and (Test-Path (Join-Path $d 'version.json')) }
function Save-Cfg { $Cfg | ConvertTo-Json | Set-Content -Path $CfgFile -Encoding UTF8 }

# --- verzie: lokálna zo stiahnutej hry, najnovšia z version.json na GitHube ---
function Get-LocalVersion {
  $f = Join-Path $GameDir 'version.json'
  if (Test-Path $f) { try { return (Get-Content $f -Raw -Encoding UTF8 | ConvertFrom-Json) } catch {} }
  return $null
}
function Get-Json($url) {
  # (User-Agent sa vo Windows PowerShell 5.1 nesmie dať do -Headers, preto -UserAgent)
  $h = @{ 'Cache-Control' = 'no-cache'; 'Pragma' = 'no-cache' }
  $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 12 -Headers $h -UserAgent 'OrbitalneSektory-Launcher'
  return ([Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()) | ConvertFrom-Json)
}
# SHA posledného commitu vetvy (GitHub API); ak API nejde (limit 60 dopytov/h), použije sa adresa vetvy
$script:headSha = $null
function Raw-Now { if ($script:headSha) { return "https://raw.githubusercontent.com/$Repo/$($script:headSha)" }; return $RawBase }
function Get-RemoteVersion {
  $script:headSha = $null
  try { $script:headSha = [string](Get-Json "$ApiBase/commits/$Branch").sha } catch {}
  try { return (Get-Json ("$(Raw-Now)/version.json?t=" + [DateTime]::UtcNow.Ticks)) } catch { return $null }
}
# čas vydania (ISO 8601 z versions.json) → miestny čas „4. 11. 2026 o 20:41 (pred 6 min)“
function Format-Time($iso) {
  if (-not $iso) { return '' }
  try { $t = $(if ($iso -is [DateTime]) { $iso.ToLocalTime() } else { [DateTimeOffset]::Parse([string]$iso, [Globalization.CultureInfo]::InvariantCulture).LocalDateTime }) } catch { return '' }
  $m = [int]([DateTime]::Now - $t).TotalMinutes
  $ago = $(if ($m -lt 1) { 'práve teraz' } elseif ($m -lt 60) { "pred $m min" } elseif ($m -lt 1440) { 'pred ' + [int]($m / 60) + ' h' } else { 'pred ' + [int]($m / 1440) + ' d' })
  return $t.ToString('d. M. yyyy') + ' o ' + $t.ToString('HH:mm') + "  ($ago)"
}
function Short-Time($iso) { try { $t = $(if ($iso -is [DateTime]) { $iso.ToLocalTime() } else { [DateTimeOffset]::Parse([string]$iso, [Globalization.CultureInfo]::InvariantCulture).LocalDateTime }); return $t.ToString('d. M. HH:mm') } catch { return '' } }
function To-Ver($v) { try { return [version]$v.version } catch { return [version]'0.0' } }

# --- aktualizácia: stiahne zip repozitára a nahradí priečinok hra\ ---
function Update-Game { return (Install-Zip $ZipUrl $GameDir $true) }
# stiahne zip z $url a nainštaluje ho do $dest; $main = hlavná inštalácia (skopíruje aj ikonu a nový panel)
function Install-Zip($url, $dest, $main) {
  $tmp = Join-Path $env:TEMP ('orbitalne-' + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  try {
    $zip = Join-Path $tmp 'hra.zip'
    Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing -TimeoutSec 120
    Expand-Archive -Path $zip -DestinationPath $tmp -Force
    $src = Get-ChildItem -Path $tmp -Directory | Select-Object -First 1
    if (-not $src -or -not (Test-Path (Join-Path $src.FullName 'index.html'))) { throw 'V stiahnutom balíku chýba index.html.' }
    if (Test-Path $dest) {
      if (Test-GameDir $dest) { Remove-Item $dest -Recurse -Force }
      elseif ((Get-ChildItem $dest -Force | Measure-Object).Count -gt 0) { throw "Priečinok $dest nie je prázdny a nie je to priečinok hry. Vyber iný." }
      else { Remove-Item $dest -Force } }
    New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null
    Copy-Item -Path $src.FullName -Destination $dest -Recurse -Force
    if (-not $main) { return $true }
    $ico = Join-Path $GameDir 'assets\icon.ico'; if (Test-Path $ico) { Copy-Item $ico $IconFile -Force }
    # nová verzia panela a spúšťača sa použije pri ďalšom otvorení
    foreach ($f in 'spustac-windows.ps1','Orbitalne-Sektory-Windows.bat','Orbitalne-Sektory-Windows.vbs') { $p = Join-Path $GameDir "launcher\windows\$f"; if (Test-Path $p) { Copy-Item $p (Join-Path $Root $f) -Force } }
    return $true
  } finally { Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue }
}

# --- spustenie hry v okne prehliadača s vlastným profilom (uložené hry zostanú v profil\) ---
function Find-Browser {
  $c = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
         "$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
         "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe")
  foreach ($p in $c) { if ($p -and (Test-Path $p)) { return $p } }
  return $null
}
# --- staršie verzie na porovnanie (versions.json na GitHube) ---
$script:versions = @()
function Get-Versions { try { return @((Get-Json ("$(Raw-Now)/versions.json?t=" + [DateTime]::UtcNow.Ticks)).versions) } catch { return @() } }
# vybraná verzia: $null = najnovšia (hlavná inštalácia), inak objekt z versions.json
function Selected-Version { $i = $cmbVer.SelectedIndex; if ($i -le 0 -or $i -gt $script:versions.Count) { return $null }; return $script:versions[$i - 1] }
# priečinok a profil pre vybranú verziu; staršiu verziu stiahne, ak ešte nie je (vlastný profil = vlastné uložené hry)
function Prepare-Version {
  $v = Selected-Version; if (-not $v) { return @($GameDir, $ProfileDir) }
  $dir = Join-Path $Root ('verzie\' + $v.version)
  if (-not (Test-GameDir $dir)) { $lblLocal.Text = "Sťahujem verziu $($v.version)…"; [Windows.Forms.Application]::DoEvents()
    [void](Install-Zip "https://github.com/$Repo/archive/$($v.sha).zip" $dir $false) }
  return @($dir, (Join-Path $Root ('profil-' + $v.version))) }
function Start-Game($page = 'index.html') {
  $pv = Prepare-Version; $dir = $pv[0]; $prof = $pv[1]
  $idx = Join-Path $dir $page
  $url = ([Uri]$idx).AbsoluteUri
  $b = Find-Browser
  if (-not $b) { Start-Process $idx; return }
  $a = @("--app=$url", "--user-data-dir=`"$prof`"", '--no-first-run', '--no-default-browser-check', '--window-size=1440,900', '--ignore-gpu-blocklist', '--enable-gpu-rasterization')
  if ($Cfg.fullscreen) { $a += '--start-fullscreen' }
  Start-Process -FilePath $b -ArgumentList $a
}

# --- odkaz na ploche ---
function New-DesktopShortcut {
  $bat = Join-Path $Root 'Orbitalne-Sektory-Windows.bat'; $vbs = Join-Path $Root 'Orbitalne-Sektory-Windows.vbs'
  if (-not (Test-Path $bat) -and -not (Test-Path $vbs)) { throw 'Spúšťač ešte nie je stiahnutý. Najprv aktualizuj hru.' }
  $ws = New-Object -ComObject WScript.Shell
  $lnk = $ws.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Desktop')) 'Orbitálne Sektory.lnk'))
  # v0.23: odkaz spúšťa skrytý .vbs (žiadne okno konzoly); bez neho pôvodný .bat
  if (Test-Path $vbs) { $lnk.TargetPath = Join-Path $env:WINDIR 'System32\wscript.exe'; $lnk.Arguments = "`"$vbs`"" } else { $lnk.TargetPath = $bat; $lnk.WindowStyle = 7 }
  $lnk.WorkingDirectory = $Root
  if (Test-Path $IconFile) { $lnk.IconLocation = "$IconFile,0" } else { $b = Find-Browser; if ($b) { $lnk.IconLocation = "$b,0" } }
  $lnk.Description = 'Orbitálne Sektory – spúšťací panel'
  $lnk.Save()
}

# ===================== okno panela (v0.23: tmavý moderný vzhľad ako menu v hre) =====================
# Farby z hry: pozadie #070c16, karty #0e1726, okraje #1d2a3f, text #dde7f1, tlmený #8597ab, akcent #58d0c0
$bg = [Drawing.Color]::FromArgb(7,12,22); $panel = [Drawing.Color]::FromArgb(14,23,38); $line = [Drawing.Color]::FromArgb(29,42,63)
$fg = [Drawing.Color]::FromArgb(221,231,241); $muted = [Drawing.Color]::FromArgb(133,151,171)
$accent = [Drawing.Color]::FromArgb(88,208,192); $warn = [Drawing.Color]::FromArgb(255,123,107)
$btnBg = [Drawing.Color]::FromArgb(19,34,56); $btnHover = [Drawing.Color]::FromArgb(27,48,78)
$fontName = $(if ((New-Object Drawing.Text.InstalledFontCollection).Families.Name -contains 'Segoe UI Variable Display') { 'Segoe UI Variable Display' } else { 'Segoe UI' })
$font = New-Object Drawing.Font($fontName, 10)

$form = New-Object Windows.Forms.Form
$form.Text = 'Orbitálne Sektory'; $form.ClientSize = New-Object Drawing.Size(600, 668)
$form.StartPosition = 'CenterScreen'; $form.FormBorderStyle = 'FixedSingle'; $form.MaximizeBox = $false
$form.BackColor = $bg; $form.ForeColor = $fg; $form.Font = $font
if (Test-Path $IconFile) { try { $form.Icon = New-Object Drawing.Icon($IconFile) } catch {} }
# tmavý titulok okna (Windows 10 1809+ / 11)
$form.Add_HandleCreated({ try { $v = 1; [void][OsLauncher.Win]::DwmSetWindowAttribute($form.Handle, 20, [ref]$v, 4) } catch {} })

# zaoblený obrys prvku (Region) a rovnaká cesta na kreslenie rámika
function Round-Path($w, $h, $r) { $p = New-Object Drawing.Drawing2D.GraphicsPath; $d = $r * 2
  $p.AddArc(0, 0, $d, $d, 180, 90); $p.AddArc($w - $d - 1, 0, $d, $d, 270, 90); $p.AddArc($w - $d - 1, $h - $d - 1, $d, $d, 0, 90); $p.AddArc(0, $h - $d - 1, $d, $d, 90, 90); $p.CloseFigure(); return $p }
function Set-Round($c, $r) { $c.Region = New-Object Drawing.Region((Round-Path ($c.Width + 1) ($c.Height + 1) $r)) }
function New-Label($text, $x, $y, $w, $h, $size = 10, $style = 'Regular', $color = $fg, $parent = $form) {
  $l = New-Object Windows.Forms.Label; $l.Text = $text; $l.Location = New-Object Drawing.Point($x, $y); $l.Size = New-Object Drawing.Size($w, $h)
  $l.Font = New-Object Drawing.Font($fontName, $size, [Drawing.FontStyle]$style); $l.ForeColor = $color; $l.BackColor = [Drawing.Color]::Transparent
  $parent.Controls.Add($l); return $l
}
# karta = zaoblený panel s jemným rámikom a nadpisom (ako .card v hre)
function New-Card($x, $y, $w, $h, $title) {
  $p = New-Object Windows.Forms.Panel; $p.Location = New-Object Drawing.Point($x, $y); $p.Size = New-Object Drawing.Size($w, $h); $p.BackColor = $panel
  $form.Controls.Add($p); Set-Round $p 14
  $p.Add_Paint({ $g = $_.Graphics; $g.SmoothingMode = 'AntiAlias'; $pen = New-Object Drawing.Pen($line, 1.2); $g.DrawPath($pen, (Round-Path $this.Width $this.Height 14)); $pen.Dispose() })
  if ($title) { [void](New-Label $title.ToUpper() 18 12 ($w - 36) 18 8.5 'Bold' $muted $p) }
  return $p
}
# tlačidlo: ploché, zaoblené, so zvýraznením pod myšou; 'primary' = veľké tyrkysové ŠTART
function New-Button($text, $x, $y, $w, $h, $primary = $false, $parent = $form) {
  $b = New-Object Windows.Forms.Button; $b.Text = $text; $b.Location = New-Object Drawing.Point($x, $y); $b.Size = New-Object Drawing.Size($w, $h)
  $b.FlatStyle = 'Flat'; $b.FlatAppearance.BorderSize = 0; $b.Cursor = 'Hand'; $b.UseVisualStyleBackColor = $false
  if ($primary) { $b.BackColor = $accent; $b.ForeColor = [Drawing.Color]::FromArgb(4,20,18); $b.Font = New-Object Drawing.Font($fontName, 14, [Drawing.FontStyle]::Bold)
    $b.FlatAppearance.MouseOverBackColor = [Drawing.Color]::FromArgb(120,226,212); $b.FlatAppearance.MouseDownBackColor = [Drawing.Color]::FromArgb(70,180,166) }
  else { $b.BackColor = $btnBg; $b.ForeColor = $fg; $b.Font = New-Object Drawing.Font($fontName, 10, [Drawing.FontStyle]::Bold)
    $b.FlatAppearance.MouseOverBackColor = $btnHover; $b.FlatAppearance.MouseDownBackColor = $line }
  $parent.Controls.Add($b); Set-Round $b 10; return $b
}
function New-Check($text, $x, $y, $w, $checked, $parent) {
  $c = New-Object Windows.Forms.CheckBox; $c.Text = $text; $c.Checked = $checked; $c.Location = New-Object Drawing.Point($x, $y); $c.Size = New-Object Drawing.Size($w, 24)
  $c.ForeColor = $fg; $c.FlatStyle = 'Flat'; $c.FlatAppearance.BorderColor = $line; $c.FlatAppearance.CheckedBackColor = [Drawing.Color]::FromArgb(20,60,58); $c.Cursor = 'Hand'
  $parent.Controls.Add($c); return $c
}

# hlavička: farebný prechod a tyrkysová linka (ako lišta v hre)
$head = New-Object Windows.Forms.Panel; $head.Location = New-Object Drawing.Point(0, 0); $head.Size = New-Object Drawing.Size(600, 92); $form.Controls.Add($head)
$head.Add_Paint({ $g = $_.Graphics; $r = New-Object Drawing.Rectangle(0, 0, $this.Width, $this.Height)
  $br = New-Object Drawing.Drawing2D.LinearGradientBrush($r, [Drawing.Color]::FromArgb(16,38,52), $bg, [single]0); $g.FillRectangle($br, $r); $br.Dispose()
  $pen = New-Object Drawing.Pen($accent, 2); $g.DrawLine($pen, 24, $this.Height - 2, 180, $this.Height - 2); $pen.Dispose() })
$t1 = New-Label 'ORBITÁLNE SEKTORY' 24 16 520 36 20 'Bold' $fg $head
$t2 = New-Label 'Vesmírna 2.5D sandbox hra · testovacie verzie z GitHubu' 26 54 520 22 9.5 'Regular' $muted $head

# karta: verzie a novinky
$cardV = New-Card 20 106 560 214 'Verzia hry'
$lblLocal  = New-Label 'Nainštalovaná verzia: –' 18 36 524 22 10 'Regular' $fg $cardV
$lblRemote = New-Label 'Najnovšia verzia: zisťujem…' 18 60 524 22 10 'Bold' $accent $cardV
$txtNotes = New-Object Windows.Forms.TextBox
$txtNotes.Multiline = $true; $txtNotes.ReadOnly = $true; $txtNotes.ScrollBars = 'Vertical'; $txtNotes.BorderStyle = 'None'
$txtNotes.Location = New-Object Drawing.Point(18, 92); $txtNotes.Size = New-Object Drawing.Size(524, 106)
$txtNotes.BackColor = $panel; $txtNotes.ForeColor = [Drawing.Color]::FromArgb(190,203,218); $txtNotes.Font = New-Object Drawing.Font($fontName, 9.5); $cardV.Controls.Add($txtNotes)

# karta: nastavenia (priečinok, prepínače, výber verzie)
$cardS = New-Card 20 332 560 202 'Nastavenia'
$txtDir = New-Object Windows.Forms.TextBox; $txtDir.ReadOnly = $true; $txtDir.BorderStyle = 'FixedSingle'; $txtDir.Text = $GameDir
$txtDir.Location = New-Object Drawing.Point(18, 40); $txtDir.Size = New-Object Drawing.Size(410, 26); $txtDir.BackColor = $bg; $txtDir.ForeColor = $fg; $cardS.Controls.Add($txtDir)
$btnDir = New-Button 'Zmeniť…' 436 37 106 30 $false $cardS
$chkAuto = New-Check 'Pri otvorení automaticky stiahnuť novú verziu' 18 76 330 $Cfg.autoUpdate $cardS
$chkFull = New-Check 'Celá obrazovka' 366 76 176 $Cfg.fullscreen $cardS
$chkKeep = New-Check 'Po spustení hry nechať panel otvorený' 18 104 330 $Cfg.keepOpen $cardS
[void](New-Label 'Verzia' 18 146 70 20 9 'Bold' $muted $cardS)
$cmbVer = New-Object Windows.Forms.ComboBox; $cmbVer.DropDownStyle = 'DropDownList'; $cmbVer.FlatStyle = 'Flat'
$cmbVer.Location = New-Object Drawing.Point(90, 142); $cmbVer.Size = New-Object Drawing.Size(452, 26); $cmbVer.BackColor = $bg; $cmbVer.ForeColor = $fg
[void]$cmbVer.Items.Add('Najnovšia (hlavná inštalácia)'); $cmbVer.SelectedIndex = 0; $cardS.Controls.Add($cmbVer)

# riadok tlačidiel a ŠTART
$btnCheck  = New-Button 'Skontrolovať' 20 548 132 40
$btnUpdate = New-Button 'Aktualizovať' 162 548 136 40
$btnWiki   = New-Button 'Príručka' 308 548 120 40
$btnLink   = New-Button 'Odkaz na ploche' 438 548 142 40
$btnStart  = New-Button 'ŠTART' 20 600 560 54 $true

$script:remote = $null
function Refresh-Ui {
  $loc = Get-LocalVersion
  $lblLocal.Text = 'Nainštalovaná verzia: ' + $(if ($loc) { "$($loc.version)  ($($loc.date))" } else { 'žiadna' })
  if ($script:remote) {
    # čas zverejnenia: z versions.json (presný čas commitu vydania)
    $rv = $script:versions | Where-Object { $_.version -eq $script:remote.version } | Select-Object -First 1
    $when = $(if ($rv -and $rv.time) { Format-Time $rv.time } else { $script:remote.date })
    $lblRemote.Text = "Najnovšia verzia: $($script:remote.version)  ·  zverejnená $when"
    $txtNotes.Text = (($script:remote.notes | ForEach-Object { '• ' + $_ }) -join "`r`n")
  }
  $newer = $script:remote -and (-not $loc -or (To-Ver $script:remote) -gt (To-Ver $loc))
  $btnUpdate.Enabled = [bool]$script:remote
  $btnUpdate.Text = $(if (-not $loc) { 'Stiahnuť hru' } elseif ($newer) { 'Aktualizovať' } else { 'Stiahnuť znova' })
  $btnStart.Enabled = [bool]$loc; $btnWiki.Enabled = [bool]$loc -and (Test-Path (Join-Path $GameDir 'wiki.html'))
  $txtDir.Text = $GameDir
  $sv = Selected-Version
  if ($sv) { $btnStart.Enabled = $true; $btnWiki.Enabled = $true; $btnStart.Text = "ŠTART  ·  stará verzia $($sv.version) (vlastné uložené hry)" }
  else { $btnStart.Text = $(if ($loc) { "ŠTART  ·  verzia $($loc.version)" } else { 'Najprv stiahni hru' }) }
  return $newer
}
function Check-Remote {
  $lblRemote.Text = 'Najnovšia verzia: zisťujem…'; [Windows.Forms.Application]::DoEvents()
  $script:remote = Get-RemoteVersion
  $script:versions = Get-Versions; $keep = $cmbVer.SelectedIndex
  while ($cmbVer.Items.Count -gt 1) { $cmbVer.Items.RemoveAt(1) }
  foreach ($v in $script:versions) { $d = $(if ($v.time) { Short-Time $v.time } else { $v.date }); [void]$cmbVer.Items.Add("$($v.version)  ($d)  –  $($v.title)") }
  $cmbVer.SelectedIndex = $(if ($keep -lt $cmbVer.Items.Count) { [Math]::Max(0, $keep) } else { 0 })
  if (-not $script:remote) { $lblRemote.Text = 'Najnovšia verzia: nedá sa zistiť (si offline alebo je repozitár súkromný)'; $lblRemote.ForeColor = $warn }
  elseif (-not (Get-LocalVersion)) { $txtNotes.Text = (($script:remote.notes | ForEach-Object { '• ' + $_ }) -join "`r`n") + "`r`n`r`nHra ešte nie je stiahnutá. Skontroluj priečinok hry (Zmeniť…) a klikni na Stiahnuť hru." }
  else { $lblRemote.ForeColor = $accent }
  return (Refresh-Ui)
}
function Do-Update {
  $form.Cursor = 'WaitCursor'; $btnUpdate.Enabled = $false; $btnStart.Enabled = $false
  $lblLocal.Text = 'Sťahujem a inštalujem hru…'; [Windows.Forms.Application]::DoEvents()
  try { [void](Update-Game); if (Test-Path $IconFile) { try { $form.Icon = New-Object Drawing.Icon($IconFile) } catch {} } } catch { [Windows.Forms.MessageBox]::Show("Aktualizácia sa nepodarila:`n$($_.Exception.Message)", 'Orbitálne Sektory', 'OK', 'Error') | Out-Null }
  $form.Cursor = 'Default'; [void](Refresh-Ui)
}

$btnCheck.Add_Click({ [void](Check-Remote) })
$btnUpdate.Add_Click({ Do-Update })
$btnWiki.Add_Click({ try { Start-Game 'wiki.html' } catch { [Windows.Forms.MessageBox]::Show("Verziu sa nepodarilo stiahnuť:`n$($_.Exception.Message)", 'Orbitálne Sektory', 'OK', 'Error') | Out-Null }; [void](Refresh-Ui) })
$cmbVer.Add_SelectedIndexChanged({ [void](Refresh-Ui) })
# zmena priečinka: hra sa uloží do podpriečinka "Orbitalne Sektory"; existujúca inštalácia sa môže presunúť
$btnDir.Add_Click({
  $dlg = New-Object Windows.Forms.FolderBrowserDialog
  $dlg.Description = 'Vyber priečinok, do ktorého sa uloží hra (vytvorí sa v ňom podpriečinok „Orbitalne Sektory“).'
  $dlg.ShowNewFolderButton = $true
  if ($dlg.ShowDialog() -ne 'OK') { return }
  $new = Join-Path $dlg.SelectedPath 'Orbitalne Sektory'
  if ($new -eq $GameDir) { return }
  if ((Test-Path $new) -and -not (Test-GameDir $new) -and ((Get-ChildItem $new -Force | Measure-Object).Count -gt 0)) {
    [Windows.Forms.MessageBox]::Show("Priečinok $new už existuje a nie je to priečinok hry. Vyber iné miesto.", 'Orbitálne Sektory', 'OK', 'Warning') | Out-Null; return }
  if (Test-GameDir $GameDir) {
    $ans = [Windows.Forms.MessageBox]::Show("Presunúť nainštalovanú hru do:`n$new ?`n`n(Uložené hry zostanú zachované.)", 'Orbitálne Sektory', 'YesNoCancel', 'Question')
    if ($ans -eq 'Cancel') { return }
    if ($ans -eq 'Yes') { try { $form.Cursor = 'WaitCursor'; if (Test-Path $new) { Remove-Item $new -Recurse -Force }
        New-Item -ItemType Directory -Force -Path (Split-Path $new -Parent) | Out-Null; Copy-Item $GameDir $new -Recurse -Force; Remove-Item $GameDir -Recurse -Force }
      catch { [Windows.Forms.MessageBox]::Show("Presun sa nepodaril:`n$($_.Exception.Message)", 'Orbitálne Sektory', 'OK', 'Error') | Out-Null; $form.Cursor = 'Default'; return }
      $form.Cursor = 'Default' } }
  $script:GameDir = $new; $Cfg.gameDir = $new; Save-Cfg; [void](Refresh-Ui)
})
# v0.23: po spustení hry panel zostane otvorený, ak je zaškrtnuté „Po spustení hry nechať panel otvorený“
$btnStart.Add_Click({ $Cfg.autoUpdate = $chkAuto.Checked; $Cfg.fullscreen = $chkFull.Checked; $Cfg.keepOpen = $chkKeep.Checked; Save-Cfg
  try { Start-Game; if (-not $Cfg.keepOpen) { $form.Close() } else { [void](Refresh-Ui) } } catch { [Windows.Forms.MessageBox]::Show("Verziu sa nepodarilo stiahnuť:`n$($_.Exception.Message)", 'Orbitálne Sektory', 'OK', 'Error') | Out-Null; [void](Refresh-Ui) } })
$btnLink.Add_Click({ try { New-DesktopShortcut; [Windows.Forms.MessageBox]::Show('Odkaz „Orbitálne Sektory“ je na ploche.', 'Orbitálne Sektory') | Out-Null } catch { [Windows.Forms.MessageBox]::Show($_.Exception.Message, 'Orbitálne Sektory', 'OK', 'Warning') | Out-Null } })
$chkAuto.Add_CheckedChanged({ $Cfg.autoUpdate = $chkAuto.Checked; Save-Cfg })
$chkFull.Add_CheckedChanged({ $Cfg.fullscreen = $chkFull.Checked; Save-Cfg })
$chkKeep.Add_CheckedChanged({ $Cfg.keepOpen = $chkKeep.Checked; Save-Cfg })
$form.Add_Shown({
  [void](Refresh-Ui)
  $newer = Check-Remote
  # prvé spustenie: nič sa nesťahuje automaticky, aby si mohol najprv zvoliť priečinok
  if ($newer -and $Cfg.autoUpdate -and (Get-LocalVersion)) { Do-Update }
  $btnStart.Focus()
})
if ($env:OS_LAUNCHER_TEST -ne '1') { [void]$form.ShowDialog() }

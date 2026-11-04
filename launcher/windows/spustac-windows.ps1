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
New-Item -ItemType Directory -Force -Path $Root | Out-Null

# --- nastavenia panela (automatická aktualizácia, celá obrazovka) ---
$Cfg = [pscustomobject]@{ autoUpdate = $true; fullscreen = $false; gameDir = $DefaultDir }
if (Test-Path $CfgFile) { try { $c = Get-Content $CfgFile -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($null -ne $c.autoUpdate) { $Cfg.autoUpdate = [bool]$c.autoUpdate }; if ($null -ne $c.fullscreen) { $Cfg.fullscreen = [bool]$c.fullscreen }
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
function Get-RemoteVersion {
  try {
    $r = Invoke-WebRequest -Uri ("$RawBase/version.json?t=" + [DateTime]::UtcNow.Ticks) -UseBasicParsing -TimeoutSec 12
    $bytes = $r.RawContentStream.ToArray()
    return ([Text.Encoding]::UTF8.GetString($bytes) | ConvertFrom-Json)
  } catch { return $null }
}
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
    foreach ($f in 'spustac-windows.ps1','Orbitalne-Sektory-Windows.bat') { $p = Join-Path $GameDir "launcher\windows\$f"; if (Test-Path $p) { Copy-Item $p (Join-Path $Root $f) -Force } }
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
function Get-Versions { try { $r = Invoke-WebRequest -Uri ("$RawBase/versions.json?t=" + [DateTime]::UtcNow.Ticks) -UseBasicParsing -TimeoutSec 12
    return @(([Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()) | ConvertFrom-Json).versions) } catch { return @() } }
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
  $a = @("--app=$url", "--user-data-dir=`"$prof`"", '--no-first-run', '--no-default-browser-check', '--window-size=1440,900')
  if ($Cfg.fullscreen) { $a += '--start-fullscreen' }
  Start-Process -FilePath $b -ArgumentList $a
}

# --- odkaz na ploche ---
function New-DesktopShortcut {
  $bat = Join-Path $Root 'Orbitalne-Sektory-Windows.bat'
  if (-not (Test-Path $bat)) { throw 'Spúšťač ešte nie je stiahnutý. Najprv aktualizuj hru.' }
  $ws = New-Object -ComObject WScript.Shell
  $lnk = $ws.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Desktop')) 'Orbitálne Sektory.lnk'))
  $lnk.TargetPath = $bat; $lnk.WorkingDirectory = $Root; $lnk.WindowStyle = 7
  if (Test-Path $IconFile) { $lnk.IconLocation = "$IconFile,0" } else { $b = Find-Browser; if ($b) { $lnk.IconLocation = "$b,0" } }
  $lnk.Description = 'Orbitálne Sektory – spúšťací panel'
  $lnk.Save()
}

# ===================== okno panela =====================
$bg = [Drawing.Color]::FromArgb(11,19,34); $panel = [Drawing.Color]::FromArgb(17,28,46)
$fg = [Drawing.Color]::FromArgb(221,231,241); $muted = [Drawing.Color]::FromArgb(133,151,171)
$accent = [Drawing.Color]::FromArgb(88,208,192); $warn = [Drawing.Color]::FromArgb(255,123,107)
$font = New-Object Drawing.Font('Segoe UI', 10)

$form = New-Object Windows.Forms.Form
$form.Text = 'Orbitálne Sektory – spúšťač pre Windows'; $form.ClientSize = New-Object Drawing.Size(560, 514)
$form.StartPosition = 'CenterScreen'; $form.FormBorderStyle = 'FixedSingle'; $form.MaximizeBox = $false
$form.BackColor = $bg; $form.ForeColor = $fg; $form.Font = $font
if (Test-Path $IconFile) { try { $form.Icon = New-Object Drawing.Icon($IconFile) } catch {} }

function New-Label($text, $x, $y, $w, $h, $size = 10, $style = 'Regular', $color = $fg) {
  $l = New-Object Windows.Forms.Label; $l.Text = $text; $l.Location = New-Object Drawing.Point($x, $y); $l.Size = New-Object Drawing.Size($w, $h)
  $l.Font = New-Object Drawing.Font('Segoe UI', $size, [Drawing.FontStyle]$style); $l.ForeColor = $color; $l.BackColor = [Drawing.Color]::Transparent
  $form.Controls.Add($l); return $l
}
function New-Button($text, $x, $y, $w, $h, $primary = $false) {
  $b = New-Object Windows.Forms.Button; $b.Text = $text; $b.Location = New-Object Drawing.Point($x, $y); $b.Size = New-Object Drawing.Size($w, $h)
  $b.FlatStyle = 'Flat'; $b.FlatAppearance.BorderColor = $(if ($primary) { $accent } else { [Drawing.Color]::FromArgb(60,80,105) })
  $b.BackColor = $(if ($primary) { [Drawing.Color]::FromArgb(20,60,58) } else { $panel }); $b.ForeColor = $(if ($primary) { $accent } else { $fg })
  $b.Font = New-Object Drawing.Font('Segoe UI', $(if ($primary) { 13 } else { 10 }), [Drawing.FontStyle]::Bold); $b.Cursor = 'Hand'
  $form.Controls.Add($b); return $b
}

[void](New-Label 'ORBITÁLNE SEKTORY' 24 18 500 34 18 'Bold')
[void](New-Label 'Vesmírna 2.5D sandbox hra · testovacie verzie z GitHubu' 26 52 500 22 9.5 'Regular' $muted)
$lblLocal  = New-Label 'Nainštalovaná verzia: –' 26 88 500 22
$lblRemote = New-Label 'Najnovšia verzia: zisťujem…' 26 112 500 22
[void](New-Label 'Novinky v najnovšej verzii' 26 146 500 20 9 'Bold' $muted)
$txtNotes = New-Object Windows.Forms.TextBox
$txtNotes.Multiline = $true; $txtNotes.ReadOnly = $true; $txtNotes.ScrollBars = 'Vertical'; $txtNotes.BorderStyle = 'FixedSingle'
$txtNotes.Location = New-Object Drawing.Point(26, 168); $txtNotes.Size = New-Object Drawing.Size(508, 104)
$txtNotes.BackColor = $panel; $txtNotes.ForeColor = $fg; $form.Controls.Add($txtNotes)
# riadok s priečinkom hry
[void](New-Label 'Priečinok hry' 26 282 120 20 9 'Bold' $muted)
$txtDir = New-Object Windows.Forms.TextBox; $txtDir.ReadOnly = $true; $txtDir.BorderStyle = 'FixedSingle'; $txtDir.Text = $GameDir
$txtDir.Location = New-Object Drawing.Point(26, 304); $txtDir.Size = New-Object Drawing.Size(392, 26); $txtDir.BackColor = $panel; $txtDir.ForeColor = $fg; $form.Controls.Add($txtDir)
$btnDir = New-Button 'Zmeniť…' 426 301 108 30
$chkAuto = New-Object Windows.Forms.CheckBox; $chkAuto.Text = 'Pri otvorení automaticky stiahnuť novú verziu'; $chkAuto.Checked = $Cfg.autoUpdate
$chkAuto.Location = New-Object Drawing.Point(26, 338); $chkAuto.Size = New-Object Drawing.Size(360, 24); $chkAuto.ForeColor = $fg; $form.Controls.Add($chkAuto)
$chkFull = New-Object Windows.Forms.CheckBox; $chkFull.Text = 'Celá obrazovka'; $chkFull.Checked = $Cfg.fullscreen
$chkFull.Location = New-Object Drawing.Point(394, 338); $chkFull.Size = New-Object Drawing.Size(150, 24); $chkFull.ForeColor = $fg; $form.Controls.Add($chkFull)
# výber verzie hry: najnovšia alebo staršia na porovnanie
[void](New-Label 'Verzia hry' 26 374 100 20 9 'Bold' $muted)
$cmbVer = New-Object Windows.Forms.ComboBox; $cmbVer.DropDownStyle = 'DropDownList'; $cmbVer.FlatStyle = 'Flat'
$cmbVer.Location = New-Object Drawing.Point(130, 370); $cmbVer.Size = New-Object Drawing.Size(404, 26); $cmbVer.BackColor = $panel; $cmbVer.ForeColor = $fg
[void]$cmbVer.Items.Add('Najnovšia (hlavná inštalácia)'); $cmbVer.SelectedIndex = 0; $form.Controls.Add($cmbVer)
$btnCheck  = New-Button 'Skontrolovať' 26 406 118 36
$btnUpdate = New-Button 'Aktualizovať' 152 406 126 36
$btnWiki   = New-Button 'Príručka' 286 406 104 36
$btnLink   = New-Button 'Odkaz na ploche' 398 406 136 36
$btnStart  = New-Button 'ŠTART' 26 450 508 50 $true

$script:remote = $null
function Refresh-Ui {
  $loc = Get-LocalVersion
  $lblLocal.Text = 'Nainštalovaná verzia: ' + $(if ($loc) { "$($loc.version)  ($($loc.date))" } else { 'žiadna' })
  if ($script:remote) {
    $lblRemote.Text = "Najnovšia verzia: $($script:remote.version)  ($($script:remote.date))"
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
  foreach ($v in $script:versions) { [void]$cmbVer.Items.Add("$($v.version)  ($($v.date))  –  $($v.title)") }
  $cmbVer.SelectedIndex = $(if ($keep -lt $cmbVer.Items.Count) { [Math]::Max(0, $keep) } else { 0 })
  if (-not $script:remote) { $lblRemote.Text = 'Najnovšia verzia: nedá sa zistiť (si offline alebo je repozitár súkromný)'; $lblRemote.ForeColor = $warn }
  elseif (-not (Get-LocalVersion)) { $txtNotes.Text = (($script:remote.notes | ForEach-Object { '• ' + $_ }) -join "`r`n") + "`r`n`r`nHra ešte nie je stiahnutá. Skontroluj priečinok hry (Zmeniť…) a klikni na Stiahnuť hru." }
  else { $lblRemote.ForeColor = $fg }
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
$btnStart.Add_Click({ $Cfg.autoUpdate = $chkAuto.Checked; $Cfg.fullscreen = $chkFull.Checked; Save-Cfg
  try { Start-Game; $form.Close() } catch { [Windows.Forms.MessageBox]::Show("Verziu sa nepodarilo stiahnuť:`n$($_.Exception.Message)", 'Orbitálne Sektory', 'OK', 'Error') | Out-Null; [void](Refresh-Ui) } })
$btnLink.Add_Click({ try { New-DesktopShortcut; [Windows.Forms.MessageBox]::Show('Odkaz „Orbitálne Sektory“ je na ploche.', 'Orbitálne Sektory') | Out-Null } catch { [Windows.Forms.MessageBox]::Show($_.Exception.Message, 'Orbitálne Sektory', 'OK', 'Warning') | Out-Null } })
$chkAuto.Add_CheckedChanged({ $Cfg.autoUpdate = $chkAuto.Checked; Save-Cfg })
$chkFull.Add_CheckedChanged({ $Cfg.fullscreen = $chkFull.Checked; Save-Cfg })
$form.Add_Shown({
  [void](Refresh-Ui)
  $newer = Check-Remote
  # prvé spustenie: nič sa nesťahuje automaticky, aby si mohol najprv zvoliť priečinok
  if ($newer -and $Cfg.autoUpdate -and (Get-LocalVersion)) { Do-Update }
  $btnStart.Focus()
})
if ($env:OS_LAUNCHER_TEST -ne '1') { [void]$form.ShowDialog() }

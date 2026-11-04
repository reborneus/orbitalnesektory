' =====================================================================
'  Orbitalne Sektory - skryty spustac pre Windows (v0.23)
'  Spusti spustaci panel BEZ okna konzoly PowerShellu.
'  Najprv (skryto) stiahne aktualnu verziu panela z GitHubu, potom ho otvori.
'  Argument "nodl" = nestahovat (pouziva ho Orbitalne-Sektory-Windows.bat, ktory uz stiahol).
' =====================================================================
Set sh = CreateObject("WScript.Shell")
Set fs = CreateObject("Scripting.FileSystemObject")
dir = sh.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\OrbitalneSektory"
If Not fs.FolderExists(dir) Then fs.CreateFolder(dir)
ps1 = dir & "\spustac-windows.ps1"
dl = True
If WScript.Arguments.Count > 0 Then
  If LCase(WScript.Arguments(0)) = "nodl" Then dl = False
End If
If dl Then
  cmd = "powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command ""try{[Net.ServicePointManager]::SecurityProtocol='Tls12';$ProgressPreference='SilentlyContinue';" & _
        "$u='https://raw.githubusercontent.com/reborneus/orbitalnesektory/main/launcher/windows/spustac-windows.ps1?t='+[DateTime]::UtcNow.Ticks;" & _
        "Invoke-WebRequest $u -OutFile (Join-Path $env:LOCALAPPDATA 'OrbitalneSektory\spustac-windows.ps1') -UseBasicParsing -TimeoutSec 15}catch{}"""
  sh.Run cmd, 0, True
End If
If Not fs.FileExists(ps1) Then
  MsgBox "Spustaci panel sa nepodarilo stiahnut. Skontroluj pripojenie na internet a skus znova.", 48, "Orbitalne Sektory"
  WScript.Quit 1
End If
sh.Run "powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & ps1 & """", 0, False

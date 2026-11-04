#!/bin/bash
# ================================================================
#  Orbitálne Sektory – spúšťač pre Mac
#  Stiahne aktuálny spúšťací panel (spustac-mac.sh) z GitHubu a otvorí ho.
#  Stačí na tento súbor dvakrát kliknúť (pri prvom otvorení: pravé tlačidlo → Otvoriť).
#  Aplikácia „Orbitálne Sektory“ na ploche volá tento súbor s parametrom --app (bez okna Terminálu).
# ================================================================
ROOT="$HOME/Library/Application Support/OrbitalneSektory"
URL="https://raw.githubusercontent.com/reborneus/orbitalnesektory/main/launcher/mac/spustac-mac.sh"
mkdir -p "$ROOT"
if curl -fsSL --max-time 15 -o "$ROOT/spustac-mac.sh.new" "$URL?t=$(date +%s)" && grep -q 'ORBITÁLNE SEKTORY' "$ROOT/spustac-mac.sh.new"; then
  mv "$ROOT/spustac-mac.sh.new" "$ROOT/spustac-mac.sh"
else rm -f "$ROOT/spustac-mac.sh.new"; fi
# ak beží z Terminálu (dvojklik na .command), skopíruje sa aj sem, aby ho mohla volať aplikácia
SELF="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
[ "$SELF" != "$ROOT/Orbitalne-Sektory-Mac.command" ] && cp "$SELF" "$ROOT/Orbitalne-Sektory-Mac.command" 2>/dev/null && chmod +x "$ROOT/Orbitalne-Sektory-Mac.command"
if [ ! -f "$ROOT/spustac-mac.sh" ]; then
  osascript -e 'display dialog "Spúšťací panel sa nepodarilo stiahnuť. Skontroluj pripojenie na internet a skús znova." with title "Orbitálne Sektory" buttons {"OK"} with icon stop' >/dev/null 2>&1
  exit 1
fi
chmod +x "$ROOT/spustac-mac.sh"
if [ "$1" = "--app" ]; then /bin/bash "$ROOT/spustac-mac.sh"
else
  # z Terminálu: panel sa spustí na pozadí; okno Terminálu potom môžeš zavrieť
  nohup /bin/bash "$ROOT/spustac-mac.sh" >/dev/null 2>&1 &
  echo "Spúšťací panel Orbitálne Sektory je otvorený. Toto okno môžeš zavrieť."
fi
exit 0

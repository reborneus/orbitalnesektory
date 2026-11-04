#!/bin/bash
# ================================================================
#  Orbitálne Sektory – inštalácia spúšťača pre Mac (stačí raz)
#  Spusti v Termináli tento jeden riadok:
#    curl -fsSL https://raw.githubusercontent.com/reborneus/orbitalnesektory/main/launcher/mac/instaluj-mac.sh | bash
#  Stiahne spúšťač, vytvorí aplikáciu „Orbitálne Sektory“ na ploche a v Aplikáciách a otvorí panel.
# ================================================================
ROOT="$HOME/Library/Application Support/OrbitalneSektory"
RAW="https://raw.githubusercontent.com/reborneus/orbitalnesektory/main/launcher/mac"
mkdir -p "$ROOT" || exit 1
echo "Sťahujem spúšťač Orbitálne Sektory…"
for f in Orbitalne-Sektory-Mac.command spustac-mac.sh; do
  if ! curl -fsSL --max-time 20 -o "$ROOT/$f" "$RAW/$f?t=$(date +%s)"; then echo "Nepodarilo sa stiahnuť $f (si offline alebo je repozitár súkromný)."; exit 1; fi
  chmod +x "$ROOT/$f"
done
w=$(/bin/bash "$ROOT/spustac-mac.sh" --install-apps) && echo "Aplikácia „Orbitálne Sektory“ je $w." || echo "Aplikáciu sa nepodarilo vytvoriť – spúšťaj súbor $ROOT/Orbitalne-Sektory-Mac.command."
echo "Otváram spúšťací panel…"
nohup /bin/bash "$ROOT/Orbitalne-Sektory-Mac.command" --app >/dev/null 2>&1 &
exit 0

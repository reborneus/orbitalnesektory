#!/bin/bash
# =====================================================================
#  ORBITÁLNE SEKTORY – spúšťací panel pre Mac (macOS)
#  Robí to isté ako panel pre Windows (launcher/windows/spustac-windows.ps1):
#  skontroluje verziu hry na GitHube, stiahne najnovšiu a spustí hru v samostatnom
#  okne prehliadača (Chrome, Edge, Brave alebo Chromium; ak žiadny nie je, otvorí Safari).
#  Okná panela sú systémové dialógy macOS (osascript), takže netreba nič inštalovať.
#
#  Kde sú súbory:   ~/Library/Application Support/OrbitalneSektory/
#     hra/                 stiahnutá hra (predvolené miesto; v paneli sa dá zvoliť iný priečinok)
#     profil/              profil prehliadača hry – tu sú ULOŽENÉ HRY, aktualizácia ani zmena priečinka ich nemaže
#     nastavenia.txt       nastavenia panela (riadky kľúč=hodnota)
#     verzie/<verzia>/     staršie verzie hry na porovnanie (položka „Verzia hry“), profil-<verzia>/ = ich uložené hry
#     spustac-mac.sh       tento panel (pri každom otvorení sa stiahne aktuálny)
#     Orbitalne-Sektory-Mac.command   spúšťač, ktorý panel stiahne a otvorí
#  Aplikácia „Orbitálne Sektory“ na ploche a v priečinku Aplikácie spúšťa ten istý spúšťač.
#
#  Pozn.: macOS má bash 3.2 a BSD nástroje, preto skript nepoužíva novšie funkcie bashu ani python.
# =====================================================================

REPO="reborneus/orbitalnesektory"; BRANCH="main"
RAW_BASE="${OS_RAW_BASE:-https://raw.githubusercontent.com/$REPO/$BRANCH}"   # OS_RAW_BASE / OS_ZIP_URL = len na testovanie
ZIP_URL="${OS_ZIP_URL:-https://github.com/$REPO/archive/refs/heads/$BRANCH.zip}"
SHA_ZIP_BASE="${OS_SHA_ZIP_BASE:-https://github.com/$REPO/archive}"   # <base>/<sha>.zip = konkrétna verzia
ROOT="${OS_ROOT:-$HOME/Library/Application Support/OrbitalneSektory}"
DEFAULT_DIR="$ROOT/hra"
PROFILE_DIR="$ROOT/profil"
CFG="$ROOT/nastavenia.txt"
TITLE="Orbitálne Sektory – spúšťač pre Mac"
mkdir -p "$ROOT"

# ---------- nastavenia (kľúč=hodnota) ----------
AUTO_UPDATE=1; FULLSCREEN=0; KEEP_OPEN=0; GAME_DIR="$DEFAULT_DIR"
if [ -f "$CFG" ]; then
  while IFS='=' read -r k v; do
    case "$k" in autoUpdate) AUTO_UPDATE="$v";; fullscreen) FULLSCREEN="$v";; keepOpen) KEEP_OPEN="$v";; gameDir) [ -n "$v" ] && GAME_DIR="$v";; esac
  done < "$CFG"
fi
save_cfg() { printf 'autoUpdate=%s\nfullscreen=%s\nkeepOpen=%s\ngameDir=%s\n' "$AUTO_UPDATE" "$FULLSCREEN" "$KEEP_OPEN" "$GAME_DIR" > "$CFG"; }

# priečinok patrí hre, ak obsahuje index.html a version.json (inak ho panel nikdy nezmaže)
is_game_dir() { [ -f "$1/index.html" ] && [ -f "$1/version.json" ]; }
dir_empty() { [ -z "$(ls -A "$1" 2>/dev/null)" ]; }

# ---------- dialógy (AppleScript) ----------
# text pre AppleScript: úvodzovky a spätné lomky treba ošetriť
as_q() { printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'; }
osa() { if [ "${OS_NO_GUI:-0}" = 1 ]; then echo "[GUI] $*" >&2; return 1; fi; osascript -e 'activate' "$@" 2>/dev/null; }
dlg_icon() { if [ -n "$1" ]; then echo "with icon $1"; elif [ -s "$ICNS" ]; then echo "with icon (POSIX file \"$(as_q "$ICNS")\")"; fi; }
msg() { osa -e "display dialog \"$(as_q "$1")\" with title \"$(as_q "$TITLE")\" buttons {\"OK\"} default button 1 $(dlg_icon "$2")" >/dev/null; }
ask() { # ask "otázka" "tlačidlo1" "tlačidlo2" ["tlačidlo3"] → vypíše názov stlačeného tlačidla
  local b="\"$(as_q "$2")\", \"$(as_q "$3")\""; [ -n "$4" ] && b="$b, \"$(as_q "$4")\""
  osa -e "button returned of (display dialog \"$(as_q "$1")\" with title \"$(as_q "$TITLE")\" buttons {$b} default button \"$(as_q "$2")\" $(dlg_icon))"; }
notify() { osa -e "display notification \"$(as_q "$1")\" with title \"Orbitálne Sektory\"" >/dev/null; }

# ---------- verzie ----------
# z version.json vytiahne "version", "date" a zoznam "notes" (bez pythonu, stačí sed)
json_field() { sed -n "s/.*\"$1\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" | head -n 1; }
json_notes() { sed -n '/"notes"/,/\]/p' | sed -n 's/^[[:space:]]*"\(.*\)",\{0,1\}[[:space:]]*$/• \1/p'; }
LOCAL_VER=""; LOCAL_DATE=""; REMOTE_JSON=""; REMOTE_VER=""; REMOTE_DATE=""; REMOTE_WHEN=""
read_local() { LOCAL_VER=""; LOCAL_DATE=""; if [ -f "$GAME_DIR/version.json" ]; then
  LOCAL_VER=$(json_field version < "$GAME_DIR/version.json"); LOCAL_DATE=$(json_field date < "$GAME_DIR/version.json"); fi; }
# raw.githubusercontent.com drží súbory z vetvy main v cache ~5 minút (aj s ?t=…). Preto sa najprv cez GitHub API zistí SHA
# posledného commitu a súbory sa čítajú podľa neho (taká adresa sa nezasekne na starej verzii); bez API sa použije vetva.
API_BASE="${OS_API_BASE:-https://api.github.com/repos/$REPO}"; RAW_NOW="$RAW_BASE"
gh_get() { curl -fsSL --max-time 12 -H 'Cache-Control: no-cache' -H 'Pragma: no-cache' "$1" 2>/dev/null; }
read_remote() { local sha; sha=$(gh_get "$API_BASE/commits/$BRANCH" | grep -m1 '"sha"' | sed -n 's/.*"sha": *"\([0-9a-f]\{40\}\)".*/\1/p')
  if [ -n "$sha" ] && [ -z "${OS_RAW_BASE:-}" ]; then RAW_NOW="https://raw.githubusercontent.com/$REPO/$sha"; else RAW_NOW="$RAW_BASE"; fi
  REMOTE_JSON=$(gh_get "$RAW_NOW/version.json?t=$(date +%s)")
  REMOTE_VER=$(printf '%s' "$REMOTE_JSON" | json_field version); REMOTE_DATE=$(printf '%s' "$REMOTE_JSON" | json_field date)
  VERSIONS=""; read_versions
  # čas zverejnenia najnovšej verzie (pole "time" vo versions.json)
  REMOTE_WHEN=""; local line; line=$(printf '%s\n' "$VERSIONS" | grep "\"version\": \"$REMOTE_VER\"" | head -n 1)
  [ -n "$line" ] && REMOTE_WHEN=$(fmt_time "$(ver_line_field "$line" time)"); }
# ISO čas (2026-11-04T19:41:05+00:00) → miestny „4. 11. 2026 o 20:41 (pred 6 min)“; $2=short → „4. 11. 20:41“
fmt_time() { local iso="$1" ep now m ago; [ -n "$iso" ] || return 0
  iso=$(printf '%s' "$iso" | sed -e 's/Z$/+0000/' -e 's/\([+-][0-9][0-9]\):\([0-9][0-9]\)$/\1\2/')
  ep=$(date -j -f "%Y-%m-%dT%H:%M:%S%z" "$iso" +%s 2>/dev/null || date -d "$1" +%s 2>/dev/null) || return 0; [ -n "$ep" ] || return 0
  if [ "$2" = short ]; then date -r "$ep" "+%-d. %-m. %H:%M" 2>/dev/null || date -d "@$ep" "+%-d. %-m. %H:%M"; return 0; fi
  now=$(date +%s); m=$(( (now-ep)/60 ))
  if [ $m -lt 1 ]; then ago="práve teraz"; elif [ $m -lt 60 ]; then ago="pred $m min"; elif [ $m -lt 1440 ]; then ago="pred $((m/60)) h"; else ago="pred $((m/1440)) d"; fi
  printf '%s (%s)' "$(date -r "$ep" "+%-d. %-m. %Y o %H:%M" 2>/dev/null || date -d "@$ep" "+%-d. %-m. %Y o %H:%M")" "$ago"; }
# ver_gt A B → pravda, ak verzia A > B (porovnáva čísla po bodkách: 0.10.0 > 0.9.3)
ver_gt() { awk -v a="$1" -v b="$2" 'BEGIN{n=split(a,x,".");m=split(b,y,".");k=n>m?n:m;for(i=1;i<=k;i++){if((x[i]+0)>(y[i]+0))exit 0;if((x[i]+0)<(y[i]+0))exit 1}exit 1}'; }
has_newer() { [ -n "$REMOTE_VER" ] && { [ -z "$LOCAL_VER" ] || ver_gt "$REMOTE_VER" "$LOCAL_VER"; }; }

# ---------- aktualizácia: stiahne zip repozitára a nahradí priečinok hry ----------
UPDATE_ERR=""
update_game() { install_zip "$ZIP_URL" "$GAME_DIR" 1; }
# install_zip URL CIEĽ HLAVNÁ – stiahne zip a nainštaluje ho do priečinka CIEĽ (HLAVNÁ=1: skopíruje aj nový panel)
install_zip() { local url="$1" dest="$2" main="$3"; UPDATE_ERR=""; local tmp; tmp=$(mktemp -d "${TMPDIR:-/tmp}/orbitalne.XXXXXX") || { UPDATE_ERR="Nedá sa vytvoriť dočasný priečinok."; return 1; }
  if ! curl -fsSL --max-time 180 -o "$tmp/hra.zip" "$url"; then UPDATE_ERR="Sťahovanie zlyhalo (si offline alebo je repozitár súkromný)."; rm -rf "$tmp"; return 1; fi
  if ! unzip -q "$tmp/hra.zip" -d "$tmp/x"; then UPDATE_ERR="Stiahnutý balík sa nedá rozbaliť."; rm -rf "$tmp"; return 1; fi
  local src; src=$(find "$tmp/x" -mindepth 1 -maxdepth 1 -type d | head -n 1)
  if [ -z "$src" ] || [ ! -f "$src/index.html" ]; then UPDATE_ERR="V stiahnutom balíku chýba index.html."; rm -rf "$tmp"; return 1; fi
  if [ -e "$dest" ]; then
    if is_game_dir "$dest"; then rm -rf "$dest"
    elif dir_empty "$dest"; then rmdir "$dest"
    else UPDATE_ERR="Priečinok $dest nie je prázdny a nie je to priečinok hry. Vyber iný."; rm -rf "$tmp"; return 1; fi
  fi
  mkdir -p "$(dirname "$dest")" && mv "$src" "$dest" || { UPDATE_ERR="Hru sa nepodarilo uložiť do $dest."; rm -rf "$tmp"; return 1; }
  # súbory stiahnuté z internetu: odstráni karanténu, aby ich macOS neblokoval
  xattr -dr com.apple.quarantine "$dest" 2>/dev/null
  [ "$main" = 1 ] || { rm -rf "$tmp"; return 0; }
  # nová verzia panela a spúšťača sa použije pri ďalšom otvorení
  for f in spustac-mac.sh Orbitalne-Sektory-Mac.command; do [ -f "$GAME_DIR/launcher/mac/$f" ] && cp "$GAME_DIR/launcher/mac/$f" "$ROOT/$f" && chmod +x "$ROOT/$f"; done
  rm -rf "$tmp"; return 0; }

# ---------- spustenie hry v okne prehliadača s vlastným profilom (uložené hry zostanú v profil/) ----------
find_browser() { local a; for a in "Google Chrome" "Microsoft Edge" "Brave Browser" "Chromium"; do
    if [ -d "/Applications/$a.app" ] || [ -d "$HOME/Applications/$a.app" ]; then echo "$a"; return 0; fi; done; return 1; }
file_url() { printf 'file://%s' "$(printf '%s' "$1" | sed -e 's/%/%25/g' -e 's/ /%20/g' -e 's/#/%23/g' -e 's/?/%3F/g')"; }
# ---------- staršie verzie na porovnanie (versions.json: jedna verzia na riadok) ----------
# SEL_VER prázdne = najnovšia (hlavná inštalácia); inak sa hra stiahne do verzie/<v> a má vlastný profil profil-<v>
SEL_VER=""; SEL_SHA=""; VERSIONS=""
read_versions() { VERSIONS=$(gh_get "$RAW_NOW/versions.json?t=$(date +%s)" | grep '"sha"'); }
ver_line_field() { printf '%s' "$1" | sed -n "s/.*\"$2\": *\"\([^\"]*\)\".*/\1/p"; }
pick_version() { [ -n "$VERSIONS" ] || read_versions
  [ -n "$VERSIONS" ] || { msg "Zoznam verzií sa nedá stiahnuť (si offline?)." caution; return; }
  local items="\"Najnovšia (hlavná inštalácia)\"" line v d tt choice
  while IFS= read -r line; do v=$(ver_line_field "$line" version); d=$(fmt_time "$(ver_line_field "$line" time)" short); [ -n "$d" ] || d=$(ver_line_field "$line" date); tt=$(ver_line_field "$line" title)
    items="$items, \"$(as_q "$v  ($d)  –  $tt")\""; done <<< "$VERSIONS"
  choice=$(osa -e "choose from list {$items} with title \"$(as_q "$TITLE")\" with prompt \"Vyber verziu hry. Staršie verzie majú vlastné uložené hry, hlavný postup sa nezmení.\" OK button name \"Vybrať\" cancel button name \"Späť\"") || return
  case "$choice" in false|"") return;; "Najnovšia"*) SEL_VER=""; SEL_SHA=""; return;; esac
  SEL_VER="${choice%%  (*}"
  SEL_SHA=$(printf '%s\n' "$VERSIONS" | grep "\"version\": \"$SEL_VER\"" | head -n 1); SEL_SHA=$(ver_line_field "$SEL_SHA" sha); }
# pripraví priečinok a profil vybranej verzie: nastaví RUN_DIR a RUN_PROFILE
prepare_version() { RUN_DIR="$GAME_DIR"; RUN_PROFILE="$PROFILE_DIR"; [ -n "$SEL_VER" ] || return 0
  RUN_DIR="$ROOT/verzie/$SEL_VER"; RUN_PROFILE="$ROOT/profil-$SEL_VER"
  is_game_dir "$RUN_DIR" && return 0
  notify "Sťahujem verziu $SEL_VER…"
  install_zip "$SHA_ZIP_BASE/$SEL_SHA.zip" "$RUN_DIR" 0 || { msg "Verziu $SEL_VER sa nepodarilo stiahnuť:
$UPDATE_ERR" stop; return 1; }; }
start_game() { local page="${1:-index.html}" b; prepare_version || return 1; b=$(find_browser)
  if [ -z "$b" ]; then open -a Safari "$RUN_DIR/$page" 2>/dev/null || open "$RUN_DIR/$page"; return; fi
  mkdir -p "$RUN_PROFILE"
  local args=("--app=$(file_url "$RUN_DIR/$page")" "--user-data-dir=$RUN_PROFILE" --no-first-run --no-default-browser-check --window-size=1440,900 --ignore-gpu-blocklist --enable-gpu-rasterization)
  [ "$FULLSCREEN" = 1 ] && args+=(--start-fullscreen)
  open -na "$b" --args "${args[@]}"; }

# ---------- aplikácia na ploche a v priečinku Aplikácie (dvojklik bez Terminálu) ----------
make_app() { local dest="$1" app="$1/Orbitálne Sektory.app" cmd="$ROOT/Orbitalne-Sektory-Mac.command"
  [ -f "$cmd" ] || { echo "chýba $cmd"; return 1; }
  mkdir -p "$dest"; rm -rf "$app"
  osacompile -o "$app" -e "do shell script \"/bin/bash \" & quoted form of \"$(as_q "$cmd")\" & \" --app >/dev/null 2>&1\"" 2>/dev/null || return 1
  set_icon "$app"; return 0; }

# ---------- ikona aplikácie ----------
# Z PNG ikony hry vytvorí OrbitalneSektory.icns (sips + iconutil sú súčasťou macOS). Stačí raz.
ICNS="$ROOT/OrbitalneSektory.icns"; ICON_MARK="os-icon-2"   # ICON_MARK = značka v aplikácii, že má už správnu ikonu
make_icns() { [ -s "$ICNS" ] && return 0
  local png="" s d set="${TMPDIR:-/tmp}/os-icon.$$.iconset"
  for f in icon-1024.png icon-512.png icon-256.png; do [ -z "$png" ] && [ -f "$GAME_DIR/assets/$f" ] && png="$GAME_DIR/assets/$f"; done
  # hra ešte nie je stiahnutá (prvá inštalácia): ikonu stiahne z GitHubu
  if [ -z "$png" ]; then png="$ROOT/icon-1024.png"; [ -s "$png" ] || curl -fsSL --max-time 20 -o "$png" "$RAW_BASE/assets/icon-1024.png" 2>/dev/null || return 1; fi
  mkdir -p "$set"
  for s in 16 32 128 256 512; do sips -z $s $s "$png" --out "$set/icon_${s}x${s}.png" >/dev/null 2>&1; d=$((s*2)); sips -z $d $d "$png" --out "$set/icon_${s}x${s}@2x.png" >/dev/null 2>&1; done
  iconutil -c icns "$set" -o "$ICNS" 2>/dev/null; rm -rf "$set"; [ -s "$ICNS" ]; }
# Nastaví ikonu aplikácii. Novšie macOS berú ikonu z Assets.car (CFBundleIconName), nie z applet.icns –
# preto Assets.car zmaže, v Info.plist nechá len applet.icns, aplikáciu znova podpíše (ad-hoc)
# a navyše nastaví ikonu aj cez Finder (NSWorkspace), aby sa hneď zobrazila.
set_icon() { local app="$1" res="$1/Contents/Resources" pl="$1/Contents/Info.plist"
  [ -d "$res" ] || return 1; make_icns || return 1
  cp "$ICNS" "$res/applet.icns"; rm -f "$res/Assets.car"
  /usr/libexec/PlistBuddy -c "Delete :CFBundleIconName" "$pl" >/dev/null 2>&1
  /usr/libexec/PlistBuddy -c "Set :CFBundleIconFile applet" "$pl" >/dev/null 2>&1 || /usr/libexec/PlistBuddy -c "Add :CFBundleIconFile string applet" "$pl" >/dev/null 2>&1
  touch "$res/$ICON_MARK"
  codesign --force --deep --sign - "$app" >/dev/null 2>&1
  OS_APP="$app" OS_ICNS="$ICNS" osascript -l JavaScript -e 'ObjC.import("AppKit");const e=$.NSProcessInfo.processInfo.environment;const i=$.NSImage.alloc.initWithContentsOfFile(e.objectForKey("OS_ICNS"));$.NSWorkspace.sharedWorkspace.setIconForFileOptions(i,e.objectForKey("OS_APP"),0)' >/dev/null 2>&1
  touch "$app"; return 0; }
# aplikácie vytvorené staršou verziou panela (bez ikony) opraví pri štarte
fix_icons() { local app; for app in "$HOME/Desktop/Orbitálne Sektory.app" "$HOME/Applications/Orbitálne Sektory.app"; do
    [ -d "$app" ] && [ ! -f "$app/Contents/Resources/$ICON_MARK" ] && set_icon "$app"; done; }
install_apps() { local ok=""; make_app "$HOME/Desktop" && ok="na ploche"; make_app "$HOME/Applications" && ok="${ok:+$ok a }v priečinku Aplikácie (vo vašom používateľskom priečinku)"; [ -n "$ok" ]; echo "$ok"; }

# ---------- zmena priečinka hry ----------
change_dir() { local pick new
  pick=$(osa -e "POSIX path of (choose folder with prompt \"Vyber priečinok, do ktorého sa uloží hra (vytvorí sa v ňom podpriečinok „Orbitalne Sektory“).\")") || return
  new="${pick%/}/Orbitalne Sektory"; [ "$new" = "$GAME_DIR" ] && return
  if [ -e "$new" ] && ! is_game_dir "$new" && ! dir_empty "$new"; then msg "Priečinok $new už existuje a nie je to priečinok hry. Vyber iné miesto." caution; return; fi
  if is_game_dir "$GAME_DIR"; then
    case "$(ask "Presunúť nainštalovanú hru do:
$new ?

(Uložené hry zostanú zachované.)" "Presunúť" "Nepresúvať" "Zrušiť")" in
      "Presunúť") rm -rf "$new"; mkdir -p "$(dirname "$new")"; if ! mv "$GAME_DIR" "$new"; then msg "Presun sa nepodaril." stop; return; fi;;
      "Nepresúvať") ;;
      *) return;;
    esac
  fi
  GAME_DIR="$new"; save_cfg; }

do_update() { notify "Sťahujem a inštalujem hru…"; if update_game; then read_local; notify "Nainštalovaná verzia $LOCAL_VER"; return 0; fi
  msg "Aktualizácia sa nepodarila:
$UPDATE_ERR" stop; return 1; }

# ---------- hlavné menu ----------
main_menu() {
  local onoff_a onoff_f onoff_k st lines notes upd items choice
  while true; do
    read_local
    [ "$AUTO_UPDATE" = 1 ] && onoff_a="ZAP" || onoff_a="VYP"; [ "$FULLSCREEN" = 1 ] && onoff_f="ZAP" || onoff_f="VYP"; [ "$KEEP_OPEN" = 1 ] && onoff_k="ZAP" || onoff_k="VYP"
    st="Nainštalovaná verzia: ${LOCAL_VER:-žiadna}${LOCAL_DATE:+ ($LOCAL_DATE)}"
    if [ -n "$REMOTE_VER" ]; then st="$st
Najnovšia verzia: $REMOTE_VER · zverejnená ${REMOTE_WHEN:-$REMOTE_DATE}"; notes=$(printf '%s' "$REMOTE_JSON" | json_notes | head -n 6)
      [ -n "$notes" ] && st="$st

Novinky:
$notes"
    else st="$st
Najnovšia verzia: nedá sa zistiť (si offline alebo je repozitár súkromný)"; fi
    st="$st

Priečinok hry: $GAME_DIR"
    if [ -z "$LOCAL_VER" ]; then upd="Stiahnuť hru"; elif has_newer; then upd="Aktualizovať na $REMOTE_VER"; else upd="Stiahnuť znova"; fi
    local vlab="Verzia hry: ${SEL_VER:-najnovšia}" startlab="▶ ŠTART"; [ -n "$SEL_VER" ] && startlab="▶ ŠTART (stará verzia $SEL_VER)"
    items="\"$(as_q "$startlab")\", \"$vlab\", \"$upd\", \"Príručka\", \"Skontrolovať novú verziu\", \"Zmeniť priečinok hry…\", \"Automatická aktualizácia: $onoff_a\", \"Celá obrazovka: $onoff_f\", \"Nechať panel otvorený: $onoff_k\", \"Aplikácia na ploche\""
    [ -z "$LOCAL_VER" ] && [ -z "$SEL_VER" ] && items="\"$upd\", \"Zmeniť priečinok hry…\", \"Skontrolovať novú verziu\", \"Automatická aktualizácia: $onoff_a\", \"$vlab\""
    choice=$(osa -e "choose from list {$items} with title \"$(as_q "$TITLE")\" with prompt \"$(as_q "$st")\" OK button name \"Vybrať\" cancel button name \"Zavrieť\" default items {item 1 of {$items}}") || return
    case "$choice" in
      false|"") return;;
      "▶ ŠTART"*) save_cfg; start_game && [ "$KEEP_OPEN" != 1 ] && return;;   # v0.23: voliteľne nechá panel otvorený
      "Verzia hry: "*) pick_version;;
      "Príručka") start_game wiki.html;;
      "Stiahnuť hru"|"Aktualizovať na "*|"Stiahnuť znova") do_update;;
      "Skontrolovať novú verziu") read_remote;;
      "Zmeniť priečinok hry…") change_dir;;
      "Automatická aktualizácia: "*) [ "$AUTO_UPDATE" = 1 ] && AUTO_UPDATE=0 || AUTO_UPDATE=1; save_cfg;;
      "Celá obrazovka: "*) [ "$FULLSCREEN" = 1 ] && FULLSCREEN=0 || FULLSCREEN=1; save_cfg;;
      "Nechať panel otvorený: "*) [ "$KEEP_OPEN" = 1 ] && KEEP_OPEN=0 || KEEP_OPEN=1; save_cfg;;
      "Aplikácia na ploche") local w; if w=$(install_apps); then msg "Aplikácia „Orbitálne Sektory“ je $w."; else msg "Aplikáciu sa nepodarilo vytvoriť." caution; fi;;
    esac
  done; }

# ---------- štart panela ----------
case "$1" in
  --install-apps) install_apps; exit $?;;      # volá inštalátor (instaluj-mac.sh)
  --selftest) return 0 2>/dev/null || exit 0;; # testy: len načíta funkcie
esac
read_local; read_remote; fix_icons
# prvé spustenie: nič sa nesťahuje automaticky, aby si mohol najprv zvoliť priečinok
if [ -n "$LOCAL_VER" ] && [ "$AUTO_UPDATE" = 1 ] && has_newer; then do_update; fi
main_menu
exit 0

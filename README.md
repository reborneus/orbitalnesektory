# Orbitálne Sektory

Vesmírna 2.5D sandbox hra: ťažba asteroidov, stavba a vylepšovanie staníc, obsadzovanie sektorov.
Webový prototyp (Three.js) – otvor `index.html` v prehliadači alebo hraj online na **https://reborneus.github.io/orbitalnesektory/** (aj na telefóne, pozri nižšie).

## Verzie
Aktuálna verzia je v [`version.json`](version.json). Všetky zmeny po verziách nájdeš v **[CHANGELOG.md](CHANGELOG.md)**.

## Hranie na telefóne (iOS a Android)
Hra beží priamo z GitHub Pages: **https://reborneus.github.io/orbitalnesektory/** – nič sa neinštaluje a každá nová verzia sa tam objaví sama pár minút po vydaní.

**iPhone / iPad (Safari)**
1. Otvor adresu hry v **Safari** (iné prehliadače na iOS ikonu na plochu nevedia pridať tak dobre).
2. Ťukni na **Zdieľať** (štvorec so šípkou) → **Pridať na plochu** → **Pridať**.
3. Hru spúšťaj ikonou **Sektory** na ploche – otvorí sa na celú obrazovku bez lišty prehliadača.

**Android (Chrome)**
1. Otvor adresu hry v **Chrome**.
2. Ťukni na **⋮** (vpravo hore) → **Inštalovať aplikáciu** alebo **Pridať na plochu** (názov závisí od verzie Chrome).
3. Hru spúšťaj ikonou **Sektory** na ploche alebo v zozname aplikácií – beží na celú obrazovku.

Na čo myslieť:
- Uložená hra je v zariadení a je viazaná na spôsob spustenia: postup z PC, zo spúšťača, z karty prehliadača a z ikony na ploche sa navzájom neprenáša.
- Hra potrebuje internet (3D knižnica a písma sa načítavajú z internetu).
- Na telefóne sa automaticky zapne **kompaktný HUD** (menšie panely a minimapa, spodné menu len s ikonami). V *Nastaveniach* sa dá zapnúť aj **automatické schovávanie HUD** – spodné menu sa po chvíli schová a vysunieš ho šípkou dole.
- Telefón môžeš držať na výšku aj na šírku; na šírku je viac miesta na hraciu plochu.

## Uložené hry
Hra má **3 sloty**. Každý slot má vlastné **automatické uloženia** (3 kusy s odstupom 5 minút, hra sa ukladá priebežne) a až **6 ručných** (v hre *Nastavenia → Uložiť*). Hlavné menu: *Pokračovať* (posledné uloženie), *Nová hra* (výber slotu a obtiažnosti), *Načítať hru* (slot → konkrétne uloženie).
Nastavenia ovládania a HUD sú spoločné pre všetky sloty. Hra z verzie 0.29 a starších sa pri prvom spustení automaticky prenesie do slotu 1.

**Pre vývoj – kompatibilita uložení (`js/saves.js`):** každé uloženie nesie číslo schémy `schema`. Keď nová verzia zmení štruktúru stavu, zvýš `SAVE_SCHEMA` a pridaj krok do `SAVE_MIGRATIONS` (krok *i* prevedie schému *i* na *i+1*); nové polia s predvolenou hodnotou stačí doplniť v `migrate()` v `js/state.js`. Staré uloženia tak vždy pokračujú v novej verzii.

## Vlastné 3D modely a grafika

Ktorýkoľvek model v hre (lode, piráti, stanica, moduly, drony, brána, NPC) sa dá vymeniť za hotový model `.glb` bez úpravy kódu:

1. Nahraj súbor do `assets/models/` (napr. `assets/models/bizon.glb`).
2. V súbore `js/models.js` pridaj riadok, napr. `'ship.bizon': {file:'assets/models/bizon.glb'},` (zoznam všetkých kľúčov a volieb je v komentári toho súboru).
3. Hra model sama prispôsobí veľkosti a stredu pôvodného modelu. Ak sa nenačíta, ostane pôvodný.

Vlastné prostredie pre odrazy (HDRI `.hdr` alebo panoráma `.jpg`) sa nastavuje v tom istom súbore (`env`).
Komprimované modely (Draco aj Meshopt, napr. z gltf.report) sú podporované.
Vlastné modely sa načítajú na stránke hry (GitHub Pages) a pri spustení cez webový server; pri otvorení súboru `index.html` priamo z disku ich prehliadač zablokuje a ostanú pôvodné modely.

V Nastaveniach → Grafika sa dajú zapnúť/vypnúť **odrazy prostredia** a **žiara (bloom)**.

## Úpravy kódu
Hra je rozdelená na súbory: `index.html` (kostra stránky), `css/style.css` (vzhľad) a `js/*.js` (logika). Prehľad súborov je v `js/README.txt`.
Ceny, zóny, radiácia, sektory a obtiažnosť sú v `js/data.js`, rarity a predmety v `js/items.js`, texty v oboch jazykoch v `js/i18n.js`.
Na sekciu v kóde skočíš hľadaním `== 1.` až `== 12.`.

`python3 build.py` poskladá všetko do jedného súboru `dist/orbitalne-sektory.html` (dá sa otvoriť dvojklikom aj bez internetu na súbory hry).
`version.json` obsahuje číslo aktuálnej verzie (používa ho spúšťací panel).

**Príručka:** `js/wiki.js` – texty v objekte `WT` (SK/EN), tabuľky sa počítajú z herných dát. V hre ju otvorí tlačidlo *Wiki* alebo kláves **K**, samostatne `wiki.html`.
**Ikona:** `assets/icon-*.png` a `assets/icon.ico`; nakreslí ich `node tools/make_icon.js` podľa `tools/icon.html`.

## Spúšťacie panely (Windows a Mac)
V priečinku `launcher/` sú spúšťače pre testerov, každý systém má vlastný:

| Systém | Priečinok | Spúšťač | Panel |
|---|---|---|---|
| Windows | `launcher/windows/` | `Orbitalne-Sektory-Windows.bat` | `spustac-windows.ps1` |
| Mac (macOS) | `launcher/mac/` | `Orbitalne-Sektory-Mac.command` | `spustac-mac.sh` |

Oba panely robia to isté: ukážu nainštalovanú a najnovšiu verziu s novinkami, samy stiahnu novú verziu a spustia hru v samostatnom okne prehliadača s vlastným profilom (tam sú uložené hry). Dá sa v nich zvoliť priečinok hry (hra sa uloží do podpriečinka `Orbitalne Sektory`), otvoriť príručku a vytvoriť odkaz na ploche.

**Výber verzie hry:** v paneli (Windows: rozbaľovací zoznam *Verzia hry*, Mac: položka *Verzia hry*) sa dá spustiť aj staršia verzia na porovnanie. Stiahne sa do `verzie/<verzia>` a má vlastný profil `profil-<verzia>`, takže hlavné uložené hry sa nezmenia. Zoznam verzií je v `versions.json` (generuje `python3 tools/versions.py` po každom vydaní).

### Windows
1. Stiahni súbor **`launcher/windows/Orbitalne-Sektory-Windows.bat`** (na GitHube otvor súbor a klikni na *Download raw file*) a ulož ho napríklad na plochu.
2. Dvakrát naň klikni. Ak Windows zobrazí „Systém Windows ochránil váš počítač“, klikni na *Ďalšie informácie → Spustiť aj tak*.
3. Tlačidlo *Odkaz na ploche* vytvorí odkaz „Orbitálne Sektory“.

Hra je predvolene v `%LOCALAPPDATA%\OrbitalneSektory\hra`, uložené hry v `%LOCALAPPDATA%\OrbitalneSektory\profil`. Starší spúšťač `Orbitalne-Sektory.bat` funguje ďalej – súbor `launcher/spustac.ps1` ho presmeruje na nový panel.

### Mac
1. Otvor aplikáciu **Terminál** a vlož tento riadok:
   `curl -fsSL https://raw.githubusercontent.com/reborneus/orbitalnesektory/main/launcher/mac/instaluj-mac.sh | bash`
2. Na ploche a v priečinku Aplikácie (vo vašom používateľskom priečinku) sa objaví aplikácia **Orbitálne Sektory** s ikonou hry a otvorí sa panel. Ďalej už stačí dvakrát kliknúť na aplikáciu.
3. Panel je systémové okno so zoznamom: vyber položku (napr. *▶ ŠTART*) a klikni na *Vybrať*.

Hra beží v Chrome, Edge, Brave alebo Chromiu (samostatné okno, vlastný profil); ak žiadny z nich nie je, otvorí sa v Safari. Hra je predvolene v `~/Library/Application Support/OrbitalneSektory/hra`, uložené hry v `…/OrbitalneSektory/profil`.

Panel sťahuje súbory z GitHubu bez prihlásenia, preto musí byť repozitár **verejný**.
Pri vydaní novej verzie treba zvýšiť číslo v `version.json` – podľa neho panel pozná, že je k dispozícii aktualizácia.

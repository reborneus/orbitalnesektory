# Orbitálne Sektory

Vesmírna 2.5D sandbox hra: ťažba asteroidov, stavba a vylepšovanie staníc, obsadzovanie sektorov.
Webový prototyp (Three.js) – otvor `index.html` v prehliadači.

## Verzie
- **v0.1** – prototyp 0: ťažba, stanica a moduly, 3 sektory, ukladanie hry
- **v0.2** – ovládač Xbox/PS a klávesnica, zrýchlenie a max. rýchlosť ako vylepšenia, loď „Klepeto“, kolízie s asteroidmi, integrita trupu
- **v0.3** – tretia surovina viridit, 4 pásy + horizont, radiácia, štíty, oprava trupu po 30 s, menu vylepšení po skupinách, minimapa, SK/EN, obtiažnosť Ľahká/Ťažká, nová ekonomika
- **v0.3.1** – predaj modulov stanice (60 % späť), anglický názov sektora Orion Deep
- **v0.3.2** – loď po skončení ťažby zastaví namiesto narážania do asteroidu, presnejší údaj o plnom náklade
- **v0.3.3** – voliteľná automatická ťažba (Mapa → Nastavenia)
- **v0.4** – autopilot (ťaží zvolenú surovinu, vozí ju na stanicu, vracia sa na opravu), automatický návrat pri plnom náklade, kláves P / tlačidlo View
- **v0.4.1** – skok do sektora iba cez skokovú bránu, Mapa je informatívna, oprava zaseknutia pri skoku počas ťažby
- **v0.4.2** – vysvetlivky v kóde (obsah sekcií, popis herných hodnôt na ladenie balansu)
- **v0.5** – kredity, predmety s 10 raritami (Odpad až Prvotné) a náhodnými vlastnosťami, výbava lode a inventár, vylepšovanie +1 až +20, zlaté relikty s korisťou, vylepšenia lode do úrovne 10, hra rozdelená na súbory
- **v0.7.1** – skrytý admin panel na testovanie
- **v0.7.2** – oprava odomykania schopností dronu, efektnejšia rarita Prvotné
- **v0.7.3** – pulzovanie Mytických predmetov, blikajúce hviezdy a pulz Prvotných
- **v0.7.4** – vylepšenie Obratnosť, zatáčanie bez driftu
- **v0.8.0** – hangár s loďami Sokol a Bizón, sektory 4–6, pirátska fregata
- **v0.8.1** – spúšťač pre Mac, spúšťače rozlíšené podľa systému
- **v0.8.2** – ikona aplikácie spúšťača na Macu
- **v0.7** – misie (5 typov, 3 stupne), radiačný štít s obmedzeným časom, sledovanie misií v HUD
- **v0.6.1** – oprava: autopilot po zbere koristi s plným nákladom pokračuje na stanicu
- **v0.6** – boj s pirátmi (zbraň lode, veže, obrana dronov), panel stanice s vylepšovaním modulov +1 až +10 a čipmi, slot Zbraň, samostatné Nastavenia s tlačidlom Ukončiť hru, pasívny príjem len pri dosiahnutom vplyve
- **v0.5.1** – príručka (wiki) v hre aj ako stránka `wiki.html`, ikona hry, spúšťač s výberom priečinka

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

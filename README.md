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

## Úpravy kódu
Hra je rozdelená na súbory: `index.html` (kostra stránky), `css/style.css` (vzhľad) a `js/*.js` (logika). Prehľad súborov je v `js/README.txt`.
Ceny, zóny, radiácia, sektory a obtiažnosť sú v `js/data.js`, rarity a predmety v `js/items.js`, texty v oboch jazykoch v `js/i18n.js`.
Na sekciu v kóde skočíš hľadaním `== 1.` až `== 12.`.

`python3 build.py` poskladá všetko do jedného súboru `dist/orbitalne-sektory.html` (dá sa otvoriť dvojklikom aj bez internetu na súbory hry).
`version.json` obsahuje číslo aktuálnej verzie (používa ho spúšťací panel).

## Spúšťací panel pre Windows
V priečinku `launcher/` je spúšťač pre testerov:
1. Stiahni súbor **`launcher/Orbitalne-Sektory.bat`** (na GitHube otvor súbor a klikni na *Download raw file*) a ulož ho napríklad na plochu.
2. Dvakrát naň klikni. Ak Windows zobrazí „Systém Windows ochránil váš počítač“, klikni na *Ďalšie informácie → Spustiť aj tak*.
3. Otvorí sa panel: ukáže nainštalovanú a najnovšiu verziu s novinkami, sám stiahne novú verziu a tlačidlom **ŠTART** spustí hru v samostatnom okne Edge (alebo Chrome).
4. Tlačidlo *Odkaz na ploche* vytvorí odkaz „Orbitálne Sektory“.

Hra sa inštaluje do `%LOCALAPPDATA%\OrbitalneSektory\hra`, uložené hry sú v `...\profil` a pri aktualizácii sa nemažú.
Panel sťahuje súbory z GitHubu bez prihlásenia, preto musí byť repozitár **verejný**.
Pri vydaní novej verzie treba zvýšiť číslo v `version.json` – podľa neho panel pozná, že je k dispozícii aktualizácia.

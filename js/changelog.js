'use strict';
/* Generuje tools/changelog.py – needituj ručne. Posledné verzie hry pre zoznam zmien v hlavnom menu (js/menu.js). */
const CHANGELOG=[
{
"v": "0.40.0",
"d": "2026-11-05",
"n": [
"Grafika: nová žiara (bloom) – motory, lasery, jadro stanice a žily minerálov teraz skutočne prežiaria do okolia (Nastavenia → Grafika: vypnutá / jemná / silná).",
"Grafika: odrazy prostredia – kovové povrchy lodí, stanice a pirátov odrážajú slnko a vesmír, takže nepôsobia ako plast (dá sa vypnúť).",
"Predvoľby grafiky: Nízka bez efektov, Stredná s odrazmi, Vysoká s jemnou žiarou, Ultra so silnou žiarou.",
"Vlastné 3D modely: ktorýkoľvek model v hre sa dá vymeniť za hotový .glb súbor – stačí ho nahrať do assets/models a zapísať do js/models.js (podrobnosti v README). Ak sa model nenačíta, ostane pôvodný.",
"Podpora komprimovaných modelov (Draco, Meshopt) a vlastnej HDRI mapy pre odrazy."
]
},
{
"v": "0.39.4",
"d": "2026-11-05",
"n": [
"Zvuk: pri hustej streľbe (salvy, veže, sprievodné drony, piráti) sa mohol vyčerpať limit naraz hrajúcich zvukov a ďalšie zvuky sa potom nehrali – limit je vyšší a počítadlo sa nemôže zaseknúť",
"Nastavenia → Zvuk: tlačidlo Test zvuku (prebudí zvuk, ak ho prehliadač uspal, a zahrá ukážku) a stav zvuku (beží / uspaný / zapne sa po kliknutí)"
]
},
{
"v": "0.39.3",
"d": "2026-11-05",
"n": [
"Oprava označovania na rozobratie: krížik na označenom predmete sa už neprekrýva s číslom vylepšenia (štýl zo zoznamu uložených hier sa omylom miešal s predmetmi)",
"Okno Výbavy má pevnú výšku – pri prechode medzi predmetmi sa už nemení jeho veľkosť",
"Ovládač na stanici: výber preskakuje tlačidlá zbalených slotov – už sa nedá omylom vylepšiť modul, ktorý nie je rozbalený"
]
},
{
"v": "0.39.2",
"d": "2026-11-05",
"n": [
"Ovládač: v menu (hlavne na stanici) je vždy zreteľne zvýraznený práve vybraný prvok – samotné tlačidlo svieti tyrkysovým rámikom aj žiarou a jeho karta/slot má jemný rámik; rámik sa už neschová za okraj ani pod efekty rarity a vybraný prvok sa vždy posunie do zorného poľa"
]
},
{
"v": "0.39.1",
"d": "2026-11-05",
"n": [
"Ovládač: vo Výbave sa dá krížovým ovládačom presunúť aj na nasadené predmety na lodi (štvorce okolo lode) – ukáže sa ich karta a A otvorí akcie, netreba prepínať na myš"
]
},
{
"v": "0.39.0",
"d": "2026-11-05",
"n": [
"Balans pirátov: výdrž rastie s úrovňou výzvy oveľa strmšie (×2,5 za úroveň), poškodenie mierne (×1,25); s rastúcou výbavou hra pôsobí postupne ľahšie a na úplnom vrchole (najlepšia výbava, výzva +16) padnú stredne silní piráti (korzári) na 1–2 rany, stíhačky na jednu, fregaty na 4–5",
"Ovládač: pri ovládaní ovládačom sa kurzor myši automaticky skryje (vráti sa, keď pohneš myšou)"
]
},
{
"v": "0.38.0",
"d": "2026-11-05",
"n": [
"Náklad lode 8× väčší (aj vlastnosť Náklad na predmetoch, staré predmety sa prepočítajú); dodávkové misie chcú 4× viac a platia 2× viac",
"Nová misia Odmena za hlavu: na mieste misie čaká silný hľadaný pirát (korzár, na ťažkej misii fregata) s červenou žiarou – zničením sa misia splní; misie Lov na pirátov sú teraz na všetkých mapách",
"Ovládač: A (Xbox) / ✕ (PlayStation) pri stanici, NPC alebo bráne v dosahu otvorí ich menu; tlačidlo na objekte ukazuje symbol",
"Zbrane: loď bez modulu zbrane má malé základné poškodenie; každý modul zbrane má vlastné Základné poškodenie – náhodne v rozsahu podľa rarity a úrovne predmetu; všetky percentá ho násobia",
"Kvalita vlastností: ak vlastnosť modulu padla v 90 % a viac zo svojho rozsahu, svieti zlato; pri 100 % hrubo červeno",
"Endgame: nová vlastnosť Násobič poškodenia (len Legendárne a vyššie) – násobiče z rôznych predmetov sa navzájom NÁSOBIA; s najlepšou výbavou ide poškodenie do stoviek miliónov až miliárd",
"Strmšie krivky: vylepšenia lode rastú na vyšších úrovniach oveľa viac a sú násobne drahšie; vylepšenie predmetov (+20 ≈ ×4,2) aj modulov stanice tiež strmšie",
"Výzva: úrovne sa odomykajú postupom (+1 za obsadený sektor, +2 za každých 5 vĺn v aréne), zamknuté štvorčeky majú zámok; zmena výzvy znova načíta sektor (ako skok), loď ostane pri stanici",
"Zvuky dlhšie (inšpirácia DarkOrbit): kovové doznievanie výstrelov, vesmírna ozvena medzi kanálmi, dlhšie výbuchy",
"Spúšťač Windows: v paneli úloh ikona hry namiesto ikony PowerShellu"
]
},
{
"v": "0.37.0",
"d": "2026-11-05",
"n": [
"Nové zvuky zbraní podľa hráčových ukážok (Dark / Deep / Universe / Bass): bleskový pokles výšky na začiatku, hutné basové telo s tmavnúcim filtrom, sub-bas a tmavé doznievanie",
"Každá rarita znie inak (sivá kratšia a vyššia, modrá štandard, zlatá najhlbšia, červená s chvením a skreslením, prvotná s akordom); veža hlbšia a dlhšia",
"Blesk: krátke nabitie s vlniacim sa filtrom a hlboký výboj s padajúcimi tónmi; piráti majú tmavé bzučivé výstrely s chvením, aby sa dali rozlíšiť od tvojich",
"Hlbšie zásahy"
]
},
{
"v": "0.36.3",
"d": "2026-11-05",
"n": [
"Oprava: stály šum v pozadí – zvuk ťažobného lúča bol počuť aj vtedy, keď loď neťažila (pulzovanie lúča obchádzalo jeho stlmenie); teraz je pri vypnutej ťažbe úplné ticho",
"Motory v pokoji takmer nepočuť, pri lete hlbší a menej šumivý hukot"
]
},
{
"v": "0.36.2",
"d": "2026-11-05",
"n": [
"Filmové zvuky namiesto „pixelových“: výstrely sú vrstvené (ostrý úder, energetické jadro s FM moduláciou, sub-basový náraz, jemná saturácia a dozvuk), každá rarita zbrane znie inak",
"Výbuchy s prasknutím, hutným telom, sub-basom a praskaním úlomkov; zničenie tvojej lode aj s dlhým dunením",
"Zásahy s kovovým zvonením trupu, blesk ako séria elektrických výbojov, skok bránou ako nábeh s výbuchom",
"Rozhranie: krátke sklenené tóny a vzdušné šuchoty, sonarový odpočet pri smrti, tlmená siréna",
"Hlbší hukot motorov a plynulý ťažobný lúč; dlhší a tmavší dozvuk; vyvážené hlasitosti a ochrana proti skresleniu"
]
},
{
"v": "0.36.1",
"d": "2026-11-05",
"n": [
"Snímky za sekundu: hra kreslí toľko snímok, koľko zvládne monitor – aj 144, 240 či 360 Hz (predvoľby Stredná, Vysoká aj Ultra); celá hra je od počtu snímok nezávislá",
"Grafika → Limit snímok: 30 / 60 / 120 / 144 / 240 / Podľa monitora; presnejšie dodržiavanie limitu",
"Grafika → Ukazovať FPS: malé počítadlo snímok hore v strede obrazovky",
"Spúšťače (Windows, Mac) spúšťajú prehliadač s plným využitím grafickej karty"
]
},
{
"v": "0.36.0",
"d": "2026-11-05",
"n": [
"Zničenie tvojej lode počas nájazdu na stanicu = prehraný súboj: stanica sa hneď vyradí ako pri jej zničení (piráti ukradnú časť surovín, stanica je na chvíľu mimo prevádzky)",
"Odpočet po smrti trvá 10 s a obnovenie treba potvrdiť: Obnoviť na základni (zadarmo, 20 % trupu) alebo Plné obnovenie za kredity (trup aj štíty na maximum, cena podľa veľkosti trupu a štítov)",
"Na obrazovke smrti funguje aj Enter (obnovenie na základni) a ovládač: A = na základni, X = plné obnovenie"
]
},
{
"v": "0.35.0",
"d": "2026-11-05",
"n": [
"Zvuk: všetky zvuky a hudba sa tvoria priamo v hre (bez súborov) – kliknutia a prechody po tlačidlách, otváranie okien, upozornenia, výstrely podľa rarity zbrane (aj veže a sprievodné drony), blesk, výstrely pirátov, zásahy, výbuchy, zbieranie koristi, vykladanie, skok bránou, poplach a odpočet pri smrti",
"Nepretržité zvuky: hukot motorov podľa rýchlosti lode a bzučanie ťažobného lasera",
"Generovaná ambientná vesmírna hudba (pomalé akordy, basový tón, hviezdne zvončeky s ozvenou); v boji sa pridá tepajúca vrstva, v hlavnom menu je jasnejšia",
"Priestorový zvuk (HRTF): výstrely a výbuchy počuť zo strany, kde sa dejú, vzdialené tichšie – najlepšie v slúchadlách; dá sa vypnúť",
"Nastavenia → Zvuk: celková hlasitosť, hudba, efekty, rozhranie a priestorový zvuk",
"Nastavenia sú rozdelené do sekcií: Uloženie, Hra, Ovládanie, Rozhranie, Grafika, Zvuk (z hlavného menu len spoločné sekcie)",
"Grafika: predvoľby Nízka / Stredná / Vysoká / Ultra a jednotlivo rozlíšenie vykresľovania, množstvo častíc, animované pozadie a limit snímok (30 / 60 / bez limitu)",
"Ovládanie: dá sa vypnúť sledovanie kurzora pri držaní tlačidla"
]
},
{
"v": "0.34.0",
"d": "2026-11-05",
"n": [
"Obranná veža ukazuje tenký červený laserový zameriavač od ústia hlavne k zameranému pirátovi",
"Veža strieľa rovnaké strely ako hráč (2–3 salvy, poškodenie nesie prvá) a vyletujú z ústia hlavne; ich vzhľad určuje rarita vylepšenia veže (+0 až +10), nie vložený čip",
"Pri prestavbe stanice či zmene sektora sa zameriavače veží správne skryjú"
]
},
{
"v": "0.33.1",
"d": "2026-11-05",
"n": [
"Úroveň výzvy sa presunula z Nastavení do stanice – nová záložka Výzva vedľa Skladu",
"Výzva ako 16 štvorčekov, ktoré sa plnia červenou – čím vyššia úroveň, tým sýtejšia; klik na štvorček nastaví úroveň priamo (klik na aktuálny ju zníži), ✕ / − / + zostali aj pre ovládač"
]
},
{
"v": "0.33.0",
"d": "2026-11-05",
"n": [
"Nad stanicou, zadávateľom misií, obchodníkom a skokovou bránou je polopriehľadné okrúhle tlačidlo s ikonou a názvom (mimo dosahu aj so vzdialenosťou); myš nad ním ho zvýrazní",
"Menu sa otvára len cez tieto tlačidlá: v dosahu tlačidlo svieti a otvorí menu hneď, inak loď k objektu doletí a menu otvorí po prílete; klik inde na stanicu či NPC je obyčajný presun lode",
"Pri prelete okolo stanice, NPC alebo brány sa okno už samo neotvára"
]
},
{
"v": "0.32.0",
"d": "2026-11-05",
"n": [
"Nová stanica podľa predlohy (rovnaká veľkosť): chrómovaný disk so stupňovitým nábojom okolo jadra, venček svetiel ako lupene, kanál s bronzovým zlato osvetleným dnom, 6 mostíkov s kupolami, hrubý palubný prstenec s oknami a 4 dlhé ramená do kríža s bronzovými kupolami a modulmi na koncoch",
"Energetické jadro je o 20 % menšie, farby podľa stavu ostali (modrá / zelená pri stanici / červená pri útoku); svetlá stanice sa menia s ním",
"Obranná veža podľa predlohy: podstavec so 4 nohami s pásovými chodidlami, otočná plošina a dlhé delo so zväzkom hlavní, modrým energetickým jadrom s cievkami a tyrkysovým ústím",
"Veže pri nečinnosti „v pohotovosti“ – chvíľu stoja, potom sa pomaly natočia a nakloňia inam, akoby prehľadávali okolie; pri nájazde rýchlo zamieria na piráta a pri výstrele hlaveň cúvne",
"Dok dronov: chrómový hangár s oblou rebrovanou strechou, osvetlenou bránou, bronzovými nádržami a pristávacou plochou so zaparkovaným dronom",
"Senzorové pole: technický podstavec s bronzovými skriňami a anténkami, stĺp a otáčajúca sa veľká parabola s trojnožkou a fialovým snímačom",
"Nové náhľady modulov vo všetkých menu (väčšie, kamera sa prispôsobí modelu)",
"Pohľad sa dá oddialiť ešte viac; nepriehľadnosť menu je pri prvom spustení 50 %"
]
},
{
"v": "0.31.5",
"d": "2026-11-05",
"n": [
"Ovládanie myšou aj prstom: pri držaní tlačidla loď stále sleduje bod pod kurzorom – aj keď sa myš nehýbe (kamera ide za loďou, takže loď plynulo letí ďalej a nezastaví sa na prvom mieste)",
"Popisy pri myši (asteroidy, piráti, stanica, HUD) sa obnovujú stále, nielen pri pohybe myšou – napr. zostávajúca surovina asteroidu alebo život piráta sa mení priamo pred očami"
]
},
{
"v": "0.31.4",
"d": "2026-11-05",
"n": [
"Bez systémových posuvníkov: menu sa už nikdy neposúvajú do strany a zvislé posuvníky sú tenké vo farbe hry",
"Náhľad mýtických a prvotných predmetov pulzuje len jasom (zväčšovanie vytváralo blikajúce posuvníky)",
"Panel stanice: opravené rozloženie rozbaleného slotu (zoznam modulov je pod slotom cez celú šírku), panel je širší a tlačidlo Postaviť sa zalomí, keď sa nezmestí"
]
},
{
"v": "0.31.3",
"d": "2026-11-05",
"n": [
"Uložiť a ukončiť: na webe, v aplikácii z plochy aj na telefóne hra po uložení vždy prejde do hlavného menu (prehliadač už nezatvorí kartu a neprejde na predchádzajúcu stránku); okno sa zatvára len v hre spustenej zo spúšťača na PC"
]
},
{
"v": "0.31.2",
"d": "2026-11-05",
"n": [
"Oprava ukladania v aplikácii z plochy na iPhone: hra sa teraz ukladá naraz do localStorage aj do IndexedDB a načíta sa z oboch – keď systém zápis do localStorage odmietne, uloženie aj tak prebehne",
"Pri štarte hra požiada systém, aby uložené dáta nemazal",
"V Nastaveniach pri uloženej hre je malý riadok so stavom úložiska (localStorage / IndexedDB) a chybová hláška ukazuje aj názov chyby"
]
},
{
"v": "0.31.1",
"d": "2026-11-05",
"n": [
"Oprava ukladania: ak hra beží bez zvoleného slotu (napr. po aktualizácii aplikácie na ploche zo starej verzie), slot sa priradí sám – automatické aj ručné ukladanie teraz vždy funguje",
"Ručné uloženie ukáže chybu, ak sa nepodarí zapísať (namiesto ticha)",
"Uložiť a ukončiť: tam, kde sa okno zavrieť nedá (iPhone, aplikácia na ploche, bežná karta), hra uloží a prejde do hlavného menu",
"Súbory hry majú značku verzie, aby prehliadač a aplikácia na ploche po aktualizácii nemiešali staré a nové súbory"
]
},
{
"v": "0.31.0",
"d": "2026-11-05",
"n": [
"Nové minerály vo vysokom rozlíšení: tmavý kameň s veľkými štiepnymi plochami, drsným povrchom a bronzovým nádychom na hranách",
"Cez kameň vedú svietiace pukliny ako blesky, okolo nich vnútorný svit a trblietky – ruda oranžovo, viridit zeleno, kryštály fialovo, zmiešané asteroidy všetkými tromi farbami a relikty zlato",
"Žily jemne pulzujú; tvar aj vzor povrchu sa počítajú v hre (bez obrázkov), takže je každý asteroid iný"
]
},
{
"v": "0.30.0",
"d": "2026-11-05",
"n": [
"Nové hlavné menu ako v bežnej hre: Pokračovať, Nová hra, Načítať hru, Nastavenia, Príručka; vpravo dole malý zoznam zmien (Všetky zmeny ho rozbalí). Ovláda sa myšou, dotykom, šípkami + Enter/Esc aj ovládačom",
"Fanart v hlavnom menu: živá 3D scéna – Bizón, Sokol a Pincer letia v zostave okolo planéty s diskom; na telefóne na výšku sú lode nad menu",
"Uložené hry: 3 sloty, každý s vlastnými automatickými uloženiami (3 s odstupom 5 min) a až 6 ručnými (v hre Nastavenia → Uložiť); pri slote vidno sektor, obtiažnosť, úroveň pilota, loď a odohraný čas",
"V hre v Nastaveniach: Uložiť a Hlavné menu; nastavenia HUD, ovládania a jazyk sú spoločné pre všetky sloty a dajú sa meniť aj z hlavného menu",
"Uloženia majú číslo schémy a postupné migrácie, takže hry uložené v starších verziách sa dajú načítať aj v nových; hra z verzie 0.29 a starších sa automaticky prenesie do slotu 1",
"Nightmare: zničenie lode zmaže celý slot a vráti hru do hlavného menu",
"Štartovacia loď Pincer má tmavý grafitový pancier namiesto bieleho (v hre aj v náhľadoch)"
]
},
{
"v": "0.29.0",
"d": "2026-11-05",
"n": [
"Kompaktný HUD: na telefónoch sa zapne automaticky – menšie panely a minimapa, spodné menu len s ikonami, zo sledovaných misií sa ukáže len jedna s čipom „+N“ (ťuknutím sa rozbalia všetky). V Nastaveniach sa dá prepnúť Auto / Zap / Vyp",
"Automatické schovávanie HUD (Nastavenia): po 4 s bez dotyku HUD sa spodné menu schová za malú šípku dole a panely ukážu len sektor, náklad, trup a minimapu; ťuknutím na panel alebo šípku (na PC priblížením myši k spodnému okraju) sa HUD rozbalí",
"Hra sa dá pridať na plochu telefónu ako aplikácia na celú obrazovku (iOS: Safari → Zdieľať → Pridať na plochu, Android: Chrome → ⋮ → Inštalovať aplikáciu); návod je v README",
"Hrateľná online verzia: https://reborneus.github.io/orbitalnesektory/"
]
}
];

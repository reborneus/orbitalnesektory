'use strict';
/* Generuje tools/changelog.py – needituj ručne. Posledné verzie hry pre zoznam zmien v hlavnom menu (js/menu.js). */
const CHANGELOG=[
{
"v": "0.46.1",
"d": "2026-11-05",
"n": [
"Oprava slotov navyše: Sokol má namiesto druhého ťažobného lasera druhý slot na zbraň; Bizón má po 2 sloty na ťažobný laser, štít aj zbraň; Klepeto (Pincer) má po jednom.",
"Druhá zbraň pridá do každej salvy ďalšiu strelu; základné poškodenie oboch zbraní sa sčíta a násobiče poškodenia sa násobia.",
"Predmet, ktorý bol v slote, ktorý loď už nemá (napr. druhý laser na Sokolovi), sa po načítaní hry vráti do inventára."
]
},
{
"v": "0.46.0",
"d": "2026-11-05",
"n": [
"Loot filter (Nastavenia → Hra): označ rarity, ktoré nechceš zbierať – takéto predmety sa neobjavia ako korisť ani v inventári, ale hneď sa na pozadí rozoberú na kredity.",
"Predané predmety sa zhrnú do jednej správy (počet a získané kredity). Nastavenie je spoločné pre všetky sloty uložených hier.",
"Príručka: loot filter v kapitole Automatizácia."
]
},
{
"v": "0.45.0",
"d": "2026-11-05",
"n": [
"Veľká mapa (len PC): kláves TAB otvorí mapu sektora cez celú obrazovku. Myšou nad značkou uvidíš, čo tam je – asteroid (surovina, koľko ostáva, za ako dlho ho vyťažíš), pirát (druh, výdrž, poškodenie, správanie), korisť, cieľ misie, obchodník, brána, stanica.",
"Na veľkej mape koliesko približuje, ťahanie posúva a klik na asteroid ho začne ťažiť, na piráta zaútočí, inde loď poletí na to miesto. TAB alebo Esc mapu zavrie.",
"Aréna: oveľa viac pirátov vo vyšších vlnách (asi 32 vo vlne 25, 59 vo vlne 50, 109 vo vlne 99) a navyše +3 % za každú úroveň výzvy; strop 140 naraz (na grafike Nízka 70), aby hra nespomalila.",
"Aréna: radiácia je zapnutá ako na ostatných mapách (pásy 3–4 a za horizontom).",
"Príručka: kapitola Veľká mapa, počty pirátov a radiácia v aréne."
]
},
{
"v": "0.44.0",
"d": "2026-11-05",
"n": [
"Aréna: piráti sa už nerodia na konci zóny 3, ale v okruhu asi 250 m okolo hráča; každá 4. vlna prilieta spomedzi zóny 1 a 2.",
"Čím vyššia vlna, tým viac sú piráti rozmiestnení: od vlny ~60 prilieta 10 % okolo hráča a po 30 % z okraja zóny 1, z okraja zóny 2 a zo stredu zóny 3 – v kŕdľoch po troch z rôznych strán.",
"Statické raketové veže stoja na okraji zóny 2, boss Dreadnought prilieta z okraja zóny 2 a hlavný boss zo stredu zóny 3.",
"Príručka: popis rozmiestnenia pirátov v aréne."
]
},
{
"v": "0.43.0",
"d": "2026-11-05",
"n": [
"Nový ukazovateľ výdrže nepriateľov: väčší, vždy natočený ku kamere, s tmavou dráhou (maximum), farebnou výplňou (červená → oranžová pod 50 % → žltá pod 25 %), bielym dobehom práve ubratého poškodenia a ryhami po 25 %.",
"Boss, Dreadnought, hľadaný pirát z misie a fregata v boji majú veľký ukazovateľ hore v strede obrazovky – meno, druh, výdrž číslom aj v percentách; nezraniteľný krížnik ukazuje počet zostávajúcich modulov.",
"Na telefóne na výšku je ukazovateľ bossa dole nad lištou namiesto pomocného textu, takže hraciu plochu nezmenšuje.",
"Príručka: 3D obrázky minerálov, pirátov, bossov arény, modulov stanice, dronu, sprievodných lodí, obchodníka a zadávateľa misií; mapa stromu výskumu.",
"Príručka: nové kapitoly Strom výskumu, Vyradená stanica v novom sektore, Grafika a vlastné modely; doplnené automatický lov pirátov, krúženie pri útoku, ukazovatele výdrže, počty pasívnych pirátov, výber štartu arény, sloty navyše a štatistiky pilota."
]
},
{
"v": "0.42.0",
"d": "2026-11-05",
"n": [
"Aréna: pred štartom (aj hneď po príchode do arény) si vyberieš, odkiaľ začať – od 1. vlny alebo hneď za ktorýmkoľvek porazeným bossom (napr. od vlny 21, 41…). Výber funguje aj na ovládači.",
"Nový strom výskumu (Pilot → Výskum): od 70. úrovne pilota idú všetky XP aj do výskumu – 250 úrovní, každá dá 1 bod výskumu.",
"Strom má 6 vetiev (zbrane, obrana, ťažba, let, obchod, stanica) a 265 uzlov: základné vylepšenia (napr. +1 % poškodenia, štítov, ťažby), význačné uzly so silnejšími bonusmi a 18 kľúčových uzlov so špeciálnymi schopnosťami.",
"Špeciálne schopnosti napr.: Odrazený lúč a Reťazový výboj (laser preskočí na ďalších nepriateľov), Supernova, Zrkadlový štít (odrazí pirátsku strelu na iného piráta), Nanoopravy, Posledná šanca, Rezonančný lúč (ťaží viac asteroidov naraz), Úskok, Zlatý dotyk, Prepojené veže a ďalšie.",
"Strom sa ovláda ťahaním (posun), kolieskom alebo dvoma prstami (priblíženie), tlačidlami +/− aj ovládačom; výskum sa dá za kredity vynulovať.",
"Štatistiky pilota v stĺpci Celkom zarátavajú aj výskum."
]
},
{
"v": "0.41.0",
"d": "2026-11-05",
"n": [
"Nový sektor: pri prvej návšteve je hlavná stanica vyradená a viditeľne poškodená (ohorené plechy, zastavené prstence, blikajúce červené jadro, ohne s iskrami, plávajúce trosky).",
"Vyradená stanica neprijme náklad, nedá sa na nej stavať, prestupovať na lode ani dobíjať radiačný štít a piráti na ňu nenalietavajú. Autopilot sa k nej nevracia.",
"Opravíš ju v paneli Stanica za suroviny, ktoré sa ťažia v predošlom sektore (cena rastie so sektorom).",
"Ak ťa zničia pri ešte neopravenej stanici, po odpočte a potvrdení sa nová loď zrodí na poslednej funkčnej základni, ktorú si navštívil.",
"Staršie uložené hry: stanice v obsadených sektoroch, v sektoroch s modulmi a v sektore, kde práve si, sú už opravené."
]
},
{
"v": "0.40.4",
"d": "2026-11-05",
"n": [
"Pilot → nová záložka Štatistiky: DPS (priemerné aj bez minutí a kritických zásahov), poškodenie salvy, presnosť, kritické zásahy, dostrel, trup, štíty, dobíjanie, ťažba, náklad, let a zisk. Každá hodnota v 3 stĺpcoch: základ lode s vylepšeniami, s výbavou a celkom so schopnosťami pilota.",
"Útok na piráta (automatický lov aj klik na piráta): loď okolo neho krúži v blízkosti, v dosahu jeho streľby. Kto chce držať odstup, musí loď viesť ručne.",
"Piráti majú o 10 % kratší dostrel, takže sa ich streľbe dá ručne vyhnúť a stále ich zasahovať."
]
},
{
"v": "0.40.3",
"d": "2026-11-05",
"n": [
"Sokol má druhý slot na laser, Bizón druhý slot na laser aj na štít. Vlastnosti oboch predmetov rovnakého typu sa sčítajú.",
"Pri nasadení sa predmet vloží do voľného slotu; ak sú oba obsadené, vymení slabší z nich. Klik na prázdny slot ponúkne predmety presne doňho.",
"Pri prestupe na loď bez slotu navyše sa predmet z neho vráti do inventára. Sloty navyše ukazuje aj karta lode v hangári."
]
},
{
"v": "0.40.2",
"d": "2026-11-05",
"n": [
"Lov pirátov: nová voľba „Napádať aj pasívnych pirátov“ – automatický lov potom útočí aj na pirátov, ktorí sami neútočia.",
"Lov pirátov: nová voľba „Loviť aj za horizontom“ – loď prenasleduje pirátov aj v radiácii za horizontom (lov stále skončí pri trupe pod 35 %).",
"Na každej mape je teraz dvojnásobný počet pirátov v pásoch."
]
},
{
"v": "0.40.1",
"d": "2026-11-05",
"n": [
"Automatický lov pirátov (Nastavenia → Hra): zapnutý samostatne loď sama letí po najbližšom pirátovi, zostrelí ho, pozbiera korisť a pokračuje ďalším.",
"Lov spolu s ťažbou: ťažba sa nepreruší, ale keď sa asteroid vyčerpá a pirát je v dosahu (šípka na okraji obrazovky), loď letí za ním a po boji sa vráti k ťažbe tej istej suroviny. Pri trupe pod 35 % lov skončí.",
"Oprava: pri automatickej ťažbe ťažobný laser po vyčerpaní asteroidu nakrátko preblikol až k novému cieľu."
]
},
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
}
];

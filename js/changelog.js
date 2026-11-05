'use strict';
/* Generuje tools/changelog.py – needituj ručne. Posledné verzie hry pre zoznam zmien v hlavnom menu (js/menu.js). */
const CHANGELOG=[
{
"v": "0.50.2",
"d": "2026-11-05",
"n": [
"Minimapa je ostrá hneď po načítaní hry – už ju netreba zväčšiť ani zmenšiť, aby sa obnovila kvalita.",
"Veľké čísla na kartách (veže, drony, stanica) a vo vlastnostiach predmetov majú oddelené tisíce bodkami (627.340), od milióna sa skracujú (1,62 M)."
]
},
{
"v": "0.50.1",
"d": "2026-11-05",
"n": [
"Hlavné menu má nové tlačidlo Ukončiť hru – v spúšťači zavrie okno hry, v prehliadači ukáže, že hra je uložená a kartu môžeš zavrieť."
]
},
{
"v": "0.50.0",
"d": "2026-11-05",
"n": [
"Stanica: každý obsadený sektor pridá jadru +2 úrovne. Nad úrovňou 5 výdrž stanice rastie prudko a od úrovne 8 má stanica veľký štít, ktorý zachytí útoky a sám sa dobíja (bublina so zábleskom pri zásahu).",
"Obranné veže: sila rastie so silou pirátov v sektore aj s úrovňou výzvy a krivka vylepšenia je od +4 oveľa strmšia (+5 ≈ 4×, +10 ≈ 30× základu). Dve veže +5 tesne ubránia nájazd na 3. mape pri výzve +5.",
"Čipy veží sú silnejšie (poškodenie 3×, kadencia a dosah 2×; staršie čipy sa zosilnili tiež) a dajú sa vylepšiť priamo v module stanice.",
"Inventár (PC a ovládač): detail predmetu je len v plávajúcom náhľade so skratkami – vylepšiť, nasadiť/zložiť, porovnať s ďalším nasadeným, vyhodiť do vesmíru, rozobrať, zamknúť. Na ovládači B vyskočí z predmetov.",
"Príručka: kapitoly Obrana stanice a Skratky v inventári."
]
},
{
"v": "0.49.0",
"d": "2026-11-05",
"n": [
"Štítová bublina je väčšia a obopína celú loď (podľa rozmerov modelu), takže už nepreráža trup – aj pri veľkých lodiach.",
"Bublina je viditeľná len pri úbytku štítu (zásah, radiácia) a pri jeho dobíjaní; inak je neviditeľná.",
"Zásah strely piráta alebo náraz asteroidu do štítu vytvorí na mieste dopadu záblesk s rozbiehajúcou sa vlnou.",
"Oprava: radiácia teraz ubíja štíty v pomere, v akom sa štíty v0.47 zväčšili (napr. 7× pri plne vylepšených štítoch), takže v radiácii vydržia rovnako dlho ako predtým. Do trupu ostáva radiácia rovnaká."
]
},
{
"v": "0.48.0",
"d": "2026-11-05",
"n": [
"Epické a Legendárne predmety padajú o 25 % menej často.",
"Šanca na lepšiu korisť z výbavy, pilota, výskumu a úrovne výzvy sa už nepripočítava, ale násobí: +66 % = šanca na Vzácne a lepšie × 1,66 (napr. 10 % → 16,6 %). Základná šanca sa nemení.",
"Loot filter: pre každú raritu Nechať, Predať alebo Podmienka – nechá si len predmety s aspoň zadaným počtom zlatých (vzácnych) vlastností, červených (mýtických) vlastností alebo so všetkými vlastnosťami červenými. Staršie nastavenie filtra sa prevedie automaticky.",
"Príručka: loot filter s podmienkami a násobenie šance na korisť."
]
},
{
"v": "0.47.0",
"d": "2026-11-05",
"n": [
"Nový model zadávateľa misií: biela veža s červenými svetlami – široká základňa so žiariacim podbruškom, vysoká veža so svetelnou štrbinou, zahnuté čepele a antény.",
"Nový model obchodníka: tmavosivá bojová stanica s modrými svetlami – pancierový trup s vežami, kruhový disk s kupolou a modrými prstencami, malé lode v sprievode.",
"Obchodník je teraz na každej mape. Prvú sprievodnú loď predáva v sektore 4 (Cygnus), druhú až v sektore 5 (Andromeda).",
"Z pirátov padá aj malé množstvo surovín rovno do nákladu. Náklad lode je ešte 2× väčší.",
"Štíty rastú rýchlejšie a zvládnu až asi 5× viac ako trup (body štítu z predmetov ×3, štítom pomáhajú % trupu aj nová vlastnosť % štítu). Radiácia teraz pomerne ubíja aj štíty, do trupu ostáva rovnaká.",
"Rýchlosť sa zobrazuje v cs (cosmic speed); maximum je 1 400 cs (160 m/s) a dosiahne sa asi pri 60 % všetkých vylepšení. Rýchlosť nad limit sa prepočíta na dosah zbraní.",
"Dosah pirátov rastie s tvojím dosahom zbraní už len z polovice – vylepšovať dosah sa oplatí.",
"Autopilot pri nájazde pirátov na stanicu preruší ťažbu a najprv bráni stanicu, aby si neprišiel o suroviny.",
"Príručka: nová kapitola Štíty, rýchlosť, náklad a dosah; aktualizovaný obchodník."
]
},
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
}
];

# Zoznam zmien – Orbitálne Sektory

Najnovšia verzia je hore. Staršie verzie hry sa dajú spustiť cez výber verzie v spúšťači (pozri README).

## 0.50

### v0.50.0 · 2026-11-05
- Stanica: každý obsadený sektor pridá jadru +2 úrovne. Nad úrovňou 5 výdrž stanice rastie prudko a od úrovne 8 má stanica veľký štít, ktorý zachytí útoky a sám sa dobíja (bublina so zábleskom pri zásahu).
- Obranné veže: sila rastie so silou pirátov v sektore aj s úrovňou výzvy a krivka vylepšenia je od +4 oveľa strmšia (+5 ≈ 4×, +10 ≈ 30× základu). Dve veže +5 tesne ubránia nájazd na 3. mape pri výzve +5.
- Čipy veží sú silnejšie (poškodenie 3×, kadencia a dosah 2×; staršie čipy sa zosilnili tiež) a dajú sa vylepšiť priamo v module stanice.
- Inventár (PC a ovládač): detail predmetu je len v plávajúcom náhľade so skratkami – vylepšiť, nasadiť/zložiť, porovnať s ďalším nasadeným, vyhodiť do vesmíru, rozobrať, zamknúť. Na ovládači B vyskočí z predmetov.
- Príručka: kapitoly Obrana stanice a Skratky v inventári.

## 0.49

### v0.49.0 · 2026-11-05
- Štítová bublina je väčšia a obopína celú loď (podľa rozmerov modelu), takže už nepreráža trup – aj pri veľkých lodiach.
- Bublina je viditeľná len pri úbytku štítu (zásah, radiácia) a pri jeho dobíjaní; inak je neviditeľná.
- Zásah strely piráta alebo náraz asteroidu do štítu vytvorí na mieste dopadu záblesk s rozbiehajúcou sa vlnou.
- Oprava: radiácia teraz ubíja štíty v pomere, v akom sa štíty v0.47 zväčšili (napr. 7× pri plne vylepšených štítoch), takže v radiácii vydržia rovnako dlho ako predtým. Do trupu ostáva radiácia rovnaká.

## 0.48

### v0.48.0 · 2026-11-05
- Epické a Legendárne predmety padajú o 25 % menej často.
- Šanca na lepšiu korisť z výbavy, pilota, výskumu a úrovne výzvy sa už nepripočítava, ale násobí: +66 % = šanca na Vzácne a lepšie × 1,66 (napr. 10 % → 16,6 %). Základná šanca sa nemení.
- Loot filter: pre každú raritu Nechať, Predať alebo Podmienka – nechá si len predmety s aspoň zadaným počtom zlatých (vzácnych) vlastností, červených (mýtických) vlastností alebo so všetkými vlastnosťami červenými. Staršie nastavenie filtra sa prevedie automaticky.
- Príručka: loot filter s podmienkami a násobenie šance na korisť.

## 0.47

### v0.47.0 · 2026-11-05
- Nový model zadávateľa misií: biela veža s červenými svetlami – široká základňa so žiariacim podbruškom, vysoká veža so svetelnou štrbinou, zahnuté čepele a antény.
- Nový model obchodníka: tmavosivá bojová stanica s modrými svetlami – pancierový trup s vežami, kruhový disk s kupolou a modrými prstencami, malé lode v sprievode.
- Obchodník je teraz na každej mape. Prvú sprievodnú loď predáva v sektore 4 (Cygnus), druhú až v sektore 5 (Andromeda).
- Z pirátov padá aj malé množstvo surovín rovno do nákladu. Náklad lode je ešte 2× väčší.
- Štíty rastú rýchlejšie a zvládnu až asi 5× viac ako trup (body štítu z predmetov ×3, štítom pomáhajú % trupu aj nová vlastnosť % štítu). Radiácia teraz pomerne ubíja aj štíty, do trupu ostáva rovnaká.
- Rýchlosť sa zobrazuje v cs (cosmic speed); maximum je 1 400 cs (160 m/s) a dosiahne sa asi pri 60 % všetkých vylepšení. Rýchlosť nad limit sa prepočíta na dosah zbraní.
- Dosah pirátov rastie s tvojím dosahom zbraní už len z polovice – vylepšovať dosah sa oplatí.
- Autopilot pri nájazde pirátov na stanicu preruší ťažbu a najprv bráni stanicu, aby si neprišiel o suroviny.
- Príručka: nová kapitola Štíty, rýchlosť, náklad a dosah; aktualizovaný obchodník.

## 0.46

### v0.46.1 · 2026-11-05
- Oprava slotov navyše: Sokol má namiesto druhého ťažobného lasera druhý slot na zbraň; Bizón má po 2 sloty na ťažobný laser, štít aj zbraň; Klepeto (Pincer) má po jednom.
- Druhá zbraň pridá do každej salvy ďalšiu strelu; základné poškodenie oboch zbraní sa sčíta a násobiče poškodenia sa násobia.
- Predmet, ktorý bol v slote, ktorý loď už nemá (napr. druhý laser na Sokolovi), sa po načítaní hry vráti do inventára.

### v0.46.0 · 2026-11-05
- Loot filter (Nastavenia → Hra): označ rarity, ktoré nechceš zbierať – takéto predmety sa neobjavia ako korisť ani v inventári, ale hneď sa na pozadí rozoberú na kredity.
- Predané predmety sa zhrnú do jednej správy (počet a získané kredity). Nastavenie je spoločné pre všetky sloty uložených hier.
- Príručka: loot filter v kapitole Automatizácia.

## 0.45

### v0.45.0 · 2026-11-05
- Veľká mapa (len PC): kláves TAB otvorí mapu sektora cez celú obrazovku. Myšou nad značkou uvidíš, čo tam je – asteroid (surovina, koľko ostáva, za ako dlho ho vyťažíš), pirát (druh, výdrž, poškodenie, správanie), korisť, cieľ misie, obchodník, brána, stanica.
- Na veľkej mape koliesko približuje, ťahanie posúva a klik na asteroid ho začne ťažiť, na piráta zaútočí, inde loď poletí na to miesto. TAB alebo Esc mapu zavrie.
- Aréna: oveľa viac pirátov vo vyšších vlnách (asi 32 vo vlne 25, 59 vo vlne 50, 109 vo vlne 99) a navyše +3 % za každú úroveň výzvy; strop 140 naraz (na grafike Nízka 70), aby hra nespomalila.
- Aréna: radiácia je zapnutá ako na ostatných mapách (pásy 3–4 a za horizontom).
- Príručka: kapitola Veľká mapa, počty pirátov a radiácia v aréne.

## 0.44

### v0.44.0 · 2026-11-05
- Aréna: piráti sa už nerodia na konci zóny 3, ale v okruhu asi 250 m okolo hráča; každá 4. vlna prilieta spomedzi zóny 1 a 2.
- Čím vyššia vlna, tým viac sú piráti rozmiestnení: od vlny ~60 prilieta 10 % okolo hráča a po 30 % z okraja zóny 1, z okraja zóny 2 a zo stredu zóny 3 – v kŕdľoch po troch z rôznych strán.
- Statické raketové veže stoja na okraji zóny 2, boss Dreadnought prilieta z okraja zóny 2 a hlavný boss zo stredu zóny 3.
- Príručka: popis rozmiestnenia pirátov v aréne.

## 0.43

### v0.43.0 · 2026-11-05
- Nový ukazovateľ výdrže nepriateľov: väčší, vždy natočený ku kamere, s tmavou dráhou (maximum), farebnou výplňou (červená → oranžová pod 50 % → žltá pod 25 %), bielym dobehom práve ubratého poškodenia a ryhami po 25 %.
- Boss, Dreadnought, hľadaný pirát z misie a fregata v boji majú veľký ukazovateľ hore v strede obrazovky – meno, druh, výdrž číslom aj v percentách; nezraniteľný krížnik ukazuje počet zostávajúcich modulov.
- Na telefóne na výšku je ukazovateľ bossa dole nad lištou namiesto pomocného textu, takže hraciu plochu nezmenšuje.
- Príručka: 3D obrázky minerálov, pirátov, bossov arény, modulov stanice, dronu, sprievodných lodí, obchodníka a zadávateľa misií; mapa stromu výskumu.
- Príručka: nové kapitoly Strom výskumu, Vyradená stanica v novom sektore, Grafika a vlastné modely; doplnené automatický lov pirátov, krúženie pri útoku, ukazovatele výdrže, počty pasívnych pirátov, výber štartu arény, sloty navyše a štatistiky pilota.

## 0.42

### v0.42.0 · 2026-11-05
- Aréna: pred štartom (aj hneď po príchode do arény) si vyberieš, odkiaľ začať – od 1. vlny alebo hneď za ktorýmkoľvek porazeným bossom (napr. od vlny 21, 41…). Výber funguje aj na ovládači.
- Nový strom výskumu (Pilot → Výskum): od 70. úrovne pilota idú všetky XP aj do výskumu – 250 úrovní, každá dá 1 bod výskumu.
- Strom má 6 vetiev (zbrane, obrana, ťažba, let, obchod, stanica) a 265 uzlov: základné vylepšenia (napr. +1 % poškodenia, štítov, ťažby), význačné uzly so silnejšími bonusmi a 18 kľúčových uzlov so špeciálnymi schopnosťami.
- Špeciálne schopnosti napr.: Odrazený lúč a Reťazový výboj (laser preskočí na ďalších nepriateľov), Supernova, Zrkadlový štít (odrazí pirátsku strelu na iného piráta), Nanoopravy, Posledná šanca, Rezonančný lúč (ťaží viac asteroidov naraz), Úskok, Zlatý dotyk, Prepojené veže a ďalšie.
- Strom sa ovláda ťahaním (posun), kolieskom alebo dvoma prstami (priblíženie), tlačidlami +/− aj ovládačom; výskum sa dá za kredity vynulovať.
- Štatistiky pilota v stĺpci Celkom zarátavajú aj výskum.

## 0.41

### v0.41.0 · 2026-11-05
- Nový sektor: pri prvej návšteve je hlavná stanica vyradená a viditeľne poškodená (ohorené plechy, zastavené prstence, blikajúce červené jadro, ohne s iskrami, plávajúce trosky).
- Vyradená stanica neprijme náklad, nedá sa na nej stavať, prestupovať na lode ani dobíjať radiačný štít a piráti na ňu nenalietavajú. Autopilot sa k nej nevracia.
- Opravíš ju v paneli Stanica za suroviny, ktoré sa ťažia v predošlom sektore (cena rastie so sektorom).
- Ak ťa zničia pri ešte neopravenej stanici, po odpočte a potvrdení sa nová loď zrodí na poslednej funkčnej základni, ktorú si navštívil.
- Staršie uložené hry: stanice v obsadených sektoroch, v sektoroch s modulmi a v sektore, kde práve si, sú už opravené.

## 0.40

### v0.40.4 · 2026-11-05
- Pilot → nová záložka Štatistiky: DPS (priemerné aj bez minutí a kritických zásahov), poškodenie salvy, presnosť, kritické zásahy, dostrel, trup, štíty, dobíjanie, ťažba, náklad, let a zisk. Každá hodnota v 3 stĺpcoch: základ lode s vylepšeniami, s výbavou a celkom so schopnosťami pilota.
- Útok na piráta (automatický lov aj klik na piráta): loď okolo neho krúži v blízkosti, v dosahu jeho streľby. Kto chce držať odstup, musí loď viesť ručne.
- Piráti majú o 10 % kratší dostrel, takže sa ich streľbe dá ručne vyhnúť a stále ich zasahovať.

### v0.40.3 · 2026-11-05
- Sokol má druhý slot na laser, Bizón druhý slot na laser aj na štít. Vlastnosti oboch predmetov rovnakého typu sa sčítajú.
- Pri nasadení sa predmet vloží do voľného slotu; ak sú oba obsadené, vymení slabší z nich. Klik na prázdny slot ponúkne predmety presne doňho.
- Pri prestupe na loď bez slotu navyše sa predmet z neho vráti do inventára. Sloty navyše ukazuje aj karta lode v hangári.

### v0.40.2 · 2026-11-05
- Lov pirátov: nová voľba „Napádať aj pasívnych pirátov“ – automatický lov potom útočí aj na pirátov, ktorí sami neútočia.
- Lov pirátov: nová voľba „Loviť aj za horizontom“ – loď prenasleduje pirátov aj v radiácii za horizontom (lov stále skončí pri trupe pod 35 %).
- Na každej mape je teraz dvojnásobný počet pirátov v pásoch.

### v0.40.1 · 2026-11-05
- Automatický lov pirátov (Nastavenia → Hra): zapnutý samostatne loď sama letí po najbližšom pirátovi, zostrelí ho, pozbiera korisť a pokračuje ďalším.
- Lov spolu s ťažbou: ťažba sa nepreruší, ale keď sa asteroid vyčerpá a pirát je v dosahu (šípka na okraji obrazovky), loď letí za ním a po boji sa vráti k ťažbe tej istej suroviny. Pri trupe pod 35 % lov skončí.
- Oprava: pri automatickej ťažbe ťažobný laser po vyčerpaní asteroidu nakrátko preblikol až k novému cieľu.

### v0.40.0 · 2026-11-05
- Grafika: nová žiara (bloom) – motory, lasery, jadro stanice a žily minerálov teraz skutočne prežiaria do okolia (Nastavenia → Grafika: vypnutá / jemná / silná).
- Grafika: odrazy prostredia – kovové povrchy lodí, stanice a pirátov odrážajú slnko a vesmír, takže nepôsobia ako plast (dá sa vypnúť).
- Predvoľby grafiky: Nízka bez efektov, Stredná s odrazmi, Vysoká s jemnou žiarou, Ultra so silnou žiarou.
- Vlastné 3D modely: ktorýkoľvek model v hre sa dá vymeniť za hotový .glb súbor – stačí ho nahrať do assets/models a zapísať do js/models.js (podrobnosti v README). Ak sa model nenačíta, ostane pôvodný.
- Podpora komprimovaných modelov (Draco, Meshopt) a vlastnej HDRI mapy pre odrazy.

## 0.39

### v0.39.4 · 2026-11-05
- Zvuk: pri hustej streľbe (salvy, veže, sprievodné drony, piráti) sa mohol vyčerpať limit naraz hrajúcich zvukov a ďalšie zvuky sa potom nehrali – limit je vyšší a počítadlo sa nemôže zaseknúť
- Nastavenia → Zvuk: tlačidlo Test zvuku (prebudí zvuk, ak ho prehliadač uspal, a zahrá ukážku) a stav zvuku (beží / uspaný / zapne sa po kliknutí)

### v0.39.3 · 2026-11-05
- Oprava označovania na rozobratie: krížik na označenom predmete sa už neprekrýva s číslom vylepšenia (štýl zo zoznamu uložených hier sa omylom miešal s predmetmi)
- Okno Výbavy má pevnú výšku – pri prechode medzi predmetmi sa už nemení jeho veľkosť
- Ovládač na stanici: výber preskakuje tlačidlá zbalených slotov – už sa nedá omylom vylepšiť modul, ktorý nie je rozbalený

### v0.39.2 · 2026-11-05
- Ovládač: v menu (hlavne na stanici) je vždy zreteľne zvýraznený práve vybraný prvok – samotné tlačidlo svieti tyrkysovým rámikom aj žiarou a jeho karta/slot má jemný rámik; rámik sa už neschová za okraj ani pod efekty rarity a vybraný prvok sa vždy posunie do zorného poľa

### v0.39.1 · 2026-11-05
- Ovládač: vo Výbave sa dá krížovým ovládačom presunúť aj na nasadené predmety na lodi (štvorce okolo lode) – ukáže sa ich karta a A otvorí akcie, netreba prepínať na myš

### v0.39.0 · 2026-11-05
- Balans pirátov: výdrž rastie s úrovňou výzvy oveľa strmšie (×2,5 za úroveň), poškodenie mierne (×1,25); s rastúcou výbavou hra pôsobí postupne ľahšie a na úplnom vrchole (najlepšia výbava, výzva +16) padnú stredne silní piráti (korzári) na 1–2 rany, stíhačky na jednu, fregaty na 4–5
- Ovládač: pri ovládaní ovládačom sa kurzor myši automaticky skryje (vráti sa, keď pohneš myšou)

## 0.38

### v0.38.0 · 2026-11-05
- Náklad lode 8× väčší (aj vlastnosť Náklad na predmetoch, staré predmety sa prepočítajú); dodávkové misie chcú 4× viac a platia 2× viac
- Nová misia Odmena za hlavu: na mieste misie čaká silný hľadaný pirát (korzár, na ťažkej misii fregata) s červenou žiarou – zničením sa misia splní; misie Lov na pirátov sú teraz na všetkých mapách
- Ovládač: A (Xbox) / ✕ (PlayStation) pri stanici, NPC alebo bráne v dosahu otvorí ich menu; tlačidlo na objekte ukazuje symbol
- Zbrane: loď bez modulu zbrane má malé základné poškodenie; každý modul zbrane má vlastné Základné poškodenie – náhodne v rozsahu podľa rarity a úrovne predmetu; všetky percentá ho násobia
- Kvalita vlastností: ak vlastnosť modulu padla v 90 % a viac zo svojho rozsahu, svieti zlato; pri 100 % hrubo červeno
- Endgame: nová vlastnosť Násobič poškodenia (len Legendárne a vyššie) – násobiče z rôznych predmetov sa navzájom NÁSOBIA; s najlepšou výbavou ide poškodenie do stoviek miliónov až miliárd
- Strmšie krivky: vylepšenia lode rastú na vyšších úrovniach oveľa viac a sú násobne drahšie; vylepšenie predmetov (+20 ≈ ×4,2) aj modulov stanice tiež strmšie
- Výzva: úrovne sa odomykajú postupom (+1 za obsadený sektor, +2 za každých 5 vĺn v aréne), zamknuté štvorčeky majú zámok; zmena výzvy znova načíta sektor (ako skok), loď ostane pri stanici
- Zvuky dlhšie (inšpirácia DarkOrbit): kovové doznievanie výstrelov, vesmírna ozvena medzi kanálmi, dlhšie výbuchy
- Spúšťač Windows: v paneli úloh ikona hry namiesto ikony PowerShellu

## 0.37

### v0.37.0 · 2026-11-05
- Nové zvuky zbraní podľa hráčových ukážok (Dark / Deep / Universe / Bass): bleskový pokles výšky na začiatku, hutné basové telo s tmavnúcim filtrom, sub-bas a tmavé doznievanie
- Každá rarita znie inak (sivá kratšia a vyššia, modrá štandard, zlatá najhlbšia, červená s chvením a skreslením, prvotná s akordom); veža hlbšia a dlhšia
- Blesk: krátke nabitie s vlniacim sa filtrom a hlboký výboj s padajúcimi tónmi; piráti majú tmavé bzučivé výstrely s chvením, aby sa dali rozlíšiť od tvojich
- Hlbšie zásahy

## 0.36

### v0.36.3 · 2026-11-05
- Oprava: stály šum v pozadí – zvuk ťažobného lúča bol počuť aj vtedy, keď loď neťažila (pulzovanie lúča obchádzalo jeho stlmenie); teraz je pri vypnutej ťažbe úplné ticho
- Motory v pokoji takmer nepočuť, pri lete hlbší a menej šumivý hukot

### v0.36.2 · 2026-11-05
- Filmové zvuky namiesto „pixelových“: výstrely sú vrstvené (ostrý úder, energetické jadro s FM moduláciou, sub-basový náraz, jemná saturácia a dozvuk), každá rarita zbrane znie inak
- Výbuchy s prasknutím, hutným telom, sub-basom a praskaním úlomkov; zničenie tvojej lode aj s dlhým dunením
- Zásahy s kovovým zvonením trupu, blesk ako séria elektrických výbojov, skok bránou ako nábeh s výbuchom
- Rozhranie: krátke sklenené tóny a vzdušné šuchoty, sonarový odpočet pri smrti, tlmená siréna
- Hlbší hukot motorov a plynulý ťažobný lúč; dlhší a tmavší dozvuk; vyvážené hlasitosti a ochrana proti skresleniu

### v0.36.1 · 2026-11-05
- Snímky za sekundu: hra kreslí toľko snímok, koľko zvládne monitor – aj 144, 240 či 360 Hz (predvoľby Stredná, Vysoká aj Ultra); celá hra je od počtu snímok nezávislá
- Grafika → Limit snímok: 30 / 60 / 120 / 144 / 240 / Podľa monitora; presnejšie dodržiavanie limitu
- Grafika → Ukazovať FPS: malé počítadlo snímok hore v strede obrazovky
- Spúšťače (Windows, Mac) spúšťajú prehliadač s plným využitím grafickej karty

### v0.36.0 · 2026-11-05
- Zničenie tvojej lode počas nájazdu na stanicu = prehraný súboj: stanica sa hneď vyradí ako pri jej zničení (piráti ukradnú časť surovín, stanica je na chvíľu mimo prevádzky)
- Odpočet po smrti trvá 10 s a obnovenie treba potvrdiť: Obnoviť na základni (zadarmo, 20 % trupu) alebo Plné obnovenie za kredity (trup aj štíty na maximum, cena podľa veľkosti trupu a štítov)
- Na obrazovke smrti funguje aj Enter (obnovenie na základni) a ovládač: A = na základni, X = plné obnovenie

## 0.35

### v0.35.0 · 2026-11-05
- Zvuk: všetky zvuky a hudba sa tvoria priamo v hre (bez súborov) – kliknutia a prechody po tlačidlách, otváranie okien, upozornenia, výstrely podľa rarity zbrane (aj veže a sprievodné drony), blesk, výstrely pirátov, zásahy, výbuchy, zbieranie koristi, vykladanie, skok bránou, poplach a odpočet pri smrti
- Nepretržité zvuky: hukot motorov podľa rýchlosti lode a bzučanie ťažobného lasera
- Generovaná ambientná vesmírna hudba (pomalé akordy, basový tón, hviezdne zvončeky s ozvenou); v boji sa pridá tepajúca vrstva, v hlavnom menu je jasnejšia
- Priestorový zvuk (HRTF): výstrely a výbuchy počuť zo strany, kde sa dejú, vzdialené tichšie – najlepšie v slúchadlách; dá sa vypnúť
- Nastavenia → Zvuk: celková hlasitosť, hudba, efekty, rozhranie a priestorový zvuk
- Nastavenia sú rozdelené do sekcií: Uloženie, Hra, Ovládanie, Rozhranie, Grafika, Zvuk (z hlavného menu len spoločné sekcie)
- Grafika: predvoľby Nízka / Stredná / Vysoká / Ultra a jednotlivo rozlíšenie vykresľovania, množstvo častíc, animované pozadie a limit snímok (30 / 60 / bez limitu)
- Ovládanie: dá sa vypnúť sledovanie kurzora pri držaní tlačidla

## 0.34

### v0.34.0 · 2026-11-05
- Obranná veža ukazuje tenký červený laserový zameriavač od ústia hlavne k zameranému pirátovi
- Veža strieľa rovnaké strely ako hráč (2–3 salvy, poškodenie nesie prvá) a vyletujú z ústia hlavne; ich vzhľad určuje rarita vylepšenia veže (+0 až +10), nie vložený čip
- Pri prestavbe stanice či zmene sektora sa zameriavače veží správne skryjú

## 0.33

### v0.33.1 · 2026-11-05
- Úroveň výzvy sa presunula z Nastavení do stanice – nová záložka Výzva vedľa Skladu
- Výzva ako 16 štvorčekov, ktoré sa plnia červenou – čím vyššia úroveň, tým sýtejšia; klik na štvorček nastaví úroveň priamo (klik na aktuálny ju zníži), ✕ / − / + zostali aj pre ovládač

### v0.33.0 · 2026-11-05
- Nad stanicou, zadávateľom misií, obchodníkom a skokovou bránou je polopriehľadné okrúhle tlačidlo s ikonou a názvom (mimo dosahu aj so vzdialenosťou); myš nad ním ho zvýrazní
- Menu sa otvára len cez tieto tlačidlá: v dosahu tlačidlo svieti a otvorí menu hneď, inak loď k objektu doletí a menu otvorí po prílete; klik inde na stanicu či NPC je obyčajný presun lode
- Pri prelete okolo stanice, NPC alebo brány sa okno už samo neotvára

## 0.32

### v0.32.0 · 2026-11-05
- Nová stanica podľa predlohy (rovnaká veľkosť): chrómovaný disk so stupňovitým nábojom okolo jadra, venček svetiel ako lupene, kanál s bronzovým zlato osvetleným dnom, 6 mostíkov s kupolami, hrubý palubný prstenec s oknami a 4 dlhé ramená do kríža s bronzovými kupolami a modulmi na koncoch
- Energetické jadro je o 20 % menšie, farby podľa stavu ostali (modrá / zelená pri stanici / červená pri útoku); svetlá stanice sa menia s ním
- Obranná veža podľa predlohy: podstavec so 4 nohami s pásovými chodidlami, otočná plošina a dlhé delo so zväzkom hlavní, modrým energetickým jadrom s cievkami a tyrkysovým ústím
- Veže pri nečinnosti „v pohotovosti“ – chvíľu stoja, potom sa pomaly natočia a nakloňia inam, akoby prehľadávali okolie; pri nájazde rýchlo zamieria na piráta a pri výstrele hlaveň cúvne
- Dok dronov: chrómový hangár s oblou rebrovanou strechou, osvetlenou bránou, bronzovými nádržami a pristávacou plochou so zaparkovaným dronom
- Senzorové pole: technický podstavec s bronzovými skriňami a anténkami, stĺp a otáčajúca sa veľká parabola s trojnožkou a fialovým snímačom
- Nové náhľady modulov vo všetkých menu (väčšie, kamera sa prispôsobí modelu)
- Pohľad sa dá oddialiť ešte viac; nepriehľadnosť menu je pri prvom spustení 50 %

## 0.31

### v0.31.5 · 2026-11-05
- Ovládanie myšou aj prstom: pri držaní tlačidla loď stále sleduje bod pod kurzorom – aj keď sa myš nehýbe (kamera ide za loďou, takže loď plynulo letí ďalej a nezastaví sa na prvom mieste)
- Popisy pri myši (asteroidy, piráti, stanica, HUD) sa obnovujú stále, nielen pri pohybe myšou – napr. zostávajúca surovina asteroidu alebo život piráta sa mení priamo pred očami

### v0.31.4 · 2026-11-05
- Bez systémových posuvníkov: menu sa už nikdy neposúvajú do strany a zvislé posuvníky sú tenké vo farbe hry
- Náhľad mýtických a prvotných predmetov pulzuje len jasom (zväčšovanie vytváralo blikajúce posuvníky)
- Panel stanice: opravené rozloženie rozbaleného slotu (zoznam modulov je pod slotom cez celú šírku), panel je širší a tlačidlo Postaviť sa zalomí, keď sa nezmestí

### v0.31.3 · 2026-11-05
- Uložiť a ukončiť: na webe, v aplikácii z plochy aj na telefóne hra po uložení vždy prejde do hlavného menu (prehliadač už nezatvorí kartu a neprejde na predchádzajúcu stránku); okno sa zatvára len v hre spustenej zo spúšťača na PC

### v0.31.2 · 2026-11-05
- Oprava ukladania v aplikácii z plochy na iPhone: hra sa teraz ukladá naraz do localStorage aj do IndexedDB a načíta sa z oboch – keď systém zápis do localStorage odmietne, uloženie aj tak prebehne
- Pri štarte hra požiada systém, aby uložené dáta nemazal
- V Nastaveniach pri uloženej hre je malý riadok so stavom úložiska (localStorage / IndexedDB) a chybová hláška ukazuje aj názov chyby

### v0.31.1 · 2026-11-05
- Oprava ukladania: ak hra beží bez zvoleného slotu (napr. po aktualizácii aplikácie na ploche zo starej verzie), slot sa priradí sám – automatické aj ručné ukladanie teraz vždy funguje
- Ručné uloženie ukáže chybu, ak sa nepodarí zapísať (namiesto ticha)
- Uložiť a ukončiť: tam, kde sa okno zavrieť nedá (iPhone, aplikácia na ploche, bežná karta), hra uloží a prejde do hlavného menu
- Súbory hry majú značku verzie, aby prehliadač a aplikácia na ploche po aktualizácii nemiešali staré a nové súbory

### v0.31.0 · 2026-11-05
- Nové minerály vo vysokom rozlíšení: tmavý kameň s veľkými štiepnymi plochami, drsným povrchom a bronzovým nádychom na hranách
- Cez kameň vedú svietiace pukliny ako blesky, okolo nich vnútorný svit a trblietky – ruda oranžovo, viridit zeleno, kryštály fialovo, zmiešané asteroidy všetkými tromi farbami a relikty zlato
- Žily jemne pulzujú; tvar aj vzor povrchu sa počítajú v hre (bez obrázkov), takže je každý asteroid iný

## 0.30

### v0.30.0 · 2026-11-05
- Nové hlavné menu ako v bežnej hre: Pokračovať, Nová hra, Načítať hru, Nastavenia, Príručka; vpravo dole malý zoznam zmien (Všetky zmeny ho rozbalí). Ovláda sa myšou, dotykom, šípkami + Enter/Esc aj ovládačom
- Fanart v hlavnom menu: živá 3D scéna – Bizón, Sokol a Pincer letia v zostave okolo planéty s diskom; na telefóne na výšku sú lode nad menu
- Uložené hry: 3 sloty, každý s vlastnými automatickými uloženiami (3 s odstupom 5 min) a až 6 ručnými (v hre Nastavenia → Uložiť); pri slote vidno sektor, obtiažnosť, úroveň pilota, loď a odohraný čas
- V hre v Nastaveniach: Uložiť a Hlavné menu; nastavenia HUD, ovládania a jazyk sú spoločné pre všetky sloty a dajú sa meniť aj z hlavného menu
- Uloženia majú číslo schémy a postupné migrácie, takže hry uložené v starších verziách sa dajú načítať aj v nových; hra z verzie 0.29 a starších sa automaticky prenesie do slotu 1
- Nightmare: zničenie lode zmaže celý slot a vráti hru do hlavného menu
- Štartovacia loď Pincer má tmavý grafitový pancier namiesto bieleho (v hre aj v náhľadoch)

## 0.29

### v0.29.0 · 2026-11-05
- Kompaktný HUD: na telefónoch sa zapne automaticky – menšie panely a minimapa, spodné menu len s ikonami, zo sledovaných misií sa ukáže len jedna s čipom „+N“ (ťuknutím sa rozbalia všetky). V Nastaveniach sa dá prepnúť Auto / Zap / Vyp
- Automatické schovávanie HUD (Nastavenia): po 4 s bez dotyku HUD sa spodné menu schová za malú šípku dole a panely ukážu len sektor, náklad, trup a minimapu; ťuknutím na panel alebo šípku (na PC priblížením myši k spodnému okraju) sa HUD rozbalí
- Hra sa dá pridať na plochu telefónu ako aplikácia na celú obrazovku (iOS: Safari → Zdieľať → Pridať na plochu, Android: Chrome → ⋮ → Inštalovať aplikáciu); návod je v README
- Hrateľná online verzia: https://reborneus.github.io/orbitalnesektory/

## 0.28

### v0.28.0 · 2026-11-05
- Oprava: po zničení a znovuzrodení loď už automaticky neletí späť na miesto smrti (zrušia sa útok, autopilotný cieľ aj čakajúce príkazy)
- Nová obrazovka smrti s červenou lebkou, strateným nákladom a 5-sekundovým odpočtom; nová loď sa zrodí pri stanici až po odpočte
- Po znovuzrodení má loď iba 20 % trupu a prázdny štít
- Miesto poslednej smrti je na minimape označené červenou smrtkou (mimo dosahu sa drží pri okraji); keď k nemu priletíš, značka zmizne

## 0.27

### v0.27.0 · 2026-11-04
- Nová obrazovka výbavy: loď v strede, okolo nej 6 štvorcov slotov (laser, motor, trup, štít, doplnok, zbraň) a šípky od lode k nim vo farbe rarity; prázdny slot ukazuje počet vhodných predmetov
- Klik na predmet v inventári ho rovno nasadí / vymení s predmetom v lodi
- Karta predmetu s možnosťami (vylepšiť, rozobrať, zamknúť, do skladu, zložiť) sa ukáže pri predmete pod myšou aj pod výberom ovládača; na širokej obrazovke vpravo vedľa okna
- Skoková brána je 2,6× väčšia a naklonená, aby ňou vizuálne prešli aj veľké lode
- Pri vkladaní predmetov sa dá zvoliť aj konkrétny typ predmetu

## 0.26

### v0.26.0 · 2026-11-04
- Stanica v strede mapy je 3× väčšia (moduly ostali v pôvodnej veľkosti) a leží hlbšie pod rovinou letu; dosah stanice, vykladanie a zásahy pirátov sa jej veľkosti prispôsobili
- Po skoku bránou sa loď objaví pri bráne v novom sektore (nie v strede pri stanici)
- Pasívni piráti vo všetkých mapách okrem arény: 1. mapa 2× viac (26), 2. mapa ešte viac (34); od 3. mapy aj korzári, od 4. aj fregaty a pribúda agresívnych (zaútočia, keď sa priblížiš; na minimape a šípkach červení), na vyšších mapách silnejší

## 0.25

### v0.25.0 · 2026-11-04
- Minimapa sa dá zväčšiť a zmenšiť (5 veľkostí): tlačidlá − / + pri minimape, koliesko myši nad minimapou, na ovládači R3 (dookola); veľkosť sa uloží
- PC: režim úpravy rozloženia HUD (Nastavenia → Rozloženie HUD → Upraviť) – panely sektora, surovín, minimapu a dolnú lištu presunieš ťahaním myšou; rozloženie sa uloží, dá sa vrátiť na pôvodné
- PC: okná ako hangár, vylepšenia lode, výbava či mapa sa otvárajú v strede obrazovky nad dolnou lištou (lišta zostáva viditeľná)

## 0.24

### v0.24.1 · 2026-11-04
- Oprava spúšťacieho panela pre Windows: v0.23.1 sa panel vôbec neotvoril (chyba v skripte panela); teraz sa opäť otvorí

### v0.24.0 · 2026-11-04
- Korisť vo vesmíre (z asteroidov, pirátov) je teraz otáčajúca sa kozmická kocka: na stenách vesmír (špirálová galaxia, hmlovina vo farbe rarity, blikajúce hviezdy), svietiace biele hrany; každý predmet má iný vzor a jednu z variant (samotná kocka / vnútorná drôtená kocka točiaca sa opačne / väčší drôtený rám), od Mytickej vždy s rámom; farby rarity, svetelný stĺp aj krúžok ostali
- Anomália v aréne je veľká fialová kozmická kocka s rámom

## 0.23

### v0.23.1 · 2026-11-04
- Spúšťací panel pre Windows: nový tmavý moderný vzhľad ako menu v hre (karty so zaoblenými rohmi, tyrkysové ŠTART, tmavý titulok okna)
- Panel sa spúšťa bez prázdneho okna PowerShellu (nový skrytý spúšťač .vbs); po aktualizácii v paneli klikni na „Odkaz na ploche“, aby odkaz používal nový spúšťač
- Nové políčko „Po spustení hry nechať panel otvorený“ (Windows aj Mac)

### v0.23.0 · 2026-11-04
- Orion Hlbina: nová realistická čierna diera podľa videa – čierny tieň, tenký fotónový prstenec, disk takmer z boku prechádzajúci pred tieňom, ohnutý obraz zadnej časti disku nad a pod tieňom, jedna strana jasnejšia (Dopplerov jav), dlhý šedý prachový chvost s vláknami; tmavé hviezdne pozadie
- Náhľady lodí v hangári sú menšie a bez pozadia (len model lode); náhľady pomocných dronov tiež bez pozadia
- Nastavenia: posuvník priehľadnosti menu (35–100 %); pri nižšej hodnote vidieť hru cez rozostrené menu

## 0.22

### v0.22.0 · 2026-11-04
- Realistické pozadia aj pre ostatné mapy (počítané shadermi, s hĺbkou a pomalým pohybom): Vega Drift – tyrkysovo-fialová emisná hmlovina s prachovými piliermi a hviezdokopami; Orion Hlbina – čierna diera s horúcim diskom, ohnutým obrazom disku a fotónovým prstencom; Cygnus Prah – hviezda s vrúcou granuláciou, škvrnami, korónou a protuberanciami; Andromeda Brána – špirálová galaxia zošikma; Erebus Prázdnota – pozostatok supernovy s pulzarom; Pirátska aréna – pruhovaný plynný obor s prstencami
- Náhľady všetkých máp na kartách sektorov sa kreslia z týchto pozadí
- Hangár: veľké náhľady lodí z nových 3D modelov – spredu, z jemného uhla, so spotom pod loďou ako na výstave
- Pomocné drony majú u obchodníka aj v hangári náhľad z 3D modelu (farba podľa lasera); na hangári dronov na stanici parkuje nový ťažobný dron (aj v náhľade modulu)

## 0.21

### v0.21.0 · 2026-11-04
- Nové pozadie 1. mapy (Kepler-12): tmavá planéta so žeravým akrečným diskom (biely až oranžovo-červený, prašný okraj), jasnou žiarou na okraji, prachovým výtryskom a hlbokým pozadím s dymom, ohnivými oblakmi, iskrami a hviezdami; disk sa pomaly otáča a vďaka hĺbke sa pri lete posúva pomalšie (paralaxa)
- Náhľad 1. mapy na karte sektora sa vykresľuje z rovnakého pozadia
- Oprava: energetické jadro základne sa po pár minútach postupne skrútilo do víru – teraz zostáva stále rovnako pekné

## 0.20

### v0.20.0 · 2026-11-04
- Pomocné drony pre Sokola a Bizóna: kúpiš ich len u obchodníka v sektore 5 (najviac 2, sú veľmi drahé, druhý ešte drahší)
- Drony krúžia ponad a popod loď; v boji a pri ťažbe zostanú po bokoch lode
- Každý dron má osadený útočný laser (strieľa na cieľ lode jednu salvu v tempe lode, 35 % poškodenia) alebo ťažobný laser (pri ťažbe lúč do asteroidu, ťažba o 25 % rýchlejšia); laser sa dá kedykoľvek prepnúť v Loď → Hangár
- Detailný guľový model drona: svetlejší pás, šošovka so svietiacim prstencom a oblúkmi, bočné štíty so svietiacim lemom, priduchmi a portmi; oranžové svetlá = útočný, tyrkysové = ťažobný

## 0.19

### v0.19.5 · 2026-11-04
- Nové energetické jadro základne: plazmová guľa s bielym stredom a vírivými svietiacimi žilkami; v pokoji modrá, keď si v dosahu stanice zelená, pod útokom pulzuje červeno (farby sa plynulo prelínajú, menia sa aj svetelné pásy stanice)
- Ťažobné drony majú nový detailný model: pancierový trup so šikmým nosom a klami, červený senzor, dve veľké turbíny po bokoch na vzperách s fialovou žiarou dýz, zadné plutvy a malá veža

### v0.19.4 · 2026-11-04
- Boj: pri streľbe je loď vždy natočená nosom na cieľ (aj keď letí bokom) a okolo cieľa sa točí červený zameriavací krúžok
- Na okraji obrazovky sa ukazujú šípky smerom k pirátom mimo obrazovky do vzdialenosti polovice pásu (červené = nepriatelia, oranžové = pasívni) aj so vzdialenosťou

### v0.19.3 · 2026-11-04
- Ovládač: nad najbližším cieľom poskakuje ukazovateľ (červený = pirát, oranžový = pasívny pirát, tyrkysový = asteroid); RT alebo A naň zaútočí / začne ťažiť, LB/RB prepnú na ďalší cieľ
- Salvy laserov letia vždy v rovnakom tempe; vylepšenie rýchlosti streľby zvyšuje len poškodenie (poškodenie za sekundu je rovnaké ako predtým)
- Kurzor myši na ovládači ukazuje náhľad predmetov rovnako ako myš
- Krátke popisy pri myši (aj pri kurzore ovládača): tlačidlá dolnej lišty, suroviny, náklad, trup, štít, radiačný štít, vplyv, stanica, pilot, minimapa; v priestore asteroid (surovina a množstvo), pirát (typ a výdrž), stanica, NPC lode a brána

### v0.19.2 · 2026-11-04
- Boj: každý výstrel lode sú 2–3 laserové salvy tesne po sebe; poškodenie sa započíta len raz, tempo a sila streľby zostávajú rovnaké
- Hrubšie laserové strely (hráč aj piráti)

### v0.19.1 · 2026-11-04
- Spúšťací panel (Windows aj Mac): kontrola novej verzie už nevracia staršiu verziu z vyrovnávacej pamäte GitHubu – najnovšia verzia sa zistí hneď po zverejnení, aj keď je panel otvorený
- Panel ukazuje presný čas zverejnenia najnovšej verzie (napr. „4. 11. 2026 o 20:45 (pred 5 min)“) a v zozname verzií je pri každej dátum aj čas
- Nový panel sa použije po najbližšej aktualizácii hry a opätovnom otvorení panela

### v0.19.0 · 2026-11-04
- Nový vzhľad laserových striel (farby podľa rarity zbrane ostali): mäkká farebná žiara, biele horúce jadro, energetické prstence pozdĺž strely, iskry okolo a jasná hlavica; Epické/Legendárne sú hrubšie „kopije“ so špicou, Mytické hrubé a iskriace
- Záblesk pri hlavni aj pri zásahu a drobné iskry za letiacou strelou; pirátske strely majú rovnaký štýl v červeno-oranžovej
- Božská zbraň: úplne nový detailný blesk – kľukatá dráha s malými slučkami, biele jadro, modrá žiara, bočné vetvy a jemné vlákna; počas výboja sa mihoce

## 0.18

### v0.18.0 · 2026-11-04
- Hlavná základňa je nová detailná megaštruktúra: žiariace guľové jadro s mriežkou, veže hore aj dole, veľký palubný prstenec s oknami a modulmi; s úrovňou jadra pribúdajú otáčavé prstence, vedľajšie veže, gyroskopický prstenec a halo
- Základňa je väčšia a zapustená hlbšie pod rovinou letu – dá sa nad ňou preletieť a už do nej nenarazíš; stále je klikateľná
- Pasívni piráti v 1. mape (pás 2: 3, pásy 3 a 4: po 5): chvíľu ťa sledujú, ale nezaútočia, kým ich nenapadneš (ťukni na piráta); zbraň na nich sama nestrieľa, na minimape sú oranžoví, po zničení sa po čase vrátia

## 0.17

### v0.17.0 · 2026-11-04
- Nové detailné 3D modely lodí: Klepeto (biela loď s veľkými klepetami a azúrovými svetlami), Sokol (tmavá stíhačka s medenými lemami), Bizón (ťažký krížnik so svietiacimi modrými obvodmi a veliteľskou vežou)
- Nové modely všetkých pirátov v jednotnom štýle: tmavý pancier, kruhový rám, zahnuté čepele a ružovo-fialové svetlá; každý typ má iný tvar
- Povrch lodí má textúru plechov s drážkami, svetielkami a detailmi; dá sa priblížiť oveľa bližšie
- Ovládač: kurzor myši páčkou (Nastavenia alebo stlačenie ľavej páčky L3) – ľavá páčka hýbe kurzorom, A klikne, pravá páčka posúva okno; loď sa vtedy páčkou neriadi
- Ovládač: krížovým ovládačom sa v menu dá pohybovať všetkými smermi (napr. priamo medzi loďami v hangári)

## 0.16

### v0.16.4 · 2026-11-04
- Oprava: lode pirátov z nájazdov neboli vidieť (chyba z v0.16.2) – teraz sa opäť zobrazujú

### v0.16.3 · 2026-11-04
- Lasery: krátke salvy – jedna letiaca laserová strela za každú osadenú zbraň (lode s viac slotmi pre zbrane vystrelia viac naraz); poškodenie sa započíta pri dopade
- Piráti strieľajú rovnakými krátkymi strelami
- Výbava: hromadné rozoberanie – Označiť na rozobratie, výber ťuknutím alebo podľa rarity, zamknuté predmety sa preskočia

### v0.16.2 · 2026-11-04
- Dostrel: bežní piráti strieľajú kratšie ako tvoja zbraň (stíhačky 82 %, korzári 88 %, fregaty 95 %), bossovia ďalej (Dreadnought 120 %, krížnik 135 %); posúva sa s vylepšením dosahu
- Mapy ešte 2× väčšie (spolu 8× oproti v0.14), väčšie pozadie hmloviny
- Nájazdy pirátov prilietajú z pásu 4, aby na veľkých mapách neleteli príliš dlho

### v0.16.1 · 2026-11-04
- Mapy ešte 2× väčšie (spolu 4× oproti v0.14), počet asteroidov ostal rovnaký
- Pásy, horizont, brána, obchodník, zadávateľ misií aj aréna sa zväčšili s mapou; autopilot hľadá ciele do väčšej vzdialenosti

### v0.16.0 · 2026-11-04
- Streľba lodí: okamžité laserové dávky (3 výstrely) do zameraného alebo najbližšieho piráta – piráti strieľajú rovnako
- Šanca na zásah 70 %, schopnosť pilota Strelec ju zvýši až na 90 % (nová vlastnosť Presnosť); netrafené výstrely ukážu „vedľa“
- Farba laserov podľa rarity zbrane: bez zbrane sivá, do Vzácnej modrá, Epická a Legendárna zlatá, Mytická červená, Božská blesky, Prvotná stály dúhový lúč s pulzmi po každej salve

## 0.15

### v0.15.2 · 2026-11-04
- Aréna: vlny idú za sebou automaticky, anomália s odmenou príde po každej 5. vlne (odmena za všetkých 5 vĺn)
- Po prevzatí odmeny otázka: pokračovať ďalšou vlnou, alebo beh ukončiť a vrátiť sa na základňu v 1. sektore
- Po zničení lode v aréne sa loď objaví na základni v 1. sektore

### v0.15.1 · 2026-11-04
- Aréna: tlačidlá ▶ Štart / ▶ Vlna N (kontrolný bod) a ■ Ukončiť priamo vedľa názvu mapy
- Popis arény sa na PC ukáže ako plávajúce okno po nabehnutí myšou na tlačidlo

### v0.15.0 · 2026-11-04
- Mapy sú 2× väčšie, počet asteroidov ostal rovnaký – pôsobia menej nahustene
- Zadávateľ misií: fialová loď v páse 2 každého sektora – menu misií po ťuknutí alebo pri priblížení (zo stanice misie zmizli)
- Obchodník v 3. a 5. sektore (na hranici pásov 2/3): predáva predmety za kredity, ponuka sa mení každých 10 minút, v 5. sektore zriedka aj Epické; výkup predmetov 2,5× výhodnejší ako rozobratie
- Nové rozloženie surovín: 1. ruda, 2. viridit, 3. ruda a viac viriditu, 4. viridit a málo kryštálov, 5. iba kryštály, 6. obrie zmiešané asteroidy so všetkými surovinami
- Autopilot sa po skoku prepne na surovinu, ktorá v sektore je

## 0.14

### v0.14.3 · 2026-11-04
- Náhľad predmetu na PC: porovnanie s nasadeným predmetom vedľa seba spolu s rozdielmi ▲▼
- Nastavenia → Porovnanie predmetov: Oboje, Iba ▲▼, Vedľa seba alebo Vypnuté
- Výbava: klik na prázdny slot ukáže vhodné predmety z inventára a jedným klikom ich nasadí; bez vhodných predmetov sa na slot kliknúť nedá

### v0.14.2 · 2026-11-04
- Mapa sektorov a skoková brána: každá karta má pozadie s náhľadom sektora – hmlovina a planéta v jeho farbách, pásy, horizont, asteroidy podľa surovín a stanica (pri aréne piráti a anomália)

### v0.14.1 · 2026-11-04
- PC (myš a klávesnica): vlastnosti predmetu sa ukážu ako náhľad pri ukazovateli myši (inventár, výbava, sklad, čipy), vrátane porovnania s nasadeným
- Kliknutie na predmet na PC otvorí len kompaktný pruh s akciami; na dotyku a ovládači zostáva pôvodné okno

### v0.14.0 · 2026-11-04
- Úroveň výzvy +1 až +16 (Nastavenia, pri stanici): silnejší piráti a radiácia, ale viac surovín, kreditov, XP a vzácnejšia korisť
- Účinky výzvy sa ukazujú v percentách, napr. výzva +16: piráti +12 071 % výdrže, odmeny +1 133 %
- Výzva platí aj v Pirátskej aréne; aktuálna výzva je vidieť pri názve sektora (V+N)
- Príručka: tabuľka úrovní výzvy

## 0.13

### v0.13.0 · 2026-11-04
- Pirátska aréna: špeciálna mapa po obsadení posledného sektora – 100 vĺn pirátov bez ťažby
- Po každej vlne kozmická anomália v strede mapy: kredity, suroviny a predmety rastúce s vlnou, občas jackpot × 3
- Noví piráti: roj rýchlych dronov a statické raketové veže s navádzanými raketami
- Každá 20. vlna boss Dreadnought s garantovaným Mytickým, Božským alebo Prvotným predmetom (Prvotný 30 % na vlne 100)
- Vlna 100: hlavný boss bojový krížnik – nezraniteľný, kým ručne nezničíš jeho 6 modulov; vypúšťa pirátov z hangáru
- Kontrolný bod po každom bossovi, príručka: kapitola Pirátska aréna

## 0.12

### v0.12.0 · 2026-11-04
- Vyrovnanie: každý ďalší sektor dáva asi o 30 % viac surovín, kreditov z pirátov a odmien z misií
- Stavba a vylepšovanie stanice je v každom ďalšom sektore 1,45× drahšie, vylepšenia lode na úrovniach 6–10 2× drahšie
- Polovičný pasívny príjem z obsadených sektorov, silnejší piráti vo vzdialenejších sektoroch
- Rarita koristi podľa sektora: v 1.–2. sektore najviac Vzácne, v 3.–4. Epické, v 5.–6. Legendárne; Mytické len veľmi zriedka v poslednom sektore
- Pomalší postup pilota (strmšia krivka XP)

## 0.11

### v0.11.2 · 2026-11-04
- Oprava: chyba v hernej slučke v okamihu, keď sa asteroid vyťaží a loď nemá ďalší cieľ

### v0.11.1 · 2026-11-04
- Radiačný štít: kratšia ochrana – 4 s na 1. úrovni, najviac 30 s na 10. úrovni
- Vylepšenia radiačného štítu sú 3× drahšie

### v0.11.0 · 2026-11-04
- Levelovanie pilota: body skúsenosti za ťažbu, relikty, pirátov, misie, obsadenie sektora, stavbu modulov a vylepšovanie predmetov
- 100 úrovní, každá dá bod schopnosti: Ťažiar, Strelec, Navigátor, Obchodník (body sa dajú vrátiť za kredity)
- Úroveň pilota pod názvom sektora, panel Pilot (kláves L); misie ukazujú aj odmenu v XP
- Staré uloženia dostanú XP za už obsadené sektory
- Príručka: nová kapitola Pilot – úrovne a schopnosti

## 0.10

### v0.10.0 · 2026-11-04
- Hlavný sklad na stanici v 1. sektore (Stanica → Sklad): mriežka predmetov, zoraďovanie a vyhľadávanie
- Sklad začína so 40 miestami a dá sa rozširovať až na 400; tlačidlo Uložiť celý inventár
- Vo Výbave pri stanici v 1. sektore tlačidlo Do skladu
- Príručka: nová kapitola Hlavný sklad

## 0.9

### v0.9.1 · 2026-11-04
- Nová obtiažnosť Nightmare: silnejší piráti a radiácia, +40 % surovín – jedno zničenie lode vymaže celý postup
- Úvodná obrazovka ukazuje výsledok poslednej Nightmare hry a aktuálnu verziu hry
- Príručka: tabuľka obtiažností s Nightmare a poškodením pirátov

### v0.9.0 · 2026-11-04
- Veľké čísla: suroviny, náklad, trup, štíty, poškodenie a kredity sú 10× vyššie, zápis 12.5K / 1.2M / 1.1B
- Drahšia ekonomika: ceny vylepšení, modulov, jadra stanice a lodí sú o 60 % vyššie oproti príjmom
- Kritický zásah: základná šanca 3 %, poškodenie +100 %; nové vlastnosti predmetov Šanca na kritický zásah a Kritické poškodenie
- Čísla poškodenia nad cieľmi (kritické zásahy zlatou farbou)
- Staré uloženia sa automaticky prepočítajú

## 0.8

### v0.8.3 · 2026-11-04
- Korisť vo vesmíre svieti farbou svojej rarity (aj z pirátov)
- Predmety z reliktov idú rovno do inventára, do vesmíru padnú len pri plnom inventári
- Spúšťače (Windows aj Mac): výber verzie hry na porovnanie, staršie verzie majú vlastné uložené hry

### v0.8.2 · 2026-11-04
- Spúšťač pre Mac: aplikácia Orbitálne Sektory má ikonu hry (staršie vytvorené aplikácie sa opravia pri otvorení)
- Spúšťač pre Mac: aplikácia na ploche, aktualizácie z GitHubu, samostatné okno hry
- Spúšťač pre Windows premenovaný na Orbitalne-Sektory-Windows.bat (starý spúšťač funguje ďalej)

### v0.8.1 · 2026-11-04
- Nový spúšťač pre Mac: aplikácia Orbitálne Sektory na ploche, aktualizácie z GitHubu, samostatné okno hry
- Spúšťač pre Windows premenovaný na Orbitalne-Sektory-Windows.bat (starý spúšťač funguje ďalej)

### v0.8.0 · 2026-11-03
- Hangár: nové lode Sokol (rýchla stíhačka) a Bizón (ťažký nákladný ťahač), každá s vlastnými vylepšeniami
- Lode sa odomykajú obsadzovaním sektorov, prestupuje sa pri stanici
- Tri nové sektory: Cygnus Prah, Andromeda Brána a Erebus Prázdnota – bohatšie polia a vyššia úroveň predmetov
- Nový pirát Fregata: ťažká loď s veľkou výdržou, vždy zhodí aspoň Vzácny predmet
- Príručka: nová kapitola Hangár a lode, fregata v kapitole Boj

## 0.7

### v0.7.4 · 2026-11-03
- Nové vylepšenie lode Obratnosť (skupina Motor): ostrejšie zatáčanie bez driftu, rýchlejšie natáčanie lode
- Nová vlastnosť predmetov Obratnosť na motoroch

### v0.7.3 · 2026-11-03
- Rarita Mytické: celé okno jemne pulzuje (svetlo a žiara)
- Rarita Prvotné: striedavo blikajúce hviezdy v pozadí a rýchlejší pulz – aj v detaile predmetu

### v0.7.2 · 2026-11-03
- Oprava: schopnosti dronu sa odomykajú podľa vyššej rarity z modulu a AI jadra (viridit a obrana od Vzácnej, kryštály od Epickej)
- Rarita Prvotné: nové animované pozadie (hmlovina, hviezdy, lúče) a pulzujúca dúhová žiara

### v0.7.1 · 2026-11-03
- Admin panel na testovanie (suroviny, nesmrteľnosť, predmety, postup v hre)
- Misie na stanici: dodávky, prieskum radiácie, stratené relikty, lov pirátov, obrana stanice – 3 stupne náročnosti
- Radiačný štít: časovo obmedzená úplná ochrana pred radiáciou aj za horizontom, dobíja sa pri stanici
- Sledovanie misií v paneli sektora, ciele na minimape a vo vesmíre
- Nová kapitola príručky Misie a radiačný štít

### v0.7 · 2026-11-03
- misie (5 typov, 3 stupne), radiačný štít s obmedzeným časom, sledovanie misií v HUD

## 0.6

### v0.6.1 · 2026-11-03
- Oprava: autopilot sa po zbere koristi s plným nákladom zastavil, teraz pokračuje na stanicu
- Boj: nájazdy pirátov od 2. sektora, zbraň lode, strieľajúce veže, obranný režim dronov
- Nový panel stanice: moduly s 3D náhľadom, vylepšenie +1 až +10 so stúpajúcou raritou
- Čipy do modulov (AI jadro dronu – viridit, kryštály, obrana; zameriavač veže; zosilňovač senzorov)
- Nový slot Zbraň a vylepšenia zbraní
- Nastavenia v samostatnom menu, tlačidlo Ukončiť hru
- Pasívny príjem len zo sektorov s dosiahnutým vplyvom

### v0.6 · 2026-11-03
- boj s pirátmi (zbraň lode, veže, obrana dronov), panel stanice s vylepšovaním modulov +1 až +10 a čipmi, slot Zbraň, samostatné Nastavenia s tlačidlom Ukončiť hru, pasívny príjem len pri dosiahnutom vplyve

## 0.5

### v0.5.1 · 2026-11-03
- Príručka (wiki) v hre – tlačidlo Wiki alebo kláves K, aj ako samostatná stránka wiki.html
- Ikona hry
- Spúšťač: výber priečinka hry, ikona na ploche, tlačidlo Príručka

### v0.5 · 2026-11-03
- kredity, predmety s 10 raritami (Odpad až Prvotné) a náhodnými vlastnosťami, výbava lode a inventár, vylepšovanie +1 až +20, zlaté relikty s korisťou, vylepšenia lode do úrovne 10, hra rozdelená na súbory

## 0.4

### v0.4.2 · 2026-11-03
- vysvetlivky v kóde (obsah sekcií, popis herných hodnôt na ladenie balansu)

### v0.4.1 · 2026-11-03
- skok do sektora iba cez skokovú bránu, Mapa je informatívna, oprava zaseknutia pri skoku počas ťažby

### v0.4 · 2026-11-03
- autopilot (ťaží zvolenú surovinu, vozí ju na stanicu, vracia sa na opravu), automatický návrat pri plnom náklade, kláves P / tlačidlo View

## 0.3

### v0.3.3 · 2026-11-03
- voliteľná automatická ťažba (Mapa → Nastavenia)

### v0.3.2 · 2026-11-03
- loď po skončení ťažby zastaví namiesto narážania do asteroidu, presnejší údaj o plnom náklade

### v0.3.1 · 2026-11-03
- predaj modulov stanice (60 % späť), anglický názov sektora Orion Deep

### v0.3 · 2026-11-03
- tretia surovina viridit, 4 pásy + horizont, radiácia, štíty, oprava trupu po 30 s, menu vylepšení po skupinách, minimapa, SK/EN, obtiažnosť Ľahká/Ťažká, nová ekonomika

## 0.2

### v0.2 · 2026-11-03
- ovládač Xbox/PS a klávesnica, zrýchlenie a max. rýchlosť ako vylepšenia, loď „Klepeto“, kolízie s asteroidmi, integrita trupu

## 0.1

### v0.1 · 2026-11-03
- prototyp 0: ťažba, stanica a moduly, 3 sektory, ukladanie hry

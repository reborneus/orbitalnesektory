'use strict';
/* Generuje tools/changelog.py – needituj ručne. Posledné verzie hry pre zoznam zmien v hlavnom menu (js/menu.js). */
const CHANGELOG=[
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
},
{
"v": "0.28.0",
"d": "2026-11-05",
"n": [
"Oprava: po zničení a znovuzrodení loď už automaticky neletí späť na miesto smrti (zrušia sa útok, autopilotný cieľ aj čakajúce príkazy)",
"Nová obrazovka smrti s červenou lebkou, strateným nákladom a 5-sekundovým odpočtom; nová loď sa zrodí pri stanici až po odpočte",
"Po znovuzrodení má loď iba 20 % trupu a prázdny štít",
"Miesto poslednej smrti je na minimape označené červenou smrtkou (mimo dosahu sa drží pri okraji); keď k nemu priletíš, značka zmizne"
]
},
{
"v": "0.27.0",
"d": "2026-11-04",
"n": [
"Nová obrazovka výbavy: loď v strede, okolo nej 6 štvorcov slotov (laser, motor, trup, štít, doplnok, zbraň) a šípky od lode k nim vo farbe rarity; prázdny slot ukazuje počet vhodných predmetov",
"Klik na predmet v inventári ho rovno nasadí / vymení s predmetom v lodi",
"Karta predmetu s možnosťami (vylepšiť, rozobrať, zamknúť, do skladu, zložiť) sa ukáže pri predmete pod myšou aj pod výberom ovládača; na širokej obrazovke vpravo vedľa okna",
"Skoková brána je 2,6× väčšia a naklonená, aby ňou vizuálne prešli aj veľké lode",
"Pri vkladaní predmetov sa dá zvoliť aj konkrétny typ predmetu"
]
},
{
"v": "0.26.0",
"d": "2026-11-04",
"n": [
"Stanica v strede mapy je 3× väčšia (moduly ostali v pôvodnej veľkosti) a leží hlbšie pod rovinou letu; dosah stanice, vykladanie a zásahy pirátov sa jej veľkosti prispôsobili",
"Po skoku bránou sa loď objaví pri bráne v novom sektore (nie v strede pri stanici)",
"Pasívni piráti vo všetkých mapách okrem arény: 1. mapa 2× viac (26), 2. mapa ešte viac (34); od 3. mapy aj korzári, od 4. aj fregaty a pribúda agresívnych (zaútočia, keď sa priblížiš; na minimape a šípkach červení), na vyšších mapách silnejší"
]
},
{
"v": "0.25.0",
"d": "2026-11-04",
"n": [
"Minimapa sa dá zväčšiť a zmenšiť (5 veľkostí): tlačidlá − / + pri minimape, koliesko myši nad minimapou, na ovládači R3 (dookola); veľkosť sa uloží",
"PC: režim úpravy rozloženia HUD (Nastavenia → Rozloženie HUD → Upraviť) – panely sektora, surovín, minimapu a dolnú lištu presunieš ťahaním myšou; rozloženie sa uloží, dá sa vrátiť na pôvodné",
"PC: okná ako hangár, vylepšenia lode, výbava či mapa sa otvárajú v strede obrazovky nad dolnou lištou (lišta zostáva viditeľná)"
]
},
{
"v": "0.24.1",
"d": "2026-11-04",
"n": [
"Oprava spúšťacieho panela pre Windows: v0.23.1 sa panel vôbec neotvoril (chyba v skripte panela); teraz sa opäť otvorí"
]
},
{
"v": "0.24.0",
"d": "2026-11-04",
"n": [
"Korisť vo vesmíre (z asteroidov, pirátov) je teraz otáčajúca sa kozmická kocka: na stenách vesmír (špirálová galaxia, hmlovina vo farbe rarity, blikajúce hviezdy), svietiace biele hrany; každý predmet má iný vzor a jednu z variant (samotná kocka / vnútorná drôtená kocka točiaca sa opačne / väčší drôtený rám), od Mytickej vždy s rámom; farby rarity, svetelný stĺp aj krúžok ostali",
"Anomália v aréne je veľká fialová kozmická kocka s rámom"
]
},
{
"v": "0.23.1",
"d": "2026-11-04",
"n": [
"Spúšťací panel pre Windows: nový tmavý moderný vzhľad ako menu v hre (karty so zaoblenými rohmi, tyrkysové ŠTART, tmavý titulok okna)",
"Panel sa spúšťa bez prázdneho okna PowerShellu (nový skrytý spúšťač .vbs); po aktualizácii v paneli klikni na „Odkaz na ploche“, aby odkaz používal nový spúšťač",
"Nové políčko „Po spustení hry nechať panel otvorený“ (Windows aj Mac)"
]
},
{
"v": "0.23.0",
"d": "2026-11-04",
"n": [
"Orion Hlbina: nová realistická čierna diera podľa videa – čierny tieň, tenký fotónový prstenec, disk takmer z boku prechádzajúci pred tieňom, ohnutý obraz zadnej časti disku nad a pod tieňom, jedna strana jasnejšia (Dopplerov jav), dlhý šedý prachový chvost s vláknami; tmavé hviezdne pozadie",
"Náhľady lodí v hangári sú menšie a bez pozadia (len model lode); náhľady pomocných dronov tiež bez pozadia",
"Nastavenia: posuvník priehľadnosti menu (35–100 %); pri nižšej hodnote vidieť hru cez rozostrené menu"
]
},
{
"v": "0.22.0",
"d": "2026-11-04",
"n": [
"Realistické pozadia aj pre ostatné mapy (počítané shadermi, s hĺbkou a pomalým pohybom): Vega Drift – tyrkysovo-fialová emisná hmlovina s prachovými piliermi a hviezdokopami; Orion Hlbina – čierna diera s horúcim diskom, ohnutým obrazom disku a fotónovým prstencom; Cygnus Prah – hviezda s vrúcou granuláciou, škvrnami, korónou a protuberanciami; Andromeda Brána – špirálová galaxia zošikma; Erebus Prázdnota – pozostatok supernovy s pulzarom; Pirátska aréna – pruhovaný plynný obor s prstencami",
"Náhľady všetkých máp na kartách sektorov sa kreslia z týchto pozadí",
"Hangár: veľké náhľady lodí z nových 3D modelov – spredu, z jemného uhla, so spotom pod loďou ako na výstave",
"Pomocné drony majú u obchodníka aj v hangári náhľad z 3D modelu (farba podľa lasera); na hangári dronov na stanici parkuje nový ťažobný dron (aj v náhľade modulu)"
]
},
{
"v": "0.21.0",
"d": "2026-11-04",
"n": [
"Nové pozadie 1. mapy (Kepler-12): tmavá planéta so žeravým akrečným diskom (biely až oranžovo-červený, prašný okraj), jasnou žiarou na okraji, prachovým výtryskom a hlbokým pozadím s dymom, ohnivými oblakmi, iskrami a hviezdami; disk sa pomaly otáča a vďaka hĺbke sa pri lete posúva pomalšie (paralaxa)",
"Náhľad 1. mapy na karte sektora sa vykresľuje z rovnakého pozadia",
"Oprava: energetické jadro základne sa po pár minútach postupne skrútilo do víru – teraz zostáva stále rovnako pekné"
]
},
{
"v": "0.20.0",
"d": "2026-11-04",
"n": [
"Pomocné drony pre Sokola a Bizóna: kúpiš ich len u obchodníka v sektore 5 (najviac 2, sú veľmi drahé, druhý ešte drahší)",
"Drony krúžia ponad a popod loď; v boji a pri ťažbe zostanú po bokoch lode",
"Každý dron má osadený útočný laser (strieľa na cieľ lode jednu salvu v tempe lode, 35 % poškodenia) alebo ťažobný laser (pri ťažbe lúč do asteroidu, ťažba o 25 % rýchlejšia); laser sa dá kedykoľvek prepnúť v Loď → Hangár",
"Detailný guľový model drona: svetlejší pás, šošovka so svietiacim prstencom a oblúkmi, bočné štíty so svietiacim lemom, priduchmi a portmi; oranžové svetlá = útočný, tyrkysové = ťažobný"
]
},
{
"v": "0.19.5",
"d": "2026-11-04",
"n": [
"Nové energetické jadro základne: plazmová guľa s bielym stredom a vírivými svietiacimi žilkami; v pokoji modrá, keď si v dosahu stanice zelená, pod útokom pulzuje červeno (farby sa plynulo prelínajú, menia sa aj svetelné pásy stanice)",
"Ťažobné drony majú nový detailný model: pancierový trup so šikmým nosom a klami, červený senzor, dve veľké turbíny po bokoch na vzperách s fialovou žiarou dýz, zadné plutvy a malá veža"
]
},
{
"v": "0.19.4",
"d": "2026-11-04",
"n": [
"Boj: pri streľbe je loď vždy natočená nosom na cieľ (aj keď letí bokom) a okolo cieľa sa točí červený zameriavací krúžok",
"Na okraji obrazovky sa ukazujú šípky smerom k pirátom mimo obrazovky do vzdialenosti polovice pásu (červené = nepriatelia, oranžové = pasívni) aj so vzdialenosťou"
]
},
{
"v": "0.19.3",
"d": "2026-11-04",
"n": [
"Ovládač: nad najbližším cieľom poskakuje ukazovateľ (červený = pirát, oranžový = pasívny pirát, tyrkysový = asteroid); RT alebo A naň zaútočí / začne ťažiť, LB/RB prepnú na ďalší cieľ",
"Salvy laserov letia vždy v rovnakom tempe; vylepšenie rýchlosti streľby zvyšuje len poškodenie (poškodenie za sekundu je rovnaké ako predtým)",
"Kurzor myši na ovládači ukazuje náhľad predmetov rovnako ako myš",
"Krátke popisy pri myši (aj pri kurzore ovládača): tlačidlá dolnej lišty, suroviny, náklad, trup, štít, radiačný štít, vplyv, stanica, pilot, minimapa; v priestore asteroid (surovina a množstvo), pirát (typ a výdrž), stanica, NPC lode a brána"
]
},
{
"v": "0.19.2",
"d": "2026-11-04",
"n": [
"Boj: každý výstrel lode sú 2–3 laserové salvy tesne po sebe; poškodenie sa započíta len raz, tempo a sila streľby zostávajú rovnaké",
"Hrubšie laserové strely (hráč aj piráti)"
]
},
{
"v": "0.19.1",
"d": "2026-11-04",
"n": [
"Spúšťací panel (Windows aj Mac): kontrola novej verzie už nevracia staršiu verziu z vyrovnávacej pamäte GitHubu – najnovšia verzia sa zistí hneď po zverejnení, aj keď je panel otvorený",
"Panel ukazuje presný čas zverejnenia najnovšej verzie (napr. „4. 11. 2026 o 20:45 (pred 5 min)“) a v zozname verzií je pri každej dátum aj čas",
"Nový panel sa použije po najbližšej aktualizácii hry a opätovnom otvorení panela"
]
}
];

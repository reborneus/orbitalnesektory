# Zoznam zmien – Orbitálne Sektory

Najnovšia verzia je hore. Staršie verzie hry sa dajú spustiť cez výber verzie v spúšťači (pozri README).

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

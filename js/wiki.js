'use strict';
/* ==================== == 13. PRÍRUČKA (WIKI) ====================
   Príručka sa skladá z herných dát (data.js, items.js), takže čísla v tabuľkách vždy sedia s aktuálnou verziou.
   Používa sa dvakrát: v hre (prekrytie #wiki, tlačidlo Wiki alebo kláves K) a ako samostatná stránka wiki.html.
   Texty príručky sú v WT (sk/en); krátke názvy (suroviny, rarity, vlastnosti) berie z prekladov hry cez t().
   Nová kapitola: pridaj objekt do wikiSections() a jej texty do WT. */
const WT={
sk:{
  'mis.h':'Misie a radiačný štít','mis.type':'Misia','mis.what':'Úloha','mis.base':'Kredity (ľahká, 1. sektor)','mis.tier':'Stupeň','mis.mult':'Násobok odmeny','mis.minR':'Predmet','mis.ich':'Šanca na predmet','mis.where':'Cieľ prieskumu / reliktu',
  'mis.p':'Misie dáva zadávateľ misií – fialová loď v páse 2 každého sektora (na minimape fialový štvorec). Ťukni na neho alebo k nemu prileť a otvorí sa menu misií. Ponúka {o} misie pre aktuálny sektor, aktívne môžeš mať naraz {a}. Ponuky sa obnovia každé {r} minúty alebo hneď za {c} ¢. Aktívne misie vidíš aj v paneli sektora vľavo hore a ich ciele ako fialové stĺpy a hviezdy na minimape.',
  'mis.sec':'Odmeny sa násobia podľa sektora: {m}. Doručenia v ďalších sektoroch vyžadujú viac suroviny.',
  'mis.rs':'Radiačný štít (skupina Štíty) na obmedzený čas úplne zachytí radiáciu v pásoch aj za horizontom, takže sa dajú splniť aj ťažké misie za horizontom. Pri stanici sa dobíja rýchlosťou {rc} s za sekundu. V Nastaveniach zvolíš, či sa zapne vždy v radiácii, alebo len za horizontom.',
  'mis.d.deliver':'dovez a vylož surovinu','mis.d.scan':'zdrž sa v okruhu bodu, kým skener nedobehne','mis.d.relic':'vyťaž označený relikt (predmet podľa stupňa)','mis.d.hunt':'znič pirátov (od 2. sektora)','mis.d.defend':'odraz nájazd bez pádu stanice (od 2. sektora)',
  'mod.h':'Moduly stanice a čipy','mod.lv':'Vylepšenie','mod.rar':'Rarita modulu','mod.cost':'Cena ďalšieho +1','mod.inf':'Vplyv (dok / veža / senzor)',
  'mod.p':'Ťuknutím na stanicu sa otvorí panel stanice. Každý slot je rozbaľovacia karta s náhľadom modulu. Postavený modul vylepšíš až na +{max}; s vylepšením rastie jeho účinok, vplyv a rarita (farba rámu aj žiara modulu vo vesmíre). Do modulu môžeš vložiť čip z koristi.',
  'mod.chip':'Čipy sú predmety pre moduly stanice. Padajú najmä z pirátov ({e} % koristi z pirátov), menej z reliktov. Schopnosti dronu odomyká rarita – platí vyššia z rarity modulu (rastie vylepšovaním) a rarity vloženého AI jadra:',
  'mod.cap':['{g}: dron ťaží aj viridit (aj vo vonkajších pásoch, radiácia mu neškodí).','{d}: obranný režim – počas nájazdu dron útočí na pirátov pri stanici.','{c}: dron ťaží aj kryštály.'],
  'mod.fx':'Účinok na +0 a každé +1: dok dronov {dr} t/s (+{drp} %), kapacita {dc} t (+{dcp} t), rýchlosť {ds} m/s (+{dsp} %); veža {td} poškodenia (+{tdp} %), {tr} výstrelu/s, dosah {tg} m (+{tgp} m); senzorové pole {sg} viriditu/min (+{sgp} %).',
  'mod.sell':'Predaj modulu vráti {b} % ceny stavby a {e} % surovín minutých na jeho vylepšenia; čip sa vráti do inventára.',
  'mod.paused':'Ak po obsadení vplyv sektora klesne pod hranicu (napríklad po predaji veží), sektor zostane prístupný, ale jeho pasívny príjem sa pozastaví, kým vplyv znova nedosiahne hranicu.',
  'cmb.h':'Boj a piráti','cmb.kind':'Pirát','cmb.hp':'Výdrž','cmb.dmg':'Poškodenie výstrelu','cmb.fire':'Výstrel každých','cmb.drop':'Šanca na predmet','cmb.cr':'Kredity',
  'cmb.p':'Od 2. sektora prilietajú nájazdy pirátov. Letia na stanicu a strieľajú do nej; ak je tvoja loď bližšie ako {ag} m alebo do nich vystrelíš, zaútočia na teba.',
  'cmb.l':['Lasery: zbraň strieľa okamžité dávky ({b} výstrely) do zameraného alebo najbližšieho piráta; každý výstrel zasiahne so šancou {hb} % (schopnosť Strelec ju zvýši najviac na {hm} %). Piráti strieľajú rovnako, so šancou {ph} %. Farba lasera podľa rarity zbrane: bez zbrane sivá, do Vzácnej modrá, Epická a Legendárna zlatá, Mytická červená, Božská blesky, Prvotná stály dúhový lúč s pulzmi.','Kritický zásah: každý výstrel má šancu {cc} % (plus vlastnosť „Šanca na kritický zásah“, najviac 75 %) spôsobiť o {cd} % väčšie poškodenie (plus vlastnosť „Kritické poškodenie“). Nad cieľom sa ukáže číslo poškodenia, kritický zásah zlatou farbou.','Zbraň lode strieľa sama na najbližšieho piráta v dosahu {gr} m. Ťuknutím na piráta (alebo tlačidlom ťažby, keď je pirát blízko) ho zameriaš a loď sa drží v dosahu.',
    'Obranné veže strieľajú na pirátov v okolí stanice. Drony s AI jadrom v obrannom režime počas nájazdu tiež bojujú.',
    'Keď výdrž stanice klesne na nulu, piráti ukradnú {st} % rudy a viriditu na stanici, odletia a moduly sú {off} s offline. Stanica sa potom sama opravuje.',
    'Za odrazený nájazd dostaneš {rb} ¢ za každého piráta. Na ťažkej obtiažnosti piráti udierajú o {hd} % silnejšie.'],
  'cmb.raid':'Nájazdy podľa sektora','cmb.sec':'Sektor','cmb.first':'Prvý nájazd po','cmb.every':'Interval','cmb.count':'Stíhačky','cmb.cors':'Šanca na korzára','cmb.none':'bez pirátov',
  'cmb.fighter':'Stíhačka','cmb.corsair':'Korzár','cmb.frigate':'Fregata','cmb.frig':'Šanca na fregatu','cmb.shp':'Výdrž stanice: {a} + {b} × úroveň jadra.',
  title:'Príručka',search:'Hľadať v príručke…',none:'Nič sa nenašlo.',close:'Zavrieť',toc:'Obsah',
  auto:'Hodnoty v príručke sa počítajú priamo z herných dát, takže vždy zodpovedajú tejto verzii hry.',
  'start.h':'Začíname',
  'start.p':'Orbitálne Sektory je vesmírna sandbox hra s pohľadom zhora. Ťažíš suroviny z asteroidov, vozíš ich na stanicu v strede sektora, staviaš moduly a získavaš vplyv. Keď vplyv dosiahne hranicu, sektor je tvoj: dostaneš kredity aj predmet a odomkne sa ďalší sektor.',
  'start.loop':'Herný cyklus',
  'start.l':['Ťaž rudu na vnútorných pásoch, vzácnejšie suroviny na vonkajších radiačných pásoch.','Pri stanici sa náklad vyloží sám.','Za suroviny vylepšuj loď a stavaj moduly stanice.','Pri dostatočnom vplyve sa sektor obsadí.','Skokovou bránou prejdi do ďalšieho sektora.','Zbieraj a vylepšuj predmety z reliktov.'],
  'ctl.h':'Ovládanie','ctl.act':'Akcia','ctl.touch':'Dotyk / myš','ctl.key':'Klávesnica','ctl.pad':'Ovládač (Xbox / PS)',
  'ctl.p':'Hra rozpozná, čím ju práve ovládaš, a podľa toho mení nápovedy. Ťuknutie na minimapu pošle loď na to miesto.',
  'ctl.rows':[['Let','ťuknúť alebo držať v priestore','WASD / šípky','ľavá páčka'],['Ťažiť najbližší asteroid','ťuknúť na asteroid','medzerník','A / ✕ alebo RT'],
    ['Domov na stanicu','tlačidlo Domov','H','B / ○'],['Stanica','tlačidlo Stanica','1','Y / △'],['Loď','tlačidlo Loď','2','X / □'],['Výbava','tlačidlo Výbava','I','LT / L2'],
    ['Mapa sektorov','tlačidlo Mapa','3','Menu / Options'],['Nastavenia','tlačidlo Nastavenia','O','LB / RB v menu'],['Útok na piráta','ťuknúť na piráta','medzerník (pirát blízko)','A / ✕'],['Autopilot zap./vyp.','Nastavenia','P','View / Share'],['Príručka','tlačidlo Wiki','K','–'],
    ['Priblíženie','koliesko alebo dva prsty','koliesko myši','pravá páčka'],['Pohyb v menu','ťuknutie','Tab, Enter','krížový ovládač, A, B, LB/RB']],
  'res.h':'Suroviny a kredity','res.name':'Surovina','res.where':'Kde sa nachádza','res.rate':'Rýchlosť ťažby','res.use':'Na čo slúži',
  'res.p':'Ťažobný laser ťaží rýchlosťou podľa úrovne lasera; vzácnejšie suroviny sa ťažia pomalšie. Vyťažené suroviny sú v náklade, kým ich nevyložíš na stanici. Pri zničení lode sa náklad stratí.',
  'res.use.ore':'všetky stavby, vylepšenia a opravy','res.use.green':'vyššie úrovne vylepšení, senzory, jadro ÚR4','res.use.crystal':'najvyššie úrovne, jadro ÚR5','res.use.relic':'nedáva surovinu, padá z neho predmet',
  'res.cr':'Kredity (¢) sú nová mena. Získaš ich za obsadenie sektora, pasívne z obsadených sektorov ({c} ¢ za minútu z každého) a rozoberaním predmetov. Platí sa nimi za úrovne vylepšení 6–10 a za vylepšovanie predmetov.',
  'res.belts':'pásy','res.sec':'sektory',
  'zone.h':'Pásy a radiácia','zone.zone':'Pás','zone.range':'Vzdialenosť od stanice','zone.easy':'Radiácia (ľahká)','zone.hard':'Radiácia (ťažká)',
  'zone.p':'Každý sektor má štyri pásy okolo stanice. Pásy 1 a 2 sú bezpečné. V pásoch 3 a 4 je radiácia, ktorá rastie so vzdialenosťou; najprv uberá štíty, potom trup. Za horizontom trup rýchlo ubúda a štíty tam nepomáhajú. Ďalej ako {lim} m sa letieť nedá.',
  'zone.filter':'Vlastnosť predmetov „Ochrana pred radiáciou“ znižuje radiáciu v pásoch 3–4 (najviac o {cap} %), za horizontom nie.',
  'zone.hz':'horizont','zone.beyond':'za horizontom','zone.safe':'bez radiácie','zone.per':'/s',
  'sec.h':'Sektory','sec.name':'Sektor','sec.res':'Suroviny','sec.ast':'Asteroidy','sec.relic':'Relikty','sec.cap':'Vplyv na obsadenie','sec.rew':'Odmena','sec.ilvl':'Úroveň predmetov',
  'sec.p':'Sektory sa odomykajú postupne: ďalší sa otvorí po obsadení predchádzajúceho. Úroveň predmetov rastie so sektorom a s pásom, v ktorom predmet padol.',
  'st.h':'Stanica a vplyv','st.lv':'Úroveň jadra','st.slots':'Sloty','st.inf':'Vplyv jadra','st.next':'Cena ďalšej úrovne',
  'st.mod':'Modul','st.minf':'Vplyv','st.c1':'1. kus','st.c2':'2. kus','st.c3':'3. kus','st.pas':'Príjem po obsadení',
  'st.p':'Vplyv sektora = úroveň jadra × {ci} + vplyv modulov. Každý ďalší modul rovnakého typu je drahší. Postavený modul môžeš predať, vráti sa {sell} % jeho ceny a uvoľní sa slot.',
  'st.pd':'{o} rudy/min','st.ps':'{g} viriditu/min','st.pt':'len vplyv',
  'ship.h':'Loď a vylepšenia','hg.h':'Hangár a lode','stor.h':'Hlavný sklad','sto.k':'Rozšírenie','trd.h':'Obchodník',
  'trd.p':'Zlatá loď obchodníka stojí v sektoroch {s} na hranici pásov 2 a 3 (mimo radiácie). Predáva {n} predmetov za kredity; ponuka sa mení každých {m} minút. V sektore {s1} najviac Vzácne, v sektore {s2} výnimočne aj Epické. Predmety mu predáš za {x}× viac, než dostaneš za rozobratie.','tie.h':'Úroveň výzvy','tie.lv':'Výzva','are.h':'Pirátska aréna','are.k':'Nepriateľ','are.hp':'Výdrž (vlna 1)','are.dm':'Poškodenie (vlna 1)','are.from':'Od vlny','are.g':'Výdrž rastie × {h} a poškodenie × {d} za každú vlnu (vlna 50: × {h50} / × {d50}, vlna 100: × {h100} / × {d100}).','pil.h':'Pilot – úrovne a schopnosti',
  'pil.p':'Pilot má {m} úrovní. Body skúsenosti (XP) získavaš za činnosti v tabuľke; vyšší sektor dáva viac (× 1 + 0,3 za každý sektor), Ťažká obtiažnosť × {h}, Nightmare × {n}. Každá úroveň dá 1 bod schopnosti. Body vkladáš v paneli Pilot (ťukni na úroveň pilota pod názvom sektora alebo stlač L); vrátiť ich môžeš za kredity.',
  'pil.src':'Činnosť','pil.xp':'XP','pil.lv':'Úroveň','pil.need':'XP na ďalšiu úroveň','pil.sk':'Schopnosť','pil.per':'Za 1 bod','pil.max':'Najviac',
  'pil.s':['Vyťažená tona rudy / viriditu / kryštálov','Vyťažený relikt (vo vonkajších pásoch viac)','Zničená stíhačka / korzár / fregata','Splnená misia (podľa odmeny)','Obsadenie sektora','Postavený modul (× číslo sektora)','Úspešné vylepšenie predmetu (× nové +N)'],
  'stor.p':'Na stanici v sektore {s} je hlavný sklad (panel Stanica → Sklad). Ukladáš doň predmety z inventára lode a späť ich berieš iba pri tejto stanici; prezerať ho môžeš odkiaľkoľvek. Začína so {c0} miestami, každé rozšírenie pridá {st} miest (najviac {mx}). Predmety v sklade sa dajú zoradiť podľa rarity, úrovne, typu, vylepšenia alebo novosti a vyhľadať podľa názvu, typu, rarity či vlastnosti. Tlačidlo „Uložiť celý inventár“ presunie všetko okrem zamknutých predmetov.',
  'hg.p':'V paneli Loď → Hangár kupuješ ďalšie lode. Každá sa odomkne obsadením určitého sektora. Loď násobí hodnoty vylepšení (napr. Bizón má dvojnásobný náklad), ale jej vylepšenia môžu byť drahšie. Každá loď má vlastné úrovne vylepšení, nasadené predmety sa prenášajú. Prestúpiť sa dá iba pri stanici.',
  'hg.ship':'Loď','hg.cost':'Cena','hg.unlock':'Odomkne','hg.mul':'Násobky vylepšení','hg.upc':'Cena vylepšení','hg.start':'od začiatku','ship.lv':'Úroveň','ship.val':'Hodnota','ship.cost':'Cena ďalšej úrovne',
  'ship.p':'Každá loď má {n} vylepšení v {g} skupinách. Úrovne 1–5 stoja suroviny, úrovne 6–10 aj kredity. K hodnotám sa pripočítajú bonusy z nasadených predmetov. Na ťažkej obtiažnosti je rýchlosť o 15 % nižšia.',
  'hull.h':'Trup, štíty a nárazy',
  'hull.l':['Náraz do asteroidu poškodí loď, ak je rýchlejší ako {min} m/s: poškodenie = (rýchlosť − {min}) × {per}. Vlastnosť „Odolnosť voči nárazom“ ho znižuje (najviac o {cap} %).',
    'Štíty zachytia nárazy aj radiáciu v pásoch skôr ako trup. Začnú sa dobíjať po čase podľa úrovne Regenerácie štítov (15 s na úrovni 1).',
    'Na ľahkej obtiažnosti sa trup sám opravuje {hd} s po poslednom poškodení rýchlosťou {hr} % za sekundu.',
    'Pri stanici opravíš trup za rudu: 1 ruda = {rp} body trupu. Na ťažkej obtiažnosti je to jediný spôsob opravy.',
    'Keď trup klesne na nulu, loď sa zničí, náklad sa stratí a nová loď sa objaví pri stanici. Výbava a vylepšenia zostanú.'],
  'it.h':'Predmety a výbava','it.type':'Typ','it.slot':'Slot','it.imp':'Hlavná vlastnosť','it.pool':'Možné ďalšie vlastnosti',
  'it.p':'Loď má päť slotov: laser, motor, trup, štít a doplnok. Každý predmet má hlavnú vlastnosť podľa typu (s dvojnásobnou silou) a niekoľko náhodných vlastností podľa rarity. Predmety nasadíš v menu Výbava.',
  'it.stat':'Vlastnosť','it.base':'Rozsah (úroveň 0, mult 1)','it.ex':'Príklad: Vzácne, úroveň 20','it.cap':'Strop',
  'it.f':'Sila vlastnosti = náhodná hodnota z rozsahu × (1 + {il} × úroveň predmetu) × násobok rarity. Hlavná vlastnosť × 2. Každé vylepšenie +1 pridá {es} % ku všetkým vlastnostiam.',
  'it.fx':'Vlastnosti z viacerých predmetov sa sčítavajú.',
  'rar.h':'Rarity','rar.r':'Rarita','rar.w':'Základná šanca','rar.aff':'Náhodné vlastnosti','rar.m':'Sila','rar.e':'Max. vylepšenie','rar.s':'Rozobratie (základ)',
  'rar.p':'Predmety majú desať rarít. Vyššia rarita znamená viac vlastností, silnejšie hodnoty, vyšší strop vylepšenia a bohatší vzhľad. Od Legendárnej rarity má predmet aj vlastné meno.',
  'drop.h':'Pravdepodobnosti koristi','drop.src':'Zdroj',
  'drop.p':'Šancu na vyššiu raritu zvyšuje zdroj, pás, sektor a vlastnosť „Šanca na vzácnu korisť“ na tvojej výbave. Z bežného asteroidu, ktorý vyťaží tvoja loď, padne predmet so šancou {ad} %; z reliktu vždy (najmenej Obyčajný) a ide rovno do inventára (do vesmíru padne, len keď je inventár plný). Korisť vo vesmíre svieti farbou svojej rarity. Za obsadenie sektora dostaneš predmet garantovanej rarity.',
  'drop.mf':'Výpočet: mf = zdroj + pás + 0,25 × číslo sektora + bonus výbavy. Váha rarity i (od Vzácnej vyššie) sa násobí (1 + mf)^((i − 3) × 0,35).',
  'drop.ast':'Asteroid, pás {z}','drop.rel':'Relikt, pás {z}','drop.cap':'Obsadenie sektora','drop.pick':'Sektor',
  'drop.ilvl':'Úroveň predmetu = základ sektora + pás (pás 2: +{z2}, pás 3: +{z3}, pás 4: +{z4}) + 0 až 2.',
  'enh.h':'Vylepšovanie predmetov','enh.n':'Vylepšenie','enh.ch':'Šanca','enh.bonus':'Sila vlastností','enh.cr':'Kredity ({r})',
  'enh.p':'V detaile predmetu ho vylepšíš o +1. Do +5 sa vylepšenie vždy podarí, potom šanca klesá (najmenej {min} %). Pri neúspechu sa minú suroviny a kredity, predmet zostane. Najvyššie vylepšenie závisí od rarity.',
  'auto.h':'Automatizácia',
  'auto.l':['Automatická ťažba: po vyťažení asteroidu loď prejde na najbližší asteroid tej istej suroviny do 160 m.','Automatický návrat: pri plnom náklade loď sama poletí na stanicu.',
    'Autopilot: ťaží zvolenú surovinu, vozí ju domov, zbiera korisť do 280 m a ťaží relikty do 200 m. Pri trupe pod 35 % sa vráti a pokračuje od 70 %. Ručný zásah ho na 6 s pozastaví.','Všetko zapneš v menu Nastavenia. Autopilota aj klávesou P alebo tlačidlom View/Share.'],
  'diff.h':'Obtiažnosť','diff.k':'Vlastnosť',
  'diff.rows':[['Oprava trupu','sama po 30 s','len na stanici za rudu','len na stanici za rudu'],['Radiácia v pásoch','× {e1}','× {h1}','× {n1}'],['Za horizontom','× {e2}','× {h2}','× {n2}'],['Rýchlosť lode','× {e3}','× {h3}','× {n3}'],['Výnos surovín','× {e4}','× {h4}','× {n4}'],['Poškodenie pirátov','× {e5}','× {h5}','× {n5}'],['Zničenie lode','strata nákladu','strata nákladu','koniec hry – postup sa vymaže']],
  'diff.p':'Obtiažnosť sa vyberá na začiatku hry a zmeniť ju môžeš len pri novej hre.',
  'gate.h':'Skoková brána, ukladanie a spúšťač',
  'gate.l':['Do iného sektora sa dostaneš iba skokovou bránou (tyrkysový krúžok na minimape, {g} m od stanice). V prvom sektore sa objaví po jeho obsadení.','Pred skokom brána pozbiera korisť, ktorá zostala ležať v sektore.',
    'Hra sa ukladá automaticky každých 6 sekúnd do prehliadača. Spúšťací panel pre Windows hru sťahuje z GitHubu a uložené hry drží vo vlastnom profile, takže prežijú aj aktualizáciu.'],
},
en:{
  'mis.h':'Missions and radiation shield','mis.type':'Mission','mis.what':'Task','mis.base':'Credits (easy, sector 1)','mis.tier':'Tier','mis.mult':'Reward multiplier','mis.minR':'Item','mis.ich':'Item chance','mis.where':'Survey / relic target',
  'mis.p':'Missions come from the mission giver – a purple ship in belt 2 of every sector (a purple square on the minimap). Tap it or fly to it and the mission menu opens. It offers {o} missions for the current sector, and you can have {a} active at once. Offers refresh every {r} minutes, or right away for {c} ¢. Active missions are also shown in the sector panel at the top left, and their targets as purple pillars and stars on the minimap.',
  'mis.sec':'Rewards are multiplied by sector: {m}. Deliveries in later sectors require more resources.',
  'mis.rs':'The radiation shield (Shields group) fully blocks radiation in the belts and beyond the horizon for a limited time, so even hard missions beyond the horizon are doable. It recharges at the station at {rc} s per second. In Settings you choose whether it turns on in any radiation or only beyond the horizon.',
  'mis.d.deliver':'bring and unload a resource','mis.d.scan':'stay within the point’s radius until the scanner finishes','mis.d.relic':'mine the marked relic (item by tier)','mis.d.hunt':'destroy pirates (from sector 2)','mis.d.defend':'repel a raid without the station falling (from sector 2)',
  'mod.h':'Station modules and chips','mod.lv':'Upgrade','mod.rar':'Module rarity','mod.cost':'Next +1 cost','mod.inf':'Influence (dock / tower / sensor)',
  'mod.p':'Tapping the station opens the station panel. Every slot is an expandable card with a preview of the module. A built module can be upgraded up to +{max}; upgrades raise its effect, influence and rarity (frame colour and the module glow in space). You can insert a chip from loot into a module.',
  'mod.chip':'Chips are items for station modules. They drop mostly from pirates ({e}% of pirate loot), less from relics. Drone abilities unlock by rarity – the higher of the module rarity (grows with upgrades) and the AI core rarity counts:',
  'mod.cap':['{g}: the drone also mines viridite (in the outer belts too; radiation does not hurt it).','{d}: defense mode – during a raid the drone attacks pirates near the station.','{c}: the drone also mines crystals.'],
  'mod.fx':'Effect at +0 and per +1: drone dock {dr} t/s (+{drp}%), capacity {dc} t (+{dcp} t), speed {ds} m/s (+{dsp}%); tower {td} damage (+{tdp}%), {tr} shots/s, range {tg} m (+{tgp} m); sensor array {sg} viridite/min (+{sgp}%).',
  'mod.sell':'Selling a module returns {b}% of its build price and {e}% of the resources spent on its upgrades; the chip goes back to the inventory.',
  'mod.paused':'If a claimed sector’s influence drops below the threshold (for example after selling towers), the sector stays accessible, but its passive income pauses until influence reaches the threshold again.',
  'cmb.h':'Combat and pirates','cmb.kind':'Pirate','cmb.hp':'Hit points','cmb.dmg':'Shot damage','cmb.fire':'Shot every','cmb.drop':'Item chance','cmb.cr':'Credits',
  'cmb.p':'From sector 2 on, pirates raid the station. They fly to the station and shoot it; if your ship is closer than {ag} m or you shoot them, they attack you.',
  'cmb.l':['Lasers: the weapon fires instant bursts ({b} shots) at the targeted or nearest pirate; each shot hits with a {hb}% chance (the Gunner skill raises it up to {hm}%). Pirates shoot the same way, with a {ph}% chance. Laser colour by weapon rarity: no weapon grey, up to Rare blue, Epic and Legendary gold, Mythic red, Divine lightning, Primal a steady rainbow beam with pulses.','Critical hit: every shot has a {cc}% chance (plus the “Critical hit chance” stat, up to 75%) to deal {cd}% more damage (plus the “Critical damage” stat). A damage number pops up over the target; critical hits are gold.','The ship’s weapon fires by itself at the nearest pirate within {gr} m. Tap a pirate (or press mine when one is close) to target it; the ship stays in range.',
    'Defense towers shoot pirates near the station. Drones with an AI core in defense mode also fight during raids.',
    'If the station’s integrity reaches zero, pirates steal {st}% of the station’s ore and viridite, fly off, and modules go offline for {off} s. The station then repairs itself.',
    'A repelled raid pays {rb} ¢ per pirate. On Hard pirates hit {hd}% harder.'],
  'cmb.raid':'Raids by sector','cmb.sec':'Sector','cmb.first':'First raid after','cmb.every':'Interval','cmb.count':'Fighters','cmb.cors':'Corsair chance','cmb.none':'no pirates',
  'cmb.fighter':'Fighter','cmb.corsair':'Corsair','cmb.frigate':'Frigate','cmb.frig':'Frigate chance','cmb.shp':'Station integrity: {a} + {b} × core level.',
  title:'Handbook',search:'Search the handbook…',none:'Nothing found.',close:'Close',toc:'Contents',
  auto:'The values in this handbook are computed straight from the game data, so they always match this version of the game.',
  'start.h':'Getting started',
  'start.p':'Orbital Sectors is a top-down space sandbox game. You mine asteroids, haul the resources to the station in the middle of the sector, build modules and gain influence. When influence reaches the threshold, the sector is yours: you get credits and an item, and the next sector unlocks.',
  'start.loop':'Game loop',
  'start.l':['Mine ore in the inner belts and rarer resources in the outer radiation belts.','Cargo unloads automatically at the station.','Spend resources on ship upgrades and station modules.','With enough influence the sector is claimed.','Use the jump gate to reach the next sector.','Collect and upgrade items from relics.'],
  'ctl.h':'Controls','ctl.act':'Action','ctl.touch':'Touch / mouse','ctl.key':'Keyboard','ctl.pad':'Controller (Xbox / PS)',
  'ctl.p':'The game detects what you are playing with and adapts the hints. Tapping the minimap sends the ship there.',
  'ctl.rows':[['Fly','tap or hold in space','WASD / arrows','left stick'],['Mine nearest asteroid','tap an asteroid','Space','A / ✕ or RT'],
    ['Return to station','Home button','H','B / ○'],['Station','Station button','1','Y / △'],['Ship','Ship button','2','X / □'],['Gear','Gear button','I','LT / L2'],
    ['Sector map','Map button','3','Menu / Options'],['Settings','Settings button','O','LB / RB in menus'],['Attack a pirate','tap a pirate','Space (pirate nearby)','A / ✕'],['Autopilot on/off','Settings','P','View / Share'],['Handbook','Wiki button','K','–'],
    ['Zoom','scroll or pinch','mouse wheel','right stick'],['Menu navigation','tap','Tab, Enter','D-pad, A, B, LB/RB']],
  'res.h':'Resources and credits','res.name':'Resource','res.where':'Where','res.rate':'Mining speed','res.use':'Used for',
  'res.p':'The mining laser works at a speed set by its level; rarer resources mine slower. Mined resources stay in cargo until you unload them at the station. If the ship is destroyed, the cargo is lost.',
  'res.use.ore':'all building, upgrades and repairs','res.use.green':'higher upgrade levels, sensors, core LV4','res.use.crystal':'top levels, core LV5','res.use.relic':'gives no resource, drops an item',
  'res.cr':'Credits (¢) are a currency. You earn them by claiming sectors, passively from claimed sectors ({c} ¢ per minute each) and by salvaging items. They pay for upgrade levels 6–10 and for item upgrades.',
  'res.belts':'belts','res.sec':'sectors',
  'zone.h':'Belts and radiation','zone.zone':'Belt','zone.range':'Distance from station','zone.easy':'Radiation (Easy)','zone.hard':'Radiation (Hard)',
  'zone.p':'Every sector has four belts around the station. Belts 1 and 2 are safe. Belts 3 and 4 are radioactive, more so the farther out; radiation drains shields first, then the hull. Beyond the horizon the hull breaks up fast and shields do nothing. You cannot fly farther than {lim} m.',
  'zone.filter':'The item stat “Radiation protection” reduces radiation in belts 3–4 (up to {cap}%), but not beyond the horizon.',
  'zone.hz':'horizon','zone.beyond':'beyond the horizon','zone.safe':'no radiation','zone.per':'/s',
  'sec.h':'Sectors','sec.name':'Sector','sec.res':'Resources','sec.ast':'Asteroids','sec.relic':'Relics','sec.cap':'Influence to claim','sec.rew':'Reward','sec.ilvl':'Item level',
  'sec.p':'Sectors unlock one by one: the next opens once you claim the previous one. Item level grows with the sector and the belt where the item dropped.',
  'st.h':'Station and influence','st.lv':'Core level','st.slots':'Slots','st.inf':'Core influence','st.next':'Next level cost',
  'st.mod':'Module','st.minf':'Influence','st.c1':'1st','st.c2':'2nd','st.c3':'3rd','st.pas':'Income once claimed',
  'st.p':'Sector influence = core level × {ci} + module influence. Each additional module of the same type costs more. You can sell a module for {sell}% of its price, which frees the slot.',
  'st.pd':'{o} ore/min','st.ps':'{g} viridite/min','st.pt':'influence only',
  'ship.h':'Ship and upgrades','hg.h':'Hangar and ships','stor.h':'Main storage','sto.k':'Expansion','trd.h':'Trader',
  'trd.p':'The golden trader ship stands in {s} at the edge of belts 2 and 3 (outside radiation). It sells {n} items for credits; the offer changes every {m} minutes. In {s1} at most Rare, in {s2} rarely even Epic. It buys your items for {x}× more than salvage gives.','tie.h':'Challenge level','tie.lv':'Challenge','are.h':'Pirate Arena','are.k':'Enemy','are.hp':'Integrity (wave 1)','are.dm':'Damage (wave 1)','are.from':'From wave','are.g':'Integrity grows × {h} and damage × {d} per wave (wave 50: × {h50} / × {d50}, wave 100: × {h100} / × {d100}).','pil.h':'Pilot – levels and skills',
  'pil.p':'The pilot has {m} levels. You earn experience (XP) for the activities in the table; higher sectors give more (× 1 + 0.3 per sector), Hard × {h}, Nightmare × {n}. Each level gives 1 skill point. Spend points in the Pilot panel (tap the pilot level under the sector name or press L); you can refund them for credits.',
  'pil.src':'Activity','pil.xp':'XP','pil.lv':'Level','pil.need':'XP to next level','pil.sk':'Skill','pil.per':'Per point','pil.max':'Max',
  'pil.s':['Mined ton of ore / viridite / crystals','Mined relic (more in the outer belts)','Destroyed fighter / corsair / frigate','Completed mission (by reward)','Claiming a sector','Built module (× sector number)','Successful item upgrade (× new +N)'],
  'stor.p':'The station in {s} has the main storage (Station → Storage). You move items between the ship inventory and the storage only at this station; you can browse it from anywhere. It starts with {c0} slots, each expansion adds {st} (up to {mx}). Stored items can be sorted by rarity, level, type, upgrade or newest and searched by name, type, rarity or stat. “Store the whole inventory” moves everything except locked items.',
  'hg.p':'In Ship → Hangar you buy more ships. Each unlocks when you claim a certain sector. A ship multiplies upgrade values (e.g. the Bison has double cargo), but its upgrades may cost more. Each ship has its own upgrade levels; equipped items carry over. You can switch only at the station.',
  'hg.ship':'Ship','hg.cost':'Price','hg.unlock':'Unlocks','hg.mul':'Upgrade multipliers','hg.upc':'Upgrade cost','hg.start':'from the start','ship.lv':'Level','ship.val':'Value','ship.cost':'Next level cost',
  'ship.p':'Each ship has {n} upgrades in {g} groups. Levels 1–5 cost resources, levels 6–10 also credits. Bonuses from equipped items are added on top. On Hard the speed is 15% lower.',
  'hull.h':'Hull, shields and collisions',
  'hull.l':['Hitting an asteroid faster than {min} m/s damages the ship: damage = (speed − {min}) × {per}. The stat “Collision resistance” reduces it (up to {cap}%).',
    'Shields absorb collisions and belt radiation before the hull. They start recharging after a delay set by Shield regeneration (15 s at level 1).',
    'On Easy the hull repairs itself {hd} s after the last damage at {hr}% per second.',
    'At the station you can repair the hull for ore: 1 ore = {rp} hull points. On Hard this is the only way to repair.',
    'When the hull reaches zero the ship is destroyed, cargo is lost and a new ship appears at the station. Gear and upgrades stay.'],
  'it.h':'Items and gear','it.type':'Type','it.slot':'Slot','it.imp':'Main stat','it.pool':'Possible extra stats',
  'it.p':'The ship has five slots: laser, engine, hull, shield and utility. Each item has a main stat by type (at double strength) and a number of random stats by rarity. Equip items in the Gear menu.',
  'it.stat':'Stat','it.base':'Range (level 0, mult 1)','it.ex':'Example: Rare, level 20','it.cap':'Cap',
  'it.f':'Stat strength = random value from the range × (1 + {il} × item level) × rarity multiplier. Main stat × 2. Each +1 upgrade adds {es}% to all stats.',
  'it.fx':'Stats from several items add up.',
  'rar.h':'Rarities','rar.r':'Rarity','rar.w':'Base chance','rar.aff':'Random stats','rar.m':'Strength','rar.e':'Max upgrade','rar.s':'Salvage (base)',
  'rar.p':'Items come in ten rarities. Higher rarity means more stats, stronger values, a higher upgrade cap and a richer look. From Legendary up, items also have their own name.',
  'drop.h':'Loot chances','drop.src':'Source',
  'drop.p':'Your chance of higher rarity grows with the source, the belt, the sector and the “Rare loot chance” stat on your gear. A regular asteroid mined by your ship drops an item with a {ad}% chance; a relic always does (at least Ordinary) and it goes straight to your inventory (it only drops into space when the inventory is full). Loot in space glows in its rarity colour. Claiming a sector gives an item of guaranteed rarity.',
  'drop.mf':'Formula: mf = source + belt + 0.25 × sector number + gear bonus. The weight of rarity i (from Rare up) is multiplied by (1 + mf)^((i − 3) × 0.35).',
  'drop.ast':'Asteroid, belt {z}','drop.rel':'Relic, belt {z}','drop.cap':'Sector claim','drop.pick':'Sector',
  'drop.ilvl':'Item level = sector base + belt (belt 2: +{z2}, belt 3: +{z3}, belt 4: +{z4}) + 0 to 2.',
  'enh.h':'Upgrading items','enh.n':'Upgrade','enh.ch':'Chance','enh.bonus':'Stat strength','enh.cr':'Credits ({r})',
  'enh.p':'In the item detail you can upgrade it by +1. Up to +5 it always succeeds, then the chance drops (to at least {min}%). On failure the resources and credits are spent and the item stays. The highest upgrade depends on rarity.',
  'auto.h':'Automation',
  'auto.l':['Auto-mining: when an asteroid is depleted, the ship moves to the nearest asteroid of the same resource within 160 m.','Auto-return: with full cargo the ship flies to the station by itself.',
    'Autopilot: mines the chosen resource, hauls it home, picks up loot within 280 m and mines relics within 200 m. Below 35% hull it returns and continues from 70%. Manual input pauses it for 6 s.','Turn everything on in the Settings menu. The autopilot also with the P key or the View/Share button.'],
  'diff.h':'Difficulty','diff.k':'Property',
  'diff.rows':[['Hull repair','by itself after 30 s','only at the station, for ore','only at the station, for ore'],['Belt radiation','× {e1}','× {h1}','× {n1}'],['Beyond the horizon','× {e2}','× {h2}','× {n2}'],['Ship speed','× {e3}','× {h3}','× {n3}'],['Resource yield','× {e4}','× {h4}','× {n4}'],['Pirate damage','× {e5}','× {h5}','× {n5}'],['Ship destroyed','cargo lost','cargo lost','game over – progress wiped']],
  'diff.p':'Difficulty is chosen at the start and can only be changed with a new game.',
  'gate.h':'Jump gate, saving and launcher',
  'gate.l':['You reach another sector only through the jump gate (cyan ring on the minimap, {g} m from the station). In the first sector it appears once you claim it.','Before a jump the gate collects any loot left in the sector.',
    'The game saves automatically every 6 seconds in the browser. The Windows launcher downloads the game from GitHub and keeps saves in its own profile, so they survive updates.'],
}};
const wt=(k,v)=>{let s=(WT[lang]&&WT[lang][k]!=null)?WT[lang][k]:WT.sk[k];if(s==null)return k;if(v&&typeof s==='string')for(const n in v)s=s.split('{'+n+'}').join(v[n]);return s};

/* ---------- pomocníci pre tabuľky a obrázky ---------- */
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const nf=(x,d=0)=>Number(x).toLocaleString(lang==='sk'?'sk-SK':'en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const pct=x=>x<=0?'–':x<.001?'<0,1 %'.replace(',',lang==='sk'?',':'.'):nf(x*100,x<.01?2:1)+' %';
function tbl(head,rows,cls=''){return `<div class="wtbl ${cls}"><table><thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
const gem=r=>r==='cr'?'<span class="coin"></span>':`<span class="gem" style="background:${RCOL[r]};box-shadow:0 0 6px ${RCOL[r]}"></span>`;
function costTxt(c){const parts=[];for(const r of COST_KEYS)if(c[r])parts.push(`<span class="wcost">${gem(r)}${nf(c[r])}</span>`);return parts.join(' ')||'–'}
const rarName=i=>`<span class="wrar" style="color:${RAR[i].col}">${t('r.'+RAR[i].k)}</span>`;
const list=a=>`<ul class="wlist">${a.map(x=>`<li>${x}</li>`).join('')}</ul>`;
const fill=(s,v)=>{for(const n in v)s=s.split('{'+n+'}').join(v[n]);return s};

/* Schéma pásov sektora (SVG): stanica v strede, pásy, radiácia, horizont, brána. */
function zoneSvg(){const s=200/LIMIT;const R=x=>x*s;const lab=(x,txt,col)=>`<text x="${214+R(x)*Math.cos(.55)}" y="${214+R(x)*Math.sin(.55)}" fill="${col}" font-size="11" font-family="JetBrains Mono,monospace">${txt}</text>`;
  return `<svg class="wimg" viewBox="0 0 420 420" role="img" aria-label="${esc(wt('zone.h'))}">
  <defs><radialGradient id="wz" cx="50%" cy="50%" r="50%"><stop offset="${Z2/LIMIT}" stop-color="#ff9a4d" stop-opacity="0"/><stop offset="${HORIZON/LIMIT}" stop-color="#ff9a4d" stop-opacity=".32"/><stop offset="${HORIZON/LIMIT}" stop-color="#ff3b2f" stop-opacity=".28"/><stop offset="1" stop-color="#ff3b2f" stop-opacity=".45"/></radialGradient></defs>
  <circle cx="210" cy="210" r="${R(LIMIT)}" fill="url(#wz)" stroke="#ff3b2f" stroke-opacity=".5" stroke-dasharray="4 4"/>
  ${[Z1,Z2,Z3].map(z=>`<circle cx="210" cy="210" r="${R(z)}" fill="none" stroke="#7fa7d0" stroke-opacity=".45"/>`).join('')}
  <circle cx="210" cy="210" r="${R(HORIZON)}" fill="none" stroke="#ff8a5c" stroke-width="2"/>
  ${[[Z1/2,'1'],[(Z1+Z2)/2,'2'],[(Z2+Z3)/2,'3'],[(Z3+HORIZON)/2,'4']].map(([r,n])=>`<text x="210" y="${214-R(r)}" text-anchor="middle" fill="#dde7f1" font-size="15" font-weight="700" font-family="Saira Semi Condensed,sans-serif">${n}</text>`).join('')}
  ${lab(Z1,Z1+' m','#8597ab')}${lab(Z2,Z2+' m','#8597ab')}${lab(Z3,Z3+' m','#f0a644')}${lab(HORIZON,HORIZON+' m','#ff8a5c')}
  <polygon points="210,203 216,206.5 216,213.5 210,217 204,213.5 204,206.5" fill="#58d0c0"/>
  <circle cx="${210+R(72)*Math.cos(-2.3)}" cy="${210+R(72)*Math.sin(-2.3)}" r="5" fill="none" stroke="#7ef2e2" stroke-width="2"/>
  ${[[60,.4,'ore'],[70,2.2,'ore'],[52,4,'ore'],[100,1.1,'green'],[110,3.3,'green'],[140,.7,'crystal'],[150,5.2,'crystal'],[130,2.8,'relic']].map(([r,a,k])=>`<circle cx="${210+R(r)*Math.cos(a)}" cy="${210+R(r)*Math.sin(a)}" r="${k==='relic'?4:3}" fill="${RCOL[k]}"/>`).join('')}
  <text x="210" y="${210+R(HORIZON)+18}" text-anchor="middle" fill="#ff8a5c" font-size="12" font-family="Saira Semi Condensed,sans-serif">${esc(wt('zone.hz'))}</text>
  </svg>`}
/* Loď Klepeto zhora (SVG). */
function shipSvg(){return `<svg class="wimg wship" viewBox="0 0 200 160" role="img" aria-label="Klepeto">
  <g fill="none" stroke-linecap="round">
  <path d="M100 18 C 60 20, 44 52, 58 82" stroke="#b9c6d4" stroke-width="12"/><path d="M100 18 C 140 20, 156 52, 142 82" stroke="#b9c6d4" stroke-width="12"/>
  <path d="M100 26 C 66 28, 54 54, 64 78" stroke="#58d0c0" stroke-width="2"/><path d="M100 26 C 134 28, 146 54, 136 78" stroke="#58d0c0" stroke-width="2"/></g>
  <path d="M84 60 L116 60 L124 120 L76 120 Z" fill="#4a5a6e"/><rect x="66" y="118" width="68" height="18" rx="3" fill="#4a5a6e"/>
  <rect x="58" y="96" width="12" height="30" rx="2" fill="#1d2635"/><rect x="130" y="96" width="12" height="30" rx="2" fill="#1d2635"/>
  <circle cx="100" cy="46" r="8" fill="#7ef2e2"/><circle cx="100" cy="46" r="16" fill="#7ef2e2" opacity=".2"/>
  ${[78,100,122].map(x=>`<circle cx="${x}" cy="142" r="5" fill="#6fe3ff"/><circle cx="${x}" cy="148" r="8" fill="#6fe3ff" opacity=".3"/>`).join('')}
  <rect x="94" y="80" width="12" height="4" fill="#58d0c0"/></svg>`}

/* ---------- kapitoly ---------- */
let wikiSec=0; // sektor zvolený v tabuľke pravdepodobností
function wikiSections(){const S=[];const H=(id,h,body)=>S.push({id,h,body});
  H('start',wt('start.h'),`<p>${wt('start.p')}</p><h4>${wt('start.loop')}</h4><ol class="wlist">${wt('start.l').map(x=>`<li>${x}</li>`).join('')}</ol><p class="wnote">${wt('auto')}</p>`);
  H('controls',wt('ctl.h'),`<p>${wt('ctl.p')}</p>`+tbl([wt('ctl.act'),wt('ctl.touch'),wt('ctl.key'),wt('ctl.pad')],wt('ctl.rows').map(r=>[`<b>${r[0]}</b>`,r[1],`<kbd>${r[2]}</kbd>`,r[3]])));
  { // suroviny: kde sa nachádzajú (zo SECTORS.fields)
    const where=k=>{const secs=[],belts=new Set();SECTORS.forEach((s,i)=>s.fields.forEach(f=>{if(f.type===k||f.type==='mix'){if(!secs.includes(i))secs.push(i);for(let z=1;z<=4;z++){const lo=[0,Z1,Z2,Z3][z-1],hi=[Z1,Z2,Z3,HORIZON][z-1];if(f.r[0]<hi&&f.r[1]>lo)belts.add(z)}}}));
      return `${wt('res.sec')}: ${secs.map(i=>secName(i)).join(', ')}<br>${wt('res.belts')}: ${[...belts].sort().join(', ')}`};
    const rows=['ore','green','crystal','relic'].map(k=>[`${gem(k)} <b>${k==='relic'?t('relic'):t('res.'+k)}</b>`,where(k),nf(MINE_RATE[k]*100)+' %',wt('res.use.'+k)]);
    H('res',wt('res.h'),`<p>${wt('res.p')}</p>`+tbl([wt('res.name'),wt('res.where'),wt('res.rate'),wt('res.use')],rows)+`<p>${gem('cr')} ${wt('res.cr',{c:nf(SECTOR_CREDITS*60)})}</p>`)}
  { // pásy a radiácia
    // belt=true: hodnota na vonkajšom okraji pásu 4 je ešte radiácia pásu (RAD.end), nie hodnota za horizontom
    const rb=(r,belt)=>r<Z2?0:(r<HORIZON||belt)?RAD.start+(Math.min(r,HORIZON)-Z2)/(HORIZON-Z2)*(RAD.end-RAD.start):RAD.voidBase+(r-HORIZON)*RAD.voidPerM;
    const rr=(a,b,m,belt=true)=>`${nf(rb(a,belt)*m,1)} – ${nf(rb(b,belt)*m,1)}${wt('zone.per')}`;
    const rows=[[1,0,Z1],[2,Z1,Z2],[3,Z2,Z3],[4,Z3,HORIZON]].map(([z,a,b])=>[`<b>${z}</b>`,`${a} – ${b} m`,z<3?wt('zone.safe'):rr(a,b,DIFF.easy.rad),z<3?wt('zone.safe'):rr(a,b,DIFF.hard.rad)]);
    rows.push([`<b>${wt('zone.beyond')}</b>`,`${HORIZON} – ${LIMIT} m`,rr(HORIZON,LIMIT,DIFF.easy.voidM,false),rr(HORIZON,LIMIT,DIFF.hard.voidM,false)]);
    H('zones',wt('zone.h'),`<div class="wfig">${zoneSvg()}<div><p>${wt('zone.p',{lim:LIMIT})}</p><p>${wt('zone.filter',{cap:STATS.rad.cap})}</p></div></div>`+tbl([wt('zone.zone'),wt('zone.range'),wt('zone.easy'),wt('zone.hard')],rows))}
  { // sektory
    const rows=SECTORS.filter(s=>!s.arena).map((s,i)=>{const cnt={};s.fields.forEach(f=>cnt[f.type]=(cnt[f.type]||0)+f.n);
      return[`<b>${secName(i)}</b>`,s.res.map(gem).join(' '),['ore','green','crystal','mix'].filter(k=>cnt[k]).map(k=>k==='mix'?`${t('res.mix')} ${cnt[k]}`:`${gem(k)} ${cnt[k]}`).join(' '),cnt.relic||0,s.capture,`${gem('cr')} ${nf(s.reward.cr)} + ${rarName(s.reward.minR)}+`,`${s.ilvl} – ${s.ilvl+ILVL_ZONE[4]+2}`]});
    H('sectors',wt('sec.h'),`<p>${wt('sec.p')}</p>`+tbl([wt('sec.name'),wt('sec.res'),wt('sec.ast'),wt('sec.relic'),wt('sec.cap'),wt('sec.rew'),wt('sec.ilvl')],rows))}
  { // stanica
    const core=[];for(let L=1;L<=CORE_MAX;L++)core.push([`<b>${L}</b>`,slotsFor(L),L*CORE_INF,L<CORE_MAX?costTxt(coreCost(L)):'–']);
    const inc={drone:wt('st.pd',{o:nf(MOD_FX.drone.income*60)}),tower:wt('st.pt'),sensor:wt('st.ps',{g:nf(MOD_FX.sensor.green*60,1)})};
    const mods=Object.keys(MOD).map(k=>[`<b>${t('mod.'+k)}</b>`,'+'+MOD[k].inf,costTxt(MOD[k].cost(0)),costTxt(MOD[k].cost(1)),costTxt(MOD[k].cost(2)),inc[k]]);
    H('station',wt('st.h'),`<p>${wt('st.p',{ci:CORE_INF,sell:SELL_BUILD*100})}</p>`+tbl([wt('st.lv'),wt('st.slots'),wt('st.inf'),wt('st.next')],core)+tbl([wt('st.mod'),wt('st.minf'),wt('st.c1'),wt('st.c2'),wt('st.c3'),wt('st.pas')],mods))}
  { // moduly stanice a čipy
    const F=MOD_FX;const rows=[];for(let n=0;n<=MOD_ENH_MAX;n++){const R=MOD_RAR[n];rows.push([`<b>+${n}</b>`,rarName(R),n<MOD_ENH_MAX?costTxt(modEnhCost(n)):'–',['drone','tower','sensor'].map(k=>Math.round(MOD[k].inf*(1+MOD_ENH_INF*n))).join(' / ')])}
    const capTxt=wt('mod.cap').map(x=>fill(x,{g:rarName(CHIP_CAP.green),d:rarName(CHIP_CAP.def),c:rarName(CHIP_CAP.crystal)}));
    H('modules',wt('mod.h'),`<p>${wt('mod.p',{max:MOD_ENH_MAX})}</p><p>${wt('mod.fx',{dr:F.drone.rate,drp:F.drone.ratePer*100,dc:F.drone.cap,dcp:F.drone.capPer,ds:F.drone.speed,dsp:nf(F.drone.speedPer*100),td:F.tower.dmg,tdp:F.tower.dmgPer*100,tr:F.tower.rate,tg:F.tower.range,tgp:F.tower.rangePer,sg:nf(F.sensor.green*60,1),sgp:F.sensor.incPer*100})}</p>`
      +tbl([wt('mod.lv'),wt('mod.rar'),wt('mod.cost'),wt('mod.inf')],rows)+`<p>${wt('mod.chip',{e:nf(CHIP_CHANCE.enemy*100)})}</p>`+list(capTxt)
      +`<p>${wt('mod.sell',{b:SELL_BUILD*100,e:SELL_ENH*100})}</p><p>${wt('mod.paused')}</p>`)}
  { // boj
    const kinds=['fighter','corsair','frigate'].map(k=>{const P=PIRATES[k];return[`<b>${wt('cmb.'+k)}</b>`,P.hp.slice(1).filter(x=>x).join(' / '),P.dmg.slice(1).filter(x=>x).join(' / '),nf(P.fire,1)+' s',pct(P.drop),`${gem('cr')} ${P.cr[0]}–${P.cr[1]}`]});
    const raids=SECTORS.map((S,i)=>{const c=PIRATES.raid[i];return c?[`<b>${secName(i)}</b>`,c.first+' s',`${c.every[0]}–${c.every[1]} s`,`${c.count[0]}–${c.count[1]}`,pct(c.corsair),pct(c.frigate||0)]:[`<b>${secName(i)}</b>`,wt('cmb.none'),'–','–','–','–']});
    H('combat',wt('cmb.h'),`<p>${wt('cmb.p',{ag:PIRATES.aggro})}</p>`+list(wt('cmb.l').map(x=>fill(x,{b:LASER_BURST,hb:HIT_BASE*100,hm:HIT_MAX*100,ph:PIRATE_HIT*100,cc:CRIT_BASE,cd:CRIT_DMG,gr:GUN_RANGE,st:PIRATES.steal*100,off:PIRATES.offline,rb:PIRATES.repelBonus,hd:Math.round((PIRATES.hardDmg-1)*100)})))
      +tbl([wt('cmb.kind'),wt('cmb.hp'),wt('cmb.dmg'),wt('cmb.fire'),wt('cmb.drop'),wt('cmb.cr')],kinds)+`<h4>${wt('cmb.raid')}</h4>`+tbl([wt('cmb.sec'),wt('cmb.first'),wt('cmb.every'),wt('cmb.count'),wt('cmb.cors'),wt('cmb.frig')],raids)
      +`<p class="wnote">${wt('cmb.shp',{a:PIRATES.stationHp(0),b:PIRATES.stationHp(1)-PIRATES.stationHp(0)})}</p>`)}
  { // misie a radiačný štít
    const types=Object.keys(MREWARD).map(k=>[`<b>${missionTitle({type:k,res:'ore'}).replace(t('res.ore'),'…')}</b>`,wt('mis.d.'+k),`${gem('cr')} ${MREWARD[k]}`+(MORE[k]?` + ${gem('ore')} ${MORE[k]}`:'')]);
    const tiers=MTIER.map((T,i)=>[`<b>${t('mt.'+T.k)}</b>`,'× '+nf(T.mult,1),rarName(T.minR)+'+',pct(T.itemCh),`${MPOS[i][0]}–${MPOS[i][1]} m`+(i===2?' ('+wt('zone.beyond')+')':'')]);
    H('missions',wt('mis.h'),`<p>${wt('mis.p',{o:MISSION_OFFERS,a:MISSION_ACTIVE_MAX,r:MISSION_REFRESH/60,c:MISSION_REROLL})}</p>`+tbl([wt('mis.type'),wt('mis.what'),wt('mis.base')],types)
      +tbl([wt('mis.tier'),wt('mis.mult'),wt('mis.minR'),wt('mis.ich'),wt('mis.where')],tiers)+`<p>${wt('mis.sec',{m:MSEC_MULT.map((x,i)=>secName(i)+' × '+nf(x,1)).join(', ')})}</p><p>${wt('mis.rs',{rc:RADSHIELD_RECHARGE})}</p>`)}
  { // loď
    let h=`<div class="wfig">${shipSvg()}<p>${wt('ship.p',{n:Object.keys(UP).length,g:GROUPS.length})}</p></div>`;
    for(const g of GROUPS){h+=`<h4>${t('grp.'+g)}</h4>`;
      for(const k of Object.keys(UP).filter(k=>UP[k].grp===g)){const u=UP[k];const f=L=>{const v=u.val(L);if(k==='sregen')return t('fmt.sregen',{d:v.delay,r:Math.round(v.rate*100)});if(k==='shield'&&L===0)return t('fmt.none');return u.fmt(v)};
        const rows=[];for(let L=u.min;L<=u.max;L++)rows.push([`<b>${L}</b>`,f(L),L<u.max?costTxt(u.cost(L)):'–']);
        h+=`<details class="wdet"><summary><b>${t('up.'+k)}</b> <span>${f(u.min)} → ${f(u.max)}</span></summary><p>${t('up.'+k+'.d')}</p>${tbl([wt('ship.lv'),wt('ship.val'),wt('ship.cost')],rows)}</details>`}}
    H('ship',wt('ship.h'),h)}
  { const S2=wt('pil.s');const src=[[S2[0],`${XP.ton.ore} / ${XP.ton.green} / ${XP.ton.crystal}`],[S2[1],nf(XP.relic)],[S2[2],`${nf(XP.kill.fighter)} / ${nf(XP.kill.corsair)} / ${nf(XP.kill.frigate)}`],
      [S2[3],nf(XP.missionPerCr*100)+' % ¢'],[S2[4],nf(XP.capture)],[S2[5],nf(XP.build)],[S2[6],nf(XP.enh)]].map(r=>[`<b>${r[0]}</b>`,r[1]]);
    const lv=[1,2,5,10,20,30,50,75,99].map(L=>[`<b>${L} → ${L+1}</b>`,nf(xpNeed(L))]);
    const sk=Object.keys(SKILLS).map(k=>[`<b>${SKILLS[k].ico} ${t('pl.sk.'+k)}</b>`,Object.entries(SKILLS[k].per).map(([s,v])=>`${t(s==='cr'?'pl.cr':'s.'+s)} +${v} %`).join(', '),SKILLS[k].max]);
    H('pilot',wt('pil.h'),`<p>${wt('pil.p',{m:PILOT_MAX,h:nf(XP_DIFF.hard,2),n:nf(XP_DIFF.nightmare,1)})}</p>`+tbl([wt('pil.src'),wt('pil.xp')],src)+tbl([wt('pil.sk'),wt('pil.per'),wt('pil.max')],sk)+tbl([wt('pil.lv'),wt('pil.need')],lv))}
  H('trader',wt('trd.h'),`<p>${wt('trd.p',{s:TRADER_SECS.map(secName).join(', '),s1:secName(TRADER_SECS[0]),s2:secName(TRADER_SECS[1]),n:TRADER_STOCK,m:TRADER_TIME/60,x:TRADER_SELL})}</p>`);
  { const L=[1,2,4,6,8,10,12,14,16].map(n=>[`<b>+${n}</b>`,'+'+nf((Math.pow(TIER.hp,n)-1)*100)+' %','+'+nf((Math.pow(TIER.dmg,n)-1)*100)+' %','+'+nf((Math.pow(TIER.rad,n)-1)*100)+' %','+'+nf((Math.pow(TIER.gain,n)-1)*100)+' %','+'+nf(TIER.mf*n*100)+' %']);
    H('tier',wt('tie.h'),`<p>${t('tr.p')}</p>`+tbl([wt('tie.lv'),t('tr.hp'),t('tr.dmg'),t('tr.rad'),t('tr.gain'),t('tr.mf')],L))}
  { const from={fighter:1,swarm:3,corsair:5,turret:8,frigate:12,dread:20,carrier:100,cmod:100};const nm={fighter:t('cmb.fighter'),swarm:'Roj',corsair:t('cmb.corsair'),turret:'Raketová veža',frigate:t('cmb.frigate'),dread:'Dreadnought (boss)',carrier:'Bojový krížnik (hlavný boss)',cmod:'Modul krížnika'};
    const rows=Object.keys(AK).map(k=>[`<b>${lang==='en'?({swarm:'Swarm',turret:'Missile turret',dread:'Dreadnought (boss)',carrier:'Battle carrier (main boss)',cmod:'Carrier module'}[k]||nm[k]):nm[k]}</b>`,nf(AK[k].hp*NUM),nf(AK[k].dmg*NUM),from[k]]);
    const g=(b,n)=>nf(Math.pow(b,n),1);
    H('arena',wt('are.h'),`<p>${t('ar.p',{w:ARENA_WAVES,b:ARENA_BOSS})}</p>`+list([t('ar.l1'),t('ar.l2',{b:ARENA_BOSS}),t('ar.l3'),t('ar.l4'),t('ar.note')])+tbl([wt('are.k'),wt('are.hp'),wt('are.dm'),wt('are.from')],rows)+`<p class="wnote">${wt('are.g',{h:ARENA_HP,d:ARENA_DMG,h50:g(ARENA_HP,49),d50:g(ARENA_DMG,49),h100:g(ARENA_HP,99),d100:g(ARENA_DMG,99)})}</p>`)}
  { const ex=[0,1,2,3,4].map(n=>[`<b>${STORE_CAP0+n*STORE_STEP} → ${STORE_CAP0+(n+1)*STORE_STEP}</b>`,costTxt(storeExpCost(n))]);
    H('storage',wt('stor.h'),`<p>${wt('stor.p',{s:secName(STORE_SEC),c0:STORE_CAP0,st:STORE_STEP,mx:STORE_MAX})}</p>`+tbl([wt('sto.k'),wt('ship.cost')],ex))}
  { // hangár a lode (v0.8)
    const rows=SHIP_IDS.map(id=>{const S=SHIPS[id];const m=Object.entries(S.mul).map(([k,v])=>`${t('up.'+k)} ×${v}`).join(', ')||'–';
      return[`<span class="wico">${shipIcon(id,'wshipi')}</span> <b>${t('ship.'+id)}</b>`,S.cost?costTxt(S.cost):'–',S.need<0?wt('hg.start'):secName(S.need),m,'×'+S.upMul]});
    H('hangar',wt('hg.h'),`<p>${wt('hg.p')}</p>`+tbl([wt('hg.ship'),wt('hg.cost'),wt('hg.unlock'),wt('hg.mul'),wt('hg.upc')],rows))}
  H('hull',wt('hull.h'),list(wt('hull.l').map(x=>fill(x,{min:COLL.minSpeed,per:nf(COLL.perMs,1),cap:STATS.coll.cap,hd:HULL_DELAY,hr:nf(HULL_RATE*100),rp:REPAIR_PER_ORE}))));
  { // predmety
    const types=Object.keys(BASES).map(b=>{const B=BASES[b];return[`<span class="wico">${icon(b)}</span> <b>${t('base.'+b)}</b>`,t('slot.'+B.slot),t('s.'+B.imp),B.pool.filter(k=>k!==B.imp).map(k=>t('s.'+k)).join(', ')]});
    const ex=(k)=>{const S2=STATS[k];const m=(1+20*ILVL_SCALE)*RAR[4].mult;return `${fmtStat(k,S2.lo*m)} – ${fmtStat(k,S2.hi*m)}`};
    const stats=Object.keys(STATS).map(k=>{const S2=STATS[k];return[t('s.'+k),`${fmtStat(k,S2.lo)} – ${fmtStat(k,S2.hi)}`,ex(k),S2.cap?S2.cap+' %':'–']});
    H('items',wt('it.h'),`<p>${wt('it.p')}</p>`+tbl([wt('it.type'),wt('it.slot'),wt('it.imp'),wt('it.pool')],types)+`<p>${wt('it.f',{il:nf(ILVL_SCALE,2),es:nf(ENH_STEP*100)})} ${wt('it.fx')}</p>`+tbl([wt('it.stat'),wt('it.base'),wt('it.ex'),wt('it.cap')],stats))}
  { // rarity: ukážky s ozajstným vzhľadom z hry
    const base=rarityProbs(0);const keys=Object.keys(BASES);
    const show=`<div class="wrarity">${RAR.map((R,i)=>`<div class="wr"><div class="itm it r${i}" style="--rc:${R.col}">${icon(keys[i%keys.length])}${i>=4?`<span class="enh">+${Math.min(R.enh,i*2)}</span>`:''}</div><span style="color:${R.col}">${t('r.'+R.k)}</span></div>`).join('')}</div>`;
    const rows=RAR.map((R,i)=>[rarName(i),pct(base[i]),R.aff[0]===R.aff[1]?R.aff[0]:R.aff[0]+'–'+R.aff[1],'× '+nf(R.mult,2),'+'+R.enh,`${gem('cr')} ${R.salv}`]);
    H('rarity',wt('rar.h'),`<p>${wt('rar.p')}</p>`+show+tbl([wt('rar.r'),wt('rar.w'),wt('rar.aff'),wt('rar.m'),wt('rar.e'),wt('rar.s')],rows))}
  { // pravdepodobnosti koristi pre zvolený sektor
    const s=wikiSec;const src=[[wt('drop.ast',{z:2}),MF_SOURCE.asteroid+MF_ZONE[2],0],[wt('drop.ast',{z:4}),MF_SOURCE.asteroid+MF_ZONE[4],0],[wt('drop.rel',{z:3}),MF_SOURCE.relic+MF_ZONE[3],2],[wt('drop.rel',{z:4}),MF_SOURCE.relic+MF_ZONE[4],2],[wt('drop.cap'),MF_SOURCE.capture+MF_ZONE[4],SECTORS[s].reward.minR]];
    const rows=src.map(([n,mf,minR])=>[`<b>${n}</b>`,...rarityProbs(mf+s*.25,minR,secRar(s)).map(pct)]);
    const pick=`<div class="wpick"><span>${wt('drop.pick')}:</span>${SECTORS.map((x,i)=>`<button class="langb" data-wsec="${i}" aria-pressed="${i===s}">${secName(i)}</button>`).join('')}</div>`;
    H('drops',wt('drop.h'),`<p>${wt('drop.p',{ad:nf(ASTEROID_DROP*100)})}</p>`+pick+tbl([wt('drop.src'),...RAR.map((R,i)=>rarName(i))],rows,'wsmall')+`<p class="wnote">${wt('drop.mf')}</p><p class="wnote">${wt('drop.ilvl',{z2:ILVL_ZONE[2],z3:ILVL_ZONE[3],z4:ILVL_ZONE[4]})}</p>`)}
  { // vylepšovanie
    const rows=[];for(let n=0;n<20;n++){const it={enh:n,r:4},c=enhCost(it);rows.push([`<b>+${n+1}</b>`,pct(enhChance(it)),costTxt(C(c.ore,c.green,c.crystal)),`${gem('cr')} ${nf(c.cr)}`,`${gem('cr')} ${nf(enhCost({enh:n,r:6}).cr)}`,`${gem('cr')} ${nf(enhCost({enh:n,r:9}).cr)}`,'+'+nf((n+1)*ENH_STEP*100)+' %'])}
    H('enh',wt('enh.h'),`<p>${wt('enh.p',{min:30})}</p>`+tbl([wt('enh.n'),wt('enh.ch'),t('res.ore')+' / '+t('res.green')+' / '+t('res.crystal'),wt('enh.cr',{r:t('r.rare')}),wt('enh.cr',{r:t('r.legendary')}),wt('enh.cr',{r:t('r.primal')}),wt('enh.bonus')],rows,'wsmall'))}
  H('auto',wt('auto.h'),list(wt('auto.l')));
  {const E=DIFF.easy,Hd=DIFF.hard,N=DIFF.nightmare;const v={e1:E.rad,h1:Hd.rad,n1:N.rad,e2:E.voidM,h2:Hd.voidM,n2:N.voidM,e3:E.speed,h3:Hd.speed,n3:N.speed,e4:E.yield,h4:Hd.yield,n4:N.yield,e5:E.pdmg,h5:Hd.pdmg,n5:N.pdmg};
    H('diff',wt('diff.h'),`<p>${wt('diff.p')}</p>`+tbl([wt('diff.k'),t('diff.easy'),t('diff.hard'),t('diff.nightmare')],wt('diff.rows').map(r=>[`<b>${r[0]}</b>`,fill(r[1],v),fill(r[2],v),fill(r[3],v)])))}
  H('gate',wt('gate.h'),list(wt('gate.l').map(x=>fill(x,{g:GATE_R}))));
  return S}

/* ---------- vykreslenie a vyhľadávanie ---------- */
const wLangBtns=()=>`<div class="langs"><button class="langb" data-l="sk" aria-pressed="${lang==='sk'}">SK</button><button class="langb" data-l="en" aria-pressed="${lang==='en'}">EN</button></div>`;
const wnorm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
function renderWiki(){const root=$('#wiki');if(!root)return;const secs=wikiSections();const q=($('#wikiQ')&&$('#wikiQ').value)||'';
  root.innerHTML=`<header class="wiki-h"><img src="${typeof ICON_SRC!=='undefined'?ICON_SRC:'assets/icon-64.png'}" alt="" class="wiki-logo"><h2>${wt('title')}</h2>
    <input id="wikiQ" type="search" placeholder="${esc(wt('search'))}" value="${esc(q)}" autocomplete="off">
    ${wLangBtns()}${root.dataset.standalone?'':`<button class="close" id="wikiClose">${wt('close')}</button>`}</header>
    <nav class="wiki-nav" aria-label="${esc(wt('toc'))}">${secs.map(s=>`<a href="#w-${s.id}" data-wgo="${s.id}">${s.h}</a>`).join('')}</nav>
    <main class="wiki-main" id="wikiMain">${secs.map(s=>`<section class="wsec" id="w-${s.id}"><h3>${s.h}</h3>${s.body}</section>`).join('')}<p class="wnone" hidden>${wt('none')}</p></main>`;
  if(q)wikiFilter(q,false)}
function wikiFilter(q,keepFocus=true){const n=wnorm(q.trim());let any=false;
  document.querySelectorAll('#wiki .wsec').forEach(s=>{const hit=!n||wnorm(s.textContent).includes(n);s.hidden=!hit;if(hit)any=true;
    s.querySelectorAll('details').forEach(d=>{d.open=!!n&&wnorm(d.textContent).includes(n)})});
  document.querySelectorAll('#wiki .wiki-nav a').forEach(a=>{const s=$('#w-'+a.dataset.wgo);a.hidden=s&&s.hidden});
  const no=$('#wiki .wnone');if(no)no.hidden=any}
function openWiki(id){const w=$('#wiki');w.hidden=false;renderWiki();if(id){const s=$('#w-'+id);if(s)s.scrollIntoView()}}
function closeWiki(){const w=$('#wiki');if(w&&!w.dataset.standalone)w.hidden=true}
const wikiOpen=()=>{const w=$('#wiki');return w&&!w.hidden};
function wikiStep(d){const ids=[...document.querySelectorAll('#wiki .wsec:not([hidden])')];const m=$('#wikiMain');if(!ids.length||!m)return;
  const top=m.scrollTop;let i=ids.findIndex(s=>s.offsetTop-m.offsetTop>top+4);if(i<0)i=ids.length;i=clamp(i-1+d,0,ids.length-1);ids[i].scrollIntoView({behavior:'smooth'})}
document.addEventListener('click',e=>{const w=e.target.closest('#wiki');if(!w)return;const b=e.target.closest('button,a');if(!b)return;
  if(b.id==='wikiClose'){closeWiki();return}
  if(b.dataset.wgo){e.preventDefault();const s=$('#w-'+b.dataset.wgo);if(s)s.scrollIntoView({behavior:'smooth'});return}
  if(b.dataset.wsec){wikiSec=+b.dataset.wsec;const m=$('#wikiMain');const y=m?m.scrollTop:0;renderWiki();const m2=$('#wikiMain');if(m2)m2.scrollTop=y;return}
  if(b.dataset.l){if(typeof setLang==='function')setLang(b.dataset.l);else{lang=b.dataset.l;try{localStorage.setItem('os-lang',lang)}catch(_){}}document.documentElement.lang=lang;renderWiki()}});
document.addEventListener('input',e=>{if(e.target.id==='wikiQ')wikiFilter(e.target.value)});

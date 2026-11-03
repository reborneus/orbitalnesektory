'use strict';
/* ==================== == 2. HERNÉ DÁTA (balans) ==================== */
/* Suroviny: interné názvy ore = ruda, green = viridit, crystal = kryštály. */
const RES=['ore','green','crystal'];
const RCOL={ore:'#f0a644',green:'#86e05a',crystal:'#a98bff',relic:'#ffd87a'};
const RCLS={ore:'ore',green:'grn',crystal:'cry'};
/* Násobok rýchlosti ťažby podľa suroviny (1 = plný výkon lasera). Vzácnejšie sa ťažia pomalšie. */
const MINE_RATE={ore:1,green:.7,crystal:.5,relic:.4};
/* Relikt (relic) = malý vzácny asteroid bez suroviny; po vyťažení z neho padne predmet (pozri items.js). Nezapĺňa náklad. */
const RELIC_RESPAWN=[150,240];   // relikt sa znovu objaví po 150–240 s
/* Pásy sektora = vzdialenosť od stanice v metroch:
   pás 1: 0–Z1, pás 2: Z1–Z2, pás 3: Z2–Z3 (radiácia), pás 4: Z3–HORIZON (silnejšia radiácia).
   Za HORIZON trup rýchlo ubúda a štíty nepomáhajú. LIMIT = najďalej, kam sa dá doletieť. */
const Z1=40,Z2=80,Z3=120,HORIZON=160,LIMIT=230;
/* Sektory v poradí, v akom sa odomykajú. Polia:
   name/seed ... seed určuje rozloženie asteroidov a polohu brány (iné číslo = iné rozloženie)
   rich ........ násobok množstva suroviny v jednom asteroide
   neb/planet .. farby hmloviny a planéty v pozadí, pPos = poloha planéty
   capture ..... koľko vplyvu treba na obsadenie sektora
   res ......... suroviny zobrazené v mape (len informácia)
   fields ...... skupiny asteroidov: type = surovina (alebo relic), n = počet, r = [od, do] vzdialenosť od stanice v m
   reward ...... odmena za obsadenie: kredity (cr) a najnižšia rarita garantovaného predmetu (minR, index v RAR v items.js)
   ilvl ........ úroveň predmetov, ktoré v sektore padajú (základ; vonkajšie pásy pridávajú) */
const SECTORS=[
  {name:'Kepler-12',seed:11,rich:1,neb:['#173a6e','#3b1e5e'],planet:'#c98a4b',pPos:[-140,-340,-120],capture:120,res:['ore'],
    fields:[{type:'ore',n:38,r:[44,78]},{type:'ore',n:20,r:[84,156]},{type:'relic',n:3,r:[60,156]}],reward:{cr:600,minR:4},ilvl:1},
  {name:'Vega Drift',seed:23,rich:1.1,neb:['#3a1d62','#0d4c5c'],planet:'#5fa3c9',pPos:[150,-360,-100],capture:180,res:['ore','green'],
    fields:[{type:'ore',n:34,r:[44,78]},{type:'green',n:24,r:[84,156]},{type:'ore',n:8,r:[84,150]},{type:'relic',n:4,r:[70,156]}],reward:{cr:1500,minR:4},ilvl:11},
  {name:'Orion Hlbina',seed:37,rich:1.25,neb:['#5c1b31','#1b2e6e'],planet:'#9b6bd1',pPos:[-110,-380,110],capture:240,res:['ore','green','crystal'],
    fields:[{type:'ore',n:32,r:[44,78]},{type:'green',n:18,r:[84,118]},{type:'crystal',n:16,r:[124,156]},{type:'green',n:6,r:[124,156]},{type:'relic',n:5,r:[80,156]}],reward:{cr:3000,minR:5},ilvl:21},
];
/* C(ruda, viridit, kryštály, kredity) = pomocník na zápis ceny. Kredity (cr) sa zarábajú obsadzovaním sektorov a rozoberaním predmetov. */
const C=(o,g,c,cr)=>({ore:o||0,green:g||0,crystal:c||0,cr:cr||0});
/* Pasívny príjem kreditov z každého obsadeného sektora (za sekundu). */
const SECTOR_CREDITS=.2;
/* Moduly stanice: inf = koľko vplyvu dáva, cost(n) = cena, kde n = počet už postavených modulov rovnakého typu (každý ďalší je drahší). */
const MOD={drone:{inf:15,cost:n=>C(120+70*n)},tower:{inf:25,cost:n=>C(200+80*n)},sensor:{inf:35,cost:n=>C(180+60*n,50+25*n)}};
/* Ceny jadra stanice: CORE_COST[0] = z úrovne 1 na 2, [1] = z 2 na 3 atď. Každá úroveň jadra dáva CORE_INF vplyvu a jeden slot navyše. */
const CORE_COST=[C(150),C(320),C(500,80),C(750,160,60)];
const CORE_MAX=5,CORE_INF=15;
const coreCost=L=>CORE_COST[L-1];
const slotsFor=L=>Math.min(6,L+1);
/* costTable([ruda...],[viridit...],[kryštály...],[kredity...]) = cenník vylepšenia; i-ty stĺpec = cena prechodu z úrovne (i+1) na (i+2),
   pri štítovom generátore z úrovne i na i+1 (začína na 0 = nekúpený). Úrovne 6–10 stoja aj kredity. */
const costTable=(o,g,c,cr)=>o.map((x,i)=>C(x,g[i],c[i],cr[i]));
const LATE_G=[180,240,300,380,460],LATE_C=[50,80,110,150,200],LATE_CR=[300,500,800,1200,1800];
const early=(o4,g4,c4)=>[o4,[...g4,...LATE_G],[...c4,...LATE_C],[0,0,0,0,...LATE_CR]];
/* Vylepšenia lode (10 úrovní). Polia: grp = skupina v menu (eng Motory, hull Trup, shield Štíty, laser Lasery),
   vals[L-1] = hodnota na úrovni L (pri štíte vals[L]), costs = cenník (costTable), fmt = zobrazenie, needs = vyžaduje iné vylepšenie.
   speed: m/s (úroveň 3 = pôvodná rýchlosť z v0.1), accel: m/s², hull: body trupu, cargo: tony,
   shield: body štítu (0 = nemá), sregen: [čakanie v s, podiel max. štítu za sekundu], laser: t/s, range: dosah v m.
   Bonusy z nasadených predmetov sa pripočítajú až v shipVal() v state.js. */
const UP={
  speed:{grp:'eng',vals:[14.4,19.2,24,28.8,33.6,36,38.4,40.8,43.2,45.6],costs:costTable(...early([80,180,320,500,800,1000,1250,1500,1800],[0,30,70,120],[0,0,0,25])),fmt:v=>v.toFixed(1)+' m/s'},
  accel:{grp:'eng',vals:[14.4,25.2,36,46.8,57.6,62,66,70,74,78],costs:costTable(...early([70,160,300,480,760,950,1200,1450,1750],[0,25,60,110],[0,0,0,20])),fmt:v=>v.toFixed(1)+' m/s²'},
  hull:{grp:'hull',vals:[100,140,180,220,260,300,340,380,420,460],costs:costTable(...early([100,220,380,600,900,1100,1350,1600,1900],[0,35,80,140],[0,0,0,30])),fmt:v=>String(Math.round(v))},
  cargo:{grp:'hull',vals:[50,75,100,125,150,175,200,225,250,280],costs:costTable(...early([90,200,340,540,820,1000,1250,1500,1800],[0,30,70,120],[0,0,0,25])),fmt:v=>Math.round(v)+' t'},
  shield:{grp:'shield',min:0,vals:[0,40,65,90,120,150,170,190,210,230,250],
    costs:costTable([300,250,380,550,750,950,1150,1400,1650,1950],[0,40,90,150,220,260,320,380,440,520],[0,0,0,30,60,80,110,150,190,240],[0,0,0,0,0,300,500,800,1200,1800]),fmt:v=>String(Math.round(v))},
  sregen:{grp:'shield',needs:'shield',vals:[[15,.10],[13,.14],[11,.18],[9,.22],[7,.26],[6.5,.28],[6,.30],[5.5,.32],[5,.34],[4.5,.36]],
    costs:costTable(...early([150,280,450,650,900,1100,1350,1600,1900],[30,70,130,200],[0,0,25,50]))},
  laser:{grp:'laser',vals:[8,10.8,13.6,16.4,19.2,21,22.8,24.6,26.4,28.2],costs:costTable(...early([90,200,360,560,850,1050,1300,1550,1850],[0,30,75,130],[0,0,0,30])),fmt:v=>v.toFixed(1)+' t/s'},
  range:{grp:'laser',vals:[10,12.5,15,17.5,20,21,22,23,24,25],costs:costTable(...early([60,150,280,450,700,880,1100,1350,1600],[0,20,50,100],[0,0,0,20])),fmt:v=>v.toFixed(1)+' m'},
};
/* doplní max, cost(L) a val(L) z tabuliek (min = najnižšia úroveň: 1, pri štíte 0) */
for(const k in UP){const u=UP[k];if(u.min===undefined)u.min=1;
  u.max=u.vals.length-(u.min===0?1:0);
  u.cost=L=>u.costs[L-u.min];
  u.val=L=>{const v=u.vals[L-(u.min===0?0:1)];if(k==='speed')return v*D().speed;if(k==='sregen')return{delay:v[0],rate:v[1]};return v}}
const GROUPS=['eng','hull','shield','laser'];
/* Obtiažnosť: regen = trup sa sám opravuje, rad = násobok radiácie v pásoch 3–4, voidM = násobok za horizontom,
   speed = násobok rýchlosti lode, yield = násobok vyťaženej suroviny (1.2 = o 20 % viac). */
const DIFF={easy:{regen:true,rad:1,voidM:1,speed:1,yield:1},hard:{regen:false,rad:1.6,voidM:1.3,speed:.85,yield:1.2}};
const D=()=>DIFF[(state&&state.diff)||'easy'];
/* Oprava trupu (len na ľahkej): začne HULL_DELAY sekúnd po poslednom poškodení, rýchlosťou HULL_RATE z maxima za sekundu. */
const HULL_DELAY=30,HULL_RATE=.03;
/* Kľúč uloženej hry v prehliadači. Ak ho zmeníš, hra začne odznova (stará uložená hra sa ignoruje). */
const SAVE_KEY='orbitalne-sektory-v3';

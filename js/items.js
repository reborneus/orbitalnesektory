'use strict';
/* ==================== == 11. PREDMETY A RARITY ====================
   Predmet (modul lode) = objekt it:
     id ..... jedinečné číslo           b ..... typ (kľúč v BASES)         r ..... rarita (index v RAR, 0 = Odpad … 9 = Prvotné)
     ilvl ... úroveň predmetu (podľa sektora a pásu, kde padol; vyššia = silnejšie vlastnosti)
     enh .... vylepšenie +0 až +20 (každé +1 zvýši všetky vlastnosti o ENH_STEP)
     imp .... hlavná vlastnosť typu {k: kľúč v STATS, v: hodnota}
     aff .... náhodné vlastnosti [{k, v}], ich počet určuje rarita
     title .. index ozdobného mena (len Legendárne a vyššie, inak -1)   lock ... zamknutý = nedá sa rozobrať   nw ... nový (nevidený) */

/* Rarity. col = farba, w = základná váha pri padaní (väčšie = častejšie), aff = [min, max] počet náhodných vlastností,
   mult = násobok sily vlastností, enh = najvyššie možné vylepšenie, salv = základná hodnota v kredítoch pri rozobratí. */
const RAR=[
  {k:'junk',     col:'#7a828c',w:30,  aff:[0,0],mult:.6, enh:2, salv:1},
  {k:'common',   col:'#d5dbe2',w:28,  aff:[0,0],mult:.8, enh:4, salv:2},
  {k:'ordinary', col:'#5fd36b',w:18,  aff:[1,1],mult:.9, enh:6, salv:4},
  {k:'uncommon', col:'#4a9dff',w:11,  aff:[1,2],mult:1,  enh:8, salv:8},
  {k:'rare',     col:'#ffd84a',w:6.5, aff:[2,2],mult:1.1,enh:10,salv:15},
  {k:'epic',     col:'#b36bff',w:3.5, aff:[3,3],mult:1.25,enh:12,salv:30},
  {k:'legendary',col:'#ff8a2a',w:1.6, aff:[3,4],mult:1.4,enh:15,salv:60},
  {k:'mythic',   col:'#ff3b5c',w:.5,  aff:[4,4],mult:1.6,enh:17,salv:120},
  {k:'divine',   col:'#ffe9a0',w:.15, aff:[5,5],mult:1.8,enh:19,salv:250},
  {k:'primal',   col:'#7ff6ff',w:.05, aff:[6,6],mult:2.1,enh:20,salv:500},
];
/* Vlastnosti. lo–hi = rozsah jednej vlastnosti na úrovni predmetu 0 a rarite s mult 1; dec = počet desatinných miest;
   u = jednotka ('%' percentá, 'm' metre, 's' sekundy, 't' tony, '' body); cap = najvyšší súčet zo všetkých predmetov. */
const STATS={
  mine:   {lo:3,  hi:6,  dec:1,u:'%'},   // výkon ťažby
  range:  {lo:.3, hi:.8, dec:1,u:'m'},   // dosah lasera
  yield:  {lo:2,  hi:4,  dec:1,u:'%'},   // výnos suroviny
  speed:  {lo:2,  hi:4,  dec:1,u:'%'},   // rýchlosť
  accel:  {lo:3,  hi:6,  dec:1,u:'%'},   // zrýchlenie
  turn:   {lo:3,  hi:6,  dec:1,u:'%'},   // obratnosť
  hull:   {lo:6,  hi:12, dec:0,u:''},    // body trupu
  hullPct:{lo:2,  hi:4,  dec:1,u:'%'},   // trup v percentách
  coll:   {lo:2,  hi:4,  dec:1,u:'%',cap:60}, // menšie poškodenie z nárazov
  shield: {lo:5,  hi:10, dec:0,u:''},    // body štítu (v0.47: v lodi sa počítajú ×3)
  shieldPct:{lo:3,hi:6,  dec:1,u:'%'},   // v0.47: štíty v percentách
  sregen: {lo:4,  hi:8,  dec:1,u:'%'},   // rýchlejšie dobíjanie štítov
  sdelay: {lo:.2, hi:.4, dec:2,u:'s'},   // skoršie dobíjanie štítov
  cargo:  {lo:24, hi:48, dec:0,u:'t'},   // náklad (v0.38: 8×, ako náklad lode)
  rad:    {lo:2,  hi:4,  dec:1,u:'%',cap:75}, // ochrana pred radiáciou v pásoch 3–4 (nie za horizontom)
  mf:     {lo:3,  hi:6,  dec:1,u:'%'},   // šanca na vzácnejšiu korisť
  magnet: {lo:.5, hi:1.5,dec:1,u:'m'},   // dosah zberu koristi
  dmg:    {lo:4,  hi:8,  dec:1,u:'%'},   // poškodenie zbrane (percentá násobia aj základ z modulu zbrane)
  wb:     {lo:0,  hi:0,  dec:0,u:''},
  dmgX:   {lo:8,  hi:18, dec:1,u:'%'},   // v0.38: NÁSOBIČ poškodenia (endgame, len Legendárne+): predmety sa navzájom NÁSOBIA, nie sčítajú    // v0.38: základné poškodenie modulu zbrane (len zbrane, nepadá ako náhodná vlastnosť)
  frate:  {lo:3,  hi:6,  dec:1,u:'%'},   // kadencia zbrane
  crit:   {lo:1,  hi:2,  dec:1,u:'%',cap:60}, // šanca na kritický zásah (základ CRIT_BASE)
  critDmg:{lo:6,  hi:12, dec:1,u:'%'},   // kritické poškodenie navyše (základ CRIT_DMG = +100 %)
  grange: {lo:.5, hi:1.2,dec:1,u:'m'},   // dosah zbrane
  /* vlastnosti čipov modulov stanice (platia len pre modul, do ktorého je čip vložený) */
  dMine:  {lo:5,  hi:10, dec:1,u:'%'},   // výkon ťažby dronu
  dCap:   {lo:2,  hi:4,  dec:0,u:'t'},   // kapacita dronu
  dSpeed: {lo:4,  hi:8,  dec:1,u:'%'},   // rýchlosť dronu
  dDmg:   {lo:6,  hi:12, dec:1,u:'%'},   // poškodenie dronu v obrannom režime
  tDmg:   {lo:6,  hi:12, dec:1,u:'%'},   // poškodenie veže
  tRange: {lo:1,  hi:2.5,dec:1,u:'m'},   // dosah veže
  tRate:  {lo:4,  hi:8,  dec:1,u:'%'},   // kadencia veže
  sInc:   {lo:6,  hi:12, dec:1,u:'%'},   // príjem senzorového poľa
  inf:    {lo:1,  hi:2.5,dec:0,u:''},    // vplyv modulu
};
/* Sloty lode a typy predmetov. imp = hlavná vlastnosť (má dvojnásobnú silu), pool = z čoho sa losujú náhodné vlastnosti. */
const SLOTS=['laser','engine','hull','shield','util','weapon'];
/* v0.40.3: ďalšie sloty niektorých lodí (SHIPS[id].extra): laser2 = druhý laser, shield2 = druhý štít.
   Do slotu laser2 ide každý predmet typu laser (slotBase), vlastnosti oboch predmetov sa sčítajú. */
const SLOT_EXTRA={laser2:'laser',shield2:'shield',weapon2:'weapon'};
const slotBase=s=>SLOT_EXTRA[s]||s;
const ALL_SLOTS=SLOTS.concat(Object.keys(SLOT_EXTRA));
function shipSlots(){const x=(typeof state!=='undefined'&&state&&SHIPS[state.shipId]&&SHIPS[state.shipId].extra)||[];return SLOTS.concat(x)}
const itemPow=it=>it?it.r*1e6+it.ilvl*100+(it.enh||0):-1;
/* slot, do ktorého sa predmet nasadí: prvý voľný slot jeho typu, inak ten so slabším predmetom */
function slotFor(it){const b=BASES[it.b].slot,ss=shipSlots().filter(s=>slotBase(s)===b);if(!ss.length)return b;
  return ss.find(s=>!state.eq[s])||ss.reduce((a,s)=>itemPow(state.eq[s])<itemPow(state.eq[a])?s:a)}
/* predmet, s ktorým sa porovnáva (ten, ktorý by sa vymenil) */
const eqCmpFor=it=>{const s=slotFor(it);return state.eq[s]||null};
const BASES={
  laser:  {slot:'laser', imp:'mine',  pool:['range','yield','mf','mine','magnet','speed','critDmg']},
  engine: {slot:'engine',imp:'speed', pool:['accel','turn','speed','magnet','coll','cargo','rad']},
  plating:{slot:'hull',  imp:'hull',  pool:['hullPct','coll','rad','cargo','hull','shield']},
  emitter:{slot:'shield',imp:'shield',pool:['sregen','sdelay','rad','shield','shieldPct','hullPct','hull']},
  cargo:  {slot:'util',  imp:'cargo', pool:['yield','mf','magnet','speed','rad','mine']},
  filter: {slot:'util',  imp:'rad',   pool:['shield','shieldPct','hull','coll','sregen','mf','cargo']},
  scanner:{slot:'util',  imp:'mf',    pool:['magnet','yield','range','mine','speed','rad','crit']},
  cannon: {slot:'weapon',imp:'dmg',   pool:['frate','crit','critDmg','grange','dmg','hull','speed']},
  /* čipy modulov stanice: slot 'chip', mod = do akého modulu patria. Schopnosti dronu odomyká vyššia z rarít modul/čip (CHIP_CAP, droneCapR). */
  droneAI:   {slot:'chip',mod:'drone', imp:'dMine',pool:['dCap','dSpeed','dDmg','inf']},
  towerCore: {slot:'chip',mod:'tower', imp:'tDmg', pool:['tRange','tRate','inf']},
  sensorCore:{slot:'chip',mod:'sensor',imp:'sInc', pool:['inf']},
};
/* AI jadro dronu podľa rarity: green = dron ťaží aj viridit, def = obranný režim, crystal = ťaží aj kryštály. */
/* prah rarity pre schopnosti dronu – platí vyššia z rarít: modul (z vylepšenia) alebo AI jadro */
const CHIP_CAP={green:4,def:4,crystal:5};
/* Šanca, že predmet z daného zdroja bude čip modulu (inak modul lode). */
const CHIP_CHANCE={asteroid:.1,relic:.2,capture:.25,enemy:.45};
const SHIP_BASES=Object.keys(BASES).filter(b=>BASES[b].slot!=='chip'),CHIP_BASES=Object.keys(BASES).filter(b=>BASES[b].slot==='chip');
const INV_MAX=40;          // veľkosť inventára
/* v0.9: vlastnosti v bodoch (trup, štíty, náklad, kapacita dronu) sú × NUM; FLAT = ich zoznam (pre prepočet starých uložení) */
const FLAT=['hull','shield','cargo','dCap'];for(const k of FLAT){STATS[k].lo*=NUM;STATS[k].hi*=NUM}
const ENH_STEP=.06;        // +6 % ku všetkým vlastnostiam za každé +1
const ILVL_SCALE=.08;      // +8 % sily vlastností za každú úroveň predmetu
const ASTEROID_DROP=.03;   // šanca, že z bežného asteroidu (vyťaženého loďou) padne predmet
/* Bonus k šanci na vzácnosť podľa zdroja a pásu (pridáva sa k vlastnosti mf). */
const MF_SOURCE={asteroid:0,relic:.8,capture:1.2,enemy:.3,corsair:1,frigate:1.6};
const MF_ZONE={1:0,2:0,3:.25,4:.5,5:.6};
const ILVL_ZONE={1:0,2:1,3:4,4:7,5:9};

/* Losovanie rarity: vyššie rarity dostanú tým väčšie zvýhodnenie, čím je mf vyššie. minR = najnižšia povolená rarita. */
/* v0.12: strop rarity podľa sektora (SECTORS[i].rar = {max: najvyššia rarita, top: násobok šance na ňu}).
   Mytické, Božské a Prvotné sú špeciálne odmeny (aréna); Mytické len s veľmi malou šancou v poslednom sektore.
   cap = {max, top} alebo null (bez stropu). */
const secRar=i=>SECTORS[i]&&SECTORS[i].rar||{max:9,top:1};
function rarityWeights(mf,minR=0,cap=null){const mx=cap?cap.max:9;minR=Math.min(minR,mx);
  return RAR.map((R,i)=>i<minR||i>mx?0:R.w*Math.pow(1+mf,Math.max(0,i-3)*.35)*(cap&&i===mx?cap.top:1))}
/* Presné pravdepodobnosti rarít (súčet 1) – používa ich aj príručka. */
function rarityProbs(mf,minR=0,cap=null){const w=rarityWeights(mf,minR,cap);const sum=w.reduce((a,b)=>a+b,0);return w.map(x=>x/sum)}
function rollRarity(mf,minR=0,cap=null){const w=rarityWeights(mf,minR,cap);
  let x=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<w.length;i++){x-=w[i];if(x<=0)return i}return w.length-1}
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
function rollStat(k,ilvl,r,m=1){const S=STATS[k];const v=rnd(S.lo,S.hi)*(1+ilvl*ILVL_SCALE)*RAR[r].mult*m;const f=Math.pow(10,S.dec);return Math.max(1/f,Math.round(v*f)/f)}
function genItem(r,ilvl,bk){bk=bk||pick(SHIP_BASES);const B=BASES[bk];const R=RAR[r];
  const n=Math.min(B.pool.length-(B.pool.includes(B.imp)?1:0),R.aff[0]+Math.floor(Math.random()*(R.aff[1]-R.aff[0]+1)));
  // hlavná vlastnosť sa medzi náhodnými neopakuje
  const pool=B.pool.filter(k=>k!==B.imp).sort(()=>Math.random()-.5).slice(0,n);
  const aff=pool.map(k=>rollQ(k,ilvl,r));if(r>=6&&!B.mod&&Math.random()<[.3,.5,.75,1][r-6])aff.push(rollQ('dmgX',ilvl,r,1/(1+ilvl*ILVL_SCALE)*(1+ilvl*.02)));   // násobič: slabšie rastie s úrovňou predmetu
  return{id:state.nextId++,b:bk,r,ilvl,enh:0,imp:rollQ(B.imp,ilvl,r,2),aff,wb:B.slot==='weapon'?rollWB(r,ilvl):undefined,
    title:r>=6?Math.floor(Math.random()*TITLE_COUNT):-1,lock:false,nw:true}}
/* Predmet, ktorý padne zo zdroja: mf zo zdroja + pásu + sektora + vlastností výbavy. */
function dropItem(source,zone,minR=0,cap){const tm=typeof tierMul==='function';const mf=MF_SOURCE[source]+MF_ZONE[zone]+state.cur*.25+bonus().mf/100+(tm?tierMul('mf'):0);
  let c=cap===undefined?secRar(state.cur):cap;if(c&&tm&&state.tier)c={max:c.max,top:Math.min(2,c.top*tierMul('top'))};
  let r=rollRarity(mf,minR,c);if(typeof rsK==='function'&&rsK('e3')&&Math.random()<RSK.e3.p/100)r=Math.min(RAR.length-1,r+1);   // v0.42: Zlatý dotyk
  const ilvl=SECTORS[state.cur].ilvl+ILVL_ZONE[zone]+Math.floor(Math.random()*3);
  const chip=Math.random()<(CHIP_CHANCE[source==='corsair'||source==='frigate'?'enemy':source]||0);return genItem(r,ilvl,chip?pick(CHIP_BASES):null)}

/* Skutočné hodnoty vlastností predmetu vrátane vylepšenia (+N). */
/* v0.38: strmšia krivka vylepšenia predmetu: +5 ≈ ×1,35 · +10 ≈ ×2,0 · +15 ≈ ×3,0 · +20 ≈ ×4,2 */
const enhMul=it=>1+.04*it.enh+.006*it.enh*it.enh;
/* ==================== v0.38: ZÁKLADNÉ POŠKODENIE ZBRANE A KVALITA VLASTNOSTÍ ====================
   Modul zbrane má vlastný základ poškodenia: náhodne v rozsahu podľa rarity (× úroveň predmetu, × vylepšenie).
   Pripočíta sa k poškodeniu lode a všetky percentá (poškodenie, kritický zásah…) ho násobia.
   q = kvalita hodu 0–1 (kde v rozsahu vlastnosť padla): ≥ 90 % sa ukazuje zlato, 100 % hrubo červeno. */
const WB_RANGE=[[3,5],[4,7],[6,10],[9,15],[14,22],[21,33],[32,50],[48,75],[72,112],[108,168]];
function rollWB(r,ilvl){const[lo,hi]=WB_RANGE[r],q=Math.random();return{v:Math.round((lo+(hi-lo)*q)*(1+ilvl*ILVL_SCALE*.5)*NUM),q}}
const isWeapon=it=>BASES[it.b]&&BASES[it.b].slot==='weapon';
function weaponBase(it){if(!isWeapon(it))return null;if(!it.wb)it.wb=rollWB(it.r,it.ilvl||1);return it.wb}   // staré zbrane dostanú základ pri prvom použití
/* hod vlastnosti aj s kvalitou */
function rollQ(k,ilvl,r,m=1){const S=STATS[k],q=Math.random();const v=(S.lo+(S.hi-S.lo)*q)*(1+ilvl*ILVL_SCALE)*RAR[r].mult*m;const f=Math.pow(10,S.dec);return{k,v:Math.max(1/f,Math.round(v*f)/f),q}}
/* kvalita uloženej vlastnosti (staré predmety ju dopočítajú z hodnoty) */
function statQ(it,st,imp){if(st.q!=null)return st.q;const S=STATS[st.k];if(!S||S.hi===S.lo)return 0;const base=(1+it.ilvl*ILVL_SCALE)*RAR[it.r].mult*(imp?2:1);return clamp((st.v/base-S.lo)/(S.hi-S.lo),0,1)}
const qCls=q=>q>=.995?' q100':q>=.9?' q90':'';
function itemStats(it){const m=enhMul(it),w=weaponBase(it);
  return[...(w?[{k:'wb',v:w.v*m,q:w.q,base:true}]:[]),{k:it.imp.k,v:it.imp.v*m,imp:true,q:statQ(it,it.imp,true)},...it.aff.map(a=>({k:a.k,v:a.v*m,q:statQ(it,a,false)}))]}
function fmtStat(k,v){if(k==='dmgX')return '×'+(1+v/100).toFixed(2);const S=STATS[k];const f=Math.pow(10,S.dec);const n=Math.round(v*f)/f;return '+'+n.toFixed(S.dec)+(S.u?(S.u==='%'?' %':' '+S.u):'')}
/* Súčet vlastností nasadených predmetov (uložené v medzipamäti, prepočíta sa po zmene výbavy cez bonusDirty()). */
let _bonus=null;
function bonusDirty(){_bonus=null}
/* v0.40.4: _bonusMask = dočasne vynechať výbavu (eq:false) alebo pilota (pl:false) – pre štatistiky Pilot → Štatistiky */
let _bonusMask=null;
function bonusMasked(mask,fn){const keep=_bonus;_bonusMask=mask;_bonus=null;try{return fn()}finally{_bonusMask=null;_bonus=keep}}
function bonus(){if(_bonus)return _bonus;const b={};for(const k in STATS)b[k]=0;
  b.dmgXm=1;   // násobič poškodenia = súčin (1 + x %) zo všetkých nasadených predmetov
  if(state&&state.eq&&!(_bonusMask&&_bonusMask.eq===false))for(const s of shipSlots()){const it=state.eq[s];if(it)for(const x of itemStats(it)){b[x.k]+=x.v;if(x.k==='dmgX')b.dmgXm*=1+x.v/100}}
  b.mf=b.mf||0;
  b.rs={};   // v0.42: vlastnosti len z výskumu (štíty %, náklad %, XP %, veže, drony…)
  if(typeof pilotBonus==='function'&&!(_bonusMask&&_bonusMask.pl===false))pilotBonus(b); // schopnosti pilota (pilot.js)
  if(typeof rsBonus==='function'&&!(_bonusMask&&_bonusMask.pl===false))rsBonus(b);     // strom výskumu (research.js)
  for(const k in STATS)if(STATS[k].cap)b[k]=Math.min(STATS[k].cap,b[k]);if(_bonusMask)return b;return _bonus=b}

/* Vylepšenie predmetu: cena rastie s úrovňou a raritou; od +5 hrozí neúspech (stratia sa len suroviny a kredity). */
function enhCost(it){const n=it.enh+1;return P(C(Math.round(22*Math.pow(n,1.45)),n>5?Math.round(10*Math.pow(n-5,1.4)):0,n>10?Math.round(4*Math.pow(n-10,1.5)):0,Math.round(14*Math.pow(n,2.1)*(1+it.r*.35))))}   // v0.38: strmšie
const enhChance=it=>it.enh<5?1:Math.max(.3,1-(it.enh-4)*.05);
const enhMax=it=>RAR[it.r].enh;
/* Rozobratie: kredity podľa rarity, úrovne predmetu a vylepšenia. */
const salvValue=it=>Math.round(RAR[it.r].salv*(1+it.ilvl/10)*(1+it.enh*.15)*NUM*(typeof crMul==='function'&&state&&state.pilot?crMul():1)*(typeof rsK==='function'&&rsK('e2')?1+RSK.e2.k/100:1));   // v0.42: Recyklácia
/* Mená predmetov. Ozdobné tituly pre Legendárne a vyššie sú v i18n.js (TITLES). */
function itemName(it){return(it.enh?'+'+it.enh+' ':'')+t('base.'+it.b)}
function itemTitle(it){return it.title>=0?(TITLES[lang]||TITLES.sk)[it.title]:''}
/* Ikony typov predmetov (SVG, 24×24). */
const ICONS={
  laser:'<path d="M4 20l7-7M13 11l7-7M14 4h6v6"/><circle cx="9" cy="15" r="2"/>',
  engine:'<path d="M12 2c3 4 4 7 4 10a4 4 0 0 1-8 0c0-3 1-6 4-10z"/><path d="M9.5 20l2.5 2 2.5-2"/>',
  plating:'<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M12 7v10M8 10h8"/>',
  emitter:'<path d="M4 15a8 8 0 0 1 16 0"/><path d="M7.5 15a4.5 4.5 0 0 1 9 0"/><circle cx="12" cy="15" r="1.6"/>',
  cargo:'<rect x="4" y="7" width="16" height="12" rx="1"/><path d="M4 11h16M10 7V4h4v3"/>',
  filter:'<circle cx="12" cy="12" r="8"/><path d="M12 12V5M12 12l6 3.5M12 12l-6 3.5"/><circle cx="12" cy="12" r="1.5"/>',
  scanner:'<circle cx="11" cy="11" r="6"/><path d="M15.5 15.5L21 21M11 8v6M8 11h6"/>',
  cannon:'<path d="M3 15h10l3-3h5v4h-5l-3-1H3z"/><path d="M6 15v4M9 15v4"/>',
  droneAI:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><circle cx="12" cy="12" r="2.5"/>',
  towerCore:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M12 8v8M8 12h8"/><circle cx="12" cy="12" r="4"/>',
  sensorCore:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 14a3 3 0 0 1 6 0M8 11a5 5 0 0 1 8 0"/>',
};
const icon=b=>`<svg viewBox="0 0 24 24" class="ico">${ICONS[b]}</svg>`;

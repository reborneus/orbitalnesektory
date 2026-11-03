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
  hull:   {lo:6,  hi:12, dec:0,u:''},    // body trupu
  hullPct:{lo:2,  hi:4,  dec:1,u:'%'},   // trup v percentách
  coll:   {lo:2,  hi:4,  dec:1,u:'%',cap:60}, // menšie poškodenie z nárazov
  shield: {lo:5,  hi:10, dec:0,u:''},    // body štítu
  sregen: {lo:4,  hi:8,  dec:1,u:'%'},   // rýchlejšie dobíjanie štítov
  sdelay: {lo:.2, hi:.4, dec:2,u:'s'},   // skoršie dobíjanie štítov
  cargo:  {lo:3,  hi:6,  dec:0,u:'t'},   // náklad
  rad:    {lo:2,  hi:4,  dec:1,u:'%',cap:75}, // ochrana pred radiáciou v pásoch 3–4 (nie za horizontom)
  mf:     {lo:3,  hi:6,  dec:1,u:'%'},   // šanca na vzácnejšiu korisť
  magnet: {lo:.5, hi:1.5,dec:1,u:'m'},   // dosah zberu koristi
};
/* Sloty lode a typy predmetov. imp = hlavná vlastnosť (má dvojnásobnú silu), pool = z čoho sa losujú náhodné vlastnosti. */
const SLOTS=['laser','engine','hull','shield','util'];
const BASES={
  laser:  {slot:'laser', imp:'mine',  pool:['range','yield','mf','mine','magnet','speed']},
  engine: {slot:'engine',imp:'speed', pool:['accel','speed','magnet','coll','cargo','rad']},
  plating:{slot:'hull',  imp:'hull',  pool:['hullPct','coll','rad','cargo','hull','shield']},
  emitter:{slot:'shield',imp:'shield',pool:['sregen','sdelay','rad','shield','hullPct','hull']},
  cargo:  {slot:'util',  imp:'cargo', pool:['yield','mf','magnet','speed','rad','mine']},
  filter: {slot:'util',  imp:'rad',   pool:['shield','hull','coll','sregen','mf','cargo']},
  scanner:{slot:'util',  imp:'mf',    pool:['magnet','yield','range','mine','speed','rad']},
};
const INV_MAX=40;          // veľkosť inventára
const ENH_STEP=.06;        // +6 % ku všetkým vlastnostiam za každé +1
const ILVL_SCALE=.08;      // +8 % sily vlastností za každú úroveň predmetu
const ASTEROID_DROP=.03;   // šanca, že z bežného asteroidu (vyťaženého loďou) padne predmet
/* Bonus k šanci na vzácnosť podľa zdroja a pásu (pridáva sa k vlastnosti mf). */
const MF_SOURCE={asteroid:0,relic:.8,capture:1.2};
const MF_ZONE={1:0,2:0,3:.25,4:.5,5:.6};
const ILVL_ZONE={1:0,2:1,3:4,4:7,5:9};

/* Losovanie rarity: vyššie rarity dostanú tým väčšie zvýhodnenie, čím je mf vyššie. minR = najnižšia povolená rarita. */
function rarityWeights(mf,minR=0){return RAR.map((R,i)=>i<minR?0:R.w*Math.pow(1+mf,Math.max(0,i-3)*.35))}
/* Presné pravdepodobnosti rarít (súčet 1) – používa ich aj príručka. */
function rarityProbs(mf,minR=0){const w=rarityWeights(mf,minR);const sum=w.reduce((a,b)=>a+b,0);return w.map(x=>x/sum)}
function rollRarity(mf,minR=0){const w=rarityWeights(mf,minR);
  let x=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<w.length;i++){x-=w[i];if(x<=0)return i}return w.length-1}
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
function rollStat(k,ilvl,r,m=1){const S=STATS[k];const v=rnd(S.lo,S.hi)*(1+ilvl*ILVL_SCALE)*RAR[r].mult*m;const f=Math.pow(10,S.dec);return Math.max(1/f,Math.round(v*f)/f)}
function genItem(r,ilvl,bk){bk=bk||pick(Object.keys(BASES));const B=BASES[bk];const R=RAR[r];
  const n=Math.min(B.pool.length-(B.pool.includes(B.imp)?1:0),R.aff[0]+Math.floor(Math.random()*(R.aff[1]-R.aff[0]+1)));
  // hlavná vlastnosť sa medzi náhodnými neopakuje
  const pool=B.pool.filter(k=>k!==B.imp).sort(()=>Math.random()-.5).slice(0,n);
  return{id:state.nextId++,b:bk,r,ilvl,enh:0,imp:{k:B.imp,v:rollStat(B.imp,ilvl,r,2)},aff:pool.map(k=>({k,v:rollStat(k,ilvl,r)})),
    title:r>=6?Math.floor(Math.random()*TITLE_COUNT):-1,lock:false,nw:true}}
/* Predmet, ktorý padne zo zdroja: mf zo zdroja + pásu + sektora + vlastností výbavy. */
function dropItem(source,zone,minR=0){const mf=MF_SOURCE[source]+MF_ZONE[zone]+state.cur*.25+bonus().mf/100;
  const r=rollRarity(mf,minR);const ilvl=SECTORS[state.cur].ilvl+ILVL_ZONE[zone]+Math.floor(Math.random()*3);return genItem(r,ilvl)}

/* Skutočné hodnoty vlastností predmetu vrátane vylepšenia (+N). */
const enhMul=it=>1+ENH_STEP*it.enh;
function itemStats(it){const m=enhMul(it);return[{k:it.imp.k,v:it.imp.v*m,imp:true},...it.aff.map(a=>({k:a.k,v:a.v*m}))]}
function fmtStat(k,v){const S=STATS[k];const f=Math.pow(10,S.dec);const n=Math.round(v*f)/f;return '+'+n.toFixed(S.dec)+(S.u?(S.u==='%'?' %':' '+S.u):'')}
/* Súčet vlastností nasadených predmetov (uložené v medzipamäti, prepočíta sa po zmene výbavy cez bonusDirty()). */
let _bonus=null;
function bonusDirty(){_bonus=null}
function bonus(){if(_bonus)return _bonus;const b={};for(const k in STATS)b[k]=0;
  if(state&&state.eq)for(const s of SLOTS){const it=state.eq[s];if(it)for(const x of itemStats(it))b[x.k]+=x.v}
  for(const k in STATS)if(STATS[k].cap)b[k]=Math.min(STATS[k].cap,b[k]);return _bonus=b}

/* Vylepšenie predmetu: cena rastie s úrovňou a raritou; od +5 hrozí neúspech (stratia sa len suroviny a kredity). */
function enhCost(it){const n=it.enh+1;return C(25*n,n>5?10*(n-5):0,n>10?4*(n-10):0,Math.round(15*Math.pow(n,1.7)*(1+it.r*.35)))}
const enhChance=it=>it.enh<5?1:Math.max(.3,1-(it.enh-4)*.05);
const enhMax=it=>RAR[it.r].enh;
/* Rozobratie: kredity podľa rarity, úrovne predmetu a vylepšenia. */
const salvValue=it=>Math.round(RAR[it.r].salv*(1+it.ilvl/10)*(1+it.enh*.15));
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
};
const icon=b=>`<svg viewBox="0 0 24 24" class="ico">${ICONS[b]}</svg>`;

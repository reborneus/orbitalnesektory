'use strict';
/* ==================== == 3. STAV HRY ====================
   state = všetko, čo sa ukladá: suroviny na stanici (ore/green/crystal), credits = kredity, cargo = náklad v lodi,
   ship = úrovne vylepšení, hp/sh = trup a štíty, diff = obtiažnosť, cur = index aktuálneho sektora,
   sec[] = stav každého sektora (úroveň jadra, sloty s modulmi, obsadený/odomknutý, rewarded = odmena vyplatená),
   inv = inventár predmetov, eq = nasadené predmety podľa slotu (pozri items.js), nextId = ďalšie číslo predmetu,
   autoMine/autoReturn/autoPilot/autoRes = nastavenia automatizácie. */
function freshState(){return{v:3,ore:40,green:0,crystal:0,credits:0,cargo:{ore:0,green:0,crystal:0},
  ship:{speed:1,accel:1,hull:1,cargo:1,shield:0,radShield:0,sregen:1,laser:1,range:1,gun:1,gunRate:1},hp:100,sh:0,radCharge:0,radMode:'auto',diff:'easy',
  autoMine:true,autoReturn:true,autoPilot:false,autoRes:'ore',lang,cur:0,intro:false,
  inv:[],eq:{laser:null,engine:null,hull:null,shield:null,util:null,weapon:null},nextId:1,
  sec:SECTORS.map((s,i)=>({core:1,slots:[null,null,null,null,null,null],captured:false,unlocked:i===0,rewarded:false}))}}
/* Doplní polia, ktoré staršie uložené hry nemali (aby postup zostal zachovaný). */
function migrate(s){
  if(typeof s.credits!=='number')s.credits=0;
  if(!Array.isArray(s.inv))s.inv=[];
  if(!s.eq)s.eq={};for(const k of SLOTS)if(s.eq[k]===undefined)s.eq[k]=null;
  if(!s.nextId)s.nextId=1;
  if(s.ship.radShield==null)s.ship.radShield=0;if(typeof s.radCharge!=='number')s.radCharge=0;if(!s.radMode)s.radMode='auto';
  // moduly stanice: staršie uloženia mali v slote len typ ('drone'), teraz je to objekt s vylepšením a čipom
  for(const x of s.sec)x.slots=x.slots.map(m=>typeof m==='string'?newModule(m):m);
  for(const k of['weapon'])if(s.ship.gun==null){s.ship.gun=1;s.ship.gunRate=1}
  // sektory obsadené pred v0.5: vyplatí sa ich odmena v kredítoch
  s.sec.forEach((x,i)=>{if(x.captured&&!x.rewarded){s.credits+=SECTORS[i].reward.cr;x.rewarded=true}});
  return s}
function loadState(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return null;const s=JSON.parse(raw);if(s&&s.v===3&&Array.isArray(s.sec))return migrate(s)}catch(e){}return null}
let state=null;
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state))}catch(e){}}
const cur=()=>state.sec[state.cur];
const countMod=(s,k)=>s.slots.filter(x=>slotType(x)===k).length;
/* Modul v slote stanice: t = typ (drone/tower/sensor), enh = vylepšenie +0..+10, chip = vložený čip (predmet) alebo null,
   mode = 'mine' | 'def' (dron: ťažba alebo obrana), res = surovina, ktorú dron ťaží, spent = suroviny minuté na vylepšenia (pre predaj). */
function newModule(t){return{t,enh:0,chip:null,mode:'mine',res:'ore',spent:C()}}
const slotType=m=>m?(m.t||m):null;
const modRar=m=>MOD_RAR[Math.min(MOD_ENH_MAX,m.enh||0)];
/* Súčet vlastnosti k z čipu modulu (vrátane vylepšenia čipu). */
function chipStat(m,k){if(!m||!m.chip)return 0;let v=0;for(const x of itemStats(m.chip))if(x.k===k)v+=x.v;return v}
const chipCan=(m,cap)=>!!(m&&m.chip&&BASES[m.chip.b].mod==='drone'&&m.chip.r>=CHIP_CAP[cap]);
function modInf(m){return Math.round(MOD[m.t].inf*(1+MOD_ENH_INF*m.enh)+chipStat(m,'inf'))}
function freeSlot(s){const n=slotsFor(s.core);for(let i=0;i<n;i++)if(!s.slots[i])return i;return -1}
/* Vplyv sektora = úroveň jadra × CORE_INF + súčet vplyvu postavených modulov. */
function influence(s){let v=s.core*CORE_INF;for(const m of s.slots)if(m)v+=modInf(m);return v}
/* Množstvo meny/suroviny: 'cr' = kredity, inak suroviny na stanici. */
const amt=r=>r==='cr'?state.credits:state[r];
const COST_KEYS=['ore','green','crystal','cr'];
const afford=c=>COST_KEYS.every(r=>amt(r)>=(c[r]||0));
function pay(c){for(const r of RES)state[r]-=c[r]||0;state.credits-=c.cr||0}
/* Hodnota vlastnosti lode = úroveň vylepšenia (UP) + bonusy z nasadených predmetov (bonus() v items.js). */
function shipVal(k){const v=UP[k].val(state.ship[k]);const b=bonus();
  switch(k){
    case'speed':return v*(1+b.speed/100);
    case'accel':return v*(1+b.accel/100);
    case'hull':return Math.round((v+b.hull)*(1+b.hullPct/100));
    case'cargo':return Math.round(v+b.cargo);
    case'shield':return Math.round(v+b.shield);
    case'sregen':return{delay:Math.max(3,v.delay-b.sdelay),rate:v.rate*(1+b.sregen/100)};
    case'laser':return v*(1+b.mine/100);
    case'range':return v+b.range;
    case'gun':return v*(1+b.dmg/100);
    case'gunRate':return v*(1+b.frate/100)}
  return v}
const cargoTotal=()=>state.cargo.ore+state.cargo.green+state.cargo.crystal;
const shieldMax=()=>shipVal('shield');
const capOf=i=>SECTORS[i].capture;
const secName=i=>t('sec'+i+'.name');

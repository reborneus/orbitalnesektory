'use strict';
/* ==================== == 3. STAV HRY ====================
   state = všetko, čo sa ukladá: suroviny na stanici (ore/green/crystal), credits = kredity, cargo = náklad v lodi,
   ship = úrovne vylepšení aktívnej lode (shipId), owned = kúpené lode, hangar = úrovne ostatných kúpených lodí, hp/sh = trup a štíty, diff = obtiažnosť, cur = index aktuálneho sektora,
   sec[] = stav každého sektora (úroveň jadra, sloty s modulmi, obsadený/odomknutý, rewarded = odmena vyplatená),
   inv = inventár predmetov, eq = nasadené predmety podľa slotu (pozri items.js), nextId = ďalšie číslo predmetu,
   autoMine/autoReturn/autoPilot/autoRes = nastavenia automatizácie. */
/* Úrovne vylepšení novej lode (každá loď v hangári má vlastné). */
const baseLevels=()=>({speed:1,accel:1,turn:1,hull:1,cargo:1,shield:0,radShield:0,sregen:1,laser:1,range:1,gun:1,gunRate:1});
function freshState(){return{v:3,num:NUM,ore:40*NUM,green:0,crystal:0,credits:0,cargo:{ore:0,green:0,crystal:0},
  ship:baseLevels(),shipId:'klepeto',owned:['klepeto'],hangar:{},hp:100*NUM,sh:0,radCharge:0,radMode:'auto',diff:'easy',
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
  if(s.ship.turn==null)s.ship.turn=1; // v0.7.4: nové vylepšenie obratnosť
  // v0.8: hangár s loďami a nové sektory 4–6 (odomknutý je ten, ktorého predchodca je obsadený)
  if(!s.shipId)s.shipId='klepeto';if(!Array.isArray(s.owned))s.owned=['klepeto'];if(!s.hangar)s.hangar={};
  for(const id in s.hangar)for(const[k,v]of Object.entries(baseLevels()))if(s.hangar[id][k]==null)s.hangar[id][k]=v;
  // v0.9: veľké čísla – staré uloženie sa prepočíta × NUM (suroviny, kredity, náklad, trup, štíty, vlastnosti predmetov v bodoch)
  if(!s.num){const k=NUM;for(const r of['ore','green','crystal','credits'])s[r]=(s[r]||0)*k;for(const r in s.cargo)s.cargo[r]*=k;s.hp=(s.hp||0)*k;s.sh=(s.sh||0)*k;
    const its=[...(s.inv||[]),...Object.values(s.eq||{}).filter(Boolean)];for(const x of s.sec)for(const m of x.slots)if(m&&typeof m==='object'){if(m.chip)its.push(m.chip);if(m.spent)for(const r in m.spent)m.spent[r]*=k}
    for(const it of its)for(const st of[it.imp,...(it.aff||[])])if(st&&FLAT.includes(st.k))st.v*=k;
    if(s.missions){s.missions.offers=[];for(const m of s.missions.active||[]){if(m.need&&m.type==='deliver'){m.need*=k;m.prog*=k}if(m.reward){m.reward.cr*=k;m.reward.ore*=k}}}
    s.num=k}
  // v0.11: pilot – staré uloženie dostane XP za už obsadené sektory (pripíše sa po načítaní, pozri main.js)
  if(!s.pilot){s.pilot={lv:1,xp:0,total:0,pts:0,sk:{mining:0,combat:0,flight:0,trade:0}};let x=0;s.sec.forEach((c,i)=>{if(c.captured)x+=4000*(1+i*.5)});if(x)s.pilotRetro=x}
  while(s.sec.length<SECTORS.length){const prev=s.sec[s.sec.length-1];s.sec.push({core:1,slots:[null,null,null,null,null,null],captured:false,unlocked:!!(prev&&prev.captured),rewarded:false})}
  for(const k of['weapon'])if(s.ship.gun==null){s.ship.gun=1;s.ship.gunRate=1}
  // sektory obsadené pred v0.5: vyplatí sa ich odmena v kredítoch
  s.sec.forEach((x,i)=>{if(x.captured&&!x.rewarded){s.credits+=SECTORS[i].reward.cr;x.rewarded=true}});
  if(s.tier){const cap=s.sec.filter(x=>x.captured).length,best=(s.arena&&s.arena.best)||0;s.tier=Math.min(s.tier,cap+2*Math.floor(best/5))}   // v0.38: výzva len do odomknutej úrovne
  return s}
function loadState(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return null;const s=JSON.parse(raw);if(s&&s.v===3&&Array.isArray(s.sec))return migrate(s)}catch(e){}return null}
let state=null;
let nmDead=false; // Nightmare: loď zničená, nič sa už neukladá
/* v0.30: ukladanie cez sloty (saves.js) – spoločné nastavenia vždy, stav hry len ak je zvolený slot (nie v hlavnom menu). */
function save(){if(!state||typeof savePrefs!=='function')return false;savePrefs();if(nmDead)return false;
  if(!curSlot&&!(typeof menuOpen==='function'&&menuOpen()))curSlot=pickSlot();   // v0.31.1: hrá sa bez zvoleného slotu (napr. po aktualizácii) → slot sa priradí sám
  if(!curSlot)return false;return autoSave()}
const cur=()=>state.sec[state.cur];
const countMod=(s,k)=>s.slots.filter(x=>slotType(x)===k).length;
/* Modul v slote stanice: t = typ (drone/tower/sensor), enh = vylepšenie +0..+10, chip = vložený čip (predmet) alebo null,
   mode = 'mine' | 'def' (dron: ťažba alebo obrana), res = surovina, ktorú dron ťaží, spent = suroviny minuté na vylepšenia (pre predaj). */
function newModule(t){return{t,enh:0,chip:null,mode:'mine',res:'ore',spent:C()}}
const slotType=m=>m?(m.t||m):null;
const modRar=m=>MOD_RAR[Math.min(MOD_ENH_MAX,m.enh||0)];
/* Súčet vlastnosti k z čipu modulu (vrátane vylepšenia čipu). */
function chipStat(m,k){if(!m||!m.chip)return 0;let v=0;for(const x of itemStats(m.chip))if(x.k===k)v+=x.v;return v}
/* Efektívna rarita dronu = vyššia z: rarita modulu (rastie vylepšovaním) alebo rarita vloženého AI jadra.
   Podľa nej sa odomykajú schopnosti (CHIP_CAP). */
const droneCapR=m=>Math.max(modRar(m),m.chip&&BASES[m.chip.b].mod==='drone'?m.chip.r:-1);
const chipCan=(m,cap)=>!!(m&&m.t==='drone'&&droneCapR(m)>=CHIP_CAP[cap]);
function modInf(m){return Math.round(MOD[m.t].inf*(1+MOD_ENH_INF*m.enh)+chipStat(m,'inf'))}
function freeSlot(s){const n=slotsFor(s.core);for(let i=0;i<n;i++)if(!s.slots[i])return i;return -1}
/* Vplyv sektora = úroveň jadra × CORE_INF + súčet vplyvu postavených modulov. */
function influence(s){let v=s.core*CORE_INF;for(const m of s.slots)if(m)v+=modInf(m);return v}
/* Množstvo meny/suroviny: 'cr' = kredity, inak suroviny na stanici. */
const amt=r=>r==='cr'?state.credits:state[r];
const COST_KEYS=['ore','green','crystal','cr'];
const afford=c=>COST_KEYS.every(r=>amt(r)>=(c[r]||0));
function pay(c){for(const r of RES)state[r]-=c[r]||0;state.credits-=c.cr||0}
/* Aktívna loď z hangára a jej násobky. upVal = hodnota vylepšenia na úrovni L pre túto loď, upCost = cena vylepšenia. */
const curShip=()=>SHIPS[state.shipId]||SHIPS.klepeto;
function upVal(k,L){const v=UP[k].val(L);const m=curShip().mul[k]||1;if(m===1)return v;if(k==='sregen')return{delay:v.delay,rate:v.rate*m};return v*m}
function upCost(k,L){const c=UP[k].cost(L),m=curShip().upMul;if(m===1)return c;const o={};for(const r of COST_KEYS)o[r]=Math.round((c[r]||0)*m);return o}
/* Hodnota vlastnosti lode = úroveň vylepšenia (UP, × násobok lode) + bonusy z nasadených predmetov (bonus() v items.js). */
function shipVal(k){const v=upVal(k,state.ship[k]);const b=bonus();
  switch(k){
    case'speed':return v*(1+b.speed/100);
    case'accel':return v*(1+b.accel/100);
    case'turn':return v*(1+b.turn/100);
    case'hull':return Math.round((v+b.hull)*(1+b.hullPct/100));
    case'cargo':return Math.round(v+b.cargo);
    case'shield':return Math.round(v+b.shield);
    case'sregen':return{delay:Math.max(3,v.delay-b.sdelay),rate:v.rate*(1+b.sregen/100)};
    case'laser':return v*(1+b.mine/100);
    case'range':return v+b.range;
    case'gun':return(v+(b.wb||0))*(1+b.dmg/100)*(b.dmgXm||1);   // v0.38: poškodenie lode + základ modulu zbrane, percentá násobia oboje
    case'gunRate':return v*(1+b.frate/100)}
  return v}
/* Kritický zásah: šanca = CRIT_BASE % + vlastnosť crit (max. 75 %), poškodenie = 1 + (CRIT_DMG % + critDmg) / 100 (základ = dvojnásobok). */
const CRIT_BASE=3,CRIT_DMG=100;
const critChance=()=>Math.min(75,CRIT_BASE+bonus().crit)/100;
const critMult=()=>1+(CRIT_DMG+bonus().critDmg)/100;
const cargoTotal=()=>state.cargo.ore+state.cargo.green+state.cargo.crystal;
const shieldMax=()=>shipVal('shield');
const capOf=i=>SECTORS[i].capture;
const secName=i=>t('sec'+i+'.name');

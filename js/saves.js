'use strict';
/* ==================== v0.30: ULOŽENÉ HRY – 3 SLOTY, AUTOMATICKÉ A RUČNÉ ULOŽENIA ====================
   Všetko je v localStorage:
     os-saves            = index (rýchly zoznam bez čítania veľkých stavov): {fmt, last, slots:[{n, ai, at, e:{kľúč: meta}}]}
     os-save-<slot>-a<i> = automatické uloženie i (AUTO_N kusov v kruhu, nové sa začína každých AUTO_ROT sekúnd)
     os-save-<slot>-m<i> = ručné uloženie i (najviac MAN_N; pri plnom slote sa prepíše najstaršie)
     os-prefs            = spoločné nastavenia pre všetky sloty (jazyk, HUD, minimapa, priehľadnosť menu…)
   Každé uloženie je obálka {fmt, schema, game, ts, meta, state}:
     schema = verzia štruktúry stavu. Keď sa v budúcej verzii zmení štruktúra state, zvýš SAVE_SCHEMA a pridaj
     krok do SAVE_MIGRATIONS (index i prevedie schému i na i+1). Pri načítaní sa kroky spustia postupne,
     potom ešte migrate() zo state.js doplní chýbajúce polia – takže uloženie zo staršej verzie vždy pokračuje.
   Stará hra (kľúč SAVE_KEY z verzií ≤ 0.29) sa pri prvom spustení prenesie do slotu 1 (pôvodný kľúč zostane nedotknutý). */
const SAVE_FMT=1,SAVE_SCHEMA=1,SLOT_N=3,AUTO_N=3,MAN_N=6,AUTO_ROT=300;
const SAVE_IDX='os-saves',PREFS_KEY='os-prefs';
/* Kroky migrácie: SAVE_MIGRATIONS[i](state) prevedie schému i → i+1. Schéma 0 = surový stav zo starých verzií. */
const SAVE_MIGRATIONS=[
  s=>{if(typeof s.playT!=='number')s.playT=0;return s}   // 0 → 1: odohraný čas
];
/* Spoločné nastavenia: tieto polia stavu sa neukladajú do slotu, ale do os-prefs (platia pre všetky sloty aj hlavné menu). */
const PREF_KEYS=['menuAlpha','hudCompact','hudAuto','padMouse','miniSize','hudPos','cmpMode'];
let curSlot=null,saveErrShown=false;
const saveKey=(n,k)=>`os-save-${n}-${k}`;
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v);return true}catch(e){if(!saveErrShown&&typeof toast==='function'){saveErrShown=true;toast(t('sv.err'),'bad')}return false}}
function lsDel(k){try{localStorage.removeItem(k)}catch(e){}}

/* ---- spoločné nastavenia ---- */
function loadPrefs(){try{return JSON.parse(lsGet(PREFS_KEY)||'{}')||{}}catch(e){return{}}}
function savePrefs(){if(!state)return;const p=loadPrefs();for(const k of PREF_KEYS){if(state[k]===undefined)delete p[k];else p[k]=state[k]}lsSet(PREFS_KEY,JSON.stringify(p))}
/* Nastaví spoločné nastavenia do (práve načítaného) stavu. */
function applyPrefs(s){const p=loadPrefs();for(const k of PREF_KEYS){if(k in p)s[k]=p[k];else delete s[k]}return s}

/* ---- index ---- */
function freshIdx(){return{fmt:SAVE_FMT,last:null,slots:Array.from({length:SLOT_N},(_,i)=>({n:i+1,ai:0,at:0,e:{}}))}}
function loadIdx(){let I=null;try{I=JSON.parse(lsGet(SAVE_IDX)||'null')}catch(e){}
  if(!I||!Array.isArray(I.slots)){I=freshIdx();importLegacy(I)}
  while(I.slots.length<SLOT_N)I.slots.push({n:I.slots.length+1,ai:0,at:0,e:{}});   // budúce verzie môžu pridať sloty
  return I}
function saveIdx(I){lsSet(SAVE_IDX,JSON.stringify(I))}
/* Prenos hry zo starých verzií (jeden kľúč SAVE_KEY) do slotu 1. */
function importLegacy(I){const raw=lsGet(SAVE_KEY);if(!raw)return;
  try{const s=JSON.parse(raw);if(!s||!Array.isArray(s.sec))return;const env=envelope(s,'a0','auto',0);env.schema=0;env.meta.schema=0;env.meta.label='import';
    if(!lsGet(PREFS_KEY)){const p={};for(const k of PREF_KEYS)if(s[k]!==undefined)p[k]=s[k];lsSet(PREFS_KEY,JSON.stringify(p))}   // nastavenia zo starej hry sa stanú spoločnými
    if(lsSet(saveKey(1,'a0'),JSON.stringify(env))){I.slots[0].e.a0=env.meta;I.slots[0].at=Date.now();I.last=1;saveIdx(I)}}catch(e){}}

/* Krátky popis uloženia pre zoznam (sektor, obtiažnosť, úroveň pilota, kredity, odohraný čas, loď). */
function saveMeta(s,k,kind){const capd=(s.sec||[]).filter(x=>x.captured).length;
  return{k,kind,ts:Date.now(),game:GAME_VERSION,schema:SAVE_SCHEMA,sec:s.cur|0,cap:capd,diff:s.diff||'easy',lv:(s.pilot&&s.pilot.lv)||1,cr:Math.floor(s.credits||0),play:Math.floor(s.playT||0),ship:s.shipId||'klepeto',intro:!!s.intro}}
function envelope(s,k,kind){const st=Object.assign({},s);for(const p of PREF_KEYS)delete st[p];
  return{fmt:SAVE_FMT,schema:SAVE_SCHEMA,game:GAME_VERSION,ts:Date.now(),meta:saveMeta(s,k,kind),state:st}}

/* Zápis uloženia do slotu n pod kľúč k (a0..a2 alebo m0..m5). */
function writeSave(n,k,kind,label){const I=loadIdx(),S=I.slots[n-1];const env=envelope(state,k,kind);if(label)env.meta.label=label;
  if(!lsSet(saveKey(n,k),JSON.stringify(env)))return false;S.e[k]=env.meta;I.last=n;saveIdx(I);savePrefs();return true}
/* Automatické uloženie (volá save() každých pár sekúnd): zapisuje do aktuálneho automatického miesta;
   každých AUTO_ROT sekúnd sa posunie na ďalšie, takže v slote ostanú AUTO_N automatické uloženia s odstupom. */
function autoSave(){if(!curSlot||!state)return;const I=loadIdx(),S=I.slots[curSlot-1];
  if(!S.at||Date.now()-S.at>AUTO_ROT*1000){if(S.at)S.ai=(S.ai+1)%AUTO_N;S.at=Date.now();saveIdx(I)}
  return writeSave(curSlot,'a'+S.ai,'auto')}
/* Slot pre hru, ktorá beží bez zvoleného slotu: naposledy použitý, inak prvý prázdny, inak 1. */
function pickSlot(){const I=loadIdx();if(I.last)return I.last;for(const S of I.slots)if(!Object.keys(S.e).length)return S.n;return 1}
/* Ručné uloženie: prvé voľné miesto, inak prepíše najstaršie (alebo zadané k). */
function manualSave(k){if(!state||nmDead)return false;if(!curSlot)curSlot=pickSlot();const S=loadIdx().slots[curSlot-1];
  if(!k){for(let i=0;i<MAN_N;i++)if(!S.e['m'+i]){k='m'+i;break}
    if(!k)k=Object.values(S.e).filter(m=>m.kind==='man').sort((a,b)=>a.ts-b.ts)[0].k}
  const ok=writeSave(curSlot,k,'man');if(typeof toast==='function')toast(ok?t('sv.saved',{n:curSlot}):t('sv.err'),ok?'':'bad');return ok}
/* Zoznam uložení slotu, najnovšie prvé. */
function slotEntries(n){const S=loadIdx().slots[n-1];return Object.values(S.e).sort((a,b)=>b.ts-a.ts)}
const slotUsed=n=>slotEntries(n).length>0;
function deleteSave(n,k){const I=loadIdx();lsDel(saveKey(n,k));delete I.slots[n-1].e[k];saveIdx(I)}
function deleteSlot(n){const I=loadIdx();for(const k in I.slots[n-1].e)lsDel(saveKey(n,k));I.slots[n-1]={n,ai:0,at:0,e:{}};if(I.last===n)I.last=null;saveIdx(I)}

/* Načítanie uloženia: obálka → migrácie podľa schémy → migrate() (doplnenie polí) → spoločné nastavenia. */
function readSave(n,k){let env=null;try{env=JSON.parse(lsGet(saveKey(n,k))||'null')}catch(e){}
  if(!env||!env.state)return null;let s=env.state,sc=env.schema|0;
  if(sc>SAVE_SCHEMA&&typeof toast==='function')toast(t('sv.newer',{v:env.game||'?'}),'bad');   // uložené novšou verziou – skúsi sa aj tak
  try{for(;sc<SAVE_SCHEMA;sc++)s=SAVE_MIGRATIONS[sc](s)||s;if(s.v!==3||!Array.isArray(s.sec))return null;s=migrate(s)}catch(e){console.error(e);return null}
  return applyPrefs(s)}
/* Posledné použité uloženie (pre „Pokračovať“). */
function lastSave(){const I=loadIdx();let best=null;
  for(const S of I.slots)for(const m of Object.values(S.e))if(!best||m.ts>best.m.ts)best={n:S.n,m};
  return best}

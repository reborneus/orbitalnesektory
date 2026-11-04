'use strict';
/* ==================== == 16c. HLAVNÝ SKLAD (v0.10) ====================
   Sklad je na stanici v 1. sektore (Kepler-12): panel Stanica → záložka Sklad. Prezerať ho môžeš odkiaľkoľvek,
   predmety však presúvaš (inventár ↔ sklad) iba pri stanici v 1. sektore.
   state.storage = {items:[predmety], cap: počet miest, exp: koľkokrát bol rozšírený}.
   Mriežka sa dá zoradiť (stSort) a prehľadávať (stQuery – hľadá v názve, type, slote, rarite aj vlastnostiach). */
const STORE_SEC=0;                    // sektor s hlavným skladom
const STORE_CAP0=40,STORE_STEP=20,STORE_MAX=400;   // začiatočná kapacita, +miesta za rozšírenie, najviac miest
/* cena rozšírenia: n = koľkokrát už bol sklad rozšírený */
const storeExpCost=n=>P(C(300*(n+1),n>=1?60*n:0,n>=3?20*(n-2):0,Math.round(200*Math.pow(n+1,1.5))));
let stSel=null,stSort='rar',stQuery='';
function sstate(){if(!state.storage)state.storage={items:[],cap:STORE_CAP0,exp:0};return state.storage}
const atStore=()=>state.cur===STORE_SEC&&nearStation();
const STORE_SORTS={
  rar:(a,b)=>byRarity(a,b),
  lvl:(a,b)=>b.ilvl-a.ilvl||b.r-a.r||b.enh-a.enh,
  type:(a,b)=>SLOTS.concat('chip').indexOf(BASES[a.b].slot)-SLOTS.concat('chip').indexOf(BASES[b.b].slot)||a.b.localeCompare(b.b)||b.r-a.r,
  enh:(a,b)=>b.enh-a.enh||b.r-a.r,
  new:(a,b)=>b.id-a.id};
/* text, v ktorom sa hľadá: názov, titul, typ, slot, rarita a názvy vlastností (bez diakritiky a veľkých písmen) */
const fold=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function itemSearchText(it){return fold([itemName(it),itemTitle(it)||'',t('base.'+it.b),t('slot.'+BASES[it.b].slot),t('r.'+RAR[it.r].k),...itemStats(it).map(x=>t('s.'+x.k)),'+'+it.enh,'lv'+it.ilvl].join(' '))}
function storeList(){const S=sstate();const q=fold(stQuery.trim());let a=S.items.slice();
  if(q)a=a.filter(it=>q.split(/\s+/).every(w=>itemSearchText(it).includes(w)));return a.sort(STORE_SORTS[stSort]||STORE_SORTS.rar)}
const cellHtml=(it,act)=>`<button class="itm it r${it.r}${stSel&&stSel.id===it.id?' sel':''}" ${rc(it)} data-act="${act}" data-id="${it.id}" title="${t('r.'+RAR[it.r].k)} ${t('base.'+it.b)}">${icon(it.b)}${it.enh?`<span class="enh">+${it.enh}</span>`:''}<span class="il">${it.ilvl}</span>${it.lock?'<i class="lk">🔒</i>':''}</button>`;
function storeGridHtml(){const S=sstate(),L=storeList();
  if(!S.items.length)return `<p class="note">${t('sto.empty')}</p>`;
  if(!L.length)return `<p class="note">${t('sto.noMatch')}</p>`;
  // prázdne miesta dopĺňajú mriežku, aby bolo vidieť kapacitu (pri hľadaní sa neukazujú)
  const free=stQuery.trim()?0:Math.min(S.cap-S.items.length,24);
  return `<div class="inv sgrid">${L.map(it=>cellHtml(it,'stSel')).join('')}${'<span class="itm slot0"></span>'.repeat(Math.max(0,free))}</div>`}
function storeDetail(){if(!stSel)return'';const S=sstate();const it=(stSel.where==='st'?S.items:state.inv).find(x=>x.id===stSel.id);if(!it){stSel=null;return''}
  const R=RAR[it.r],title=itemTitle(it),near=atStore();
  const cmp=hoverUI();let h=`<div class="itd it r${it.r}${cmp?' compact':''}" ${rc(it)}><div class="itd-head">${icon(it.b)}<div class="itd-names">${title?`<div class="ttl">«${title}»</div>`:''}<div class="nm">${itemName(it)}</div>
    <div class="meta"><span class="rlab">${t('r.'+R.k)}</span> · ${t('slot.'+BASES[it.b].slot)} · ${t('gear.ilvl',{n:it.ilvl})} · ${stSel.where==='st'?t('sto.inStore'):t('sto.inInv')}</div></div></div>
    ${cmp?'':`<ul class="stats">${itemStats(it).map(x=>`<li class="${x.imp?'imp':''}"><span>${t('s.'+x.k)}</span><b>${fmtStat(x.k,x.v)}</b></li>`).join('')}</ul>`}<div class="itd-acts">`;
  if(stSel.where==='st')h+=`<button class="btn prim" data-act="stOut" ${near?'':'disabled'}>${t('sto.toInv')}</button>`;
  else h+=`<button class="btn prim" data-act="stIn" ${near?'':'disabled'}>${t('sto.toStore')}</button>`;
  h+=`<button class="btn" data-act="stLock">${it.lock?t('btn.unlock'):t('btn.lock')}</button>`;
  h+=it.lock?`<button class="btn" disabled title="${t('gear.locked')}">${t('btn.salv',{n:salvValue(it)})}</button>`:`<button class="btn danger" data-act="stSalv">${t('btn.salv',{n:salvValue(it)})}</button>`;
  return h+`<button class="btn" data-act="stDesel">${t('btn.back')}</button></div></div>`}
function renderStorage(){const S=sstate(),near=atStore();let h='';
  if(state.cur!==STORE_SEC)h+=`<p class="note" style="color:var(--warn)">${t('sto.far',{s:secName(STORE_SEC)})}</p>`;
  else if(!near)h+=`<p class="note">${t('sto.near')}</p>`;
  h+=storeDetail();
  h+=`<div class="sec-h"><span>${t('sto.h',{a:S.items.length,b:S.cap})}</span><span>${t('gear.inv',{a:state.inv.length,b:INV_MAX})}</span></div>`;
  h+=`<div class="stbar"><input type="search" id="stQ" placeholder="${t('sto.search')}" value="${stQuery.replace(/"/g,'&quot;')}" autocomplete="off">
    <div class="langs">${Object.keys(STORE_SORTS).map(k=>`<button class="langb" data-act="stSort" data-v="${k}" aria-pressed="${stSort===k}">${t('sto.s.'+k)}</button>`).join('')}</div></div>`;
  h+=`<div id="stGrid">${storeGridHtml()}</div>`;
  h+=`<div class="admrow stacts"><button class="btn" data-act="stAll" ${near&&state.inv.some(x=>!x.lock)?'':'disabled'}>${t('sto.all')}</button></div>`;
  // rozšírenie skladu
  if(S.cap<STORE_MAX){const c=storeExpCost(S.exp);h+=`<div class="card"><h3>${t('sto.exp')} <span class="lv">${S.cap} → ${Math.min(STORE_MAX,S.cap+STORE_STEP)}</span></h3>${actBtn('stExp',t('btn.upgrade'),c,false)}<div class="costs">${costHtml(c)}</div><p>${t('sto.expD',{n:STORE_STEP,m:STORE_MAX})}</p></div>`}
  else h+=`<p class="note">${t('sto.maxed',{m:STORE_MAX})}</p>`;
  // inventár lode (ťuknutím vyberieš predmet, ktorý chceš uložiť)
  h+=`<div class="sec-h"><span>${t('sto.invH')}</span></div>`;
  h+=state.inv.length?`<div class="inv">${state.inv.slice().sort(byRarity).map(it=>cellHtml(it,'stSelInv')).join('')}</div>`:`<p class="note">${t('gear.none')}</p>`;
  return h}
/* Hľadanie: pri písaní sa prekreslí len mriežka, aby políčko neprišlo o kurzor. */
document.addEventListener('input',e=>{if(e.target&&e.target.id==='stQ'){stQuery=e.target.value;const g=$('#stGrid');if(g)g.innerHTML=storeGridHtml()}});
function storageAct(act,b){if(!act.startsWith('st')||act==='stTab')return false;const S=sstate();
  const done=()=>{save();renderSheet();updateHUD();return true};
  const find=()=>stSel?(stSel.where==='st'?S.items:state.inv).findIndex(x=>x.id===stSel.id):-1;
  switch(act){
    case 'stSel':stSel={id:+b.dataset.id,where:'st'};renderSheet();body.scrollTop=0;return true;
    case 'stSelInv':stSel={id:+b.dataset.id,where:'inv'};renderSheet();body.scrollTop=0;return true;
    case 'stDesel':stSel=null;renderSheet();return true;
    case 'stSort':stSort=b.dataset.v;renderSheet();return true;
    case 'stIn':{if(!atStore())return true;if(S.items.length>=S.cap){toast(t('sto.full'),'bad');return true}const i=find();if(i<0)return true;
      S.items.push(state.inv.splice(i,1)[0]);invWarned=false;stSel=null;return done()}
    case 'stOut':{if(!atStore())return true;if(state.inv.length>=INV_MAX){toast(t('tt.invFull'),'bad');return true}const i=find();if(i<0)return true;
      state.inv.push(S.items.splice(i,1)[0]);stSel=null;return done()}
    case 'stAll':{if(!atStore())return true;let n=0;state.inv=state.inv.filter(it=>{if(!it.lock&&S.items.length<S.cap){S.items.push(it);n++;return false}return true});
      invWarned=false;stSel=null;toast(n?t('sto.moved',{n}):t('sto.full'),n?true:'bad');return done()}
    case 'stLock':{const i=find();if(i<0)return true;const it=(stSel.where==='st'?S.items:state.inv)[i];it.lock=!it.lock;return done()}
    case 'stSalv':{const i=find();if(i<0)return true;const arr=stSel.where==='st'?S.items:state.inv;const it=arr[i];if(it.lock)return true;
      if(it.r>=4&&(!b.dataset.arm||performance.now()-(+b.dataset.arm)>3000)){b.dataset.arm=performance.now();b.textContent=t('btn.sellSure');return true}
      const c=salvValue(it);state.credits+=c;arr.splice(i,1);stSel=null;toast(t('tt.salv',{n:itemName(it),c}));return done()}
    case 'stExp':{if(S.cap>=STORE_MAX)return true;const c=storeExpCost(S.exp);if(!afford(c)){toast(t('tt.noRes'));return true}
      pay(c);S.exp++;S.cap=Math.min(STORE_MAX,S.cap+STORE_STEP);toast(t('sto.expOk',{n:S.cap}),true);return done()}
  }
  return false}

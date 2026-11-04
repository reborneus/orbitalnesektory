'use strict';
/* ==================== == 12. VÝBAVA (obrazovka inventára) ====================
   renderGear() vráti HTML obsah menu Výbava: hore detail vybraného predmetu, potom nasadené sloty, potom mriežka inventára.
   gearAct(act, tlačidlo) spracuje kliknutia (volá ho spoločný poslucháč v ui.js); vráti true, ak akciu vybavil.
   Akcie (data-act): sel = vybrať predmet, desel = zavrieť detail, equip/unequip = nasadiť/zložiť,
   enh = vylepšiť +1, salv = rozobrať na kredity, salvJunk = rozobrať všetok Odpad a Bežné, lock = zamknúť/odomknúť. */
let gearSel=null;   // id predmetu, ktorého detail je otvorený (null = žiadny)

/* Nájde predmet podľa id v inventári alebo medzi nasadenými. */
function findItem(id){const i=state.inv.findIndex(x=>x.id===id);if(i>=0)return{it:state.inv[i],where:'inv',i};
  for(const s of SLOTS){const e=state.eq[s];if(e&&e.id===id)return{it:e,where:'eq',slot:s}}return null}
const byRarity=(a,b)=>b.r-a.r||b.ilvl-a.ilvl||b.enh-a.enh||a.b.localeCompare(b.b);
const rc=it=>`style="--rc:${RAR[it.r].col}"`;
/* Súčty vlastností jedného predmetu podľa kľúča (na porovnanie). */
function statSum(it){const o={};if(it)for(const x of itemStats(it))o[x.k]=(o[x.k]||0)+x.v;return o}
function cmpHtml(it,eq){const a=statSum(it),b=statSum(eq);const keys=[...new Set([...Object.keys(a),...Object.keys(b)])];
  const rows=keys.map(k=>{const d=(a[k]||0)-(b[k]||0);if(Math.abs(d)<1e-6)return'';
    return `<li class="${d>0?'up':'down'}"><span>${t('s.'+k)}</span><b>${d>0?'▲':'▼'} ${fmtStat(k,Math.abs(d)).slice(1)}</b></li>`}).join('');
  return rows?`<div class="sec-h"><span>${t('gear.cmp')}</span></div><ul class="stats">${rows}</ul>`:''}

function detailHtml(f){const it=f.it,R=RAR[it.r],title=itemTitle(it),slot=BASES[it.b].slot;
  let h=`<div class="itd it r${it.r}" ${rc(it)}>
    <div class="itd-head">${icon(it.b)}<div class="itd-names">${title?`<div class="ttl">«${title}»</div>`:''}<div class="nm">${itemName(it)}</div>
      <div class="meta"><span class="rlab">${t('r.'+R.k)}</span> · ${t('slot.'+slot)} · ${t('gear.ilvl',{n:it.ilvl})}${it.lock?' · '+t('gear.isLocked'):''}</div></div></div>
    <ul class="stats">${itemStats(it).map(x=>`<li class="${x.imp?'imp':''}"><span>${t('s.'+x.k)}</span><b>${fmtStat(x.k,x.v)}</b></li>`).join('')}</ul>`;
  if(f.where==='inv'&&slot!=='chip'&&state.eq[slot])h+=cmpHtml(it,state.eq[slot]);
  h+=`<div class="itd-acts">`;
  if(slot==='chip')h+=`<p class="note" style="margin:0;flex-basis:100%">${t('gear.chipNote')}</p>`;
  else h+=f.where==='inv'?`<button class="btn prim" data-act="equip">${t('btn.equip')}</button>`:`<button class="btn" data-act="unequip">${t('btn.unequip')}</button>`;
  if(f.where==='inv')h+=it.lock?`<button class="btn" data-act="salv" disabled title="${t('gear.locked')}">${t('btn.salv',{n:salvValue(it)})}</button>`:`<button class="btn danger" data-act="salv">${t('btn.salv',{n:salvValue(it)})}</button>`;
  h+=`<button class="btn" data-act="lock">${it.lock?t('btn.unlock'):t('btn.lock')}</button><button class="btn" data-act="desel">${t('btn.back')}</button></div>`;
  // vylepšenie +N
  if(it.enh<enhMax(it)){const c=enhCost(it);
    h+=`<div class="enhrow">${actBtn('enh',t('btn.enh',{n:it.enh+1}),c,false)}<div class="costs">${costHtml(c)}</div><span class="note" style="margin:0">${t('gear.chance',{n:Math.round(enhChance(it)*100)})}</span></div>`}
  else h+=`<p class="note" style="margin:0">${t('gear.maxEnh',{n:enhMax(it)})}</p>`;
  return h+'</div>'}

function renderGear(){let h='';
  const junk=state.inv.filter(x=>x.r<=1&&!x.lock).length;
  h+=`<div class="gear-top"><span class="credits"><span class="coin"></span>${fmtN(state.credits)} ¢</span>${junk?`<button class="ghost" data-act="salvJunk">${t('gear.salvJunk',{n:junk})}</button>`:''}</div>`;
  const f=gearSel!=null?findItem(gearSel):null;if(!f)gearSel=null;else h+=detailHtml(f);
  h+=`<div class="sec-h"><span>${t('gear.eq')}</span></div><div class="eqs">`;
  for(const s of SLOTS){const it=state.eq[s];
    if(!it){h+=`<div class="eqc empty"><span>${t('gear.empty')}: ${t('slot.'+s)}</span></div>`;continue}
    const st=itemStats(it).slice(0,2).map(x=>`${t('s.'+x.k)} ${fmtStat(x.k,x.v)}`).join(' · ');
    h+=`<button class="eqc it r${it.r}${gearSel===it.id?' sel':''}" ${rc(it)} data-act="sel" data-id="${it.id}">${icon(it.b)}<span class="eqc-txt"><b>${itemName(it)}</b><small>${t('r.'+RAR[it.r].k)} · ${t('slot.'+s)} · ${t('gear.ilvl',{n:it.ilvl})}</small><small>${st}</small></span></button>`}
  h+=`</div><div class="sec-h"><span>${t('gear.inv',{a:state.inv.length,b:INV_MAX})}</span></div>`;
  if(!state.inv.length)h+=`<p class="note">${t('gear.none')}</p>`;
  else h+=`<div class="inv">${state.inv.slice().sort(byRarity).map(it=>`<button class="itm it r${it.r}${gearSel===it.id?' sel':''}" ${rc(it)} data-act="sel" data-id="${it.id}" title="${t('r.'+RAR[it.r].k)} ${t('base.'+it.b)}">${icon(it.b)}${it.enh?`<span class="enh">+${it.enh}</span>`:''}<span class="il">${it.ilvl}</span>${it.nw?'<i class="nw"></i>':''}</button>`).join('')}</div>`;
  return h}

function gearAct(act,b){
  const f=gearSel!=null?findItem(gearSel):null;
  const done=()=>{save();renderSheet();updateHUD();return true};
  switch(act){
    case 'sel':{gearSel=+b.dataset.id;const g=findItem(gearSel);if(g)g.it.nw=false;renderSheet();body.scrollTop=0;focusIdx=0;applyFocus();return true}
    case 'desel':gearSel=null;renderSheet();return true;
    case 'equip':{if(!f||f.where!=='inv'||BASES[f.it.b].slot==='chip')return true;const slot=BASES[f.it.b].slot;const old=state.eq[slot];
      state.inv.splice(f.i,1);state.eq[slot]=f.it;if(old)state.inv.push(old);bonusDirty();toast(t('tt.equipped',{n:itemName(f.it)}),{rar:f.it.r});return done()}
    case 'unequip':{if(!f||f.where!=='eq')return true;if(state.inv.length>=INV_MAX){toast(t('tt.invFull'),'bad');return true}
      state.eq[f.slot]=null;state.inv.push(f.it);bonusDirty();return done()}
    case 'enh':{if(!f)return true;const it=f.it;if(it.enh>=enhMax(it))return true;const c=enhCost(it);if(!afford(c)){toast(t('tt.noRes'));return true}
      pay(c);if(Math.random()<enhChance(it)){it.enh++;toast(t('tt.enhOk',{n:itemName(it)}),{rar:it.r})}else toast(t('tt.enhFail',{n:it.enh}),'bad');
      if(f.where==='eq')bonusDirty();return done()}
    case 'salv':{if(!f||f.where!=='inv'||f.it.lock)return true;
      // vzácne a lepšie predmety treba potvrdiť druhým ťuknutím do 3 s
      if(f.it.r>=4&&(!b.dataset.arm||performance.now()-(+b.dataset.arm)>3000)){b.dataset.arm=performance.now();b.textContent=t('btn.sellSure');return true}
      const c=salvValue(f.it);state.credits+=c;state.inv.splice(f.i,1);gearSel=null;invWarned=false;toast(t('tt.salv',{n:itemName(f.it),c}));return done()}
    case 'salvJunk':{let c=0,n=0;state.inv=state.inv.filter(x=>{if(x.r<=1&&!x.lock){c+=salvValue(x);n++;return false}return true});
      if(gearSel!=null&&!findItem(gearSel))gearSel=null;state.credits+=c;invWarned=false;if(n)toast(t('tt.salvMany',{n,c}));return done()}
    case 'lock':{if(!f)return true;f.it.lock=!f.it.lock;return done()}
  }
  return false}

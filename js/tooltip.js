'use strict';
/* ==================== == 12b. NÁHĽAD PREDMETU PRI MYŠI (v0.14.1) ====================
   Na PC (myš a klávesnica) sa vlastnosti predmetu ukážu ako plávajúci náhľad pri ukazovateli myši, keď nad predmetom
   podržíš myš (inventár, nasadené sloty, sklad, čipy). Kliknutie potom otvorí len kompaktný pruh s akciami
   (nasadiť, rozobrať…), bez veľkého okna so štatistikami. Na dotyku a ovládači zostáva pôvodné okno s detailom. */
const canHover=typeof matchMedia==='function'&&matchMedia('(hover:hover) and (pointer:fine)').matches;
const hoverUI=()=>canHover&&(inputMode==='mouse'||inputMode==='key');
/* nájde predmet podľa id v inventári, výbave, sklade alebo v čipoch modulov */
function findAnyItem(id){let it=state.inv.find(x=>x.id===id);if(it)return{it,where:'inv'};
  for(const s of SLOTS)if(state.eq[s]&&state.eq[s].id===id)return{it:state.eq[s],where:'eq'};
  if(state.storage){it=state.storage.items.find(x=>x.id===id);if(it)return{it,where:'st'}}
  for(const sc of state.sec)for(const m of sc.slots)if(m&&m.chip&&m.chip.id===id)return{it:m.chip,where:'chip'};
  if(state.trader)for(const k in state.trader){it=(state.trader[k].stock||[]).find(x=>x.id===id);if(it)return{it,where:'shop'}}return null}
/* Porovnanie s nasadeným predmetom (Nastavenia → Porovnanie predmetov): state.cmpMode =
   'both' (vedľa seba + rozdiely), 'diff' (len rozdiely ▲▼), 'side' (len vedľa seba), 'off' (vypnuté). */
const CMP_MODES=['both','diff','side','off'];
const cmpMode=()=>state.cmpMode||'both';
function tipCard(it,where,label){const R=RAR[it.r],title=itemTitle(it),slot=BASES[it.b].slot;
  let h=`<div class="itd it r${it.r} tipcard" style="--rc:${R.col}">${label?`<div class="tiplabel">${label}</div>`:''}<div class="itd-head">${icon(it.b)}<div class="itd-names">${title?`<div class="ttl">«${title}»</div>`:''}<div class="nm">${itemName(it)}</div>
    <div class="meta"><span class="rlab">${t('r.'+R.k)}</span> · ${t('slot.'+slot)} · ${t('gear.ilvl',{n:it.ilvl})}${it.lock?' · '+t('gear.isLocked'):''}</div></div></div>
    <ul class="stats">${itemStats(it).map(x=>`<li class="${x.imp?'imp':''}"><span>${t('s.'+x.k)}</span><b>${fmtStat(x.k,x.v)}</b></li>`).join('')}</ul>`;
  return h}
function tipHtml(f){const it=f.it,slot=BASES[it.b].slot,m=cmpMode();
  const eq=f.where!=='eq'&&slot!=='chip'&&state.eq[slot]&&state.eq[slot].id!==it.id?state.eq[slot]:null;
  let a=tipCard(it,f.where,eq&&(m==='both'||m==='side')?t('tip.this'):'');
  if(eq&&(m==='both'||m==='diff'))a+=cmpHtml(it,eq);
  a+=`<div class="tiphint">${t(f.where==='eq'?'tip.eq':'tip.click')} · ${t('btn.salv',{n:salvValue(it)}).replace(/^[^(]*\(|\)$/g,'')}</div></div>`;
  if(eq&&(m==='both'||m==='side'))return `<div class="tipwrap side">${a}${tipCard(eq,'eq',t('tip.equipped'))}</div></div>`;
  return a}
let tipEl=null,tipId=null;
function tipShow(id,x,y){const f=findAnyItem(id);if(!f){tipHide();return}
  if(!tipEl){tipEl=document.createElement('div');tipEl.id='itemTip';document.body.appendChild(tipEl)}
  if(tipId!==id){tipEl.innerHTML=tipHtml(f);tipId=id}tipEl.hidden=false;tipMove(x,y)}
function tipMove(x,y){if(!tipEl||tipEl.hidden)return;const w=tipEl.offsetWidth,h=tipEl.offsetHeight,W=innerWidth,H=innerHeight;
  let l=x+18,tp=y+14;if(l+w>W-8)l=x-w-18;if(tp+h>H-8)tp=Math.max(8,H-h-8);tipEl.style.transform=`translate(${Math.max(8,l)}px,${tp}px)`}
function tipHide(){if(tipEl)tipEl.hidden=true;tipId=null}
const tipTarget=e=>{const b=e.target.closest&&e.target.closest('[data-id]');return b&&b.closest('#sheet')&&/^(sel|eqItem|mark|stSel|stSelInv|chipIn|pickEq|trSel|trSell)$/.test(b.dataset.act||'')?b:null};
document.addEventListener('pointermove',e=>{if(!hoverUI()||e.pointerType!=='mouse'){if(!pmHover)hoverHide();return}hoverAt(e.clientX,e.clientY,e.target)});
document.addEventListener('pointerdown',()=>hoverHide());
/* ==================== v0.19.3: KRÁTKE POPISY PRI MYŠI ====================
   hoverAt(x, y, prvok) – volá ho pohyb myši aj kurzor ovládača (input.js → pmMove). Poradie:
   1) predmet (veľký náhľad tipHtml), 2) prvok HUD/menu so známym popisom (HOVER_TIPS) alebo s atribútom data-tip/title,
   3) nad 3D scénou: asteroid, pirát, stanica, NPC, brána (raycast, najviac raz za 80 ms). */
const HOVER_TIPS=[['[data-tab="station"]','ht.station'],['[data-tab="ship"]','ht.ship'],['[data-tab="gear"]','ht.gear'],['[data-tab="map"]','ht.map'],
  ['[data-tab="settings"]','ht.settings'],['#wikiBtn','ht.wiki'],['#homeBtn','ht.home'],['#pilotBtn','ht.pilot'],['.sector .inf','ht.inf'],['#stRow','ht.st'],
  ['.res .r.ore','ht.ore'],['.res .r.grn','ht.grn'],['.res .r.cry','ht.cry'],['.res .r.crd','ht.cr'],['#cargoRow','ht.cargo'],['#rsRow','ht.rs'],['#shRow','ht.sh'],
  ['.res .meter:not([id])','ht.hp'],['.minictl','ht.mz'],['#mini','ht.mini'],['#sheetClose','ht.close']];
let hintEl=null,hintKey=null,pmHover=false,_wtT=0,_wtLast=null;
function hintShow(text,x,y){if(!hintEl){hintEl=document.createElement('div');hintEl.id='hintTip';document.body.appendChild(hintEl)}
  if(hintKey!==text){hintEl.innerHTML=text;hintKey=text}hintEl.hidden=false;
  const w=hintEl.offsetWidth,h=hintEl.offsetHeight;let l=x+16,tp=y+18;if(l+w>innerWidth-8)l=x-w-12;if(tp+h>innerHeight-8)tp=y-h-12;hintEl.style.transform=`translate(${Math.max(8,l)}px,${Math.max(8,tp)}px)`}
function hintHide(){if(hintEl)hintEl.hidden=true;hintKey=null}
function hoverHide(){tipHide();hintHide()}
function hoverAt(x,y,el){if(!el){hoverHide();return}
  const b=el.closest&&el.closest('[data-id]');
  if(b&&b.closest('#sheet')&&!b.closest('#gearInsp')&&/^(sel|eqItem|mark|stSel|stSelInv|chipIn|pickEq|trSel|trSell)$/.test(b.dataset.act||'')){hintHide();tipShow(+b.dataset.id,x,y);return}
  tipHide();
  // HUD má pointer-events:none (klik prejde do hry), preto sa prvky hľadajú aj podľa polohy na obrazovke
  for(const[sel,key]of HOVER_TIPS){let m=el.closest&&el.closest(sel);
    if(!m)for(const c of document.querySelectorAll(sel)){if(!c.offsetParent&&c.id!=='mini')continue;const r=c.getBoundingClientRect();if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom&&!c.closest('[hidden]')){m=c;break}}
    if(m&&(sel!=='.res .meter:not([id])'||m.querySelector('#hpBar'))&&!(sheetTab&&!m.closest('#sheet')&&document.querySelector('#sheet').contains(el))){hintShow(t(key),x,y);return}}
  const tt=el.closest&&el.closest('[data-tip],[title]');
  if(tt){if(tt.title){tt.dataset.tip=tt.title;tt.removeAttribute('title')}hintShow(tt.dataset.tip,x,y);return}   // title → vlastný popis (rovnaký vzhľad, funguje aj s ovládačom)
  if(el===canvas&&state&&$('#intro').hidden){const now=performance.now();if(now-_wtT>80){_wtT=now;_wtLast=worldTip(x,y)}if(_wtLast){hintShow(_wtLast,x,y);return}}
  hintHide()}
/* popis 3D objektu pod kurzorom */
function worldTip(x,y){toNdc(x,y);const hits=ray.intersectObjects(pickables,false);
  for(const h of hits){const u=h.object.userData;
    if(u.enemy&&enemies.includes(u.enemy)){const e=u.enemy;return `<b>${t('pk.'+e.kind)}</b>${e.passive&&!e.hostile?t('ht.w.pas'):''}<br>${t('ht.w.en',{n:'',h:fmtN(Math.max(0,Math.round(e.hp))),m:fmtN(Math.round(e.max))}).replace(/^ · /,'')}<br><small>${t('ht.w.clickE')}</small>`}
    if(u.ast&&u.ast.alive){const a=u.ast;return `<b>${a.type==='mix'?t('res.mix'):cap1(t('res.'+a.type))}</b> · ${fmtN(Math.round(a.amt))} t<br><small>${t('ht.w.click')}</small>`}
    if(u.station)return t('ht.w.station');if(u.npc)return t(u.npc==='trader'?'ht.w.trader':'ht.w.giver');if(u.gate)return t('ht.w.gate')}
  return null}


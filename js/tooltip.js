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
const tipTarget=e=>{const b=e.target.closest&&e.target.closest('[data-id]');return b&&b.closest('#sheet')&&/^(sel|mark|stSel|stSelInv|chipIn|pickEq|trSel|trSell)$/.test(b.dataset.act||'')?b:null};
document.addEventListener('pointermove',e=>{if(!hoverUI()||e.pointerType!=='mouse'){tipHide();return}const b=tipTarget(e);if(b)tipShow(+b.dataset.id,e.clientX,e.clientY);else tipHide()});
document.addEventListener('pointerdown',()=>tipHide());

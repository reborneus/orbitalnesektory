'use strict';
/* ==================== == 12. VÝBAVA (obrazovka inventára) ====================
   renderGear() vráti HTML obsah menu Výbava: hore detail vybraného predmetu, potom nasadené sloty, potom mriežka inventára.
   gearAct(act, tlačidlo) spracuje kliknutia (volá ho spoločný poslucháč v ui.js); vráti true, ak akciu vybavil.
   Akcie (data-act): sel = vybrať predmet, desel = zavrieť detail, equip/unequip = nasadiť/zložiť,
   enh = vylepšiť +1, salv = rozobrať na kredity, salvJunk = rozobrať všetok Odpad a Bežné, lock = zamknúť/odomknúť. */
let gearSel=null;   // id predmetu, ktorého detail je otvorený (null = žiadny)
let gearPick=null;
/* v0.16.3: hromadné rozoberanie – v režime označovania (gearMark ≠ null) ťuknutie predmet označí/odznačí; gearMark = Set id */
let gearMark=null;  // v0.14.3: slot, pre ktorý je otvorený výber predmetov (klik na prázdny slot)

/* Nájde predmet podľa id v inventári alebo medzi nasadenými. */
function findItem(id){const i=state.inv.findIndex(x=>x.id===id);if(i>=0)return{it:state.inv[i],where:'inv',i};
  for(const s of ALL_SLOTS){const e=state.eq[s];if(e&&e.id===id)return{it:e,where:'eq',slot:s}}return null}
const byRarity=(a,b)=>b.r-a.r||b.ilvl-a.ilvl||b.enh-a.enh||a.b.localeCompare(b.b);
const rc=it=>`style="--rc:${RAR[it.r].col}"`;
/* Súčty vlastností jedného predmetu podľa kľúča (na porovnanie). */
function statSum(it){const o={};if(it)for(const x of itemStats(it))o[x.k]=(o[x.k]||0)+x.v;return o}
function cmpHtml(it,eq){const a=statSum(it),b=statSum(eq);const keys=[...new Set([...Object.keys(a),...Object.keys(b)])];
  const rows=keys.map(k=>{const d=(a[k]||0)-(b[k]||0);if(Math.abs(d)<1e-6)return'';
    return `<li class="${d>0?'up':'down'}"><span>${t('s.'+k)}</span><b>${d>0?'▲':'▼'} ${fmtStat(k,Math.abs(d)).slice(1)}</b></li>`}).join('');
  return rows?`<div class="sec-h"><span>${t('gear.cmp')}</span></div><ul class="stats">${rows}</ul>`:''}

function detailHtml(f){const it=f.it,R=RAR[it.r],title=itemTitle(it),slot=BASES[it.b].slot;const cmp=hoverUI(); // na PC sú vlastnosti v náhľade pri myši
  let h=`<div class="itd it r${it.r}${cmp?' compact':''}" ${rc(it)}>
    <div class="itd-head">${icon(it.b)}<div class="itd-names">${title?`<div class="ttl">«${title}»</div>`:''}<div class="nm">${itemName(it)}</div>
      <div class="meta"><span class="rlab">${t('r.'+R.k)}</span> · ${t('slot.'+slot)} · ${t('gear.ilvl',{n:it.ilvl})}${it.lock?' · '+t('gear.isLocked'):''}</div></div></div>
    ${cmp?'':`<ul class="stats">${itemStats(it).map(x=>`<li class="${x.imp?'imp':''}${x.base?' wbase':''}${qCls(x.q)}"><span>${t('s.'+x.k)}</span><b>${fmtStat(x.k,x.v)}</b></li>`).join('')}</ul>`}`;
  if(!cmp&&f.where==='inv'&&slot!=='chip'&&eqCmpFor(it)&&(state.cmpMode||'both')!=='off')h+=cmpHtml(it,eqCmpFor(it));
  h+=`<div class="itd-acts">`;
  if(slot==='chip')h+=`<p class="note" style="margin:0;flex-basis:100%">${t('gear.chipNote')}</p>`;
  else h+=f.where==='inv'?`<button class="btn prim" data-act="equip">${t('btn.equip')}</button>`:`<button class="btn" data-act="unequip">${t('btn.unequip')}</button>`;
  if(f.where==='inv'&&atStore())h+=`<button class="btn" data-act="toStore">${t('sto.toStore')}</button>`;
  if(f.where==='inv')h+=it.lock?`<button class="btn" data-act="salv" disabled title="${t('gear.locked')}">${t('btn.salv',{n:salvValue(it)})}</button>`:`<button class="btn danger" data-act="salv">${t('btn.salv',{n:salvValue(it)})}</button>`;
  h+=`<button class="btn" data-act="lock">${it.lock?t('btn.unlock'):t('btn.lock')}</button><button class="btn" data-act="desel">${t('btn.back')}</button></div>`;
  // vylepšenie +N
  if(it.enh<enhMax(it)){const c=enhCost(it);
    h+=`<div class="enhrow">${actBtn('enh',t('btn.enh',{n:it.enh+1}),c,false)}<div class="costs">${costHtml(c)}</div><span class="note" style="margin:0">${t('gear.chance',{n:Math.round(enhChance(it)*100)})}</span></div>`}
  else h+=`<p class="note" style="margin:0">${t('gear.maxEnh',{n:enhMax(it)})}</p>`;
  return h+'</div>'}

/* v0.27: ROZLOŽENIE VÝBAVY – loď v strede, okolo nej 6 štvorcov slotov (vľavo laser, motor, trup; vpravo štít, doplnok, zbraň),
   od lode k nim vedú šípky. Klik na predmet v inventári ho rovno nasadí / vymení s tým v lodi (čipy sa nasádzajú do modulov).
   Inšpektor (prilepený dole v okne) ukazuje predmet pod myšou alebo pod výberom ovládača: na ovládači celú kartu s vlastnosťami
   a porovnaním, na PC kompaktne (vlastnosti sú v plávajúcom náhľade) – vždy s akciami: vylepšiť, rozobrať, zamknúť, do skladu, zložiť. */
const LO_POS={laser:[24,20],engine:[24,50],hull:[24,80],shield:[176,20],util:[176,50],weapon:[176,80],laser2:[60,20],shield2:[140,20]};   // laser2/shield2 = sloty navyše (Sokol, Bizón)   // stredy slotov v súradniciach 200×100
function loadoutHtml(){const src=typeof shipPreviewSrc==='function'?shipPreviewSrc(state.shipId):'';
  let svg=`<svg class="lo-svg" viewBox="0 0 200 100" preserveAspectRatio="none"><defs><marker id="loArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>`;
  let boxes='';
  for(const s of shipSlots()){const[x,y]=LO_POS[s],it=state.eq[s],dir=x<100?1:-1;const ex=x+dir*15;   // koniec šípky pri okraji štvorca
    if(!SLOT_EXTRA[s])/* sloty navyše sú hneď pri lodi – bez šípky */svg+=`<path class="lo-ln${it?' on':''}" d="M${100-dir*20} ${50+(y-50)*.25} C ${100-dir*44} ${50+(y-50)*.4}, ${ex+dir*24} ${y}, ${ex} ${y}" ${it?`style="color:${RAR[it.r].col}"`:''} marker-end="url(#loArr)"/>`;
    const pos=`style="left:${x/2}%;top:${y}%${it?`;--rc:${RAR[it.r].col}`:''}"`;
    if(it)boxes+=`<button class="lo-slot it r${it.r}${gearSel===it.id?' sel':''}" ${pos} data-act="sel" data-id="${it.id}">${icon(it.b)}${it.enh?`<span class="enh">+${it.enh}</span>`:''}<span class="il">${it.ilvl}</span><small>${t('slot.'+s)}</small></button>`;
    else{const n=state.inv.filter(q=>BASES[q.b].slot===slotBase(s)).length;
      boxes+=n?`<button class="lo-slot empty pickable${gearPick===s?' open':''}" ${pos} data-act="slotPick" data-slot="${s}"><b>+${n}</b><small>${t('slot.'+s)}</small></button>`:`<div class="lo-slot empty" ${pos}><small>${t('slot.'+s)}</small></div>`}}
  svg+='</svg>';
  return `<div class="loadout">${svg}${src?`<img class="lo-ship" src="${src}" alt="">`:`<div class="lo-ship">${shipIconSvg(state.shipId,'lo-svgship')}</div>`}${boxes}</div>`}
function renderGear(){let h='';
  const junk=state.inv.filter(x=>x.r<=1&&!x.lock).length;
  h+=`<div class="gear-top"><span class="credits"><span class="coin"></span>${fmtN(state.credits)} ¢</span>${junk?`<button class="ghost" data-act="salvJunk">${t('gear.salvJunk',{n:junk})}</button>`:''}</div>`;
  if(gearSel!=null&&!findItem(gearSel))gearSel=null;
  h+=loadoutHtml();
  // výber pre prázdny slot (klik na „+N“)
  if(gearPick&&!state.eq[gearPick]){const fit=state.inv.filter(x=>BASES[x.b].slot===slotBase(gearPick)).sort(byRarity);
    if(fit.length)h+=`<div class="slotpick"><p class="note" style="margin:0">${t('gear.pickH')} (${t('slot.'+gearPick)})</p><div class="inv">${fit.map(x=>`<button class="itm it r${x.r}" ${rc(x)} data-act="pickEq" data-id="${x.id}">${icon(x.b)}${x.enh?`<span class="enh">+${x.enh}</span>`:''}<span class="il">${x.ilvl}</span></button>`).join('')}</div></div>`}
  h+=`<div class="sec-h"><span>${t('gear.inv',{a:state.inv.length,b:INV_MAX})}</span>${state.inv.length?`<button class="ghost sm" data-act="markMode">${gearMark?t('mk.done'):t('mk.start')}</button>`:''}</div>`;
  if(gearMark){const sel=state.inv.filter(x=>gearMark.has(x.id));const val=sel.reduce((a,x)=>a+salvValue(x),0);
    h+=`<div class="markbar"><div class="langs">${[0,1,2,3,4].map(r=>`<button class="langb" data-act="markR" data-r="${r}" style="color:${RAR[r].col}">≤ ${t('r.'+RAR[r].k)}</button>`).join('')}<button class="langb" data-act="markR" data-r="-1">${t('mk.none')}</button></div>
      <button class="btn danger" data-act="markSalv" ${sel.length?'':'disabled'}>${t('mk.salv',{n:sel.length,c:val})}</button><span class="note" style="margin:0">${t('mk.hint')}</span></div>`}
  if(!state.inv.length)h+=`<p class="note">${t('gear.none')}</p>`;
  else h+=`<div class="inv${gearMark?' marking':''}">${state.inv.slice().sort(byRarity).map(it=>{const chip=BASES[it.b].slot==='chip';
    return `<button class="itm it r${it.r}${gearSel===it.id&&!gearMark?' sel':''}${gearMark&&gearMark.has(it.id)?' marked':''}" ${rc(it)} data-act="${gearMark?'mark':chip?'sel':'eqItem'}" data-id="${it.id}">${icon(it.b)}${it.enh?`<span class="enh">+${it.enh}</span>`:''}<span class="il">${it.ilvl}</span>${it.nw&&!gearMark?'<i class="nw"></i>':''}${gearMark&&gearMark.has(it.id)?'<i class="mk">✕</i>':''}${it.lock&&gearMark?'<i class="lk">🔒</i>':''}</button>`}).join('')}</div>`;
  if(!gearMark)h+=`<p class="note">${t('gear.loHint')}</p>`;
  // inšpektor: karta predmetu s akciami (prilepená dole v okne)
  const f=gearSel!=null?findItem(gearSel):null;h+=`<div class="gear-insp" id="gearInsp"${f?'':' hidden'}>${f?detailHtml(f):''}</div>`;
  return h}
/* zobrazí v inšpektore predmet id (pri prejdení myšou alebo výbere ovládačom) bez prekreslenia celého okna */
function gearInspect(id){if(sheetTab!=='gear'||gearMark||id===gearSel)return;const f=findItem(id);if(!f)return;gearSel=id;f.it.nw=false;
  const el=$('#gearInsp');if(!el)return;el.innerHTML=detailHtml(f);el.hidden=false;
  body.querySelectorAll('.inv .itm.sel,.lo-slot.sel').forEach(b=>b.classList.remove('sel'));const b=body.querySelector(`[data-id="${id}"]:not(#gearInsp *)`);if(b)b.classList.add('sel')}
document.addEventListener('pointerover',e=>{if(sheetTab!=='gear')return;const b=e.target.closest&&e.target.closest('#sheet [data-id]');if(b&&!b.closest('#gearInsp')&&/^(sel|eqItem|pickEq)$/.test(b.dataset.act||''))gearInspect(+b.dataset.id)});
function gearAct(act,b){
  const f=gearSel!=null?findItem(gearSel):null;
  const done=()=>{save();renderSheet();updateHUD();return true};
  switch(act){
    case 'sel':{gearSel=null;gearInspect(+b.dataset.id);return true}
    // v0.27: klik na predmet v inventári ho rovno nasadí (vymení s nasadeným v rovnakom slote)
    case 'eqItem':{const i=state.inv.findIndex(x=>x.id===+b.dataset.id);if(i<0)return true;const it=state.inv[i];if(BASES[it.b].slot==='chip')return true;const slot=slotFor(it);
      const old=state.eq[slot];state.inv.splice(i,1);state.eq[slot]=it;if(old)state.inv.push(old);it.nw=false;gearSel=it.id;bonusDirty();toast(t('tt.equipped',{n:itemName(it)}),{rar:it.r});return done()}
    case 'desel':gearSel=null;{const el=$('#gearInsp');if(el)el.hidden=true}return true;
    case 'markMode':gearMark=gearMark?null:new Set();gearSel=null;renderSheet();return true;
    case 'mark':{const id=+b.dataset.id;const it=state.inv.find(x=>x.id===id);if(!it)return true;if(it.lock){toast(t('gear.locked'));return true}
      gearMark.has(id)?gearMark.delete(id):gearMark.add(id);renderSheet();return true}
    case 'markR':{const r=+b.dataset.r;gearMark=new Set(r<0?[]:state.inv.filter(x=>!x.lock&&x.r<=r).map(x=>x.id));renderSheet();return true}
    case 'markSalv':{const sel=state.inv.filter(x=>gearMark&&gearMark.has(x.id)&&!x.lock);if(!sel.length)return true;
      // ak sú medzi označenými Vzácne a lepšie, treba potvrdiť druhým ťuknutím do 3 s
      if(sel.some(x=>x.r>=4)&&(!b.dataset.arm||performance.now()-(+b.dataset.arm)>3000)){b.dataset.arm=performance.now();b.textContent=t('btn.sellSure');return true}
      let c=0;for(const x of sel)c+=salvValue(x);state.inv=state.inv.filter(x=>!gearMark.has(x.id)||x.lock);state.credits+=c;gearMark=new Set();invWarned=false;toast(t('tt.salvMany',{n:sel.length,c}));return done()}
    case 'slotPick':gearPick=gearPick===b.dataset.slot?null:b.dataset.slot;renderSheet();return true;
    case 'pickEq':{const i=state.inv.findIndex(x=>x.id===+b.dataset.id);if(i<0)return true;const it=state.inv[i];if(BASES[it.b].slot==='chip')return true;const slot=gearPick&&slotBase(gearPick)===BASES[it.b].slot?gearPick:slotFor(it);
      const old=state.eq[slot];state.inv.splice(i,1);state.eq[slot]=it;if(old)state.inv.push(old);gearPick=null;bonusDirty();toast(t('tt.equipped',{n:itemName(it)}),{rar:it.r});return done()}
    case 'equip':{if(!f||f.where!=='inv'||BASES[f.it.b].slot==='chip')return true;const slot=slotFor(f.it);const old=state.eq[slot];
      state.inv.splice(f.i,1);state.eq[slot]=f.it;if(old)state.inv.push(old);bonusDirty();toast(t('tt.equipped',{n:itemName(f.it)}),{rar:f.it.r});return done()}
    case 'unequip':{if(!f||f.where!=='eq')return true;if(state.inv.length>=INV_MAX){toast(t('tt.invFull'),'bad');return true}
      state.eq[f.slot]=null;state.inv.push(f.it);bonusDirty();return done()}
    case 'enh':{if(!f)return true;const it=f.it;if(it.enh>=enhMax(it))return true;const c=enhCost(it);if(!afford(c)){toast(t('tt.noRes'));return true}
      pay(c);if(Math.random()<enhChance(it)){it.enh++;addXP(XP.enh*it.enh);toast(t('tt.enhOk',{n:itemName(it)}),{rar:it.r})}else toast(t('tt.enhFail',{n:it.enh}),'bad');
      if(f.where==='eq')bonusDirty();return done()}
    case 'salv':{if(!f||f.where!=='inv'||f.it.lock)return true;
      // vzácne a lepšie predmety treba potvrdiť druhým ťuknutím do 3 s
      if(f.it.r>=4&&(!b.dataset.arm||performance.now()-(+b.dataset.arm)>3000)){b.dataset.arm=performance.now();b.textContent=t('btn.sellSure');return true}
      const c=salvValue(f.it);state.credits+=c;state.inv.splice(f.i,1);gearSel=null;invWarned=false;toast(t('tt.salv',{n:itemName(f.it),c}));return done()}
    case 'salvJunk':{let c=0,n=0;state.inv=state.inv.filter(x=>{if(x.r<=1&&!x.lock){c+=salvValue(x);n++;return false}return true});
      if(gearSel!=null&&!findItem(gearSel))gearSel=null;state.credits+=c;invWarned=false;if(n)toast(t('tt.salvMany',{n,c}));return done()}
    case 'lock':{if(!f)return true;f.it.lock=!f.it.lock;return done()}
    case 'toStore':{if(!f||f.where!=='inv'||!atStore())return true;const S=sstate();if(S.items.length>=S.cap){toast(t('sto.full'),'bad');return true}
      S.items.push(state.inv.splice(f.i,1)[0]);gearSel=null;invWarned=false;toast(t('sto.moved',{n:1}),true);return done()}
  }
  return false}

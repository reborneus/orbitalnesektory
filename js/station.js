'use strict';
/* ==================== == 15. PANEL STANICE ====================
   Otvorí sa ťuknutím na stanicu (alebo tlačidlom Stanica). Na PC sa vysunie zboku, na mobile zdola.
   Hore jadro stanice a jej výdrž, pod tým sloty ako rozbaľovacie karty: náhľad modulu (rovnaký 3D model ako vo vesmíre),
   vylepšenie +0..+10 (rarita modulu stúpa podľa MOD_RAR), vloženie čipu z inventára, nastavenie dronu a predaj.
   renderStation() vráti HTML, stationAct(act, tlačidlo) spracuje kliknutia (volá ho ui.js). */
let openSlot=null;   // index rozbaleného slotu (zostane rozbalený aj po prekreslení)
const thumbImg=(typ,r,cls='mthumb')=>{const src=moduleThumb(typ,r);return src?`<img class="${cls}" src="${src}" alt="">`:`<span class="${cls} noimg">${t('mod.'+typ+'.s')}</span>`};
function fxLines(m){const L=[];const row=(k,v)=>L.push(`<li><span>${t(k)}</span><b>${v}</b></li>`);
  if(m.t==='drone'){const d=droneStats(m);row('fx.rate',nf2(d.rate)+' t/s');row('fx.cap',Math.round(d.cap)+' t');row('fx.speed',nf2(d.speed)+' m/s');
    row('fx.res',RES.filter(r=>d.can[r]).map(r=>t('res.'+r)).join(', '));if(chipCan(m,'def'))row('fx.dmg',nf2(d.dmg));row('fx.inc',`+${nf2(droneIncome(m)*60)} ${t('res.ore')}/min`)}
  if(m.t==='tower'){const w=towerStats(m);row('fx.dmg',nf2(w.dmg));row('fx.frate',nf2(w.rate)+' /s');row('fx.range',nf2(w.range)+' m')}
  if(m.t==='sensor')row('fx.inc',`+${nf2(sensorIncome(m)*60)} ${t('res.green')}/min`);
  row('fx.inf','+'+modInf(m));return `<ul class="stats">${L.join('')}</ul>`}
const nf2=x=>(Math.round(x*10)/10).toString();
/* Vrátené suroviny pri predaji: SELL_BUILD z ceny stavby (posledného kusa daného typu) + SELL_ENH z vylepšení. */
function modRefund(s,m){const c=MOD[m.t].cost(countMod(s,m.t)-1),sp=m.spent||C();
  return C(Math.floor(c.ore*SELL_BUILD+sp.ore*SELL_ENH),Math.floor(c.green*SELL_BUILD+sp.green*SELL_ENH),Math.floor(c.crystal*SELL_BUILD+sp.crystal*SELL_ENH),Math.floor((sp.cr||0)*SELL_ENH))}
function chipHtml(m,i){let h=`<div class="sec-h"><span>${t('chip.h')}</span></div>`;
  if(m.chip){const it=m.chip;h+=`<div class="mchip it r${it.r}" style="--rc:${RAR[it.r].col}">${icon(it.b)}<div class="eqc-txt"><b>${itemName(it)}</b><small>${t('r.'+RAR[it.r].k)} · ${t('gear.ilvl',{n:it.ilvl})}</small>
      <small>${itemStats(it).map(x=>`${t('s.'+x.k)} ${fmtStat(x.k,x.v)}`).join(' · ')}</small></div></div>`;
    h+=`<button class="btn" data-act="chipOut" data-i="${i}">${t('btn.chipOut')}</button>`}
  else{const fit=state.inv.filter(it=>BASES[it.b].mod===m.t).sort(byRarity);
    h+=fit.length?`<p class="note" style="margin:0">${t('chip.pick')}</p><div class="mchips">${fit.map(it=>`<button class="itm it r${it.r}" style="--rc:${RAR[it.r].col}" data-act="chipIn" data-i="${i}" data-id="${it.id}" title="${t('r.'+RAR[it.r].k)} ${t('base.'+it.b)}">${icon(it.b)}${it.enh?`<span class="enh">+${it.enh}</span>`:''}<span class="il">${it.ilvl}</span></button>`).join('')}</div>`:`<p class="note" style="margin:0">${t('chip.none')}</p>`}
  if(m.t==='drone'){ // schopnosti AI jadra podľa rarity
    h+=`<p class="note" style="margin:0">${t('cap.eff',{r:t('r.'+RAR[droneCapR(m)].k)})}</p><ul class="caps">${['green','def','crystal'].map(c=>`<li class="${chipCan(m,c)?'on':''}">${chipCan(m,c)?'✓':'·'} ${t('cap.'+c)} <small>${t('cap.need',{r:t('r.'+RAR[CHIP_CAP[c]].k)})}</small></li>`).join('')}</ul>`}
  return h}
function droneCtl(m,i){const d=droneStats(m);
  return `<div class="mctl"><span>${t('fx.res')}</span><div class="langs">${RES.map(r=>`<button class="langb" data-act="mres" data-i="${i}" data-r="${r}" aria-pressed="${d.res===r}" ${d.can[r]?'':'disabled'}>${t('res.'+r)}</button>`).join('')}</div></div>
    <div class="mctl"><span>${t('fx.mode')}</span><div class="langs"><button class="langb" data-act="mmode" data-i="${i}" data-v="mine" aria-pressed="${!d.def}">${t('mode.mine')}</button><button class="langb" data-act="mmode" data-i="${i}" data-v="def" aria-pressed="${d.def}" ${chipCan(m,'def')?'':'disabled'}>${t('mode.def')}</button></div></div>`}
function slotCard(s,i){const m=s.slots[i];const open=openSlot===i?' open':'';
  if(!m)return `<details class="mslot empty" data-slot="${i}"${open}><summary><span class="mthumb noimg">+</span><span class="eqc-txt"><b>${t('st.emptySlot',{n:i+1})}</b><small>${t('st.buildHere')}</small></span></summary>
    <div class="mbody">${Object.keys(MOD).map(k=>{const c=MOD[k].cost(countMod(s,k));return `<div class="mbuild">${thumbImg(k,1,'mthumb sm')}<div class="eqc-txt"><b>${t('mod.'+k)} <span class="lv">+${MOD[k].inf} ${t('fx.inf').toLowerCase()}</span></b><small class="wrap">${t('mod.'+k+'.d')}</small><div class="costs">${costHtml(c)}</div></div>${actBtn('mbuild',t('btn.build'),c,false,`data-mod="${k}" data-i="${i}"`)}</div>`}).join('')}</div></details>`;
  const R=modRar(m),col=RAR[R].col;
  let h=`<details class="mslot it r${R}" style="--rc:${col}" data-slot="${i}"${open}><summary>${thumbImg(m.t,R)}<span class="eqc-txt"><b>${m.enh?'+'+m.enh+' ':''}${t('mod.'+m.t)}</b><small><span class="rlab">${t('r.'+RAR[R].k)}</span> · ${t('slotN',{n:i+1})} · +${modInf(m)} ${t('fx.inf').toLowerCase()}${m.chip?' · '+t('chip.h'):''}</small></span></summary><div class="mbody">`;
  if(stationDown>0)h+=`<p class="note" style="color:var(--warn);margin:0">${t('sp.down',{s:Math.ceil(stationDown)})}</p>`;
  h+=fxLines(m);
  if(m.enh<MOD_ENH_MAX){const c=modEnhCost(m.enh);const nr=MOD_RAR[m.enh+1];
    h+=`<div class="enhrow">${actBtn('menh',t('btn.menh',{n:m.enh+1}),c,false,`data-i="${i}"`)}<div class="costs">${costHtml(c)}</div>${nr>R?`<span class="note" style="margin:0">${t('menh.rar')} <b style="color:${RAR[nr].col}">${t('r.'+RAR[nr].k)}</b></span>`:''}</div>`}
  else h+=`<p class="note" style="margin:0">${t('menh.max')}</p>`;
  if(m.t==='drone')h+=droneCtl(m,i);
  h+=chipHtml(m,i);
  const rf=modRefund(s,m);h+=`<div class="itd-acts"><button class="btn danger" data-act="msell" data-i="${i}">${t('btn.msell')}</button><div class="costs">${refundHtml(rf)}${rf.cr?`<span class="cost crd gain"><span class="coin"></span>+${rf.cr}</span>`:''}</div></div>`;
  return h+'</div></details>'}
let stTab='mods';   // záložka panela stanice: 'mods' = moduly, 'store' = hlavný sklad (storage.js); misie má zadávateľ misií (npc.js)
function renderStation(){const s=cur();const inf=influence(s),cap=capOf(state.cur);
  if(stTab==='miss')stTab='mods'; // v0.15: misie sú u zadávateľa misií (npc.js)
  let h=`<div class="segs two"><button class="seg" data-act="stTab" data-v="mods" aria-pressed="${stTab==='mods'}">${t('ms.tab.mods')}</button><button class="seg" data-act="stTab" data-v="store" aria-pressed="${stTab==='store'}">${t('sto.tab')}</button></div>`;
  if(stTab==='store')return h+renderStorage();
  if(state.hp<shipVal('hull')-.5)h+=repairCard();
  const L=s.core,mh=stationMaxHp(),sh=Math.max(0,stationHp);
  h+=`<div class="card"><h3>${t('core.name')} <span class="lv">${t('lv',{n:L,m:CORE_MAX})}</span></h3>`;
  if(L<CORE_MAX){const cc=coreCost(L);h+=actBtn('core',t('btn.upgrade'),cc,false)+`<div class="costs">${costHtml(cc)}</div><p>${t('core.next')}</p>`}
  else h+=`<button class="act max" disabled>${t('btn.max')}</button><p>${t('core.max')}</p>`;
  h+=`<div class="stat">${t('core.stat',{s:slotsFor(L),i:L*CORE_INF})}</div>
    <div class="meter" style="grid-column:1/-1"><span class="lbl">${t('sp.hp')}</span><div class="bar"><i style="width:${sh/mh*100}%;background:${stationDown>0?'var(--warn)':'var(--hull)'}"></i></div><span class="num">${fmtN(Math.ceil(sh))}/${fmtN(mh)}</span></div></div>`;
  if(stationDown>0)h+=`<p class="note" style="color:var(--warn)">${t('sp.down',{s:Math.ceil(stationDown)})}</p>`;
  const n=slotsFor(L);
  h+=`<div class="sec-h"><span>${t('mods')}</span><span>${t('slotsOf',{a:s.slots.slice(0,n).filter(Boolean).length,b:n})} · ${t('hud.inf',{a:inf,b:cap})}</span></div><div class="mslots">`;
  for(let i=0;i<n;i++)h+=slotCard(s,i);
  for(let i=n;i<6;i++)h+=`<div class="mslot locked"><span class="mthumb noimg">🔒</span><span class="eqc-txt"><small>${t('st.lockedSlot',{n:i+1,l:i})}</small></span></div>`;
  h+=`</div><p class="note">${s.captured?t('st.noteWon'):state.cur<SECTORS.length-1?t('st.note',{a:inf,b:cap}):t('st.noteLast',{a:inf,b:cap})}</p>`;
  return h}
/* rozbalenie jedného slotu zbalí ostatné (správanie ako akordeón) */
body.addEventListener('toggle',e=>{const d=e.target;if(!d.matches||!d.matches('details.mslot'))return;
  if(d.open){openSlot=+d.dataset.slot;body.querySelectorAll('details.mslot[open]').forEach(x=>{if(x!==d)x.open=false})}else if(openSlot===+d.dataset.slot)openSlot=null},true);
function stationAct(act,b){if(act==='stTab'){stTab=b.dataset.v;renderSheet();return true}if(missionAct(act,b))return true;const s=cur();const i=+b.dataset.i;const m=s.slots[i];
  const done=(msg,kind)=>{rebuildStation();if(msg)toast(msg,kind);changed();return true};
  switch(act){
    case 'mbuild':{const k=b.dataset.mod;if(m||i>=slotsFor(s.core))return true;const c=MOD[k].cost(countMod(s,k));if(!afford(c))return true;
      pay(c);s.slots[i]=newModule(k);addXP(XP.build*(state.cur+1));openSlot=i;return done(t('tt.built',{m:t('mod.'+k)}))}
    case 'menh':{if(!m||m.enh>=MOD_ENH_MAX)return true;const c=modEnhCost(m.enh);if(!afford(c)){toast(t('tt.noRes'));return true}
      pay(c);m.spent=m.spent||C();for(const k of COST_KEYS)m.spent[k]=(m.spent[k]||0)+(c[k]||0);m.enh++;const R=modRar(m);
      return done(t('tt.menh',{m:t('mod.'+m.t),n:m.enh,r:t('r.'+RAR[R].k)}),{rar:R})}
    case 'chipIn':{if(!m)return true;const k=state.inv.findIndex(x=>x.id===+b.dataset.id);if(k<0)return true;const it=state.inv[k];if(BASES[it.b].mod!==m.t)return true;
      state.inv.splice(k,1);if(m.chip)state.inv.push(m.chip);m.chip=it;it.nw=false;return done(t('tt.chipIn',{n:t('base.'+it.b)}),{rar:it.r})}
    case 'chipOut':{if(!m||!m.chip)return true;if(state.inv.length>=INV_MAX){toast(t('tt.invFull'),'bad');return true}
      state.inv.push(m.chip);m.chip=null;if(m.t==='drone'){const d=droneStats(m);if(!d.can[m.res])m.res='ore';if(!chipCan(m,'def'))m.mode='mine'}return done(t('tt.chipOut'))}
    case 'mres':{if(!m)return true;const d=droneStats(m);if(d.can[b.dataset.r])m.res=b.dataset.r;return done()}
    case 'mmode':{if(!m)return true;m.mode=b.dataset.v==='def'&&chipCan(m,'def')?'def':'mine';return done()}
    case 'msell':{if(!m)return true;
      if(!b.dataset.arm||performance.now()-(+b.dataset.arm)>3000){b.dataset.arm=performance.now();b.textContent=t('btn.sellSure');setTimeout(()=>{if(b.isConnected)b.textContent=t('btn.msell')},3000);return true}
      const r=modRefund(s,m);pay(C(-r.ore,-r.green,-r.crystal,-r.cr));
      if(m.chip){if(state.inv.length<INV_MAX)state.inv.push(m.chip);else spawnLoot(m.chip,new V3(0,0,STATION_R+6))}
      s.slots[i]=null;openSlot=null;const parts=[];for(const x of RES)if(r[x])parts.push(t('res.'+x+'.gain',{n:r[x]}));if(r.cr)parts.push(t('res.cr.gain',{n:r.cr}));
      return done(t('tt.sold',{m:t('mod.'+m.t),list:parts.join(', ')}))}
  }
  return false}

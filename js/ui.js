'use strict';
/* ==================== == 9. ROZHRANIE ====================
   updateHUD() obnovuje horný panel a nápovedu (~8× za sekundu); renderSheet() vykresľuje otvorené menu podľa sheetTab. */
/* toast(text, kind): kind true = veľké zlaté, 'bad' = červené, {rar:n} = vo farbe rarity n. */
function toast(msg,kind){if(kind==='bad')sfx('bad');else if(kind===true)sfx('good');const el=document.createElement('div');const rr=kind&&typeof kind==='object'?kind.rar:-1;
  el.className='toast'+(kind===true?' big':typeof kind==='string'?' '+kind:'')+(rr>=0?' rr r'+rr+(rr>=6?' big':''):'');if(rr>=0)el.style.setProperty('--rc',RAR[rr].col);el.textContent=msg;const box=$('#toasts');box.appendChild(el);
  while(box.children.length>3)box.firstChild.remove();setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),400)},kind?4200:2400)}
function bump(sel){const el=$(sel);if(!el)return;const p=el.parentElement;p.classList.remove('pulse');void p.offsetWidth;p.classList.add('pulse')}
let hudT=0,lastHint='';
function say(a){const arr=(L10N[lang].say||L10N.sk.say)[a];const s=inputMode==='pad'?arr[0]:inputMode==='key'?arr[1]:arr[2];const g=G();
  return s.replace('{A}',g.A).replace('{B}',g.B).replace('{Y}',g.Y).replace('{M}',g.M)}
const cap1=s=>s.charAt(0).toUpperCase()+s.slice(1);
function updateHUD(){if(!state)return;const s=cur();const inf=influence(s);const cap=capOf(state.cur);const ptr=inputMode!=='pad'&&inputMode!=='key';
  $('#secName').textContent=secName(state.cur);
  // výdrž stanice: zobrazí sa v sektoroch s pirátmi alebo keď je stanica poškodená
  {const mh=stationMaxHp(),show=!!raidCfg()||stationHp<mh-1;$('#stRow').hidden=!show;if(show){$('#stBar').style.width=(Math.max(0,stationHp)/mh*100)+'%';$('#stBar').className=stationDown>0||stationHp<mh*.3?'low':'';$('#stTxt').textContent=stationDown>0?t('hud.down'):`${fmtN(Math.ceil(Math.max(0,stationHp)))}/${fmtN(mh)}`}}
  missionTracker();
  if(arenaHud()){}else{
  const tag=$('#secTag');tag.textContent=(s.captured?t('hud.won'):t('hud.unc'))+(state.tier?' · V+'+state.tier:'')+(godActive()?' · ADMIN':'');tag.classList.toggle('won',s.captured);
  const ib=$('#infBar');ib.style.width=Math.min(100,inf/cap*100)+'%';ib.classList.toggle('won',s.captured);
  $('#infTxt').textContent=s.captured?t('hud.infwon',{a:inf}):t('hud.inf',{a:inf,b:cap});}
  hudPilot();$('#oreTxt').textContent=fmtN(state.ore);$('#grnTxt').textContent=fmtN(state.green);$('#cryTxt').textContent=fmtN(state.crystal);$('#crTxt').textContent=fmtN(state.credits);
  const capV=shipVal('cargo');$('#cOre').style.width=(state.cargo.ore/capV*100)+'%';$('#cGrn').style.width=(state.cargo.green/capV*100)+'%';$('#cCry').style.width=(state.cargo.crystal/capV*100)+'%';
  const full=cargoTotal()>=capV-.01;
  $('#cargoTxt').textContent=`${fmtN(cargoTotal()+.05)}/${fmtN(capV)}`;$('#cargoRow').classList.toggle('full',full);
  {const rm=shipVal('radShield');$('#rsRow').hidden=rm<=0;if(rm>0){$('#rsBar').style.width=(state.radCharge/rm*100)+'%';$('#rsTxt').textContent=Math.ceil(state.radCharge)+' s'}}
  const smax=shieldMax();$('#shRow').hidden=smax<=0;
  if(smax>0){$('#shBar').style.width=(state.sh/smax*100)+'%';$('#shTxt').textContent=`${fmtN(state.sh)}/${fmtN(smax)}`}
  const hm=shipVal('hull'),hp=Math.max(0,state.hp),hr=hp/hm;const hb=$('#hpBar');hb.style.width=(hr*100)+'%';hb.className=hr<.3?'low':hr<.6?'mid':'';
  $('#hpTxt').textContent=`${fmtN(Math.ceil(hp))}/${fmtN(hm)}`;
  // one status line: the most urgent thing about the ship
  const rr=Math.hypot(ship.position.x,ship.position.z);let st='',sc='status';
  if(!dead&&radProt){st=state.admin&&state.admin.godRad?(lang==='en'?'Radiation immunity (admin)':'Imunita voči radiácii (admin)'):t('st.radProt',{n:Math.ceil(state.radCharge)});sc+=' rad'}
  else if(!dead&&rr>=HORIZON){st=t('st.void',{n:radRate.toFixed(1)});sc+=' bad'}
  else if(!dead&&radRate>0){st=t('st.rad',{z:zoneOf(rr),n:radRate.toFixed(1)});sc+=radHull?' warn':' sh'}
  else if(hp<hm-.01){if(!D().regen){st=t('st.noRegen');sc+=' warn'}else if(hullSince<HULL_DELAY)st=t('st.hullIn',{n:Math.ceil(HULL_DELAY-hullSince)});else{st=t('st.hullOn');sc+=' ok'}}
  else if(smax>0&&state.sh<smax-.01){const g=shipVal('sregen');if(shSince<g.delay)st=t('st.shIn',{n:Math.ceil(g.delay-shSince)});else{st=t('st.shOn');sc+=' sh'}}
  const se=$('#statusTxt');se.textContent=st;se.className=sc;
  $('#hurt').classList.toggle('low',!dead&&hr<.3);
  let h;const g=G();
  if(dead)h=t('h.dead');
  else if(sheetTab&&inputMode==='pad')h=t('h.pad',{A:g.A,B:g.B,LB:g.LB,RB:g.RB});
  else if(rr>=HORIZON)h=t('h.void');
  else if(inArena())h=!arenaRun?t('ar.h.idle',{station:cap1(say('station'))}):arenaRun.phase==='ask'?t('ar.h.ask'):arenaRun.phase==='reward'?t('ar.h.anom'):arenaRun.phase==='count'?t('ar.h.count',{n:arenaRun.wave,s:Math.ceil(arenaRun.t)}):enemies.some(e=>e.invuln)?t('ar.h.mods'):t('ar.h.fight',{n:enemies.length});
  else if(stationDown>0)h=t('h.stDown',{s:Math.ceil(stationDown)});
  else if(raidActive)h=ptr?t('h.raidPtr',{n:enemies.filter(e=>!e.leaving&&!e.wasPassive).length}):t('h.raid',{n:enemies.filter(e=>!e.leaving&&!e.wasPassive).length,mine:say('mine')});
  else if(stationBroken())h=t(full?'h.brokenFull':'h.broken',{home:cap1(say('home'))});
  else if((state.autoPilot||returnSent)&&homeBound()&&cargoTotal()>0)h=t('h.apHome');
  else if(full)h=t('h.full',{home:cap1(say('home'))});
  else if(state.autoPilot&&autoPause>0&&!mining)h=t('h.apPause');
  else if(state.autoPilot&&!dead&&nearStation()&&state.hp<hm*.7&&!mineTarget)h=t('h.apWait');
  else if(huntAuto&&attackTarget&&enemies.includes(attackTarget))h=t('h.hunt',{d:Math.round(ship.position.distanceTo(attackTarget.pos))});
  else if(mining&&mineTarget&&mineTarget.type==='relic')h=t('h.relic');
  else if(mining&&mineTarget)h=(state.autoPilot?'Autopilot · ':'')+t('h.mining',{r:t('res.'+mineTarget.type+'.acc'),a:Math.floor(cargoTotal()+.05),b:Math.round(capV)});
  else if(mineTarget)h=t('h.flying');
  else if(hr<.3)h=D().regen?t('h.lowhp'):t('h.lowhpHard');
  else if(cargoTotal()>0)h=ptr?t('h.cargoPtr'):t('h.cargo',{mine:say('mine'),home:say('home')});
  else if(s.captured&&state.cur<SECTORS.length-1&&!state.sec[state.cur+1].captured)h=t('h.captured',{map:cap1(say('map'))});
  else if(inf<cap&&state.ore>=150)h=t('h.build',{station:cap1(say('station'))});
  else h=ptr?t('h.idlePtr'):t('h.idle',{fly:cap1(say('fly')),mine:say('mine')});
  if(h!==lastHint){lastHint=h;$('#hint').innerHTML=h}}

let sheetTab=null,shipGrp='eng',focusIdx=0,setTab='save';   // setTab = sekcia Nastavení (v0.35)
const sheet=$('#sheet'),body=$('#sheetBody');
const TABS=['station','ship','gear','pilot','map','settings'];
function openSheet(tab){applyMenuAlpha();sheet.dataset.tab=tab;if(sheetTab!==tab)sfx(sheetTab?'click':'open');if(sheetTab!==tab)focusIdx=0;sheetTab=tab;sheet.hidden=false;sheet.classList.toggle('side',tab==='station');renderSheet();document.querySelectorAll('.dock [data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));lastHint=''}
function closeSheet(){if(typeof tipHide==='function')tipHide();if(sheetTab)sfx('close');sheetTab=null;sheet.hidden=true;document.querySelectorAll('.dock [data-tab]').forEach(b=>b.classList.remove('on'));lastHint=''}
function toggleTab(tb){sheetTab===tb?closeSheet():openSheet(tb)}
function cycleTab(d){const i=TABS.indexOf(sheetTab);openSheet(TABS[(i+d+TABS.length)%TABS.length])}
const SHIP_TABS=['hangar',...GROUPS]; // záložky v paneli Loď: hangár + skupiny vylepšení
function cycleGroup(d){shipGrp=SHIP_TABS[(SHIP_TABS.indexOf(shipGrp)+d+SHIP_TABS.length)%SHIP_TABS.length];focusIdx=SHIP_TABS.indexOf(shipGrp);renderSheet()}
/* Cena ako farebné štítky; data-need/data-n slúžia na červené zvýraznenie chýbajúcej suroviny (refreshSheet). */
function costHtml(c){let h='';for(const r of COST_KEYS)if(c[r])h+=`<span class="cost ${r==='cr'?'crd':RCLS[r]}" data-need="${r}" data-n="${c[r]}"><span class="${r==='cr'?'coin':'gem'}"></span>${fmtN(c[r])}</span>`;return h}
/* Predaj modulu vráti 60 % ceny posledného postaveného modulu toho typu. */
function refundOf(s,k){const c=MOD[k].cost(countMod(s,k)-1);return C(Math.floor(c.ore*.6),Math.floor(c.green*.6),Math.floor(c.crystal*.6))}
function refundHtml(c){let h='';for(const r of RES)if(c[r])h+=`<span class="cost ${RCLS[r]} gain"><span class="gem"></span>+${c[r]}</span>`;return h}
function actBtn(act,label,c,block,extra=''){return `<button class="act" data-act="${act}" ${extra} data-ore="${c.ore}" data-green="${c.green}" data-cry="${c.crystal}" data-crd="${c.cr||0}" data-block="${block?1:0}">${label}</button>`}
function langBtns(){return `<div class="langs"><button class="langb" data-act="lang" data-l="sk" aria-pressed="${lang==='sk'}">SK</button><button class="langb" data-act="lang" data-l="en" aria-pressed="${lang==='en'}">EN</button></div>`}
function fmtUp(k,L){const v=upVal(k,L);if(k==='radShield'&&L===0)return t('fmt.none');if(k==='sregen')return t('fmt.sregen',{d:v.delay,r:Math.round(v.rate*100)});if(k==='shield'&&L===0)return t('fmt.none');return UP[k].fmt(v)}
function upCard(k){const u=UP[k];const L=state.ship[k];
  let h=`<div class="card"><h3>${t('up.'+k)} <span class="lv">${t('lv',{n:L,m:u.max})}</span></h3>`;
  if(u.needs&&state.ship[u.needs]<1)return h+`<button class="act max" disabled>${t('btn.locked')}</button><p>${t('up.'+k+'.d')}</p><div class="stat">${t('up.needShield')}</div></div>`;
  if(L<u.max){const c=upCost(k,L);h+=actBtn('ship',(k==='shield'||k==='radShield')&&L===0?t('btn.buy'):t('btn.upgrade'),c,false,`data-k="${k}"`)+`<div class="costs">${costHtml(c)}</div><p>${t('up.'+k+'.d')}</p><div class="stat">${fmtUp(k,L)} → <em>${fmtUp(k,L+1)}</em></div>`}
  else h+=`<button class="act max" disabled>${t('btn.max')}</button><p>${t('up.'+k+'.d')}</p><div class="stat"><em>${fmtUp(k,L)}</em></div>`;
  return h+'</div>'}
function repairCard(){const hm=shipVal('hull');const cost=Math.ceil((hm-state.hp)/REPAIR_PER_ORE);const near=stationOk();
  return `<div class="card"><h3>${t('rep.name')}</h3><button class="act" data-act="repair" data-ore="1" data-green="0" data-cry="0" data-block="${near?0:1}">${t('btn.repair')}</button><div class="costs">${costHtml(C(cost))}</div><p>${near?t('rep.desc'):t('rep.far')}</p><div class="stat">${t('rep.stat',{a:Math.ceil(state.hp),b:hm})}</div></div>`}
/* sheetTab: 'station' | 'ship' | 'map' | 'gate'. Tlačidlá majú data-act (čo urobiť) a ceny v data-ore/data-green/data-cry;
   kliknutia spracúva jeden spoločný poslucháč nižšie (body.addEventListener('click', ...)). */
function renderSheet(){if(!sheetTab||!state)return;const s=cur();let h='';
  if(sheetTab==='station'&&inArena()){$('#sheetTitle').textContent=secName(state.cur);h=renderArena()}
  else if(sheetTab==='station'){$('#sheetTitle').textContent=t('sh.station',{s:secName(state.cur)});h=renderStation()}
  else if(sheetTab==='ship'){$('#sheetTitle').textContent=t('sh.ship',{n:t('ship.'+state.shipId)});
    h+=`<div class="segs six">${SHIP_TABS.map(g=>`<button class="seg" data-act="grp" data-g="${g}" aria-pressed="${g===shipGrp}">${t('grp.'+g)}</button>`).join('')}</div>`;
    if(shipGrp==='hangar')h+=renderHangar();
    for(const k of Object.keys(UP))if(UP[k].grp===shipGrp)h+=upCard(k);
    if(shipGrp==='hull'&&state.hp<shipVal('hull')-.5)h+=repairCard();
    h+=`<p class="note">${t('note.ship',{a:Math.ceil(state.hp),b:shipVal('hull'),regen:D().regen?t('note.easy'):t('note.hard')})}</p>`}
  else if(sheetTab==='missions'){$('#sheetTitle').textContent=t('npc.giver');h=renderMissions()}
  else if(sheetTab==='trader'){$('#sheetTitle').textContent=t('npc.trader');h=renderTrader()}
  else if(sheetTab==='pilot'){$('#sheetTitle').textContent=t('sh.pilot');h=renderPilot()}
  else if(sheetTab==='admin'){$('#sheetTitle').textContent='Admin';h=renderAdmin()}
  else if(sheetTab==='gear'){$('#sheetTitle').textContent=t('sh.gear');h=renderGear()}
  else if(sheetTab==='map'||sheetTab==='gate'){const isGate=sheetTab==='gate';$('#sheetTitle').textContent=isGate?t('sh.gate'):t('sh.map');
    if(isGate)h+=`<p class="note">${t('gate.note')}</p>`;
    SECTORS.forEach((S,i)=>{const sc=state.sec[i];const here=i===state.cur;
      const chip=here?`<span class="chip here">${t('chip.here')}</span>`:S.arena&&sc.unlocked?`<span class="chip won">${t('ar.tag')}</span>`:sc.captured?`<span class="chip won">${t('chip.won')}</span>`:sc.unlocked?`<span class="chip">${t('chip.free')}</span>`:`<span class="chip">${t('chip.locked')}</span>`;
      h+=`<div class="card mapcard${here?' here':''}" style="--thumb:url(${sectorThumb(i)})"><h3>${secName(i)} ${chip}</h3>`;
      if(isGate){if(here)h+=`<button class="act max" disabled>${t('btn.here')}</button>`;
        else if(sc.unlocked)h+=`<button class="act" data-act="jump" data-i="${i}">${t('btn.jump')}</button>`;
        else h+=`<button class="act max" disabled>${t('btn.locked')}</button>`}
      h+=`<span class="gems">${S.res.map(r=>`<span class="gem" style="background:${RCOL[r]}" title="${t('res.'+r)}"></span>`).join('')}</span>`;
      if(S.arena){h+=`<p>${t('sec'+i+'.sub')} ${sc.unlocked?'':t('map.lock',{s:secName(i-1)})}</p><div class="stat">${t('ar.best',{n:astate().best})}</div></div>`;return}
      h+=`<p>${t('sec'+i+'.sub')} ${sc.unlocked?t('map.inf',{a:influence(sc),b:S.capture}):t('map.lock',{s:secName(i-1)})}</p>`;
      const inc=sc.captured?passiveOf(sc):null;
      if(inc&&inc.paused)h+=`<div class="stat" style="color:var(--warn)">${t('map.paused',{a:influence(sc),b:S.capture})}</div>`;
      else if(inc)h+=`<div class="stat">${t('map.income',{o:Math.round(inc.ore*60),g:Math.round(inc.green*60)})}${t('map.cr',{c:Math.round(SECTOR_CREDITS*60)})}</div>`;
      else h+=`<div class="stat">${t('map.reward',{c:S.reward.cr,r:t('r.'+RAR[S.reward.minR].k)})}</div>`;
      h+='</div>'});
    if(!isGate)h+=`<p class="note">${t('map.gateNote')}</p>`}
  else if(sheetTab==='settings'){$('#sheetTitle').textContent=t('sh.settings');
    const onoff=(k,on)=>`<div class="langs"><button class="langb" data-act="opt" data-k="${k}" data-v="1" aria-pressed="${on}">${t('on')}</button><button class="langb" data-act="opt" data-k="${k}" data-v="0" aria-pressed="${!on}">${t('off')}</button></div>`;
    const inMenu=typeof menuOpen==='function'&&menuOpen();   // z hlavného menu len spoločné nastavenia (nie nastavenia uloženej hry)
    // v0.35: nastavenia sú rozdelené do sekcií (záložiek); Uloženie a Hra sú len počas hry
    const TABS=(inMenu?[]:['save','game']).concat(['ctrl','ui','gfx','snd']);if(!TABS.includes(setTab))setTab=TABS[0];
    h+=`<div class="segs settabs" style="grid-template-columns:repeat(${TABS.length},1fr)">${TABS.map(k=>`<button class="seg" data-act="setTab" data-v="${k}" aria-pressed="${setTab===k}">${t('st.'+k)}</button>`).join('')}</div>`;
    if(setTab==='save'){const E=curSlot?slotEntries(curSlot):[],man=E.filter(m=>m.kind==='man').length,au=E.find(m=>m.kind==='auto');
      h+=`<div class="card"><h3>${t('mn.slot',{n:curSlot||'–'})}</h3><div class="langs"><button class="langb" data-act="svSave">${t('sv.save')}</button><button class="langb" data-act="svMenu">${t('sv.menu')}</button></div>
        <p>${t('sv.d',{m:man,M:MAN_N,a:au?fmtWhen(au.ts):'–'})}</p><p class="note" style="margin:0;font-size:11px">${storeInfo()}</p></div>`;
      h+=`<div class="card"><h3>${t('set.quit')}</h3><button class="act" data-act="quit">${t('btn.quit')}</button><p>${t('set.quit.d')}</p></div>`;
      h+=`<p class="note">${t('save.note')} ${t('set.diff',{d:t('diff.'+state.diff)})}</p>`}
    else if(setTab==='game'){
      h+=`<div class="card"><h3>${t('set.ap')}</h3>${onoff('autoPilot',!!state.autoPilot)}<p>${t('set.ap.d',{V:G().V})}</p>
      <div class="gems" style="gap:8px;flex-wrap:wrap"><span class="note" style="margin:0">${t('set.ap.res')}:</span>${RES.map(r=>`<button class="langb" style="border:1px solid var(--line);border-radius:6px;display:inline-flex;gap:6px;align-items:center" data-act="ares" data-r="${r}" aria-pressed="${state.autoRes===r}"><span class="gem" style="background:${RCOL[r]}"></span>${t('res.'+r)}</button>`).join('')}</div>
      ${SECTORS[state.cur].res.includes(state.autoRes)?'':`<div class="stat" style="color:var(--warn)">${t('set.ap.miss',{r:t('res.'+state.autoRes)})}</div>`}</div>`;
      h+=`<div class="card"><h3>${t('set.ret')}</h3>${onoff('autoReturn',state.autoReturn!==false)}<p>${t('set.ret.d')}</p></div>`;
      h+=`<div class="card"><h3>${t('set.auto')}</h3>${onoff('autoMine',state.autoMine!==false)}<p>${t('set.auto.d')}</p></div>`;
      {const L=lfRules();let ns=0,nc=0;   // v0.46/v0.48: loot filter – pre každú raritu: nechať / predať / podmienka (zlaté a červené vlastnosti)
        const rows=RAR.map((R,i)=>{const r=L[i]||{m:'keep',g:1,r:1,a:false};if(r.m==='sell')ns++;if(r.m==='cond')nc++;
          const seg=['keep','sell','cond'].map(m=>`<button class="langb" data-act="lfM" data-r="${i}" data-v="${m}" aria-pressed="${r.m===m}">${t('lf.m.'+m)}</button>`).join('');
          const num=(k,v,cl)=>`<span class="lfn ${cl}">${t('lf.'+k)} ≥ <button class="langb" data-act="lfN" data-r="${i}" data-k="${k}" data-d="-1" aria-label="−">−</button><b>${v||'–'}</b><button class="langb" data-act="lfN" data-r="${i}" data-k="${k}" data-d="1" aria-label="+">+</button></span>`;
          return `<div class="lfr${r.m==='sell'?' off':''}"><b style="color:${R.col}">${t('r.'+R.k)}</b><div class="langs">${seg}</div>${r.m==='cond'?`<div class="lfc"><span>${t('lf.keepIf')}</span>${num('g',r.g,'g')}${num('r',r.r,'r')}<button class="langb" data-act="lfA" data-r="${i}" aria-pressed="${!!r.a}">${r.a?'✓ ':''}${t('lf.a')}</button></div>`:''}</div>`}).join('');
        h+=`<div class="card lfcard"><h3>${t('lf.h')}</h3><p>${t('lf.d')}</p><div class="lfrows">${rows}</div><div class="stat">${ns||nc?t('lf.on2',{n:ns,c:nc}):t('lf.off')}</div></div>`}
      h+=`<div class="card"><h3>${t('set.hunt')}</h3>${onoff('autoHunt',!!state.autoHunt)}<p>${t('set.hunt.d')}</p>
        <div class="subopt"><span>${t('set.hunt.pas')}</span>${onoff('huntPassive',!!state.huntPassive)}</div><div class="subopt"><span>${t('set.hunt.void')}</span>${onoff('huntVoid',!!state.huntVoid)}</div><p>${t('set.hunt.void.d')}</p></div>`;
      h+=`<div class="card"><h3>${t('up.radShield')}</h3><div class="langs"><button class="langb" data-act="radMode" data-v="auto" aria-pressed="${state.radMode!=='void'}">${t('rs.auto')}</button><button class="langb" data-act="radMode" data-v="void" aria-pressed="${state.radMode==='void'}">${t('rs.void')}</button></div><p>${t('rs.d')}</p></div>`}
    else if(setTab==='ctrl'){
      h+=`<div class="card"><h3>${t('set.hold')}</h3>${onoff('holdFollow',state.holdFollow!==false)}<p>${t('set.hold.d')}</p></div>`;
      h+=`<div class="card"><h3>${t('set.pm')}</h3><div class="langs">${['on','off'].map(v=>`<button class="langb" data-act="padMouse" data-v="${v}" aria-pressed="${padMouseOn()===(v==='on')}">${t(v)}</button>`).join('')}</div><p>${t('set.pm.d')}</p></div>`}
    else if(setTab==='ui'){
      h+=`<div class="card"><h3>${t('set.lang')}</h3>${langBtns()}</div>`;
      h+=hudModeCard();
      if(canHover&&!inMenu)h+=`<div class="card"><h3>${t('set.hud')}</h3><button class="act" data-act="hudEdit">${t('set.hud.b')}</button><p>${t('set.hud.d')}</p></div>`;   // len PC
      h+=`<div class="card"><h3>${t('set.ma')}</h3><div class="rangerow"><input type="range" id="menuAlpha" min="35" max="100" step="5" value="${menuA()}"><b id="menuAlphaV">${menuA()} %</b></div><p>${t('set.ma.d')}</p></div>`;
      h+=`<div class="card"><h3>${t('set.cmp')}</h3><div class="langs">${CMP_MODES.map(m=>`<button class="langb" data-act="cmpMode" data-v="${m}" aria-pressed="${cmpMode()===m}">${t('cmp.'+m)}</button>`).join('')}</div><p>${t('set.cmp.d')}</p></div>`}
    else if(setTab==='gfx')h+=gfxCard();
    else if(setTab==='snd')h+=soundCard();
    if(inMenu)h+=`<p class="note">${t('sv.noteMenu')}</p>`}
  body.innerHTML=h;refreshSheet();applyFocus()}
function refreshSheet(){if(!sheetTab)return;
  body.querySelectorAll('[data-need]').forEach(el=>el.classList.toggle('lack',amt(el.dataset.need)<+el.dataset.n));
  body.querySelectorAll('.act[data-ore]').forEach(b=>{b.disabled=b.dataset.block==='1'||state.ore<+b.dataset.ore||state.green<+b.dataset.green||state.crystal<+b.dataset.cry||state.credits<+(b.dataset.crd||0)})}
function focusables(){return[...body.querySelectorAll('.seg,.act,.langb:not(:disabled),.ghost,.btn,button.lo-slot,.itm,.eqc,summary,.trsq:not(:disabled)')].filter(e=>{const d=e.closest('details');return e.getClientRects().length&&(!d||d.open||e.parentElement===d)})}   // v0.39.3: len viditeľné (nie v zbalenom slote – zbalený obsah má v novom Chrome stále rozmery)   // v0.39.1: aj nasadené predmety na lodi (výbava)
function applyFocus(){body.querySelectorAll('.pad-focus,.pad-focus-in').forEach(el=>el.classList.remove('pad-focus','pad-focus-in'));if(inputMode!=='pad'||!sheetTab)return;
  const f=focusables();if(!f.length)return;focusIdx=clamp(focusIdx,0,f.length-1);const el=f[focusIdx];
  // v0.39.2: zvýrazní sa vždy samotný prvok (tlačidlo); jeho karta / slot dostane len jemný rámik, aby bolo vidieť, v ktorej časti si
  el.classList.add('pad-focus');const box=el.closest('.card,.mslot,.mbuild');if(box&&box!==el)box.classList.add('pad-focus-in');
  (box&&box!==el&&box.offsetHeight<body.clientHeight*.8?box:el).scrollIntoView({block:'nearest',behavior:'smooth'});
  if(sheetTab==='gear'&&el.dataset.id&&!el.closest('#gearInsp')&&typeof gearInspect==='function')gearInspect(+el.dataset.id)}   // v0.27
function moveFocus(v){focusIdx+=v;applyFocus()}
/* v0.17: priestorový pohyb výberu (krížový ovládač) – vyberie najbližší prvok v danom smere podľa polohy na obrazovke,
   takže sa dá ísť napr. priamo doprava/doľava medzi kartami lodí bez prechádzania celého zoznamu. */
function moveFocusDir(dx,dy){const f=focusables(),cur=f[focusIdx];if(!cur||!cur.getClientRects().length){focusIdx=0;applyFocus();return}
  const a=cur.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2;let best=-1,bs=1e9;
  f.forEach((el,i)=>{if(i===focusIdx)return;const r=el.getBoundingClientRect();if(!r.width||!r.height)return;
    const cx=r.left+r.width/2,cy=r.top+r.height/2;
    const prim=dx?(cx-ax)*dx:(cy-ay)*dy;if(prim<=4)return;   // musí ležať v smere pohybu
    const ov=dx?Math.max(0,Math.min(a.bottom,r.bottom)-Math.max(a.top,r.top)):Math.max(0,Math.min(a.right,r.right)-Math.max(a.left,r.left));
    const perp=ov>0?0:dx?Math.abs(cy-ay):Math.abs(cx-ax);if(dx&&!ov&&perp>Math.max(a.height,r.height))return;   // doľava/doprava len v rovnakom riadku
    const sc=prim+perp*3;if(sc<bs){bs=sc;best=i}});
  if(best>=0){focusIdx=best;applyFocus()}else if(dy)moveFocus(dy)}
function activateFocus(){const el=focusables()[focusIdx];if(!el)return;if(!el.disabled){el.click();return}
  if(el.dataset.act==='repair')toast(t('rep.far'));else if(el.dataset.block==='1')toast(t('tt.noSlot'));else if(el.dataset.ore)toast(t('tt.noRes'))}
let resetArm=0;
body.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  const act=b.dataset.act;if(!act||b.disabled)return;const s=cur();
  if(act==='setTab'){setTab=b.dataset.v;focusIdx=0;renderSheet();return}
  if(gfxAct(act,b))return;
  if(act==='sndTest'){sndTest();return}
  if(act==='sndSp'){state.snd=Object.assign(sndCfg(),{sp:b.dataset.v==='1'?1:0});save();renderSheet();return}
  if(act==='svSave'){manualSave();renderSheet();return}
  if(act==='svMenu'){toMenu();return}
  if(adminAct(act,b))return; // admin panel (admin.js)
  if(gearAct(act,b))return; // akcie obrazovky Výbava (gear.js)
  if(storageAct(act,b))return; // hlavný sklad (storage.js)
  if(pilotAct(act,b))return; // schopnosti pilota (pilot.js)
  if(arenaAct(act,b))return; // aréna (arena.js)
  if(tierAct(act,b))return; // úroveň výzvy (tier.js)
  if(traderAct(act,b))return; // obchodník (npc.js)
  if(act==='hudEdit'){closeSheet();hudEdit(true);return}
  if(act==='padMouse'){setPadMouse(b.dataset.v==='on');return}
  if(act==='cmpMode'){state.cmpMode=b.dataset.v;save();renderSheet();return}
  if(act==='grp'){shipGrp=b.dataset.g;focusIdx=SHIP_TABS.indexOf(shipGrp);renderSheet();return}
  if(act==='lang'){setLang(b.dataset.l);return}
  if(act==='opt'){const k=b.dataset.k,v=b.dataset.v==='1';if(k==='autoPilot'){if(!!state.autoPilot!==v)toggleAutopilot();return}state[k]=v;save();renderSheet();return}
  if(act==='lfM'||act==='lfN'||act==='lfA'){const L=lfRules(),i=+b.dataset.r,r=L[i]||(L[i]={m:'keep',g:1,r:1,a:false});
    if(act==='lfM')r.m=b.dataset.v;else if(act==='lfN'){const k=b.dataset.k;r[k]=clamp((r[k]||0)+(+b.dataset.d),0,7)}else r.a=!r.a;
    state.lootFilter=null;save();renderSheet();return}
  if(act==='ares'){state.autoRes=b.dataset.r;save();renderSheet();if(state.autoPilot)toast(t('tt.apOn',{r:t('res.'+state.autoRes)}));return}
  if(act==='repair'){if(!stationOk()){toast(t('rep.far'));return}const hm=shipVal('hull');const need=Math.ceil((hm-state.hp)/REPAIR_PER_ORE);const n=Math.min(need,Math.floor(state.ore));
    if(n<=0)return;state.ore-=n;const before=state.hp;state.hp=Math.min(hm,state.hp+n*REPAIR_PER_ORE);toast(t('tt.repaired',{n:Math.round(state.hp-before)}));changed();return}
  if(stationAct(act,b))return; // akcie panela stanice (station.js)
  if(hangarAct(act,b))return;
  if(escortAct(act,b))return; // pomocné drony (escort.js) // hangár (hangar.js)
  if(act==='quit'){quitGame();return}
  if(act==='hudc'||act==='huda'){hudModeAct(act,b);return}
  if(act==='radMode'){state.radMode=b.dataset.v;save();renderSheet();return}
  if(act==='core'){const c=coreCost(s.core);if(s.core<CORE_MAX&&afford(c)){pay(c);s.core++;rebuildStation();toast(t('tt.coreUp',{n:s.core}));changed()}}
  else if(act==='ship'){const k=b.dataset.k;const u=UP[k];const L=state.ship[k];const c=upCost(k,L);if(L<u.max&&afford(c)){pay(c);
      if(k==='radShield'){state.ship[k]++;state.radCharge=shipVal('radShield');toast(L===0?t('tt.rsOn'):t('tt.upg',{m:t('up.'+k),n:state.ship[k]}))}
      else if(k==='shield'){const before=shieldMax();state.ship[k]++;state.sh=Math.min(shieldMax(),state.sh+(shieldMax()-before));if(L===0){state.sh=shieldMax();toast(t('tt.shieldOn'))}else toast(t('tt.upg',{m:t('up.'+k),n:state.ship[k]}))}
      else{state.ship[k]++;if(k==='hull')state.hp+=40*NUM;toast(t('tt.upg',{m:t('up.'+k),n:state.ship[k]}))}
      changed()}}
  else if(act==='jump'){if(!gate||ship.position.distanceTo(gate.position)>18*GATE_K){toast(t('gate.far'));return}closeSheet();jumpTo(+b.dataset.i)}});
function changed(){checkCapture();save();renderSheet();updateHUD()}
/* Obsadenie sektora: odomkne ďalší, vyplatí kredity a dá predmet (aspoň rarity reward.minR) priamo do inventára. */
function checkCapture(){const s=cur();if(SECTORS[state.cur].arena)return;if(!s.captured&&influence(s)>=capOf(state.cur)){s.captured=true;
  if(!s.rewarded){const R=SECTORS[state.cur].reward;s.rewarded=true;state.credits+=Math.round(R.cr*crMul());xpAt(XP.capture);const it=dropItem('capture',4,R.minR);
    if(state.inv.length<INV_MAX)state.inv.push(it);else spawnLoot(it,new V3(0,0,STATION_R+6));setTimeout(()=>toast(t('tt.reward',{c:R.cr}),{rar:it.r}),1200)}const nx=state.sec[state.cur+1];if(nx)nx.unlocked=true;rebuildStation();updateGate();
  if(nx)toast(t('tt.captured',{s:secName(state.cur),n:secName(state.cur+1)}),true);
  else if(state.sec.every(x=>x.captured))toast(t('tt.capturedAll'),true);
  else toast(t('tt.capturedOne',{s:secName(state.cur)}),true)}}
/* Pasívny príjem obsadeného sektora za sekundu: každý dok dronov 0,7 rudy, každé senzorové pole 0,06 viriditu, k tomu SECTOR_CREDITS kreditov (v main.js). */
/* Ak vplyv obsadeného sektora klesne pod hranicu (napr. po predaji modulov), sektor zostane prístupný, ale príjem sa pozastaví (paused). */
function passiveOf(sc){const paused=influence(sc)<SECTORS[state.sec.indexOf(sc)].capture;let ore=0,green=0;
  if(!paused)for(const m of sc.slots){if(!m)continue;if(m.t==='drone')ore+=droneIncome(m);if(m.t==='sensor')green+=sensorIncome(m)}
  return{ore,green,paused}}
/* Ukončenie hry: uloží a skúsi zavrieť okno (funguje v okne spusteného spúšťačom); inak ukáže, že je možné okno zavrieť. */
/* v0.31.1: ručné uloženie + zavretie okna; kde sa okno zavrieť nedá (telefón, aplikácia na ploche, bežná karta), hra prejde do hlavného menu. */
/* v0.31.3: okno sa zatvára len v hre spustenej zo spúšťača (súbor z disku na PC). Na webe a v aplikácii z plochy
   window.close() buď nefunguje, alebo prehliadač zatvorí kartu a ukáže predchádzajúcu stránku (napr. GitHub),
   preto tam hra po uložení vždy prejde do hlavného menu. */
function quitGame(){const ok=manualSave();if(!ok)return;
  if(location.protocol==='file:'&&!isTouch){try{window.close()}catch(e){}setTimeout(()=>{if(!window.closed)toMenu()},350)}else toMenu()}

let jumping=false;
/* Skok do sektora i: krátky záblesk, potom sa sektor postaví nanovo a loď sa objaví pri stanici. */
function jumpTo(i,instant,stay){if(jumping)return;   /* stay = znovunačítanie sektora (napr. zmena výzvy): loď ostane pri stanici */
  jumping=true;if(!instant)sfx('warp');const w=$('#warp');w.classList.add('on');
  mining=false;mineTarget=null;moveTarget=null;hideBeam(beam);
  if(!instant)collectAllLoot();
  setTimeout(()=>{try{state.cur=i;mining=false;mineTarget=null;moveTarget=null;openOnArrive=false;stationG=null;gateNear=true;
    ship.position.set(0,0,STATION_R+8);shipVel.set(0,0,0);shipYaw=0;lastZone=1;buildSector();
    // v0.26: po skoku sa loď objaví pri bráne (nos smerom k stanici), nie v strede pri stanici
    if(gate&&!SECTORS[i].arena&&!stay){const d=gate.position.clone().setY(0);const L=d.length()||1;ship.position.copy(d).addScaledVector(d,-15*GATE_K/L);shipYaw=Math.atan2(-d.x,-d.z);ship.rotation.y=shipYaw;lastZone=zoneOf(ship.position.length())}
    camTarget.copy(ship.position);save();updateHUD();
    if(!instant&&!stay)toast(t('tt.jumped',{s:secName(i)}))}catch(e){console.error(e)}finally{w.classList.remove('on');jumping=false}},instant?50:480)}

/* language */
/* posledná prehratá Nightmare hra (uložená pri zničení lode) */
function nmRecord(){let r=null;try{r=JSON.parse(localStorage.getItem(SAVE_KEY+'-nm')||'null')}catch(e){}
  return r?`<p class="note nmrec">${t('in.nmRec',{s:secName(r.sec),c:r.cap,cr:r.cr})}</p>`:''}
function setLang(l){lang=l;if(state)state.lang=l;try{localStorage.setItem('os-lang',l)}catch(e){}applyLang();if(state)save()}
function applyLang(){document.documentElement.lang=lang;document.querySelectorAll('[data-t]').forEach(el=>el.textContent=t(el.dataset.t));
  document.querySelectorAll('.dock button').forEach(b=>{const l=b.querySelector('[data-t]');const txt=l?t(l.dataset.t):'Wiki';b.setAttribute('aria-label',txt);b.title=txt});
  mini.setAttribute('aria-label',t('mini'));if(!$('#intro').hidden)renderIntro();renderSheet();lastHint='';updateHUD()}
/* v0.30: úvodná obrazovka, nová hra a výber obtiažnosti sú v js/menu.js (hlavné menu) */

document.querySelectorAll('.dock [data-tab]').forEach(b=>b.addEventListener('click',()=>toggleTab(b.dataset.tab)));
$('#sheetClose').addEventListener('click',closeSheet);
$('#homeBtn').addEventListener('click',goHome);
$('#pilotBtn').addEventListener('click',()=>toggleTab('pilot'));
$('#wikiBtn').addEventListener('click',()=>openWiki());

/* v0.23: nepriehľadnosť menu (Nastavenia → posuvník); ukladá sa do state.menuAlpha (35–100 %) */
/* v0.32: predvolená nepriehľadnosť pri prvom spustení je 50 % (kým ju hráč nezmení) */
const menuA=()=>state&&state.menuAlpha!=null?state.menuAlpha:50;
function applyMenuAlpha(){document.documentElement.style.setProperty('--menu-a',menuA()/100)}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='menuAlpha'){state.menuAlpha=+e.target.value;applyMenuAlpha();const v=$('#menuAlphaV');if(v)v.textContent=state.menuAlpha+' %';save()}});

/* ==================== v0.25: VEĽKOSŤ MINIMAPY ====================
   Tlačidlá − / + pri minimape, koliesko myši nad minimapou, R3 na ovládači (dookola). state.miniSize = index v MINI_SIZES. */
const MINI_SIZES=[110,150,200,260,330];
function applyMini(){const i=state&&state.miniSize;const m=$('#mini');if(!m)return;
  const k=typeof hudCompactOn==='function'&&hudCompactOn()?.62:1;   // v0.29: kompaktný HUD zmenší minimapu na ~60 %
  if(i==null&&k===1){m.style.width=m.style.height=''}else{const s=Math.round(MINI_SIZES[i==null?1:i]*k)+'px';m.style.width=m.style.height=s}
  if(typeof sizeMini==='function')sizeMini();clampHud()}
function miniZoom(d,wrap){if(!state)return;let i=state.miniSize==null?1:state.miniSize;i+=d;if(wrap)i=(i+MINI_SIZES.length)%MINI_SIZES.length;else i=clamp(i,0,MINI_SIZES.length-1);state.miniSize=i;applyMini();save()}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.minictl button');if(!b)return;e.stopPropagation();miniZoom(+b.dataset.mz)},true);
$('#mini').addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();miniZoom(e.deltaY<0?1:-1)},{passive:false});

/* ==================== v0.25: ROZLOŽENIE HUD (PC) ====================
   Nastavenia → Rozloženie HUD → Upraviť: panely HUD_MOVE sa dajú ťahať myšou; po „Hotovo“ sa polohy uložia do state.hudPos
   (px od ľavého horného rohu). Presunutý panel má position:fixed; pri zmene veľkosti okna sa posunie späť do obrazovky. */
const HUD_MOVE={sector:'.hud-top .sector',res:'.hud-top .res',mini:'#miniWrap',dock:'.dock'};
let hudEditing=false,hudBar=null;
function hudEl(k){return document.querySelector(HUD_MOVE[k])}
function placeHud(k,x,y){const el=hudEl(k);if(!el)return;const r=el.getBoundingClientRect();
  if(!el.style.width&&k!=='mini')el.style.width=r.width+'px';
  el.style.position='fixed';el.style.margin='0';el.style.zIndex='6';el.style.left=clamp(x,0,innerWidth-Math.min(r.width,innerWidth))+'px';el.style.top=clamp(y,0,innerHeight-Math.min(r.height,innerHeight))+'px';el.style.right='auto';el.style.bottom='auto'}
function applyHud(){if(!state||!state.hudPos)return;for(const k in state.hudPos){const p=state.hudPos[k];placeHud(k,p.x,p.y)}}
function clampHud(){if(!state||!state.hudPos)return;for(const k in state.hudPos){const el=hudEl(k);if(el&&el.style.position==='fixed')placeHud(k,parseFloat(el.style.left),parseFloat(el.style.top))}}
function resetHud(){for(const k in HUD_MOVE){const el=hudEl(k);if(!el)continue;for(const p of['position','margin','zIndex','left','top','right','bottom','width'])el.style[p]=''}if(state)delete state.hudPos;save()}
function hudEdit(on){hudEditing=on;document.body.classList.toggle('hudedit',on);
  // najprv zmerať všetky panely, potom ich naraz pripnúť (inak by sa ostatné po vybratí jedného z toku posunuli)
  if(on){const R={};for(const k in HUD_MOVE){const el=hudEl(k);if(el){const r=el.getBoundingClientRect();R[k]=[r.left,r.top,r.width]}}
    for(const k in R){const el=hudEl(k);if(!el.style.width&&k!=='mini')el.style.width=R[k][2]+'px'}for(const k in R)placeHud(k,R[k][0],R[k][1])
    if(!hudBar){hudBar=document.createElement('div');hudBar.id='hudBar';document.body.appendChild(hudBar);
      hudBar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.h==='reset'){resetHud();hudEdit(true)}else hudEdit(false)})}
    hudBar.innerHTML=`<span>${t('hud.edit')}</span><button class="act" data-h="reset">${t('hud.reset')}</button><button class="act" data-h="done">${t('hud.done')}</button>`;hudBar.hidden=false}
  else{if(hudBar)hudBar.hidden=true;state.hudPos={};for(const k in HUD_MOVE){const el=hudEl(k);if(el&&el.style.position==='fixed')state.hudPos[k]={x:parseFloat(el.style.left),y:parseFloat(el.style.top)}}save()}}
// ťahanie panelov v režime úprav (zachytí udalosti skôr, než sa dostanú k hre alebo tlačidlám)
{let drag=null;
  document.addEventListener('pointerdown',e=>{if(!hudEditing)return;for(const k in HUD_MOVE){const el=hudEl(k);if(el&&el.contains(e.target)){e.preventDefault();e.stopPropagation();const r=el.getBoundingClientRect();drag={k,dx:e.clientX-r.left,dy:e.clientY-r.top};return}}},true);
  document.addEventListener('pointermove',e=>{if(drag){placeHud(drag.k,e.clientX-drag.dx,e.clientY-drag.dy)}},true);
  document.addEventListener('pointerup',()=>{drag=null},true);
  document.addEventListener('click',e=>{if(hudEditing&&!(hudBar&&hudBar.contains(e.target))){e.preventDefault();e.stopPropagation()}},true)}
addEventListener('resize',()=>clampHud());

'use strict';
/* ==================== == 9. ROZHRANIE ====================
   updateHUD() obnovuje horný panel a nápovedu (~8× za sekundu); renderSheet() vykresľuje otvorené menu podľa sheetTab. */
/* toast(text, kind): kind true = veľké zlaté, 'bad' = červené, {rar:n} = vo farbe rarity n. */
function toast(msg,kind){const el=document.createElement('div');const rr=kind&&typeof kind==='object'?kind.rar:-1;
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
  {const mh=stationMaxHp(),show=!!raidCfg()||stationHp<mh-1;$('#stRow').hidden=!show;if(show){$('#stBar').style.width=(Math.max(0,stationHp)/mh*100)+'%';$('#stBar').className=stationDown>0||stationHp<mh*.3?'low':'';$('#stTxt').textContent=stationDown>0?t('hud.down'):`${Math.ceil(Math.max(0,stationHp))}/${mh}`}}
  missionTracker();
  const tag=$('#secTag');tag.textContent=s.captured?t('hud.won'):t('hud.unc');tag.classList.toggle('won',s.captured);
  const ib=$('#infBar');ib.style.width=Math.min(100,inf/cap*100)+'%';ib.classList.toggle('won',s.captured);
  $('#infTxt').textContent=s.captured?t('hud.infwon',{a:inf}):t('hud.inf',{a:inf,b:cap});
  $('#oreTxt').textContent=Math.floor(state.ore);$('#grnTxt').textContent=Math.floor(state.green);$('#cryTxt').textContent=Math.floor(state.crystal);$('#crTxt').textContent=Math.floor(state.credits);
  const capV=shipVal('cargo');$('#cOre').style.width=(state.cargo.ore/capV*100)+'%';$('#cGrn').style.width=(state.cargo.green/capV*100)+'%';$('#cCry').style.width=(state.cargo.crystal/capV*100)+'%';
  const full=cargoTotal()>=capV-.01;
  $('#cargoTxt').textContent=`${Math.floor(cargoTotal()+.05)}/${Math.round(capV)}`;$('#cargoRow').classList.toggle('full',full);
  {const rm=shipVal('radShield');$('#rsRow').hidden=rm<=0;if(rm>0){$('#rsBar').style.width=(state.radCharge/rm*100)+'%';$('#rsTxt').textContent=Math.ceil(state.radCharge)+' s'}}
  const smax=shieldMax();$('#shRow').hidden=smax<=0;
  if(smax>0){$('#shBar').style.width=(state.sh/smax*100)+'%';$('#shTxt').textContent=`${Math.floor(state.sh)}/${smax}`}
  const hm=shipVal('hull'),hp=Math.max(0,state.hp),hr=hp/hm;const hb=$('#hpBar');hb.style.width=(hr*100)+'%';hb.className=hr<.3?'low':hr<.6?'mid':'';
  $('#hpTxt').textContent=`${Math.ceil(hp)}/${hm}`;
  // one status line: the most urgent thing about the ship
  const rr=Math.hypot(ship.position.x,ship.position.z);let st='',sc='status';
  if(!dead&&radProt){st=t('st.radProt',{n:Math.ceil(state.radCharge)});sc+=' rad'}
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
  else if(stationDown>0)h=t('h.stDown',{s:Math.ceil(stationDown)});
  else if(raidActive)h=ptr?t('h.raidPtr',{n:enemies.filter(e=>!e.leaving).length}):t('h.raid',{n:enemies.filter(e=>!e.leaving).length,mine:say('mine')});
  else if((state.autoPilot||returnSent)&&homeBound()&&cargoTotal()>0)h=t('h.apHome');
  else if(full)h=t('h.full',{home:cap1(say('home'))});
  else if(state.autoPilot&&autoPause>0&&!mining)h=t('h.apPause');
  else if(state.autoPilot&&!dead&&nearStation()&&state.hp<hm*.7&&!mineTarget)h=t('h.apWait');
  else if(mining&&mineTarget&&mineTarget.type==='relic')h=t('h.relic');
  else if(mining&&mineTarget)h=(state.autoPilot?'Autopilot · ':'')+t('h.mining',{r:t('res.'+mineTarget.type+'.acc'),a:Math.floor(cargoTotal()+.05),b:Math.round(capV)});
  else if(mineTarget)h=t('h.flying');
  else if(hr<.3)h=D().regen?t('h.lowhp'):t('h.lowhpHard');
  else if(cargoTotal()>0)h=ptr?t('h.cargoPtr'):t('h.cargo',{mine:say('mine'),home:say('home')});
  else if(s.captured&&state.cur<SECTORS.length-1&&!state.sec[state.cur+1].captured)h=t('h.captured',{map:cap1(say('map'))});
  else if(inf<cap&&state.ore>=150)h=t('h.build',{station:cap1(say('station'))});
  else h=ptr?t('h.idlePtr'):t('h.idle',{fly:cap1(say('fly')),mine:say('mine')});
  if(h!==lastHint){lastHint=h;$('#hint').innerHTML=h}}

let sheetTab=null,shipGrp='eng',focusIdx=0;
const sheet=$('#sheet'),body=$('#sheetBody');
const TABS=['station','ship','gear','map','settings'];
function openSheet(tab){if(sheetTab!==tab)focusIdx=0;sheetTab=tab;sheet.hidden=false;sheet.classList.toggle('side',tab==='station');renderSheet();document.querySelectorAll('.dock [data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));lastHint=''}
function closeSheet(){sheetTab=null;sheet.hidden=true;document.querySelectorAll('.dock [data-tab]').forEach(b=>b.classList.remove('on'));lastHint=''}
function toggleTab(tb){sheetTab===tb?closeSheet():openSheet(tb)}
function cycleTab(d){const i=TABS.indexOf(sheetTab);openSheet(TABS[(i+d+TABS.length)%TABS.length])}
function cycleGroup(d){shipGrp=GROUPS[(GROUPS.indexOf(shipGrp)+d+GROUPS.length)%GROUPS.length];focusIdx=GROUPS.indexOf(shipGrp);renderSheet()}
/* Cena ako farebné štítky; data-need/data-n slúžia na červené zvýraznenie chýbajúcej suroviny (refreshSheet). */
function costHtml(c){let h='';for(const r of COST_KEYS)if(c[r])h+=`<span class="cost ${r==='cr'?'crd':RCLS[r]}" data-need="${r}" data-n="${c[r]}"><span class="${r==='cr'?'coin':'gem'}"></span>${c[r]}</span>`;return h}
/* Predaj modulu vráti 60 % ceny posledného postaveného modulu toho typu. */
function refundOf(s,k){const c=MOD[k].cost(countMod(s,k)-1);return C(Math.floor(c.ore*.6),Math.floor(c.green*.6),Math.floor(c.crystal*.6))}
function refundHtml(c){let h='';for(const r of RES)if(c[r])h+=`<span class="cost ${RCLS[r]} gain"><span class="gem"></span>+${c[r]}</span>`;return h}
function actBtn(act,label,c,block,extra=''){return `<button class="act" data-act="${act}" ${extra} data-ore="${c.ore}" data-green="${c.green}" data-cry="${c.crystal}" data-crd="${c.cr||0}" data-block="${block?1:0}">${label}</button>`}
function langBtns(){return `<div class="langs"><button class="langb" data-act="lang" data-l="sk" aria-pressed="${lang==='sk'}">SK</button><button class="langb" data-act="lang" data-l="en" aria-pressed="${lang==='en'}">EN</button></div>`}
function fmtUp(k,L){const v=UP[k].val(L);if(k==='radShield'&&L===0)return t('fmt.none');if(k==='sregen')return t('fmt.sregen',{d:v.delay,r:Math.round(v.rate*100)});if(k==='shield'&&L===0)return t('fmt.none');return UP[k].fmt(v)}
function upCard(k){const u=UP[k];const L=state.ship[k];
  let h=`<div class="card"><h3>${t('up.'+k)} <span class="lv">${t('lv',{n:L,m:u.max})}</span></h3>`;
  if(u.needs&&state.ship[u.needs]<1)return h+`<button class="act max" disabled>${t('btn.locked')}</button><p>${t('up.'+k+'.d')}</p><div class="stat">${t('up.needShield')}</div></div>`;
  if(L<u.max){const c=u.cost(L);h+=actBtn('ship',(k==='shield'||k==='radShield')&&L===0?t('btn.buy'):t('btn.upgrade'),c,false,`data-k="${k}"`)+`<div class="costs">${costHtml(c)}</div><p>${t('up.'+k+'.d')}</p><div class="stat">${fmtUp(k,L)} → <em>${fmtUp(k,L+1)}</em></div>`}
  else h+=`<button class="act max" disabled>${t('btn.max')}</button><p>${t('up.'+k+'.d')}</p><div class="stat"><em>${fmtUp(k,L)}</em></div>`;
  return h+'</div>'}
function repairCard(){const hm=shipVal('hull');const cost=Math.ceil((hm-state.hp)/REPAIR_PER_ORE);const near=nearStation();
  return `<div class="card"><h3>${t('rep.name')}</h3><button class="act" data-act="repair" data-ore="1" data-green="0" data-cry="0" data-block="${near?0:1}">${t('btn.repair')}</button><div class="costs">${costHtml(C(cost))}</div><p>${near?t('rep.desc'):t('rep.far')}</p><div class="stat">${t('rep.stat',{a:Math.ceil(state.hp),b:hm})}</div></div>`}
/* sheetTab: 'station' | 'ship' | 'map' | 'gate'. Tlačidlá majú data-act (čo urobiť) a ceny v data-ore/data-green/data-cry;
   kliknutia spracúva jeden spoločný poslucháč nižšie (body.addEventListener('click', ...)). */
function renderSheet(){if(!sheetTab||!state)return;const s=cur();let h='';
  if(sheetTab==='station'){$('#sheetTitle').textContent=t('sh.station',{s:secName(state.cur)});h=renderStation()}
  else if(sheetTab==='ship'){$('#sheetTitle').textContent=t('sh.ship');
    h+=`<div class="segs">${GROUPS.map(g=>`<button class="seg" data-act="grp" data-g="${g}" aria-pressed="${g===shipGrp}">${t('grp.'+g)}</button>`).join('')}</div>`;
    for(const k of Object.keys(UP))if(UP[k].grp===shipGrp)h+=upCard(k);
    if(shipGrp==='hull'&&state.hp<shipVal('hull')-.5)h+=repairCard();
    h+=`<p class="note">${t('note.ship',{a:Math.ceil(state.hp),b:shipVal('hull'),regen:D().regen?t('note.easy'):t('note.hard')})}</p>`}
  else if(sheetTab==='gear'){$('#sheetTitle').textContent=t('sh.gear');h=renderGear()}
  else if(sheetTab==='map'||sheetTab==='gate'){const isGate=sheetTab==='gate';$('#sheetTitle').textContent=isGate?t('sh.gate'):t('sh.map');
    if(isGate)h+=`<p class="note">${t('gate.note')}</p>`;
    SECTORS.forEach((S,i)=>{const sc=state.sec[i];const here=i===state.cur;
      const chip=here?`<span class="chip here">${t('chip.here')}</span>`:sc.captured?`<span class="chip won">${t('chip.won')}</span>`:sc.unlocked?`<span class="chip">${t('chip.free')}</span>`:`<span class="chip">${t('chip.locked')}</span>`;
      h+=`<div class="card"><h3>${secName(i)} ${chip}</h3>`;
      if(isGate){if(here)h+=`<button class="act max" disabled>${t('btn.here')}</button>`;
        else if(sc.unlocked)h+=`<button class="act" data-act="jump" data-i="${i}">${t('btn.jump')}</button>`;
        else h+=`<button class="act max" disabled>${t('btn.locked')}</button>`}
      h+=`<span class="gems">${S.res.map(r=>`<span class="gem" style="background:${RCOL[r]}" title="${t('res.'+r)}"></span>`).join('')}</span>`;
      h+=`<p>${t('sec'+i+'.sub')} ${sc.unlocked?t('map.inf',{a:influence(sc),b:S.capture}):t('map.lock',{s:secName(i-1)})}</p>`;
      const inc=sc.captured?passiveOf(sc):null;
      if(inc&&inc.paused)h+=`<div class="stat" style="color:var(--warn)">${t('map.paused',{a:influence(sc),b:S.capture})}</div>`;
      else if(inc)h+=`<div class="stat">${t('map.income',{o:Math.round(inc.ore*60),g:Math.round(inc.green*60)})}${t('map.cr',{c:Math.round(SECTOR_CREDITS*60)})}</div>`;
      else h+=`<div class="stat">${t('map.reward',{c:S.reward.cr,r:t('r.'+RAR[S.reward.minR].k)})}</div>`;
      h+='</div>'});
    if(!isGate)h+=`<p class="note">${t('map.gateNote')}</p>`}
  else if(sheetTab==='settings'){$('#sheetTitle').textContent=t('sh.settings');
    const onoff=(k,on)=>`<div class="langs"><button class="langb" data-act="opt" data-k="${k}" data-v="1" aria-pressed="${on}">${t('on')}</button><button class="langb" data-act="opt" data-k="${k}" data-v="0" aria-pressed="${!on}">${t('off')}</button></div>`;
    h+=`<div class="sec-h"><span>${t('set.autoH')}</span></div>`;
    h+=`<div class="card"><h3>${t('set.ap')}</h3>${onoff('autoPilot',!!state.autoPilot)}<p>${t('set.ap.d',{V:G().V})}</p>
      <div class="gems" style="gap:8px;flex-wrap:wrap"><span class="note" style="margin:0">${t('set.ap.res')}:</span>${RES.map(r=>`<button class="langb" style="border:1px solid var(--line);border-radius:6px;display:inline-flex;gap:6px;align-items:center" data-act="ares" data-r="${r}" aria-pressed="${state.autoRes===r}"><span class="gem" style="background:${RCOL[r]}"></span>${t('res.'+r)}</button>`).join('')}</div>
      ${SECTORS[state.cur].res.includes(state.autoRes)?'':`<div class="stat" style="color:var(--warn)">${t('set.ap.miss',{r:t('res.'+state.autoRes)})}</div>`}</div>`;
    h+=`<div class="card"><h3>${t('set.ret')}</h3>${onoff('autoReturn',state.autoReturn!==false)}<p>${t('set.ret.d')}</p></div>`;
    h+=`<div class="card"><h3>${t('set.auto')}</h3>${onoff('autoMine',state.autoMine!==false)}<p>${t('set.auto.d')}</p></div>`;
    h+=`<div class="card"><h3>${t('up.radShield')}</h3><div class="langs"><button class="langb" data-act="radMode" data-v="auto" aria-pressed="${state.radMode!=='void'}">${t('rs.auto')}</button><button class="langb" data-act="radMode" data-v="void" aria-pressed="${state.radMode==='void'}">${t('rs.void')}</button></div><p>${t('rs.d')}</p></div>`;
    h+=`<div class="sec-h"><span>${t('set.h')}</span></div>`;
    h+=`<div class="card"><h3>${t('set.lang')}</h3>${langBtns()}<p>${t('set.diff',{d:t('diff.'+state.diff)})}</p></div>`;
    h+=`<div class="card"><h3>${t('set.quit')}</h3><button class="act" data-act="quit">${t('btn.quit')}</button><p>${t('set.quit.d')}</p></div>`;
    h+=`<p class="note">${t('save.note')}</p><button class="ghost danger" id="resetBtn">${t('btn.reset')}</button>`}
  body.innerHTML=h;refreshSheet();applyFocus()}
function refreshSheet(){if(!sheetTab)return;
  body.querySelectorAll('[data-need]').forEach(el=>el.classList.toggle('lack',amt(el.dataset.need)<+el.dataset.n));
  body.querySelectorAll('.act[data-ore]').forEach(b=>{b.disabled=b.dataset.block==='1'||state.ore<+b.dataset.ore||state.green<+b.dataset.green||state.crystal<+b.dataset.cry||state.credits<+(b.dataset.crd||0)})}
function focusables(){return[...body.querySelectorAll('.seg,.act,.langb:not(:disabled),.ghost,.btn,.itm,.eqc,summary')]}
function applyFocus(){body.querySelectorAll('.pad-focus').forEach(el=>el.classList.remove('pad-focus'));if(inputMode!=='pad'||!sheetTab)return;
  const f=focusables();if(!f.length)return;focusIdx=clamp(focusIdx,0,f.length-1);const el=f[focusIdx];const box=el.classList.contains('act')?(el.closest('.card')||el):el;
  box.classList.add('pad-focus');box.scrollIntoView({block:'nearest',behavior:'smooth'})}
function moveFocus(v){focusIdx+=v;applyFocus()}
function activateFocus(){const el=focusables()[focusIdx];if(!el)return;if(!el.disabled){el.click();return}
  if(el.dataset.act==='repair')toast(t('rep.far'));else if(el.dataset.block==='1')toast(t('tt.noSlot'));else if(el.dataset.ore)toast(t('tt.noRes'))}
let resetArm=0;
body.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.id==='resetBtn'){if(performance.now()-resetArm<3000){newGame();return}
    resetArm=performance.now();b.textContent=t('btn.resetSure');setTimeout(()=>{if(b.isConnected)b.textContent=t('btn.reset')},3000);return}
  const act=b.dataset.act;if(!act||b.disabled)return;const s=cur();
  if(gearAct(act,b))return; // akcie obrazovky Výbava (gear.js)
  if(act==='grp'){shipGrp=b.dataset.g;focusIdx=GROUPS.indexOf(shipGrp);renderSheet();return}
  if(act==='lang'){setLang(b.dataset.l);return}
  if(act==='opt'){const k=b.dataset.k,v=b.dataset.v==='1';if(k==='autoPilot'){if(!!state.autoPilot!==v)toggleAutopilot();return}state[k]=v;save();renderSheet();return}
  if(act==='ares'){state.autoRes=b.dataset.r;save();renderSheet();if(state.autoPilot)toast(t('tt.apOn',{r:t('res.'+state.autoRes)}));return}
  if(act==='repair'){if(!nearStation()){toast(t('rep.far'));return}const hm=shipVal('hull');const need=Math.ceil((hm-state.hp)/REPAIR_PER_ORE);const n=Math.min(need,Math.floor(state.ore));
    if(n<=0)return;state.ore-=n;const before=state.hp;state.hp=Math.min(hm,state.hp+n*REPAIR_PER_ORE);toast(t('tt.repaired',{n:Math.round(state.hp-before)}));changed();return}
  if(stationAct(act,b))return; // akcie panela stanice (station.js)
  if(act==='quit'){quitGame();return}
  if(act==='radMode'){state.radMode=b.dataset.v;save();renderSheet();return}
  if(act==='core'){const c=coreCost(s.core);if(s.core<CORE_MAX&&afford(c)){pay(c);s.core++;rebuildStation();toast(t('tt.coreUp',{n:s.core}));changed()}}
  else if(act==='ship'){const k=b.dataset.k;const u=UP[k];const L=state.ship[k];const c=u.cost(L);if(L<u.max&&afford(c)){pay(c);
      if(k==='radShield'){state.ship[k]++;state.radCharge=shipVal('radShield');toast(L===0?t('tt.rsOn'):t('tt.upg',{m:t('up.'+k),n:state.ship[k]}))}
      else if(k==='shield'){const before=shieldMax();state.ship[k]++;state.sh=Math.min(shieldMax(),state.sh+(shieldMax()-before));if(L===0){state.sh=shieldMax();toast(t('tt.shieldOn'))}else toast(t('tt.upg',{m:t('up.'+k),n:state.ship[k]}))}
      else{state.ship[k]++;if(k==='hull')state.hp+=40;toast(t('tt.upg',{m:t('up.'+k),n:state.ship[k]}))}
      changed()}}
  else if(act==='jump'){if(!gate||ship.position.distanceTo(gate.position)>18){toast(t('gate.far'));return}closeSheet();jumpTo(+b.dataset.i)}});
function changed(){checkCapture();save();renderSheet();updateHUD()}
/* Obsadenie sektora: odomkne ďalší, vyplatí kredity a dá predmet (aspoň rarity reward.minR) priamo do inventára. */
function checkCapture(){const s=cur();if(!s.captured&&influence(s)>=capOf(state.cur)){s.captured=true;
  if(!s.rewarded){const R=SECTORS[state.cur].reward;s.rewarded=true;state.credits+=R.cr;const it=dropItem('capture',4,R.minR);
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
function quitGame(){save();toast(t('tt.saved'));try{window.close()}catch(e){}
  setTimeout(()=>{if(window.closed)return;closeSheet();const d=document.createElement('div');d.className='intro';d.innerHTML=`<div class="box glass" style="text-align:center"><h1 style="font-size:28px">${t('bye')}</h1><button class="go" id="byeBack">${t('btn.back')}</button></div>`;
    document.body.appendChild(d);d.querySelector('#byeBack').onclick=()=>d.remove()},400)}

let jumping=false;
/* Skok do sektora i: krátky záblesk, potom sa sektor postaví nanovo a loď sa objaví pri stanici. */
function jumpTo(i,instant){if(jumping)return;jumping=true;const w=$('#warp');w.classList.add('on');
  mining=false;mineTarget=null;moveTarget=null;hideBeam(beam);
  if(!instant)collectAllLoot();
  setTimeout(()=>{try{state.cur=i;mining=false;mineTarget=null;moveTarget=null;openOnArrive=false;stationG=null;gateNear=true;
    ship.position.set(0,0,STATION_R+8);shipVel.set(0,0,0);shipYaw=0;lastZone=1;buildSector();camTarget.copy(ship.position);save();updateHUD();
    if(!instant)toast(t('tt.jumped',{s:secName(i)}))}catch(e){console.error(e)}finally{w.classList.remove('on');jumping=false}},instant?50:480)}

/* language + intro */
let pendingDiff='easy';
function setLang(l){lang=l;if(state)state.lang=l;try{localStorage.setItem('os-lang',l)}catch(e){}applyLang();if(state)save()}
function applyLang(){document.documentElement.lang=lang;document.querySelectorAll('[data-t]').forEach(el=>el.textContent=t(el.dataset.t));
  document.querySelectorAll('.dock button').forEach(b=>{const l=b.querySelector('[data-t]');const txt=l?t(l.dataset.t):'Wiki';b.setAttribute('aria-label',txt);b.title=txt});
  mini.setAttribute('aria-label',t('mini'));if(!$('#intro').hidden)renderIntro();renderSheet();lastHint='';updateHUD()}
function renderIntro(){$('#introBox').innerHTML=`<div class="intro-top"><div class="kicker">${t('in.kicker')}</div>${langBtns()}</div>
  <h1>Orbitálne Sektory</h1><ol>${[1,2,3,4,5,6].map(i=>`<li>${t('in.'+i)}</li>`).join('')}</ol>
  <div class="sec-h"><span>${t('in.diff')}</span></div>
  <div class="diffs">${['easy','hard'].map(d=>`<button class="diff ${d}" data-d="${d}" aria-pressed="${pendingDiff===d}"><b>${t('diff.'+d)}</b><span>${t('diff.'+d+'D')}</span></button>`).join('')}</div>
  <button class="go" id="goBtn">${t('in.go')}</button><button class="ghost" id="introWiki" style="justify-self:center">${t('dock.wiki')}</button>`}
$('#introBox').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.l){setLang(b.dataset.l);return}if(b.dataset.d){pendingDiff=b.dataset.d;renderIntro();return}if(b.id==='goBtn')startGame();if(b.id==='introWiki')openWiki()});
function startGame(){state.diff=pendingDiff;state.intro=true;state.hp=shipVal('hull');$('#intro').hidden=true;save();lastHint='';updateHUD();canvas.focus()}
function newGame(){try{localStorage.removeItem(SAVE_KEY)}catch(e){}state=freshState();closeSheet();for(const a of asts)a.claims=0;
  dead=false;ship.visible=true;hullSince=99;shSince=99;pendingDiff='easy';$('#intro').hidden=false;renderIntro();jumpTo(0,true);toast(t('tt.newGame'))}

document.querySelectorAll('.dock [data-tab]').forEach(b=>b.addEventListener('click',()=>toggleTab(b.dataset.tab)));
$('#sheetClose').addEventListener('click',closeSheet);
$('#homeBtn').addEventListener('click',goHome);
$('#wikiBtn').addEventListener('click',()=>openWiki());

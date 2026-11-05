'use strict';
/* ==================== v0.30: HLAVNÉ MENU ====================
   Položky: Pokračovať (posledné uloženie), Nová hra (slot → obtiažnosť), Načítať (slot → uloženie), Nastavenia (spoločné),
   Príručka. Vpravo dole malý zoznam zmien (CHANGELOG z js/changelog.js). Za menu beží fanart (menuart.js).
   menuView: 'main' | 'new' | 'diff' | 'load' | 'slot'. Ovládanie: myš/dotyk, šípky + Enter + Esc, ovládač (D-pad, A, B). */
let menuView='main',menuSlot=1,menuArm=null,menuFoc=0,pendingDiff='easy',logOpen=false;
const menuOpen=()=>!$('#intro').hidden;

/* Formáty: dátum a čas uloženia, odohraný čas (h:mm), „pred chvíľou“. */
function fmtWhen(ts){const d=new Date(ts),now=Date.now(),m=Math.round((now-ts)/60000);
  if(m<1)return t('mn.now');if(m<60)return t('mn.minAgo',{n:m});
  return d.toLocaleString(lang==='sk'?'sk-SK':'en-GB',{day:'numeric',month:'numeric',year:d.getFullYear()===new Date().getFullYear()?undefined:'numeric',hour:'2-digit',minute:'2-digit'})}
function fmtPlay(s){s=s|0;const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?`${h} h ${String(m).padStart(2,'0')} min`:`${m} min`}
const sname=i=>SECTORS[i]?secName(i):'?';

function showMenu(view){if(state&&curSlot)save();curSlot=null;closeSheet();if(typeof closeWiki==='function')closeWiki();
  menuView=view||'main';menuArm=null;menuFoc=0;$('#intro').hidden=false;document.body.classList.add('inmenu');renderMenu()}
function hideMenu(){$('#intro').hidden=true;document.body.classList.remove('inmenu')}
const renderIntro=()=>renderMenu();   // staré volania (zmena jazyka) prekreslia menu

/* Karta slotu: najnovšie uloženie (sektor, obtiažnosť, pilot, odohraný čas, kedy) alebo „Prázdny slot“. */
function saveSlotCard(n,mode){const E=slotEntries(n),m=E[0];
  if(!m)return `<button class="msave empty" data-slot="${n}"${mode==='load'?' disabled':''}><span class="msn">${n}</span><span class="msi"><b>${t('mn.empty')}</b><small>${mode==='new'?t('mn.emptyNew'):t('mn.emptyLoad')}</small></span></button>`;
  return `<button class="msave" data-slot="${n}"><span class="msn">${n}</span><span class="msi"><b>${sname(m.sec)} <em class="d-${m.diff}">${t('diff.'+m.diff)}</em></b>
    <small>${t('mn.pilot',{n:m.lv})} · ${t('ship.'+m.ship)} · ${fmtPlay(m.play)}</small><small>${t('mn.saved')} ${fmtWhen(m.ts)} · ${t('mn.count',{n:E.length})}</small>
    ${mode==='new'?`<small class="warn">${t('mn.overwrite')}</small>`:''}</span></button>`}
/* Riadok uloženia v slote. */
function entryRow(n,m){const kind=m.label==='import'?'imp':m.kind==='auto'?'auto':'man';
  return `<div class="mentry"><button class="mload" data-load="${m.k}"><span class="mk ${kind}">${t('mn.k.'+kind)}</span>
    <span class="msi"><b>${sname(m.sec)} · ${t('diff.'+m.diff)}</b><small>${fmtWhen(m.ts)} · ${t('mn.pilot',{n:m.lv})} · ${fmtPlay(m.play)} · v${m.game||'?'}</small></span></button>
    <button class="mdel" data-del="${m.k}" aria-label="${t('mn.del')}" title="${t('mn.del')}">${menuArm==='del'+m.k?t('mn.sure'):'✕'}</button></div>`}

function renderMenu(){const box=$('#introBox');let h='';const back=(v,title)=>`<div class="mhead"><button class="mback" data-back="${v}" aria-label="${t('btn.back')}">‹</button><h2>${title}</h2></div>`;
  if(menuView==='main'){const L=lastSave();
    h+=`<div class="mlogo"><span class="kicker">${t('in.kicker',{v:GAME_VERSION})}</span><h1><span>Orbitálne</span><span>Sektory</span></h1></div><nav class="mnav">`;
    if(L)h+=`<button class="mi big" data-m="cont"><b>${t('mn.cont')}</b><small>${t('mn.slot',{n:L.n})} · ${sname(L.m.sec)} · ${fmtWhen(L.m.ts)}</small></button>`;
    h+=`<button class="mi${L?'':' big'}" data-m="new"><b>${t('mn.new')}</b></button>
      <button class="mi" data-m="load"${[1,2,3].some(slotUsed)?'':' disabled'}><b>${t('mn.load')}</b></button>
      <button class="mi" data-m="set"><b>${t('dock.settings')}</b></button>
      <button class="mi" data-m="wiki"><b>${t('mn.wiki')}</b></button></nav>
      <div class="mfoot">${langBtns()}<button class="mlogb" data-m="log">${t('mn.log')}</button></div>`}
  else if(menuView==='new'){h+=back('main',t('mn.newH'))+`<div class="msaves">${[1,2,3].map(n=>saveSlotCard(n,'new')).join('')}</div>`}
  else if(menuView==='diff'){const used=slotUsed(menuSlot);
    h+=back('new',t('mn.newSlot',{n:menuSlot}))+`<div class="sec-h"><span>${t('in.diff')}</span></div>
      <div class="diffs">${DIFFS.map(d=>`<button class="diff ${d}" data-d="${d}" aria-pressed="${pendingDiff===d}"><b>${d==='nightmare'?'☠ ':''}${t('diff.'+d)}</b><span>${t('diff.'+d+'D')}</span></button>`).join('')}</div>
      ${nmRecord()}<details class="mhow"><summary>${t('mn.how')}</summary><ol>${[1,2,3,4,5,6].map(i=>`<li>${t('in.'+i)}</li>`).join('')}</ol></details>
      <button class="go" id="goBtn">${used?(menuArm==='go'?t('mn.sure'):t('mn.goOver')):t('in.go')}</button>`}
  else if(menuView==='load'){h+=back('main',t('mn.loadH'))+`<div class="msaves">${[1,2,3].map(n=>saveSlotCard(n,'load')).join('')}</div>`}
  else if(menuView==='slot'){const E=slotEntries(menuSlot);
    h+=back('load',t('mn.slotH',{n:menuSlot}))+`<div class="mentries">${E.map(m=>entryRow(menuSlot,m)).join('')||`<p class="note">${t('mn.none')}</p>`}</div>
      <p class="note">${t('mn.slotNote',{a:AUTO_N,m:MAN_N})}</p>${E.length?`<button class="ghost danger" data-delslot="1">${menuArm==='slot'?t('mn.sure'):t('mn.delSlot')}</button>`:''}`}
  box.innerHTML=h;box.dataset.v=menuView;renderLog();menuFocusApply()}

/* Zoznam zmien vpravo dole: posledná verzia; „Všetky zmeny“ rozbalí ďalšie. */
function renderLog(){const el=$('#menuLog');if(!el)return;const L=typeof CHANGELOG!=='undefined'?CHANGELOG:[];
  if(menuView!=='main'||!L.length){el.hidden=true;return}el.hidden=false;el.classList.toggle('open',logOpen);
  const rows=(logOpen?L:L.slice(0,1)).map(r=>`<div class="lv"><b>v${r.v}</b><small>${r.d}</small><ul>${r.n.map(x=>`<li>${x}</li>`).join('')}</ul></div>`).join('');
  el.innerHTML=`<div class="lh"><span>${t('mn.log')}</span><button data-log="1">${logOpen?t('mn.logLess'):t('mn.logAll')}</button></div><div class="lb">${rows}</div>`}

/* ---- spustenie hry ---- */
/* Prenesie hráča z menu do sveta s aktuálnym state (nová alebo načítaná hra). */
function enterWorld(){nmDead=false;dead=false;if(typeof respawnTimer!=='undefined')clearInterval(respawnTimer);$('#death').classList.remove('on');
  if(!SECTORS[state.cur]||SECTORS[state.cur].arena)state.cur=0;   // beh arény sa neukladá – pokračuje sa v sektore 1
  bonusDirty();buildShip(state.shipId);clearShipOrders();mining=false;stationG=null;gateNear=true;openOnArrive=false;
  buildSector();ship.visible=true;ship.position.set(0,0,STATION_R+8);shipVel.set(0,0,0);shipYaw=0;ship.rotation.y=0;camTarget.copy(ship.position);
  hullSince=99;shSince=99;lastZone=1;autoPause=0;
  applyMini();applyHud();applyHudMode();applyMenuAlpha();hideMenu();
  if(state.pilotRetro){const x=state.pilotRetro;delete state.pilotRetro;setTimeout(()=>addXP(x),1500)}
  applyLang();lastHint='';updateHUD();save();canvas.focus()}
function startNew(n){deleteSlot(n);state=applyPrefs(freshState());state.diff=pendingDiff;state.intro=true;state.lang=lang;state.hp=shipVal('hull');
  curSlot=n;enterWorld();toast(t('mn.started',{n}))}
function loadGame(n,k){const s=readSave(n,k);if(!s){toast(t('sv.bad'),'bad');return}state=s;curSlot=n;
  if(SECTORS[state.cur]&&SECTORS[state.cur].arena)state.cur=0;
  enterWorld();const I=loadIdx();I.last=n;saveIdx(I);toast(t('sv.loaded',{n}))}
/* Návrat do hlavného menu z hry (uloží automaticky). */
function toMenu(){if(state&&curSlot&&!nmDead)save();showMenu('main')}
function newGame(){showMenu('new')}   // kompatibilita so staršími volaniami

$('#introBox').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.l){setLang(b.dataset.l);return}
  if(b.dataset.back){menuView=b.dataset.back;menuArm=null;menuFoc=0;renderMenu();return}
  const m=b.dataset.m;
  if(m==='cont'){const L=lastSave();if(L)loadGame(L.n,L.m.k);return}
  if(m==='new'||m==='load'){menuView=m;menuFoc=0;renderMenu();return}
  if(m==='set'){openSheet('settings');return}
  if(m==='wiki'){openWiki();return}
  if(m==='log'){logOpen=!logOpen;renderLog();return}
  if(b.dataset.slot){menuSlot=+b.dataset.slot;menuArm=null;menuFoc=0;menuView=menuView==='new'?'diff':'slot';if(menuView==='diff')pendingDiff='easy';renderMenu();return}
  if(b.dataset.d){pendingDiff=b.dataset.d;renderMenu();return}
  if(b.id==='goBtn'){if(slotUsed(menuSlot)&&menuArm!=='go'){menuArm='go';renderMenu();return}startNew(menuSlot);return}
  if(b.dataset.load){loadGame(menuSlot,b.dataset.load);return}
  if(b.dataset.del){const k='del'+b.dataset.del;if(menuArm!==k){menuArm=k;renderMenu();return}deleteSave(menuSlot,b.dataset.del);menuArm=null;
    if(!slotUsed(menuSlot))menuView='load';renderMenu();return}
  if(b.dataset.delslot){if(menuArm!=='slot'){menuArm='slot';renderMenu();return}deleteSlot(menuSlot);menuArm=null;menuView='load';renderMenu()}});
$('#menuLog').addEventListener('click',e=>{if(e.target.closest('[data-log]')){logOpen=!logOpen;renderLog()}});

/* ---- ovládanie klávesnicou a ovládačom: výber položky (zvýraznenie), potvrdenie, späť ---- */
const menuItems=()=>[...$('#introBox').querySelectorAll('button:not(:disabled)')].filter(b=>!b.closest('.langs')&&!b.classList.contains('mback'));
function menuFocusApply(){const L=menuItems();$('#introBox').querySelectorAll('.mfoc').forEach(x=>x.classList.remove('mfoc'));
  if(inputMode!=='pad'&&inputMode!=='key')return;if(!L.length)return;menuFoc=clamp(menuFoc,0,L.length-1);L[menuFoc].classList.add('mfoc');L[menuFoc].scrollIntoView({block:'nearest'})}
function menuMove(d){const L=menuItems();if(!L.length)return;menuFoc=(menuFoc+d+L.length)%L.length;menuFocusApply()}
function menuOk(){const L=menuItems();const b=L[clamp(menuFoc,0,L.length-1)];if(b)b.click()}
function menuBack(){const b=$('#introBox .mback');if(b)b.click()}
addEventListener('keydown',e=>{if(!menuOpen()||sheetTab||(typeof wikiOpen==='function'&&wikiOpen()))return;
  const k=e.key;if(k==='ArrowDown'||k==='ArrowRight'){inputMode='key';menuMove(1);e.preventDefault()}else if(k==='ArrowUp'||k==='ArrowLeft'){inputMode='key';menuMove(-1);e.preventDefault()}
  else if(k==='Enter'&&inputMode==='key'){menuOk();e.preventDefault()}else if(k==='Escape'||k==='Backspace'){menuBack();e.preventDefault()}});

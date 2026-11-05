'use strict';
/* ==================== == 8. VSTUP ====================
   inputMode: 'touch' | 'mouse' | 'key' | 'pad' – podľa neho sa menia nápovedy (napr. 'stlač A' vs 'ťukni'). */
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),ground=new THREE.Plane(new V3(0,1,0),0);
const pointers=new Map();let downPos=null,dragging=false,pinch0=0,zoom0=1,zoom=isTouch?1.08:1;
let inputMode=isTouch?'touch':'mouse';
const ZMIN=.26,ZMAX=3.4;   /* v0.32: ešte ďalší pohľad (ZMAX 2 → 3,4) */   // v0.17: bližší zoom (ZMIN .55 → .26), aby bolo vidieť detaily lodí
function toNdc(x,y){const r=canvas.getBoundingClientRect();ndc.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera)}
function groundAt(x,y){toNdc(x,y);const p=new V3();return ray.ray.intersectPlane(ground,p)?p:null}
function clampLimit(p){const r=Math.hypot(p.x,p.z);if(r>LIMIT-2)p.multiplyScalar((LIMIT-2)/r);return p}
function tapAt(x,y){autoPause=6;toNdc(x,y);const hits=ray.intersectObjects(pickables,false);
  for(const h of hits){const u=h.object.userData;
    if(u.enemy&&enemies.includes(u.enemy)){cmdAttack(u.enemy);return}
    if(u.ast&&u.ast.alive){cmdMine(u.ast);flashMarker(u.ast.pos,'#58d0c0');return}
    /* v0.33: stanica, NPC a brána sa otvárajú len cez svoje tlačidlo (worldbtn.js); klik na ne = presun lode */}
  const p=groundAt(x,y);if(p){clampLimit(p);cmdMove(p);flashMarker(p,'#58d0c0')}}
function flashMarker(p,c){marker.position.set(p.x,.05,p.z);marker.material.color.set(c);markerT=.6}
canvas.addEventListener('pointerdown',e=>{canvas.focus({preventScroll:true});setMode(e.pointerType==='touch'?'touch':'mouse');pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);
  if(pointers.size===1){downPos={x:e.clientX,y:e.clientY,t:performance.now()};dragging=false}
  else if(pointers.size===2){const [a,b]=[...pointers.values()];pinch0=Math.hypot(a.x-b.x,a.y-b.y);zoom0=zoom;downPos=null;dragging=false}});
canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2){const [a,b]=[...pointers.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch0>0)zoom=clamp(zoom0*pinch0/d,ZMIN,ZMAX);return}
  if(downPos&&(dragging||Math.hypot(e.clientX-downPos.x,e.clientY-downPos.y)>10||performance.now()-downPos.t>260)){dragging=true;const p=groundAt(e.clientX,e.clientY);if(p)cmdMove(clampLimit(p))}});
function endPtr(e){if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);
  if(downPos&&!dragging&&pointers.size===0)tapAt(e.clientX,e.clientY);
  if(pointers.size===0){downPos=null;dragging=false;pinch0=0}}
canvas.addEventListener('pointerup',endPtr);canvas.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);downPos=null;dragging=false});
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=clamp(zoom*(1+Math.sign(e.deltaY)*.08),ZMIN,ZMAX)},{passive:false});
/* v0.31.5: pri držaní tlačidla (myš aj prst) sa cieľ prepočítava stále – aj keď sa kurzor nehýbe, kamera ide za loďou,
   takže bod pod kurzorom sa posúva a loď ho plynulo sleduje (nezastaví sa na prvom mieste). */
setInterval(()=>{if(!downPos||pointers.size!==1||!$('#intro').hidden||(state&&state.holdFollow===false))return;const cur=[...pointers.values()][0];
  if(!dragging&&performance.now()-downPos.t<=300)return;dragging=true;const p=groundAt(cur.x,cur.y);if(p)cmdMove(clampLimit(p))},50);

/* minimap: tap to fly there */
const mini=$('#mini'),mctx=mini.getContext('2d');const MINI_R=200*MAP_SCALE;
mini.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();setMode(e.pointerType==='touch'?'touch':'mouse');
  const r=mini.getBoundingClientRect();const x=((e.clientX-r.left)/r.width*2-1)*MINI_R,z=((e.clientY-r.top)/r.height*2-1)*MINI_R;
  const p=clampLimit(new V3(x,0,z));cmdMove(p);flashMarker(p,'#58d0c0')});
/* v0.50.2: rozlíšenie minimapy sa nastaví aj keď sa jej veľkosť zmení sama (koniec načítania, zobrazenie HUD),
   inak ostala rozmazaná, kým hráč nezmenil jej veľkosť. Skrytá mapa (šírka 0) rozlíšenie nemení. */
if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>sizeMini()).observe(mini);
function sizeMini(){if(!mini.clientWidth)return;const css=mini.clientWidth;const dpr=Math.min(devicePixelRatio||1,2);const px=Math.round(css*dpr);if(mini.width!==px){mini.width=px;mini.height=px}}
/* Malá červená smrtka na minimape (lebka + čeľusť + očnice), kreslená cestami, nie písmom. */
function miniSkull(g,x,y,u){const s=3.6*u;g.save();g.shadowColor='#ff2a2a';g.shadowBlur=5*u;g.fillStyle='#ff4040';
  g.beginPath();g.arc(x,y-s*.15,s,Math.PI*.85,Math.PI*2.15);g.lineTo(x+s*.55,y+s*.95);g.lineTo(x-s*.55,y+s*.95);g.closePath();g.fill();
  g.shadowBlur=0;g.fillStyle='#1a0306';g.beginPath();g.arc(x-s*.42,y-s*.12,s*.3,0,TAU);g.arc(x+s*.42,y-s*.12,s*.3,0,TAU);g.fill();
  g.beginPath();g.moveTo(x,y+s*.22);g.lineTo(x-s*.14,y+s*.48);g.lineTo(x+s*.14,y+s*.48);g.closePath();g.fill();
  g.fillRect(x-s*.2,y+s*.68,s*.08,s*.27);g.fillRect(x+s*.12,y+s*.68,s*.08,s*.27);g.restore()}
/* v0.45: kreslenie mapy je spoločné pre minimapu aj veľkú mapu (bigmap.js).
   (ox, oy) = bod plátna, kde je stred sektora; k = pixely na meter; u = mierka čiar a značiek; R = polomer orezania
   (minimapa) alebo 0 = veľká mapa bez orezania; hits = pole, do ktorého sa zapíšu značky pre zisťovanie myšou. */
function drawMini(){const W=mini.width,c=W/2,R=c-1;paintMap(mctx,W,W,c,c,R/MINI_R,W/150,R,null)}
/* hmla mimo dosahu skenovania: tmavá vrstva s vyrezanými kruhmi (stanica + loď), okraj kruhov jemne svieti */
const _fogC=document.createElement('canvas'),_fogG=_fogC.getContext('2d');
function mapFog(g,W,Hh,ox,oy,k,u,SR,sx,sy,pr){if(_fogC.width!==W||_fogC.height!==Hh){_fogC.width=W;_fogC.height=Hh}
  const f=_fogG;f.globalCompositeOperation='source-over';f.clearRect(0,0,W,Hh);f.fillStyle='rgba(2,4,9,.62)';f.fillRect(0,0,W,Hh);
  f.globalCompositeOperation='destination-out';f.fillStyle='#000';
  if(SR>0){f.beginPath();f.arc(ox,oy,SR*k,0,TAU);f.fill()}f.beginPath();f.arc(sx,sy,pr,0,TAU);f.fill();
  g.drawImage(_fogC,0,0);g.lineWidth=1*u;g.setLineDash([3*u,4*u]);g.strokeStyle='rgba(126,242,226,.35)';
  if(SR>0){g.beginPath();g.arc(ox,oy,SR*k,0,TAU);g.stroke()}g.beginPath();g.arc(sx,sy,pr,0,TAU);g.stroke();g.setLineDash([])}
function paintMap(g,W,Hh,ox,oy,k,u,R,hits){const hit=(x,y,r,info)=>{if(hits)hits.push({x,y,r:Math.max(r,6*u),info})};
  g.clearRect(0,0,W,Hh);g.save();
  if(R){g.beginPath();g.arc(ox,oy,R,0,TAU);g.clip();g.fillStyle='rgba(6,11,20,.85)';g.fillRect(0,0,W,Hh)}else{g.fillStyle='rgba(4,7,13,.97)';g.fillRect(0,0,W,Hh)}
  const outer=R||Math.hypot(W,Hh);
  g.beginPath();g.arc(ox,oy,HORIZON*k,0,TAU);g.arc(ox,oy,Z2*k,0,TAU,true);g.fillStyle='rgba(240,166,68,.10)';g.fill();
  g.beginPath();g.arc(ox,oy,Math.max(outer,LIMIT*k),0,TAU);g.arc(ox,oy,HORIZON*k,0,TAU,true);g.fillStyle='rgba(255,59,47,.20)';g.fill();
  g.lineWidth=1*u;g.strokeStyle='rgba(127,167,208,.25)';for(const rr of[Z1,Z2,Z3]){g.beginPath();g.arc(ox,oy,rr*k,0,TAU);g.stroke()}
  g.strokeStyle='rgba(255,138,92,.8)';g.lineWidth=1.4*u;g.beginPath();g.arc(ox,oy,HORIZON*k,0,TAU);g.stroke();
  /* v0.51: dosah skenovania – mimo okruhu lode a senzorov stanice je mapa zatemnená a asteroidy/piráti sa nekreslia */
  const SR=scanR(),spx=ship.position.x,spz=ship.position.z,PV=SCAN_SHIP,all=SR===Infinity;
  const vis=(x,z)=>all||x*x+z*z<SR*SR||(x-spx)*(x-spx)+(z-spz)*(z-spz)<PV*PV;
  if(!all)mapFog(g,W,Hh,ox,oy,k,u,SR,ox+spx*k,oy+spz*k,PV*k);
  if(!R){g.strokeStyle='rgba(255,59,47,.6)';g.setLineDash([6*u,6*u]);g.beginPath();g.arc(ox,oy,LIMIT*k,0,TAU);g.stroke();g.setLineDash([])}
  for(const a of asts){if(!a.alive||!vis(a.pos.x,a.pos.z))continue;g.fillStyle=RCOL[a.type];const x=ox+a.pos.x*k,y=oy+a.pos.z*k;
    if(a.type==='relic'){const s=3*u;g.beginPath();g.moveTo(x,y-s);g.lineTo(x+s,y);g.lineTo(x,y+s);g.lineTo(x-s,y);g.closePath();g.fill();hit(x,y,s,{t:'ast',a});continue}
    const s=(a.type==='ore'?1.3:1.7)*u*(.6+.4*a.amt/a.max);g.beginPath();g.arc(x,y,s,0,TAU);g.fill();hit(x,y,s,{t:'ast',a})}
  if(mineTarget&&mineTarget.alive){g.strokeStyle='#58d0c0';g.lineWidth=1.2*u;g.beginPath();g.arc(ox+mineTarget.pos.x*k,oy+mineTarget.pos.z*k,4*u,0,TAU);g.stroke()}
  // korisť: kosoštvorec vo farbe rarity s bielym okrajom, od Legendárnej aj krúžok
  for(const l of loot){const x=ox+l.g.position.x*k,y=oy+l.g.position.z*k,s=(3.2+l.it.r*.25)*u;g.fillStyle=RAR[l.it.r].col;g.strokeStyle='#fff';g.lineWidth=.8*u;
    g.beginPath();g.moveTo(x,y-s);g.lineTo(x+s,y);g.lineTo(x,y+s);g.lineTo(x-s,y);g.closePath();g.fill();g.stroke();
    if(l.it.r>=6){g.strokeStyle=RAR[l.it.r].col;g.beginPath();g.arc(x,y,s+3*u,0,TAU);g.stroke()}hit(x,y,s,{t:'loot',l})}
  // misie: fialová hviezda na cieli prieskumu/reliktu
  for(const mk of mMarks){const x=ox+mk.m.pos.x*k,y=oy+mk.m.pos.z*k;g.fillStyle=MCOL;g.strokeStyle='#fff';g.lineWidth=.8*u;g.beginPath();for(let i=0;i<10;i++){const an=i/10*TAU-Math.PI/2,rr=(i%2?2.2:5)*u;g.lineTo(x+Math.cos(an)*rr,y+Math.sin(an)*rr)}g.closePath();g.fill();g.stroke();hit(x,y,5*u,{t:'mis',m:mk.m})}
  // piráti: červené trojuholníky v smere letu
  for(const e of enemies){if(!vis(e.pos.x,e.pos.z))continue;const x=ox+e.pos.x*k,y=oy+e.pos.z*k,a=e.body.rotation.y,s=(e.kind==='carrier'||e.kind==='dread'?8:e.kind==='frigate'?6:e.kind==='corsair'?4.5:3.2)*u,fx=Math.sin(a),fz=Math.cos(a);
    g.fillStyle=e.leaving?'rgba(255,90,74,.45)':e.passive&&!e.hostile?'#ffb35a':'#ff5a4a';   // oranžová = pasívny pirát
    g.beginPath();g.moveTo(x+fx*s,y+fz*s);g.lineTo(x-fx*s*.7+fz*s*.7,y-fz*s*.7-fx*s*.7);g.lineTo(x-fx*s*.7-fz*s*.7,y-fz*s*.7+fx*s*.7);g.closePath();g.fill();hit(x,y,s,{t:'en',e})}
  // lode NPC: fialový štvorec = zadávateľ misií, zlatý = obchodník
  for(const n of npcs){const x=ox+n.pos.x*k,y=oy+n.pos.z*k,s=3.4*u;g.fillStyle=n.kind==='trader'?'#ffd27a':MCOL;g.strokeStyle='#fff';g.lineWidth=.8*u;g.fillRect(x-s,y-s,s*2,s*2);g.strokeRect(x-s,y-s,s*2,s*2);hit(x,y,s,{t:'npc',n})}
  // miesto poslednej smrti: červená smrtka (mimo dosahu minimapy sa prilepí k okraju); keď k nemu loď priletí, značka zmizne
  const dp=state.deathPos;if(dp&&dp.s===state.cur&&!dead){if(Math.hypot(ship.position.x-dp.x,ship.position.z-dp.z)<10)state.deathPos=null;
    else{let x=dp.x*k,y=dp.z*k;if(R){const L=Math.hypot(x,y),mx=R-6*u;if(L>mx){x*=mx/L;y*=mx/L}}miniSkull(g,ox+x,oy+y,u);hit(ox+x,oy+y,4*u,{t:'death'})}}
  if(gate){const x=ox+gate.position.x*k,y=oy+gate.position.z*k;g.strokeStyle='#7ef2e2';g.lineWidth=1.4*u;g.beginPath();g.arc(x,y,3.2*u,0,TAU);g.stroke();hit(x,y,3.2*u,{t:'gate'})}
  const won=cur().captured;g.fillStyle=typeof stationBroken==='function'&&stationBroken()?'#ff5a4a':won?'#ffd27a':'#58d0c0';g.beginPath();for(let i=0;i<6;i++){const an=i/6*TAU;g.lineTo(ox+Math.cos(an)*4*u,oy+Math.sin(an)*4*u)}g.closePath();g.fill();
  if(!inArena())hit(ox,oy,4*u,{t:'st'});
  g.fillStyle='#ffe2a8';for(const d of drones){g.beginPath();g.arc(ox+d.g.position.x*k,oy+d.g.position.z*k,1.2*u,0,TAU);g.fill()}
  if(!dead){const sx=ox+ship.position.x*k,sz=oy+ship.position.z*k,fx=Math.sin(shipYaw),fz=Math.cos(shipYaw);
    g.fillStyle='#ffffff';g.strokeStyle='#04070d';g.lineWidth=1*u;g.beginPath();
    g.moveTo(sx+fx*6*u,sz+fz*6*u);g.lineTo(sx-fx*4*u+fz*3.6*u,sz-fz*4*u-fx*3.6*u);g.lineTo(sx-fx*2*u,sz-fz*2*u);g.lineTo(sx-fx*4*u-fz*3.6*u,sz-fz*4*u+fx*3.6*u);g.closePath();g.fill();g.stroke();hit(sx,sz,5*u,{t:'ship'})}
  g.restore();if(R){g.strokeStyle='rgba(130,175,215,.3)';g.lineWidth=1*u;g.beginPath();g.arc(ox,oy,R-.5,0,TAU);g.stroke()}}

/* keyboard */
const keys=new Set();const MOVE_KEYS=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'];
addEventListener('keydown',e=>{const k=e.key.toLowerCase();const inUI=e.target.closest&&e.target.closest('#sheet,.intro,#wiki');
  if(k==='escape'){if(wikiOpen())closeWiki();else closeSheet();return}
  if(e.ctrlKey&&e.shiftKey&&k==='f8'){e.preventDefault();toggleAdmin();return}   // skrytý admin panel
  if(e.target.tagName==='INPUT'||wikiOpen())return; // písanie do vyhľadávania v príručke nesmie hýbať loďou
  if(k==='k'&&!e.repeat){openWiki();return}
  if(MOVE_KEYS.includes(k)){if(inUI&&k.startsWith('arrow'))return;if(!$('#intro').hidden)return;keys.add(k);setMode('key');e.preventDefault();return}
  if(e.repeat||inUI)return;
  if(k===' '){e.preventDefault();if(document.activeElement&&document.activeElement!==canvas)document.activeElement.blur();setMode('key');mineNearest()}
  else if(k==='h'){setMode('key');goHome()}
  else if(k==='p'){setMode('key');toggleAutopilot()}
  else if(k==='1')toggleTab('station');else if(k==='2')toggleTab('ship');else if(k==='3')toggleTab('map');else if(k==='i')toggleTab('gear');else if(k==='l')toggleTab('pilot');else if(k==='o')toggleTab('settings')});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('blur',()=>keys.clear());
function readInput(){inVec.set(0,0,0);
  if(keys.has('a')||keys.has('arrowleft'))inVec.x-=1;if(keys.has('d')||keys.has('arrowright'))inVec.x+=1;
  if(keys.has('w')||keys.has('arrowup'))inVec.z-=1;if(keys.has('s')||keys.has('arrowdown'))inVec.z+=1;
  if(inVec.lengthSq()>1)inVec.normalize();inVec.add(padVec);if(inVec.lengthSq()>1)inVec.normalize()}

/* Ovládač – štandardné číslovanie tlačidiel prehliadača: 0 A/✕, 1 B/○, 2 X/□, 3 Y/△, 4 LB, 5 RB, 6 LT, 7 RT,
   8 View/Share, 9 Menu/Options, 12–15 krížový ovládač (hore, dole, vľavo, vpravo). Osi: 0/1 ľavá páčka, 2/3 pravá páčka. */
/* gamepad: Xbox and PlayStation controllers through the browser's standard mapping */
const GLY={xbox:{A:'A',B:'B',X:'X',Y:'Y',LB:'LB',RB:'RB',LT:'LT',M:'Menu',V:'View'},ps:{A:'✕',B:'○',X:'□',Y:'△',LB:'L1',RB:'R1',LT:'L2',M:'Options',V:'Share'}};
let padType='xbox',padPrev=[],activePad=null,navT=0,navLast=0,dlgIdx=0;
const G=()=>GLY[padType];
const padKind=id=>/054c|dualsense|dualshock|playstation|wireless controller/i.test(id||'')?'ps':'xbox';
const PAD_HOLD=.5,_ph={};
function padHoldTick(btn,press,dt){const o={};const live=$('#intro').hidden;
  for(const i of[8,9]){if(press(i)&&live)_ph[i]={t:0,ok:true};const h=_ph[i];if(!h)continue;
    if(btn(i)){h.t+=dt;if(h.ok&&h.t>=PAD_HOLD){h.ok=false;o['l'+i]=true;rumble(.35,40)}}
    else{if(h.ok)o['s'+i]=true;_ph[i]=null}}
  return o}
function setMode(m){if(pmSynth||inputMode===m)return;inputMode=m;document.body.classList.toggle('pad',m==='pad');
  document.querySelectorAll('.pg').forEach(el=>el.textContent=(el.dataset.h?t('pg.hold')+' ':'')+G()[el.dataset.g]);applyFocus();lastHint=''}
addEventListener('gamepadconnected',e=>{padType=padKind(e.gamepad.id);inputMode='';setMode('pad');toast(t('tt.padOn',{k:padType==='ps'?'PlayStation':'Xbox'}))});
addEventListener('gamepaddisconnected',()=>{activePad=null;padVec.set(0,0,0);if(inputMode==='pad')setMode(isTouch?'touch':'mouse');toast(t('tt.padOff'))});
function rumble(k,ms){const va=activePad&&activePad.vibrationActuator;if(!va||!va.playEffect)return;
  try{const r=va.playEffect('dual-rumble',{duration:ms,strongMagnitude:clamp(k,0,1),weakMagnitude:clamp(k*1.2,0,1)});if(r&&r.catch)r.catch(()=>{})}catch(e){}}
function pollPad(dt){let pads=[];try{pads=navigator.getGamepads?navigator.getGamepads():[]}catch(e){return}
  let p=null;for(const g of pads||[])if(g&&g.connected){p=g;break}
  activePad=p;if(!p){padVec.set(0,0,0);padPrev=[];padTargetTick(dt,false);return}
  const btn=i=>{const b=p.buttons[i];return!!(b&&(b.pressed||b.value>.5))};const press=i=>btn(i)&&!padPrev[i];
  let lx=p.axes[0]||0,ly=p.axes[1]||0;const m=Math.hypot(lx,ly);
  if(m<.2){lx=0;ly=0}else{const k=Math.min(1,(m-.2)/.8)/m;lx*=k;ly*=k}
  const dx=(btn(15)?1:0)-(btn(14)?1:0),dy=(btn(13)?1:0)-(btn(12)?1:0);
  if(inputMode!=='pad'&&(m>=.2||p.buttons.some((b,i)=>btn(i)))){padType=padKind(p.id);setMode('pad')}
  padVec.set(0,0,0);
  if(press(10)&&state)setPadMouse(!padMouseOn());   // stlačenie ľavej páčky (L3) = zapnúť/vypnúť kurzor myši
  const pm=padMouseOn()&&$('#intro').hidden;pmCursor(pm);
  if(pm){pmMove(lx,ly,dt);const rx=p.axes[2]||0,ry2=p.axes[3]||0;pmScroll(rx,ry2,dt);if(press(0))pmClick()}
  if(wikiOpen()){const m=$('#wikiMain');if(m)m.scrollTop+=((pm?0:ly)+dy)*dt*900;if(press(1)||press(9))closeWiki();if(press(4))wikiStep(-1);if(press(5))wikiStep(1);padPrev=p.buttons.map((b,i)=>btn(i));return}
  // v0.42: dialógy arény (výber štartu, pokračovanie po odmene): kríž = výber tlačidla, A = potvrdiť, B = zavrieť výber štartu
  {const dl=[...document.querySelectorAll('#arPick:not([hidden]) button,#arAsk:not([hidden]) button')];if(dl.length&&!sheetTab){
    if(press(14)||press(12))dlgIdx--;if(press(15)||press(13))dlgIdx++;dlgIdx=(dlgIdx+dl.length)%dl.length;dl.forEach((b,i)=>b.classList.toggle('pad-focus',i===dlgIdx));
    if(press(0))dl[dlgIdx].click();else if(press(1)){const c=dl.find(b=>b.dataset.w==='0');if(c)c.click()}padPrev=p.buttons.map((b,i)=>btn(i));return}}
  if(typeof rsOpen==='function'&&rsOpen()){rsPad(p,btn,press,lx,ly,dx,dy,dt);padPrev=p.buttons.map((b,i)=>btn(i));return}   // v0.42: strom výskumu
  if(dead&&$('#deathBtns').classList.contains('on')){if(press(0))respawnConfirm(false);if(press(2))respawnConfirm(true);padPrev=p.buttons.map((b,i)=>btn(i));return}   // v0.36: obrazovka smrti
  /* v0.51: podržanie Menu (0,5 s) = Nastavenia, podržanie View = Pilot; krátke stlačenie ostáva Mapa / autopilot (reaguje pri pustení) */
  const hk=padHoldTick(btn,press,dt);
  if(!$('#intro').hidden&&!sheetTab){
    // v0.30: hlavné menu – D-pad / páčka hore-dole = výber, A = potvrdiť, B = späť, X = jazyk
    let v=dy||dx;if(!v&&Math.abs(ly)>.55)v=Math.sign(ly);const key=v;navT-=dt;
    if(key&&(key!==navLast||navT<=0)){menuMove(v);navT=key===navLast?.16:.38}navLast=key;
    if(press(0))menuOk();if(press(1))menuBack();if(press(2))setLang(lang==='sk'?'en':'sk')}
  else if(sheetTab){
    // v0.17: pohyb výberu v menu všetkými 4 smermi (krížový ovládač; ľavá páčka len ak nie je zapnutý kurzor myši)
    let vx=dx,vy=dy;if(!vx&&!vy&&!pm){if(Math.abs(lx)>.55&&Math.abs(lx)>=Math.abs(ly))vx=Math.sign(lx);else if(Math.abs(ly)>.55)vy=Math.sign(ly)}
    const key=vx*3+vy;navT-=dt;
    if(key&&(key!==navLast||navT<=0)){moveFocusDir(vx,vy);navT=key===navLast?.14:.38}navLast=key;
    // v0.50: na predmete vo Výbave fungujú tlačidlá ako skratky predmetu (A nasadiť, X vylepšiť, Y rozobrať, LB vyhodiť, RB porovnanie, B späť)
    if(sheetTab==='gear'&&!pm&&typeof gearHot!=='undefined'&&gearHot!=null){if(press(0))gearKey('eq');if(press(2))gearKey('enh');if(press(3))gearKey('salv');if(press(4))gearKey('drop');if(press(5))gearKey('cmpNext');
      if(press(1)){const f=focusables(),i=f.findIndex(e=>!e.dataset.id);if(i>=0){focusIdx=i;applyFocus()}}
      padPrev=p.buttons.map((b,i)=>btn(i));return}
    if(press(0)&&!pm)activateFocus();if(press(1))closeSheet();if(press(4))cycleTab(-1);if(press(5))cycleTab(1);
    if(press(3))toggleTab('station');if(press(2))toggleTab('ship');if(hk.s9)toggleTab('map');if(hk.l9)toggleTab('settings');if(hk.l8)toggleTab('pilot');if(press(6))toggleTab('gear')}
  else{if(!pm){padVec.set(lx+dx,0,ly+dy);if(padVec.lengthSq()>1)padVec.normalize()}   // s kurzorom myši je ovládanie lode páčkou vypnuté
    if(hk.s8)toggleAutopilot();if(hk.l8)openSheet('pilot');if(hk.l9)openSheet('settings');if(!pm&&press(0)){const k=wbReadyKey();if(k&&!(padTgt&&padTgt.en))wbAct(k);else padAct()}else if(!pm&&press(7))padAct();   /* v0.38: A (Xbox) / ✕ (PS) pri stanici, NPC alebo bráne otvorí ich menu */if(!pm&&(press(4)||press(5)))padCycle(press(5)?1:-1);if(press(1))goHome();if(press(3))openSheet('station');if(press(2))openSheet('ship');if(hk.s9)openSheet('map');if(press(6))openSheet('gear')}
  if(press(11))miniZoom(1,true);   // R3 = ďalšia veľkosť minimapy (dookola)
  const ry=p.axes[3]||0;if(!pm&&Math.abs(ry)>.2)zoom=clamp(zoom*(1+ry*dt*1.2),ZMIN,ZMAX);
  padTargetTick(dt,inputMode==='pad'&&!pm&&!sheetTab&&!dead&&$('#intro').hidden&&!wikiOpen());
  padPrev=p.buttons.map((b,i)=>btn(i))}

/* ==================== v0.17: MYŠ OVLÁDAČOM ====================
   Nastavenia → „Kurzor myši ovládačom“ (alebo stlačenie ľavej páčky L3). Ľavá páčka hýbe kurzorom po obrazovke, A = kliknutie
   (na tlačidlo v menu, na mapu = let/ťažba/útok ako klik myšou), pravá páčka posúva obsah okna pod kurzorom (nad hrou mení priblíženie).
   Kým je kurzor zapnutý, loď sa páčkou neriadi. Krížový ovládač naďalej posúva výber v oknách. */
let pmX=innerWidth/2,pmY=innerHeight/2,pmEl=null,pmSynth=false;
const padMouseOn=()=>!!(state&&state.padMouse);
function setPadMouse(on){if(!state)return;state.padMouse=on;save();toast(t(on?'pm.on':'pm.off'));if(sheetTab)renderSheet()}
function pmCursor(show){if(!show&&pmHover){pmHover=false;hoverHide()}if(!pmEl){pmEl=document.createElement('div');pmEl.id='padCursor';document.body.appendChild(pmEl)}
  pmEl.hidden=!show;if(show)pmEl.style.transform=`translate(${pmX}px,${pmY}px)`}
function pmMove(lx,ly,dt){const m=Math.hypot(lx,ly);if(!m){pmHoverNow();return}const sp=250+1150*m*m;   // zrýchľovanie: jemný pohyb pri malom vychýlení
  pmX=clamp(pmX+lx/m*sp*m*dt,0,innerWidth-2);pmY=clamp(pmY+ly/m*sp*m*dt,0,innerHeight-2);pmHoverNow()}
/* v0.19.3: náhľad predmetov a popisy aj pod kurzorom ovládača (tooltip.js → hoverAt) */
function pmHoverNow(){pmHover=true;hoverAt(pmX,pmY,pmTarget())}
/* posun obsahu pod kurzorom: nájde najbližší rodičovský prvok, ktorý sa dá posúvať */
function pmScroll(rx,ry,dt){if(Math.abs(rx)<.2&&Math.abs(ry)<.2)return;const el=pmTarget();
  if(!el||el===canvas){if(Math.abs(ry)>.2)zoom=clamp(zoom*(1+ry*dt*1.2),ZMIN,ZMAX);return}
  let s=el;while(s&&s!==document.body){const cs=getComputedStyle(s);if(/(auto|scroll)/.test(cs.overflowY+cs.overflowX)&&(s.scrollHeight>s.clientHeight||s.scrollWidth>s.clientWidth)){s.scrollTop+=ry*dt*900;s.scrollLeft+=rx*dt*900;return}s=s.parentElement}}
function pmTarget(){if(pmEl)pmEl.hidden=true;const el=document.elementFromPoint(pmX,pmY);if(pmEl)pmEl.hidden=false;return el}
/* kliknutie A: na plochu hry = ťuknutie (tapAt), inak udalosti ako pri myši + click */
function pmClick(){const el=pmTarget();if(!el)return;if(pmEl){pmEl.classList.remove('clk');void pmEl.offsetWidth;pmEl.classList.add('clk')}
  if(el===canvas){tapAt(pmX,pmY);return}
  pmSynth=true;try{const o={bubbles:true,cancelable:true,clientX:pmX,clientY:pmY,pointerType:'mouse',pointerId:99,button:0,view:window};
    el.dispatchEvent(new PointerEvent('pointerdown',o));el.dispatchEvent(new PointerEvent('pointerup',o));el.dispatchEvent(new MouseEvent('click',o))}finally{pmSynth=false}}

/* ==================== v0.19.3: CIEĽ OVLÁDAČOM ====================
   V režime ovládača (bez kurzora myši) poskakuje nad najbližším cieľom ukazovateľ: červený = pirát, oranžový = pasívny pirát,
   tyrkysový = asteroid. RT (alebo A) spustí akciu na cieli: pirát → útok, asteroid → ťažba (opätovne na ťaženom = zastaviť).
   LB / RB prepínajú medzi ďalšími blízkymi cieľmi. Piráti majú mierne prednosť (skóre vzdialenosti × 0,7). */
let padTgt=null,padTgtIdx=0,padMk=null,padMkT=0;
function padTargets(){const out=[],sp=ship.position,fx=Math.sin(shipYaw),fz=Math.cos(shipYaw);
  for(const e of enemies){if(e.leaving||e.invuln)continue;const dx=e.pos.x-sp.x,dz=e.pos.z-sp.z,d=Math.hypot(dx,dz);if(d>90)continue;out.push({o:e,en:true,s:d*.7-(dx*fx+dz*fz)/Math.max(d,.001)*5})}
  for(const a of asts){if(!a.alive)continue;const dx=a.pos.x-sp.x,dz=a.pos.z-sp.z,d=Math.hypot(dx,dz);if(d>55)continue;out.push({o:a,en:false,s:d-(dx*fx+dz*fz)/Math.max(d,.001)*8})}
  return out.sort((a,b)=>a.s-b.s)}
function padMarker(){if(padMk)return padMk;const g=new THREE.Group();
  const mat=new THREE.MeshBasicMaterial({color:new THREE.Color('#58d0c0'),toneMapped:false});
  const cone=new THREE.Mesh(new THREE.ConeGeometry(.7,1.4,4),mat);cone.rotation.x=Math.PI;g.add(cone);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.75,.08,4,20),mat);ring.rotation.x=Math.PI/2;ring.position.y=.75;g.add(ring);
  const gl=glow('#58d0c0',3.2,.7);gl.position.y=.2;g.add(gl);g.userData={mat,gl};g.visible=false;scene.add(g);return padMk=g}
function padTargetTick(dt,show){if(!show){if(padMk)padMk.visible=false;padTgt=null;return}
  padMkT-=dt;if(padMkT<=0||(padTgt&&(padTgt.o.alive===false||(padTgt.en&&!enemies.includes(padTgt.o))))){padMkT=.2;const L=padTargets();
    // ručne vybraný cieľ (LB/RB) sa drží, kým je v dosahu; inak ukazovateľ skočí na najbližší
    const keep=padTgt&&padTgt.manual?L.findIndex(x=>x.o===padTgt.o):-1;padTgt=!L.length?null:keep>=0?Object.assign(L[keep],{manual:true}):L[0]}
  const m=padMarker();if(!padTgt){m.visible=false;return}
  const o=padTgt.o,col=padTgt.en?(o.passive&&!o.hostile?'#ffb35a':'#ff5a4a'):'#58d0c0';m.userData.mat.color.set(col);m.userData.gl.material.color.set(col);
  const tt=performance.now()/1000,h=padTgt.en?3.4*(o.body?o.body.scale.x:1)+1.5:astScale(o)+2.2;
  m.visible=true;m.position.set(o.pos.x,o.pos.y+h+Math.abs(Math.sin(tt*5))*1.1,o.pos.z);m.rotation.y+=dt*3;const s=zoom<.6?.7:1;m.scale.setScalar(s)}
function padCycle(d){const L=padTargets();if(!L.length)return;let i=padTgt?L.findIndex(x=>x.o===padTgt.o):-1;i=((i+d)%L.length+L.length)%L.length;padTgt=Object.assign(L[i],{manual:true});padTgtIdx=i;padMkT=.2}
function padAct(){if(!padTgt){mineNearest();return}const o=padTgt.o;autoPause=6;
  if(padTgt.en){cmdAttack(o);return}
  if(mineTarget===o){mineTarget=null;moveTarget=null;toast(t('tt.mineStop'));return}
  cmdMine(o);flashMarker(o.pos,'#58d0c0')}

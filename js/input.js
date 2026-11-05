'use strict';
/* ==================== == 8. VSTUP ====================
   inputMode: 'touch' | 'mouse' | 'key' | 'pad' – podľa neho sa menia nápovedy (napr. 'stlač A' vs 'ťukni'). */
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),ground=new THREE.Plane(new V3(0,1,0),0);
const pointers=new Map();let downPos=null,dragging=false,pinch0=0,zoom0=1,zoom=isTouch?1.08:1;
let inputMode=isTouch?'touch':'mouse';
const ZMIN=.26,ZMAX=2;   // v0.17: bližší zoom (ZMIN .55 → .26), aby bolo vidieť detaily lodí
function toNdc(x,y){const r=canvas.getBoundingClientRect();ndc.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera)}
function groundAt(x,y){toNdc(x,y);const p=new V3();return ray.ray.intersectPlane(ground,p)?p:null}
function clampLimit(p){const r=Math.hypot(p.x,p.z);if(r>LIMIT-2)p.multiplyScalar((LIMIT-2)/r);return p}
function tapAt(x,y){autoPause=6;toNdc(x,y);const hits=ray.intersectObjects(pickables,false);
  for(const h of hits){const u=h.object.userData;
    if(u.enemy&&enemies.includes(u.enemy)){cmdAttack(u.enemy);return}
    if(u.ast&&u.ast.alive){cmdMine(u.ast);flashMarker(u.ast.pos,'#58d0c0');return}
    if(u.station){if(nearStation())openSheet('station');else{cmdHome();openOnArrive=true}return}
    if(u.npc){npcTap(u.npc);return}
    if(u.gate){cmdMove(gate.position);return}}
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
setInterval(()=>{if(downPos&&pointers.size===1&&!dragging&&performance.now()-downPos.t>300){dragging=true;const p=groundAt(downPos.x,downPos.y);if(p)cmdMove(clampLimit(p))}},80);

/* minimap: tap to fly there */
const mini=$('#mini'),mctx=mini.getContext('2d');const MINI_R=200*MAP_SCALE;
mini.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();setMode(e.pointerType==='touch'?'touch':'mouse');
  const r=mini.getBoundingClientRect();const x=((e.clientX-r.left)/r.width*2-1)*MINI_R,z=((e.clientY-r.top)/r.height*2-1)*MINI_R;
  const p=clampLimit(new V3(x,0,z));cmdMove(p);flashMarker(p,'#58d0c0')});
function sizeMini(){const css=mini.clientWidth||150;const dpr=Math.min(devicePixelRatio||1,2);const px=Math.round(css*dpr);if(mini.width!==px){mini.width=px;mini.height=px}}
/* Malá červená smrtka na minimape (lebka + čeľusť + očnice), kreslená cestami, nie písmom. */
function miniSkull(g,x,y,u){const s=3.6*u;g.save();g.shadowColor='#ff2a2a';g.shadowBlur=5*u;g.fillStyle='#ff4040';
  g.beginPath();g.arc(x,y-s*.15,s,Math.PI*.85,Math.PI*2.15);g.lineTo(x+s*.55,y+s*.95);g.lineTo(x-s*.55,y+s*.95);g.closePath();g.fill();
  g.shadowBlur=0;g.fillStyle='#1a0306';g.beginPath();g.arc(x-s*.42,y-s*.12,s*.3,0,TAU);g.arc(x+s*.42,y-s*.12,s*.3,0,TAU);g.fill();
  g.beginPath();g.moveTo(x,y+s*.22);g.lineTo(x-s*.14,y+s*.48);g.lineTo(x+s*.14,y+s*.48);g.closePath();g.fill();
  g.fillRect(x-s*.2,y+s*.68,s*.08,s*.27);g.fillRect(x+s*.12,y+s*.68,s*.08,s*.27);g.restore()}
function drawMini(){const W=mini.width,c=W/2,R=c-1,k=R/MINI_R,u=W/150;const g=mctx;
  g.clearRect(0,0,W,W);g.save();g.beginPath();g.arc(c,c,R,0,TAU);g.clip();
  g.fillStyle='rgba(6,11,20,.85)';g.fillRect(0,0,W,W);
  g.beginPath();g.arc(c,c,HORIZON*k,0,TAU);g.arc(c,c,Z2*k,0,TAU,true);g.fillStyle='rgba(240,166,68,.10)';g.fill();
  g.beginPath();g.arc(c,c,R,0,TAU);g.arc(c,c,HORIZON*k,0,TAU,true);g.fillStyle='rgba(255,59,47,.20)';g.fill();
  g.lineWidth=1*u;g.strokeStyle='rgba(127,167,208,.25)';for(const rr of[Z1,Z2,Z3]){g.beginPath();g.arc(c,c,rr*k,0,TAU);g.stroke()}
  g.strokeStyle='rgba(255,138,92,.8)';g.lineWidth=1.4*u;g.beginPath();g.arc(c,c,HORIZON*k,0,TAU);g.stroke();
  for(const a of asts){if(!a.alive)continue;g.fillStyle=RCOL[a.type];
    if(a.type==='relic'){const x=c+a.pos.x*k,y=c+a.pos.z*k,s=3*u;g.beginPath();g.moveTo(x,y-s);g.lineTo(x+s,y);g.lineTo(x,y+s);g.lineTo(x-s,y);g.closePath();g.fill();continue}const s=(a.type==='ore'?1.3:1.7)*u*(.6+.4*a.amt/a.max);
    g.beginPath();g.arc(c+a.pos.x*k,c+a.pos.z*k,s,0,TAU);g.fill()}
  if(mineTarget&&mineTarget.alive){g.strokeStyle='#58d0c0';g.lineWidth=1.2*u;g.beginPath();g.arc(c+mineTarget.pos.x*k,c+mineTarget.pos.z*k,4*u,0,TAU);g.stroke()}
  // korisť: kosoštvorec vo farbe rarity s bielym okrajom, od Legendárnej aj krúžok
  for(const l of loot){const x=c+l.g.position.x*k,y=c+l.g.position.z*k,s=(3.2+l.it.r*.25)*u;g.fillStyle=RAR[l.it.r].col;g.strokeStyle='#fff';g.lineWidth=.8*u;
    g.beginPath();g.moveTo(x,y-s);g.lineTo(x+s,y);g.lineTo(x,y+s);g.lineTo(x-s,y);g.closePath();g.fill();g.stroke();
    if(l.it.r>=6){g.strokeStyle=RAR[l.it.r].col;g.beginPath();g.arc(x,y,s+3*u,0,TAU);g.stroke()}}
  // misie: fialová hviezda na cieli prieskumu/reliktu
  for(const mk of mMarks){const x=c+mk.m.pos.x*k,y=c+mk.m.pos.z*k;g.fillStyle=MCOL;g.strokeStyle='#fff';g.lineWidth=.8*u;g.beginPath();for(let i=0;i<10;i++){const an=i/10*TAU-Math.PI/2,rr=(i%2?2.2:5)*u;g.lineTo(x+Math.cos(an)*rr,y+Math.sin(an)*rr)}g.closePath();g.fill();g.stroke()}
  // piráti: červené trojuholníky v smere letu
  for(const e of enemies){const x=c+e.pos.x*k,y=c+e.pos.z*k,a=e.body.rotation.y,s=(e.kind==='frigate'?6:e.kind==='corsair'?4.5:3.2)*u,fx=Math.sin(a),fz=Math.cos(a);
    g.fillStyle=e.leaving?'rgba(255,90,74,.45)':e.passive&&!e.hostile?'#ffb35a':'#ff5a4a';   // oranžová = pasívny pirát
    g.beginPath();g.moveTo(x+fx*s,y+fz*s);g.lineTo(x-fx*s*.7+fz*s*.7,y-fz*s*.7-fx*s*.7);g.lineTo(x-fx*s*.7-fz*s*.7,y-fz*s*.7+fx*s*.7);g.closePath();g.fill()}
  // lode NPC: fialový štvorec = zadávateľ misií, zlatý = obchodník
  for(const n of npcs){const x=c+n.pos.x*k,y=c+n.pos.z*k,s=3.4*u;g.fillStyle=n.kind==='trader'?'#ffd27a':MCOL;g.strokeStyle='#fff';g.lineWidth=.8*u;g.fillRect(x-s,y-s,s*2,s*2);g.strokeRect(x-s,y-s,s*2,s*2)}
  // miesto poslednej smrti: červená smrtka (mimo dosahu minimapy sa prilepí k okraju); keď k nemu loď priletí, značka zmizne
  const dp=state.deathPos;if(dp&&dp.s===state.cur&&!dead){if(Math.hypot(ship.position.x-dp.x,ship.position.z-dp.z)<10)state.deathPos=null;
    else{let x=dp.x*k,y=dp.z*k;const L=Math.hypot(x,y),mx=R-6*u;if(L>mx){x*=mx/L;y*=mx/L}miniSkull(g,c+x,c+y,u)}}
  if(gate){g.strokeStyle='#7ef2e2';g.lineWidth=1.4*u;g.beginPath();g.arc(c+gate.position.x*k,c+gate.position.z*k,3.2*u,0,TAU);g.stroke()}
  const won=cur().captured;g.fillStyle=won?'#ffd27a':'#58d0c0';g.beginPath();for(let i=0;i<6;i++){const an=i/6*TAU;g.lineTo(c+Math.cos(an)*4*u,c+Math.sin(an)*4*u)}g.closePath();g.fill();
  g.fillStyle='#ffe2a8';for(const d of drones){g.beginPath();g.arc(c+d.g.position.x*k,c+d.g.position.z*k,1.2*u,0,TAU);g.fill()}
  if(!dead){const sx=c+ship.position.x*k,sz=c+ship.position.z*k,fx=Math.sin(shipYaw),fz=Math.cos(shipYaw);
    g.fillStyle='#ffffff';g.strokeStyle='#04070d';g.lineWidth=1*u;g.beginPath();
    g.moveTo(sx+fx*6*u,sz+fz*6*u);g.lineTo(sx-fx*4*u+fz*3.6*u,sz-fz*4*u-fx*3.6*u);g.lineTo(sx-fx*2*u,sz-fz*2*u);g.lineTo(sx-fx*4*u-fz*3.6*u,sz-fz*4*u+fx*3.6*u);g.closePath();g.fill();g.stroke()}
  g.restore();g.strokeStyle='rgba(130,175,215,.3)';g.lineWidth=1*u;g.beginPath();g.arc(c,c,R-.5,0,TAU);g.stroke()}

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
let padType='xbox',padPrev=[],activePad=null,navT=0,navLast=0;
const G=()=>GLY[padType];
const padKind=id=>/054c|dualsense|dualshock|playstation|wireless controller/i.test(id||'')?'ps':'xbox';
function setMode(m){if(pmSynth||inputMode===m)return;inputMode=m;document.body.classList.toggle('pad',m==='pad');
  document.querySelectorAll('.pg').forEach(el=>el.textContent=G()[el.dataset.g]);applyFocus();lastHint=''}
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
  if(!$('#intro').hidden){
    if(press(14)||press(15)){const i=DIFFS.indexOf(pendingDiff);pendingDiff=DIFFS[(i+(press(15)?1:DIFFS.length-1))%DIFFS.length];renderIntro()}
    if(press(2))setLang(lang==='sk'?'en':'sk');if(press(0)||press(9))startGame()}
  else if(sheetTab){
    // v0.17: pohyb výberu v menu všetkými 4 smermi (krížový ovládač; ľavá páčka len ak nie je zapnutý kurzor myši)
    let vx=dx,vy=dy;if(!vx&&!vy&&!pm){if(Math.abs(lx)>.55&&Math.abs(lx)>=Math.abs(ly))vx=Math.sign(lx);else if(Math.abs(ly)>.55)vy=Math.sign(ly)}
    const key=vx*3+vy;navT-=dt;
    if(key&&(key!==navLast||navT<=0)){moveFocusDir(vx,vy);navT=key===navLast?.14:.38}navLast=key;
    if(press(0)&&!pm)activateFocus();if(press(1))closeSheet();if(press(4))cycleTab(-1);if(press(5))cycleTab(1);
    if(press(3))toggleTab('station');if(press(2))toggleTab('ship');if(press(9))toggleTab('map');if(press(6))toggleTab('gear')}
  else{if(!pm){padVec.set(lx+dx,0,ly+dy);if(padVec.lengthSq()>1)padVec.normalize()}   // s kurzorom myši je ovládanie lode páčkou vypnuté
    if(press(8))toggleAutopilot();if(!pm&&(press(0)||press(7)))padAct();if(!pm&&(press(4)||press(5)))padCycle(press(5)?1:-1);if(press(1))goHome();if(press(3))openSheet('station');if(press(2))openSheet('ship');if(press(9))openSheet('map');if(press(6))openSheet('gear')}
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

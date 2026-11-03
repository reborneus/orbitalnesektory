'use strict';
/* ==================== == 8. VSTUP ====================
   inputMode: 'touch' | 'mouse' | 'key' | 'pad' – podľa neho sa menia nápovedy (napr. 'stlač A' vs 'ťukni'). */
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),ground=new THREE.Plane(new V3(0,1,0),0);
const pointers=new Map();let downPos=null,dragging=false,pinch0=0,zoom0=1,zoom=isTouch?1.08:1;
let inputMode=isTouch?'touch':'mouse';
const ZMIN=.55,ZMAX=2;
function toNdc(x,y){const r=canvas.getBoundingClientRect();ndc.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera)}
function groundAt(x,y){toNdc(x,y);const p=new V3();return ray.ray.intersectPlane(ground,p)?p:null}
function clampLimit(p){const r=Math.hypot(p.x,p.z);if(r>LIMIT-2)p.multiplyScalar((LIMIT-2)/r);return p}
function tapAt(x,y){autoPause=6;toNdc(x,y);const hits=ray.intersectObjects(pickables,false);
  for(const h of hits){const u=h.object.userData;
    if(u.ast&&u.ast.alive){cmdMine(u.ast);flashMarker(u.ast.pos,'#58d0c0');return}
    if(u.station){if(nearStation())openSheet('station');else{cmdHome();openOnArrive=true}return}
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
const mini=$('#mini'),mctx=mini.getContext('2d');const MINI_R=200;
mini.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();setMode(e.pointerType==='touch'?'touch':'mouse');
  const r=mini.getBoundingClientRect();const x=((e.clientX-r.left)/r.width*2-1)*MINI_R,z=((e.clientY-r.top)/r.height*2-1)*MINI_R;
  const p=clampLimit(new V3(x,0,z));cmdMove(p);flashMarker(p,'#58d0c0')});
function sizeMini(){const css=mini.clientWidth||150;const dpr=Math.min(devicePixelRatio||1,2);const px=Math.round(css*dpr);if(mini.width!==px){mini.width=px;mini.height=px}}
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
  if(gate){g.strokeStyle='#7ef2e2';g.lineWidth=1.4*u;g.beginPath();g.arc(c+gate.position.x*k,c+gate.position.z*k,3.2*u,0,TAU);g.stroke()}
  const won=cur().captured;g.fillStyle=won?'#ffd27a':'#58d0c0';g.beginPath();for(let i=0;i<6;i++){const an=i/6*TAU;g.lineTo(c+Math.cos(an)*4*u,c+Math.sin(an)*4*u)}g.closePath();g.fill();
  g.fillStyle='#ffe2a8';for(const d of drones){g.beginPath();g.arc(c+d.g.position.x*k,c+d.g.position.z*k,1.2*u,0,TAU);g.fill()}
  if(!dead){const sx=c+ship.position.x*k,sz=c+ship.position.z*k,fx=Math.sin(shipYaw),fz=Math.cos(shipYaw);
    g.fillStyle='#ffffff';g.strokeStyle='#04070d';g.lineWidth=1*u;g.beginPath();
    g.moveTo(sx+fx*6*u,sz+fz*6*u);g.lineTo(sx-fx*4*u+fz*3.6*u,sz-fz*4*u-fx*3.6*u);g.lineTo(sx-fx*2*u,sz-fz*2*u);g.lineTo(sx-fx*4*u-fz*3.6*u,sz-fz*4*u+fx*3.6*u);g.closePath();g.fill();g.stroke()}
  g.restore();g.strokeStyle='rgba(130,175,215,.3)';g.lineWidth=1*u;g.beginPath();g.arc(c,c,R-.5,0,TAU);g.stroke()}

/* keyboard */
const keys=new Set();const MOVE_KEYS=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'];
addEventListener('keydown',e=>{const k=e.key.toLowerCase();const inUI=e.target.closest&&e.target.closest('#sheet,.intro');
  if(k==='escape'){closeSheet();return}
  if(MOVE_KEYS.includes(k)){if(inUI&&k.startsWith('arrow'))return;if(!$('#intro').hidden)return;keys.add(k);setMode('key');e.preventDefault();return}
  if(e.repeat||inUI)return;
  if(k===' '){e.preventDefault();if(document.activeElement&&document.activeElement!==canvas)document.activeElement.blur();setMode('key');mineNearest()}
  else if(k==='h'){setMode('key');goHome()}
  else if(k==='p'){setMode('key');toggleAutopilot()}
  else if(k==='1')toggleTab('station');else if(k==='2')toggleTab('ship');else if(k==='3')toggleTab('map');else if(k==='i')toggleTab('gear')});
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
function setMode(m){if(inputMode===m)return;inputMode=m;document.body.classList.toggle('pad',m==='pad');
  document.querySelectorAll('.pg').forEach(el=>el.textContent=G()[el.dataset.g]);applyFocus();lastHint=''}
addEventListener('gamepadconnected',e=>{padType=padKind(e.gamepad.id);inputMode='';setMode('pad');toast(t('tt.padOn',{k:padType==='ps'?'PlayStation':'Xbox'}))});
addEventListener('gamepaddisconnected',()=>{activePad=null;padVec.set(0,0,0);if(inputMode==='pad')setMode(isTouch?'touch':'mouse');toast(t('tt.padOff'))});
function rumble(k,ms){const va=activePad&&activePad.vibrationActuator;if(!va||!va.playEffect)return;
  try{const r=va.playEffect('dual-rumble',{duration:ms,strongMagnitude:clamp(k,0,1),weakMagnitude:clamp(k*1.2,0,1)});if(r&&r.catch)r.catch(()=>{})}catch(e){}}
function pollPad(dt){let pads=[];try{pads=navigator.getGamepads?navigator.getGamepads():[]}catch(e){return}
  let p=null;for(const g of pads||[])if(g&&g.connected){p=g;break}
  activePad=p;if(!p){padVec.set(0,0,0);padPrev=[];return}
  const btn=i=>{const b=p.buttons[i];return!!(b&&(b.pressed||b.value>.5))};const press=i=>btn(i)&&!padPrev[i];
  let lx=p.axes[0]||0,ly=p.axes[1]||0;const m=Math.hypot(lx,ly);
  if(m<.2){lx=0;ly=0}else{const k=Math.min(1,(m-.2)/.8)/m;lx*=k;ly*=k}
  const dx=(btn(15)?1:0)-(btn(14)?1:0),dy=(btn(13)?1:0)-(btn(12)?1:0);
  if(inputMode!=='pad'&&(m>=.2||p.buttons.some((b,i)=>btn(i)))){padType=padKind(p.id);setMode('pad')}
  padVec.set(0,0,0);
  if(!$('#intro').hidden){
    if(press(14)){pendingDiff='easy';renderIntro()}if(press(15)){pendingDiff='hard';renderIntro()}
    if(press(2))setLang(lang==='sk'?'en':'sk');if(press(0)||press(9))startGame()}
  else if(sheetTab){
    const v=dy||(Math.abs(ly)>.55?Math.sign(ly):0);navT-=dt;
    if(v&&(v!==navLast||navT<=0)){moveFocus(v);navT=v===navLast?.14:.38}navLast=v;
    if(sheetTab==='ship'){if(press(14))cycleGroup(-1);if(press(15))cycleGroup(1)}
    if(press(0))activateFocus();if(press(1))closeSheet();if(press(4))cycleTab(-1);if(press(5))cycleTab(1);
    if(press(3))toggleTab('station');if(press(2))toggleTab('ship');if(press(9))toggleTab('map');if(press(6))toggleTab('gear')}
  else{padVec.set(lx+dx,0,ly+dy);if(padVec.lengthSq()>1)padVec.normalize();
    if(press(8))toggleAutopilot();if(press(0)||press(7))mineNearest();if(press(1))goHome();if(press(3))openSheet('station');if(press(2))openSheet('ship');if(press(9))openSheet('map');if(press(6))openSheet('gear')}
  const ry=p.axes[3]||0;if(Math.abs(ry)>.2)zoom=clamp(zoom*(1+ry*dt*1.2),ZMIN,ZMAX);
  padPrev=p.buttons.map((b,i)=>btn(i))}

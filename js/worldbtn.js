'use strict';
/* ==================== v0.33: TLAČIDLÁ NA OBJEKTOCH (stanica, zadávateľ misií, obchodník, brána) ====================
   Nad každým objektom je polopriehľadné okrúhle tlačidlo (HTML prvok premietnutý z 3D polohy). Menu sa otvára LEN
   cez neho – klik inde na stanicu/NPC/bránu je obyčajný presun lode a pri prelete sa okno samo neotvorí.
   Myš nad tlačidlom ho zvýrazní. Keď je loď v dosahu, tlačidlo svieti (trieda .ready) a klik otvorí menu hneď;
   mimo dosahu loď k objektu doletí a menu otvorí po prílete. */
const WB_ICON={
  station:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="9.5" ry="4"/><path d="M12 2.5v3M12 18.5v3"/></svg>',
  giver:'<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6 .6-4.5 4 1.3 6L12 16.2 6.6 19.2l1.3-6-4.5-4 6-.6z"/></svg>',
  trader:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2c-.6-1-1.7-1.5-2.8-1.5-1.6 0-2.8.9-2.8 2.1 0 2.9 5.8 1.6 5.8 4.4 0 1.2-1.3 2.1-3 2.1-1.2 0-2.3-.5-2.9-1.5M12 6v1.7M12 16.3V18"/></svg>',
  gate:'<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="5" ry="8.5"/><path d="M3 12h4M17 12h4M19 9.5l2 2.5-2 2.5"/></svg>'};
const WB_LBL={station:'dock.station',giver:'npc.giver',trader:'npc.trader',gate:'sh.gate'};
let wbLayer=null,gateOpenOnArrive=false;const wbEls={},_wbv=new V3();
function wbEl(k){if(wbEls[k])return wbEls[k];if(!wbLayer){wbLayer=document.createElement('div');wbLayer.id='wbtns';document.body.appendChild(wbLayer)}
  const b=document.createElement('button');b.className='wbtn '+k;b.type='button';b.innerHTML=`<span class="wbi">${WB_ICON[k]}</span><span class="wbl"></span>`;
  b.addEventListener('click',e=>{e.stopPropagation();wbAct(k)});b.addEventListener('pointerdown',e=>e.stopPropagation());
  wbLayer.appendChild(b);return wbEls[k]=b}
/* kotva tlačidla vo svete (null = objekt v sektore nie je) a či je loď v dosahu */
function wbInfo(k){
  if(k==='station'){if(!stationG||inArena())return null;return{p:_wbv.set(0,STATION_Y+DECK_TOP+4,-(DECK_R-1.2)*ST_SCALE),near:nearStation(),d:Math.max(0,Math.hypot(ship.position.x,ship.position.z)-STATION_R)}}
  if(k==='gate'){if(!gate)return null;const d=ship.position.distanceTo(gate.position);return{p:_wbv.copy(gate.position).setY(gate.position.y+9*GATE_K),near:d<18*GATE_K,d:Math.max(0,d-18*GATE_K)}}
  const n=typeof npcOf==='function'&&npcOf(k);if(!n)return null;return{p:_wbv.copy(n.pos).setY(7),near:nearNpc(k),d:Math.max(0,npcDist(k)-NPC_RANGE)}}
function wbAct(k){if(dead||jumping)return;autoPause=6;
  if(k==='station'){if(nearStation())openSheet('station');else{cmdHome();openOnArrive=true}return}
  if(k==='gate'){if(ship.position.distanceTo(gate.position)<18*GATE_K){openSheet('gate');return}
    const d=new V3().subVectors(ship.position,gate.position).setY(0),L=d.length()||1;cmdMove(gate.position.clone().addScaledVector(d,10*GATE_K/L));gateOpenOnArrive=true;flashMarker(gate.position,'#7ef2e2');return}
  npcTap(k)}
/* každý snímok: poloha na obrazovke, stav (v dosahu / ďaleko), skrytie mimo obrazovky, v menu, pri smrti a s otvoreným oknom */
function tickWorldBtns(){const hide=!state||!$('#intro').hidden||dead||jumping||!!sheetTab||document.body.classList.contains('hudedit');
  for(const k of['station','giver','trader','gate']){const el=wbEls[k]||(hide?null:wbEl(k));if(!el)continue;const I=hide?null:wbInfo(k);
    if(!I){el.hidden=true;continue}
    const v=I.p.clone().project(camera);if(v.z>1||Math.abs(v.x)>1.05||Math.abs(v.y)>1.05){el.hidden=true;continue}
    el.hidden=false;const x=(v.x+1)/2*innerWidth,y=(1-v.y)/2*innerHeight;el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`;
    el.classList.toggle('ready',I.near);const lbl=t(WB_LBL[k])+(I.near?'':` · ${Math.round(I.d)} m`);const L=el.lastChild;if(L.textContent!==lbl)L.textContent=lbl}
  // brána: menu po prílete (len ak hráč klikol na tlačidlo)
  if(gateOpenOnArrive){if(!gate||moveTarget===null&&!(ship.position.distanceTo(gate.position)<18*GATE_K))gateOpenOnArrive=false;
    else if(ship.position.distanceTo(gate.position)<18*GATE_K){gateOpenOnArrive=false;openSheet('gate')}}}

'use strict';
/* ==================== == 6. SEKTOR ====================
   buildSector() postaví celý sektor nanovo (pri štarte a po skoku): pozadie, zóny, asteroidy, stanicu, bránu.
   Asteroid (objekt a): type, amt/max = zostávajúce/pôvodné množstvo, alive, respawn = sekundy do znovuobjavenia,
   rmin/rmax = pás, v ktorom sa smie objaviť, claims = koľko dronov si ho práve zabralo. */
let world=null,asts=[],pickables=[],stationG=null,stationAnim=null,gate=null,drones=[];
const STATION_R=14;
function slotPos(i){const a=i/6*TAU+Math.PI/6;return new V3(Math.cos(a)*12.5,0,Math.sin(a)*12.5)}

function nebulaTex(c1,c2,seed){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');const r=rng(seed);
  g.fillStyle='#000';g.fillRect(0,0,512,512);g.globalCompositeOperation='lighter';
  for(let i=0;i<26;i++){const x=r()*512,y=r()*512,rad=60+r()*190;const gr=g.createRadialGradient(x,y,0,x,y,rad);const cc=r()<.5?c1:c2;
    gr.addColorStop(0,cc+'55');gr.addColorStop(.5,cc+'22');gr.addColorStop(1,cc+'00');g.fillStyle=gr;g.fillRect(0,0,512,512)}
  const tx=new THREE.CanvasTexture(c);tx.encoding=THREE.sRGBEncoding;return tx}
function planetTex(base,seed){const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d');const r=rng(seed);const b=new THREE.Color(base);
  for(let y=0;y<256;y++){const n=Math.sin(y*.07+r()*.3)*.18+Math.sin(y*.21)*.08+(r()-.5)*.06;const k=.7+n;
    g.fillStyle=`rgb(${clamp(b.r*255*k,0,255)|0},${clamp(b.g*255*k,0,255)|0},${clamp(b.b*255*k,0,255)|0})`;g.fillRect(0,y,512,1)}
  for(let i=0;i<40;i++){g.fillStyle=`rgba(255,255,255,${r()*.06})`;g.beginPath();g.ellipse(r()*512,r()*256,20+r()*80,2+r()*6,0,0,TAU);g.fill()}
  const tx=new THREE.CanvasTexture(c);tx.encoding=THREE.sRGBEncoding;return tx}
const flatRing=(r0,r1,color,op,add,y)=>{const m=new THREE.Mesh(new THREE.RingGeometry(r0,r1,180,1),new THREE.MeshBasicMaterial({color:new THREE.Color(color),transparent:true,opacity:op,depthWrite:false,side:THREE.DoubleSide,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));m.rotation.x=-Math.PI/2;m.position.y=y;return m};

function buildSector(){
  if(world)scene.remove(world);
  world=new THREE.Group();scene.add(world);asts=[];pickables=[];drones=[];gate=null;loot=[];
  const S=SECTORS[state.cur];
  const neb=new THREE.Mesh(new THREE.PlaneGeometry(3000,3000),new THREE.MeshBasicMaterial({map:nebulaTex(S.neb[0],S.neb[1],S.seed),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.95}));
  neb.rotation.x=-Math.PI/2;neb.position.y=-500;world.add(neb);
  const planet=new THREE.Mesh(new THREE.SphereGeometry(110,48,32),new THREE.MeshStandardMaterial({map:planetTex(S.planet,S.seed),roughness:1,metalness:0}));
  planet.position.set(...S.pPos);planet.rotation.z=.35;world.add(planet);world.userData.planet=planet;
  const atm=glow(S.planet,330,.35);atm.position.copy(planet.position);world.add(atm);
  // zones: rings at the belt borders, a faint amber wash over the radiation belts 3-4, red past the horizon
  for(const rr of[Z1,Z2,Z3])world.add(flatRing(rr-.2,rr+.2,'#7fa7d0',.09,false,-2));
  world.add(flatRing(Z2,HORIZON,'#ff9a4d',.035,true,-2.2));
  world.add(flatRing(HORIZON,LIMIT+80,'#ff3b2f',.07,true,-2.3));
  world.add(flatRing(HORIZON-.5,HORIZON+.5,'#ff8a5c',.5,false,-1.8));
  const r=rng(S.seed*97);
  for(const f of S.fields)for(let i=0;i<f.n;i++){const a=makeAst(f.type,f,r);placeAst(a,r);asts.push(a)}
  rebuildStation();
  updateGate();
}

function makeAst(type,f,r){const g=new THREE.Group();const S=SECTORS[state.cur];
  const base=type==='relic'?.9+r()*.45:type==='crystal'?1.8+r()*1.5:type==='green'?1.7+r()*1.9:1.6+r()*2.3;
  const geos=GEOS[type];
  const rock=new THREE.Mesh(geos[(r()*geos.length)|0],M.rock);
  rock.scale.set(1,.7+r()*.4,.85+r()*.3);rock.rotation.set(r()*TAU,r()*TAU,r()*TAU);g.add(rock);
  if(type==='crystal'){for(let k=0;k<5;k++){const s=new THREE.Mesh(SHARD,M.crystal);const d=new V3(r()-.5,r()*.8+.2,r()-.5).normalize();
      s.position.copy(d).multiplyScalar(.75);s.quaternion.setFromUnitVectors(UP_,d);s.scale.set(.18+r()*.1,.5+r()*.45,.18+r()*.1);g.add(s)}
    g.add(glow('#9b7bff',5.5,.4))}
  else if(type==='green'){for(let k=0;k<3;k++){const s=new THREE.Mesh(SHARD,M.viridit);const d=new V3(r()-.5,r()*.6+.3,r()-.5).normalize();
      s.position.copy(d).multiplyScalar(.85);s.quaternion.setFromUnitVectors(UP_,d);s.scale.set(.22,.32+r()*.2,.22);g.add(s)}
    g.add(glow('#86e05a',4.6,.26))}
  else if(type==='relic'){for(let k=0;k<4;k++){const s=new THREE.Mesh(SHARD,M.relic);const d=new V3(r()-.5,r()*.7+.3,r()-.5).normalize();
      s.position.copy(d).multiplyScalar(.8);s.quaternion.setFromUnitVectors(UP_,d);s.scale.set(.16,.4+r()*.25,.16);g.add(s)}
    const sp=glow('#ffd87a',4.2,.55);g.add(sp);g.userData.spark=sp}
  else g.add(glow('#f0a644',3.6,.16));
  const proxy=new THREE.Mesh(new THREE.SphereGeometry(1.9,8,6),M.pick);g.add(proxy);
  const mult={ore:30,green:20,crystal:12,relic:8}[type];const max=Math.round(base*mult*S.rich);
  const a={g,type,base,amt:max,max,alive:true,respawn:0,shrink:1,claims:0,spin:new V3((r()-.5)*.5,(r()-.5)*.6,(r()-.5)*.4),pos:g.position,rmin:f.r[0],rmax:f.r[1]};
  proxy.userData.ast=a;pickables.push(proxy);world.add(g);return a}
function placeAst(a,r){for(let tries=0;tries<14;tries++){const ang=r()*TAU;const rad=a.rmin+r()*(a.rmax-a.rmin);
    a.g.position.set(Math.cos(ang)*rad,(r()-.5)*3,Math.sin(ang)*rad);
    if(gate&&a.g.position.distanceTo(gate.position)<12)continue;
    if(a.g.position.distanceTo(ship.position)<16)continue;
    if(!asts.some(o=>o!==a&&o.alive&&o.g.position.distanceTo(a.g.position)<a.base+o.base+3))break}
  setAstScale(a)}
/* Veľkosť asteroidu sa zmenšuje podľa toho, koľko z neho zostáva (na polovicu pri úplnom vyťažení). */
function astScale(a){return a.base*(.5+.5*a.amt/a.max)*a.shrink}
function setAstScale(a){a.g.scale.setScalar(Math.max(.001,astScale(a)))}

/* Stanica sa prestavia pri každej zmene (vylepšenie jadra, stavba/predaj modulu). Vzhľad závisí od úrovne jadra. */
function rebuildStation(){
  if(stationG)world.remove(stationG);
  const s=cur();const g=new THREE.Group();stationG=g;const anim={rings:[],turrets:[],dishes:[],blink:[]};stationAnim=anim;
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(2.6,3.3,4.2,12),M.metal);g.add(hub);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(2.4,16,8,0,TAU,0,Math.PI/2),M.plate);dome.position.y=2.1;g.add(dome);
  const under=new THREE.Mesh(new THREE.ConeGeometry(3.2,3,12),M.dark);under.rotation.x=Math.PI;under.position.y=-3.6;g.add(under);
  const ring=new THREE.Group();g.add(ring);anim.rings.push({o:ring,s:.12});
  const tor=new THREE.Mesh(new THREE.TorusGeometry(7.2,.6,8,56),M.plate);tor.rotation.x=Math.PI/2;ring.add(tor);
  for(let i=0;i<4;i++){const sp=new THREE.Mesh(new THREE.BoxGeometry(7,.3,.5),M.dark);sp.rotation.y=i*Math.PI/4;ring.add(sp)}
  for(let i=0;i<18;i++){const a=i/18*TAU;const w=new THREE.Mesh(new THREE.BoxGeometry(.5,.32,.2),M.window);w.position.set(Math.cos(a)*7.85,0,Math.sin(a)*7.85);w.rotation.y=-a+Math.PI/2;ring.add(w)}
  if(s.core>=2){const r2=new THREE.Group();r2.position.y=1.6;g.add(r2);anim.rings.push({o:r2,s:-.25});
    const t2=new THREE.Mesh(new THREE.TorusGeometry(4.4,.32,6,40),M.metal);t2.rotation.x=Math.PI/2;r2.add(t2);
    for(let i=0;i<10;i++){const a=i/10*TAU;const w=new THREE.Mesh(new THREE.BoxGeometry(.35,.22,.16),M.hullGlow);w.position.set(Math.cos(a)*4.75,0,Math.sin(a)*4.75);w.rotation.y=-a+Math.PI/2;r2.add(w)}}
  if(s.core>=3){const mast=new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,5,6),M.metal);mast.position.y=5.5;g.add(mast);
    const b=glow('#ff6a4d',2.4,1);b.position.y=8.1;g.add(b);anim.blink.push({o:b,f:1.3,base:2.4})}
  if(s.core>=4){for(const sd of[-1,1]){const arm=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,6),M.dark);arm.position.set(0,-1,sd*5);g.add(arm);
      const pan=new THREE.Mesh(new THREE.BoxGeometry(4.2,.1,3.2),M.panel);pan.position.set(0,-1,sd*9.2);g.add(pan)}}
  if(s.core>=5){const halo=new THREE.Mesh(new THREE.TorusGeometry(10,.12,6,80),M.hullGlow);halo.rotation.x=Math.PI/2;halo.position.y=-.6;g.add(halo)}
  const beacon=glow(s.captured?'#ffd27a':'#58d0c0',s.captured?9:6,.85);beacon.position.y=3.8;g.add(beacon);anim.blink.push({o:beacon,f:.6,base:s.captured?9:6});
  const aura=glow(s.captured?'#ffd27a':'#58d0c0',34,.1);aura.position.y=-1;g.add(aura);
  const n=slotsFor(s.core);
  for(let i=0;i<n;i++){const p=slotPos(i);const pad=new THREE.Mesh(new THREE.CylinderGeometry(2,2,.35,6),M.pad);pad.position.copy(p).setY(-.9);g.add(pad);
    const con=new THREE.Mesh(new THREE.BoxGeometry(.35,.35,5),M.dark);con.position.copy(p).multiplyScalar(.78).setY(-.9);con.lookAt(0,-.9,0);g.add(con);
    const m=s.slots[i];
    if(!m){const e=glow('#58d0c0',3.4,.35);e.position.copy(p).setY(-.4);g.add(e);anim.blink.push({o:e,f:.4,base:3.4,soft:1})}
    else g.add(makeModule(m,p,anim))}
  const proxy=new THREE.Mesh(new THREE.SphereGeometry(STATION_R,10,8),M.pick);proxy.userData.station=true;g.add(proxy);
  pickables=pickables.filter(p=>!p.userData.station);pickables.push(proxy);
  world.add(g);
  syncDrones();
}
function makeModule(type,p,anim){const g=new THREE.Group();g.position.copy(p);g.lookAt(0,0,0);
  if(type==='drone'){const b=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.7,2.6),M.plate);b.position.y=.2;g.add(b);
    const door=new THREE.Mesh(new THREE.BoxGeometry(2.2,.9,.1),M.amber);door.position.set(0,.1,-1.32);g.add(door);
    const roof=new THREE.Mesh(new THREE.BoxGeometry(2.6,.3,2),M.dark);roof.position.y=1.2;g.add(roof);
    const l=glow('#f0a644',3,.6);l.position.set(0,.1,-1.6);g.add(l)}
  else if(type==='tower'){const base=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.5,1.4,8),M.plate);base.position.y=-.1;g.add(base);
    const tur=new THREE.Group();tur.position.y=1;g.add(tur);const head=new THREE.Mesh(new THREE.BoxGeometry(1.5,.8,1.6),M.metal);tur.add(head);
    for(const sd of[-1,1]){const br=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,2.2,6),M.dark);br.rotation.x=Math.PI/2;br.position.set(.38*sd,.1,1.5);tur.add(br);
      const tip=glow('#ff6a4d',1.1,.9);tip.position.set(.38*sd,.1,2.6);tur.add(tip)}
    anim.turrets.push({o:tur,ph:Math.random()*TAU})}
  else if(type==='sensor'){const post=new THREE.Mesh(new THREE.CylinderGeometry(.18,.25,2.6,6),M.metal);post.position.y=.6;g.add(post);
    const dg=new THREE.Group();dg.position.y=1.9;g.add(dg);
    const dish=new THREE.Mesh(new THREE.SphereGeometry(1.7,16,6,0,TAU,0,Math.PI/3.2),M.metal);dish.rotation.x=Math.PI*.75;dg.add(dish);
    const feed=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,1.4,4),M.dark);feed.rotation.x=-Math.PI/4;feed.position.set(0,.45,.45);dg.add(feed);
    const bl=glow('#a98bff',2.4,1);bl.position.set(0,.95,.95);dg.add(bl);anim.blink.push({o:bl,f:2.1,base:2.4});anim.dishes.push({o:dg})}
  return g}

/* Skoková brána: v prvom sektore sa objaví až po jeho obsadení, v ďalších je vždy. Vzdialenosť 72 m od stanice, smer určuje seed sektora. */
function updateGate(){if(gate){world.remove(gate);pickables=pickables.filter(p=>!p.userData.gate);gate=null}
  const s=cur();if(!(s.captured||state.cur>0))return;
  const r=rng(SECTORS[state.cur].seed+5);const ang=r()*TAU;
  gate=new THREE.Group();gate.position.set(Math.cos(ang)*72,0,Math.sin(ang)*72);gate.lookAt(0,0,0);
  const ringG=new THREE.Group();gate.add(ringG);
  ringG.add(new THREE.Mesh(new THREE.TorusGeometry(5.2,.55,8,48),M.plate));
  ringG.add(new THREE.Mesh(new THREE.TorusGeometry(4.5,.14,6,48),M.hullGlow));
  for(let i=0;i<6;i++){const a=i/6*TAU;const n=new THREE.Mesh(new THREE.BoxGeometry(.9,1.4,1.4),M.metal);n.position.set(Math.cos(a)*5.4,Math.sin(a)*5.4,0);n.rotation.z=a;ringG.add(n)}
  const core=glow('#7ef2e2',9,.55);gate.add(core);gate.userData.ring=ringG;gate.userData.core=core;
  const proxy=new THREE.Mesh(new THREE.SphereGeometry(7,8,6),M.pick);proxy.userData.gate=true;gate.add(proxy);pickables.push(proxy);
  world.add(gate);
  for(const a of asts)if(a.alive&&a.pos.distanceTo(gate.position)<12)placeAst(a,Math.random)}

/* drones: mine only ore in the inner belts */
const DRONE_GEO=new THREE.OctahedronGeometry(.55,0);
function syncDrones(){const s=cur();const docks=[];s.slots.forEach((m,i)=>{if(m==='drone'&&i<slotsFor(s.core))docks.push(i)});
  while(drones.length<docks.length){const g=new THREE.Group();const b=new THREE.Mesh(DRONE_GEO,M.metal);b.scale.set(1,.6,1.7);g.add(b);
    const e=glow('#f0a644',1.8,.9);e.position.z=-.9;g.add(e);
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V3(),new V3()]),new THREE.LineBasicMaterial({color:new THREE.Color('#f0a644'),transparent:true,opacity:.8,blending:THREE.AdditiveBlending}));
    line.visible=false;line.frustumCulled=false;world.add(line);
    const d={g,line,state:'seek',t:null,load:0,home:new V3(),wait:Math.random()*1.5};g.position.copy(slotPos(docks[drones.length])).multiplyScalar(.92);world.add(g);drones.push(d)}
  while(drones.length>docks.length){const d=drones.pop();world.remove(d.g);world.remove(d.line);if(d.t)d.t.claims=Math.max(0,d.t.claims-1);if(d.load>0)state.ore+=d.load}
  drones.forEach((d,i)=>d.home.copy(slotPos(docks[i])).multiplyScalar(.85).setY(1))}
/* Dron: seek (hľadá rudu v pásoch 1–2) -> go (letí) -> mine (ťaží do 15 t) -> back (vezie na stanicu). */
function tickDrones(dt,tt){const sp=16,cap=15,rate=4;
  for(const d of drones){const p=d.g.position;
    if(d.wait>0){d.wait-=dt;continue}
    if(d.state==='seek'){let best=null,bd=1e9;for(const a of asts){if(!a.alive||a.amt<=0||a.type!=='ore'||a.rmax>Z2)continue;const dd=p.distanceTo(a.pos)+a.claims*25;if(dd<bd){bd=dd;best=a}}
      if(best){d.t=best;best.claims++;d.state='go'}else{d.wait=1}}
    if(d.state==='go'){const a=d.t;if(!a.alive){a.claims=Math.max(0,a.claims-1);d.state='seek';continue}const stop=astScale(a)*1.1+2.4;const dist=moveTo(d.g,a.pos,sp,dt,stop);if(dist<=stop+.05)d.state='mine'}
    if(d.state==='mine'){const a=d.t;if(!a.alive||a.amt<=0){a.claims=Math.max(0,a.claims-1);d.line.visible=false;d.state=d.load>0?'back':'seek';continue}
      const take=Math.min(rate*dt,a.amt,cap-d.load);a.amt-=take;d.load+=take;setAstScale(a);
      if(a.amt<=0)depleteAst(a);
      const pos=d.line.geometry.attributes.position;pos.setXYZ(0,p.x,p.y,p.z);pos.setXYZ(1,a.pos.x,a.pos.y,a.pos.z);pos.needsUpdate=true;d.line.visible=true;
      d.line.material.opacity=.5+Math.random()*.4;
      if(d.load>=cap-.01){a.claims=Math.max(0,a.claims-1);d.line.visible=false;d.state='back'}}
    if(d.state==='back'){const dist=moveTo(d.g,d.home,sp,dt,.3);if(dist<=.4){state.ore+=d.load;bump('#oreTxt');d.load=0;d.state='seek';d.wait=.8}}
    d.g.position.y+=Math.sin(tt*3+d.home.x)*.004}}
const _v=new V3();
function moveTo(obj,target,speed,dt,stop){_v.subVectors(target,obj.position);_v.y=0;const dist=_v.length();
  if(dist>stop){const step=Math.min(speed*dt,dist-stop);_v.normalize();obj.position.addScaledVector(_v,step);obj.rotation.y=Math.atan2(_v.x,_v.z)}
  obj.position.y+=(target.y-obj.position.y)*Math.min(1,dt*2);return Math.max(stop,dist-speed*dt)}
/* byPlayer = vyťažila ho loď hráča (nie dron): vtedy môže padnúť korisť. Relikt vždy, bežný asteroid so šancou ASTEROID_DROP. */
function depleteAst(a,byPlayer){a.alive=false;a.respawn=a.type==='relic'?rnd(RELIC_RESPAWN[0],RELIC_RESPAWN[1]):25+Math.random()*15;
  if(byPlayer){const z=Math.min(5,zoneOf(Math.hypot(a.pos.x,a.pos.z)));
    if(a.type==='relic')spawnLoot(dropItem('relic',z,2),a.pos);else if(Math.random()<ASTEROID_DROP)spawnLoot(dropItem('asteroid',z),a.pos)}
  if(mineTarget===a){if(!autoNext(a))stopMining()}}
/* optional auto-mining: move on to the nearest asteroid of the same resource while cargo has room */
function autoNext(a){if(a.type==='relic'||state.autoMine===false||cargoTotal()>=shipVal('cargo')-.01)return false;let best=null,bd=40;
  for(const o of asts){if(o===a||!o.alive||o.type!==a.type||Math.hypot(o.pos.x,o.pos.z)>=HORIZON)continue;const d=ship.position.distanceTo(o.pos);if(d<bd){bd=d;best=o}}
  if(!best)return false;mineTarget=best;moveTarget=best.pos.clone().setY(0);flashMarker(best.pos,'#58d0c0');return true}
function stopMining(){mineTarget=null;moveTarget=null}

/* ---------- Korisť vo vesmíre ----------
   Predmet, ktorý padol, sa vznáša na mieste so svetelným stĺpom vo farbe rarity (vyššia rarita = vyšší a jasnejší stĺp,
   od Legendárnej krúžok na zemi). Keď je loď bližšie ako 8 m + bonus Dosah zberu, korisť sa pritiahne a uloží do inventára. */
let loot=[],invWarned=false;
const LOOT_GEO=new THREE.OctahedronGeometry(.7,0);
function spawnLoot(it,pos){const g=new THREE.Group();const c=new THREE.Color(RAR[it.r].col);
  const core=new THREE.Mesh(LOOT_GEO,new THREE.MeshBasicMaterial({color:c.clone()}));g.add(core);
  const gl=glow(RAR[it.r].col,4+it.r*.6,.9);g.add(gl);
  const h=5+it.r*1.8,w=.22+it.r*.045;
  const pil=new THREE.Mesh(CYL,new THREE.MeshBasicMaterial({color:c.clone(),transparent:true,opacity:.22+it.r*.03,blending:THREE.AdditiveBlending,depthWrite:false}));
  pil.scale.set(w,h,w);pil.position.y=h/2;g.add(pil);
  let ring=null;if(it.r>=6){ring=new THREE.Mesh(new THREE.RingGeometry(1.5,1.75,48),new THREE.MeshBasicMaterial({color:c.clone(),transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=-.4;g.add(ring)}
  g.position.set(pos.x,.6,pos.z);world.add(g);
  loot.push({g,it,core,gl,pil,ring,ph:Math.random()*TAU,h});
  if(it.r>=6)toast(t('tt.loot',{r:t('r.'+RAR[it.r].k),n:t('base.'+it.b)}),{rar:it.r})}
function nearestLoot(maxD){let best=null,bd=maxD;for(const l of loot){const d=ship.position.distanceTo(l.g.position);if(d<bd){bd=d;best=l}}return best}
function pickLoot(l){state.inv.push(l.it);world.remove(l.g);loot=loot.filter(x=>x!==l);invWarned=false;
  toast(t('tt.loot',{r:t('r.'+RAR[l.it.r].k),n:itemTitle(l.it)?'«'+itemTitle(l.it)+'» '+t('base.'+l.it.b):t('base.'+l.it.b)}),{rar:l.it.r});save();if(sheetTab==='gear')renderSheet()}
function tickLoot(dt,tt){const mag=8+bonus().magnet;
  for(const l of loot.slice()){const k=l.it.r;
    l.core.rotation.y+=dt*(1.2+k*.15);l.core.position.y=Math.sin(tt*2+l.ph)*.3;
    l.pil.material.opacity=(.18+k*.03)*(1+.35*Math.sin(tt*3+l.ph));
    if(l.ring){l.ring.scale.setScalar(1+.15*Math.sin(tt*2.5+l.ph));l.ring.rotation.z+=dt}
    if(k===9){const c=new THREE.Color().setHSL((tt*.15+l.ph)%1,.85,.65);l.core.material.color.copy(c);l.pil.material.color.copy(c);l.gl.material.color.copy(c);if(l.ring)l.ring.material.color.copy(c)}
    if(dead)continue;const d=ship.position.distanceTo(l.g.position);
    if(d<mag){if(state.inv.length>=INV_MAX){if(!invWarned){toast(t('tt.invFull'),'bad');invWarned=true}continue}
      l.g.position.lerp(ship.position,Math.min(1,dt*5));if(d<2.6)pickLoot(l)}}}
/* Pred skokom brána pozbiera korisť, ktorá zostala ležať v sektore (ak je v inventári miesto). */
function collectAllLoot(){let n=0;for(const l of loot.slice()){if(state.inv.length>=INV_MAX)break;state.inv.push(l.it);n++}loot=[];if(n)toast(t('tt.gateLoot'))}

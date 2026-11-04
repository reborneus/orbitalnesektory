'use strict';
/* ==================== == 14. BOJ (piráti, zbrane, veže, obrana dronov) ====================
   Od 2. sektora prichádzajú nájazdy pirátov (nastavenie PIRATES v data.js). Piráti letia na stanicu a strieľajú do nej;
   ak je loď hráča bližšie ako PIRATES.aggro, prepnú sa na ňu (aj keď do nich hráč vystrelí).
   Zbraň lode strieľa sama na najbližšieho piráta v dosahu (alebo na ťuknutého). Veže strieľajú v okruhu okolo stanice,
   drony v obrannom režime (AI jadro rarity Vzácne a vyššej) počas nájazdu útočia namiesto ťažby.
   Keď výdrž stanice klesne na 0, piráti ukradnú časť rudy a viriditu, odletia a moduly sú chvíľu offline (stationDown). */
let enemies=[],bolts=[],raidT=0,raidActive=false,raidCount=0,stationHp=0,stationDown=0,gunCd=0,attackTarget=null,towerCd={};
const raidCfg=()=>PIRATES.raid[state.cur];
const stationMaxHp=()=>PIRATES.stationHp(cur().core);
/* Zavolá sa pri stavbe sektora: vymaže nepriateľov a naplánuje prvý nájazd. */
function resetCombat(){for(const d of dmgTexts)d.el.remove();dmgTexts.length=0;enemies=[];bolts=[];raidActive=false;raidCount=0;stationDown=0;attackTarget=null;towerCd={};
  const c=raidCfg();raidT=c?c.first:0;stationHp=stationMaxHp()}

/* ---------- model piráta ---------- */
const PIR_MAT=new THREE.MeshStandardMaterial({color:col('#3a1218'),metalness:.6,roughness:.4,flatShading:true});
const PIR_GLOW=new THREE.MeshStandardMaterial({color:col('#2a0505'),emissive:col('#ff3b2f'),emissiveIntensity:1.8});
const BAR_GEO=new THREE.PlaneGeometry(3,.3);
function makePirate(kind){const g=new THREE.Group();const body=new THREE.Group();g.add(body);
  const hull=new THREE.Mesh(new THREE.ConeGeometry(.9,3.4,4),PIR_MAT);hull.rotation.x=Math.PI/2;hull.scale.z=.5;body.add(hull);
  for(const s of[-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(2.6,.12,1.2),PIR_MAT);w.position.set(1.2*s,0,-.6);w.rotation.y=.5*s;body.add(w);
    const tip=new THREE.Mesh(new THREE.BoxGeometry(.2,.3,1),PIR_GLOW);tip.position.set(2.3*s,0,-1.1);body.add(tip)}
  if(kind==='frigate'){ // fregata: široký trup, dve veže a štyri motory
    const deck=new THREE.Mesh(new THREE.BoxGeometry(2.4,.7,4.2),PIR_MAT);deck.position.z=-.3;body.add(deck);
    for(const s of[-1,1]){const tw=new THREE.Mesh(new THREE.CylinderGeometry(.45,.55,.6,6),PIR_MAT);tw.position.set(.7*s,.6,.4);body.add(tw);
      const brl=new THREE.Mesh(new THREE.BoxGeometry(.14,.14,1.3),PIR_GLOW);brl.position.set(.7*s,.7,1.1);body.add(brl);
      const e2=glow('#ff6a4d',2.2,.9);e2.position.set(.8*s,0,-2.5);body.add(e2)}
    const ridge=new THREE.Mesh(new THREE.BoxGeometry(.3,.4,3.4),PIR_GLOW);ridge.position.set(0,.45,-.4);body.add(ridge)}
  if(kind==='corsair'){for(const s of[-1,1]){const sp=new THREE.Mesh(new THREE.ConeGeometry(.25,1.6,4),PIR_GLOW);sp.rotation.x=Math.PI/2;sp.position.set(.7*s,.1,1.2);body.add(sp)}}
  const eye=glow('#ff3b2f',2,.9);eye.position.z=1.3;body.add(eye);
  const eng=glow('#ff6a4d',2.6,.9);eng.position.z=-1.9;body.add(eng);
  const sc=kind==='frigate'?2.6:kind==='corsair'?1.8:1;body.scale.setScalar(sc);
  // ukazovateľ výdrže nad pirátom (vodorovný, aby bol vidieť z kamery zhora)
  const bg=new THREE.Mesh(BAR_GEO,new THREE.MeshBasicMaterial({color:new THREE.Color('#2a0808'),transparent:true,opacity:.85,depthWrite:false}));bg.rotation.x=-Math.PI/2;bg.position.set(0,3,-2.6*sc);g.add(bg);
  const bar=new THREE.Mesh(BAR_GEO,new THREE.MeshBasicMaterial({color:new THREE.Color('#ff5a4a'),depthWrite:false}));bar.rotation.x=-Math.PI/2;bar.position.set(0,3.05,-2.6*sc);g.add(bar);
  const proxy=new THREE.Mesh(new THREE.SphereGeometry(2.6*sc,8,6),M.pick);g.add(proxy);
  return{g,body,bar,proxy}}
/* hodnota pre sektor si; ak pre neho nie je zadaná (napr. fregata v nižšom sektore cez admin), použije sa najbližšia nenulová */
const pirStat=(a,si)=>{for(let i=Math.min(si,a.length-1);i<a.length;i++)if(a[i])return a[i];return a[a.length-1]};
/* force = spustiť nájazd aj v sektore bez pirátov (admin panel); vtedy sa použijú hodnoty 2. sektora */
function spawnRaid(force){const c=raidCfg()||(force?PIRATES.raid[1]:null);if(!c)return;const si=Math.max(1,state.cur);const n=c.count[0]+Math.floor(Math.random()*(c.count[1]-c.count[0]+1));const a0=Math.random()*TAU;
  const kinds=[];for(let i=0;i<n;i++)kinds.push('fighter');if(Math.random()<c.corsair)kinds.push('corsair');if(c.frigate&&Math.random()<c.frigate)kinds.push('frigate');
  kinds.forEach((kind,i)=>{const P=PIRATES[kind];const v=makePirate(kind);const a=a0+(i-kinds.length/2)*.09;
    v.g.position.set(Math.cos(a)*(LIMIT-35+Math.random()*10),2,Math.sin(a)*(LIMIT-35+Math.random()*10));world.add(v.g);
    const e={...v,kind,hp:pirStat(P.hp,si)*tierMul('hp'),max:pirStat(P.hp,si)*tierMul('hp'),dmg:pirStat(P.dmg,si)*D().pdmg*tierMul('dmg'),speed:P.speed,range:P.range,fire:P.fire,r:P.r,
      cd:1+Math.random()*2,vel:new V3(),aggro:false,leaving:false,orb:Math.random()<.5?1:-1,pos:v.g.position};
    v.proxy.userData.enemy=e;pickables.push(v.proxy);enemies.push(e)});
  raidActive=true;raidCount=kinds.length;toast(t('tt.raid',{n:kinds.length}),'bad');rumble(.4,300)}

/* ---------- čísla poškodenia (v0.9) ----------
   Nad zasiahnutým cieľom vyletí číslo (fmtN: 1.2K, 3.4M…). kind: player/tower/drone = tvoje zásahy, crit = kritický zásah
   (väčšie, zlaté), hurt = poškodenie tvojej lode. Číslo je HTML prvok v #dmgLayer, poloha sa prepočíta z 3D do obrazovky. */
const dmgTexts=[];let dmgLayer=null;
function dmgText(pos,n,kind){if(!(n>0)||typeof camera==='undefined'||!pos.clone)return;
  if(!dmgLayer){dmgLayer=document.createElement('div');dmgLayer.id='dmgLayer';document.body.appendChild(dmgLayer)}
  if(dmgTexts.length>40){const o=dmgTexts.shift();o.el.remove()}
  const el=document.createElement('div');el.className='dmgt '+kind;el.textContent=kind==='imm'?t('ar.imm'):(kind==='crit'?'✦ ':kind==='hurt'?'−':'')+fmtN(Math.round(n));dmgLayer.appendChild(el);
  dmgTexts.push({el,p:pos.clone().add(new V3((Math.random()-.5)*2,3,(Math.random()-.5)*2)),life:kind==='crit'?1.3:1,max:kind==='crit'?1.3:1})}
function tickDmgText(dt){if(!dmgTexts.length)return;const W=innerWidth,H=innerHeight;
  for(const d of dmgTexts.slice()){d.life-=dt;if(d.life<=0){d.el.remove();dmgTexts.splice(dmgTexts.indexOf(d),1);continue}
    d.p.y+=dt*4;const v=d.p.clone();if(!v.project){d.el.remove();dmgTexts.splice(dmgTexts.indexOf(d),1);continue}v.project(camera);
    const k=d.life/d.max;d.el.style.transform=`translate(${(v.x*.5+.5)*W}px,${(-v.y*.5+.5)*H}px) translate(-50%,-50%) scale(${.8+.4*Math.min(1,(1-k)*6)})`;d.el.style.opacity=Math.min(1,k*2.2)}}
/* ---------- strely ---------- */
function fireBolt(from,to,color,dmg,side,speed,crit){const s=glow(color,side==='enemy'?1.8:1.5,1);s.position.copy(from);world.add(s);
  const dir=new V3().subVectors(to,from);dir.y=0;const dist=dir.length()||1;dir.divideScalar(dist);
  bolts.push({s,vel:dir.multiplyScalar(speed),life:dist/speed*1.4+.2,dmg,side,crit:!!crit})}
function tickBolts(dt){for(const b of bolts.slice()){b.life-=dt;
    if(b.homing&&!dead){const want=new V3().subVectors(ship.position,b.s.position).setY(0).normalize().multiplyScalar(b.vel.length());b.vel.lerp(want,Math.min(1,b.homing*dt));if(Math.random()<dt*20)emit(trail,b.s.position,'#ff9a3a',.4)}
    b.s.position.addScaledVector(b.vel,dt);let hit=false;
    if(b.side==='enemy'){
      if(!dead&&b.s.position.distanceTo(ship.position)<2.6){hit=true;const o=damage(b.dmg,'hit');if(o.hull+o.shield>0)dmgText(ship.position,o.hull+o.shield,'hurt');if(o.hull>0)hurtFlash(.3);if(o.shield>0)bubbleT=1;rumble(.25,90)}
      else if(!inArena()&&stationDown<=0&&Math.hypot(b.s.position.x,b.s.position.z)<11){hit=true;stationHit(b.dmg)}}
    else for(const e of enemies){if(!e.leaving&&b.s.position.distanceTo(e.pos)<e.r+.6){hit=true;hitEnemy(e,b.dmg,b.side);dmgText(e.pos,b.dmg,b.crit?'crit':b.side);break}}
    if(hit){for(let i=0;i<4;i++)emit(debris,b.s.position,b.side==='enemy'?'#ff8a5c':'#c9fff6',.3,new V3((Math.random()-.5)*8,Math.random()*3,(Math.random()-.5)*8))}
    if(hit||b.life<=0){world.remove(b.s);bolts.splice(bolts.indexOf(b),1)}}}

/* ---------- zásahy ---------- */
function stationHit(d){stationHp-=d;if(stationHp<=0)stationDestroyed()}
function stationDestroyed(){const o=Math.floor(state.ore*PIRATES.steal),g=Math.floor(state.green*PIRATES.steal);state.ore-=o;state.green-=g;
  stationDown=PIRATES.offline;stationHp=stationMaxHp()*.4;raidActive=false;for(const e of enemies)e.leaving=true;
  for(let i=0;i<40;i++)emit(debris,new V3(0,2,0),i%2?'#ff8a5c':'#ffe2a8',1+Math.random(),new V3((Math.random()-.5)*26,Math.random()*6,(Math.random()-.5)*26));
  toast(t('tt.stDown',{o,g,s:PIRATES.offline}),'bad');shake=.8;missionRaid(false);save()}
function hitEnemy(e,dmg,side){if(e.invuln)dmg=arenaHitFilter(e,dmg);e.hp-=dmg;if(side==='player')e.aggro=true;e.bar.scale.x=Math.max(.001,e.hp/e.max);e.bar.position.x=-1.5*(1-e.hp/e.max);
  if(e.hp<=0)killEnemy(e)}
function killEnemy(e){const P=PIRATES[e.kind];world.remove(e.g);enemies=enemies.filter(x=>x!==e);pickables=pickables.filter(p=>p!==e.proxy);if(attackTarget===e)attackTarget=null;
  for(let i=0;i<(e.kind==='carrier'?160:e.kind==='dread'?110:e.kind==='frigate'?70:e.kind==='corsair'?40:22);i++)emit(debris,e.pos,['#ff8a5c','#ffe2a8','#ff3b2f'][i%3],.6+Math.random()*.8,new V3((Math.random()-.5)*22,Math.random()*5,(Math.random()-.5)*22));
  missionKill();
  const cr=Math.round(rnd(P.cr[0],P.cr[1])*secGain(state.cur)*crMul());state.credits+=cr;bump('#crTxt');xpAt(XP.kill[e.kind]||0);
  if(Math.random()<P.drop){const z=Math.min(5,zoneOf(Math.hypot(e.pos.x,e.pos.z)));spawnLoot(dropItem(e.kind==='fighter'||e.kind==='swarm'?'enemy':e.kind,Math.max(2,z),e.kind==='frigate'?4:e.kind==='corsair'?3:0),e.pos)}
  if(raidActive&&!enemies.some(x=>!x.leaving)){raidActive=false;const bonus=Math.round(PIRATES.repelBonus*raidCount*crMul());state.credits+=bonus;toast(t('tt.repelled',{c:bonus}),true);missionRaid(true);save()}}

/* ---------- jednotlivé zbrane ---------- */
function nearestEnemy(from,maxD){let best=null,bd=maxD;for(const e of enemies){if(e.leaving||e.manual||e.invuln)continue;const d=from.distanceTo(e.pos);if(d<bd){bd=d;best=e}}return best}
const gunRange=()=>GUN_RANGE+bonus().grange;
function playerGun(dt){gunCd-=dt;if(dead||jumping)return;const R=gunRange();
  let tg=attackTarget&&enemies.includes(attackTarget)&&ship.position.distanceTo(attackTarget.pos)<=R?attackTarget:nearestEnemy(ship.position,R);
  if(!tg||gunCd>0)return;gunCd=1/shipVal('gunRate');const crit=Math.random()<critChance();
  const from=ship.localToWorld(NOSE.clone());const lead=tg.pos.clone().addScaledVector(tg.vel,from.distanceTo(tg.pos)/PIRATES.playerBolt);
  fireBolt(from,lead,crit?'#ffe9a0':'#7ef2e2',shipVal('gun')*(crit?critMult():1),'player',PIRATES.playerBolt,crit)}
function towersFire(dt){if(stationDown>0)return;const s=cur();s.slots.forEach((m,i)=>{if(slotType(m)!=='tower'||i>=slotsFor(s.core))return;
  towerCd[i]=(towerCd[i]||0)-dt;if(towerCd[i]>0)return;const ts=towerStats(m);const tg=nearestEnemy(new V3(0,0,0),ts.range);if(!tg)return;
  towerCd[i]=1/ts.rate;const from=slotPos(i).setY(2.2);fireBolt(from,tg.pos.clone().addScaledVector(tg.vel,.4),RAR[modRar(m)].col,ts.dmg,'tower',PIRATES.playerBolt)})}
/* Dron v obrannom režime: letí k pirátovi pri stanici a strieľa; vráti false, ak v okolí stanice nie je nepriateľ. */
function droneDefend(d,st,dt){const tg=nearestEnemy(new V3(0,0,0),70);if(!tg)return false;
  d.cd-=dt;const dist=d.g.position.distanceTo(tg.pos);moveTo(d.g,tg.pos,st.speed*1.2,dt,st.range*.7);
  if(dist<st.range&&d.cd<=0){d.cd=1;fireBolt(d.g.position,tg.pos,'#ffd27a',st.dmg,'drone',PIRATES.playerBolt)}return true}

/* ---------- správanie pirátov a nájazdy ---------- */
const _ev=new V3(),_tp=new V3();
function tickEnemies(dt,tt){for(const e of enemies.slice()){
    if(e.leaving){_ev.copy(e.pos).setY(0).normalize().multiplyScalar(e.speed*1.4);e.pos.addScaledVector(_ev,dt);e.vel.copy(_ev);e.body.rotation.y=Math.atan2(_ev.x,_ev.z);
      if(Math.hypot(e.pos.x,e.pos.z)>LIMIT+20){world.remove(e.g);enemies=enemies.filter(x=>x!==e);pickables=pickables.filter(p=>p!==e.proxy)}continue}
    const dShip=dead?1e9:e.pos.distanceTo(ship.position);if(dShip<PIRATES.aggro)e.aggro=true;if(!e.arena&&(dead||dShip>PIRATES.aggro*2.2))e.aggro=false;if(e.arena)e.aggro=!dead;
    const onShip=e.aggro;if(onShip)_tp.copy(ship.position).setY(e.pos.y);else _tp.set(0,e.pos.y,0);
    _ev.subVectors(_tp,e.pos);_ev.y=0;const dist=_ev.length();const want=e.range*.75+(onShip?0:10);_ev.normalize();
    const desired=new V3();if(dist>want+2)desired.copy(_ev).multiplyScalar(e.speed);else desired.set(-_ev.z*e.orb,0,_ev.x*e.orb).multiplyScalar(e.speed*.6).addScaledVector(_ev,(dist-want)*.8);
    if(e.stat){desired.set(0,0,0);e.vel.set(0,0,0)}else{e.vel.lerp(desired,Math.min(1,dt*2.5));e.pos.addScaledVector(e.vel,dt);e.pos.y=2+Math.sin(tt*2+e.orb)*.3}
    if(e.vel.lengthSq()>.5)e.body.rotation.y=Math.atan2(e.vel.x,e.vel.z);
    e.cd-=dt;const inRange=dist<=e.range+(onShip?0:10);
    if(inRange&&e.cd<=0&&!(!onShip&&stationDown>0)){e.cd=e.fire*(.8+Math.random()*.4);e.body.rotation.y=Math.atan2(_ev.x,_ev.z);
      if(e.missile){fireMissile(e);continue}
      const tgt=onShip?ship.position.clone().addScaledVector(shipVel,dist/PIRATES.boltSpeed):new V3(0,2,0);
      fireBolt(e.pos.clone(),tgt,'#ff4b3a',e.dmg,'enemy',PIRATES.boltSpeed);
      // boss strieľa dávku striel do vejára
      for(let i=1;i<=e.burst;i++){const sp=(i%2?1:-1)*Math.ceil(i/2)*3;fireBolt(e.pos.clone(),tgt.clone().add(new V3(-_ev.z*sp,0,_ev.x*sp)),'#ff4b3a',e.dmg,'enemy',PIRATES.boltSpeed)}}}}
/* Raketa raketovej veže (aréna): pomalšia, navádza sa na loď, ale zatáča obmedzene – dá sa jej uhnúť. */
function fireMissile(e){const s=glow('#ff9a3a',2.6,1);s.position.copy(e.pos);world.add(s);const dir=new V3().subVectors(ship.position,e.pos).setY(0).normalize();
  bolts.push({s,vel:dir.multiplyScalar(24),life:7,dmg:e.dmg,side:'enemy',homing:1.4})}
function tickCombat(dt,tt){
  if(stationDown>0)stationDown-=dt;
  if(!raidActive&&stationHp<stationMaxHp())stationHp=Math.min(stationMaxHp(),stationHp+PIRATES.stationRegen*dt);
  const c=raidCfg();if(c&&!raidActive&&!enemies.length&&$('#intro').hidden){raidT-=dt;if(raidT<=0){spawnRaid();raidT=rnd(c.every[0],c.every[1])}}
  // útok na vybraného piráta: loď sa drží v dosahu zbrane (ručné ovládanie má prednosť)
  if(attackTarget&&!enemies.includes(attackTarget))attackTarget=null;
  if(attackTarget&&!mineTarget&&inVec.lengthSq()<1e-4){_ev.subVectors(ship.position,attackTarget.pos).setY(0);const d=_ev.length()||1;moveTarget=attackTarget.pos.clone().setY(0).addScaledVector(_ev,gunRange()*.6/d)}
  tickEnemies(dt,tt);playerGun(dt);if(!inArena())towersFire(dt);tickBolts(dt);tickDmgText(dt)}
function cmdAttack(e){attackTarget=e;mineTarget=null;autoPause=6;flashMarker(e.pos,'#ff5a4a')}

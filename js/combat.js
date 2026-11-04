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
function resetCombat(){if(typeof clearLasers==='function')clearLasers();for(const d of dmgTexts)d.el.remove();dmgTexts.length=0;enemies=[];bolts=[];raidActive=false;raidCount=0;stationDown=0;attackTarget=null;towerCd={};passiveQ.length=0;
  const c=raidCfg();raidT=c?c.first:0;stationHp=stationMaxHp();spawnPassives()}

/* ---------- model piráta ---------- */
const PIR_MAT=new THREE.MeshStandardMaterial({color:col('#3a1218'),metalness:.6,roughness:.4,flatShading:true});
const PIR_GLOW=new THREE.MeshStandardMaterial({color:col('#2a0505'),emissive:col('#ff3b2f'),emissiveIntensity:1.8});
const BAR_GEO=new THREE.PlaneGeometry(3,.3);
function makePirate(kind){const g=new THREE.Group();const body=new THREE.Group();g.add(body);
  body.add(pirModel(kind));   // v0.17: detailný model (pirmodels.js); fighter / corsair / frigate
  const sc=kind==='frigate'?1.6:kind==='corsair'?1.45:1;const sc0=kind==='frigate'?2.6:kind==='corsair'?1.8:1;body.scale.setScalar(sc);
  // ukazovateľ výdrže nad pirátom (vodorovný, aby bol vidieť z kamery zhora)
  const bg=new THREE.Mesh(BAR_GEO,new THREE.MeshBasicMaterial({color:new THREE.Color('#2a0808'),transparent:true,opacity:.85,depthWrite:false}));bg.rotation.x=-Math.PI/2;bg.position.set(0,3,-2.6*sc0);g.add(bg);
  const bar=new THREE.Mesh(BAR_GEO,new THREE.MeshBasicMaterial({color:new THREE.Color('#ff5a4a'),depthWrite:false}));bar.rotation.x=-Math.PI/2;bar.position.set(0,3.05,-2.6*sc0);g.add(bar);
  const proxy=new THREE.Mesh(new THREE.SphereGeometry(2.6*sc0,8,6),M.pick);g.add(proxy);
  return{g,body,bar,proxy}}
/* hodnota pre sektor si; ak pre neho nie je zadaná (napr. fregata v nižšom sektore cez admin), použije sa najbližšia nenulová */
const pirStat=(a,si)=>{for(let i=Math.min(si,a.length-1);i<a.length;i++)if(a[i])return a[i];return a[a.length-1]};
/* force = spustiť nájazd aj v sektore bez pirátov (admin panel); vtedy sa použijú hodnoty 2. sektora */
function spawnRaid(force){const c=raidCfg()||(force?PIRATES.raid[1]:null);if(!c)return;const si=Math.max(1,state.cur);const n=c.count[0]+Math.floor(Math.random()*(c.count[1]-c.count[0]+1));const a0=Math.random()*TAU;
  const kinds=[];for(let i=0;i<n;i++)kinds.push('fighter');if(Math.random()<c.corsair)kinds.push('corsair');if(c.frigate&&Math.random()<c.frigate)kinds.push('frigate');
  kinds.forEach((kind,i)=>{const P=PIRATES[kind];const v=makePirate(kind);const a=a0+(i-kinds.length/2)*.09;
    const sr=Z3+Math.random()*40;v.g.position.set(Math.cos(a)*sr,2,Math.sin(a)*sr);world.add(v.g); /* v0.16.2: na veľkých mapách prilietajú z pásu 4 */
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
  const el=document.createElement('div');el.className='dmgt '+kind;el.textContent=kind==='miss'?t('cmb.missT'):kind==='imm'?t('ar.imm'):(kind==='crit'?'✦ ':kind==='hurt'?'−':'')+fmtN(Math.round(n));dmgLayer.appendChild(el);
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
function stationHit(d){stationHitT=CORE_HIT;stationHp-=d;if(stationHp<=0)stationDestroyed()}
function stationDestroyed(){const o=Math.floor(state.ore*PIRATES.steal),g=Math.floor(state.green*PIRATES.steal);state.ore-=o;state.green-=g;
  stationDown=PIRATES.offline;stationHp=stationMaxHp()*.4;raidActive=false;for(const e of enemies)if(!e.wasPassive)e.leaving=true;
  for(let i=0;i<40;i++)emit(debris,new V3(0,2,0),i%2?'#ff8a5c':'#ffe2a8',1+Math.random(),new V3((Math.random()-.5)*26,Math.random()*6,(Math.random()-.5)*26));
  toast(t('tt.stDown',{o,g,s:PIRATES.offline}),'bad');shake=.8;missionRaid(false);save()}
function hitEnemy(e,dmg,side){if(e.invuln)dmg=arenaHitFilter(e,dmg);e.hp-=dmg;if(side==='player'){e.aggro=true;if(e.passive)provoke(e)}e.bar.scale.x=Math.max(.001,e.hp/e.max);e.bar.position.x=-1.5*(1-e.hp/e.max);
  if(e.hp<=0)killEnemy(e)}
function killEnemy(e){const P=PIRATES[e.kind];world.remove(e.g);enemies=enemies.filter(x=>x!==e);pickables=pickables.filter(p=>p!==e.proxy);if(attackTarget===e)attackTarget=null;
  for(let i=0;i<(e.kind==='carrier'?160:e.kind==='dread'?110:e.kind==='frigate'?70:e.kind==='corsair'?40:22);i++)emit(debris,e.pos,['#ff8a5c','#ffe2a8','#ff3b2f'][i%3],.6+Math.random()*.8,new V3((Math.random()-.5)*22,Math.random()*5,(Math.random()-.5)*22));
  missionKill();if(e.wasPassive)passiveQ.push({belt:e.belt,t:rnd(...(PASSIVE[state.cur]||{respawn:[120,120]}).respawn)});
  const cr=Math.round(rnd(P.cr[0],P.cr[1])*secGain(state.cur)*crMul());state.credits+=cr;bump('#crTxt');xpAt(XP.kill[e.kind]||0);
  if(Math.random()<P.drop){const z=Math.min(5,zoneOf(Math.hypot(e.pos.x,e.pos.z)));spawnLoot(dropItem(e.kind==='fighter'||e.kind==='swarm'?'enemy':e.kind,Math.max(2,z),e.kind==='frigate'?4:e.kind==='corsair'?3:0),e.pos)}
  if(raidActive&&!enemies.some(x=>!x.leaving&&!x.wasPassive)){raidActive=false;const bonus=Math.round(PIRATES.repelBonus*raidCount*crMul());state.credits+=bonus;toast(t('tt.repelled',{c:bonus}),true);missionRaid(true);save()}}

/* ---------- jednotlivé zbrane ---------- */
function nearestEnemy(from,maxD){let best=null,bd=maxD;for(const e of enemies){if(e.leaving||e.manual||e.invuln||e.passive)continue;/* pasívnych automaticky nestrieľame */const d=from.distanceTo(e.pos);if(d<bd){bd=d;best=e}}return best}
const gunRange=()=>GUN_RANGE+bonus().grange;
function playerGun(dt){gunCd-=dt;if(dead||jumping)return;const R=gunRange();
  let tg=attackTarget&&enemies.includes(attackTarget)&&ship.position.distanceTo(attackTarget.pos)<=R?attackTarget:nearestEnemy(ship.position,R);
  if(tg){gunTgt=tg;gunTgtT=1.6}   // posledný cieľ streľby (natáčanie lode, zameriavací krúžok)
  if(!tg||gunCd>0)return;gunCd=GUN_VIS_INT;playerBurst(tg)}   /* v0.19.3: salvy v stálom tempe; rýchlosť streľby mení len poškodenie (gunVolleyDmg) */   // v0.16: laserová dávka (lasers.js)
function towersFire(dt){if(stationDown>0)return;const s=cur();s.slots.forEach((m,i)=>{if(slotType(m)!=='tower'||i>=slotsFor(s.core))return;
  towerCd[i]=(towerCd[i]||0)-dt;if(towerCd[i]>0)return;const ts=towerStats(m);const tg=nearestEnemy(new V3(0,0,0),ts.range);if(!tg)return;
  towerCd[i]=1/ts.rate;const from=slotPos(i).setY(2.2);fireBolt(from,tg.pos.clone().addScaledVector(tg.vel,.4),RAR[modRar(m)].col,ts.dmg,'tower',PIRATES.playerBolt)})}
/* Dron v obrannom režime: letí k pirátovi pri stanici a strieľa; vráti false, ak v okolí stanice nie je nepriateľ. */
function droneDefend(d,st,dt){const tg=nearestEnemy(new V3(0,0,0),70);if(!tg)return false;
  d.cd-=dt;const dist=d.g.position.distanceTo(tg.pos);moveTo(d.g,tg.pos,st.speed*1.2,dt,st.range*.7);
  if(dist<st.range&&d.cd<=0){d.cd=1;fireBolt(d.g.position,tg.pos,'#ffd27a',st.dmg,'drone',PIRATES.playerBolt)}return true}

/* ---------- správanie pirátov a nájazdy ---------- */
const _ev=new V3(),_tp=new V3();
/* v0.16.2: dostrel pirátov = dostrel zbrane hráča × RANGE_F. Bežní piráti dostrelia menej ako hráč (silnejší menej
   zaostávajú), bossovia ďalej ako hráč. Raketová veža má rakety na veľkú vzdialenosť. Keď hráč vylepší dosah, posunú sa aj piráti. */
const enemyRange=e=>gunRange()*(RANGE_F[e.kind]||.9);
function tickEnemies(dt,tt){for(const e of enemies.slice()){
    if(e.passive){tickPassive(e,dt,tt);continue}
    if(e.leaving){_ev.copy(e.pos).setY(0).normalize().multiplyScalar(e.speed*1.4);e.pos.addScaledVector(_ev,dt);e.vel.copy(_ev);e.body.rotation.y=Math.atan2(_ev.x,_ev.z);
      if(Math.hypot(e.pos.x,e.pos.z)>LIMIT+20){world.remove(e.g);enemies=enemies.filter(x=>x!==e);pickables=pickables.filter(p=>p!==e.proxy)}continue}
    const dShip=dead?1e9:e.pos.distanceTo(ship.position);if(dShip<PIRATES.aggro)e.aggro=true;if(!e.arena&&(dead||dShip>PIRATES.aggro*2.2)){e.aggro=false;if(e.wasPassive){e.passive=true;e.interest=0;e.bored=20}}/* pasívny sa po úteku hráča upokojí */if(e.arena)e.aggro=!dead;
    const onShip=e.aggro;if(onShip)_tp.copy(ship.position).setY(e.pos.y);else _tp.set(0,e.pos.y,0);
    _ev.subVectors(_tp,e.pos);_ev.y=0;const dist=_ev.length();const eR=enemyRange(e);const want=eR*.75+(onShip?0:10);_ev.normalize();
    const desired=new V3();if(dist>want+2)desired.copy(_ev).multiplyScalar(e.speed);else desired.set(-_ev.z*e.orb,0,_ev.x*e.orb).multiplyScalar(e.speed*.6).addScaledVector(_ev,(dist-want)*.8);
    if(e.stat){desired.set(0,0,0);e.vel.set(0,0,0)}else{e.vel.lerp(desired,Math.min(1,dt*2.5));e.pos.addScaledVector(e.vel,dt);e.pos.y=2+Math.sin(tt*2+e.orb)*.3}
    if(e.vel.lengthSq()>.5)e.body.rotation.y=Math.atan2(e.vel.x,e.vel.z);
    e.cd-=dt;const inRange=dist<=eR+(onShip?0:10);
    if(inRange&&e.cd<=0&&!(!onShip&&stationDown>0)){e.cd=e.fire*(.8+Math.random()*.4);e.body.rotation.y=Math.atan2(_ev.x,_ev.z);
      if(e.missile){fireMissile(e);continue}
      // v0.16: okamžitý laser so šancou na zásah (lasers.js); boss strieľa celú dávku
      pirateShot(e,onShip);for(let i=1;i<=e.burst;i++)pirateShot(e,onShip)}}}
/* Raketa raketovej veže (aréna): pomalšia, navádza sa na loď, ale zatáča obmedzene – dá sa jej uhnúť. */
function fireMissile(e){const s=glow('#ff9a3a',2.6,1);s.position.copy(e.pos);world.add(s);const dir=new V3().subVectors(ship.position,e.pos).setY(0).normalize();
  bolts.push({s,vel:dir.multiplyScalar(24),life:7,dmg:e.dmg,side:'enemy',homing:1.4})}
function tickCombat(dt,tt){
  gunTgtT-=dt;tickLock(dt);tickEdgeArrows();
  if(stationDown>0)stationDown-=dt;
  if(!raidActive&&stationHp<stationMaxHp())stationHp=Math.min(stationMaxHp(),stationHp+PIRATES.stationRegen*dt);
  tickPassiveQ(dt);const c=raidCfg();if(c&&!raidActive&&!enemies.some(e=>!e.wasPassive)&&$('#intro').hidden){raidT-=dt;if(raidT<=0){spawnRaid();raidT=rnd(c.every[0],c.every[1])}}
  // útok na vybraného piráta: loď sa drží v dosahu zbrane (ručné ovládanie má prednosť)
  if(attackTarget&&!enemies.includes(attackTarget))attackTarget=null;
  if(attackTarget&&!mineTarget&&inVec.lengthSq()<1e-4){_ev.subVectors(ship.position,attackTarget.pos).setY(0);const d=_ev.length()||1;moveTarget=attackTarget.pos.clone().setY(0).addScaledVector(_ev,gunRange()*.6/d)}
  tickEnemies(dt,tt);playerGun(dt);tickShots(dt);if(!inArena())towersFire(dt);tickBolts(dt);tickDmgText(dt)}
function cmdAttack(e){attackTarget=e;mineTarget=null;autoPause=6;flashMarker(e.pos,'#ff5a4a')}

/* ==================== v0.18: PASÍVNI PIRÁTI (nastavenie PASSIVE v data.js) ====================
   Pokojne krúžia okolo svojho miesta v páse. Keď sa hráč priblíži (PAS_SEE), chvíľu ho sledujú v odstupe (PAS_FOLLOW s),
   potom stratia záujem a na chvíľu (bored) sa vrátia na svoje miesto. Nestrieľajú; zbraň lode, veže ani drony na nich
   automaticky nestrieľajú. Keď ich hráč zasiahne (po ťuknutí/zameraní), zaútočia – a s nimi aj ostatní pasívni do PAS_PACK m. */
const PAS_SEE=60,PAS_FOLLOW=12,PAS_GAP=16,PAS_PACK=70;
const passiveQ=[];   // čakajúce znovuzrodenia {belt, t}
const beltRange=b=>[[0,Z1],[Z1,Z2],[Z2,Z3],[Z3,HORIZON]][Math.max(0,Math.min(3,b-1))];
function spawnPassives(){const C=PASSIVE[state.cur];if(!C||inArena())return;for(const b in C.belts)for(let i=0;i<C.belts[b];i++)spawnPassive(+b)}
function spawnPassive(belt){const C=PASSIVE[state.cur];if(!C)return;const kind=C.kind,P=PIRATES[kind];const v=makePirate(kind);
  const[r0,r1]=beltRange(belt),a=Math.random()*TAU,r=r0+(r1-r0)*(.2+Math.random()*.6);v.g.position.set(Math.cos(a)*r,2,Math.sin(a)*r);world.add(v.g);
  const hp=pirStat(P.hp,1)*C.mul*tierMul('hp');
  const e={...v,kind,hp,max:hp,dmg:pirStat(P.dmg,1)*C.mul*D().pdmg*tierMul('dmg'),speed:P.speed,range:P.range,fire:P.fire,r:P.r,cd:1+Math.random()*2,vel:new V3(),
    aggro:false,leaving:false,orb:Math.random()<.5?1:-1,pos:v.g.position,passive:true,wasPassive:true,belt,home:v.g.position.clone(),wander:null,interest:0,bored:0};
  v.bar.visible=false;v.g.children.forEach(c=>{if(c.geometry===BAR_GEO)c.visible=false});   // pásik výdrže sa ukáže až v boji
  v.proxy.userData.enemy=e;pickables.push(v.proxy);enemies.push(e)}
function provoke(e){for(const o of enemies)if(o.passive&&(o===e||o.pos.distanceTo(e.pos)<PAS_PACK)){o.passive=false;o.aggro=true;o.g.children.forEach(c=>{if(c.geometry===BAR_GEO)c.visible=true})}}
function tickPassive(e,dt,tt){const dShip=dead?1e9:e.pos.distanceTo(ship.position);e.bored-=dt;
  if(e.interest<=0&&e.bored<=0&&dShip<PAS_SEE&&!inArena()){e.interest=PAS_FOLLOW*(.7+Math.random()*.6)}
  let tgt;
  if(e.interest>0){e.interest-=dt;if(e.interest<=0||dShip>PAS_SEE*1.6){e.interest=0;e.bored=25+Math.random()*20}
    // sleduje loď v odstupe PAS_GAP, mierne krúži okolo nej
    _ev.subVectors(e.pos,ship.position).setY(0);const d=_ev.length()||1;_ev.multiplyScalar(PAS_GAP/d);
    tgt=_tp.copy(ship.position).add(_ev).add(new V3(-_ev.z*.3*e.orb,0,_ev.x*.3*e.orb))}
  else{if(!e.wander||e.pos.distanceTo(e.wander)<4){const a=Math.random()*TAU,r=8+Math.random()*30;e.wander=e.home.clone().add(new V3(Math.cos(a)*r,0,Math.sin(a)*r))}tgt=e.wander}
  _ev.subVectors(tgt,e.pos).setY(0);const dist=_ev.length();const sp=e.interest>0?Math.min(e.speed,dist*.9):e.speed*.35;
  const desired=dist>.5?_ev.multiplyScalar(sp/dist):new V3();e.vel.lerp(desired,Math.min(1,dt*1.5));e.pos.addScaledVector(e.vel,dt);e.pos.y=2+Math.sin(tt*1.5+e.orb)*.3;
  if(e.interest>0&&dist<6){_ev.subVectors(ship.position,e.pos);e.body.rotation.y=Math.atan2(_ev.x,_ev.z)}   // pri sledovaní sa natočí na hráča
  else if(e.vel.lengthSq()>.3)e.body.rotation.y=Math.atan2(e.vel.x,e.vel.z)}
function tickPassiveQ(dt){for(const q of passiveQ.slice()){q.t-=dt;if(q.t<=0){passiveQ.splice(passiveQ.indexOf(q),1);spawnPassive(q.belt)}}}

/* ==================== v0.19.4: ZAMERANIE A UKAZOVATELE NA OKRAJI ====================
   combatTarget() = ručne zvolený cieľ útoku, alebo pirát, na ktorého zbraň strieľala za posledných 1,6 s. Loď sa naň natáča
   (control.js) a okolo neho sa točí červený zameriavací krúžok so štyrmi zúbkami.
   Ukazovatele na okraji obrazovky: pre pirátov mimo obrazovky bližšie ako EDGE_R (≈ polovica šírky pásu) sa pri okraji ukáže
   šípka v smere k nim (červená = nepriateľ, oranžová = pasívny) so vzdialenosťou. */
let gunTgt=null,gunTgtT=0,lockMk=null;
function combatTarget(){if(dead)return null;if(attackTarget&&enemies.includes(attackTarget))return attackTarget;
  if(gunTgt&&gunTgtT>0&&enemies.includes(gunTgt)&&!gunTgt.leaving)return gunTgt;return null}
function tickLock(dt){const ct=combatTarget();
  if(!lockMk){const g=new THREE.Group();const mat=new THREE.MeshBasicMaterial({color:new THREE.Color('#ff5a4a'),transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
    const r=new THREE.Mesh(new THREE.RingGeometry(1,1.08,48,1,0,TAU*.8),mat);g.add(r);
    for(let i=0;i<4;i++){const tk=new THREE.Mesh(new THREE.PlaneGeometry(.12,.45),mat);const a=i/4*TAU;tk.position.set(Math.cos(a)*1.3,Math.sin(a)*1.3,0);tk.rotation.z=a+Math.PI/2;g.add(tk)}
    g.rotation.x=-Math.PI/2;g.visible=false;scene.add(g);lockMk=g}
  if(!ct){lockMk.visible=false;return}
  const s=(ct.r||2)*1.35+1;lockMk.visible=true;lockMk.position.set(ct.pos.x,ct.pos.y-.4,ct.pos.z);lockMk.scale.setScalar(s*(1+.05*Math.sin(performance.now()/120)));lockMk.rotation.z+=dt*1.6}
const EDGE_R=Z1*.5;   // polovica šírky pásu
let edgeLayer=null;const edgeEls=[];
function tickEdgeArrows(){if(!edgeLayer){edgeLayer=document.createElement('div');edgeLayer.id='edgeLayer';document.body.appendChild(edgeLayer)}
  const W=innerWidth,H=innerHeight,M=34,cx=W/2,cy=H/2;let n=0;
  if(!dead&&$('#intro').hidden&&!jumping)for(const e of enemies){if(e.leaving)continue;const d=Math.hypot(e.pos.x-ship.position.x,e.pos.z-ship.position.z);if(d>EDGE_R)continue;
    const v=e.pos.clone().project(camera);let x=(v.x*.5+.5)*W,y=(-v.y*.5+.5)*H;if(v.z>1){x=W-x;y=H-y}
    if(x>M&&x<W-M&&y>M&&y<H-M&&v.z<=1)continue;   // pirát je na obrazovke
    const dx=x-cx,dy=y-cy,k=Math.min((cx-M)/Math.max(1e-3,Math.abs(dx)),(cy-M)/Math.max(1e-3,Math.abs(dy)));const px=cx+dx*k,py=cy+dy*k;
    let el=edgeEls[n];if(!el){el=document.createElement('div');el.className='edgeArr';el.innerHTML='<i></i><span></span>';edgeLayer.appendChild(el);edgeEls.push(el)}
    el.hidden=false;el.classList.toggle('pas',!!e.passive);el.style.transform=`translate(${px}px,${py}px)`;el.firstChild.style.transform=`translate(-6px,-9px) rotate(${Math.atan2(dy,dx)}rad)`;
    el.lastChild.textContent=Math.round(d)+' m';el.style.opacity=(.55+.45*(1-d/EDGE_R)).toFixed(2);n++}
  for(let i=n;i<edgeEls.length;i++)edgeEls[i].hidden=true}

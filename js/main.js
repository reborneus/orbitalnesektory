'use strict';
/* ==================== == 10. HERNÁ SLUČKA ====================
   frame() beží každý snímok obrazovky: vstup, automatizácia, loď, drony, radiácia, opravy, animácie, kamera, HUD, ukladanie (každých 6 s). */
const camTarget=new V3();
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<h?52:40;camera.updateProjectionMatrix();sizeMini()}
addEventListener('resize',resize);
const clock=new THREE.Clock();let saveT=0,incomeT=0,miniT=0,tt=0;
function frame(){requestAnimationFrame(frame);if(gfxSkip())return;const dt=Math.min(clock.getDelta(),.05);tt+=dt;
  pollPad(dt);readInput();
  const playing=$('#intro').hidden;
  sndLoop(dt);if(typeof rsTick==='function'&&$('#intro').hidden)rsTick(dt);   // v0.42: výskum (nanoopravy, odpočty)   // v0.35: zvukové slučky, poslucháč, hudba
  if(!playing){menuArtFrame(dt,tt);return}   // v0.30: v hlavnom menu sa kreslí len fanart, svet hry stojí
  state.playT=(state.playT||0)+dt;MIN_U.uT.value=tt;          // odohraný čas (zobrazuje sa pri uložených hrách)
  if(!jumping&&!dead&&playing){tickAuto(dt);tickShip(dt,tt)}tickHudMode(dt);if(!jumping)tickDrones(dt,tt);
  // radiation by belt; beyond the horizon it eats the hull directly
  const rr=Math.hypot(ship.position.x,ship.position.z);radRate=0;radHull=false;radProt=false;
  // radiačný štít: pri stanici sa dobíja; v radiácii (alebo len za horizontom podľa nastavenia) ju úplne zachytí, kým má nabité sekundy
  const rsMax=shipVal('radShield');if(state.radCharge>rsMax)state.radCharge=rsMax;if(stationOk()&&state.radCharge<rsMax)state.radCharge=Math.min(rsMax,state.radCharge+RADSHIELD_RECHARGE*dt);
  if(!dead&&!jumping&&playing){radRate=radAt(rr);
    if(radRate>0&&state.admin&&state.admin.godRad){radProt=true}
    else if(radRate>0&&state.radCharge>0&&(state.radMode!=='void'||rr>=HORIZON)){radProt=true;state.radCharge=Math.max(0,state.radCharge-dt);if(state.radCharge<=0)toast(t('tt.radOut'),'bad')}
    else if(radRate>0){const o=damage(radRate*dt,rr>=HORIZON?'void':'rad');radHull=o.hull>0}
    const z=zoneOf(rr);if(z!==lastZone){if(z===5)toast(t('tt.horizon'),'bad');else if(z>=3&&z>lastZone)toast(t('tt.rad',{z}));lastZone=z}}
  hullSince+=dt;shSince+=dt;hitCD-=dt;
  const smax=shieldMax();if(state.sh>smax)state.sh=smax;
  if(!dead&&smax>0&&state.sh<smax){const g=shipVal('sregen');if(shSince>=g.delay)state.sh=Math.min(smax,state.sh+smax*g.rate*dt)}
  const hm=shipVal('hull');if(state.hp>hm)state.hp=hm; // po zložení pancierovej platne sa max. trupu môže znížiť
  if(!dead&&D().regen&&hullSince>=HULL_DELAY&&state.hp<hm)state.hp=Math.min(hm,state.hp+hm*HULL_RATE*dt);
  const rv=$('#radv');const vOn=!dead&&!radProt&&radRate>0&&(radHull||rr>=HORIZON);rv.classList.toggle('void',rr>=HORIZON);
  rv.style.opacity=vOn?(rr>=HORIZON?(.45+.2*Math.sin(tt*6)).toFixed(2):clamp(radRate/10,.15,.5).toFixed(2)):'0';
  bubbleT=Math.max(0,bubbleT-dt*2.2);
  const bu=ship.userData.bubble.material.uniforms.o;const shUp=smax>0&&state.sh>0;
  ship.userData.bubble.material.uniforms.c.value.set(radProt?'#c38bff':'#5aa9ff');
  bu.value=radProt?.45+.15*Math.sin(tt*7):Math.max(shUp?(radRate>0&&!radHull?.35+.12*Math.sin(tt*9):.08):0,bubbleT*.9);
  for(const a of asts){
    if(a.g.userData.spark)a.g.userData.spark.scale.setScalar(4.2*(1+.35*Math.sin(tt*4+a.base*7)));
    if(a.alive){a.g.rotation.x+=a.spin.x*dt;a.g.rotation.y+=a.spin.y*dt;a.g.rotation.z+=a.spin.z*dt;if(a.shrink<1){a.shrink=Math.min(1,a.shrink+dt*.8);setAstScale(a)}}
    else{if(a.g.visible){a.shrink-=dt*3;if(a.shrink<=0){a.shrink=0;a.g.visible=false}else setAstScale(a)}
      a.respawn-=dt;if(a.respawn<=0&&!a.mission){a.amt=a.max;a.alive=true;a.claims=0;a.shrink=.01;a.g.visible=true;placeAst(a,Math.random)}}}
  tickStationCore(dt,tt);
  if(stationAnim){for(const r of stationAnim.rings)r.o.rotation.y+=r.s*dt;tickTurrets(dt);
    for(const d of stationAnim.dishes)d.o.rotation.y+=dt*.6;for(const b of stationAnim.blink){const k=b.soft?.75+.25*Math.sin(tt*3*b.f):(Math.sin(tt*TAU*b.f)>.2?1:.35);b.o.scale.setScalar(b.base*k)}}
  if(gate){gate.userData.ring.rotation.z+=dt*.4;const k=1+Math.sin(tt*2)*.12;gate.userData.core.scale.set(9*GATE_K*k,9*GATE_K*k,1)}
  if(world&&world.userData.planet)world.userData.planet.rotation.y+=dt*.01;
  if(world&&world.userData.bgTick)world.userData.bgTick(dt,gfxBgT(tt));
  tickPool(trail,dt);tickPool(debris,dt);if(!jumping){tickLoot(dt,tt);tickCombat(dt,tt);tickMissions(dt,tt);tickArena(dt,tt);tickNpc(dt,tt)}
  if(markerT>0){markerT-=dt;const k=markerT/.6;marker.material.opacity=k*.9;marker.scale.setScalar(1+(1-k)*1.8)}else marker.material.opacity=0;
  if(mineTarget&&mineTarget.alive){tRing.visible=true;tRing.position.set(mineTarget.pos.x,mineTarget.pos.y-.2,mineTarget.pos.z);tRing.scale.setScalar(astScale(mineTarget)*1.6+1.2);tRing.rotation.z+=dt*1.2}else tRing.visible=false;
  incomeT+=dt;if(incomeT>=1){incomeT=0;state.sec.forEach((sc,i)=>{if(i!==state.cur&&sc.captured){const p=passiveOf(sc);state.ore+=p.ore;state.green+=p.green}if(sc.captured&&!passiveOf(sc).paused)state.credits+=SECTOR_CREDITS});refreshSheet()}
  const look=ship.position.clone().addScaledVector(shipVel,.35);look.y=0;camTarget.lerp(look,1-Math.exp(-dt*3.5));
  const sx=shake>0?(Math.random()-.5)*shake*1.6:0,sz=shake>0?(Math.random()-.5)*shake*1.6:0;shake=Math.max(0,shake-dt*2.2);
  camera.position.set(camTarget.x+sx,52*zoom,camTarget.z+36*zoom+sz);camera.lookAt(camTarget.x+sx*.5,0,camTarget.z+sz*.5);
  tickWorldBtns();
  hudT-=dt;if(hudT<=0){hudT=.12;updateHUD()}
  miniT-=dt;if(miniT<=0){miniT=.08;drawMini()}if(typeof bigTick==='function')bigTick(dt);   // v0.45: veľká mapa (TAB)
  saveT+=dt;if(saveT>6){saveT=0;save()}
  gfxRender([[scene,camera]])}

addEventListener('visibilitychange',()=>{if(document.hidden&&state)save()});
window.claude?.hot?.snapshot?.(()=>({state}));
/* start(): načíta uloženú hru (alebo vytvorí novú), postaví sektor a spustí slučku. */
/* start(): v0.30 – hra začína v hlavnom menu. Za menu je pripravený prázdny stav (spoločné nastavenia) a sektor 1;
   pri rýchlom obnovení kódu v Claude (hot reload) sa pokračuje priamo v rozohranej hre v poslednom slote. */
function start(data){const hs=data&&data.state;
  let stored=null;try{stored=localStorage.getItem('os-lang')}catch(e){}
  if(hs&&hs.v===3){state=applyPrefs(migrate(hs));curSlot=loadIdx().last||1}else state=applyPrefs(freshState());
  if(!stored&&(state.lang==='sk'||state.lang==='en'))lang=state.lang;state.lang=lang;
  bonusDirty();buildShip(state.shipId);applyMini();applyHud();applyHudMode();applyMenuAlpha();applyGfx();
  resize();buildSector();ship.position.set(0,0,STATION_R+8);camTarget.copy(ship.position);
  document.querySelectorAll('.pg').forEach(el=>el.textContent=G()[el.dataset.g]);
  if(hs&&hs.v===3){hideMenu();applyLang()}else{applyLang();showMenu('main')}
  frame()}
/* v0.31.2: najprv sa načíta úložisko (localStorage + IndexedDB), potom sa hra spustí */
/* v0.40: potom sa načítajú vlastné 3D modely z js/models.js (ak nejaké sú) */
const boot=d=>{const go=()=>start(d);storeInit().then(glbPreload,()=>glbPreload()).then(go,go)};
window.claude?.hot?.ready?window.claude.hot.ready(boot):boot(window.claude?.hot?.data??{});

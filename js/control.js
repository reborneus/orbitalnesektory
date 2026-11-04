'use strict';
/* ==================== == 7. OVLÁDANIE LODE ====================
   moveTarget = bod, kam letí autopilot (null = nikam); mineTarget = asteroid, ktorý loď ťaží.
   hullSince/shSince = sekundy od posledného poškodenia (pre opravu trupu a dobíjanie štítov). */
let moveTarget=null,mineTarget=null,openOnArrive=false,fullWarned=false,mining=false,debrisT=0;
let radProt=false,hullSince=99,shSince=99,hitCD=0,shake=0,dead=false,bubbleT=0,radRate=0,radHull=false,lastZone=1;
const SHIP_R=2.3,inVec=new V3(),padVec=new V3(),_dv=new V3(),_des=new V3(),_a=new V3(),_b=new V3(),_c=new V3();
/* Dosah ťažby = polomer asteroidu + dosah lasera; loď zastaví 2,5 m pred hranicou dosahu. */
const mineRange=a=>astScale(a)*1.1+shipVal('range');
const mineStop=a=>mineRange(a)-2.5;
const nearStation=()=>Math.hypot(ship.position.x,ship.position.z)<STATION_R+14;
function cmdMove(p){autoPause=6;attackTarget=null;moveTarget=p.clone().setY(0);mineTarget=null;openOnArrive=false}
function cmdMine(a){attackTarget=null;if(a.type!=='relic'&&cargoTotal()>=shipVal('cargo')-.01){toast(t('tt.cargoFull'));return}
  mineTarget=a;moveTarget=a.pos.clone().setY(0);openOnArrive=false;fullWarned=false}
function cmdHome(){attackTarget=null;const dir=ship.position.clone().setY(0);if(dir.lengthSq()<1)dir.set(0,0,1);dir.normalize().multiplyScalar(STATION_R+2);moveTarget=dir;mineTarget=null}
function goHome(){autoPause=6;closeSheet();cmdHome();toast(t('tt.home'))}
function mineNearest(){autoPause=6;
  // pirát v dosahu zbrane má prednosť: tlačidlo ťažby ho zameria
  {const e=nearestEnemy(ship.position,gunRange()*1.3);if(e&&!mineTarget){cmdAttack(e);return}}
  if(mineTarget){mineTarget=null;moveTarget=null;toast(t('tt.mineStop'));return}
  const fwd=_a.set(Math.sin(shipYaw),0,Math.cos(shipYaw));let best=null,bs=1e9;
  for(const a of asts){if(!a.alive)continue;_b.subVectors(a.pos,ship.position);_b.y=0;const d=_b.length();if(d>50)continue;
    const sc=d-_b.dot(fwd)/Math.max(d,.001)*8;if(sc<bs){bs=sc;best=a}}
  if(!best){toast(t('tt.noAst'));return}
  cmdMine(best);flashMarker(best.pos,'#58d0c0')}

/* the autopilot steers around asteroids on its path; manual flight does not */
function avoid(desired){const sp=desired.length();if(sp<.1)return;const dir=_a.copy(desired).divideScalar(sp);const look=6+shipVel.length()*1.1;
  for(const a of asts){if(!a.alive||a===mineTarget)continue;const ar=astScale(a);_b.subVectors(a.pos,ship.position);_b.y=0;
    const along=_b.dot(dir);if(along<-ar||along>look+ar)continue;
    const lat=_b.x*dir.z-_b.z*dir.x;const clear=SHIP_R+ar+2.2;if(Math.abs(lat)>clear)continue;
    const side=lat>=0?1:-1;const k=((1-Math.abs(lat)/clear)*(1-Math.max(0,along)/(look+ar))*1.8+.25)*sp;
    desired.x-=side*dir.z*k;desired.z+=side*dir.x*k}
  desired.setLength(sp)}

/* damage: shields absorb collisions and belt radiation first; past the horizon it hits the hull directly */
/* kind: 'hit' = náraz, 'rad' = radiácia v pásoch (oboje najprv berie štíty), 'void' = za horizontom (priamo trup). */
function damage(n,kind){const out={shield:0,hull:0};if(dead||n<=0)return out;
  // admin panel: neobmedzené štíty zachytia všetko, neobmedzený trup neubúda
  const ad=state.admin||{};if(ad.godShield){out.shield=n;return out}
  hullSince=0;shSince=0;
  if(kind!=='void'&&state.sh>0){const a=Math.min(state.sh,n);state.sh-=a;n-=a;out.shield=a}
  if(n>0&&ad.godHull){hullSince=99;return out}
  if(n>0){state.hp-=n;out.hull=n;if(state.hp<=0){state.hp=0;destroyShip()}}
  return out}
function blockedAt(p){for(const a of asts){if(!a.alive)continue;const ar=astScale(a)*.95+SHIP_R;
    if(Math.hypot(p.x-a.pos.x,p.z-a.pos.z)<ar+.5&&Math.hypot(ship.position.x-a.pos.x,ship.position.z-a.pos.z)<ar+3)return true}return false}
/* Kolízia s asteroidom: loď sa odrazí a poškodenie závisí od rýchlosti nárazu (pod 2 m/s bez poškodenia). */
function collide(){
  for(const a of asts){if(!a.alive)continue;const ar=astScale(a)*.95;const dx=ship.position.x-a.pos.x,dz=ship.position.z-a.pos.z;const d=Math.hypot(dx,dz);const minD=SHIP_R+ar;
    if(d>=minD)continue;const nx=d>.001?dx/d:1,nz=d>.001?dz/d:0;
    ship.position.x=a.pos.x+nx*minD;ship.position.z=a.pos.z+nz*minD;
    const vn=shipVel.x*nx+shipVel.z*nz;if(vn>=0)continue;
    shipVel.x-=1.35*vn*nx;shipVel.z-=1.35*vn*nz;shipVel.multiplyScalar(.82);
    const impact=-vn;a.spin.x+=(Math.random()-.5)*impact*.04;a.spin.z+=(Math.random()-.5)*impact*.04;
    if(impact>2)impactHit(impact,a.pos.x+nx*ar,a.pos.z+nz*ar,a)}}
function impactHit(impact,x,z,a){const k=clamp(impact/22,.15,1);shake=Math.max(shake,k);rumble(k,140+k*160);
  const n=Math.round(5+impact*.5);
  for(let i=0;i<n;i++)emit(debris,_c.set(x,.4,z),Math.random()<.5?'#ffe2a8':RCOL[a.type],.35+Math.random()*.35,
    new V3((Math.random()-.5)*(6+impact),Math.random()*4,(Math.random()-.5)*(6+impact)));
  if(hitCD>0)return;hitCD=COLL.cooldown;const dmg=(impact-COLL.minSpeed)*COLL.perMs*(1-bonus().coll/100);if(dmg<=0)return;
  const o=damage(dmg,'hit');if(o.hull>0)hurtFlash(k);if(o.shield>0)bubbleT=1}
function hurtFlash(k){const h=$('#hurt');h.style.setProperty('--k',(.35+k*.6).toFixed(2));h.classList.remove('on');void h.offsetWidth;h.classList.add('on')}
function destroyShip(){dead=true;mineTarget=null;moveTarget=null;hideBeam(beam);shake=1;rumble(1,600);
  for(let i=0;i<60;i++)emit(debris,ship.position,['#ffe2a8','#ff9a4d','#58d0c0'][i%3],.8+Math.random()*.9,new V3((Math.random()-.5)*30,Math.random()*8,(Math.random()-.5)*30));
  ship.visible=false;const lost=Math.floor(cargoTotal()+.05);for(const r of RES)state.cargo[r]=0;
  toast(lost>0?t('tt.destroyed',{n:lost}):t('tt.destroyed0'),'bad');
  // Nightmare: uložená hra sa zmaže hneď (nedá sa obísť obnovením stránky) a po výbuchu začne nová hra
  if(D().permadeath){nmDead=true;try{localStorage.removeItem(SAVE_KEY);localStorage.setItem(SAVE_KEY+'-nm',JSON.stringify({sec:state.cur,cap:state.sec.filter(x=>x.captured).length,cr:Math.floor(state.credits)}))}catch(e){}
    toast(t('tt.nmOver'),'bad');setTimeout(()=>$('#warp').classList.add('on'),900);setTimeout(()=>{$('#warp').classList.remove('on');newGame();pendingDiff='nightmare';renderIntro()},2600);return}
  setTimeout(()=>$('#warp').classList.add('on'),900);
  setTimeout(()=>{ship.position.set(0,0,STATION_R+8);shipVel.set(0,0,0);shipYaw=0;state.hp=shipVal('hull');state.sh=shieldMax();hullSince=99;shSince=99;lastZone=1;
    ship.visible=true;dead=false;$('#warp').classList.remove('on');toast(t('tt.respawn'));save()},1500)}
/* Automatizácia: autoPause = sekundy, počas ktorých je autopilot pozastavený po ručnom zásahu. */
/* automation: auto-return when full, and the autopilot loop (mine chosen resource -> haul home -> repeat) */
let autoPause=0,returnSent=false,apNoneT=0,apHurtSent=false;
const homeBound=()=>!mineTarget&&moveTarget&&Math.hypot(moveTarget.x,moveTarget.z)<=STATION_R+3;
function toggleAutopilot(){state.autoPilot=!state.autoPilot;autoPause=0;toast(state.autoPilot?t('tt.apOn',{r:t('res.'+state.autoRes)}):t('tt.apOff'));save();renderSheet()}
function tickAuto(dt){autoPause-=dt;apNoneT-=dt;
  const full=cargoTotal()>=shipVal('cargo')-.01;const ap=state.autoPilot;
  if(!full)returnSent=false;
  if(autoPause>0)return;
  // autopilot: korisť v okolí pozbiera ako prvú (aj s plným nákladom – predmety náklad nezaberajú)
  if(ap&&!mineTarget&&state.inv.length<INV_MAX){const L=nearestLoot(70);if(L){if(!moveTarget||moveTarget.distanceTo(L.g.position)>1.5)moveTarget=L.g.position.clone().setY(0);return}}
  // plný náklad: kým loď nesmeruje domov, znova nastaví kurz na stanicu (napr. po zbere koristi alebo ručnom zásahu)
  if(full&&(ap||state.autoReturn!==false)&&!homeBound()&&Math.hypot(ship.position.x,ship.position.z)>STATION_R+5){cmdHome();if(!returnSent)toast(t('tt.autoHome'));returnSent=true}
  if(!ap)return;
  const hm=shipVal('hull'),hr=state.hp/hm;
  if(hr<.35&&!nearStation()){if(!apHurtSent&&!homeBound()){cmdHome();apHurtSent=true;toast(t('tt.apHurt'))}return}
  apHurtSent=false;
  if(nearStation()&&hr<.7){
    if(!D().regen){const n=Math.min(Math.ceil((hm-state.hp)/REPAIR_PER_ORE),Math.floor(state.ore));if(n>0){state.ore-=n;state.hp=Math.min(hm,state.hp+n*REPAIR_PER_ORE);toast(t('tt.repaired',{n:n*REPAIR_PER_ORE}))}}
    if(state.hp/hm<.7)return}
  if(full||mineTarget||moveTarget)return;
  // relikt nablízku (do 50 m, pred horizontom): autopilot ho vyťaží kvôli koristi
  {let rl=null,rd=50;for(const a of asts){if(!a.alive||a.type!=='relic'||Math.hypot(a.pos.x,a.pos.z)>=HORIZON-2)continue;const d=ship.position.distanceTo(a.pos);if(d<rd){rd=d;rl=a}}if(rl){cmdMine(rl);return}}
  let best=null,bd=1e9;for(const a of asts){if(!a.alive||a.type!==state.autoRes||Math.hypot(a.pos.x,a.pos.z)>=HORIZON-2)continue;const d=ship.position.distanceTo(a.pos);if(d<bd){bd=d;best=a}}
  if(best)cmdMine(best);else if(apNoneT<=0){apNoneT=12;toast(t('tt.apNone',{r:t('res.'+state.autoRes)}))}}
/* Radiácia v bodoch za sekundu podľa vzdialenosti r od stanice: v pásoch 3–4 rastie z 0,8 na 3,5; za horizontom 12 a viac. */
/* Radiačný filter a podobné vlastnosti predmetov (bonus().rad) znižujú radiáciu v pásoch 3–4, za horizontom nie. */
function radBase(r){if(r<Z2)return 0;if(r<HORIZON)return RAD.start+(r-Z2)/(HORIZON-Z2)*(RAD.end-RAD.start);return RAD.voidBase+(r-HORIZON)*RAD.voidPerM}
function radAt(r){const b=radBase(r);if(r<HORIZON)return b*D().rad*(1-bonus().rad/100);return b*D().voidM}
const zoneOf=r=>r<Z1?1:r<Z2?2:r<Z3?3:r<HORIZON?4:5;

/* Pohyb lode každý snímok: loď mení rýchlosť smerom k želanej rýchlosti najviac o hodnotu zrýchlenia (preto má zotrvačnosť). */
function tickShip(dt,tt){const maxSp=shipVal('speed'),acc=shipVal('accel');
  const desired=_des.set(0,0,0);
  if(inVec.lengthSq()>.0001){autoPause=6;moveTarget=null;openOnArrive=false;desired.copy(inVec).multiplyScalar(maxSp)}
  else if(moveTarget){_v.subVectors(moveTarget,ship.position);_v.y=0;const dist=_v.length();
    const stop=mineTarget?mineStop(mineTarget):.6;
    if(!mineTarget&&blockedAt(moveTarget)){moveTarget=null}
    else if(dist>stop){const sp=Math.min(maxSp,Math.sqrt(2*acc*.8*(dist-stop))+.4);desired.copy(_v).normalize().multiplyScalar(sp);avoid(desired)}
    else if(!mineTarget)moveTarget=null}
  const dsp=desired.length();
  // velocity moves toward the wanted velocity no faster than the ship's acceleration allows
  /* Obratnosť: zmena rýchlosti sa rozdelí na zložku v smere letu (zrýchlenie/brzdenie, limit = accel)
     a bočnú zložku (zatáčanie, limit = accel × obratnosť/100). Loď teda zatáča hneď, bez driftu a bez brzdenia,
     a čím vyššia obratnosť, tým ostrejšie. */
  _dv.subVectors(desired,shipVel);
  {const vs=shipVel.length();const limP=acc*(desired.lengthSq()<shipVel.lengthSq()?1.25:1)*dt;
    if(vs>.5){const ux=shipVel.x/vs,uz=shipVel.z/vs;const par=_dv.x*ux+_dv.z*uz;
      let px=_dv.x-par*ux,pz=_dv.z-par*uz;const pl=Math.hypot(px,pz),limS=acc*shipVal('turn')/100*dt;
      if(pl>limS){px*=limS/pl;pz*=limS/pl}const pp=clamp(par,-limP,limP);_dv.set(pp*ux+px,0,pp*uz+pz)}
    else if(_dv.length()>limP)_dv.setLength(limP)}
  shipVel.add(_dv);shipVel.y=0;
  ship.position.addScaledVector(shipVel,dt);
  const rr=Math.hypot(ship.position.x,ship.position.z);
  if(rr>LIMIT){ship.position.x*=LIMIT/rr;ship.position.z*=LIMIT/rr;const ux=ship.position.x/LIMIT,uz=ship.position.z/LIMIT;const vr=shipVel.x*ux+shipVel.z*uz;if(vr>0){shipVel.x-=vr*ux;shipVel.z-=vr*uz}}
  if(rr<9){const k=9/Math.max(rr,.01);ship.position.x*=k;ship.position.z*=k}
  collide();
  if(dead)return;
  const sp=shipVel.length();let roll=0;
  // nos lode sa natáča za smerom letu, rýchlejšie pri vyššej obratnosti; náklon podľa zatáčania
  if(sp>.5){const want=Math.atan2(shipVel.x,shipVel.z);const diff=((want-shipYaw+Math.PI)%TAU+TAU)%TAU-Math.PI;shipYaw+=diff*Math.min(1,dt*6*shipVal('turn')/150);roll=clamp(-diff*1.2,-.6,.6)}
  else if(mineTarget){_v.subVectors(mineTarget.pos,ship.position);const want=Math.atan2(_v.x,_v.z);let diff=((want-shipYaw+Math.PI)%TAU+TAU)%TAU-Math.PI;shipYaw+=diff*Math.min(1,dt*5*shipVal('turn')/150)}
  ship.rotation.y=shipYaw;const body=ship.userData.body;body.rotation.z+=(roll-body.rotation.z)*Math.min(1,dt*5);
  ship.position.y=Math.sin(tt*1.6)*.25;
  const thr=clamp(sp/maxSp,0,1);for(const e of ship.userData.eng){const s=1.4+thr*2.2+Math.random()*.3;e.scale.set(s,s,1)}
  if(sp>3&&Math.random()<dt*30*thr){for(const e of ship.userData.eng){const w=e.getWorldPosition(new V3());emit(trail,w,'#6fe3ff',.55+Math.random()*.3,new V3((Math.random()-.5)*1.5,0,(Math.random()-.5)*1.5))}}
  // mining
  mining=false;
  if(mineTarget){const a=mineTarget;const range=mineRange(a);const d=ship.position.distanceTo(a.pos);
    if(!a.alive){stopMining()}
    else if(d<=range+.5){const capV=shipVal('cargo');const free=capV-cargoTotal();const y=D().yield*(1+bonus().yield/100);const isRelic=a.type==='relic';
      if(!isRelic&&free<=.01){if(!fullWarned){toast(t('tt.fullWarn'));fullWarned=true}stopMining()}
      else{mining=true;const rate=shipVal('laser')*MINE_RATE[a.type];
        // relikt nedáva surovinu, len sa "vyťaží" a vypadne z neho predmet
        if(isRelic){a.amt-=Math.min(rate*dt,a.amt)}else{const take=Math.min(rate*dt,a.amt,free/y);a.amt-=take;state.cargo[a.type]+=take*y;xpAt(take*y*(XP.ton[a.type]||1))}setAstScale(a);
        if(a.amt<=0){const rel=isRelic;depleteAst(a,true);if(!rel)toast(t('tt.depleted'))}
        debrisT-=dt;if(debrisT<=0){debrisT=.06;const from=a.pos.clone().add(new V3((Math.random()-.5)*2,Math.random(),(Math.random()-.5)*2).multiplyScalar(astScale(a)*.8));
          emit(debris,from,a.type==='crystal'?'#b9a0ff':a.type==='green'?'#a8f080':'#ffb85c',.6,null,ship.position.clone())}}}
    else if(!moveTarget&&d>range*2.2){mineTarget=null}}
  if(mining){const nose=ship.localToWorld(NOSE.clone());const to=mineTarget.pos.clone().lerp(nose,.12);
    setBeam(beam,nose,to,.32+Math.random()*.12,{ore:'#58d0c0',green:'#86e05a',crystal:'#a98bff',relic:'#ffd87a'}[mineTarget.type])}else hideBeam(beam);
  const cg=ship.userData.core;const cs=(mining?4.6:3.2)*(1+Math.sin(tt*(mining?14:3))*.1);cg.scale.set(cs,cs,1);
  // unload at the station
  const dStation=Math.hypot(ship.position.x,ship.position.z);
  if(dStation<STATION_R+5&&cargoTotal()>0){const parts=[];
    for(const r of RES){const n=Math.floor(state.cargo[r]);if(state.cargo[r]>0)missionDeliver(r,state.cargo[r]);state[r]+=state.cargo[r];state.cargo[r]=0;if(n>0){parts.push(t('res.'+r+'.gain',{n}));bump('#'+RCLS[r]+'Txt')}}
    fullWarned=false;if(parts.length)toast(t('tt.unloaded',{list:parts.join(', ')}));save();refreshSheet()}
  if(openOnArrive&&dStation<STATION_R+8){openOnArrive=false;openSheet('station')}
  if(gate&&ship.position.distanceTo(gate.position)<9&&!sheetTab&&!gateNear){gateNear=true;openSheet('gate')}
  if(gate&&ship.position.distanceTo(gate.position)>14)gateNear=false}
let gateNear=false;

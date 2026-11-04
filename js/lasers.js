'use strict';
/* ==================== == 14b. LASERY (v0.16) ====================
   Zbraň lode strieľa okamžité laserové DÁVKY (LASER_BURST výstrelov krátko po sebe) do zameraného/najbližšieho piráta.
   Každý výstrel zasiahne so šancou hitChance() – základ HIT_BASE, zvyšuje ho len schopnosť pilota Strelec (najviac HIT_MAX).
   Farba lasera podľa rarity nasadenej zbrane: žiadna = sivá, do Vzácnej = modrá, Epická/Legendárna = žiarivo zlatá,
   Mytická = červená, Božská = blesky, Prvotná = stály dúhový lúč k cieľu a každá salva = pulz po lúči.
   Piráti strieľajú rovnako (okamžite, so šancou PIRATE_HIT); rakety veží v aréne ostávajú navádzané strely. */
const HIT_BASE=.7,HIT_MAX=.9,PIRATE_HIT=.7,LASER_BURST=3,BURST_GAP=.07;
const hitChance=()=>Math.min(HIT_MAX,HIT_BASE+(bonus().hit||0)/100);
/* vzhľad lasera podľa rarity zbrane */
function laserStyle(){const w=state.eq&&state.eq.weapon;const r=w?w.r:-1;
  if(r<0)return{k:'grey',col:'#9aa3ad',w:.22};
  if(r<=4)return{k:'blue',col:'#4aa8ff',w:.26};
  if(r<=6)return{k:'gold',col:'#ffd24a',w:.4};
  if(r===7)return{k:'red',col:'#ff3b4a',w:.36};
  if(r===8)return{k:'bolt',col:'#bfe6ff',w:.18};
  return{k:'primal',col:'#7ff6ff',w:.3}}
/* zásoba lúčov (pool), aby sa nevytvárali stále nové objekty */
const laserPool=[];let primalBeam=null,primalT=0,primalTg=null;const pulses=[];
function getBeam(){let b=laserPool.find(x=>x.life<=0);if(!b){if(laserPool.length>=60)return null;b={b:makeBeam('#ffffff'),life:0,max:1,w:.3};laserPool.push(b)}return b}
function showBeam(a,c,col,w,life){const B=getBeam();if(!B)return;B.life=B.max=life;B.w=w;setBeam(B.b,a,c,w,col);B.b.userData.core.material.opacity=.95;B.b.userData.outer.material.opacity=.4}
/* blesk: lomená čiara z niekoľkých krátkych lúčov */
function showBolt(a,c,col){const n=6,pts=[a.clone()];const d=new V3().subVectors(c,a);const L=d.length();const side=new V3(-d.z,0,d.x).normalize();
  for(let i=1;i<n;i++){const p=a.clone().addScaledVector(d,i/n);p.addScaledVector(side,(Math.random()-.5)*Math.min(4,L*.12));p.y+=(Math.random()-.5)*1.2;pts.push(p)}pts.push(c.clone());
  for(let i=0;i<n;i++)showBeam(pts[i],pts[i+1],col,.14+Math.random()*.08,.12);for(let i=0;i<3;i++)emit(debris,c,'#e8f6ff',.25,new V3((Math.random()-.5)*10,Math.random()*4,(Math.random()-.5)*10))}
/* výstrel hráča z nosa lode do cieľa (miss = trochu vedľa) */
function laserFx(from,to,miss){const st=laserStyle();const tp=miss?to.clone().add(new V3((Math.random()-.5)*6,0,(Math.random()-.5)*6)):to;
  if(st.k==='bolt')showBolt(from,tp,st.col);
  else if(st.k==='primal'){pulses.push({p:glow('#ffffff',3.2,1),t:0,from:from.clone(),to:tp.clone()});world.add(pulses[pulses.length-1].p)}
  else showBeam(from,tp,st.col,st.w,st.k==='gold'?.16:.12);
  if(!miss)emit(debris,tp,st.col,.3,new V3((Math.random()-.5)*6,Math.random()*3,(Math.random()-.5)*6))}
/* dávka hráča: LASER_BURST výstrelov po BURST_GAP s; každý = (poškodenie zbrane / LASER_BURST), krit. zásah zvlášť pre každý */
const shotQ=[];
function playerBurst(tg){for(let i=0;i<LASER_BURST;i++)shotQ.push({t:i*BURST_GAP,tg})}
function tickShots(dt){for(const s of shotQ.slice()){s.t-=dt;if(s.t>0)continue;shotQ.splice(shotQ.indexOf(s),1);const tg=s.tg;
    if(dead||!enemies.includes(tg))continue;const from=ship.localToWorld(NOSE.clone());if(from.distanceTo(tg.pos)>gunRange()+tg.r+2)continue;
    const hit=Math.random()<hitChance();const crit=hit&&Math.random()<critChance();laserFx(from,tg.pos,!hit);
    if(laserStyle().k==='primal'){primalTg=tg;primalT=.6}
    if(hit){const d=shipVal('gun')/LASER_BURST*(crit?critMult():1);hitEnemy(tg,d,'player');dmgText(tg.pos,d,crit?'crit':'player')}else dmgText(tg.pos,1,'miss')}
  // Prvotná zbraň: stály dúhový lúč k cieľu, kým strieľaš (+ pulzy prechádzajúce po lúči)
  primalT-=dt;if(primalT>0&&primalTg&&enemies.includes(primalTg)&&!dead){if(!primalBeam)primalBeam=makeBeam('#7ff6ff');
    const c=new THREE.Color();if(c.setHSL)c.setHSL((performance.now()/1000*.4)%1,.9,.6);setBeam(primalBeam,ship.localToWorld(NOSE.clone()),primalTg.pos,.18+.04*Math.sin(performance.now()/60),'#'+(c.getHexString?c.getHexString():'7ff6ff'))}
  else if(primalBeam)hideBeam(primalBeam);
  for(const p of pulses.slice()){p.t+=dt/.22;if(p.t>=1){world.remove(p.p);pulses.splice(pulses.indexOf(p),1);continue}p.p.position.lerpVectors(p.from,p.to,p.t);const s=3.2*(1+Math.sin(p.t*Math.PI));p.p.scale.set(s,s,1)}
  for(const B of laserPool){if(B.life<=0)continue;B.life-=dt;const k=Math.max(0,B.life/B.max);B.b.userData.core.material.opacity=.95*k;B.b.userData.outer.material.opacity=.4*k;
    B.b.userData.core.scale.x=B.b.userData.core.scale.z=B.w*.35*(.5+.5*k);if(B.life<=0)hideBeam(B.b)}}
/* výstrel piráta: okamžitý červený laser na loď (alebo stanicu) so šancou PIRATE_HIT */
function pirateShot(e,onShip){const from=e.pos.clone();
  if(onShip){if(dead)return;const hit=Math.random()<PIRATE_HIT;showBeam(from,hit?ship.position:ship.position.clone().add(new V3((Math.random()-.5)*7,0,(Math.random()-.5)*7)),'#ff4b3a',.2,.1);
    if(hit){const o=damage(e.dmg,'hit');if(o.hull+o.shield>0)dmgText(ship.position,o.hull+o.shield,'hurt');if(o.hull>0)hurtFlash(.3);if(o.shield>0)bubbleT=1;rumble(.25,90)}}
  else{const to=new V3(0,2,0);showBeam(from,to,'#ff4b3a',.2,.1);if(Math.random()<PIRATE_HIT&&stationDown<=0)stationHit(e.dmg)}}
function clearLasers(){shotQ.length=0;for(const B of laserPool){B.life=0;hideBeam(B.b)}for(const p of pulses)world.remove(p.p);pulses.length=0;if(primalBeam)hideBeam(primalBeam);primalT=0}

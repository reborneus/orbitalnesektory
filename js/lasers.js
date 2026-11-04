'use strict';
/* ==================== == 14b. LASERY (v0.16) ====================
   Zbraň lode strieľa krátke laserové SALVY (1 strela za každú osadenú zbraň) do zameraného/najbližšieho piráta.
   Každý výstrel zasiahne so šancou hitChance() – základ HIT_BASE, zvyšuje ho len schopnosť pilota Strelec (najviac HIT_MAX).
   Farba lasera podľa rarity nasadenej zbrane: žiadna = sivá, do Vzácnej = modrá, Epická/Legendárna = žiarivo zlatá,
   Mytická = červená, Božská = blesky, Prvotná = stály dúhový lúč k cieľu a každá salva = pulz po lúči.
   Piráti strieľajú rovnako (strely so šancou PIRATE_HIT); rakety veží v aréne ostávajú navádzané strely. */
const HIT_BASE=.7,HIT_MAX=.9,PIRATE_HIT=.7,LASER_BURST=1;   // LASER_BURST = strely na 1 zbraň v salve
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
/* v0.16.3: SALVA = toľko krátkych laserových striel, koľko zbraní je osadených (zatiaľ 1 slot Zbraň; lode s viac slotmi
   v budúcnosti vystrelia viac striel naraz). Strela je krátky svetelný úsek (STREAK_LEN m), ktorý letí rýchlosťou STREAK_SPEED
   a vždy smeruje na cieľ; poškodenie sa započíta pri dopade. Poškodenie výstrelu sa rozdelí medzi strely salvy. */
const STREAK_SPEED=160,STREAK_LEN=5,SALVO_GAP=.05;
const weaponMounts=()=>Math.max(1,SLOTS.filter(k=>BASES[state.eq[k]?state.eq[k].b:'']&&BASES[state.eq[k].b].slot==='weapon').length);
const streaks=[];
function fireStreak(from,tg,o){streaks.push({p:from.clone(),tg,to:tg.pos?null:tg.clone(),off:o.miss?new V3((Math.random()-.5)*6,0,(Math.random()-.5)*6):new V3(),...o})}
/* výstrel hráča: Božská = okamžitý blesk, Prvotná = pulz po dúhovom lúči, ostatné = letiace strely */
function laserFx(from,tg,o){const st=laserStyle();
  if(st.k==='bolt'){const tp=tg.pos.clone().add(o.miss?new V3((Math.random()-.5)*6,0,(Math.random()-.5)*6):new V3());showBolt(from,tp,st.col);landShot(o,tg);return}
  if(st.k==='primal'){const pu={p:glow('#ffffff',3.2,1),t:0,from:from.clone(),tg,o};world.add(pu.p);pulses.push(pu);return}
  fireStreak(from,tg,{...o,col:st.col,w:st.w})}
/* dopad strely hráča na cieľ */
function landShot(o,tg){if(o.side==='enemy'){landPirate(o);return}if(!enemies.includes(tg))return;
  if(o.miss){dmgText(tg.pos,1,'miss');return}hitEnemy(tg,o.dmg,'player');dmgText(tg.pos,o.dmg,o.crit?'crit':'player');emit(debris,tg.pos,laserStyle().col,.3,new V3((Math.random()-.5)*6,Math.random()*3,(Math.random()-.5)*6))}
const shotQ=[];
function playerBurst(tg){const n=weaponMounts();for(let i=0;i<n;i++)shotQ.push({t:i*SALVO_GAP,tg,i,n})}
function tickShots(dt){for(const s of shotQ.slice()){s.t-=dt;if(s.t>0)continue;shotQ.splice(shotQ.indexOf(s),1);const tg=s.tg;
    if(dead||!enemies.includes(tg))continue;const from=ship.localToWorld(NOSE.clone().add(new V3((s.i-(s.n-1)/2)*1.2,0,0)));if(from.distanceTo(tg.pos)>gunRange()+tg.r+2)continue;
    const hit=Math.random()<hitChance();const crit=hit&&Math.random()<critChance();
    laserFx(from,tg,{miss:!hit,crit,dmg:shipVal('gun')/s.n*(crit?critMult():1),side:'player'});
    if(laserStyle().k==='primal'){primalTg=tg;primalT=.6}}
  // letiace strely (hráč aj piráti): krátky úsek lúča, ktorý sa posúva k cieľu
  for(const k of streaks.slice()){const dest=(k.tg&&k.tg.pos?k.tg.pos:k.to).clone().add(k.off);const d=new V3().subVectors(dest,k.p);const L=d.length();const step=STREAK_SPEED*dt;
    if(L<=step||(k.tg&&k.tg.pos&&k.side==='player'&&!enemies.includes(k.tg))){streaks.splice(streaks.indexOf(k),1);if(L<=step)landShot(k,k.tg);continue}
    d.multiplyScalar(1/L);k.p.addScaledVector(d,step);const tail=k.p.clone().addScaledVector(d,-Math.min(STREAK_LEN,L));showBeam(tail,k.p,k.col,k.w,dt*1.5)}
  // Prvotná zbraň: stály dúhový lúč k cieľu, kým strieľaš (+ pulzy prechádzajúce po lúči)
  primalT-=dt;if(primalT>0&&primalTg&&enemies.includes(primalTg)&&!dead){if(!primalBeam)primalBeam=makeBeam('#7ff6ff');
    const c=new THREE.Color();if(c.setHSL)c.setHSL((performance.now()/1000*.4)%1,.9,.6);setBeam(primalBeam,ship.localToWorld(NOSE.clone()),primalTg.pos,.18+.04*Math.sin(performance.now()/60),'#'+(c.getHexString?c.getHexString():'7ff6ff'))}
  else if(primalBeam)hideBeam(primalBeam);
  for(const p of pulses.slice()){p.t+=dt/.3;const to=enemies.includes(p.tg)?p.tg.pos:p.from;if(p.t>=1){world.remove(p.p);pulses.splice(pulses.indexOf(p),1);landShot(p.o,p.tg);continue}p.p.position.lerpVectors(p.from,to,p.t);const s=3.2*(1+Math.sin(p.t*Math.PI));p.p.scale.set(s,s,1)}
  for(const B of laserPool){if(B.life<=0)continue;B.life-=dt;const k=Math.max(0,B.life/B.max);B.b.userData.core.material.opacity=.95*k;B.b.userData.outer.material.opacity=.4*k;
    B.b.userData.core.scale.x=B.b.userData.core.scale.z=B.w*.35*(.5+.5*k);if(B.life<=0)hideBeam(B.b)}}
/* výstrel piráta: krátka červená strela na loď (alebo stanicu), o zásahu (PIRATE_HIT) sa rozhodne pri výstrele */
function pirateShot(e,onShip){if(onShip&&dead)return;const hit=Math.random()<PIRATE_HIT;
  fireStreak(e.pos,onShip?{pos:ship.position}:new V3(0,2,0),{miss:!hit,dmg:e.dmg,side:'enemy',onShip,col:'#ff4b3a',w:.22})}
function landPirate(o){if(o.miss)return;
  if(o.onShip){if(dead)return;const r=damage(o.dmg,'hit');if(r.hull+r.shield>0)dmgText(ship.position,r.hull+r.shield,'hurt');if(r.hull>0)hurtFlash(.3);if(r.shield>0)bubbleT=1;rumble(.25,90)}
  else if(stationDown<=0)stationHit(o.dmg)}
function clearLasers(){shotQ.length=0;streaks.length=0;for(const B of laserPool){B.life=0;hideBeam(B.b)}for(const p of pulses)world.remove(p.p);pulses.length=0;if(primalBeam)hideBeam(primalBeam);primalT=0}

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
function laserStyle(){const w=state.eq&&state.eq.weapon;return laserStyleR(w?w.r:-1)}
/* v0.34: vzhľad strely podľa rarity (hráč = rarita zbrane, obranná veža = rarita jej vylepšenia) */
function laserStyleR(r){
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
/* Božská zbraň: blesk – vlastný vzhľad nižšie (v0.19, showBolt) */
/* v0.16.3: SALVA = toľko krátkych laserových striel, koľko zbraní je osadených (zatiaľ 1 slot Zbraň; lode s viac slotmi
   v budúcnosti vystrelia viac striel naraz). Strela je krátky svetelný úsek (STREAK_LEN m), ktorý letí rýchlosťou STREAK_SPEED
   a vždy smeruje na cieľ; poškodenie sa započíta pri dopade. Poškodenie výstrelu sa rozdelí medzi strely salvy. */
const STREAK_SPEED=160,STREAK_LEN=5,SALVO_GAP=.05;
const weaponMounts=()=>Math.max(1,SLOTS.filter(k=>BASES[state.eq[k]?state.eq[k].b:'']&&BASES[state.eq[k].b].slot==='weapon').length);
const streaks=[];
function fireStreak(from,tg,o){const st=o.st||'blue';if(o.side==='enemy')sfx('pirate',from);else sfx('laser',from,{st,fx:o.fx,tower:o.side==='tower'});   // v0.35: zvuk výstrelu
  streaks.push({p:from.clone(),tg,to:tg.pos?null:tg.clone(),off:o.miss?new V3((Math.random()-.5)*6,0,(Math.random()-.5)*6):new V3(),...o,mesh:getBolt(st,o.col),ph:Math.random()*TAU});
  boltFlash(from,o.col,st==='gold'?3.2:2.4)}   // záblesk pri hlavni
/* výstrel hráča: Božská = okamžitý blesk, Prvotná = pulz po dúhovom lúči, ostatné = letiace strely */
function laserFx(from,tg,o,st){st=st||laserStyle();o.col=o.col||st.col;
  if(st.k==='bolt'){const tp=tg.pos.clone().add(o.miss?new V3((Math.random()-.5)*6,0,(Math.random()-.5)*6):new V3());showBolt(from,tp,st.col);sfx('zap',from);landShot(o,tg);return}
  if(st.k==='primal'){sfx('laser',from,{st:'primal',fx:o.fx});const pu={p:glow('#ffffff',3.2,1),t:0,from:from.clone(),tg,o};world.add(pu.p);pulses.push(pu);return}
  fireStreak(from,tg,{...o,col:st.col,w:st.w,st:st.k})}
/* v0.34: výstrel obrannej veže – rovnaké strely ako hráč (2–3 salvy, poškodenie nesie prvá), vzhľad podľa rarity vylepšenia veže */
function towerBurst(from,tg,r,dmg){const st=laserStyleR(r),v=VOLLEY_MIN+Math.floor(Math.random()*(VOLLEY_MAX-VOLLEY_MIN+1));
  for(let j=0;j<v;j++)shotQ.push({t:j*VOLLEY_GAP,tg,tower:true,from:from.clone(),st,fx:j>0,dmg})}
/* dopad strely hráča na cieľ */
function landShot(o,tg){if(o.side==='enemy'){landPirate(o);return}if(!enemies.includes(tg))return;
  if(o.side==='tower'){if(o.fx){emit(debris,tg.pos,o.col,.25,new V3((Math.random()-.5)*6,Math.random()*3,(Math.random()-.5)*6));return}
    hitEnemy(tg,o.dmg,'tower');dmgText(tg.pos,o.dmg,'tower');if(typeof rsTowerHit==='function')rsTowerHit(tg,o);sfx('hit',tg.pos);emit(debris,tg.pos,o.col,.3,new V3((Math.random()-.5)*6,Math.random()*3,(Math.random()-.5)*6));return}
  if(o.fx){emit(debris,tg.pos,laserStyle().col,.25,new V3((Math.random()-.5)*6,Math.random()*3,(Math.random()-.5)*6));return}   // vizuálna salva: len iskra, bez poškodenia
  if(o.miss){dmgText(tg.pos,1,'miss');return}sfx('hit',tg.pos);hitEnemy(tg,o.dmg,'player');dmgText(tg.pos,o.dmg,o.crit?'crit':'player');if(typeof rsOnHit==='function'&&enemies.length)rsOnHit(tg,o);emit(debris,tg.pos,laserStyle().col,.3,new V3((Math.random()-.5)*6,Math.random()*3,(Math.random()-.5)*6))}
const shotQ=[];
/* v0.19.2: každý výstrel = 2–3 salvy tesne po sebe (VOLLEY_GAP s). Poškodenie (aj zásah/minutie a kritický zásah) nesie len
   prvá salva; ďalšie sú iba vizuálne (fx) a letia rovnakým smerom. Tempo streľby a poškodenie za sekundu sa nemení. */
const VOLLEY_MIN=2,VOLLEY_MAX=3,VOLLEY_GAP=.09;
/* v0.19.3: salvy letia vždy v rovnakom tempe GUN_VIS_INT (ako základná rýchlosť 1,2 /s), vzhľad sa s vylepšením nemení.
   Rýchlosť streľby (gunRate) sa prejaví len v čísle: poškodenie salvy = poškodenie výstrelu × výstrely/s × GUN_VIS_INT,
   takže poškodenie za sekundu je rovnaké, ako keby loď naozaj strieľala rýchlejšie. */
const GUN_VIS_INT=1/1.2;
const gunVolleyDmg=()=>shipVal('gun')*shipVal('gunRate')*GUN_VIS_INT;
function playerBurst(tg){const n=weaponMounts(),v=VOLLEY_MIN+Math.floor(Math.random()*(VOLLEY_MAX-VOLLEY_MIN+1));
  for(let j=0;j<v;j++)for(let i=0;i<n;i++)shotQ.push({t:j*VOLLEY_GAP+i*SALVO_GAP,tg,i,n,fx:j>0})}
function tickShots(dt){for(const s of shotQ.slice()){s.t-=dt;if(s.t>0)continue;shotQ.splice(shotQ.indexOf(s),1);const tg=s.tg;
    if(s.tower){if(enemies.includes(tg))laserFx(s.from,tg,{fx:s.fx,miss:false,dmg:s.dmg,side:'tower'},s.st);continue}   // strela veže
    if(dead||!enemies.includes(tg))continue;const from=ship.localToWorld(NOSE.clone().add(new V3((s.i-(s.n-1)/2)*1.2,0,0)));if(from.distanceTo(tg.pos)>gunRange()+tg.r+2)continue;
    if(s.fx){laserFx(from,tg,{fx:true,miss:false,dmg:0,side:'player'});continue}   // len vizuálna salva
    const hit=Math.random()<hitChance();const crit=hit&&Math.random()<critChance();
    laserFx(from,tg,{miss:!hit,crit,dmg:gunVolleyDmg()/s.n*(crit?critMult():1),side:'player'});
    if(laserStyle().k==='primal'){primalTg=tg;primalT=.6}}
  // letiace strely (hráč aj piráti): krátky úsek lúča, ktorý sa posúva k cieľu
  for(const k of streaks.slice()){const dest=(k.tg&&k.tg.pos?k.tg.pos:k.to).clone().add(k.off);const d=new V3().subVectors(dest,k.p);const L=d.length();const step=STREAK_SPEED*dt;
    if(L<=step||(k.tg&&k.tg.pos&&k.side==='player'&&!enemies.includes(k.tg))){streaks.splice(streaks.indexOf(k),1);k.mesh.visible=false;if(L<=step){landShot(k,k.tg);if(!k.miss)boltFlash(dest,k.col,k.st==='gold'?4.5:3.4)}continue}
    d.multiplyScalar(1/L);k.p.addScaledVector(d,step);placeBolt(k,d,dt)}
  tickFlashes(dt);tickZaps(dt)
  // Prvotná zbraň: stály dúhový lúč k cieľu, kým strieľaš (+ pulzy prechádzajúce po lúči)
  primalT-=dt;if(primalT>0&&primalTg&&enemies.includes(primalTg)&&!dead){if(!primalBeam)primalBeam=makeBeam('#7ff6ff');
    const c=new THREE.Color();if(c.setHSL)c.setHSL((performance.now()/1000*.4)%1,.9,.6);setBeam(primalBeam,ship.localToWorld(NOSE.clone()),primalTg.pos,.18+.04*Math.sin(performance.now()/60),'#'+(c.getHexString?c.getHexString():'7ff6ff'))}
  else if(primalBeam)hideBeam(primalBeam);
  for(const p of pulses.slice()){p.t+=dt/.3;const to=enemies.includes(p.tg)?p.tg.pos:p.from;if(p.t>=1){world.remove(p.p);pulses.splice(pulses.indexOf(p),1);landShot(p.o,p.tg);continue}p.p.position.lerpVectors(p.from,to,p.t);const s=3.2*(1+Math.sin(p.t*Math.PI));p.p.scale.set(s,s,1)}
  for(const B of laserPool){if(B.life<=0)continue;B.life-=dt;const k=Math.max(0,B.life/B.max);B.b.userData.core.material.opacity=.95*k;B.b.userData.outer.material.opacity=.4*k;
    B.b.userData.core.scale.x=B.b.userData.core.scale.z=B.w*.35*(.5+.5*k);if(B.life<=0)hideBeam(B.b)}}
/* výstrel piráta: krátka červená strela na loď (alebo stanicu), o zásahu (PIRATE_HIT) sa rozhodne pri výstrele */
function pirateShot(e,onShip){if(onShip&&dead)return;const hit=Math.random()<PIRATE_HIT;
  fireStreak(e.pos,onShip?{pos:ship.position}:new V3(0,2,0),{miss:!hit,dmg:e.dmg,side:'enemy',onShip,col:'#ff4b3a',w:.22,st:'pir'})}
function landPirate(o){if(o.miss)return;
  if(o.onShip){if(dead)return;if(typeof rsShipHit==='function'&&rsShipHit(o))return;const r=damage(o.dmg,'hit');if(r.hull+r.shield>0)dmgText(ship.position,r.hull+r.shield,'hurt');if(r.hull>0)hurtFlash(.3);if(r.shield>0)bubbleT=1;rumble(.25,90)}
  else if(stationDown<=0)stationHit(o.dmg)}
function clearLasers(){shotQ.length=0;streaks.length=0;for(const b of boltPool)b.visible=false;for(const f of flashes)f.s.visible=false;flashes.length=0;for(const z of zaps)z.m.visible=false;zaps.length=0;for(const B of laserPool){B.life=0;hideBeam(B.b)}for(const p of pulses)world.remove(p.p);pulses.length=0;if(primalBeam)hideBeam(primalBeam);primalT=0}

/* ==================== v0.19: VZHĽAD LASEROVÝCH STRIEL ====================
   Každá strela je plochý svetelný „blesk“ ležiaci v rovine letu (kamera je zhora), natočený v smere letu. Jeho textúra sa
   kreslí raz pre každý štýl a farbu (canvas): široká mäkká žiara vo farbe → hustejšie farebné telo → biele horúce jadro,
   svetelné uzly (energetické prstence) pozdĺž strely, iskry okolo a jasná hlavica vpredu; chvost sa stráca.
   Štýly: grey = tenká jednoduchá, blue = rovná so sériou uzlov, gold = hrubšia „kopija“ so špicatou hlavicou a zvlneným
   telom, red = hrubá a iskriaca, pir = pirátska (červeno-oranžová, kratšia, rozkmitaná). Pri hlavni a pri zásahu záblesk,
   za strelou drobné iskry. Božská (blesk) a Prvotná (dúhový lúč) zbraň majú vlastný vzhľad vyššie. */
const BOLT_GEO=typeof THREE!=='undefined'?new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2):null;   // (wiki.html beží bez Three.js)   // šírka = os x, dĺžka = os z (hlavica na +z)
const BOLT_SIZE={grey:[1.3,5.2],blue:[1.7,5.6],gold:[2.35,6.6],red:[2.15,6],pir:[1.5,4.8]};   // v0.19.2: hrubšie strely   // [šírka, dĺžka]
const _boltTex={};
function boltTex(st,col){const key=st+col;if(_boltTex[key])return _boltTex[key];
  const W=96,H=512,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const C=new THREE.Color(col);
  const rgba=(a,k=1)=>`rgba(${Math.round(Math.min(255,C.r*255*k))},${Math.round(Math.min(255,C.g*255*k))},${Math.round(Math.min(255,C.b*255*k))},${a})`;
  const cx=W/2,head=H-26,tail=st==='pir'?110:60;g.globalCompositeOperation='lighter';const r=rng(key.length*97+(C.r*999|0));
  // tvar tela: šírka v mieste y (0 = chvost … 1 = hlavica); gold = kopija so špicou, ostatné = kapsula
  const prof=t=>st==='gold'?(t<.82?.35+.65*Math.pow(t/.82,.7)*(1+.12*Math.sin(t*26)):1-(t-.82)/.18*.95):Math.min(1,t*3.5)*(t>.93?1-(t-.93)/.07*.6:1);
  function body(wmax,fill,blur){g.save();g.shadowColor=fill;g.shadowBlur=blur;g.fillStyle=fill;g.beginPath();
    for(let i=0;i<=40;i++){const t=i/40,y=tail+(head-tail)*t;g.lineTo(cx+wmax*prof(t),y)}
    for(let i=40;i>=0;i--){const t=i/40,y=tail+(head-tail)*t;g.lineTo(cx-wmax*prof(t),y)}g.closePath();g.fill();g.restore()}
  // chvost postupne mizne: priehľadnosť cez gradient
  const thick={grey:.55,blue:.75,gold:1,red:.95,pir:.7}[st];
  body(W*.42*thick,rgba(.2),22);body(W*.26*thick,rgba(.5),12);body(W*.14*thick,rgba(.75,1.1),6);
  body(W*.04*thick,'rgba(255,255,255,.7)',3);
  // energetické uzly (svetelné prstence) pozdĺž strely
  const nodes=st==='grey'?2:st==='gold'?5:st==='pir'?3:4;
  for(let i=0;i<nodes;i++){const t=.35+i/(nodes)*.55+r()*.04,y=tail+(head-tail)*t,w=W*.2*thick*prof(t)+4;
    g.save();g.shadowColor=rgba(1);g.shadowBlur=10;g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=2.5;g.beginPath();g.ellipse(cx,y,w,5,0,0,TAU);g.stroke();
    g.fillStyle=rgba(.5,1.2);g.beginPath();g.ellipse(cx,y,w*.8,3,0,0,TAU);g.fill();g.restore()}
  // iskry okolo tela (viac pri červenej a zlatej)
  const sparks={grey:6,blue:14,gold:26,red:34,pir:16}[st];
  for(let i=0;i<sparks;i++){const t=r()*.95,y=tail+(head-tail)*t,side=r()<.5?-1:1,x=cx+side*(W*.12*thick*prof(t)+r()*W*.22),s=1+r()*2.2;
    g.fillStyle=r()<.5?'rgba(255,255,255,.9)':rgba(.95,1.3);g.beginPath();g.arc(x,y,s,0,TAU);g.fill()}
  // jasná hlavica
  const hg=g.createRadialGradient(cx,head-6,0,cx,head-6,W*.42);hg.addColorStop(0,'rgba(255,255,255,.85)');hg.addColorStop(.25,rgba(.7,1.2));hg.addColorStop(1,rgba(0));
  g.fillStyle=hg;g.fillRect(0,head-6-W*.42,W,W*.84);
  // zjemnenie chvosta (maska: horná časť textúry stmavne do priehľadna)
  g.globalCompositeOperation='destination-in';const fade=g.createLinearGradient(0,0,0,H);fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(tail/H+.12,'rgba(0,0,0,.35)');fade.addColorStop(.7,'rgba(0,0,0,1)');fade.addColorStop(1,'rgba(0,0,0,1)');
  g.fillStyle=fade;g.fillRect(0,0,W,H);
  const T=new THREE.CanvasTexture(c);T.encoding=THREE.sRGBEncoding;return _boltTex[key]=T}
const boltPool=[];
function getBolt(st,col){let m=boltPool.find(b=>!b.visible);
  if(!m){m=new THREE.Mesh(BOLT_GEO,new THREE.MeshBasicMaterial({map:boltTex(st,col),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));
    m.frustumCulled=false;m.renderOrder=5;scene.add(m);boltPool.push(m)}
  m.material.map=boltTex(st,col);m.userData.st=st;m.userData.col=col;m.visible=true;m.scale.set(.001,1,.001);return m}
/* umiestni mesh strely: hlavica na k.p, smer d; jemné blikanie šírky a iskry za strelou */
function placeBolt(k,d,dt){const m=k.mesh,[w,len]=BOLT_SIZE[k.st]||BOLT_SIZE.blue;k.ph+=dt*40;
  const flick=1+.09*Math.sin(k.ph)+.05*Math.sin(k.ph*2.7);m.scale.set(w*flick,1,len);
  m.position.copy(k.p).addScaledVector(d,-len*.42);m.position.y=k.p.y+.2;m.rotation.set(0,Math.atan2(d.x,d.z),0);
  m.material.opacity=.72+.1*Math.sin(k.ph*1.7);
  if(Math.random()<dt*(k.st==='red'||k.st==='gold'?40:22)){const tp=k.p.clone().addScaledVector(d,-len*(.3+Math.random()*.6));
    emit(debris,tp,Math.random()<.4?'#ffffff':k.col,.18+Math.random()*.2,new V3((Math.random()-.5)*4,Math.random()*1.5,(Math.random()-.5)*4))}}
/* záblesky (hlaveň, zásah): krátko zväčšujúci sa a miznúci svetelný bod */
const flashes=[],flashPool=[];
function boltFlash(pos,col,size){let s=flashPool.find(x=>!x.visible);if(!s){if(flashPool.length>=40)return;s=glow('#ffffff',1,1);s.material.toneMapped=false;scene.add(s);flashPool.push(s)}
  s.visible=true;s.position.copy(pos);s.material.color.set(col);flashes.push({s,t:0,max:.16,size});
  if(flashes.length&&size>3.5)for(let i=0;i<3;i++)emit(debris,pos,i?col:'#ffffff',.3,new V3((Math.random()-.5)*9,Math.random()*3,(Math.random()-.5)*9))}
function tickFlashes(dt){for(const f of flashes.slice()){f.t+=dt;const k=f.t/f.max;if(k>=1){f.s.visible=false;flashes.splice(flashes.indexOf(f),1);continue}
  const sc=f.size*(.6+k*.8);f.s.scale.set(sc,sc,1);f.s.material.opacity=(1-k)*.95}}

/* ==================== v0.19: BLESK (Božská zbraň) ====================
   Detailný blesk ako plochý svetelný pás medzi loďou a cieľom. Textúr je ZAP_VARS variantov (generujú sa raz, pri prvom výstrele):
   hlavná kľukatá dráha (delenie úsečky s náhodným vychýlením, s malými slučkami), hrubé „kvapkovité“ biele jadro,
   modrá žiara, bočné vetvy a jemné tenké vlákna okolo, plus slabý žiariaci stĺpec v pozadí. Počas krátkeho života
   (ZAP_LIFE) blesk prepína varianty (mihotanie) a mizne; pri lodi a pri cieli záblesk a iskry. */
const ZAP_VARS=8,ZAP_LIFE=.24;const ZAP_TEX=[];
function zapTex(i){if(ZAP_TEX[i])return ZAP_TEX[i];const W=256,H=1024,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const r=rng(9001+i*31);
  // kľukatá dráha: rekurzívne vychyľovanie stredov úsečiek
  function path(x0,y0,x1,y1,amp,depth){let pts=[[x0,y0],[x1,y1]];for(let d=0;d<depth;d++){const n=[pts[0]];
      for(let k=0;k<pts.length-1;k++){const[a,b]=[pts[k],pts[k+1]];const len=Math.hypot(b[0]-a[0],b[1]-a[1]);n.push([(a[0]+b[0])/2+(r()-.5)*amp*len/H*4,(a[1]+b[1])/2+(r()-.5)*len*.15]);n.push(b)}
      pts=n;amp*=.7}return pts}
  // malé slučky (ako na predlohe): občas sa dráha zatočí okolo bodu
  function loops(pts){const out=[];for(let k=0;k<pts.length;k++){out.push(pts[k]);if(k>2&&k<pts.length-3&&r()<.035){const[x,y]=pts[k],rr=4+r()*7,s=r()<.5?1:-1;for(let a=0;a<=6;a++){const t=a/6*TAU;out.push([x+s*Math.sin(t)*rr,y+(1-Math.cos(t))*rr*.8])}}}return out}
  const main=loops(path(W/2+(r()-.5)*20,0,W/2+(r()-.5)*20,H,W*.6,8));
  const stroke=(pts,w,col,blur,a=1)=>{g.save();g.globalAlpha=a;g.strokeStyle=col;g.lineWidth=w;g.lineJoin=g.lineCap='round';g.shadowColor=col;g.shadowBlur=blur;g.beginPath();pts.forEach(([x,y],k)=>k?g.lineTo(x,y):g.moveTo(x,y));g.stroke();g.restore()};
  g.globalCompositeOperation='lighter';
  // stĺpec slabej žiary v pozadí
  const bg=g.createLinearGradient(0,0,W,0);bg.addColorStop(0,'rgba(20,70,255,0)');bg.addColorStop(.5,'rgba(30,100,255,.22)');bg.addColorStop(1,'rgba(20,70,255,0)');g.fillStyle=bg;g.fillRect(0,0,W,H);
  // tenké vlákna (jemné „žilky“ okolo hlavnej dráhy)
  for(let f=0;f<7;f++){const k0=Math.floor(r()*(main.length-40)),k1=k0+15+Math.floor(r()*40);const seg=main.slice(k0,k1).map(([x,y])=>[x+(r()-.5)*24+Math.sin(y*.05+f)*14,y]);stroke(seg,1,'rgba(160,215,255,.8)',4,.7)}
  // bočné vetvy
  for(let b=0;b<9;b++){const k=Math.floor(r()*(main.length-1));const[x,y]=main[k];const side=r()<.5?-1:1,len=40+r()*140;
    const br=path(x,y,x+side*(20+r()*60),y+len*(r()<.75?1:-1),W*.25,5);stroke(br,6,'rgba(40,120,255,.5)',14);stroke(br,2.2,'rgba(170,225,255,.9)',6);stroke(br,1,'#ffffff',2)}
  // hlavná dráha: modrá žiara → svetlomodrá → biele jadro s premenlivou hrúbkou (kvapky)
  stroke(main,26,'rgba(25,90,255,.35)',40);stroke(main,12,'rgba(60,150,255,.75)',18);stroke(main,6,'rgba(180,230,255,1)',8);
  for(let k=0;k<main.length-1;k++){const w=2.5+Math.pow(r(),3)*9;stroke([main[k],main[k+1]],w,'#ffffff',3)}
  // konce sa strácajú, aby blesk plynulo nadväzoval na záblesk pri lodi a cieli
  g.globalCompositeOperation='destination-in';const fd=g.createLinearGradient(0,0,0,H);fd.addColorStop(0,'rgba(0,0,0,.2)');fd.addColorStop(.06,'#000');fd.addColorStop(.94,'#000');fd.addColorStop(1,'rgba(0,0,0,.3)');g.fillStyle=fd;g.fillRect(0,0,W,H);
  const T=new THREE.CanvasTexture(c);T.encoding=THREE.sRGBEncoding;return ZAP_TEX[i]=T}
const zapPool=[],zaps=[];
function showBolt(a,c,col){let m=zapPool.find(z=>!z.visible);
  if(!m){m=new THREE.Mesh(BOLT_GEO,new THREE.MeshBasicMaterial({map:zapTex(0),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));m.frustumCulled=false;m.renderOrder=6;scene.add(m);zapPool.push(m)}
  const d=new V3().subVectors(c,a);const L=d.length();m.visible=true;m.position.addVectors(a,c).multiplyScalar(.5);m.position.y+=.3;m.rotation.set(0,Math.atan2(d.x,d.z),0);
  const z={m,t:0,sw:0,L,w:Math.min(7,3.2+L*.08),flip:Math.random()<.5?-1:1};zapSwap(z);zaps.push(z);
  boltFlash(a,col,3);boltFlash(c,col,6);for(let i=0;i<6;i++)emit(debris,c,i%2?'#ffffff':col,.3+Math.random()*.2,new V3((Math.random()-.5)*12,Math.random()*4,(Math.random()-.5)*12))}
function zapSwap(z){z.m.material.map=zapTex(Math.floor(Math.random()*ZAP_VARS));z.flip=Math.random()<.5?-1:1}
function tickZaps(dt){for(const z of zaps.slice()){z.t+=dt;z.sw-=dt;if(z.t>=ZAP_LIFE){z.m.visible=false;zaps.splice(zaps.indexOf(z),1);continue}
  if(z.sw<=0){z.sw=.045;zapSwap(z)}const k=z.t/ZAP_LIFE;z.m.scale.set(z.w*z.flip*(1+.15*Math.sin(z.t*90)),1,z.L*1.04);z.m.material.opacity=1-k*k}}

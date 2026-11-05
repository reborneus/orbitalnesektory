'use strict';
/* ==================== == 6. SEKTOR ====================
   buildSector() postaví celý sektor nanovo (pri štarte a po skoku): pozadie, zóny, asteroidy, stanicu, bránu.
   Asteroid (objekt a): type, amt/max = zostávajúce/pôvodné množstvo, alive, respawn = sekundy do znovuobjavenia,
   rmin/rmax = pás, v ktorom sa smie objaviť, claims = koľko dronov si ho práve zabralo. */
let world=null,asts=[],pickables=[],stationG=null,stationAnim=null,gate=null,drones=[];
const STATION_R=42;   // v0.26: 3× väčšia stanica (dosah stanice, vykladanie, štart lode)
/* v0.18: stanica (megaštruktúra) je zapustená STATION_Y pod rovinou letu – loď nad ňou prelieta. DECK_R = polomer palubného
   prstenca, na ktorom stoja moduly (slotPos vracia polohu modulu v rovine stanice). */
const GATE_K=2.6;   // v0.27: mierka brány
const ST_SCALE=3,STATION_Y=-40,DECK_R=13,DECK_TOP=.75*ST_SCALE;   // v0.26: konštrukcia ST_SCALE× väčšia; DECK_TOP = výška paluby v stanici
function slotPos(i){const a=i/6*TAU+Math.PI/6,R=DECK_R*ST_SCALE;return new V3(Math.cos(a)*R,0,Math.sin(a)*R)}
let _stMats=null;
/* ==================== v0.19.5: ENERGETICKÉ JADRO STANICE ====================
   Plazmová guľa (podľa videa): biele horúce jadro, okolo vírivé svietiace žilky (ridged šum deformovaný ďalším šumom),
   rozstrapkaný okraj. Je to štvorec natočený vždy ku kamere s vlastným shaderom (kreslí sa aditívne, cez konštrukciu prežaruje).
   Farba podľa stavu: modrá = pokoj, tyrkysovo-zelená = hráč je v dosahu stanice, červená = stanica je pod útokom
   (posledný zásah pred menej ako CORE_HIT s alebo nájazd so stanicou ako cieľom). Farby sa plynulo prelínajú. */
const CORE_COL={idle:'#2f74ff',near:'#19f0a0',hit:'#ff2a2a'},CORE_HIT=3;
let stationHitT=0;const _coreC=new THREE.Color('#2f74ff'),_coreT=new THREE.Color();
function makeCoreOrb(){const m=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uC:{value:_coreC.clone()},uK:{value:1}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform float uT;uniform vec3 uC;uniform float uK;varying vec2 vUv;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
float ridge(vec2 p){float v=0.,a=.55;for(int i=0;i<5;i++){float k=1.-abs(n(p)*2.-1.);v+=a*k*k*k;p=p*2.07+vec2(3.1,1.3);a*=.5;}return v;}
void main(){vec2 p=vUv*2.-1.;float r=length(p);if(r>1.)discard;
  /* v0.21: rovnomerné otáčanie + ohraničené kývanie vnútra. (Pôvodné „vnútro rýchlejšie“ sa s časom stále viac
     skrúcalo a po pár minútach z gule vznikol vír.) */
  float a=uT*.12+.55*sin(uT*.3+r*3.)*(1.-r);float cs=cos(a),sn=sin(a);vec2 q=mat2(cs,-sn,sn,cs)*p;
  vec2 w=vec2(fbm(q*2.2+vec2(uT*.13,0.)),fbm(q*2.2+vec2(5.2,-uT*.11)));
  float v1=ridge(q*3.2+w*2.4+vec2(uT*.07,-uT*.05));float v2=ridge(q*6.5-w*1.6+vec2(-uT*.12,uT*.09));
  float veins=pow(clamp(v1*1.15,0.,1.),5.)*1.8+pow(clamp(v2,0.,1.),6.)*.9;
  float edge=smoothstep(1.,.5,r+(fbm(q*5.+uT*.4)-.5)*.45);                                      // rozstrapkaný okraj
  float body=edge*(.18+.35*fbm(q*3.-w+uT*.2));
  float core=exp(-r*r*22.)*1.05+exp(-r*r*6.)*.35;
  vec3 col=uC*body*1.4+mix(uC,vec3(1.),.38)*veins*edge*(1.25-r*.6)+mix(uC,vec3(1.),.75)*core;
  gl_FragColor=vec4(col*uK,1.);}`});
  const o=new THREE.Mesh(new THREE.PlaneGeometry(10.4,10.4),m);o.renderOrder=4;/* v0.32: o 20 % menšie */o.frustumCulled=false;return o}
/* volá main.js každý snímok: stav → farba jadra, žiary a svetelných pásov stanice */
function tickStationCore(dt,tt){if(!stationAnim||!stationAnim.orb)return;stationHitT-=dt;
  const hit=stationHitT>0||(typeof raidActive!=='undefined'&&raidActive&&enemies.some(e=>!e.wasPassive&&!e.aggro&&!e.leaving&&Math.hypot(e.pos.x,e.pos.z)<60));
  const near=!hit&&typeof nearStation==='function'&&nearStation();const brk=stationBroken();
  if(brk){_coreT.set('#ff4a22');_coreC.copy(_coreT);tickBroken(dt,tt)}else _coreT.set(CORE_COL[hit?'hit':near?'near':'idle']);_coreC.lerp(_coreT,Math.min(1,dt*3));
  // guľa je posunutá o 7 m smerom ku kamere: prežiari cez vežu nad jadrom, ale loď nad stanicou ju stále prekryje
  const o=stationAnim.orb;o.quaternion.copy(camera.quaternion);o.position.set(camera.position.x,camera.position.y-STATION_Y,camera.position.z).normalize().multiplyScalar(7);const U=o.material.uniforms;U.uT.value=tt;U.uC.value.copy(_coreC);U.uK.value=brk?(Math.random()<.08?.03:.13+.06*Math.sin(tt*23)):hit?1.1+.25*Math.sin(tt*9):1;   // vyradené jadro slabo a nepravidelne bliká
  stationAnim.coreGlow.material.color.copy(_coreC);if(brk){stationAnim.coreGlow.material.opacity=U.uK.value*.6;return}stationAnim.coreGlow.material.opacity=.5;const K=stationMats();K.glow.emissive.copy(_coreC);K.lattice.emissive.copy(_coreC).multiplyScalar(.6)}
function stationMats(){return _stMats||(_stMats={
  hull:kitHullMat('stH',{base:'#5d6674',vari:.22,line:'#262b33',lit:['#ffcf7a','#7fb6ff'],litP:.12,seed:51},{metalness:.7,roughness:.4,emissiveIntensity:1.8,flatShading:true}),
  dark:kitHullMat('stD',{base:'#2a3039',vari:.3,line:'#12151a',lit:['#ffcf7a'],litP:.1,seed:52},{metalness:.75,roughness:.45,emissiveIntensity:1.8,flatShading:true}),
  glow:kitGlowMat('#4f9bff',2.6),amber:kitGlowMat('#ffc46a',2.2),core:kitGlowMat('#3d86ff',1.5),
  lattice:new THREE.MeshStandardMaterial({color:new THREE.Color('#1a2433'),metalness:.8,roughness:.4,wireframe:true,emissive:new THREE.Color('#2a6dff'),emissiveIntensity:.6}),
  // v0.32: chróm (svetlý lesklý trup), bronz so zlatými okienkami, tmavý bronz pre dno kanála
  chrome:kitHullMat('stC2',{base:'#7d8792',vari:.2,line:'#2a3038',lit:['#9feaff'],litP:.06,seed:53},{metalness:.72,roughness:.32,emissiveIntensity:1.8}),
  bronze:kitHullMat('stB',{base:'#9a7240',vari:.25,line:'#3d2a12',lit:['#ffd27a','#ffb24a'],litP:.22,seed:54},{metalness:.7,roughness:.35,emissiveIntensity:2.2}),
  bronzeD:kitHullMat('stB2',{base:'#3a2a18',vari:.3,line:'#1a1208',lit:['#ffcf6a','#ffa53a'],litP:.35,seed:55},{metalness:.5,roughness:.6,emissiveIntensity:2.4})})}
/* pomocníci pre stanicu: plochý prstenec (vodorovne) a hustota textúry na rotačných tvaroch */
function ringGeo(r0,r1,n){const g=new THREE.RingGeometry(r0,r1,n,1);g.rotateX(-HALF);const P=g.attributes.position,U=g.attributes.uv;for(let i=0;i<P.count;i++)U.setXY(i,P.getX(i)*KIT_UV,P.getZ(i)*KIT_UV);return g}
function uvScale(g,su,sv){const U=g.attributes.uv;for(let i=0;i<U.count;i++)U.setXY(i,U.getX(i)*su,U.getY(i)*sv);return g}

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
  // autopilot: ak sa zvolená surovina v sektore nenachádza, prepne sa na prvú dostupnú
  if(!S.arena&&S.res.length&&!S.res.includes(state.autoRes))state.autoRes=S.res[0];
  world.userData.bgTick=null;
  if(S.bg)world.userData.bgTick=buildBg(state.cur,world);   // v0.22: realistické pozadie podľa typu (bgscenes.js, bgdisk.js)
  if(!world.userData.bgTick){
  const neb=new THREE.Mesh(new THREE.PlaneGeometry(3000+LIMIT*4,3000+LIMIT*4),new THREE.MeshBasicMaterial({map:nebulaTex(S.neb[0],S.neb[1],S.seed),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.95}));
  neb.rotation.x=-Math.PI/2;neb.position.y=-500;world.add(neb);
  const planet=new THREE.Mesh(new THREE.SphereGeometry(110,48,32),new THREE.MeshStandardMaterial({map:planetTex(S.planet,S.seed),roughness:1,metalness:0}));
  planet.position.set(...S.pPos);planet.rotation.z=.35;world.add(planet);world.userData.planet=planet;
  const atm=glow(S.planet,330,.35);atm.position.copy(planet.position);world.add(atm)}
  // zones: rings at the belt borders, a faint amber wash over the radiation belts 3-4, red past the horizon
  for(const rr of[Z1,Z2,Z3])world.add(flatRing(rr-.2,rr+.2,'#7fa7d0',.09,false,-2));
  world.add(flatRing(Z2,HORIZON,'#ff9a4d',.035,true,-2.2));
  world.add(flatRing(HORIZON,LIMIT+80,'#ff3b2f',.07,true,-2.3));
  world.add(flatRing(HORIZON-.5,HORIZON+.5,'#ff8a5c',.5,false,-1.8));
  const r=rng(S.seed*97);
  for(const f of S.fields)for(let i=0;i<f.n;i++){const a=makeAst(f.type,f,r);placeAst(a,r);asts.push(a)}
  rebuildStation();
  if(!S.arena&&cur().repaired)state.lastBase=state.cur;   // v0.41: posledná navštívená funkčná základňa (tu sa loď zrodí po zničení pri vyradenej stanici)
  updateGate();
  resetCombat();
  missionsRebuild();
  arenaEnter();
  buildNpcs();
}

function makeAst(type,f,r){const g=new THREE.Group();const S=SECTORS[state.cur];
  const base=type==='mix'?4.2+r()*2.2:type==='relic'?.9+r()*.45:type==='crystal'?1.8+r()*1.5:type==='green'?1.7+r()*1.9:1.6+r()*2.3;
  // v0.31: kameň vo vysokom rozlíšení so svietiacimi žilami v farbe suroviny (minerals.js)
  const mp=mineralParts(type,r);const rock=new THREE.Mesh(mp.geo,mp.mat);
  rock.scale.set(1,.85+r()*.3,.9+r()*.2);rock.rotation.set(r()*TAU,r()*TAU,r()*TAU);g.add(rock);
  if(type==='relic'){for(let k=0;k<4;k++){const s=new THREE.Mesh(SHARD,M.relic);const d=new V3(r()-.5,r()*.7+.3,r()-.5).normalize();
      s.position.copy(d).multiplyScalar(.8);s.quaternion.setFromUnitVectors(UP_,d);s.scale.set(.16,.4+r()*.25,.16);g.add(s)}
    const sp=glow('#ffd87a',4.2,.55);g.add(sp);g.userData.spark=sp}
  else g.add(glow({ore:'#f0a644',green:'#86e05a',crystal:'#9b7bff',mix:'#e8d8ff'}[type],{ore:3.4,green:3.6,crystal:3.8,mix:6}[type],{ore:.14,green:.16,crystal:.2,mix:.16}[type]));   // jemný svit okolo
  const proxy=new THREE.Mesh(new THREE.SphereGeometry(1.9,8,6),M.pick);g.add(proxy);
  const mult={ore:30,green:20,crystal:12,relic:8,mix:40}[type]*NUM;const max=Math.round(base*mult*S.rich);
  const a={g,type,base,amt:max,max,alive:true,respawn:0,shrink:1,claims:0,spin:new V3((r()-.5)*.5,(r()-.5)*.6,(r()-.5)*.4),pos:g.position,rmin:f.r[0],rmax:f.r[1]};
  if(type==='mix'){const o=.25+r()*.45,gr=.2+r()*.35,c=.1+r()*.25,sum=o+gr+c;a.mixp={ore:o/sum,green:gr/sum,crystal:c/sum}}
  proxy.userData.ast=a;pickables.push(proxy);world.add(g);return a}
function placeAst(a,r){for(let tries=0;tries<14;tries++){const ang=r()*TAU;const rad=a.rmin+r()*(a.rmax-a.rmin);
    a.g.position.set(Math.cos(ang)*rad,(r()-.5)*3,Math.sin(ang)*rad);
    if(gate&&a.g.position.distanceTo(gate.position)<12*GATE_K)continue;
    if(a.g.position.distanceTo(ship.position)<16)continue;
    if(!asts.some(o=>o!==a&&o.alive&&o.g.position.distanceTo(a.g.position)<a.base+o.base+3))break}
  setAstScale(a)}
/* Veľkosť asteroidu sa zmenšuje podľa toho, koľko z neho zostáva (na polovicu pri úplnom vyťažení). */
function astScale(a){return a.base*(.5+.5*a.amt/a.max)*a.shrink}
function setAstScale(a){a.g.scale.setScalar(Math.max(.001,astScale(a)))}

/* Stanica sa prestavia pri každej zmene (vylepšenie jadra, stavba/predaj modulu). Vzhľad závisí od úrovne jadra. */
/* ==================== v0.41: VYRADENÁ STANICA V NOVOM SEKTORE ====================
   Pri prvej návšteve sektora je hlavná stanica vyradená (state.sec[i].repaired = false): nedá sa vyložiť náklad, stavať,
   prestupovať na lode ani dobíjať radiačný štít; autopilot čaká. Opraví sa v paneli Stanica za suroviny z predošlého sektora
   (stationFixCost). Vzhľad: tmavé ohorené plechy, zastavené prstence, blikajúce jadro, ohne s iskrami a plávajúce trosky. */
const stationBroken=()=>!!(state&&state.sec[state.cur]&&state.sec[state.cur].repaired===false&&!SECTORS[state.cur].arena);
const stationOk=()=>nearStation()&&!stationBroken();
const _burnt=new Map();
function burntMat(m){if(_burnt.has(m))return _burnt.get(m);const c=m.clone();
  if(m.onBeforeCompile)c.onBeforeCompile=m.onBeforeCompile;if(m.customProgramCacheKey)c.customProgramCacheKey=m.customProgramCacheKey;
  if(c.color)c.color.multiplyScalar(.11).lerp(new THREE.Color('#1a0f08'),.25);c.emissiveIntensity=(m.emissiveIntensity||0)*.03;c.roughness=.95;c.metalness=(m.metalness||0)*.4;c.envMapIntensity=.25;   // ohorený, matný plech
  _burnt.set(m,c);return c}
function breakStation(S3,anim){
  S3.traverse(o=>{if(!o.isMesh||!o.material||o.material===M.pick)return;const m=o.material;
    if(m.isMeshStandardMaterial)o.material=burntMat(m);
    else if(m.isMeshBasicMaterial&&m.visible!==false){if(!_burnt.has(m)){const c=m.clone();c.color.multiplyScalar(.12);_burnt.set(m,c)}o.material=_burnt.get(m)}});   // zhasnuté svetelné pásy
  for(const r of anim.rings)r.s=0;   // prstence stoja
  const rr=rng(state.cur*77+5);anim.fires=[];anim.junk=[];
  for(let i=0;i<12;i++){const a=rr()*TAU,d=4+rr()*(DECK_R+6),y=.6+rr()*1.4;
    const f=glow(rr()<.5?'#ff5a12':'#ff8a2a',4+rr()*4,.75);f.position.set(Math.cos(a)*d,y,Math.sin(a)*d);S3.add(f);anim.fires.push({o:f,b:f.scale.x,ph:rr()*9})}
  const JM=burntMat(stationMats().dark);
  for(let i=0;i<14;i++){const a=rr()*TAU,d=DECK_R+4+rr()*16;const m=new THREE.Mesh(new THREE.BoxGeometry(.6+rr()*2.2,.3+rr()*.8,.5+rr()*1.8),JM);
    m.position.set(Math.cos(a)*d,-1+rr()*4,Math.sin(a)*d);m.rotation.set(rr()*3,rr()*3,rr()*3);S3.add(m);anim.junk.push({o:m,s:new V3(rr()-.5,rr()-.5,rr()-.5).multiplyScalar(.6)})}}
/* každý snímok (z tickStationCore): ohne blikajú, z nich lietajú iskry, trosky sa pomaly otáčajú */
function tickBroken(dt,tt){const A=stationAnim;if(!A||!A.fires)return;
  for(const f of A.fires){const k=.7+.3*Math.sin(tt*11+f.ph)*Math.sin(tt*7.3+f.ph*2);f.o.scale.setScalar(f.b*k);
    if(Math.random()<dt*1.2*gfxFx()){const w=f.o.getWorldPosition(new V3());emit(trail,w,Math.random()<.5?'#ff8a3a':'#ffd27a',.5+Math.random()*.4,new V3((Math.random()-.5)*3,2+Math.random()*3,(Math.random()-.5)*3))}}
  for(const j of A.junk){j.o.rotation.x+=j.s.x*dt;j.o.rotation.y+=j.s.y*dt;j.o.rotation.z+=j.s.z*dt}}
function rebuildStation(){
  clearTurretBeams();if(stationG)world.remove(stationG);
  if(inArena()){stationG=null;stationAnim=null;return} // v aréne nie je stanica (v strede sa objavuje anomália)
  const s=cur();const g=new THREE.Group();stationG=g;const anim={rings:[],turrets:[],dishes:[],blink:[]};stationAnim=anim;
  /* v0.18: MEGAŠTRUKTÚRA – stanica je zapustená hlboko pod rovinou letu (STATION_Y), takže nad ňou preletíš a nenarazíš.
     Časti: žiariace guľové jadro s mriežkou, ostré veže hore a (dlhšia) dole so svetelným pásom, veľký palubný prstenec
     s oknami a modulmi, rebrá. S úrovňou jadra pribúda: 2 = vnútorný otáčavý prstenec, 3 = vedľajšie veže + maják,
     4 = veľký naklonený gyroskopický prstenec, 5 = žiariace halo. */
  // v0.26: celá konštrukcia je v skupine S3 zväčšenej ST_SCALE× (moduly ostávajú v pôvodnej veľkosti na palube)
  g.position.y=STATION_Y;const S3=new THREE.Group();S3.scale.setScalar(ST_SCALE);g.add(S3);const K=stationMats(),P=kitParts();
  /* v0.32: STANICA podľa predlohy – plochý chrómovaný disk: v strede stupňovitý náboj („svadobná torta“) okolo
     energetického jadra s venčekom svetiel ako lupene, okolo neho kanál s bronzovým, zlato osvetleným dnom,
     cez kanál 6 mostíkov s kupolami, hrubý chrómovaný palubný prstenec s modulmi a 4 dlhé ramená do kríža.
     Všetky rozmery sú v jednotkách S3 (× ST_SCALE vo svete); paluba pre moduly ostáva na polomere DECK_R. */
  const orb=makeCoreOrb();S3.add(orb);anim.orb=orb;
  const cg=glow('#4f9bff',21,.5);S3.add(cg);anim.coreGlow=cg;
  const C=K.chrome,B=K.bronze,G=K.glow,A=K.amber,D=K.dark;
  // náboj: rotačný profil (polomer, výška) – stupne s ostrými hranami, v strede otvor pre jadro
  const hub=new THREE.LatheGeometry([[3.5,-1.7],[3.5,1.5],[3.9,1.85],[4.5,1.8],[4.7,1.5],[4.7,1.15],[6.0,1.05],[6.3,.85],[6.3,.45],[7.7,.35],[8.0,.1],[8.0,-.35],[8.9,-.45],[9.15,-.8],[9.15,-1.7]].map(([r,y])=>new THREE.Vector2(r,y)),96);
  uvScale(hub,9,4);P.add(C,hub);
  // bronzové vložky na stupňoch (svietia zlatými okienkami) a modré pásy okien na zvislých stenách
  P.add(B,ringGeo(4.75,5.95,96),{p:[0,1.12,0]});P.add(B,ringGeo(6.35,7.65,96),{p:[0,.42,0]});P.add(B,ringGeo(8.05,8.85,96),{p:[0,-.4,0]});
  for(const[r,y,h]of[[4.72,1.32,.14],[6.32,.64,.13],[8.02,-.12,.16],[9.17,-1.05,.12]])P.add(G,new THREE.CylinderGeometry(r,r,h,96,1,true),{p:[0,y,0]});
  // venček „lupeňov“ okolo jadra: svietiace kapsuly v chrómových objímkach
  for(let i=0;i<12;i++){const a=i/12*TAU,x=Math.cos(a),z=Math.sin(a);
    P.add(C,box(1.15,.28,.62),{p:[x*5.35,1.2,z*5.35],r:[0,-a,0]});
    P.add(G,new THREE.SphereGeometry(.42,14,8),{p:[x*5.35,1.36,z*5.35],r:[0,-a,0],s:[1.05,.35,.62]})}
  // drobné svetlá na stupňoch
  for(let i=0;i<36;i++){const a=i/36*TAU;P.add(A,box(.16,.08,.16),{p:[Math.cos(a)*7.1,.47,Math.sin(a)*7.1]})}
  // kanál medzi nábojom a palubou: tmavé bronzové dno s množstvom zlatých svetielok (ako osvetlené mesto)
  P.add(K.bronzeD,ringGeo(9.1,DECK_R-2.55,96),{p:[0,-1.45,0]});
  {const R=rng(23);for(let i=0;i<150;i++){const a=R()*TAU,r=9.35+R()*(DECK_R-2.6-9.5);P.add(A,box(.09,.06,.09),{p:[Math.cos(a)*r,-1.4,Math.sin(a)*r]})}}
  // 6 mostíkov cez kanál (medzi miestami pre moduly), na náboji bronzová kupola so svietiacou špičkou
  for(let i=0;i<6;i++){const a=i/6*TAU,x=Math.cos(a),z=Math.sin(a),rm=(8.6+DECK_R-2.3)/2,L=DECK_R-2.3-8.6;
    P.add(C,box(L,.42,1.0),{p:[x*rm,.05,z*rm],r:[0,-a,0]});P.add(D,box(L,.12,.5),{p:[x*rm,.3,z*rm],r:[0,-a,0]});
    P.add(G,box(L,.06,.08),{p:[x*rm,.12,z*rm],r:[0,-a,0],s:[1,1,1]});
    P.add(B,new THREE.SphereGeometry(.75,18,10,0,TAU,0,HALF),{p:[x*8.35,-.38,z*8.35]});P.add(G,new THREE.SphereGeometry(.24,10,6),{p:[x*8.35,.36,z*8.35]})}
  // palubný prstenec (moduly stoja na ňom): chrómové medzikružie, zaoblené okraje, bronzová vnútorná stena, okná
  const deck=new THREE.Shape();deck.absarc(0,0,DECK_R+2.6,0,TAU,false);const hole=new THREE.Path();hole.absarc(0,0,DECK_R-2.6,0,TAU,true);deck.holes.push(hole);
  const dg=new THREE.ExtrudeGeometry(deck,{depth:1.2,bevelEnabled:true,bevelThickness:.15,bevelSize:.15,bevelSegments:2,curveSegments:96});dg.rotateX(-HALF);dg.translate(0,-.6,0);
  {const uv=dg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*KIT_UV,uv.getY(i)*KIT_UV)}P.add(C,dg);
  P.add(C,new THREE.TorusGeometry(DECK_R+2.75,.62,12,128),{r:[HALF,0,0]});                       // hrubý vonkajší val
  P.add(D,new THREE.TorusGeometry(DECK_R+2.75,.66,4,128),{p:[0,-.05,0],r:[HALF,0,0],s:[1,1,.35]}); // tmavá drážka uprostred valu
  P.add(C,new THREE.TorusGeometry(DECK_R-2.62,.34,10,128),{p:[0,.32,0],r:[HALF,0,0]});
  P.add(G,new THREE.TorusGeometry(DECK_R-2.95,.06,4,128),{p:[0,.38,0],r:[HALF,0,0]});
  P.add(G,new THREE.TorusGeometry(DECK_R+1.85,.05,4,128),{p:[0,.78,0],r:[HALF,0,0]});
  P.add(B,new THREE.CylinderGeometry(DECK_R-2.72,DECK_R-2.72,1.8,96,1,true),{p:[0,-.6,0]});
  // okná na vonkajšom vale: 32 modrých pásov a medzi nimi jantárové svetielka
  for(let i=0;i<32;i++){const a=(i+.5)/32*TAU,r=DECK_R+3.38;P.add(G,box(1.5,.12,.08),{p:[Math.cos(a)*r,0,Math.sin(a)*r],r:[0,-a+HALF,0]});
    const b=i/32*TAU;P.add(A,box(.18,.18,.08),{p:[Math.cos(b)*r,0,Math.sin(b)*r],r:[0,-b+HALF,0]})}
  // panely paluby: radiálne švy a prstence
  for(let i=0;i<48;i++){const a=i/48*TAU;P.add(D,box(4.6,.05,.07),{p:[Math.cos(a)*DECK_R,.77,Math.sin(a)*DECK_R],r:[0,-a,0]})}
  P.add(D,ringGeo(DECK_R-.06,DECK_R+.06,96),{p:[0,.78,0]});
  // drobné nadstavby na palube (mimo miest pre moduly)
  const RR=rng(11);for(let i=0;i<70;i++){const a=RR()*TAU;let near=false;for(let k=0;k<6;k++){const sa=k/6*TAU+Math.PI/6;if(Math.abs(Math.atan2(Math.sin(a-sa),Math.cos(a-sa)))<.3)near=true}if(near)continue;
    const r=DECK_R-1.8+RR()*3.6;P.add(RR()<.7?D:C,box(.2+RR()*.8,.12+RR()*.4,.2+RR()*.8),{p:[Math.cos(a)*r,.8,Math.sin(a)*r],r:[0,-a,0]})}
  // spodok: podpery a krátka veža (zhora sa ukáže len okrajom)
  const spire=(h0,h1,w)=>kitLoft([{z:h0,w,h:w},{z:h0+(h1-h0)*.25,w:w*1.15,h:w*1.15},{z:h0+(h1-h0)*.7,w:w*.6,h:w*.6},{z:h1,w:.05,h:.05}],{n:8,p:1.5});
  P.add(D,spire(1.6,16,4.5),{r:[HALF,0,0]});
  for(let i=0;i<8;i++){const a=i/8*TAU+Math.PI/8,x=Math.cos(a),z=Math.sin(a);P.add(D,box(DECK_R*.75,.35,.35),{p:[x*DECK_R*.6,-2.4,z*DECK_R*.6],r:[0,-a,-.28]})}
  P.done(S3);
  // 4 ramená do kríža (medzi miestami pre moduly): chrómový nosník so svetelnými oknami, švami, zábradlím,
  // pri prstenci 2 bronzové kupoly a na konci valcový modul so svetlom
  {const r0=DECK_R+2.9,r1=DECK_R+11,L=r1-r0,Q=kitParts(),arm=new THREE.Group();
    Q.add(C,box(L,.9,2.5),{p:[r0+L/2,-.05,0]});
    Q.add(D,box(L-.4,.32,1.1),{p:[r0+L/2,.5,0]});Q.add(C,box(L-.6,.18,.7),{p:[r0+L/2+.1,.72,0]});
    for(const s of[-1,1]){Q.add(C,new THREE.CylinderGeometry(.16,.16,L,10),{p:[r0+L/2,.42,1.22*s],r:[0,0,HALF]});
      for(let k=0;k<7;k++)Q.add(G,box(L/8,.1,.06),{p:[r0+L*(k+.75)/8,0,1.27*s]});
      Q.add(B,new THREE.SphereGeometry(.95,20,12,0,TAU,0,HALF),{p:[r0+.9,.3,2.15*s]});Q.add(C,new THREE.CylinderGeometry(1.05,1.15,.35,20),{p:[r0+.9,.18,2.15*s]});
      Q.add(G,new THREE.TorusGeometry(.95,.04,4,24),{p:[r0+.9,.36,2.15*s],r:[HALF,0,0]})}
    for(let k=1;k<9;k++)Q.add(D,box(.08,.06,2.52),{p:[r0+L*k/9,.42,0]});
    Q.add(C,new THREE.CylinderGeometry(1.15,1.15,2.2,20),{p:[r1+.6,0,0],r:[0,0,HALF]});
    Q.add(D,new THREE.CylinderGeometry(1.2,1.2,.3,20),{p:[r1+.1,0,0],r:[0,0,HALF]});
    Q.add(B,new THREE.SphereGeometry(1.15,20,12,0,TAU,0,HALF),{p:[r1+1.7,0,0],r:[0,0,-HALF]});
    Q.add(G,new THREE.TorusGeometry(1.17,.05,4,28),{p:[r1+1.0,0,0],r:[0,HALF,0]});
    Q.add(D,box(L,.5,1.2),{p:[r0+L/2,-.75,0]});                                            // spodný nosník
    Q.done(arm);
    for(let k=0;k<4;k++){const g2=k?arm.clone():arm;g2.rotation.y=-(k*HALF+Math.PI/4);S3.add(g2);
      const tip=glow('#ffc46a',2.6,.9),ang=k*HALF+Math.PI/4;tip.position.set(Math.cos(ang)*(r1+2.4),.1,Math.sin(ang)*(r1+2.4));S3.add(tip);anim.blink.push({o:tip,f:.9+k*.13,base:2.6})}}
  if(s.core>=2){const r2=new THREE.Group();r2.position.y=-.95;S3.add(r2);anim.rings.push({o:r2,s:-.2});const Q=kitParts();   // otáčavý prstenec v kanáli
    Q.add(C,new THREE.TorusGeometry(9.75,.2,8,96),{r:[HALF,0,0]});
    for(let i=0;i<24;i++){const a=i/24*TAU;Q.add(i%2?G:A,box(.32,.16,.14),{p:[Math.cos(a)*9.75,.18,Math.sin(a)*9.75],r:[0,-a+HALF,0]})}
    Q.done(r2)}
  if(s.core>=3){const Q=kitParts();for(let k=0;k<4;k++){const a=k*HALF+Math.PI/4,r=DECK_R+4.2;   // antény pri koreni ramien
      Q.add(C,new THREE.CylinderGeometry(.12,.22,5.5,8),{p:[Math.cos(a)*r,3.4,Math.sin(a)*r]});Q.add(C,new THREE.SphereGeometry(.3,10,6),{p:[Math.cos(a)*r,6.2,Math.sin(a)*r]})}
    Q.done(S3);const b=glow('#ff6a4d',2.4,1);b.position.set(Math.cos(Math.PI/4)*(DECK_R+4.2),6.4,Math.sin(Math.PI/4)*(DECK_R+4.2));S3.add(b);anim.blink.push({o:b,f:1.3,base:2.4})}
  if(s.core>=4){const gy=new THREE.Group();gy.rotation.x=.38;S3.add(gy);const sp=new THREE.Group();gy.add(sp);anim.rings.push({o:sp,s:.07});const Q=kitParts();
    Q.add(K.dark,new THREE.TorusGeometry(DECK_R+7,.45,6,96),{r:[HALF,0,0]});Q.add(K.glow,new THREE.TorusGeometry(DECK_R+7,.08,4,96),{p:[0,.45,0],r:[HALF,0,0]});
    for(let i=0;i<16;i++){const a=i/16*TAU;Q.add(K.hull,box(1.8,.9,1.1),{p:[Math.cos(a)*(DECK_R+7),0,Math.sin(a)*(DECK_R+7)],r:[0,-a,0]})}
    Q.done(sp)}
  if(s.core>=5){const halo=new THREE.Mesh(new THREE.TorusGeometry(DECK_R+14.5,.12,6,160),M.hullGlow);halo.rotation.x=HALF;halo.position.y=-1;S3.add(halo)}
  const bc=stationBroken()?'#ff3a2a':s.captured?'#ffd27a':'#58d0c0';
  const beacon=glow(bc,s.captured?11:8,.85);beacon.position.y=5;S3.add(beacon);anim.blink.push({o:beacon,f:stationBroken()?1.8:.6,base:s.captured?11:8});
  const aura=glow(bc,40,.1);aura.position.y=-1;S3.add(aura);
  const n=slotsFor(s.core);
  for(let i=0;i<n;i++){const p=slotPos(i);const pad=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.4,.35,6),M.pad);pad.position.copy(p).setY(DECK_TOP);g.add(pad);
    const m=s.slots[i];const mp=p.clone().setY(DECK_TOP+.85);
    if(!m){const e=glow('#58d0c0',3.4,.35);e.position.copy(p).setY(DECK_TOP+.55);g.add(e);anim.blink.push({o:e,f:.4,base:3.4,soft:1})}
    else{g.add(makeModule(m.t,mp,anim,i));
      // žiara pod modulom vo farbe jeho rarity (stúpa s vylepšením +0..+10)
      const R=modRar(m),c=RAR[R].col;const rg=glow(c,4.5+R*.5,.18+R*.04);rg.position.copy(p).setY(DECK_TOP+.35);g.add(rg);anim.blink.push({o:rg,f:.3,base:4.5+R*.5,soft:1});
      if(R>=6){const ring=new THREE.Mesh(new THREE.RingGeometry(2.4,2.65,36),new THREE.MeshBasicMaterial({color:new THREE.Color(c),transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
        ring.rotation.x=-HALF;ring.position.copy(p).setY(DECK_TOP+.25);g.add(ring)}}}
  glbApply('station',S3);   // v0.40: vlastný model stanice (jadro, svetlá a moduly ostávajú)
  if(stationBroken())breakStation(S3,anim);   // v0.41: vyradená stanica
  const proxy=new THREE.Mesh(new THREE.SphereGeometry((DECK_R+4)*ST_SCALE,10,8),M.pick);proxy.userData.station=true;g.add(proxy);
  pickables=pickables.filter(p=>!p.userData.station);pickables.push(proxy);
  world.add(g);
  syncDrones();
}
function makeModule(type,p,anim,idx){const g=new THREE.Group();g.position.copy(p);g.lookAt(0,p.y,0);
  if(type==='drone'){const T=dockModel();glbApply('module.dock',T);g.add(T);
    {const dm=droneModel();dm.position.set(0,1.9,.15);dm.scale.multiplyScalar(.85);g.add(dm)}   // zaparkovaný ťažobný dron na streche
    const l=glow('#ffc46a',3.2,.55);l.position.set(0,.15,-1.75);g.add(l);const b=glow('#62f4ff',1.2,.9);b.position.set(1.25,2.55,1.0);g.add(b);anim.blink.push({o:b,f:1.1,base:1.2})}
  else if(type==='tower'){const T=towerModel();glbApply('module.tower',T.g,T.pg);glbApply('module.towerGun',T.pg);g.add(T.g);anim.turrets.push(Object.assign(T,{i:idx,yaw:0,pitch:.3,ty:(Math.random()-.5)*3,tp:.3,wait:Math.random()*3,kick:0}))}
  else if(type==='sensor'){const T=sensorModel();glbApply('module.sensor',T.g);g.add(T.g);anim.blink.push({o:T.bl,f:2.1,base:1.6});anim.dishes.push({o:T.dg})}
  return g}

/* ==================== v0.32: OBRANNÁ VEŽA (podľa predlohy) ====================
   Podstavec so 4 roztiahnutými nohami s pásovými chodidlami, otočná plošina (yaw) s bočnými ložiskami
   a dlhé delo (pitch): zväzok hlavní s modrými svietiacimi cievkami, zadný blok s energetickými valcami
   a tyrkysové ústie. Delo mieri +z. towerModel() vracia {g, o = otočná časť, pg = náklon, bar = hlavne, muz = ústie}. */
function towerModel(){const K=stationMats(),C=K.chrome,D=K.dark,BL=tMat(K,'tBlue','#2f8bff',1.6),CY=tMat(K,'tCyan','#62f4ff',2.2);
  const g=new THREE.Group(),P=kitParts();
  // podstavec: náboj + 4 nohy s kolenom a pásovým chodidlom
  P.add(D,new THREE.CylinderGeometry(.85,1.0,.55,16),{p:[0,.05,0]});P.add(C,new THREE.CylinderGeometry(1.05,1.05,.18,20),{p:[0,.38,0]});
  P.add(BL,new THREE.TorusGeometry(1.06,.035,4,28),{p:[0,.3,0],r:[HALF,0,0]});
  for(let k=0;k<4;k++){const a=k*HALF+Math.PI/4,c=Math.cos(a),s=Math.sin(a),rot=[0,-a,0];
    const at=(r,y)=>[c*r,y,s*r];
    P.add(C,box(1.25,.26,.34),{p:at(1.25,-.02),r:[0,-a,-.32]});P.add(BL,box(.8,.05,.06),{p:at(1.25,.12),r:[0,-a,-.32]});
    P.add(D,new THREE.CylinderGeometry(.2,.2,.46,12),{p:at(1.88,-.28),r:[HALF,-a,0]});
    P.add(C,box(.5,.5,.3),{p:at(2.0,-.42),r:rot});
    P.add(D,box(.42,.22,1.05),{p:at(2.2,-.62),r:rot});                                           // pás
    for(const z of[-.38,0,.38])P.add(C,new THREE.CylinderGeometry(.1,.1,.46,8),{p:[c*2.2-s*z,-.62,s*2.2+c*z],r:[0,-a,HALF]})}
  P.done(g);
  // otočná plošina
  const o=new THREE.Group();o.position.y=.5;g.add(o);const Q=kitParts();
  Q.add(C,new THREE.CylinderGeometry(.95,1.05,.3,20),{p:[0,0,0]});Q.add(D,box(1.3,.35,1.5),{p:[0,.3,-.1]});
  for(const sd of[-1,1]){Q.add(C,box(.24,1.0,1.15),{p:[.78*sd,.62,0]});Q.add(D,new THREE.CylinderGeometry(.34,.34,.3,18),{p:[.95*sd,.85,0],r:[0,0,HALF]});
    Q.add(BL,new THREE.TorusGeometry(.24,.05,6,18),{p:[1.1*sd,.85,0],r:[0,HALF,0]});Q.add(D,box(.18,.5,.5),{p:[.95*sd,.25,.6]})}
  Q.done(o);
  // delo (náklon okolo osi x v ložiskách)
  const pg=new THREE.Group();pg.position.y=.85;o.add(pg);const R=kitParts();
  R.add(C,box(1.15,.72,1.7),{p:[0,0,.05]});R.add(D,box(1.25,.2,1.4),{p:[0,.42,.05]});
  R.add(D,box(1.05,.85,1.0),{p:[0,-.02,-1.2]});R.add(C,box(1.12,.3,1.05),{p:[0,.38,-1.2]});
  for(const sd of[-1,1]){R.add(C,new THREE.CylinderGeometry(.22,.22,1.0,14),{p:[.42*sd,-.3,-1.25],r:[HALF,0,0]});R.add(BL,new THREE.CylinderGeometry(.13,.13,.6,12),{p:[.42*sd,-.3,-1.6],r:[HALF,0,0]});
    R.add(BL,box(.05,.08,.85),{p:[.56*sd,.05,-1.2]});R.add(C,box(.1,.5,.9),{p:[.6*sd,0,.4]})}
  R.add(C,box(.4,.25,.35),{p:[0,.55,-.6]});
  R.done(pg);
  // hlavne (pri výstrele cúvnu): 2 horné koľajnice, spodná hrubá hlaveň, modré jadro s cievkami, ústie
  const bar=new THREE.Group();pg.add(bar);const H=kitParts(),L=3.7,zc=.85+L/2;
  for(const sd of[-1,1])H.add(C,new THREE.CylinderGeometry(.1,.1,L,10),{p:[.24*sd,.24,zc],r:[HALF,0,0]});
  H.add(C,new THREE.CylinderGeometry(.17,.17,L*.94,12),{p:[0,-.2,zc-.1],r:[HALF,0,0]});H.add(D,new THREE.CylinderGeometry(.2,.2,.5,12),{p:[0,-.2,zc+L*.38],r:[HALF,0,0]});
  // modré energetické jadro medzi hlavňami, ovinuté tmavými cievkami (svetlo presvitá medzi závitmi)
  H.add(BL,new THREE.CylinderGeometry(.16,.16,L*.8,12),{p:[0,.04,zc-.15],r:[HALF,0,0]});
  for(let k=0;k<16;k++)H.add(D,new THREE.TorusGeometry(.17,.035,5,14),{p:[0,.04,1.05+k*.19]});
  for(const sd of[-1,1])H.add(BL,box(.04,.04,L*.75),{p:[.36*sd,-.02,zc-.2]});
  for(let k=0;k<3;k++)H.add(C,box(.7,.5,.12),{p:[0,.04,1.0+k*1.2]});                     // objímky zväzku hlavní
  H.add(C,new THREE.CylinderGeometry(.34,.3,.55,16),{p:[0,.04,.85+L+.15],r:[HALF,0,0]});H.add(D,new THREE.CylinderGeometry(.36,.36,.12,16),{p:[0,.04,.85+L-.08],r:[HALF,0,0]});
  H.add(CY,new THREE.TorusGeometry(.27,.06,6,18),{p:[0,.04,.85+L+.44]});H.add(CY,new THREE.CircleGeometry(.2,16),{p:[0,.04,.85+L+.43]});
  H.done(bar);
  const muz=glow('#62f4ff',1.5,.8);muz.position.set(0,.04,.85+L+.55);bar.add(muz);
  g.scale.setScalar(.85);return{g,o,pg,bar,muz}}
/* v0.32: DOK DRONOV v štýle novej stanice – chrómový hangár s oblou rebrovanou strechou, osvetlenou bránou
   (vonkajšia strana, −z), pristávacou plochou na streche, bronzovými nádržami po stranách a anténou. */
function dockModel(){const K=stationMats(),C=K.chrome,D=K.dark,B=K.bronze,A=K.amber,CY=tMat(K,'tCyan','#62f4ff',2.2),BL=tMat(K,'tBlue','#2f8bff',1.6),BAY=tMat(K,'bay','#ff9a3a',.8);
  const g=new THREE.Group(),P=kitParts();
  P.add(D,box(3.7,.34,3.1),{p:[0,-.45,0]});P.add(C,box(3.8,.1,3.2),{p:[0,-.25,0]});
  P.add(C,box(2.8,.95,2.5),{p:[0,.25,0]});P.add(C,box(2.84,.06,2.54),{p:[0,.73,0]});
  const roof=new THREE.CylinderGeometry(1.42,1.42,2.5,28,1,true,HALF,Math.PI);P.add(C,roof,{p:[0,.72,0],r:[HALF,0,0],s:[1,1,.55]});
  for(let k=0;k<6;k++)P.add(D,new THREE.TorusGeometry(1.44,.045,4,24,Math.PI),{p:[0,.72,-1.1+k*.44],s:[1,.55,1]});
  for(const sd of[-1,1]){P.add(BL,box(.04,.1,1.9),{p:[1.41*sd,.45,0]});P.add(D,box(.06,.5,2.2),{p:[1.42*sd,.05,0]});
    P.add(B,new THREE.CylinderGeometry(.32,.32,1.9,16),{p:[1.75*sd,-.02,0],r:[HALF,0,0]});
    for(const z of[-.95,.95])P.add(B,new THREE.SphereGeometry(.32,14,8),{p:[1.75*sd,-.02,z]});
    P.add(C,box(.5,.1,.14),{p:[1.6*sd,-.02,-.5]});P.add(C,box(.5,.1,.14),{p:[1.6*sd,-.02,.5]})}
  // brána hangáru (vonkajšia strana): rám, svietiace vnútro, výstražné pruhy
  P.add(D,box(2.3,1.25,.16),{p:[0,.3,-1.27]});P.add(BAY,box(1.9,.95,.04),{p:[0,.32,-1.33]});for(let k=0;k<4;k++)P.add(D,box(1.9,.04,.05),{p:[0,-.05+k*.24,-1.36]});
  for(let k=0;k<6;k++)P.add(k%2?D:A,box(.32,.1,.05),{p:[-.8+k*.32,-.25,-1.36]});
  // pristávacia plocha na streche so svetlami
  P.add(D,new THREE.CylinderGeometry(.95,1.0,.12,24),{p:[0,1.5,.15]});P.add(CY,new THREE.TorusGeometry(.9,.035,4,32),{p:[0,1.57,.15],r:[HALF,0,0]});
  for(let k=0;k<4;k++){const a=k*HALF+Math.PI/4;P.add(CY,box(.1,.06,.1),{p:[Math.cos(a)*.7,1.58,.15+Math.sin(a)*.7]})}
  // anténa v zadnom rohu
  P.add(C,new THREE.CylinderGeometry(.04,.07,1.3,6),{p:[1.25,1.85,1.0]});P.add(C,new THREE.SphereGeometry(.09,8,6),{p:[1.25,2.5,1.0]});
  P.done(g);return g}
/* v0.32: SENZOROVÉ POLE v štýle stanice – technický podstavec s bronzovými skriňami a anténkami, chrómový stĺp
   s prstencami a otočná hlava: veľká parabola (vnútri svetlá, zvonka tmavé panely) s trojnožkou a fialovým snímačom. */
function sensorModel(){const K=stationMats(),C=K.chrome,D=K.dark,B=K.bronze,A=K.amber,V=tMat(K,'sViolet','#a98bff',2.0),BL=tMat(K,'tBlue','#2f8bff',1.6);
  const g=new THREE.Group(),P=kitParts();
  P.add(D,new THREE.CylinderGeometry(1.7,1.85,.36,8),{p:[0,-.45,0]});P.add(C,new THREE.CylinderGeometry(1.75,1.75,.1,8),{p:[0,-.24,0]});
  P.add(C,new THREE.CylinderGeometry(.9,1.15,.7,16),{p:[0,.1,0]});P.add(BL,new THREE.TorusGeometry(1.0,.035,4,28),{p:[0,.22,0],r:[HALF,0,0]});
  for(let k=0;k<4;k++){const a=k*HALF+Math.PI/4,c=Math.cos(a),s=Math.sin(a);P.add(B,box(.55,.5,.7),{p:[c*1.3,-.05,s*1.3],r:[0,-a,0]});P.add(A,box(.06,.08,.4),{p:[c*1.58,0,s*1.58],r:[0,-a,0]});
    P.add(C,new THREE.CylinderGeometry(.03,.03,.9,5),{p:[c*1.45+s*.3,.6,s*1.45-c*.3]});P.add(C,box(.22,.3,.03),{p:[c*1.45+s*.3,.95,s*1.45-c*.3],r:[0,-a,0]})}
  P.add(C,new THREE.CylinderGeometry(.2,.28,1.9,12),{p:[0,1.25,0]});for(const y of[.75,1.35,1.9])P.add(D,new THREE.CylinderGeometry(.32,.32,.1,12),{p:[0,y,0]});
  P.add(V,new THREE.CylinderGeometry(.06,.06,1.5,6),{p:[.24,1.25,0]});
  P.done(g);
  const dg=new THREE.Group();dg.position.y=2.2;g.add(dg);const Q=kitParts();
  Q.add(D,new THREE.CylinderGeometry(.42,.48,.4,14),{p:[0,0,0]});Q.add(C,box(.5,.5,.5),{p:[0,.2,-.25],r:[.6,0,0]});
  Q.done(dg);
  // parabola: rotačný profil y = k·r² (otvorená hore), naklonená dopredu; vnútro chróm, zvonka tmavé panely, trojnožka k ohnisku
  const dsh=new THREE.Group();dsh.position.set(0,.45,.1);dsh.rotation.x=.75;dg.add(dsh);const W=kitParts(),kk=.24,RD=1.6,f=1/(4*kk);
  const prof=[];for(let i=0;i<=12;i++){const r=.12+RD*i/12;prof.push(new THREE.Vector2(r,kk*r*r))}
  const bowl=new THREE.LatheGeometry(prof,40);uvScale(bowl,6,2);
  W.add(K.chromeDS||(K.chromeDS=Object.assign(C.clone(),{side:THREE.DoubleSide})),bowl);W.add(K.darkDS||(K.darkDS=Object.assign(D.clone(),{side:THREE.DoubleSide})),bowl,{p:[0,-.06,0]});
  W.add(C,new THREE.TorusGeometry(RD+.12,.045,5,48),{p:[0,kk*(RD+.12)*(RD+.12),0],r:[HALF,0,0]});
  for(let k=0;k<8;k++){const a=k/8*TAU;W.add(D,box(.04,.03,RD),{p:[Math.cos(a)*RD*.55,kk*RD*RD*.3+.02,Math.sin(a)*RD*.55],r:[0,-a+HALF,0]})}
  for(let k=0;k<3;k++){const a=k/3*TAU,x=Math.cos(a)*RD*.92,z=Math.sin(a)*RD*.92,y=kk*RD*RD*.85;const m=new V3(x/2,(y+f)/2,z/2),d=new V3(-x,f-y,-z),L=d.length();
    const q=new THREE.Quaternion().setFromUnitVectors(new V3(0,1,0),d.normalize()),e=new THREE.Euler().setFromQuaternion(q);W.add(D,new THREE.CylinderGeometry(.025,.025,L,5),{p:[m.x,m.y,m.z],r:[e.x,e.y,e.z]})}
  W.add(D,new THREE.CylinderGeometry(.09,.13,.28,10),{p:[0,f,0]});W.add(V,new THREE.SphereGeometry(.09,10,6),{p:[0,f-.17,0]});
  W.done(dsh);const bl=glow('#a98bff',1.6,1);bl.position.set(0,f-.2,0);dsh.add(bl);
  return{g,dg,bl}}
/* pomocník: svietiaci materiál uložený v sade materiálov stanice (vytvorí sa raz) */
function tMat(K,k,c,i){return K[k]||(K[k]=kitGlowMat(c,i))}
/* Natáčanie veží: s cieľom (nastaví ho towersFire) rýchlo mieria na piráta, bez cieľa „standby“ –
   chvíľu stoja, potom sa pomaly otočia a nakloňia na náhodnú stranu, akoby prehľadávali okolie. */
const towerTgt={},_tv=new V3();
const angTo=(a,b,m)=>{let d=Math.atan2(Math.sin(b-a),Math.cos(b-a));return a+Math.max(-m,Math.min(m,d))};
function tickTurrets(dt){if(!stationAnim)return;for(const tu of stationAnim.turrets){const e=towerTgt[tu.i];let fast=false;
    if(e&&enemies.includes(e)){tu.o.parent.worldToLocal(_tv.copy(e.pos));tu.ty=Math.atan2(_tv.x,_tv.z);tu.tp=clamp(Math.atan2(_tv.y-1.3,Math.hypot(_tv.x,_tv.z)),-.1,1.25);fast=true;tu.wait=1.5+Math.random()*2}
    else{tu.wait-=dt;if(tu.wait<=0){tu.ty=(Math.random()-.5)*4.6;tu.tp=.08+Math.random()*.55;tu.wait=2.2+Math.random()*4.5}}
    const sp=fast?3.2:.55;tu.yaw=angTo(tu.yaw,tu.ty,sp*dt);tu.pitch+=clamp(tu.tp-tu.pitch,-sp*.7*dt,sp*.7*dt);
    tu.o.rotation.y=tu.yaw;tu.pg.rotation.x=-tu.pitch;
    tu.kick=Math.max(0,tu.kick-dt*3.5);tu.bar.position.z=-tu.kick*.45;tu.muz.scale.setScalar(1.5+tu.kick*4);
    // v0.34: tenký červený laserový zameriavač od ústia k zameranému pirátovi
    if(fast){if(!tu.aimB){tu.aimB=makeBeam('#ff2a2a');tu.aimB.userData.core.material.color.set('#ff4a3a')}tu.muz.getWorldPosition(_tm);setBeam(tu.aimB,_tm,e.pos,.05,'#ff2a2a');tu.aimB.userData.core.material.opacity=.55;tu.aimB.userData.outer.material.opacity=.35;tu.aimB.userData.hit.scale.setScalar(1.6)}
    else if(tu.aimB)hideBeam(tu.aimB)}}
const _tm=new V3();
/* zameriavače veží sú v scéne (mimo stanice) – pri prestavbe stanice / zmene sektora sa skryjú a uvoľnia */
function clearTurretBeams(){if(!stationAnim)return;for(const tu of stationAnim.turrets)if(tu.aimB){hideBeam(tu.aimB);scene.remove(tu.aimB);scene.remove(tu.aimB.userData.hit);tu.aimB=null}}
/* Skoková brána: v prvom sektore sa objaví až po jeho obsadení, v ďalších je vždy. Vzdialenosť 72 m od stanice, smer určuje seed sektora. */
function updateGate(){if(gate){world.remove(gate);pickables=pickables.filter(p=>!p.userData.gate);gate=null}
  const s=cur();if(!(s.captured||state.cur>0))return;
  const r=rng(SECTORS[state.cur].seed+5);const ang=r()*TAU;
  gate=new THREE.Group();gate.position.set(Math.cos(ang)*GATE_R,0,Math.sin(ang)*GATE_R);gate.lookAt(0,0,0);
  // v0.27: brána GATE_K× väčšia (prejdú ňou aj veľké lode); stred je o niečo nižšie, aby vrch neprekážal kamere
  const tilt=new THREE.Group();tilt.rotation.x=-1.1;tilt.position.y=-7;gate.add(tilt);   // naklonená dozadu: zhora vidno otvor brány
  const ringG=new THREE.Group();ringG.scale.setScalar(GATE_K);tilt.add(ringG);
  ringG.add(new THREE.Mesh(new THREE.TorusGeometry(5.2,.55,8,48),M.plate));
  ringG.add(new THREE.Mesh(new THREE.TorusGeometry(4.5,.14,6,48),M.hullGlow));
  for(let i=0;i<6;i++){const a=i/6*TAU;const n=new THREE.Mesh(new THREE.BoxGeometry(.9,1.4,1.4),M.metal);n.position.set(Math.cos(a)*5.4,Math.sin(a)*5.4,0);n.rotation.z=a;ringG.add(n)}
  glbApply('gate',gate);   // v0.40: vlastný model brány (svetelné jadro ostáva)
  const core=glow('#7ef2e2',9*GATE_K,.5);core.position.y=-7;gate.add(core);gate.userData.ring=ringG;gate.userData.core=core;
  const proxy=new THREE.Mesh(new THREE.SphereGeometry(7*GATE_K,8,6),M.pick);proxy.userData.gate=true;gate.add(proxy);pickables.push(proxy);
  world.add(gate);
  for(const a of asts)if(a.alive&&a.pos.distanceTo(gate.position)<12*GATE_K)placeAst(a,Math.random)}

/* ---------- Drony ----------
   Každý dok dronov má jedného drona. Jeho vlastnosti závisia od vylepšenia doku (+0..+10) a vloženého AI jadra (čipu):
   droneStats(m) vráti rate (t/s), cap (t), speed (m/s), dmg a range (obranný režim), res (surovina, ktorú ťaží) a def (či bráni).
   Bez čipu ťaží len rudu vo vnútorných pásoch. AI jadro od rarity Neobyčajné povolí viridit, od Vzácne obranu, od Epické kryštály. */
function droneStats(m){const F=MOD_FX.drone,e=m.enh||0;
  const can={ore:true,green:chipCan(m,'green'),crystal:chipCan(m,'crystal')};
  return{rate:F.rate*enhK(F.ratePer,e)*(1+chipStat(m,'dMine')/100),cap:F.cap+F.capPer*e*(1+.08*e)+chipStat(m,'dCap'),speed:F.speed*(1+F.speedPer*e)*(1+chipStat(m,'dSpeed')/100),
    dmg:F.dmg*enhK(F.dmgPer,e)*(1+chipStat(m,'dDmg')/100),range:F.range,res:can[m.res]?m.res:'ore',can,def:m.mode==='def'&&chipCan(m,'def')}}
function towerStats(m){const F=MOD_FX.tower,e=m.enh||0;return{dmg:F.dmg*enhK(F.dmgPer,e)*(1+chipStat(m,'tDmg')/100),rate:F.rate*(1+chipStat(m,'tRate')/100),range:F.range+F.rangePer*e+chipStat(m,'tRange')}}
const sensorIncome=m=>MOD_FX.sensor.green*enhK(MOD_FX.sensor.incPer,m.enh||0)*(1+chipStat(m,'sInc')/100);
const droneIncome=m=>MOD_FX.drone.income*enhK(MOD_FX.drone.ratePer,m.enh||0)*(1+chipStat(m,'dMine')/100);
const DRONE_GEO=new THREE.OctahedronGeometry(.55,0);
/* ==================== v0.19.5: MODEL ŤAŽOBNÉHO DRONA ====================
   Tmavý oceľový dron: zaoblený pancierový trup so šikmým nosom, vrstvené vrchné pláty s priduchmi, dva spodné „kly“ vpredu
   s červeným senzorom, dve veľké valcové turbíny po bokoch na mechanických vzperách (pancierové pláty, prstence,
   fialovo-modrá žiara dýz), zadné plutvy a malá veža pod trupom. Postaví sa raz (šablóna) a každý dron dostane kópiu. */
let _droneTpl=null;
function droneModel(){if(_droneTpl)return _droneTpl.clone();
  const K={hull:kitHullMat('drH',{base:'#5a6572',vari:.2,line:'#1c2026',lit:['#8f8cff'],litP:.04,seed:61},{metalness:.75,roughness:.35,emissiveIntensity:1.6,flatShading:true}),
    dark:kitHullMat('drD',{base:'#22272e',vari:.25,line:'#0c0e11',lit:['#7a6bff'],litP:.06,seed:62},{metalness:.8,roughness:.4,emissiveIntensity:1.8,flatShading:true}),
    glow:kitGlowMat('#7d6bff',1.7),red:kitGlowMat('#ff3030',3),
    shell:new THREE.MeshStandardMaterial({color:new THREE.Color('#15181d'),metalness:.85,roughness:.35,side:THREE.DoubleSide,flatShading:true}),
    metal:new THREE.MeshStandardMaterial({color:new THREE.Color('#8a96a6'),metalness:.9,roughness:.3,flatShading:true})};
  const P=kitParts(),g=new THREE.Group(),H=Math.PI/2,bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
  // trup + vrchný pancier (dve vrstvy) so stredovým hrebeňom
  P.add(K.dark,kitLoft([{z:-1.6,w:.55,h:.38,hb:.34},{z:-.6,w:.72,h:.52,hb:.4},{z:.8,w:.66,h:.48,hb:.38},{z:1.6,w:.5,h:.3,hb:.3,y:-.08},{z:2.05,w:.28,h:.12,hb:.12,y:-.2}],{n:10,p:3.2}));
  P.add(K.hull,kitLoft([{z:-1.5,w:.5,h:.5,hb:.02},{z:-.4,w:.64,h:.66,hb:.02},{z:.9,w:.56,h:.58,hb:.02},{z:1.7,w:.36,h:.34,hb:.02,y:-.06},{z:2.05,w:.18,h:.12,y:-.16}],{n:10,p:2.6}));
  P.add(K.hull,kitLoft([{z:-1.2,w:.2,h:.75,hb:.02},{z:.3,w:.24,h:.8,hb:.02},{z:1.4,w:.14,h:.5,hb:.02,y:-.04}],{n:8,p:2.2}));
  for(const s of[-1,1])P.add(K.dark,kitSlab([[.22*s,1.5],[.6*s,.9],[.62*s,-.9],[.3*s,-1.3]],.05,{y:.6,bev:.02}));
  // priduchy a poklop na chrbte
  for(let i=0;i<3;i++){P.add(K.shell,bx(.07,.06,.55),{p:[-.12+i*.12,.86,-.15]});P.add(K.glow,bx(.03,.02,.45),{p:[-.12+i*.12,.89,-.15]})}
  P.add(K.dark,new THREE.CylinderGeometry(.2,.24,.06,6),{p:[0,.83,-.95]});
  for(const s of[-1,1])P.add(K.metal,bx(.09,.03,.14),{p:[.12*s,.81,.75]});
  // nos: zvislé rebrá, červený senzor, dva spodné kly
  for(const x of[-.16,-.05,.05,.16])P.add(K.shell,bx(.05,.32,.12),{p:[x,-.02,1.93],r:[.35,0,0]});
  P.add(K.red,bx(.12,.08,.04),{p:[0,-.24,2.0]});
  for(const s of[-1,1]){P.add(K.dark,kitSlab([[.32*s,.9],[.48*s,1.0],[.4*s,2.45],[.33*s,2.3]],.14,{y:-.36,bev:.03}));
    P.add(K.metal,new THREE.CylinderGeometry(.035,.035,.05,8),{p:[.42*s,-.29,2.1]})}
  // bočné okienka (rad malých otvorov)
  for(let i=0;i<5;i++)P.add(K.shell,bx(.02,.06,.09),{p:[.67,.0,.2+i*.16],m:true});
  // turbíny po bokoch: vzpery, valec s prstencami a plátmi, dýza vzadu s fialovou žiarou
  const PX=1.55,PZ=-.25;
  for(const s of[-1,1])for(const[y,z]of[[.18,.15],[-.12,-.55]]){P.add(K.metal,new THREE.CylinderGeometry(.06,.06,PX-.6,8),{p:[s*(PX+.6)/2,y,z],r:[0,0,H]});P.add(K.dark,bx(.22,.2,.22),{p:[s*.95,y,z]})}
  for(const s of[-1,1])P.add(K.shell,bx(.5,.28,.5),{p:[s*.9,.02,-.2]});
  P.add(K.dark,kitLoft([{z:PZ-1.15,w:.5,h:.5,x:PX},{z:PZ-.9,w:.6,h:.6,x:PX},{z:PZ+.5,w:.62,h:.62,x:PX},{z:PZ+.85,w:.5,h:.5,x:PX},{z:PZ+.95,w:.4,h:.4,x:PX}],{n:14,p:2.1}),{m:true});
  for(const z of[PZ-.85,PZ+.15,PZ+.55])P.add(K.metal,new THREE.TorusGeometry(.62,.045,5,22),{p:[PX,0,z],m:true});
  for(const a of[.6,1.6,2.6]){P.add(K.hull,bx(.32,.05,.75),{p:[PX+Math.cos(a)*.63,Math.sin(a)*.63,PZ-.2],r:[0,0,a-H],m:true})}
  P.add(K.glow,bx(.02,.12,.4),{p:[PX+.64,.15,PZ-.2],m:true});
  P.add(K.shell,new THREE.CylinderGeometry(.42,.5,.35,16,1,true),{p:[PX,0,PZ-1.32],r:[H,0,0],m:true});
  P.add(K.glow,new THREE.CircleGeometry(.4,16),{p:[PX,0,PZ-1.2],r:[0,Math.PI,0],m:true});
  P.add(K.dark,new THREE.CircleGeometry(.4,16),{p:[PX,0,PZ+.96],m:true});
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;P.add(K.shell,bx(.04,.3,.06),{p:[PX+Math.cos(a)*.2,Math.sin(a)*.2,PZ+.97],r:[0,0,a],m:true})}   // lopatky turbíny
  // zadné plutvy a veža pod trupom
  for(const s of[-1,1])P.add(K.dark,kitSlab([[0,-1.0],[.08,-1.15],[.55,-2.0],[.35,-2.0],[0,-1.6]],.05,{bev:.02}),{p:[.3*s,.35,0],r:[0,0,(H-.5)*s]});
  P.add(K.dark,bx(.3,.18,.35),{p:[0,-.5,.2]});P.add(K.metal,new THREE.CylinderGeometry(.03,.03,.6,6),{p:[0,-.52,.62],r:[H,0,0]});
  P.add(K.metal,new THREE.CylinderGeometry(.012,.012,.5,4),{p:[-.25,.95,-1.1],r:[-.3,0,0]});
  P.done(g);
  for(const s of[-1,1]){const l=glow('#8a74ff',1.6,.85);l.position.set(PX*s,0,PZ-1.45);g.add(l)}
  glbApply('drone',g);g.scale.setScalar(.45);_droneTpl=g;return g.clone()}
function syncDrones(){const s=cur();const docks=[];s.slots.forEach((m,i)=>{if(slotType(m)==='drone'&&i<slotsFor(s.core))docks.push(i)});
  while(drones.length<docks.length){const g=new THREE.Group();g.add(droneModel());   // v0.19.5: detailný model (droneModel)
    const e=glow('#f0a644',1.4,.9);e.position.set(0,.05,-1.05);g.add(e);
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V3(),new V3()]),new THREE.LineBasicMaterial({color:new THREE.Color('#f0a644'),transparent:true,opacity:.8,blending:THREE.AdditiveBlending}));
    line.visible=false;line.frustumCulled=false;world.add(line);
    const d={g,e,line,state:'seek',t:null,load:0,ltype:'ore',home:new V3(),wait:Math.random()*1.5,cd:0,slot:-1};g.position.copy(slotPos(docks[drones.length])).multiplyScalar(.92);world.add(g);drones.push(d)}
  while(drones.length>docks.length){const d=drones.pop();world.remove(d.g);world.remove(d.line);if(d.t)d.t.claims=Math.max(0,d.t.claims-1);if(d.load>0)state[d.ltype]+=d.load}
  drones.forEach((d,i)=>{d.slot=docks[i];d.home.copy(slotPos(docks[i])).multiplyScalar(.85).setY(1);d.e.material.color.set(RAR[modRar(s.slots[d.slot])].col)})}
/* Dron: seek (hľadá asteroid svojej suroviny) -> go (letí) -> mine (ťaží do plnej kapacity) -> back (vezie na stanicu).
   V obrannom režime počas nájazdu pirátov namiesto ťažby útočí (droneDefend v combat.js). Keď je stanica vyradená, drony stoja. */
function tickDrones(dt,tt){const s=cur();
  for(const d of drones){const p=d.g.position;const m=s.slots[d.slot];if(!m)continue;const st=droneStats(m);
    if(stationDown>0){d.line.visible=false;moveTo(d.g,d.home,st.speed,dt,.3);continue}
    if(st.def&&enemies.some(e=>!e.passive)&&droneDefend(d,st,dt)){d.line.visible=false;continue}
    if(d.wait>0){d.wait-=dt;continue}
    if(d.state==='seek'){let best=null,bd=1e9;for(const a of asts){if(!a.alive||a.amt<=0||(a.type!==st.res&&a.type!=='mix')||(st.res==='ore'&&a.type!=='mix'&&a.rmax>Z2))continue;const dd=p.distanceTo(a.pos)+a.claims*25;if(dd<bd){bd=dd;best=a}}
      if(best){d.t=best;best.claims++;d.state='go'}else{d.wait=1}}
    if(d.state==='go'){const a=d.t;if(!a.alive){a.claims=Math.max(0,a.claims-1);d.state='seek';continue}const stop=astScale(a)*1.1+2.4;const dist=moveTo(d.g,a.pos,st.speed,dt,stop);if(dist<=stop+.05)d.state='mine'}
    if(d.state==='mine'){const a=d.t;if(!a.alive||a.amt<=0){a.claims=Math.max(0,a.claims-1);d.line.visible=false;d.state=d.load>0?'back':'seek';continue}
      const take=Math.min(st.rate*MINE_RATE[a.type]*dt,a.amt,st.cap-d.load);a.amt-=take;d.load+=take;d.ltype=a.type==='mix'?st.res:a.type;setAstScale(a);
      if(a.amt<=0)depleteAst(a);
      const pos=d.line.geometry.attributes.position;pos.setXYZ(0,p.x,p.y,p.z);pos.setXYZ(1,a.pos.x,a.pos.y,a.pos.z);pos.needsUpdate=true;d.line.visible=true;
      d.line.material.color.set(RCOL[a.type]);d.line.material.opacity=.5+Math.random()*.4;
      if(d.load>=st.cap-.01){a.claims=Math.max(0,a.claims-1);d.line.visible=false;d.state='back'}}
    if(d.state==='back'){const dist=moveTo(d.g,d.home,st.speed,dt,.3);if(dist<=.4){state[d.ltype]+=d.load;bump('#'+RCLS[d.ltype]+'Txt');d.load=0;d.state='seek';d.wait=.8}}
    d.g.position.y+=Math.sin(tt*3+d.home.x)*.004}}

/* ---------- 3D náhľady modulov pre panel stanice ----------
   Malý samostatný renderer vykreslí modul (rovnaký model ako vo vesmíre) so žiarou vo farbe rarity a uloží obrázok do medzipamäte. */
const _thumbs={};let _thumbR=null;
function moduleThumb(type,r){const key=type+r;if(_thumbs[key]!==undefined)return _thumbs[key];
  try{if(!_thumbR){_thumbR=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});_thumbR.setPixelRatio(1);_thumbR.setSize(240,180,false);_thumbR.outputEncoding=THREE.sRGBEncoding;_thumbR.toneMapping=THREE.ACESFilmicToneMapping}
    const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(col('#9fb6dd'),col('#150b1c'),.9));const dl=new THREE.DirectionalLight(col('#ffe4bd'),2);dl.position.set(4,8,6);sc.add(dl);
    const an={rings:[],turrets:[],dishes:[],blink:[]};const g=makeModule(type,new V3(0,0,1),an,0);g.position.set(0,0,0);sc.add(g);
    for(const tu of an.turrets){tu.o.rotation.y=Math.PI-.75;tu.pg.rotation.x=-.32}for(const d of an.dishes)d.o.rotation.y=Math.PI-.5   // veža v náhľade mierne natočená a zdvihnutá
    // v0.32: kamera podľa veľkosti modelu (nové modely sú väčšie a detailnejšie)
    g.updateMatrixWorld(true);const bx=new THREE.Box3().setFromObject(g),c=bx.getCenter(new V3()),rr=bx.getSize(new V3()).length()*.5;
    const cam=new THREE.PerspectiveCamera(32,4/3,.1,200);cam.position.copy(c).add(new V3(.55,.48,.68).normalize().multiplyScalar(rr*2.35));cam.lookAt(c);
    const gl=glow(RAR[r].col,rr*(2.2+r*.12),.3+r*.04);gl.position.set(c.x,bx.min.y+.2,c.z);sc.add(gl);   // žiara rarity pod modulom
    _thumbR.render(sc,cam);_thumbs[key]=_thumbR.domElement.toDataURL('image/png')}catch(e){_thumbs[key]=''}
  return _thumbs[key]}
/* v0.22: náhľad 3D modelu „ako na výstave“: tmavé pozadie, bodové svetlo zhora, odraz/spot pod modelom, mierny uhol spredu.
   build() vráti Object3D; o = {w,h,dir:[x,y,z] smer kamery od modelu, spot:farba, fit:okraj}. Výsledok (dataURL) sa uloží. */
let _prevR=null;const _prevs={};
function modelPreview(key,build,o={}){if(_prevs[key]!==undefined)return _prevs[key];
  try{const W=o.w||420,H=o.h||250;if(!_prevR){_prevR=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});_prevR.setPixelRatio(1);_prevR.outputEncoding=THREE.sRGBEncoding;_prevR.toneMapping=THREE.ACESFilmicToneMapping;_prevR.toneMappingExposure=1.2}
    _prevR.setSize(W,H,false);const sc=new THREE.Scene();
    sc.add(new THREE.HemisphereLight(col('#9fb6dd'),col('#120a18'),.75));const key1=new THREE.DirectionalLight(col('#fff1dc'),2.3);key1.position.set(3,9,7);sc.add(key1);
    const rimL=new THREE.DirectionalLight(col('#5aa8ff'),1.1);rimL.position.set(-6,3,-8);sc.add(rimL);const fill=new THREE.DirectionalLight(col('#ffb070'),.35);fill.position.set(-7,-2,4);sc.add(fill);
    const m=build();sc.add(m);m.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(m),c=box.getCenter(new V3()),sz=box.getSize(new V3());const r=Math.max(sz.x,sz.y,sz.z)*.5;
    // spot / odraz pod modelom
    if(o.spot){const sp=glow(o.spot,r*3.6,.32);sp.position.set(c.x,box.min.y-r*.15,c.z);sc.add(sp);
    const fl=new THREE.Mesh(new THREE.CircleGeometry(r*1.7,48),new THREE.MeshBasicMaterial({color:new THREE.Color(o.spot||'#58d0c0'),transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false}));fl.rotation.x=-Math.PI/2;fl.position.set(c.x,box.min.y-r*.2,c.z);sc.add(fl)}   // spot pod modelom (len ak o.spot)
    const cam=new THREE.PerspectiveCamera(28,W/H,.01,1000);const d=new V3(...(o.dir||[.55,.32,1])).normalize();const dist=r/Math.sin(14*Math.PI/180)*(o.fit||.82);
    cam.position.copy(c).addScaledVector(d,dist);cam.lookAt(c.x,c.y-r*.08,c.z);_prevR.render(sc,cam);_prevs[key]=_prevR.domElement.toDataURL('image/png')}catch(e){_prevs[key]=''}
  return _prevs[key]}
const _v=new V3();
function moveTo(obj,target,speed,dt,stop){_v.subVectors(target,obj.position);_v.y=0;const dist=_v.length();
  if(dist>stop){const step=Math.min(speed*dt,dist-stop);_v.normalize();obj.position.addScaledVector(_v,step);obj.rotation.y=Math.atan2(_v.x,_v.z)}
  obj.position.y+=(target.y-obj.position.y)*Math.min(1,dt*2);return Math.max(stop,dist-speed*dt)}
/* byPlayer = vyťažila ho loď hráča (nie dron): vtedy môže padnúť korisť. Relikt vždy, bežný asteroid so šancou ASTEROID_DROP. */
function depleteAst(a,byPlayer){a.alive=false;a.respawn=a.type==='relic'?rnd(RELIC_RESPAWN[0],RELIC_RESPAWN[1]):25+Math.random()*15;
  if(byPlayer){const z=Math.min(5,zoneOf(Math.hypot(a.pos.x,a.pos.z)));if(a.type==='relic')xpAt(XP.relic*(1+z*.25));
    // relikt z misie: lepšia korisť podľa stupňa misie, už sa neobjaví a misia sa splní
    if(a.mission){a.respawn=1e9;const m=mstate().active.find(x=>x.id===a.mission);giveItem(dropItem('relic',z,m?MTIER[m.tier].minR:2),a.pos);missionRelic(a)}
    else if(a.type==='relic')giveItem(dropItem('relic',z,2),a.pos);else if(Math.random()<ASTEROID_DROP)spawnLoot(dropItem('asteroid',z),a.pos)}
  if(mineTarget===a){if(!autoNext(a))stopMining()}}
/* optional auto-mining: move on to the nearest asteroid of the same resource while cargo has room */
function autoNext(a){if(typeof huntAfterMine==='function'&&huntAfterMine(a))return true;   // v0.40.1: pirát v dosahu → najprv lov
  if(a.type==='relic'||state.autoMine===false||cargoTotal()>=shipVal('cargo')-.01)return false;let best=null,bd=40*MAP_SCALE;
  for(const o of asts){if(o===a||!o.alive||o.type!==a.type||Math.hypot(o.pos.x,o.pos.z)>=HORIZON)continue;const d=ship.position.distanceTo(o.pos);if(d<bd){bd=d;best=o}}
  if(!best)return false;mineTarget=best;moveTarget=best.pos.clone().setY(0);flashMarker(best.pos,'#58d0c0');return true}
function stopMining(){mineTarget=null;moveTarget=null}

/* ---------- Korisť vo vesmíre ----------
   Predmet, ktorý padol, sa vznáša na mieste so svetelným stĺpom vo farbe rarity (vyššia rarita = vyšší a jasnejší stĺp,
   od Legendárnej krúžok na zemi). Keď je loď bližšie ako 8 m + bonus Dosah zberu, korisť sa pritiahne a uloží do inventára. */
let loot=[],invWarned=false;
const LOOT_GEO=new THREE.OctahedronGeometry(.7,0);
/* ==================== v0.24: KOZMICKÁ KOCKA (korisť a anomália) ====================
   Predmet vo vesmíre je otáčajúca sa kocka, na ktorej stenách je „vesmír“: špirálová galaxia s jasným jadrom,
   hmlovina vo farbe rarity, hviezdy; hrany svietia bielo, okolo je žiara. Každý predmet má iný vzor (seed) a jednu
   z variantov: 0 = samotná kocka, 1 = vnútri menšia drôtená kocka točiaca sa opačne, 2 = okolo väčší drôtený rám.
   Od Mytickej rarity má vždy aj rám. cosmicCube(farba, seed, variant) vráti skupinu; setColor() mení farbu (Prvotná). */
const _CUBE_GEO=new THREE.BoxGeometry(1,1,1);
const _CUBE_EDGES=(()=>{const e=[];const H=.5;for(const a of[-H,H])for(const b of[-H,H]){e.push([[0,a,b],[1,0,0]],[[a,0,b],[0,1,0]],[[a,b,0],[0,0,1]])}return e})();
const CUBE_FRAG=`uniform vec3 uC;uniform float uS;uniform float uT;varying vec2 vUv;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+uS)*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){vec2 p=(vUv-.5)*2.;vec2 c=vec2(sin(uS*1.7),cos(uS*2.3))*.35;vec2 q=p-c;float r=length(q);
  float a=atan(q.y,q.x)+uT*.15;float arm=pow(.5+.5*cos(2.*(a-log(r+.03)*2.4)),2.5);
  float neb=fbm(p*2.5+vec2(uS,uT*.05))*.8+fbm(p*6.+uS*3.)*.4;
  vec3 col=uC*.12+uC*neb*.55+mix(uC,vec3(.6,.75,1.),.35)*arm*exp(-r*2.2)*.9+vec3(1.,.95,.9)*exp(-r*r*18.)*1.2;
  col+=mix(uC,vec3(1.),.5)*pow(fbm(p*4.-uS),3.)*.8;
  vec2 sc=floor(vUv*60.),sf=fract(vUv*60.)-.5;col+=vec3(1.)*step(.93,h(sc))*smoothstep(.3,0.,length(sf))*(.5+.5*sin(uT*3.+h(sc)*40.));
  float e=max(abs(p.x),abs(p.y));col*=.7+.3*smoothstep(1.,.75,e);
  gl_FragColor=vec4(col*1.25,1.);}`;
function cosmicCube(col,seed,variant=0,size=1){const g=new THREE.Group(),C=new THREE.Color(col);
  const mat=new THREE.ShaderMaterial({uniforms:{uC:{value:C.clone()},uS:{value:seed*7.31%100},uT:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:CUBE_FRAG});
  const cube=new THREE.Mesh(_CUBE_GEO,mat);cube.scale.setScalar(size);g.add(cube);
  const em=new THREE.MeshBasicMaterial({color:new THREE.Color('#ffffff').lerp(C,.25),toneMapped:false});
  const edges=(s,w,m)=>{const eg=new THREE.Group();for(const[p,d]of _CUBE_EDGES){const b=new THREE.Mesh(new THREE.BoxGeometry(d[0]?1+w:w,d[1]?1+w:w,d[2]?1+w:w),m);b.position.set(...p);eg.add(b)}eg.scale.setScalar(s);return eg};
  cube.add(edges(1,.035,em));
  let inner=null,frame=null;
  if(variant===1){inner=edges(size*.55,.05,new THREE.MeshBasicMaterial({color:C.clone(),toneMapped:false}));g.add(inner)}
  if(variant===2){frame=edges(size*1.55,.03,new THREE.MeshBasicMaterial({color:C.clone(),transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));g.add(frame)}
  g.userData={cube,inner,frame,mat,em,
    tick(dt,tt){cube.rotation.x+=dt*.55;cube.rotation.y+=dt*.8;mat.uniforms.uT.value=tt;if(inner){inner.rotation.x-=dt*1.1;inner.rotation.z+=dt*.9}if(frame){frame.rotation.y-=dt*.35;frame.rotation.z+=dt*.2}},
    setColor(c){mat.uniforms.uC.value.copy(c);em.color.set('#ffffff').lerp(c,.25);if(inner)inner.children[0].material.color.copy(c);if(frame)frame.children[0].material.color.copy(c)}};
  return g}
/* Korisť vo vesmíre svieti farbou rarity. toneMapped:false = farba sa nezmieša s tónovaním scény (ACES),
   inak by jasné farby pri prekrytí so žiarou vybledli do bielej. */
function spawnLoot(it,pos){const g=new THREE.Group();const c=new THREE.Color(RAR[it.r].col);const tm={toneMapped:false};
  // v0.24: kozmická kocka (variant podľa náhodného seedu; od Mytickej vždy s rámom)
  const seed=Math.random()*1000,variant=it.r>=7?2:Math.floor(seed)%3;const core=cosmicCube(RAR[it.r].col,seed,variant,1.05);g.add(core);
  const gl=glow(RAR[it.r].col,3.2+it.r*.5,.5+it.r*.03);gl.material.toneMapped=false;g.add(gl);
  const h=5+it.r*1.8,w=.22+it.r*.045;
  const pil=new THREE.Mesh(CYL,new THREE.MeshBasicMaterial({color:c.clone(),transparent:true,opacity:.22+it.r*.03,blending:THREE.AdditiveBlending,depthWrite:false,...tm}));
  pil.scale.set(w,h,w);pil.position.y=h/2;g.add(pil);
  // farebný krúžok pod predmetom: od Nezvyčajnej rarity, od Mytickej väčší a pulzujúci
  let ring=null;if(it.r>=2){const big=it.r>=6;ring=new THREE.Mesh(new THREE.RingGeometry(big?1.5:1.1,big?1.75:1.25,48),new THREE.MeshBasicMaterial({color:c.clone(),transparent:true,opacity:big?.75:.5,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,...tm}));ring.rotation.x=-Math.PI/2;ring.position.y=-.4;g.add(ring)}
  g.position.set(pos.x,.6,pos.z);world.add(g);
  loot.push({g,it,core,gl,pil,ring,ph:Math.random()*TAU,h});
  if(it.r>=6)toast(t('tt.loot',{r:t('r.'+RAR[it.r].k),n:t('base.'+it.b)}),{rar:it.r})}
/* Predmet rovno do inventára (relikty); ak je inventár plný, objaví sa vo vesmíre ako korisť na pozícii pos. */
function giveItem(it,pos){if(state.inv.length<INV_MAX){state.inv.push(it);
    toast(t('tt.loot',{r:t('r.'+RAR[it.r].k),n:itemTitle(it)?'«'+itemTitle(it)+'» '+t('base.'+it.b):t('base.'+it.b)}),{rar:it.r});save();if(sheetTab==='gear')renderSheet();return true}
  spawnLoot(it,pos);toast(t('tt.invFull'),'bad');return false}
function nearestLoot(maxD){let best=null,bd=maxD;for(const l of loot){const d=ship.position.distanceTo(l.g.position);if(d<bd){bd=d;best=l}}return best}
function pickLoot(l){sfx('loot',l.g.position.clone());state.inv.push(l.it);world.remove(l.g);loot=loot.filter(x=>x!==l);invWarned=false;
  toast(t('tt.loot',{r:t('r.'+RAR[l.it.r].k),n:itemTitle(l.it)?'«'+itemTitle(l.it)+'» '+t('base.'+l.it.b):t('base.'+l.it.b)}),{rar:l.it.r});save();if(sheetTab==='gear')renderSheet()}
function tickLoot(dt,tt){const mag=LOOT_RANGE+bonus().magnet;
  for(const l of loot.slice()){const k=l.it.r;
    l.core.userData.tick(dt*(1+k*.08),tt);l.core.position.y=.4+Math.sin(tt*2+l.ph)*.3;
    l.pil.material.opacity=(.18+k*.03)*(1+.35*Math.sin(tt*3+l.ph));
    if(l.ring&&k>=6){l.ring.scale.setScalar(1+.15*Math.sin(tt*2.5+l.ph));l.ring.rotation.z+=dt}
    if(k===9){const c=new THREE.Color().setHSL((tt*.15+l.ph)%1,.85,.65);l.core.userData.setColor(c);l.pil.material.color.copy(c);l.gl.material.color.copy(c);if(l.ring)l.ring.material.color.copy(c)}
    if(dead)continue;const d=ship.position.distanceTo(l.g.position);
    if(d<mag){if(state.inv.length>=INV_MAX){if(!invWarned){toast(t('tt.invFull'),'bad');invWarned=true}continue}
      l.g.position.lerp(ship.position,Math.min(1,dt*5));if(d<2.6)pickLoot(l)}}}
/* Pred skokom brána pozbiera korisť, ktorá zostala ležať v sektore (ak je v inventári miesto). */
function collectAllLoot(){let n=0;for(const l of loot.slice()){if(state.inv.length>=INV_MAX)break;state.inv.push(l.it);n++}loot=[];if(n)toast(t('tt.gateLoot'))}

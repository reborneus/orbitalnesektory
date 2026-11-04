'use strict';
/* ==================== == 6. SEKTOR ====================
   buildSector() postaví celý sektor nanovo (pri štarte a po skoku): pozadie, zóny, asteroidy, stanicu, bránu.
   Asteroid (objekt a): type, amt/max = zostávajúce/pôvodné množstvo, alive, respawn = sekundy do znovuobjavenia,
   rmin/rmax = pás, v ktorom sa smie objaviť, claims = koľko dronov si ho práve zabralo. */
let world=null,asts=[],pickables=[],stationG=null,stationAnim=null,gate=null,drones=[];
const STATION_R=14;
/* v0.18: stanica (megaštruktúra) je zapustená STATION_Y pod rovinou letu – loď nad ňou prelieta. DECK_R = polomer palubného
   prstenca, na ktorom stoja moduly (slotPos vracia polohu modulu v rovine stanice). */
const STATION_Y=-13,DECK_R=13;
function slotPos(i){const a=i/6*TAU+Math.PI/6;return new V3(Math.cos(a)*DECK_R,0,Math.sin(a)*DECK_R)}
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
  const o=new THREE.Mesh(new THREE.PlaneGeometry(13,13),m);o.renderOrder=4;o.frustumCulled=false;return o}
/* volá main.js každý snímok: stav → farba jadra, žiary a svetelných pásov stanice */
function tickStationCore(dt,tt){if(!stationAnim||!stationAnim.orb)return;stationHitT-=dt;
  const hit=stationHitT>0||(typeof raidActive!=='undefined'&&raidActive&&enemies.some(e=>!e.wasPassive&&!e.aggro&&!e.leaving&&Math.hypot(e.pos.x,e.pos.z)<60));
  const near=!hit&&typeof nearStation==='function'&&nearStation();
  _coreT.set(CORE_COL[hit?'hit':near?'near':'idle']);_coreC.lerp(_coreT,Math.min(1,dt*3));
  // guľa je posunutá o 7 m smerom ku kamere: prežiari cez vežu nad jadrom, ale loď nad stanicou ju stále prekryje
  const o=stationAnim.orb;o.quaternion.copy(camera.quaternion);o.position.set(camera.position.x,camera.position.y-STATION_Y,camera.position.z).normalize().multiplyScalar(7);const U=o.material.uniforms;U.uT.value=tt;U.uC.value.copy(_coreC);U.uK.value=hit?1.1+.25*Math.sin(tt*9):1;
  stationAnim.coreGlow.material.color.copy(_coreC);const K=stationMats();K.glow.emissive.copy(_coreC);K.lattice.emissive.copy(_coreC).multiplyScalar(.6)}
function stationMats(){return _stMats||(_stMats={
  hull:kitHullMat('stH',{base:'#5d6674',vari:.22,line:'#262b33',lit:['#ffcf7a','#7fb6ff'],litP:.12,seed:51},{metalness:.7,roughness:.4,emissiveIntensity:1.8,flatShading:true}),
  dark:kitHullMat('stD',{base:'#2a3039',vari:.3,line:'#12151a',lit:['#ffcf7a'],litP:.1,seed:52},{metalness:.75,roughness:.45,emissiveIntensity:1.8,flatShading:true}),
  glow:kitGlowMat('#4f9bff',2.6),amber:kitGlowMat('#ffc46a',2.2),core:kitGlowMat('#3d86ff',1.5),
  lattice:new THREE.MeshStandardMaterial({color:new THREE.Color('#1a2433'),metalness:.8,roughness:.4,wireframe:true,emissive:new THREE.Color('#2a6dff'),emissiveIntensity:.6})})}

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
  if(S.bg==='disk')world.userData.bgTick=buildDiskBg(world);   // v0.21: planéta s ohnivým diskom (bgdisk.js)
  else{
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
  updateGate();
  resetCombat();
  missionsRebuild();
  arenaEnter();
  buildNpcs();
}

function makeAst(type,f,r){const g=new THREE.Group();const S=SECTORS[state.cur];
  const base=type==='mix'?4.2+r()*2.2:type==='relic'?.9+r()*.45:type==='crystal'?1.8+r()*1.5:type==='green'?1.7+r()*1.9:1.6+r()*2.3;
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
  else if(type==='mix'){ // obrí zmiešaný asteroid: výbežky viriditu aj kryštálov
    for(let k=0;k<6;k++){const s=new THREE.Mesh(SHARD,k%2?M.crystal:M.viridit);const d=new V3(r()-.5,r()*.7+.3,r()-.5).normalize();
      s.position.copy(d).multiplyScalar(.8);s.quaternion.setFromUnitVectors(UP_,d);s.scale.set(.14,.3+r()*.25,.14);g.add(s)}
    g.add(glow('#e8d8ff',7,.22))}
  else g.add(glow('#f0a644',3.6,.16));
  const proxy=new THREE.Mesh(new THREE.SphereGeometry(1.9,8,6),M.pick);g.add(proxy);
  const mult={ore:30,green:20,crystal:12,relic:8,mix:40}[type]*NUM;const max=Math.round(base*mult*S.rich);
  const a={g,type,base,amt:max,max,alive:true,respawn:0,shrink:1,claims:0,spin:new V3((r()-.5)*.5,(r()-.5)*.6,(r()-.5)*.4),pos:g.position,rmin:f.r[0],rmax:f.r[1]};
  if(type==='mix'){const o=.25+r()*.45,gr=.2+r()*.35,c=.1+r()*.25,sum=o+gr+c;a.mixp={ore:o/sum,green:gr/sum,crystal:c/sum}}
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
  if(inArena()){stationG=null;stationAnim=null;return} // v aréne nie je stanica (v strede sa objavuje anomália)
  const s=cur();const g=new THREE.Group();stationG=g;const anim={rings:[],turrets:[],dishes:[],blink:[]};stationAnim=anim;
  /* v0.18: MEGAŠTRUKTÚRA – stanica je zapustená hlboko pod rovinou letu (STATION_Y), takže nad ňou preletíš a nenarazíš.
     Časti: žiariace guľové jadro s mriežkou, ostré veže hore a (dlhšia) dole so svetelným pásom, veľký palubný prstenec
     s oknami a modulmi, rebrá. S úrovňou jadra pribúda: 2 = vnútorný otáčavý prstenec, 3 = vedľajšie veže + maják,
     4 = veľký naklonený gyroskopický prstenec, 5 = žiariace halo. */
  g.position.y=STATION_Y;const K=stationMats(),P=kitParts();
  // jadro: modrá žiariaca guľa + tmavá mriežka okolo
  // v0.19.5: energetické jadro (plazmová guľa so svietiacimi žilkami) – makeCoreOrb nižšie, farba podľa stavu stanice
  const orb=makeCoreOrb();g.add(orb);anim.orb=orb;
  const lat=new THREE.Mesh(new THREE.IcosahedronGeometry(4.1,2),K.lattice);g.add(lat);anim.rings.push({o:lat,s:.05});
  const cg=glow('#4f9bff',26,.5);g.add(cg);anim.coreGlow=cg;
  for(const y of[-1,1]){P.add(K.hull,new THREE.CylinderGeometry(2.6,3.4,1.2,12),{p:[0,3.7*y,0],r:[y<0?Math.PI:0,0,0]});P.add(K.glow,new THREE.TorusGeometry(3.1,.07,4,32),{p:[0,3.2*y,0],r:[HALF,0,0]})}
  // veže: faceted (8-hranný kosoštvorcový prierez), hore kratšia (pod rovinou letu), dole dlhá
  const spire=(h0,h1,w,y0)=>kitLoft([{z:h0,w,h:w},{z:h0+(h1-h0)*.25,w:w*1.15,h:w*1.15},{z:h0+(h1-h0)*.7,w:w*.6,h:w*.6},{z:h1,w:.05,h:.05}],{n:8,p:1.5});
  P.add(K.hull,spire(4.2,10.5,2.3),{r:[-HALF,0,0]});
  P.add(K.hull,spire(4.2,30,2.8),{r:[HALF,0,0]});
  for(const a of[0,HALF,Math.PI,-HALF]){P.add(K.glow,box(.12,5.2,.12),{p:[Math.cos(a)*1.55,6.6,Math.sin(a)*1.55],r:[Math.sin(a)*.24,0,-Math.cos(a)*.24]});
    P.add(K.glow,box(.14,17,.14),{p:[Math.cos(a)*2.1,-13,Math.sin(a)*2.1],r:[-Math.sin(a)*.12,0,Math.cos(a)*.12]})}
  // palubný prstenec (medzikružie) + okraje, okná a svetelný lem
  const deck=new THREE.Shape();deck.absarc(0,0,DECK_R+2.6,0,TAU,false);const hole=new THREE.Path();hole.absarc(0,0,DECK_R-2.6,0,TAU,true);deck.holes.push(hole);
  const dg=new THREE.ExtrudeGeometry(deck,{depth:1.2,bevelEnabled:true,bevelThickness:.15,bevelSize:.15,bevelSegments:1,curveSegments:64});dg.rotateX(-HALF);dg.translate(0,-.6,0);
  {const uv=dg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*KIT_UV,uv.getY(i)*KIT_UV)}P.add(K.hull,dg);
  P.add(K.dark,new THREE.TorusGeometry(DECK_R+2.7,.55,6,72),{r:[HALF,0,0]});
  P.add(K.dark,new THREE.TorusGeometry(DECK_R-2.65,.32,6,72),{p:[0,.3,0],r:[HALF,0,0]});
  P.add(K.glow,new THREE.TorusGeometry(DECK_R-2.95,.06,4,72),{p:[0,.35,0],r:[HALF,0,0]});
  for(let i=0;i<64;i++){const a=i/64*TAU,r=DECK_R+3.27;P.add(K.amber,box(.42,.16,.08),{p:[Math.cos(a)*r,(i%2?.15:-.15),Math.sin(a)*r],r:[0,-a+HALF,0]})}
  // spodné podpery a horné rebrá jadro → paluba
  for(let i=0;i<8;i++){const a=i/8*TAU+Math.PI/8,x=Math.cos(a),z=Math.sin(a);
    P.add(K.dark,box(DECK_R-4,.45,.6),{p:[x*(DECK_R+3)/2,-.2,z*(DECK_R+3)/2],r:[0,-a,0]});
    P.add(K.dark,box(.4,.4,9),{p:[x*(DECK_R-1),-4,z*(DECK_R-1)],r:[0,0,0],s:1});
    P.add(K.hull,box(DECK_R*.55,.3,.3),{p:[x*DECK_R*.55,-3.6,z*DECK_R*.55],r:[0,-a,-.5*1]})}
  // drobné nadstavby na palube (mimo miest pre moduly)
  const RR=rng(11);for(let i=0;i<90;i++){const a=RR()*TAU;let near=false;for(let k=0;k<6;k++){const sa=k/6*TAU+Math.PI/6;if(Math.abs(Math.atan2(Math.sin(a-sa),Math.cos(a-sa)))<.28)near=true}if(near)continue;
    const r=DECK_R-2+RR()*4;P.add(RR()<.85?K.dark:K.hull,box(.2+RR()*.9,.15+RR()*.5,.2+RR()*.9),{p:[Math.cos(a)*r,.75,Math.sin(a)*r],r:[0,-a,0]})}
  for(let i=0;i<24;i++){const a=i/24*TAU;P.add(K.amber,box(.1,.1,.1),{p:[Math.cos(a)*(DECK_R-2.3),.8,Math.sin(a)*(DECK_R-2.3)]})}
  P.done(g);
  if(s.core>=2){const r2=new THREE.Group();r2.position.y=-1.2;r2.rotation.x=.12;g.add(r2);anim.rings.push({o:r2,s:-.2});const Q=kitParts();
    Q.add(K.hull,new THREE.TorusGeometry(7.4,.42,6,56),{r:[HALF,0,0]});
    for(let i=0;i<20;i++){const a=i/20*TAU;Q.add(i%2?K.glow:K.amber,box(.3,.18,.12),{p:[Math.cos(a)*7.86,0,Math.sin(a)*7.86],r:[0,-a+HALF,0]})}
    for(let i=0;i<4;i++)Q.add(K.dark,box(7.6,.22,.3),{r:[0,i*Math.PI/4,0]});
    Q.done(r2)}
  if(s.core>=3){const Q=kitParts();for(const a of[Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4]){const x=Math.cos(a)*2.4,z=Math.sin(a)*2.4;
      Q.add(K.hull,spire(0,4.5,.8),{p:[x,4.6,z],r:[-HALF+Math.sin(a)*.2,0,-Math.cos(a)*.2]});Q.add(K.hull,spire(0,9,1),{p:[x,-4.6,z],r:[HALF-Math.sin(a)*.15,0,Math.cos(a)*.15]})}Q.done(g);
    const b=glow('#ff6a4d',2.4,1);b.position.y=10.8;g.add(b);anim.blink.push({o:b,f:1.3,base:2.4})}
  if(s.core>=4){const gy=new THREE.Group();gy.rotation.x=.38;g.add(gy);const sp=new THREE.Group();gy.add(sp);anim.rings.push({o:sp,s:.07});const Q=kitParts();
    Q.add(K.dark,new THREE.TorusGeometry(DECK_R+7,.45,6,96),{r:[HALF,0,0]});Q.add(K.glow,new THREE.TorusGeometry(DECK_R+7,.08,4,96),{p:[0,.45,0],r:[HALF,0,0]});
    for(let i=0;i<16;i++){const a=i/16*TAU;Q.add(K.hull,box(1.8,.9,1.1),{p:[Math.cos(a)*(DECK_R+7),0,Math.sin(a)*(DECK_R+7)],r:[0,-a,0]})}
    Q.done(sp)}
  if(s.core>=5){const halo=new THREE.Mesh(new THREE.TorusGeometry(DECK_R+11,.12,6,120),M.hullGlow);halo.rotation.x=HALF;halo.position.y=-1;g.add(halo)}
  const beacon=glow(s.captured?'#ffd27a':'#58d0c0',s.captured?11:8,.85);beacon.position.y=11;g.add(beacon);anim.blink.push({o:beacon,f:.6,base:s.captured?11:8});
  const aura=glow(s.captured?'#ffd27a':'#58d0c0',70,.1);aura.position.y=-1;g.add(aura);
  const n=slotsFor(s.core);
  for(let i=0;i<n;i++){const p=slotPos(i);const pad=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.4,.35,6),M.pad);pad.position.copy(p).setY(.75);g.add(pad);
    const m=s.slots[i];const mp=p.clone().setY(1.6);
    if(!m){const e=glow('#58d0c0',3.4,.35);e.position.copy(p).setY(1.3);g.add(e);anim.blink.push({o:e,f:.4,base:3.4,soft:1})}
    else{g.add(makeModule(m.t,mp,anim));
      // žiara pod modulom vo farbe jeho rarity (stúpa s vylepšením +0..+10)
      const R=modRar(m),c=RAR[R].col;const rg=glow(c,4.5+R*.5,.18+R*.04);rg.position.copy(p).setY(1.1);g.add(rg);anim.blink.push({o:rg,f:.3,base:4.5+R*.5,soft:1});
      if(R>=6){const ring=new THREE.Mesh(new THREE.RingGeometry(2.4,2.65,36),new THREE.MeshBasicMaterial({color:new THREE.Color(c),transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
        ring.rotation.x=-HALF;ring.position.copy(p).setY(1.0);g.add(ring)}}}
  const proxy=new THREE.Mesh(new THREE.SphereGeometry(DECK_R+4,10,8),M.pick);proxy.userData.station=true;g.add(proxy);
  pickables=pickables.filter(p=>!p.userData.station);pickables.push(proxy);
  world.add(g);
  syncDrones();
}
function makeModule(type,p,anim){const g=new THREE.Group();g.position.copy(p);g.lookAt(0,p.y,0);
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
  gate=new THREE.Group();gate.position.set(Math.cos(ang)*GATE_R,0,Math.sin(ang)*GATE_R);gate.lookAt(0,0,0);
  const ringG=new THREE.Group();gate.add(ringG);
  ringG.add(new THREE.Mesh(new THREE.TorusGeometry(5.2,.55,8,48),M.plate));
  ringG.add(new THREE.Mesh(new THREE.TorusGeometry(4.5,.14,6,48),M.hullGlow));
  for(let i=0;i<6;i++){const a=i/6*TAU;const n=new THREE.Mesh(new THREE.BoxGeometry(.9,1.4,1.4),M.metal);n.position.set(Math.cos(a)*5.4,Math.sin(a)*5.4,0);n.rotation.z=a;ringG.add(n)}
  const core=glow('#7ef2e2',9,.55);gate.add(core);gate.userData.ring=ringG;gate.userData.core=core;
  const proxy=new THREE.Mesh(new THREE.SphereGeometry(7,8,6),M.pick);proxy.userData.gate=true;gate.add(proxy);pickables.push(proxy);
  world.add(gate);
  for(const a of asts)if(a.alive&&a.pos.distanceTo(gate.position)<12)placeAst(a,Math.random)}

/* ---------- Drony ----------
   Každý dok dronov má jedného drona. Jeho vlastnosti závisia od vylepšenia doku (+0..+10) a vloženého AI jadra (čipu):
   droneStats(m) vráti rate (t/s), cap (t), speed (m/s), dmg a range (obranný režim), res (surovina, ktorú ťaží) a def (či bráni).
   Bez čipu ťaží len rudu vo vnútorných pásoch. AI jadro od rarity Neobyčajné povolí viridit, od Vzácne obranu, od Epické kryštály. */
function droneStats(m){const F=MOD_FX.drone,e=m.enh||0;
  const can={ore:true,green:chipCan(m,'green'),crystal:chipCan(m,'crystal')};
  return{rate:F.rate*(1+F.ratePer*e)*(1+chipStat(m,'dMine')/100),cap:F.cap+F.capPer*e+chipStat(m,'dCap'),speed:F.speed*(1+F.speedPer*e)*(1+chipStat(m,'dSpeed')/100),
    dmg:F.dmg*(1+F.dmgPer*e)*(1+chipStat(m,'dDmg')/100),range:F.range,res:can[m.res]?m.res:'ore',can,def:m.mode==='def'&&chipCan(m,'def')}}
function towerStats(m){const F=MOD_FX.tower,e=m.enh||0;return{dmg:F.dmg*(1+F.dmgPer*e)*(1+chipStat(m,'tDmg')/100),rate:F.rate*(1+chipStat(m,'tRate')/100),range:F.range+F.rangePer*e+chipStat(m,'tRange')}}
const sensorIncome=m=>MOD_FX.sensor.green*(1+MOD_FX.sensor.incPer*(m.enh||0))*(1+chipStat(m,'sInc')/100);
const droneIncome=m=>MOD_FX.drone.income*(1+MOD_FX.drone.ratePer*(m.enh||0))*(1+chipStat(m,'dMine')/100);
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
  g.scale.setScalar(.45);_droneTpl=g;return g.clone()}
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
  try{if(!_thumbR){_thumbR=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});_thumbR.setPixelRatio(1);_thumbR.setSize(160,120,false);_thumbR.outputEncoding=THREE.sRGBEncoding;_thumbR.toneMapping=THREE.ACESFilmicToneMapping}
    const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(col('#9fb6dd'),col('#150b1c'),.9));const dl=new THREE.DirectionalLight(col('#ffe4bd'),2);dl.position.set(4,8,6);sc.add(dl);
    const g=makeModule(type,new V3(0,0,1),{rings:[],turrets:[],dishes:[],blink:[]});g.position.set(0,0,0);sc.add(g);
    const gl=glow(RAR[r].col,7+r*.5,.35+r*.04);gl.position.set(0,-.4,0);sc.add(gl);
    const cam=new THREE.PerspectiveCamera(32,4/3,.1,100);cam.position.set(4.6,4.2,5.6);cam.lookAt(0,.4,0);
    _thumbR.render(sc,cam);_thumbs[key]=_thumbR.domElement.toDataURL('image/png')}catch(e){_thumbs[key]=''}
  return _thumbs[key]}
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
function autoNext(a){if(a.type==='relic'||state.autoMine===false||cargoTotal()>=shipVal('cargo')-.01)return false;let best=null,bd=40*MAP_SCALE;
  for(const o of asts){if(o===a||!o.alive||o.type!==a.type||Math.hypot(o.pos.x,o.pos.z)>=HORIZON)continue;const d=ship.position.distanceTo(o.pos);if(d<bd){bd=d;best=o}}
  if(!best)return false;mineTarget=best;moveTarget=best.pos.clone().setY(0);flashMarker(best.pos,'#58d0c0');return true}
function stopMining(){mineTarget=null;moveTarget=null}

/* ---------- Korisť vo vesmíre ----------
   Predmet, ktorý padol, sa vznáša na mieste so svetelným stĺpom vo farbe rarity (vyššia rarita = vyšší a jasnejší stĺp,
   od Legendárnej krúžok na zemi). Keď je loď bližšie ako 8 m + bonus Dosah zberu, korisť sa pritiahne a uloží do inventára. */
let loot=[],invWarned=false;
const LOOT_GEO=new THREE.OctahedronGeometry(.7,0);
/* Korisť vo vesmíre svieti farbou rarity. toneMapped:false = farba sa nezmieša s tónovaním scény (ACES),
   inak by jasné farby pri prekrytí so žiarou vybledli do bielej. */
function spawnLoot(it,pos){const g=new THREE.Group();const c=new THREE.Color(RAR[it.r].col);const tm={toneMapped:false};
  const core=new THREE.Mesh(LOOT_GEO,new THREE.MeshBasicMaterial({color:c.clone(),...tm}));g.add(core);
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
function pickLoot(l){state.inv.push(l.it);world.remove(l.g);loot=loot.filter(x=>x!==l);invWarned=false;
  toast(t('tt.loot',{r:t('r.'+RAR[l.it.r].k),n:itemTitle(l.it)?'«'+itemTitle(l.it)+'» '+t('base.'+l.it.b):t('base.'+l.it.b)}),{rar:l.it.r});save();if(sheetTab==='gear')renderSheet()}
function tickLoot(dt,tt){const mag=LOOT_RANGE+bonus().magnet;
  for(const l of loot.slice()){const k=l.it.r;
    l.core.rotation.y+=dt*(1.2+k*.15);l.core.position.y=Math.sin(tt*2+l.ph)*.3;
    l.pil.material.opacity=(.18+k*.03)*(1+.35*Math.sin(tt*3+l.ph));
    if(l.ring&&k>=6){l.ring.scale.setScalar(1+.15*Math.sin(tt*2.5+l.ph));l.ring.rotation.z+=dt}
    if(k===9){const c=new THREE.Color().setHSL((tt*.15+l.ph)%1,.85,.65);l.core.material.color.copy(c);l.pil.material.color.copy(c);l.gl.material.color.copy(c);if(l.ring)l.ring.material.color.copy(c)}
    if(dead)continue;const d=ship.position.distanceTo(l.g.position);
    if(d<mag){if(state.inv.length>=INV_MAX){if(!invWarned){toast(t('tt.invFull'),'bad');invWarned=true}continue}
      l.g.position.lerp(ship.position,Math.min(1,dt*5));if(d<2.6)pickLoot(l)}}}
/* Pred skokom brána pozbiera korisť, ktorá zostala ležať v sektore (ak je v inventári miesto). */
function collectAllLoot(){let n=0;for(const l of loot.slice()){if(state.inv.length>=INV_MAX)break;state.inv.push(l.it);n++}loot=[];if(n)toast(t('tt.gateLoot'))}

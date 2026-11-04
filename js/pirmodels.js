'use strict';
/* ==================== == 5b. MODELY PIRÁTOV (v0.17) ====================
   Všetci piráti majú spoločný vzhľad (podľa jednej predlohy): tmavý fialovo-sivý pancier, šípovitý trup s vrstvenými plátmi,
   veľký kruhový rám okolo stredu lode (s ružovým vnútorným svetlom a „rebrami“), zahnuté čepele dozadu a zhluky
   ružovo-fialových svetiel na ich koncoch. Jednotlivé typy sa líšia len tvarom (veľkosť, počet čepelí, ostne, veže…).
   Model sa pre každý typ postaví raz (šablóna) a každý pirát dostane kópiu, ktorá zdieľa geometriu aj materiály → výkon. */
let _pirMats=null;
function pirMats(){return _pirMats||(_pirMats={
  hull:kitHullMat('pirH',{base:'#5e5666',vari:.25,line:'#1c1820',lit:['#ff5ad8','#ff8a7a'],litP:.12,seed:41},{metalness:.75,roughness:.38,emissiveIntensity:2,flatShading:true}),
  dark:kitHullMat('pirD',{base:'#35303c',vari:.3,line:'#121015',lit:['#ff6ae0'],litP:.16,seed:42},{metalness:.8,roughness:.35,emissiveIntensity:2.2,flatShading:true}),
  pink:kitGlowMat('#ff4fd8',3.4),
  rose:kitGlowMat('#ff7a5a',1.8),
  gold:kitGlowMat('#ffd23a',2.4)})}
/* tvarové parametre jednotlivých typov: L dĺžka trupu, W pol-šírka, ring polomer rámu (0 = bez), arc dĺžka oblúka rámu,
   blades počet čepelí na stranu, span rozpätie, spikes predné ostne, fin chrbtová plutva, tur veže, sc celková mierka */
const PIR_SHAPE={
  swarm:  {L:2.6,W:.42,ring:0,blades:1,span:1.5,sc:.55},
  fighter:{L:3.4,W:.6,ring:1.3,arc:2.3,blades:1,span:2.3,sc:1},
  corsair:{L:3.6,W:.7,ring:1.45,arc:2.6,blades:2,span:2.5,spikes:true,sc:1},
  frigate:{L:4.6,W:.85,ring:1.7,arc:2.75,blades:2,span:2.6,spikes:true,fin:true,tur:2,sc:1},
  dread:  {L:5.2,W:.95,ring:1.9,arc:2.75,blades:3,span:3.0,spikes:true,fin:true,tur:4,sc:2.8},
  carrier:{L:5.6,W:1.1,ring:2.2,arc:2.9,blades:3,span:3.2,spikes:true,fin:true,tur:4,hangar:true,sc:2.9}};
const _pirTpl={};
function pirModel(kind){if(!_pirTpl[kind])_pirTpl[kind]=pirBuild(kind);return _pirTpl[kind].clone()}
function pirBuild(kind){const K=pirMats(),P=kitParts(),g=new THREE.Group();const lights=[];   // lights = [x,y,z,veľkosť] pre svetelné body
  if(kind==='turret')pirTurret(P,K,lights);else if(kind==='cmod')pirModule(P,K,lights);else pirShip(P,K,PIR_SHAPE[kind]||PIR_SHAPE.fighter,lights);
  P.done(g);for(const[x,y,z,s,c]of lights){const l=glow(c||'#ff5ad8',s,.9);l.position.set(x,y,z);g.add(l)}
  const sc=(PIR_SHAPE[kind]&&PIR_SHAPE[kind].sc)||1;g.scale.setScalar(sc);return g}

/* loď: trup + pláty + kruhový rám s rebrami + čepele + ostne/plutva/veže */
function pirShip(P,K,o,lights){const{L,W}=o,z0=-L*.5;
  P.add(K.hull,kitLoft([{z:z0,w:W*.55,h:W*.32,hb:W*.3},{z:z0+L*.15,w:W*.85,h:W*.48,hb:W*.38},{z:z0+L*.45,w:W,h:W*.55,hb:W*.42},{z:z0+L*.7,w:W*.78,h:W*.45,hb:W*.34},
    {z:z0+L*.88,w:W*.42,h:W*.26,hb:W*.2,y:-W*.04},{z:z0+L,w:W*.05,h:W*.05,y:-W*.12}],{n:8,p:2.6}));
  // vrstvené šípové pláty na chrbte (ako na predlohe)
  for(const[a,b,k,y]of[[.05,.55,.95,.5],[.3,.78,.8,.56],[.55,.95,.55,.44]])
    P.add(K.dark,kitSlab([[0,z0+L*b],[W*k,z0+L*(b-.14)],[W*k*.75,z0+L*a],[0,z0+L*(a+.08)],[-W*k*.75,z0+L*a],[-W*k,z0+L*(b-.14)]],W*.12,{y:W*y,bev:W*.05}));
  P.add(K.pink,box(W*.05,W*.05,L*.35),{p:[W*.32,W*.62,z0+L*.42],r:[0,.08,0],m:true});
  // ružové „rebrá“ pod trupom (svietiaci vnútrajšok)
  for(let i=0;i<7;i++)P.add(K.rose,box(W*1.3,W*.06,W*.06),{p:[0,-W*.38,z0+L*(.2+i*.08)]});
  const R=o.ring;
  if(R){const tube=R*.075,arc=o.arc,st=-arc/2;
    P.add(K.hull,new THREE.TorusGeometry(R,tube,5,40,arc),{p:[0,W*.05,0],r:[HALF,0,st],m:true});
    P.add(K.dark,new THREE.TorusGeometry(R+tube*.9,tube*.55,4,40,arc*.9),{p:[0,W*.05+tube*.7,0],r:[HALF,0,st+arc*.05],m:true});
    P.add(K.pink,new THREE.TorusGeometry(R-tube*1.05,tube*.25,4,40,arc*.92),{p:[0,W*.05,0],r:[HALF,0,st+arc*.04],m:true});
    // rebrá rámu (spojenie s trupom) a pancierové segmenty na ráme
    for(const a of[-.75,-.25,.25,.75]){const ang=a*arc/2,x=Math.cos(ang)*R,z=Math.sin(ang)*R;
      P.add(K.dark,box(Math.max(.1,x-W*.6),W*.14,W*.16),{p:[(x+W*.6)/2,W*.0,z*.7],r:[0,-ang*.5,0],m:true});
      P.add(K.rose,box(W*.08,W*.08,W*.08),{p:[(x+W*.6)/2,W*.1,z*.7],m:true})}
    for(let i=0;i<6;i++){const ang=st+arc*(i+.5)/6;P.add(K.hull,box(tube*2.6,tube*1.6,tube*3.2),{p:[Math.cos(ang)*R,W*.05+tube,Math.sin(ang)*R],r:[0,-ang,0],m:true})}}
  // zahnuté čepele dozadu so zhlukmi svetiel na odtokovej hrane
  const r0=R||W*1.2;
  for(let i=0;i<o.blades;i++){const sp=o.span*(1-i*.16),zz=-i*L*.12;
    const path=kitBez([r0*.85,zz+W*.2],[sp*.8,zz-L*.08],[sp*1.05,zz-L*.25],[sp*.95,z0-L*.12-i*L*.06],14);
    const wb=W*(.42-i*.06);
    P.add(K.dark,kitSlab(kitRibbon(path,t=>wb*(1-t*.75)),W*.2,{y:W*(.05-i*.1),bev:W*.06}),{m:true});
    P.add(K.hull,kitSlab(kitRibbon(path.slice(1,13),t=>wb*.55*(1-t*.6),W*.12),W*.1,{y:W*(.2-i*.1),bev:W*.04}),{m:true});
    for(const t of[.55,.68,.8,.92]){const a=kitAlong(path,t),nx=-Math.cos(a.ry),nz=Math.sin(a.ry),w=wb*(1-t*.75);
      P.add(K.pink,box(W*.1,W*.1,W*.16),{p:[a.x+nx*w,W*(.05-i*.1),a.z+nz*w],r:[0,a.ry,0],m:true})}
    const tip=path[path.length-1];for(const s of[-1,1])lights.push([tip[0]*s,W*(.05-i*.1),tip[1],W*2.2+.6])}
  // predné ostne (dva zahnuté zuby pred nosom)
  if(o.spikes){const sp=kitBez([r0*.55,r0*.6],[r0*.75,L*.3],[r0*.55,L*.45],[W*.6,L*.58],10);
    P.add(K.dark,kitSlab(kitRibbon(sp,t=>W*.22*(1-t)+.01),W*.16,{y:0,bev:W*.04}),{m:true});
    P.add(K.pink,box(W*.06,W*.06,W*.4),{p:[r0*.62,W*.1,L*.38],r:[0,-.3,0],m:true})}
  // chrbtová plutva (veľký zahnutý hrot hore vzadu)
  if(o.fin){P.add(K.hull,kitSlab([[0,z0+L*.55],[W*.5,z0+L*.45],[W*1.9,z0+L*.05],[W*1.5,z0-L*.05],[W*.9,z0+L*.12],[0,z0+L*.18]],W*.1,{bev:W*.04}),{p:[0,W*.55,0],r:[0,0,HALF]});
    P.add(K.pink,box(W*.05,W*.6,W*.05),{p:[0,W*1.3,z0+L*.22],r:[-.9,0,0]})}
  // veže na palube
  for(let i=0;i<(o.tur||0);i++){const x=(i%2?-1:1)*W*.55,z=z0+L*(.32+Math.floor(i/2)*.22);
    P.add(K.hull,new THREE.CylinderGeometry(W*.2,W*.26,W*.12,8),{p:[x,W*.62,z]});
    P.add(K.dark,box(W*.24,W*.12,W*.3),{p:[x,W*.72,z]});
    P.add(K.pink,box(W*.04,W*.04,W*.45),{p:[x,W*.74,z+W*.35]})}
  // hangár nosiča: žiariaci otvor pod trupom
  if(o.hangar){P.add(K.dark,box(W*1.4,W*.4,L*.3),{p:[0,-W*.5,z0+L*.62]});P.add(K.pink,box(W*1.1,W*.05,L*.26),{p:[0,-W*.72,z0+L*.62]});lights.push([0,-W*.8,z0+L*.62,W*2.4,'#ff7ae6'])}
  // motory vzadu
  for(const x of[-W*.35,W*.35]){P.add(K.dark,new THREE.CylinderGeometry(W*.2,W*.26,W*.4,10),{p:[x,0,z0-W*.1],r:[HALF,0,0]});P.add(K.pink,new THREE.CircleGeometry(W*.17,10),{p:[x,0,z0-W*.31],r:[0,Math.PI,0]})}
  lights.push([0,0,z0-W*.5,W*3.5+.6,'#ff6ad0']);lights.push([0,W*.1,z0+L*1.0,W*2+.3,'#ff4fd8'])}

/* statická raketová veža: plošina s kruhovým rámom, kupolou, dvomi odpaľovacími tubusmi a krátkymi čepeľami okolo */
function pirTurret(P,K,lights){
  P.add(K.hull,new THREE.CylinderGeometry(2.1,2.6,.8,10),{p:[0,0,0]});
  P.add(K.dark,new THREE.TorusGeometry(2.55,.18,5,40),{p:[0,.1,0],r:[HALF,0,0]});
  P.add(K.pink,new THREE.TorusGeometry(2.25,.05,4,40),{p:[0,.42,0],r:[HALF,0,0]});
  P.add(K.dark,new THREE.CylinderGeometry(1.1,1.5,.8,8),{p:[0,.8,0]});
  P.add(K.hull,new THREE.SphereGeometry(.85,10,6,0,TAU,0,HALF),{p:[0,1.2,0],s:[1,.7,1.2]});
  for(const s of[-1,1]){P.add(K.dark,box(.55,.55,2.4),{p:[.9*s,1.35,.6]});P.add(K.pink,box(.4,.4,.05),{p:[.9*s,1.35,1.82]});for(const y of[1.2,1.5])P.add(K.rose,box(.04,.06,1.8),{p:[1.18*s,y,.55]})}
  for(let i=0;i<6;i++){const a=i/6*TAU+.3;const path=kitBez([Math.cos(a)*2.3,Math.sin(a)*2.3],[Math.cos(a)*3.0,Math.sin(a)*3.0],[Math.cos(a+.3)*3.4,Math.sin(a+.3)*3.4],[Math.cos(a+.55)*3.6,Math.sin(a+.55)*3.6],8);
    P.add(K.dark,kitSlab(kitRibbon(path,t=>.28*(1-t)+.02),.18,{y:-.1,bev:.05}));const tp=path[path.length-1];P.add(K.pink,box(.12,.12,.12),{p:[tp[0],0,tp[1]]})}
  lights.push([0,1.5,1.9,2.4,'#ff6ad0'])}
/* modul nosiča (ručne zameriavaný): šesťhranné puzdro s rámom a zlatým jadrom (zlatá = treba zničiť ručne) */
function pirModule(P,K,lights){
  P.add(K.hull,new THREE.CylinderGeometry(1.1,1.25,1.0,6),{p:[0,0,0]});
  P.add(K.dark,new THREE.TorusGeometry(1.45,.12,4,30),{p:[0,.1,0],r:[HALF,0,0]});
  for(let i=0;i<6;i++){const a=i/6*TAU;P.add(K.dark,box(.3,.5,.5),{p:[Math.cos(a)*1.25,0,Math.sin(a)*1.25],r:[0,-a,0]});P.add(K.pink,box(.06,.3,.08),{p:[Math.cos(a)*1.42,0,Math.sin(a)*1.42],r:[0,-a,0]})}
  P.add(K.gold,new THREE.IcosahedronGeometry(.6,0),{p:[0,.9,0]});
  lights.push([0,1.0,0,4,'#ffd23a'])}

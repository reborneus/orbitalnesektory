'use strict';
/* ==================== == 5. LODE ====================
   Lode smerujú dopredu po osi +z. buildShip(id) postaví model podľa id z SHIPS (data.js):
   klepeto = ťažobná loď s klepetami, sokol = rýchla stíhačka, bizon = ťažký nákladný ťahač.
   Spoločné časti: body (náklon pri zatáčaní), eng (svetlá motorov), core (svetlo pri ťažbe), halo a bublina štítu. */
const ship=new THREE.Group();
const NOSE=new V3(0,0,2.0); // bod na lodi, z ktorého vychádza ťažobný laser a strely
/* v0.17: Detailné modely lodí (kit v shipkit.js). Materiály sa vytvoria raz pri prvej stavbe lode a potom sa zdieľajú. */
const _shipMats={};
const shipMats=(id,f)=>_shipMats[id]||(_shipMats[id]=f());
const HALF=Math.PI/2;
const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
/* zvislá plutva: profil [[výška,z],…] sa postaví nastojato (výška → os y), tilt = odklon do strany */
const finGeo=(prof,th)=>kitSlab(prof,th,{bev:.03});
const SHIP_MODELS={
  /* KLEPETO (Pincer): biela organická loď s dvoma veľkými zahnutými klepetami a ďalšími bočnými ostňami.
     Vrstvy: tmavá kostra (spodok) → biele pancierové čepele → úzke vrchné ostrie. Na vnútornej strane klepiet azúrové priduchy,
     na ramenách kruhové žiariace porty, vzadu chrbtový hrebeň z ostňov. Medzi klepetami ťažobné jadro. */
  klepeto(body){
    const K=shipMats('klepeto',()=>({
      // v0.30: pancier prefarbený z bielej na tmavý grafit s nádychom oceľovej modrej (biela pôsobila ako raketoplán)
      white:kitHullMat('pinW2',{base:'#46505e',vari:.16,line:'#1a2029',lit:['#5fe6ff'],litP:.05,seed:11},{metalness:.62,roughness:.34,emissiveIntensity:1.9}),
      dark:kitHullMat('pinD2',{base:'#181d26',vari:.25,lit:['#3fd8ff','#7ff0ff'],litP:.14,seed:12},{metalness:.75,roughness:.35,emissiveIntensity:2.2}),
      glow:kitGlowMat('#3fe0ff',2.6),
      glass:new THREE.MeshStandardMaterial({color:new THREE.Color('#0a1a24'),metalness:.95,roughness:.08,emissive:new THREE.Color('#1aa6c8'),emissiveIntensity:.35}),
      ring:new THREE.MeshStandardMaterial({color:new THREE.Color('#6f7c8c'),metalness:.9,roughness:.25}),
      shell:new THREE.MeshStandardMaterial({color:new THREE.Color('#12161d'),metalness:.8,roughness:.4,side:THREE.DoubleSide})}));
    const P=kitParts();
    // --- trup: tmavá kostra dole, biely pancier hore
    P.add(K.dark,kitLoft([{z:-3.7,w:.6,h:.25,hb:.3,y:-.1},{z:-3.0,w:.95,h:.35,hb:.42,y:-.1},{z:-1.2,w:1.0,h:.38,hb:.45,y:-.12},{z:.6,w:.75,h:.3,hb:.38,y:-.12},{z:1.9,w:.36,h:.2,hb:.24,y:-.1},{z:2.5,w:.12,h:.08,y:-.08}],{n:18,p:2.6}));
    P.add(K.white,kitLoft([{z:-3.5,w:.5,h:.42,hb:.05,y:.05},{z:-2.8,w:.82,h:.6,hb:.08,y:.05},{z:-1.2,w:.88,h:.66,hb:.08,y:.05},{z:.4,w:.66,h:.55,hb:.08,y:.05},{z:1.6,w:.34,h:.32,hb:.06,y:.02},{z:2.45,w:.06,h:.05,y:0}],{n:22,p:2.3}));
    // chrbtové šípové pláty (prekrývajú sa ako šupiny)
    for(const[z0,z1,w,y]of[[-3.3,-1.6,.42,.66],[-2.2,-.2,.36,.69],[-1.0,.9,.28,.6]])
      P.add(K.white,kitSlab([[0,z1],[w,z1-.7],[w*.7,z0],[0,z0+.35],[-w*.7,z0],[-w,z1-.7]],.09,{y,bev:.04}));
    // kokpit: tmavé sklo s azúrovým lemom
    P.add(K.glass,kitLoft([{z:.15,w:.08,h:.05,hb:.02,y:.5},{z:.45,w:.28,h:.17,hb:.03,y:.5},{z:1.05,w:.27,h:.15,hb:.03,y:.42},{z:1.45,w:.07,h:.04,hb:.02,y:.32}],{n:16,p:2.2}));
    P.add(K.glow,box(.03,.03,1.05),{p:[.3,.5,.75],r:[.18,.06,0],m:true});
    // --- klepetá: hlavné rameno = tmavá kostra + 3 prekrývajúce sa biele segmenty (medzi nimi presvitá kostra a azúrové svetlá)
    const arm=kitBez([.7,-2.7],[2.7,-1.9],[2.45,1.7],[1.0,4.25],30);
    P.add(K.dark,kitSlab(kitRibbon(arm,t=>.46*(1-t*.82)+.035),.46,{y:-.08,bev:.06}),{m:true});
    for(const[a0,a1,w0,dy]of[[0,13,.38,0],[11,22,.3,.04],[20,31,.22,.08]]){const seg=arm.slice(a0,a1);
      P.add(K.white,kitSlab(kitRibbon(seg,t=>w0*Math.pow(1-t,.7)*(t<.12?.75+t*2:1)+.012,.07),.24,{y:.22+dy,bev:.05}),{m:true});
      P.add(K.white,kitSlab(kitRibbon(seg.slice(1,-1),t=>w0*.32*(1-t)+.01,.16),.1,{y:.38+dy,bev:.03}),{m:true})}
    for(const t of[.39,.7]){const a=kitAlong(arm,t);P.add(K.glow,box(.24,.05,.1),{p:[a.x+.04,.27,a.z],r:[0,a.ry,0],m:true})}   // svetlá v medzerách segmentov
    P.add(K.glow,kitSlab(kitRibbon(arm.slice(2,26),()=>.025,-.36),.05,{y:.04,bev:0}),{m:true});   // svietiaca hrana zvnútra
    // spojovacie rebrá trup → klepetá (zahnuté dozadu, tmavé s bielym hrebeňom a svetlom)
    for(const[z0,z1]of[[-1.7,-.9],[-.3,.7],[1.0,2.0]]){const zz=Math.min(z1,3.6);let ax=1.0;for(const q of arm)if(Math.abs(q[1]-zz)<.35)ax=Math.max(ax,q[0]);
      const rib=kitBez([.45,z0+.6],[.9,z0+.3],[ax-.6,z1-.5],[ax-.2,zz-.3],8);
      P.add(K.dark,kitSlab(kitRibbon(rib,t=>.13-t*.04),.2,{y:-.04,bev:.04}),{m:true});
      P.add(K.white,kitSlab(kitRibbon(rib.slice(1,8),t=>.05),.06,{y:.1,bev:.02}),{m:true});
      P.add(K.glow,box(.05,.05,.16),{p:[rib[4][0],-.04,rib[4][1]],r:[0,Math.atan2(rib[5][0]-rib[3][0],rib[5][1]-rib[3][1]),0],m:true})}
    // tmavé bočné pásy trupu s radom azúrových okien
    P.add(K.dark,kitLoft([{z:-3.0,w:.93,h:.14,hb:.14,y:.12},{z:-1.2,w:.97,h:.16,hb:.16,y:.12},{z:.5,w:.74,h:.13,hb:.13,y:.1},{z:1.5,w:.4,h:.08,hb:.08,y:.06}],{n:18,p:3}));
    for(let i=0;i<8;i++){const z=-2.7+i*.42,w=z<-1.2?.97:.97-(z+1.2)*.14;P.add(K.glow,box(.03,.06,.2),{p:[w+.005,.13,z],m:true})}
    // zadné ostne smerom dozadu a chrbtový hrebeň (zvislé plutvy)
    const tail=kitBez([.9,-2.6],[1.3,-3.3],[1.5,-4.0],[1.75,-4.75],10);
    P.add(K.white,kitSlab(kitRibbon(tail,t=>.2*(1-t)+.01),.16,{y:.05,bev:.04}),{m:true});
    P.add(K.white,finGeo([[0,-1.2],[.28,-1.5],[.95,-3.9],[.5,-3.35],[0,-3.45]],.07),{p:[0,.55,0],r:[0,0,HALF]});
    P.add(K.white,finGeo([[0,-1.6],[.2,-1.85],[.7,-3.7],[.35,-3.3],[0,-3.35]],.06),{p:[.38,.5,0],r:[0,0,HALF-.45],m:true});
    P.add(K.glow,box(.025,.5,.03),{p:[0,.92,-2.6],r:[-.75,0,0]});
    // motorový blok vzadu (3 dýzy)
    P.add(K.dark,box(1.5,.55,.7),{p:[0,-.08,-3.45]});
    for(const x of[-.5,0,.5])kitEngine(P,body,K.shell,K.ring,K.glow,x,-.08,-3.75,.26,'#6fe3ff',.6);
    // drobné detaily na spodnej kostre (servisné bloky, antény)
    const R=rng(5);for(let i=0;i<14;i++){const z=-3+R()*3.6,x=.55+R()*.35;P.add(K.dark,box(.12+R()*.15,.08+R()*.1,.12+R()*.3),{p:[x,-.32-R()*.1,z],m:true})}
    P.add(K.ring,new THREE.CylinderGeometry(.015,.015,.7,4),{p:[.22,.95,-1.8],r:[-.4,0,0]});
    // držiak jadra medzi klepetami
    P.add(K.dark,new THREE.CylinderGeometry(.06,.12,.5,8),{p:[0,-.05,2.62],r:[HALF,0,0]});
    P.add(K.ring,new THREE.TorusGeometry(.32,.04,6,24),{p:[0,.05,2.95]});
    P.done(body);
    for(const s of[-1,1]){const n=glow(s<0?'#ff6a4d':'#7ef2e2',1.4,1);n.position.set(2.75*s,.1,3.1);body.add(n)}
    return {core:[0,.05,2.95],nose:[0,0,3.1],coreCol:'#7ef2e2',coreMesh:true}},

  /* SOKOL (Falcon): tmavá stíhačka s medenými lemami (podľa „blueprint“ predlohy zhora). Šípovitý trup s vrstvenými plátmi,
     veľký tmavý kokpit, ramenné pancierové bloky, chrbát s rebrovaním, šípové krídla, dva veľké motory s oranžovou žiarou. */
  sokol(body){
    const K=shipMats('sokol',()=>({
      hull:kitHullMat('falH',{base:'#2b2b2f',vari:.22,line:'#111114',trim:'#c4733a',trimP:.2,lit:['#ff9a4a'],litP:.03,seed:21},{metalness:.6,roughness:.42,emissiveIntensity:1.4,flatShading:true}),
      plate:kitHullMat('falP',{base:'#3a3a3f',vari:.18,line:'#151517',trim:'#d98848',trimP:.3,seed:22},{metalness:.55,roughness:.4,emissiveIntensity:1,flatShading:true}),
      copper:new THREE.MeshStandardMaterial({color:new THREE.Color('#b8693a'),metalness:.85,roughness:.3,emissive:new THREE.Color('#ff7a2a'),emissiveIntensity:.12,flatShading:true}),
      glass:new THREE.MeshStandardMaterial({color:new THREE.Color('#000000'),metalness:.2,roughness:.18,emissive:new THREE.Color('#ff8a3a'),emissiveIntensity:.03}),
      glow:kitGlowMat('#ff9a40',2.6),
      shell:new THREE.MeshStandardMaterial({color:new THREE.Color('#18181b'),metalness:.8,roughness:.4,side:THREE.DoubleSide})}));
    const P=kitParts();
    // trup (8-hranný prierez → ostré hrany ako na predlohe)
    P.add(K.hull,kitLoft([{z:-2.9,w:.78,h:.4,hb:.34},{z:-2.1,w:1.0,h:.52,hb:.4},{z:-.6,w:1.12,h:.6,hb:.42},{z:.8,w:.98,h:.55,hb:.38},{z:1.9,w:.68,h:.42,hb:.3},{z:2.7,w:.4,h:.27,hb:.2},{z:3.35,w:.12,h:.09,hb:.07},{z:3.65,w:.02,h:.02}],{n:10,p:3}));
    // vrchné pancierové škrupiny (vrstvy nad trupom, každá kratšia a užšia)
    P.add(K.plate,kitLoft([{z:-.2,w:.9,h:.66,hb:.02},{z:1.0,w:.82,h:.6,hb:.02},{z:2.0,w:.55,h:.45,hb:.02},{z:2.85,w:.3,h:.29,hb:.02},{z:3.4,w:.06,h:.08,hb:.02}],{n:10,p:3.2}));
    P.add(K.plate,kitLoft([{z:-2.7,w:.62,h:.52,hb:.02},{z:-1.4,w:.75,h:.66,hb:.02},{z:-.3,w:.62,h:.66,hb:.02}],{n:10,p:3.2}));
    // medené šípy na nose a lem pancierov
    for(const z of[2.35,2.75,3.1])P.add(K.copper,kitSlab([[0,z+.12],[.22-(z-2.3)*.2,z-.12],[.15-(z-2.3)*.15,z-.2],[0,z-.02],[-.15+(z-2.3)*.15,z-.2],[-.22+(z-2.3)*.2,z-.12]],.03,{y:.36-(z-2.35)*.2,bev:.01}));
    // kokpit: veľké tmavé sklo + medený rám
    P.add(K.copper,kitLoft([{z:-.15,w:.24,h:.06,hb:.02,y:.6},{z:.2,w:.47,h:.2,hb:.02,y:.6},{z:1.1,w:.49,h:.22,hb:.02,y:.56},{z:1.65,w:.33,h:.13,hb:.02,y:.5},{z:1.95,w:.08,h:.04,y:.46}],{n:14,p:2.6}));
    P.add(K.glass,kitLoft([{z:-.05,w:.2,h:.11,hb:.02,y:.63},{z:.25,w:.41,h:.28,hb:.02,y:.63},{z:1.1,w:.43,h:.3,hb:.02,y:.58},{z:1.6,w:.27,h:.19,hb:.02,y:.53},{z:1.88,w:.05,h:.04,y:.49}],{n:16,p:2.4}));
    P.add(K.copper,box(.02,.05,1.6),{p:[0,.92,.85]});
    // chrbát za kokpitom: vyvýšený hrebeň s medeným rebrovaním a svietiacou štrbinou
    P.add(K.hull,box(.38,.22,2.3),{p:[0,.72,-1.4]});
    for(let i=0;i<9;i++)P.add(K.copper,box(.3,.04,.07),{p:[0,.85,-.45-i*.22]});
    P.add(K.glow,box(.06,.02,1.7),{p:[0,.87,-1.4]});
    for(const z of[-2.5,-.3])P.add(K.plate,box(.5,.08,.25),{p:[0,.86,z]});
    // ramenné bloky po stranách kokpitu (s medenými plátmi a priduchmi)
    P.add(K.plate,kitLoft([{z:-.9,w:.28,h:.3,hb:.25,x:1.0,y:.1},{z:-.2,w:.36,h:.38,hb:.28,x:1.05,y:.12},{z:.8,w:.32,h:.34,hb:.26,x:1.0,y:.1},{z:1.3,w:.12,h:.12,x:.92,y:.05}],{n:8,p:4}),{m:true});
    P.add(K.copper,kitSlab([[.85,.7],[1.2,.6],[1.25,-.5],[.85,-.65]],.04,{y:.5,bev:.015}),{m:true});
    for(const z of[.35,.15,-.05,-.25])P.add(K.glow,box(.2,.02,.05),{p:[1.05,.53,z],m:true});
    P.add(K.shell,box(.3,.24,.12),{p:[1.02,.08,1.25],m:true});   // nasávanie vzduchu
    // krídla: spodný plech + vrchný panel + medená nábežná hrana + koncové plutvy
    P.add(K.hull,kitSlab([[.85,-.25],[1.45,-.9],[3.25,-2.5],[3.35,-3.05],[2.4,-3.0],[1.6,-2.45],[.85,-2.55]],.16,{y:-.08,bev:.05}),{m:true});
    P.add(K.plate,kitSlab([[1.15,-.85],[2.85,-2.35],[2.5,-2.62],[1.65,-2.2],[1.15,-2.05]],.07,{y:.06,bev:.03}),{m:true});
    P.add(K.copper,kitSlab(kitRibbon([[.95,-.4],[3.25,-2.52]],()=>.045),.05,{y:.04,bev:.01}),{m:true});
    P.add(K.copper,kitSlab(kitRibbon([[1.4,-1.4],[2.55,-2.4]],()=>.025),.03,{y:.12,bev:0}),{m:true});
    P.add(K.plate,finGeo([[0,-2.1],[.55,-2.75],[.6,-3.15],[0,-3.05]],.07),{p:[3.25,.02,0],r:[0,0,HALF-.15],m:true});
    for(const z of[-1.6,-2.1])P.add(K.shell,new THREE.CylinderGeometry(.07,.07,.9,8),{p:[1.9+(-1.6-z)*.6,-.22,z],r:[HALF,0,0],m:true});   // rakety pod krídlami
    // dva kanóny po bokoch trupu
    P.add(K.shell,box(.22,.2,.9),{p:[1.0,-.12,.9],m:true});
    P.add(K.copper,new THREE.CylinderGeometry(.06,.07,1.6,8),{p:[1.0,-.12,1.9],r:[HALF,0,0],m:true});
    P.add(K.shell,new THREE.CylinderGeometry(.085,.085,.25,8),{p:[1.0,-.12,2.65],r:[HALF,0,0],m:true});
    // motorové gondoly + dve veľké dýzy
    P.add(K.hull,kitLoft([{z:-3.0,w:.5,h:.5,x:.55,y:0},{z:-2.2,w:.56,h:.56,x:.55,y:0},{z:-1.4,w:.4,h:.42,x:.5,y:.02}],{n:12,p:2.2}),{m:true});
    for(const z of[-2.95,-2.5])P.add(K.copper,new THREE.TorusGeometry(.53,.035,6,24),{p:[.55,0,z],m:true});
    for(const x of[-.55,.55])kitEngine(P,body,K.shell,K.copper,K.glow,x,0,-2.95,.42,'#ffc070',.7);
    P.done(body);
    for(const s of[-1,1]){const mz=glow('#ffb35a',.9,.8);mz.position.set(1.0*s,-.12,2.85);body.add(mz);
      const n=glow(s<0?'#ff6a4d':'#7ef2e2',1.3,1);n.position.set(3.32*s,.45,-3.05);body.add(n)}
    return {core:[0,.05,3.4],nose:[0,0,3.65],coreCol:'#ffd08a'}},

  /* BIZÓN (Bison): ťažký krížnik/ťahač – klinovitý čierny trup so svietiacimi modrými obvodmi (textúra), stupňovitá nadstavba
     s množstvom detailov, štyri veže, veliteľská veža s „okom“ vzadu, krídla s motorovými gondolami a žiariaci šesťhranný
     prieduch na prove. */
  bizon(body){
    const K=shipMats('bizon',()=>({
      hull:kitHullMat('bizH',{base:'#1a202d',vari:.25,line:'#0a0d13',circuit:'#4f7dff',circN:34,lit:['#86a8ff'],litP:.05,seed:31},{metalness:.7,roughness:.4,emissiveIntensity:2.4,flatShading:true}),
      deck:kitHullMat('bizD',{base:'#232a39',vari:.3,line:'#10141c',circuit:'#4f7dff',circN:10,lit:['#8fb0ff','#5f8bff'],litP:.1,seed:32},{metalness:.65,roughness:.5,emissiveIntensity:2,flatShading:true}),
      glow:kitGlowMat('#5f8bff',2.8),
      white:kitGlowMat('#cfe0ff',2.2),
      ring:new THREE.MeshStandardMaterial({color:new THREE.Color('#7d8799'),metalness:.9,roughness:.3,flatShading:true}),
      shell:new THREE.MeshStandardMaterial({color:new THREE.Color('#141821'),metalness:.8,roughness:.45,side:THREE.DoubleSide,flatShading:true})}));
    const P=kitParts();
    // hlavný klinovitý trup (8-hranný) + spodný kýl
    const hullSecs=[{z:-4.6,w:1.55,h:.55,hb:.5},{z:-4.0,w:1.9,h:.68,hb:.62},{z:-1.5,w:1.85,h:.68,hb:.6},{z:1.0,w:1.35,h:.55,hb:.5},{z:2.6,w:.9,h:.42,hb:.4},{z:3.3,w:.72,h:.36,hb:.34}];
    P.add(K.hull,kitLoft(hullSecs,{n:8,p:2.6}));
    P.add(K.hull,kitLoft([{z:-4.3,w:.9,h:.1,hb:.4,y:-.45},{z:-1,w:1.0,h:.1,hb:.45,y:-.45},{z:2.4,w:.45,h:.1,hb:.25,y:-.32}],{n:8,p:2.4}));
    // stupňovitá nadstavba (2 poschodia) + bočné pancierové pásy
    P.add(K.deck,kitLoft([{z:-4.35,w:1.1,h:.3,hb:.05,y:.55},{z:-1.0,w:1.15,h:.32,hb:.05,y:.55},{z:1.6,w:.7,h:.24,hb:.05,y:.46},{z:2.5,w:.3,h:.12,hb:.05,y:.38}],{n:8,p:3.4}));
    P.add(K.deck,kitLoft([{z:-4.1,w:.62,h:.26,hb:.05,y:.82},{z:-1.6,w:.6,h:.26,hb:.05,y:.82},{z:-.4,w:.25,h:.12,hb:.05,y:.8}],{n:8,p:3.4}));
    P.add(K.deck,box(.3,.06,6.5),{p:[1.45,.62,-1.2],r:[0,-.045,0],m:true});
    // drobné nadstavby (stovky detailov pri priblížení – zlúčené do jednej siete)
    const R=rng(77);
    for(let i=0;i<70;i++){const z=-4.0+R()*5.4,lim=z>1?.65:1.05,x=(R()*2-1)*lim,big=R()<.2,top=Math.abs(x)<.55&&z<-1.7&&z>-4?1.08:.86;
      P.add(R()<.85?K.deck:K.shell,box(.08+R()*(big?.35:.16),.05+R()*(big?.22:.1),.08+R()*(big?.5:.22)),{p:[x,top,z]})}
    for(let i=0;i<36;i++){const z=-3.8+R()*4.6,x=1.15+R()*.45;P.add(K.deck,box(.06+R()*.14,.04+R()*.08,.1+R()*.3),{p:[x,.62,z],m:true})}
    // štyri delové veže na palube
    for(const[x,z]of[[.72,.4],[.82,-1.2],[.75,-2.8]]){
      P.add(K.ring,new THREE.CylinderGeometry(.2,.24,.1,10),{p:[x,.92,z],m:true});
      P.add(K.deck,box(.26,.13,.3),{p:[x,1.02,z],m:true});
      for(const o of[-.06,.06])P.add(K.ring,new THREE.CylinderGeometry(.025,.025,.45,6),{p:[x+o,1.03,z+.35],r:[HALF,0,0],m:true})}
    // veliteľská veža s okrúhlou plošinou a svietiacim „okom“
    P.add(K.deck,kitLoft([{z:-3.6,w:.28,h:.5,hb:.1,y:1.2},{z:-3.0,w:.3,h:.55,hb:.1,y:1.2},{z:-2.6,w:.18,h:.35,hb:.1,y:1.15}],{n:8,p:3}));
    P.add(K.deck,new THREE.CylinderGeometry(.8,.62,.16,8),{p:[0,1.82,-3.2]});
    P.add(K.glow,new THREE.CylinderGeometry(.81,.81,.035,8,1,true),{p:[0,1.84,-3.2]});
    P.add(K.deck,new THREE.CylinderGeometry(.42,.55,.2,8),{p:[0,2.0,-3.2]});
    P.add(K.ring,new THREE.CylinderGeometry(.18,.3,.22,8),{p:[0,2.2,-3.2]});
    P.add(K.white,kitSlab([[0,.12],[.17,0],[0,-.12],[-.17,0]],.03,{bev:.01}),{p:[0,2.22,-2.92],r:[HALF,0,0]});
    P.add(K.ring,new THREE.CylinderGeometry(.012,.012,.6,4),{p:[.15,2.5,-3.35]});
    // krídla vzadu s motorovými gondolami na koncoch
    P.add(K.hull,kitSlab([[1.5,-2.5],[2.85,-3.15],[2.95,-4.1],[1.6,-4.35]],.2,{y:.05,bev:.05}),{m:true});
    P.add(K.deck,kitSlab([[1.7,-2.9],[2.6,-3.35],[2.65,-3.9],[1.75,-4.05]],.06,{y:.17,bev:.02}),{m:true});
    P.add(K.hull,kitLoft([{z:-4.45,w:.32,h:.3,x:3.0,y:.08},{z:-3.0,w:.36,h:.34,x:3.0,y:.08},{z:-2.55,w:.24,h:.22,x:3.0,y:.08}],{n:8,p:2.6}),{m:true});
    P.add(K.glow,new THREE.CircleGeometry(.17,12),{p:[3.0,.08,-2.53],m:true});
    for(let i=0;i<4;i++)P.add(K.glow,box(.035,.05,.16),{p:[1.9+i*.25,.2,-3.2-i*.12],r:[0,-.4,0],m:true});
    kitEngine(P,body,K.shell,K.ring,K.glow,3.0,.08,-4.45,.24,'#7f9cff',.45);kitEngine(P,body,K.shell,K.ring,K.glow,-3.0,.08,-4.45,.24,'#7f9cff',.45);
    // hlavné motory vzadu
    P.add(K.deck,box(2.6,.95,.5),{p:[0,0,-4.55]});
    for(const[x,y,r]of[[-.62,.05,.42],[.62,.05,.42],[-1.38,-.05,.3],[1.38,-.05,.3]])kitEngine(P,body,K.shell,K.ring,K.glow,x,y,-4.8,r,'#7f9cff',.6);
    // prova: šesťhranný žiariaci prieduch s mriežkou
    P.add(K.ring,new THREE.CylinderGeometry(.33,.38,.24,6,1,true),{p:[0,0,3.36],r:[HALF,0,0],s:[1.55,1,.85]});
    P.add(K.glow,new THREE.CircleGeometry(.33,6),{p:[0,0,3.31],s:[1.55,.85,1]});
    for(const x of[-.26,0,.26])P.add(K.shell,box(.035,.5,.035),{p:[x,0,3.4]});
    P.add(K.shell,box(.9,.035,.035),{p:[0,0,3.4]});
    // rady okien po bokoch trupu + okrúhle bočné svetlá
    for(let i=0;i<12;i++){const z=-3.6+i*.5,f=(z+4.6)/7.9,w=z<-1.5?1.86:z<1?1.86-(z+1.5)/2.5*.5:1.35-(z-1)/1.6*.45;
      P.add(K.white,box(.04,.05,.18),{p:[w*.97,.08,z],r:[0,0,0],m:true})}
    for(const[x,z]of[[1.86,-1.0],[1.5,.8]]){P.add(K.ring,new THREE.TorusGeometry(.15,.04,6,16),{p:[x,.15,z],r:[0,HALF,0],m:true});P.add(K.glow,new THREE.CircleGeometry(.12,14),{p:[x+.02,.15,z],r:[0,HALF,0]});P.add(K.glow,new THREE.CircleGeometry(.12,14),{p:[-x-.02,.15,z],r:[0,-HALF,0]})}
    P.done(body);
    const eye=glow('#9fc0ff',1.6,.9);eye.position.set(0,2.22,-2.85);body.add(eye);
    const bow=glow('#6f95ff',2.0,.8);bow.position.set(0,0,3.45);body.add(bow);
    for(const s of[-1,1]){for(const[x,z]of[[1.95,-1.0],[1.58,.8]]){const g=glow('#7fa2ff',.9,.9);g.position.set(x*s,.15,z);body.add(g)}
      const pod=glow('#8fb0ff',1.4,.9);pod.position.set(3.0*s,.08,-2.45);body.add(pod);
      const n=glow(s<0?'#ff6a4d':'#7ef2e2',1.3,1);n.position.set(3.0*s,.45,-3.6);body.add(n)}
    return {core:[0,0,3.6],nose:[0,0,3.65],coreCol:'#a9c0ff'}},
};
/* v0.50: materiál štítovej bubliny (loď aj stanica) */
function shieldBubbleMat(col){return new THREE.ShaderMaterial({uniforms:{c:{value:new THREE.Color(col)},o:{value:0},uT:{value:0},uImp:{value:[0,1,2,3].map(()=>new THREE.Vector4(0,1,0,-99))}},
    vertexShader:'varying vec3 vN;varying vec3 vV;varying vec3 vP;void main(){vP=position;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
    fragmentShader:`uniform vec3 c;uniform float o,uT;uniform vec4 uImp[4];varying vec3 vN;varying vec3 vV;varying vec3 vP;
void main(){float f=pow(1.-abs(dot(vN,vV)),2.2);vec3 d=normalize(vP);float im=0.;
  for(int i=0;i<4;i++){float age=uT-uImp[i].w;if(age<0.||age>.75)continue;float a=acos(clamp(dot(d,normalize(uImp[i].xyz)),-1.,1.));float fade=1.-age/.75;
    im+=exp(-a*a/.07)*fade*1.4+exp(-pow(a-age*1.7,2.)/.01)*fade*1.1;}
  gl_FragColor=vec4(c*(f*1.7+.06)*o+mix(c,vec3(1.),.45)*im*(.6+f),1.);}`,
    transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})}
function buildShip(id){
  if(!SHIP_MODELS[id])id='klepeto';
  while(ship.children.length)ship.remove(ship.children[0]);
  const body=new THREE.Group();ship.add(body);ship.userData.body=body;ship.userData.eng=[];
  const info=SHIP_MODELS[id](body);glbApply('ship.'+id,body);NOSE.set(...info.nose);   /* v0.40: vlastný model z js/models.js */
  const cg=glow(info.coreCol,3.2,.85);cg.position.set(...info.core);body.add(cg);ship.userData.core=cg;
  if(info.coreMesh){const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.3,1),M.hullGlow);core.position.set(...info.core);body.add(core)}
  const halo=glow(SHIPS[id].col,10,.16);halo.position.y=-.5;ship.add(halo);
  /* v0.49: ŠTÍTOVÁ BUBLINA – elipsoid okolo celého modelu (rozmer z obalu lode + rezerva), takže nepresekáva loď.
     Viditeľná len pri úbytku alebo dobíjaní štítu (main.js); zásah do štítu (strela, asteroid) vytvorí na mieste dopadu
     záblesk s rozbiehajúcou sa vlnou (shieldImpact – až 4 naraz, uniform uImp = smer v súradniciach bubliny + čas). */
  const bm=shieldBubbleMat('#5aa9ff');
  const bubble=new THREE.Mesh(new THREE.SphereGeometry(1,40,24),bm);
  {const ms=[];body.traverse(o=>{if(o.isMesh&&o.visible)ms.push(o)});const B=_glbBox(ship,ms),sz=B.getSize(new V3()),c=B.getCenter(new V3());
    const rx=sz.x/2*1.22+.5,rz=sz.z/2*1.18+.5,ry=Math.max(sz.y/2*1.5+.4,Math.max(rx,rz)*.5);bubble.scale.set(rx,ry,rz);bubble.position.copy(c)}
  ship.add(bubble);ship.userData.bubble=bubble;
  ship.scale.setScalar(SHIPS[id].scale||1.1)}
/* zásah do štítu v bode p (svet): záblesk na bubline v smere dopadu */
let _impI=0;
function shieldImpact(p){const B=ship.userData.bubble;if(!B||!p)return;const L=ship.worldToLocal(p.clone()).sub(B.position).divide(B.scale);if(L.lengthSq()<1e-6)L.set(0,0,1);L.normalize();L.y=Math.max(L.y,.5);L.normalize();   // zdvihnúť na hornú (viditeľnú) stranu bubliny
  const U=B.material.uniforms;U.uImp.value[_impI].set(L.x,L.y,L.z,U.uT.value);_impI=(_impI+1)%4}
buildShip('klepeto');
scene.add(ship);
const shipVel=new V3();let shipYaw=0;

/* NOSE = bod na lodi (medzi klepetami), z ktorého vychádza ťažobný laser. */
/* laser beam */
const CYL=new THREE.CylinderGeometry(1,1,1,8,1,true);
function makeBeam(color){const g=new THREE.Group();
  const core=new THREE.Mesh(CYL,new THREE.MeshBasicMaterial({color:new THREE.Color('#ffffff'),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.95}));
  const outer=new THREE.Mesh(CYL,new THREE.MeshBasicMaterial({color:new THREE.Color(color),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.35}));
  g.add(core,outer);g.userData={core,outer};const hit=glow(color,4,.9);g.userData.hit=hit;scene.add(hit);g.visible=false;hit.visible=false;scene.add(g);return g}
const beam=makeBeam('#58d0c0');
const UP_=new V3(0,1,0),_d=new V3(),_m=new V3();
function setBeam(b,a,c,w,color){_d.subVectors(c,a);const len=_d.length();_m.addVectors(a,c).multiplyScalar(.5);b.position.copy(_m);
  b.quaternion.setFromUnitVectors(UP_,_d.normalize());b.userData.core.scale.set(w*.35,len,w*.35);b.userData.outer.scale.set(w,len,w);
  if(color){b.userData.outer.material.color.set(color);b.userData.hit.material.color.set(color)}
  b.userData.hit.position.copy(c);b.visible=true;b.userData.hit.visible=true}
function hideBeam(b){b.visible=false;b.userData.hit.visible=false}

/* Častice: pool = vopred pripravená zásoba svietiacich bodov (trail = stopa motorov, debris = úlomky a iskry). */
/* particles */
const _zero=new V3();
function pool(n,size){const arr=[];for(let i=0;i<n;i++){const s=glow('#ffffff',size,0);s.visible=false;scene.add(s);arr.push({s,life:0,max:1,v:new V3(),from:new V3(),to:null,size})}return arr}
const trail=pool(90,1.6),debris=pool(110,.9);
function emit(p,pos,color,life,vel,to){if(typeof gfxFx==='function'&&Math.random()>gfxFx())return;   // menej častíc pri nižšej grafike
  const it=p.find(x=>x.life<=0);if(!it)return;it.s.visible=true;it.s.position.copy(pos);it.from.copy(pos);it.s.material.color.set(color);
  it.life=it.max=life;it.v.copy(vel||_zero);it.to=to||null}
function tickPool(p,dt){for(const it of p){if(it.life<=0)continue;it.life-=dt;const k=clamp(it.life/it.max,0,1);
  if(it.to){it.s.position.lerpVectors(it.to,it.from,k*k)}else it.s.position.addScaledVector(it.v,dt);
  it.s.material.opacity=k*.9;const sc=it.size*(it.to?1:(.4+k*.8));it.s.scale.set(sc,sc,1);if(it.life<=0)it.s.visible=false}}

const marker=new THREE.Mesh(new THREE.RingGeometry(1.1,1.3,40),new THREE.MeshBasicMaterial({color:new THREE.Color('#58d0c0'),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
marker.rotation.x=-Math.PI/2;scene.add(marker);let markerT=0;
const tRing=new THREE.Mesh(new THREE.RingGeometry(1,1.08,48,1,0,TAU*.82),new THREE.MeshBasicMaterial({color:new THREE.Color('#58d0c0'),transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
tRing.rotation.x=-Math.PI/2;tRing.visible=false;scene.add(tRing);

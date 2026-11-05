'use strict';
/* ==================== v0.30: FANART HLAVNÉHO MENU ====================
   Živá 3D scéna za hlavným menu: všetky tri lode (Bizón, Sokol, Pincer) letia v zostave okolo planéty s diskom.
   Kreslí sa tým istým rendererom ako hra, ale v 2 vrstvách: 1) pozadie (scéna s planétou, vlastná kamera),
   2) lode (vlastná scéna, svetlá a kamera). Kým je otvorené hlavné menu, svet hry sa nekreslí ani nepočíta (main.js). */
let menuArt=null;
/* Samostatný model lode (bez globálnej lode hráča); motory sa zbierajú do vlastného zoznamu. */
function menuShipModel(id){const g=new THREE.Group(),body=new THREE.Group();g.add(body);
  const keep=ship.userData.eng;ship.userData.eng=[];const info=SHIP_MODELS[id](body);const eng=ship.userData.eng;ship.userData.eng=keep;
  const cg=glow(info.coreCol,2.8,.85);cg.position.set(...info.core);body.add(cg);
  if(info.coreMesh){const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.3,1),M.hullGlow);core.position.set(...info.core);body.add(core)}
  // plameň za každým motorom: kužeľ s aditívnym priechodom, ktorý sa smerom dozadu stráca
  const plumes=[];for(const e of eng){const c=e.material.color.clone();
    const m=new THREE.ShaderMaterial({uniforms:{c:{value:c},k:{value:1}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
      vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform vec3 c;uniform float k;varying vec2 vU;void main(){float a=pow(vU.y,2.2)*k;gl_FragColor=vec4(mix(c,vec3(1.),vU.y*vU.y*.6)*a,1.);}'});
    const r=e.scale.x*.11,L=r*9;const p=new THREE.Mesh(new THREE.ConeGeometry(r,L,16,1,true),m);p.rotation.x=-Math.PI/2;p.position.copy(e.position);p.position.z-=L/2;body.add(p);plumes.push({p,m,L})}
  g.scale.setScalar(SHIPS[id].scale||1.1);return{g,body,eng,plumes}}

function buildMenuArt(){
  // --- vrstva 1: pozadie s planétou a diskom (rovnaká scéna ako sektor 1) ---
  const bg=new THREE.Scene();bg.background=new THREE.Color('#020306');const bgTick=buildDiskBg(bg);
  const P=new V3(...BG_DISK.planet),k=BG_DISK.R/150;
  const bgCam=new THREE.PerspectiveCamera(40,1,1,8000);
  // --- vrstva 2: lode ---
  const fg=new THREE.Scene();
  fg.add(new THREE.HemisphereLight(col('#8fb0e0'),col('#1a0c12'),.55));
  const sun=new THREE.DirectionalLight(col('#ffd2a0'),2.4);sun.position.set(-30,14,-10);fg.add(sun);    // teplé svetlo od planéty
  const rim=new THREE.DirectionalLight(col('#5ab0ff'),1.4);rim.position.set(20,10,-30);fg.add(rim);      // studený obrys zozadu
  const fill=new THREE.DirectionalLight(col('#c9d6ff'),.5);fill.position.set(10,20,30);fg.add(fill);
  const cam=new THREE.PerspectiveCamera(34,1,.1,500);
  // zostava: Bizón vzadu (veľký, pomalý), Sokol vpredu vpravo v náklone, Pincer najbližšie
  const S={bizon:menuShipModel('bizon'),sokol:menuShipModel('sokol'),klepeto:menuShipModel('klepeto')};
  for(const id in S)fg.add(S[id].g);
  // hviezdny prach letiaci okolo lodí (dojem rýchlosti)
  const N=260,pos=new Float32Array(N*3);for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*90;pos[i*3+1]=(Math.random()-.5)*50;pos[i*3+2]=-60+Math.random()*90}
  const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const dust=new THREE.Points(dg,new THREE.PointsMaterial({color:col('#9fc4ff'),size:.12,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending}));fg.add(dust);
  menuArt={bg,bgTick,bgCam,P,k,fg,cam,S,dust,pos,N,t:0};return menuArt}

/* Rozmiestnenie podľa tvaru obrazovky: na šírku sú lode vpravo (vľavo je menu), na výšku hore nad menu. */
function menuArtLayout(w,h){const A=menuArt,wide=w/h>1.15;
  A.cam.aspect=w/h;A.cam.fov=wide?34:52;A.cam.updateProjectionMatrix();A.bgCam.aspect=w/h;A.bgCam.updateProjectionMatrix();
  A.wide=wide;A.ox=wide?7.5:-.4;A.oy=wide?0:5;A.sx=wide?1:.55;A.sy=wide?1:1.15;A.dz=wide?0:-8;A.ly=wide?.5:-3.5}   // ly = výška bodu, kam pozerá kamera   // sx = zúženie zostavy na výšku

/* Jeden snímok menu: pohyb lodí (jemné vlnenie, náklony), prach, plamene, pomalý pohyb kamery. */
function menuArtFrame(dt,tt){const A=menuArt||buildMenuArt();A.t+=dt;const t=A.t;
  const w=innerWidth,h=innerHeight;if(A.w!==w||A.h!==h){A.w=w;A.h=h;menuArtLayout(w,h)}
  // pozadie: kamera ako na náhľade sektora, veľmi pomaly krúži
  const k=A.k,a=Math.sin(t*.03)*.06;A.bgCam.position.copy(A.P).add(new V3(380*k*Math.cos(a)-120*k,820*k,620*k+Math.sin(a)*200*k));
  A.bgCam.lookAt(A.P.x+(A.wide?-40:60)*k,A.P.y,A.P.z+90*k);if(A.bgTick)A.bgTick(dt,tt);
  // lode: letia k divákovi (pohľad spredu zboku ako na výstave), zostava po diagonále, každá s vlastným vlnením
  const ox=A.ox,oy=A.oy;
  const place=(s,x,y,z,yaw,roll,ph)=>{s.g.position.set(ox+x*A.sx+Math.sin(t*.5+ph)*.35,oy+y*A.sy+Math.sin(t*.7+ph)*.45,z+A.dz+Math.cos(t*.4+ph)*.3);
    s.g.rotation.set(-.12+Math.sin(t*.6+ph)*.03,yaw+Math.sin(t*.3+ph)*.03,roll+Math.sin(t*.45+ph)*.05,'YXZ');
    const f=1+Math.sin(t*14+ph)*.08;for(const e of s.eng)e.scale.set(2.6*f,2.6*f,1);for(const q of s.plumes)q.m.uniforms.k.value=.85+Math.sin(t*19+ph)*.15};
  place(A.S.bizon,3,4.5,-30,-.5,-.05,0);   // yaw: pri 0 mieri nos lode na +z (k divákovi), záporný = mierne doľava k menu
  place(A.S.sokol,9,-.2,-13,-.72,.3,1.7);
  place(A.S.klepeto,-.6,-2.3,1,-.78,-.16,3.1);
  // prach letí proti smeru lodí (lode letia k divákovi a mierne doľava)
  const P=A.pos;for(let i=0;i<A.N;i++){P[i*3]+=dt*6;P[i*3+2]-=dt*12;if(P[i*3]>45||P[i*3+2]<-60){P[i*3]=-45+Math.random()*30;P[i*3+2]=-30+Math.random()*60;P[i*3+1]=(Math.random()-.5)*50}}
  A.dust.geometry.attributes.position.needsUpdate=true;
  A.cam.position.set(Math.sin(t*.07)*1.2,6+Math.sin(t*.05)*.6,24);A.cam.lookAt(ox*.55,A.ly,-6);
  renderer.autoClear=true;renderer.render(A.bg,A.bgCam);renderer.autoClear=false;renderer.clearDepth();renderer.render(A.fg,A.cam);renderer.autoClear=true}

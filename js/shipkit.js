'use strict';
/* ==================== == 5a. KIT NA DETAILNÉ MODELY LODÍ (v0.17) ====================
   Pomocné funkcie, z ktorých sa skladajú modely lodí v ship.js. Všetko sa generuje v kóde (žiadne externé súbory):
   - kitLoft(sekcie)    = trup „natiahnutý“ cez priečne rezy (ako rebrá lode) → hladké alebo hranaté zúžené tvary
   - kitSlab(obrys,hr.) = plochý plech podľa 2D obrysu (pohľad zhora) so skosenými hranami → krídla, pancier, čepele
   - kitRibbon/kitBez   = obrys zakrivenej čepele pozdĺž krivky (klepetá, ostne)
   - kitParts()         = zberač dielov: diely s rovnakým materiálom zlúči do jednej siete (menej volaní kreslenia = plynulejšie)
   - kitPanels()        = procedurálna textúra plechov (farba + reliéf drážok + svetielka/obvody), 1024 px, generuje sa raz
   Súradnice: x = doprava, y = hore, z = dopredu (nos lode). Jednotka ≈ 1 m modelu pred násobkom SHIPS[id].scale. */
const KIT_UV=.16;   // hustota textúry: 1 dlaždica textúry ≈ 1/KIT_UV ≈ 6 jednotiek trupu

/* Trup cez priečne rezy. Rez = {z, w (pol-šírka), h (výška hore), hb (výška dole, predvolene h), x, y (stred), p (tvar)}.
   p = exponent superelipsy: 2 = elipsa, 3–4 = zaoblený obdĺžnik, 1 = kosoštvorec. Rezy musia ísť od zadu (menšie z) dopredu.
   o.n = počet bodov po obvode (8 = hranatý pancierový vzhľad, 20+ = hladký). Konce sa uzavrú. */
function kitLoft(secs,o={}){const n=o.n||16,ring=n+1,pos=[],uv=[],idx=[];
  for(const S of secs){const e=2/(S.p||o.p||2);let L=0,px=null,py=null;
    for(let i=0;i<=n;i++){const a=-Math.PI/2+i/n*TAU,c=Math.cos(a),s=Math.sin(a);
      const x=(S.x||0)+S.w*Math.sign(c)*Math.pow(Math.abs(c),e);
      const y=(S.y||0)+(s>=0?S.h:(S.hb!=null?S.hb:S.h))*Math.sign(s)*Math.pow(Math.abs(s),e);
      if(px!==null)L+=Math.hypot(x-px,y-py);px=x;py=y;pos.push(x,y,S.z);uv.push(L*KIT_UV,S.z*KIT_UV)}}
  for(let j=0;j<secs.length-1;j++)for(let i=0;i<n;i++){const a=j*ring+i,b=a+1,c=a+ring,d=c+1;idx.push(a,b,c,b,d,c)}
  // uzávery (stred rezu + vejár trojuholníkov): zadný smeruje dozadu, predný dopredu
  for(const[j,front]of[[0,false],[secs.length-1,true]]){const S=secs[j],ci=pos.length/3;pos.push(S.x||0,S.y||0,S.z);uv.push(0,0);
    for(let i=0;i<n;i++){const a=j*ring+i;if(front)idx.push(ci,a,a+1);else idx.push(ci,a+1,a)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);g.computeVertexNormals();return g}

/* Plech podľa obrysu zhora: pts = [[x,z],…], th = hrúbka, o.bev = skosenie hrán, o.y = výška stredu. */
function kitSlab(pts,th,o={}){const sh=new THREE.Shape();pts.forEach(([x,z],i)=>i?sh.lineTo(x,-z):sh.moveTo(x,-z));
  const bv=o.bev!=null?o.bev:Math.min(.07,th*.35);
  const g=new THREE.ExtrudeGeometry(sh,{depth:th,bevelEnabled:bv>0,bevelThickness:bv,bevelSize:bv,bevelSegments:o.bs||1,curveSegments:4});
  g.rotateX(-Math.PI/2);g.translate(0,-th/2+(o.y||0),0);
  const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*KIT_UV,uv.getY(i)*KIT_UV);return g}

/* Body kubickej Bézierovej krivky v rovine XZ (p0..p3 = [x,z]) */
function kitBez(p0,p1,p2,p3,n=16){const r=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;
  r.push([u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]])}return r}
/* Obrys čepele pozdĺž krivky: šírka sa mení podľa wf(t) (t = 0 začiatok … 1 koniec), off posunie čepeľ do strany */
function kitRibbon(path,wf,off=0){const L=[],R=[],n=path.length;
  for(let i=0;i<n;i++){const a=path[Math.max(0,i-1)],b=path[Math.min(n-1,i+1)];let tx=b[0]-a[0],tz=b[1]-a[1];const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;
    const nx=-tz,nz=tx,w=wf(i/(n-1)),p=path[i];L.push([p[0]+nx*(off+w),p[1]+nz*(off+w)]);R.push([p[0]+nx*(off-w),p[1]+nz*(off-w)])}
  return L.concat(R.reverse())}
/* bod a smer (uhol okolo osi y) na krivke v pomere t – na osadenie detailov pozdĺž čepele */
function kitAlong(path,t){const f=t*(path.length-1),i=Math.min(path.length-2,Math.floor(f)),k=f-i,a=path[i],b=path[i+1];
  return{x:a[0]+(b[0]-a[0])*k,z:a[1]+(b[1]-a[1])*k,ry:Math.atan2(b[0]-a[0],b[1]-a[1])}}

/* Zberač dielov. add(materiál, geometria, {p:[x,y,z], r:[rx,ry,rz], s:[sx,sy,sz] alebo číslo, m:true = aj zrkadlová kópia x→-x}).
   done(body) vytvorí jednu sieť na materiál. Zrkadlenie otočí poradie vrcholov, aby plochy nesmerovali dovnútra. */
const _kq=new THREE.Quaternion(),_ke=new THREE.Euler(),_km=new THREE.Matrix4(),_kmm=new THREE.Matrix4();
function kitParts(){const bins=new Map();
  function put(mat,g){if(!bins.has(mat))bins.set(mat,[]);bins.get(mat).push(g)}
  function xf(g0,t,mirror){let g=g0.index?g0.toNonIndexed():g0.clone();const s=t.s==null?[1,1,1]:typeof t.s==='number'?[t.s,t.s,t.s]:t.s;
    _ke.set(...(t.r||[0,0,0]));_kq.setFromEuler(_ke);_km.compose(new V3(...(t.p||[0,0,0])),_kq,new V3(...s));
    if(mirror){_kmm.makeScale(-1,1,1);_km.premultiply(_kmm)}g.applyMatrix4(_km);
    if(_km.determinant()<0){const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv;
      for(let i=0;i<P.count;i+=3)for(const A of[P,N,U]){if(!A)continue;for(let c=0;c<A.itemSize;c++){const v=A.array[(i+1)*A.itemSize+c];A.array[(i+1)*A.itemSize+c]=A.array[(i+2)*A.itemSize+c];A.array[(i+2)*A.itemSize+c]=v}}}
    if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));return g}
  return{add(mat,g,t={}){put(mat,xf(g,t,false));if(t.m)put(mat,xf(g,t,true));return this},
    done(body){for(const[mat,list]of bins){let n=0;for(const g of list)n+=g.attributes.position.count;
        const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2);let o=0;
        for(const g of list){const c=g.attributes.position.count;P.set(g.attributes.position.array,o*3);
          if(!g.attributes.normal)g.computeVertexNormals();N.set(g.attributes.normal.array,o*3);U.set(g.attributes.uv.array,o*2);o+=c}
        const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('normal',new THREE.BufferAttribute(N,3));
        G.setAttribute('uv',new THREE.BufferAttribute(U,2));G.computeBoundingSphere();body.add(new THREE.Mesh(G,mat))}}}}

/* ---------- procedurálne textúry plechov ----------
   o = {base (farba plechu), vari (rozptyl odtieňa), line (farba drážok), lit:[farby svetielok], litP (šanca), trim (farba lemovania),
        trimP, circuit (farba svietiacich obvodov), circN (počet obvodov), seed}. Vráti {map, bump, emis} textúry (cache podľa kľúča). */
const _kitTex={};
function _hex(c){const x=new THREE.Color(c);return[x.r*255,x.g*255,x.b*255]}
const _rgb=(a,k)=>`rgb(${a.map(v=>Math.max(0,Math.min(255,Math.round(v*k)))).join(',')})`;
function kitPanels(key,o){if(_kitTex[key])return _kitTex[key];const S=1024,r=rng(o.seed||7);
  const mk=()=>{const c=document.createElement('canvas');c.width=c.height=S;return c};
  const cm=mk(),cb=mk(),ce=mk(),m=cm.getContext('2d'),b=cb.getContext('2d'),e=ce.getContext('2d');
  const base=_hex(o.base),line=o.line||_rgb(base,.45);
  m.fillStyle=_rgb(base,1);m.fillRect(0,0,S,S);b.fillStyle='#808080';b.fillRect(0,0,S,S);e.fillStyle='#000';e.fillRect(0,0,S,S);
  // jemný šum povrchu (opotrebenie)
  for(let i=0;i<5000;i++){const x=r()*S,y=r()*S,k=.9+r()*.2;m.fillStyle=_rgb(base,k);m.fillRect(x,y,1+r()*3,1+r()*3)}
  // panel = jedna platňa: odtieň, drážka okolo, niekedy vnútorný rám, nity, svetielko alebo lem
  function panel(x,y,w,h){const k=1+(r()-.5)*(o.vari||.18);m.fillStyle=_rgb(base,k);m.fillRect(x+2,y+2,w-4,h-4);
    const bh=128+Math.round((r()-.5)*36);b.fillStyle=`rgb(${bh},${bh},${bh})`;b.fillRect(x+2,y+2,w-4,h-4);
    m.strokeStyle=line;m.lineWidth=2.5;m.strokeRect(x+1.5,y+1.5,w-3,h-3);b.strokeStyle='#1a1a1a';b.lineWidth=3;b.strokeRect(x+1.5,y+1.5,w-3,h-3);
    if(w>50&&h>50&&r()<.35){const i=8+r()*10;b.strokeStyle='#5a5a5a';b.lineWidth=2;b.strokeRect(x+i,y+i,w-2*i,h-2*i);m.strokeStyle=_rgb(base,.8);m.lineWidth=1;m.strokeRect(x+i,y+i,w-2*i,h-2*i)}
    if(r()<.4){m.fillStyle=_rgb(base,.6);b.fillStyle='#d0d0d0';for(const[cx,cy]of[[x+6,y+6],[x+w-6,y+6],[x+6,y+h-6],[x+w-6,y+h-6]]){m.fillRect(cx-1.5,cy-1.5,3,3);b.fillRect(cx-1.5,cy-1.5,3,3)}}
    if(o.lit&&r()<(o.litP||.1)&&w>24&&h>14){const c=o.lit[Math.floor(r()*o.lit.length)];const lw=Math.min(w-12,20+r()*50),lh=Math.min(h-10,4+r()*6);
      const lx=x+6+r()*(w-12-lw),ly=y+5+r()*(h-10-lh);e.fillStyle=c;e.fillRect(lx,ly,lw,lh);m.fillStyle=c;m.fillRect(lx,ly,lw,lh);b.fillStyle='#606060';b.fillRect(lx,ly,lw,lh)}
    if(o.trim&&r()<(o.trimP||.15)){m.fillStyle=o.trim;const v=r()<.5;if(v)m.fillRect(x+4,y+4,3,h-8);else m.fillRect(x+4,y+4,w-8,3);
      if(o.trimGlow){e.fillStyle=o.trimGlow;if(v)e.fillRect(x+4,y+4,3,h-8);else e.fillRect(x+4,y+4,w-8,3)}}}
  // rekurzívne delenie plochy na platne rôznych veľkostí (veľké pláty + drobné servisné panely)
  function split(x,y,w,h,d){if(d>6||(w<40&&h<40)||(d>2&&r()<.22)){panel(x,y,w,h);return}
    if(w>h*(.7+r()*.6)){const k=Math.round(w*(.25+r()*.5));split(x,y,k,h,d+1);split(x+k,y,w-k,h,d+1)}
    else{const k=Math.round(h*(.25+r()*.5));split(x,y,w,k,d+1);split(x,y+k,w,h-k,d+1)}}
  split(0,0,S,S,0);
  // svietiace obvody (Bizón): lomené čiary po 45° / 90°, so žiarou
  if(o.circuit){for(let i=0;i<(o.circN||26);i++){let x=r()*S,y=r()*S,dir=Math.floor(r()*8);const pts=[[x,y]];
      for(let s=0;s<3+r()*6;s++){const L=30+r()*140;x+=Math.round(Math.cos(dir*Math.PI/4))*L;y+=Math.round(Math.sin(dir*Math.PI/4))*L;pts.push([x,y]);dir=(dir+(r()<.5?1:7)+(r()<.3?1:0))%8}
      const wdt=r()<.25?5:2.5;
      for(const[ctx,col,w,blur]of[[e,o.circuit,wdt,14],[e,'#ffffff',wdt*.35,0],[m,o.circuit,wdt,0],[b,'#404040',wdt+2,0]]){ctx.save();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.shadowColor=col;ctx.shadowBlur=blur;ctx.lineJoin='round';
        // kreslí aj posunuté kópie, aby sa čiara prenášala cez okraj dlaždice (bez viditeľného švu)
        for(const[dx,dy]of[[0,0],[S,0],[-S,0],[0,S],[0,-S]]){ctx.beginPath();pts.forEach(([px,py],j)=>j?ctx.lineTo(px+dx,py+dy):ctx.moveTo(px+dx,py+dy));ctx.stroke()}ctx.restore()}
      const[ex,ey]=pts[pts.length-1];e.fillStyle=o.circuit;e.beginPath();e.arc(((ex%S)+S)%S,((ey%S)+S)%S,5,0,TAU);e.fill()}}
  const tex=(c,srgb)=>{const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(srgb)t.encoding=THREE.sRGBEncoding;
    t.anisotropy=Math.min(8,typeof renderer!=='undefined'&&renderer.capabilities?renderer.capabilities.getMaxAnisotropy():1);return t};
  return _kitTex[key]={map:tex(cm,true),bump:tex(cb,false),emis:tex(ce,true)}}
/* materiál trupu s textúrou plechov; o.mat = vlastnosti MeshStandardMaterial (metalness, roughness, emissiveIntensity …) */
function kitHullMat(key,o,mat={}){const T=kitPanels(key,o);
  return new THREE.MeshStandardMaterial(Object.assign({color:new THREE.Color('#ffffff'),map:T.map,bumpMap:T.bump,bumpScale:.035,
    emissive:new THREE.Color('#ffffff'),emissiveMap:T.emis,emissiveIntensity:1.4,metalness:.55,roughness:.45},mat))}
/* jednoduchý svietiaci materiál (žiariace prvky: priduchy, okná, dýzy) */
const kitGlowMat=(c,k=2)=>new THREE.MeshStandardMaterial({color:new THREE.Color('#000000'),emissive:new THREE.Color(c),emissiveIntensity:k});

/* Motor: dýza (kužeľový plášť) + vnútorný žiariaci disk + prstenec + svetelný bod (sprite), ktorý control.js zväčšuje podľa ťahu */
function kitEngine(P,body,matShell,matRing,matGlow,x,y,z,r,color,len=1){
  P.add(matShell,new THREE.CylinderGeometry(r*.92,r*1.08,len,18,1,true),{p:[x,y,z-len/2],r:[Math.PI/2,0,0]});
  P.add(matShell,new THREE.CylinderGeometry(r*.78,r*.92,len*.25,18,1,true),{p:[x,y,z-len+len*.02],r:[-Math.PI/2,0,0]});   // vnútorná stena
  P.add(matRing,new THREE.TorusGeometry(r*1.02,r*.1,6,20),{p:[x,y,z-len]});
  P.add(matRing,new THREE.TorusGeometry(r*1.04,r*.07,6,20),{p:[x,y,z-len*.45]});
  P.add(matGlow,new THREE.CircleGeometry(r*.8,18),{p:[x,y,z-len*.8],r:[0,Math.PI,0]});
  const g=glow(color,2.2*r/.46,.9);g.position.set(x,y,z-len-.1);body.add(g);ship.userData.eng.push(g)}

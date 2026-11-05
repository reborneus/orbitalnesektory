'use strict';
/* ==================== v0.31: MINERÁLY (ASTEROIDY) VO VYSOKOM ROZLÍŠENÍ ====================
   Podľa predlohy: tmavý kameň s veľkými štiepnymi plochami (rovné „odseknuté“ steny), drsný povrch
   a svietiace žily v farbe suroviny (ruda = oranžová, viridit = zelená, kryštály = fialová, relikt = zlatá,
   zmiešaný = všetky tri). Tvar = jemne delená guľa, ktorú „odseknú“ náhodné roviny a zvlní šum.
   Detail povrchu (drsnosť, žily, iskričky, vnútorný svit) počíta shader – nepotrebuje žiadne obrázky. */
const MIN_COL={ore:'#ff8a2a',green:'#6fe04a',crystal:'#9d6bff',relic:'#ffcf5a',mix:'#ff8a2a'};
const MIN_U={uT:{value:0}};   // spoločný čas pre pulzovanie žíl (main.js ho posúva každý snímok)

/* Jednoduchý 3D hodnotový šum v JS (pre tvar kameňa). */
function _mh(x,y,z,s){let h=Math.sin(x*127.1+y*311.7+z*74.7+s*13.3)*43758.5453;return h-Math.floor(h)}
function _mn(x,y,z,s){const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z),fx=x-ix,fy=y-iy,fz=z-iz;
  const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),w=fz*fz*(3-2*fz);const L=(a,b,t)=>a+(b-a)*t;
  const c=(dx,dy,dz)=>_mh(ix+dx,iy+dy,iz+dz,s);
  return L(L(L(c(0,0,0),c(1,0,0),u),L(c(0,1,0),c(1,1,0),u),v),L(L(c(0,0,1),c(1,0,1),u),L(c(0,1,1),c(1,1,1),u),v),w)}

/* Tvar minerálu: indexovaná guľa (zdieľané vrcholy → hladké tieňovanie), predĺženie, 6–9 štiepnych rovín, zvlnenie. */
function mineralGeo(seed){const r=rng(seed),src=new THREE.IcosahedronGeometry(1,4),sp=src.attributes.position;
  const map=new Map(),pos=[],idx=[];
  for(let i=0;i<sp.count;i++){const x=sp.getX(i),y=sp.getY(i),z=sp.getZ(i),k=x.toFixed(4)+','+y.toFixed(4)+','+z.toFixed(4);
    let j=map.get(k);if(j===undefined){j=pos.length/3;map.set(k,j);pos.push(x,y,z)}idx.push(j)}
  const el=[1,1.3+r()*.5,.8+r()*.25];   // predĺžený, mierne sploštený kameň
  const planes=[];const np=7+((r()*4)|0);
  for(let i=0;i<np;i++){const n=new V3(r()-.5,r()-.5,r()-.5).normalize();planes.push({n,d:.42+r()*.3})}
  const p=new V3();let mx=0;
  for(let i=0;i<pos.length;i+=3){p.set(pos[i],pos[i+1],pos[i+2]);
    p.multiplyScalar(1+.1*(_mn(p.x*1.4+5,p.y*1.4,p.z*1.4,seed)-.5));                  // veľké hrbole
    p.set(p.x*el[0],p.y*el[1],p.z*el[2]);
    for(const q of planes){const s=p.dot(q.n)*1.0;if(s>q.d)p.addScaledVector(q.n,q.d-s)}  // štiepne plochy
    const f=_mn(p.x*6,p.y*6,p.z*6,seed+7)-.5;p.multiplyScalar(1+f*.02);                  // jemné zvlnenie aj na plochách
    pos[i]=p.x;pos[i+1]=p.y;pos[i+2]=p.z;mx=Math.max(mx,p.length())}
  for(let i=0;i<pos.length;i++)pos[i]*=1.18/mx;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  src.dispose();return g}

/* Materiál minerálu: MeshStandardMaterial + vložený kód shadera (šum v súradniciach objektu, takže vzor drží na kameni). */
function mineralMat(type,seed){const c=col(MIN_COL[type]);
  const m=new THREE.MeshStandardMaterial({color:col('#ffffff'),roughness:.6,metalness:.5});
  m.extensions={derivatives:true};
  const U={uC:{value:c},uC2:{value:col('#6fe04a')},uC3:{value:col('#9d6bff')},uMix:{value:type==='mix'?1:0},uSeed:{value:seed*1.37},uT:MIN_U.uT,uV:{value:type==='relic'?.9:1}};
  m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vOP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvOP=position;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vOP;uniform vec3 uC,uC2,uC3;uniform float uMix,uSeed,uT,uV;
float mh(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float mn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
  return mix(mix(mix(mh(i),mh(i+vec3(1,0,0)),f.x),mix(mh(i+vec3(0,1,0)),mh(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(mh(i+vec3(0,0,1)),mh(i+vec3(1,0,1)),f.x),mix(mh(i+vec3(0,1,1)),mh(i+vec3(1,1,1)),f.x),f.y),f.z);}
float mf4(vec3 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*mn(p);p=p*2.07+vec3(1.7,9.2,3.1);a*=.5;}return s/.9375;}
float mf3(vec3 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*mn(p);p=p*2.11+vec3(4.3,1.1,7.7);a*=.5;}return s/.875;}`)
    .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
  // --- povrch kameňa: drsnosť (bump z výšky šumu), farba, žily, iskričky ---
  vec3 P=vOP*2.4+uSeed;
  float hgt=mf3(P*1.6);                       // len hrubé zvlnenie (jemné detaily by cez dFdx tvorili štvorčeky)
  float grain=mf3(P*7.)*.6+mn(P*19.)*.4;          // jemné zrno – len vo farbe a drsnosti
  { vec3 dpx=dFdx(-vViewPosition),dpy=dFdy(-vViewPosition);vec3 R1=cross(dpy,normal),R2=cross(normal,dpx);float det=dot(dpx,R1);
    vec2 dH=vec2(dFdx(hgt),dFdy(hgt))*.35;normal=normalize(abs(det)*normal-sign(det)*(dH.x*R1+dH.y*R2)); }
  // žily: hrebene deformovaného šumu (tenké, rozvetvené ako blesk)
  // (fbm má hodnoty okolo 0,5 – čiara je tam, kde je šum blízko 0,5; maska nechá len niekoľko veľkých puklín)
  vec3 q=P*.55+vec3(mf3(P*.9),mf3(P*.9+4.1),mf3(P*.9+8.7))*.9;
  float d1=abs(mf4(q)-.5),d2=abs(mf4(q*2.3+2.3)-.5);
  float msk=smoothstep(.3,.55,mf3(P*.38+40.));
  float vein=((1.-smoothstep(.0,.022,d1))+(1.-smoothstep(.0,.01,d2))*.6*smoothstep(.0,.06,.06-d1+.03))*msk;
  float halo=pow(1.-smoothstep(.0,.11,d1),2.)*msk;
  float cloud=smoothstep(.64,.92,mf3(P*.6+11.))*msk;                    // zakalené svietiace miesta vo vnútri
  float speck=smoothstep(.93,.99,mn(P*38.))*smoothstep(.5,.7,mn(P*5.));  // trblietky minerálu
  // farba žíl: pri zmiešanom asteroide sa strieda oranžová / zelená / fialová
  vec3 vc=uC;if(uMix>.5){float k=mf3(P*.5+20.);vc=mix(uC,uC2,smoothstep(.38,.48,k));vc=mix(vc,uC3,smoothstep(.56,.66,k));}
  // podklad: tmavá bridlica, svetlejšie zvetrané hrany, bronzový nádych, jemný nádych suroviny
  float light=mf4(P*1.6+3.);
  vec3 rock=mix(vec3(.012,.015,.02),vec3(.045,.05,.058),smoothstep(.4,.8,light));
  rock=mix(rock,vec3(.13,.09,.055),smoothstep(.68,.84,mf3(P*1.2+30.))*.6);
  rock=mix(rock,vc*.25,.05+cloud*.2+halo*.15);
  diffuseColor.rgb=rock*(.75+hgt*.25+grain*.35);
  roughnessFactor=clamp(.62+grain*.3-cloud*.15,.45,.95);
  float pulse=.82+.18*sin(uT*1.7+P.x*2.3+P.y*1.7);
  vec3 mEm=vc*(vein*2.8*pulse+halo*.6+cloud*.55+speck*1.1)*uV+mix(vc,vec3(1.),.5)*vein*vein*.9;`)
    .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n  totalEmissiveRadiance=mEm;')};
  m.customProgramCacheKey=()=>'mineral-'+type;   // jeden program pre každý typ (vlastné uniformy sa inak pri zdieľanom programe stratia)
  return m}

/* Varianty tvarov a materiálov pre každý typ (zdieľané všetkými asteroidmi daného typu). */
const MIN_GEOS={},MIN_MATS={};
function mineralParts(type,r){
  if(!MIN_GEOS[type]){const n=type==='relic'||type==='mix'?3:5,base={ore:100,green:300,crystal:200,relic:400,mix:500}[type];
    MIN_GEOS[type]=Array.from({length:n},(_,i)=>mineralGeo(base+i*17));MIN_MATS[type]=[mineralMat(type,base*.01)]}   // rozmanitosť dávajú tvary (šum je v súradniciach kameňa)
  const G=MIN_GEOS[type],Mt=MIN_MATS[type];return{geo:G[(r()*G.length)|0],mat:Mt[(r()*Mt.length)|0]}}

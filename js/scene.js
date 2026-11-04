'use strict';
/* ==================== == 4. 3D SCÉNA ==================== */
const canvas=$('#c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
const isTouch=matchMedia('(pointer: coarse)').matches;
renderer.setPixelRatio(Math.min(devicePixelRatio||1,isTouch?1.6:2));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;
const scene=new THREE.Scene();
scene.background=col('#04070d');
const camera=new THREE.PerspectiveCamera(40,1,1,4000);
scene.add(new THREE.HemisphereLight(col('#7f9ccf'),col('#150b1c'),.6));
const sun=new THREE.DirectionalLight(col('#ffe4bd'),1.9);sun.position.set(90,120,50);scene.add(sun);
const rim=new THREE.DirectionalLight(col('#4fa8ff'),.55);rim.position.set(-70,30,-90);scene.add(rim);

/* Žiara: jedna textúra s mäkkým kruhom, použitá na motory, svetlá a častice (glow = funkcia, ktorá vytvorí svietiaci bod). */
function makeGlowTex(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.18,'rgba(255,255,255,.65)');gr.addColorStop(.45,'rgba(255,255,255,.14)');gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)}
const GLOW=makeGlowTex();
function glow(color,size,opacity=1){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:new THREE.Color(color),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity}));s.scale.set(size,size,1);return s}

function stars(n,spread,y,size,tint,seed){const r=rng(seed);const p=new Float32Array(n*3),c=new Float32Array(n*3);const tc=new THREE.Color(tint);
  for(let i=0;i<n;i++){p[i*3]=(r()-.5)*spread;p[i*3+1]=y+(r()-.5)*40;p[i*3+2]=(r()-.5)*spread;const k=.55+r()*.45;const w=r()<.25;
    c[i*3]=w?k:tc.r*k;c[i*3+1]=w?k:tc.g*k;c[i*3+2]=w?k:tc.b*k}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));
  return new THREE.Points(g,new THREE.PointsMaterial({size,map:GLOW,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true}))}
scene.add(stars(1800,2000,-90,2.2,'#9ec4ff',1),stars(1100,2800,-220,3.6,'#ffd9b0',2),stars(600,3600,-420,6,'#c9b6ff',3));

/* Materiály (povrchy) zdieľané všetkými 3D objektmi. emissive = farba, ktorou objekt sám svieti. */
const M={
  metal:new THREE.MeshStandardMaterial({color:col('#b9c6d4'),metalness:.65,roughness:.35,flatShading:true}),
  plate:new THREE.MeshStandardMaterial({color:col('#4a5a6e'),metalness:.5,roughness:.55,flatShading:true}),
  dark:new THREE.MeshStandardMaterial({color:col('#1d2635'),metalness:.4,roughness:.7,flatShading:true}),
  hullGlow:new THREE.MeshStandardMaterial({color:col('#0a1f1d'),emissive:col('#58d0c0'),emissiveIntensity:1.6}),
  window:new THREE.MeshStandardMaterial({color:col('#1a1408'),emissive:col('#ffcf8a'),emissiveIntensity:1.8}),
  amber:new THREE.MeshStandardMaterial({color:col('#2a1804'),emissive:col('#f0a644'),emissiveIntensity:1.8}),
  panel:new THREE.MeshStandardMaterial({color:col('#173a6b'),emissive:col('#1d4f9a'),emissiveIntensity:.5,metalness:.8,roughness:.3,flatShading:true}),
  relic:new THREE.MeshStandardMaterial({color:col('#3a2a08'),emissive:col('#ffcf60'),emissiveIntensity:1.6,roughness:.25,metalness:.4,flatShading:true}),
  crystal:new THREE.MeshStandardMaterial({color:col('#5a3fc4'),emissive:col('#8f6bff'),emissiveIntensity:1.3,roughness:.2,metalness:.1,flatShading:true}),
  viridit:new THREE.MeshStandardMaterial({color:col('#1f4d16'),emissive:col('#6fd447'),emissiveIntensity:1.1,roughness:.3,metalness:.2,flatShading:true}),
  rock:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:.05,flatShading:true}),
  pad:new THREE.MeshStandardMaterial({color:col('#223047'),metalness:.6,roughness:.5,flatShading:true}),
  pick:new THREE.MeshBasicMaterial({visible:false}),
};

/* Tvar asteroidu: zdeformovaný mnohosten s náhodnými škvrnami suroviny. GEOS = niekoľko variantov pre každú surovinu. */
function rockGeo(seed,base,fleck,fleckP){const g=new THREE.IcosahedronGeometry(1,1);const p=g.attributes.position;const r=rng(seed);const cache=new Map();
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);let d=cache.get(k);if(d===undefined){d=.72+r()*.5;cache.set(k,d)}p.setXYZ(i,x*d,y*d,z*d)}
  const cs=new Float32Array(p.count*3);const b=col(base),f=col(fleck);
  for(let i=0;i<p.count;i+=3){const isF=r()<fleckP;const v=.75+r()*.35;const c=isF?f:b;for(let j=0;j<3;j++){cs[(i+j)*3]=c.r*v;cs[(i+j)*3+1]=c.g*v;cs[(i+j)*3+2]=c.b*v}}
  g.setAttribute('color',new THREE.BufferAttribute(cs,3));g.computeVertexNormals();return g}
const GEOS={
  ore:[1,2,3,4,5].map(i=>rockGeo(100+i,'#5e5148','#e0902e',.2)),
  green:[1,2,3,4].map(i=>rockGeo(300+i,'#46564a','#7fdc4f',.24)),
  crystal:[1,2,3,4].map(i=>rockGeo(200+i,'#46506a','#7a62c9',.12)),
  relic:[1,2,3].map(i=>rockGeo(400+i,'#2a2e38','#ffd87a',.3)),
  mix:[1,2,3].map(i=>rockGeo(500+i,'#4a4658','#e0902e',.22)),
};
const SHARD=new THREE.OctahedronGeometry(1,0);

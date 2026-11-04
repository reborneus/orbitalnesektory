'use strict';
/* ==================== == 5d. REALISTICKÉ POZADIA SEKTOROV (v0.22) ====================
   Každý sektor má v SECTORS[i].bg typ scény (počítanej shadermi, ostrá pri každom priblížení, hlboko pod rovinou letu → paralaxa):
     disk      – planéta so žeravým akrečným diskom (bgdisk.js, 1. mapa)
     nebula    – emisná hmlovina s prachovými piliermi a mladými hviezdokopami
     blackhole – čierna diera s tenkým horúcim diskom, ohnutým obrazom disku nad/pod ňou a fotónovým prstencom
     sun       – hviezda s vrúcou granuláciou, škvrnami, korónou s výtryskami a protuberanciami
     galaxy    – špirálová galaxia zošikma (jadro, ramená, prachové pásy, ružové oblasti tvorby hviezd)
     remnant   – pozostatok supernovy: vláknitý prstenec okolo pulzaru so zábleskami lúčov
     giant     – pruhovaný plynný obor s búrkami a prstencami (aréna)
   Spoločný je hlboký podklad deepMat (dym, hmloviny vo farbách sektora S.neb, prachové pásy, iskry, hviezdy).
   buildBg(i, parent) → funkcia tick(dt, tt); bgThumb(i, W, H) → canvas s náhľadom pre kartu mapy. */
const BG_POS={nebula:[-300,-1500,-1250],blackhole:[-480,-1500,-1250],sun:[-620,-1600,-1350],galaxy:[-380,-1500,-1250],remnant:[-420,-1500,-1250],giant:[-560,-1500,-1250]};
const BG_K={nebula:1.6,blackhole:2.4,sun:1.9,galaxy:2.1,remnant:1.8,giant:2.0};   // mierka scény (pre kameru náhľadu)

/* spoločný hlboký podklad */
function deepMat(o){const C=c=>new THREE.Color(c);
  return new THREE.ShaderMaterial({uniforms:{uT:{value:0},uA:{value:C(o.a)},uB:{value:C(o.b)},uD:{value:C(o.dust||'#1a1d26')},uK:{value:o.k==null?.6:o.k},uE:{value:o.e||0},uS:{value:o.s||1},uC:{value:new THREE.Vector2(o.c[0],o.c[2])}},
    depthWrite:false,vertexShader:BG_VERT,fragmentShader:BG_NOISE+`
uniform float uT,uK,uE,uS;uniform vec3 uA,uB,uD;uniform vec2 uC;varying vec2 vUv;varying vec3 vW;
void main(){vec2 p=vW.xz*.0016;float dc=length(vW.xz-uC)/3600.;
  vec2 w=vec2(fbm(p+vec2(uT*.004,0.)),fbm(p*1.3+vec2(4.1,-uT*.003)));
  float d=fbm(p*1.6+w*1.8),d2=fbm(p*4.+w*2.5+3.);
  float smoke=smoothstep(.38,.85,d)*(.45+.6*d2);vec3 col=uD*smoke*1.6;
  float neb=pow(ridge(p*2.2+w*2.),2.6)*smoothstep(.4,.8,fbm(p*1.1+w+7.))*(1.-smoothstep(.1,1.3,dc)*.55);
  vec3 nc=mix(uA,uB,smoothstep(.3,.7,fbm(p*.8+13.)));
  col+=nc*neb*uK+mix(nc,vec3(1.),.45)*pow(neb,3.)*uK*.9;
  col*=1.-.55*smoothstep(.3,.8,fbm(p*2.3-w*1.5+11.))*(1.-neb);
  vec2 c=floor(vW.xz*.06),f=fract(vW.xz*.06)-.5;float hh=h2(c);vec2 o=vec2(h2(c+3.1),h2(c+7.7))-.5;
  col+=mix(uA,vec3(1.),.4)*step(.95-neb*.1,hh)*smoothstep(.16,0.,length(f-o*.6))*(.5+.5*sin(uT*2.+hh*40.))*uE;
  vec2 c2=floor(vW.xz*.11),f2=fract(vW.xz*.11)-.5;float hs=h2(c2+9.);
  col+=vec3(.85,.9,1.)*step(1.-.015*uS,hs)*smoothstep(.09,0.,length(f2-(vec2(h2(c2),h2(c2+1.))-.5)*.7))*(.6+.4*sin(uT*1.3+hs*90.));
  gl_FragColor=vec4(col,1.);}`})}
function deepPlane(parent,o,mats){const m=deepMat(o);mats.push(m);const pl=new THREE.Mesh(new THREE.PlaneGeometry(3000+LIMIT*4,3000+LIMIT*4),m);pl.rotation.x=-Math.PI/2;pl.position.y=-2200;pl.renderOrder=-10;parent.add(pl);return pl}
/* jasná hviezda s difrakčnými lúčmi (sprite) */
let _starTex=null;
function starSprite(col,size,op=1){if(!_starTex){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.globalCompositeOperation='lighter';
    const gr=g.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.06,'rgba(255,255,255,.8)');gr.addColorStop(.25,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);
    for(const a of[0,Math.PI/2,Math.PI/4,-Math.PI/4]){g.save();g.translate(128,128);g.rotate(a);const L=a%(Math.PI/2)?70:126;const lg=g.createLinearGradient(-L,0,L,0);lg.addColorStop(0,'rgba(255,255,255,0)');lg.addColorStop(.5,`rgba(255,255,255,${a%(Math.PI/2)?.35:.9})`);lg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=lg;g.fillRect(-L,-1.2,L*2,2.4);g.restore()}
    _starTex=new THREE.CanvasTexture(c)}
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:_starTex,color:new THREE.Color(col),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:op,toneMapped:false}));s.scale.set(size,size,1);return s}
const bbMat=(frag,uni={})=>new THREE.ShaderMaterial({uniforms:Object.assign({uT:{value:0}},uni),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,vertexShader:BG_VERT,fragmentShader:BG_NOISE+frag});
/* plocha natočená ku kamere (billboard) – v tick sa nastaví quaternion kamery */
function billboard(mat,size,pos,parent,bbs){const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),mat);m.position.copy(pos);parent.add(m);bbs.push(m);return m}

const BG_SCENES={
  /* ---------- emisná hmlovina ---------- */
  nebula(parent,S,P,mats,bbs){deepPlane(parent,{a:'#18c8b0',b:'#c03ad8',dust:'#141a24',k:1.1,e:.4,s:1.2,c:[P.x,0,P.z]},mats);
    const m=bbMat(`uniform float uT;uniform vec3 uA,uB;varying vec2 vUv;
void main(){vec2 p=(vUv-.5)*2.;float r=length(p);vec2 w=vec2(fbm(p*1.8+uT*.01),fbm(p*1.8+5.2-uT*.008));
  float g=pow(ridge(p*2.4+w*1.6),2.2)*smoothstep(1.,.15,r);float g2=fbm(p*5.+w*3.);
  vec3 c=mix(uA,uB,smoothstep(.35,.75,fbm(p*1.2+w+2.)));vec3 col=c*g*(.6+.8*g2)+mix(c,vec3(1.),.6)*pow(g,4.)*1.4;
  float pil=smoothstep(.55,.75,fbm(vec2(p.x*3.,p.y*1.2)+w*1.4+9.))*smoothstep(.9,.2,r);col*=1.-.75*pil;   // tmavé prachové piliere
  col+=vec3(1.,.95,.9)*exp(-r*r*30.)*.6;gl_FragColor=vec4(col,1.);}`,{uA:{value:new THREE.Color('#2ee8c8')},uB:{value:new THREE.Color('#e04ad8')}});
    mats.push(m);const n=billboard(m,2600,P,parent,bbs);n.renderOrder=-5;
    const R=rng(S.seed);for(let i=0;i<14;i++){const s=starSprite(R()<.5?'#bfe8ff':'#ffe8d0',60+R()*160,.9);s.position.copy(P).add(new V3((R()-.5)*1400,(R()-.5)*300,(R()-.5)*1000));parent.add(s)}},
  /* ---------- čierna diera (v0.23, podľa videa) ----------
     Jedna plocha natočená ku kamere s analytickým modelom tenkého disku pri veľkom sklone (takmer z boku):
     tieň (čierny kruh, zakryje hviezdy), tenký fotónový prstenec, priamy obraz disku (predná polovica cez tieň, zadná za ním),
     gravitačne ohnutý obraz zadnej časti disku ako oblúk nad tieňom (širší) a pod ním (užší), Dopplerov jas (jedna strana
     jasnejšia), horúce bielo-zlaté vnútro → oranžová → široký šedý prachový chvost s vláknami. Jednotka = polomer tieňa. */
  blackhole(parent,S,P,mats,bbs){deepPlane(parent,{a:'#3a3a48',b:'#4a3a30',dust:'#0d0e12',k:.12,e:0,s:1.8,c:[P.x,0,P.z]},mats);
    const m=new THREE.ShaderMaterial({uniforms:{uT:{value:0}},transparent:true,depthWrite:false,side:THREE.DoubleSide,
      blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,vertexShader:BG_VERT,fragmentShader:BG_NOISE+`
uniform float uT;varying vec2 vUv;
const float RIN=1.55;
float strk(float rho,float a){return fbm(vec2(rho*5.,a*2.2))*.55+fbm(vec2(rho*17.,a*6.))*.3+fbm(vec2(rho*45.,a*11.))*.15;}
float emis(float rho,float ang){if(rho<RIN)return 0.;float x=(rho-RIN)/10.;
  float a=ang-uT*.035;a=mod(a+3.14159,6.28318)-3.14159;float w=(a+3.14159)/6.28318;
  float s=mix(strk(rho,a),strk(rho,a-6.28318),w);
  float core=exp(-x*2.4)*smoothstep(0.,.025,x);float dust=exp(-x*.32)*.16*smoothstep(.15,.6,x);
  return core*(.35+1.3*s)+dust*pow(s,1.6)*2.2;}
vec3 tcol(float rho){float x=(rho-RIN)/10.;vec3 c=mix(vec3(1.,.96,.9),vec3(1.,.68,.32),smoothstep(0.,.22,x));c=mix(c,vec3(.95,.45,.2),smoothstep(.2,.5,x));return mix(c,vec3(.62,.58,.6),smoothstep(.45,1.2,x));}
void main(){vec2 p=(vUv-.5)*64.;float r=length(p);
  float cp=cos(.5),sp=sin(.5);vec2 q=vec2(p.x*cp+p.y*sp,-p.x*sp+p.y*cp);const float CI=.17;      // sklon disku (cos), natočenie zošikma
  float rho=length(vec2(q.x,q.y/CI));float ang=atan(q.y/CI,q.x);
  float beam=1.+.6*cos(ang+.4);                                                                     // Dopplerov jas
  vec3 direct=tcol(rho)*emis(rho,ang)*beam;
  if(q.y>0.&&r<1.)direct*=0.;                                                                       // zadná polovica je za tieňom
  // ohnutý obraz zadnej časti disku okolo tieňa
  float th=atan(q.y,q.x);float up=step(0.,q.y);float span=mix(.7,2.1,up)*(.35+.65*pow(abs(sin(th)),.8));
  float s=(r-1.07)/span;vec3 lens=vec3(0.);
  if(s>0.&&s<1.){float rl=RIN+.15+s*5.;lens=tcol(rl)*emis(rl,th+3.)*(1.-s)*1.9*(.65+.55*up)*(1.+.4*cos(th+.4));}
  float ring=exp(-pow((r-1.035)*55.,2.))*1.7+exp(-pow((r-1.05)*14.,2.))*.22;vec3 rc=vec3(.85,.9,1.)*ring;   // fotónový prstenec
  float sh=smoothstep(1.01,.985,r);
  vec3 col=lens*(1.-sh)+rc+direct;
  gl_FragColor=vec4(col,sh);}`});
    mats.push(m);billboard(m,5200,P,parent,bbs);
    const R=rng(S.seed+3);for(let i=0;i<8;i++){const s=starSprite('#e8eeff',40+R()*90,.8);s.position.copy(P).add(new V3((R()-.5)*2600,-200,(R()-.5)*1800));parent.add(s)}},
  /* ---------- hviezda (slnko) ---------- */
  sun(parent,S,P,mats,bbs){deepPlane(parent,{a:'#c08020',b:'#2a8a7a',dust:'#1c1a16',k:.35,e:.25,s:1,c:[P.x,0,P.z]},mats);const R=260;
    const sm=new THREE.ShaderMaterial({uniforms:{uT:{value:0}},vertexShader:'varying vec3 vN;varying vec3 vV;varying vec3 vP;void main(){vec4 w=modelMatrix*vec4(position,1.);vP=position;vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}',
      fragmentShader:BG_NOISE+`uniform float uT;varying vec3 vN;varying vec3 vV;varying vec3 vP;
float tri(vec3 p,float k){vec3 b=abs(normalize(p));b/=b.x+b.y+b.z;return fbm(p.yz*k+uT*.05)*b.x+fbm(p.xz*k-uT*.04)*b.y+fbm(p.xy*k+uT*.045)*b.z;}
void main(){float ndv=max(0.,dot(normalize(vN),vV));float g=tri(vP,.03);float g2=tri(vP,.11);
  float gran=.55+.45*g2;float spot=smoothstep(.7,.76,tri(vP+31.,.02));
  vec3 col=mix(vec3(1.,.5,.12),vec3(1.,.93,.7),pow(ndv,.6))*gran*(1.-.75*spot)*(.55+.6*g);col*=.5+.7*pow(ndv,.35);   // okrajové stmavnutie
  gl_FragColor=vec4(col*2.2,1.);}`});
    mats.push(sm);sm.toneMapped=false;const sun=new THREE.Mesh(new THREE.SphereGeometry(R,64,48),sm);sun.position.copy(P);parent.add(sun);
    const cm=bbMat(`uniform float uT;varying vec2 vUv;
void main(){vec2 p=(vUv-.5)*2.;float r=length(p);if(r<.16)discard;float a=atan(p.y,p.x);float wq=(a+3.14159)/6.28318;
  float s=mix(fbm(vec2(a*4.,r*3.-uT*.03)),fbm(vec2((a-6.28318)*4.,r*3.-uT*.03)),wq);float st=pow(s,2.5)*2.2;
  float k=exp(-(r-.16)*7.)*(.6+st)+exp(-(r-.16)*2.2)*.25*st;gl_FragColor=vec4(vec3(1.,.72,.35)*k,1.);}`);
    mats.push(cm);billboard(cm,R*12.5,P,parent,bbs).renderOrder=-2;
    // protuberancie: žiariace oblúky na okraji
    const pm=new THREE.MeshBasicMaterial({color:new THREE.Color('#ff7a2a'),transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
    const RR=rng(S.seed+5);for(let i=0;i<6;i++){const a=RR()*TAU,tor=new THREE.Mesh(new THREE.TorusGeometry(R*(.1+RR()*.12),R*.012,6,40,Math.PI),pm);
      tor.position.copy(P).add(new V3(Math.cos(a)*R*.97,Math.sin(a)*R*.4,Math.sin(a)*R*.97));tor.lookAt(P);tor.rotateX(Math.PI/2);tor.rotateZ(RR()*.6);parent.add(tor)}
    for(const[c,s,o]of[['#fff4d8',R*2.2,1],['#ffb050',R*6,.45]]){const g=glow(c,s,o);g.material.toneMapped=false;g.position.copy(P);parent.add(g)}
    const st=starSprite('#fff2d0',R*9,.55);st.position.copy(P);parent.add(st)},
  /* ---------- špirálová galaxia ---------- */
  galaxy(parent,S,P,mats,bbs){deepPlane(parent,{a:'#d03a9a',b:'#2a5ad8',dust:'#14121c',k:.75,e:.3,s:1.3,c:[P.x,0,P.z]},mats);
    const gm=bbMat(`uniform float uT;varying vec2 vUv;
void main(){vec2 p=(vUv-.5)*2.;float r=length(p);if(r>1.)discard;float a=atan(p.y,p.x)+uT*.004;
  float arm=pow(.5+.5*cos(2.*(a-log(r+.02)*2.6)),3.);float n=fbm(p*6.+vec2(arm*2.));float n2=fbm(p*16.);
  float disk=exp(-r*3.2);float core=exp(-r*r*60.)*2.+exp(-r*9.)*.6;
  vec3 col=vec3(1.,.85,.6)*core+mix(vec3(.55,.7,1.),vec3(.9,.8,1.),n)*arm*disk*(.6+.9*n)*1.4;
  float dust=pow(.5+.5*cos(2.*(a-log(r+.02)*2.6)+.6),6.)*smoothstep(.05,.3,r)*(.5+.5*n2);col*=1.-.7*dust;     // prachové pásy pri ramenách
  vec2 cc=floor(p*70.),ff=fract(p*70.)-.5;float hii=step(.88,h2(cc))*smoothstep(.45,.0,length(ff-(vec2(h2(cc+1.),h2(cc+2.))-.5)*.5))*arm*smoothstep(.15,.5,r)*(1.-r);col+=vec3(1.,.35,.65)*hii*1.6;   // ružové hniezda hviezd (bodky)
  vec2 c2=floor(p*160.),f2=fract(p*160.)-.5;col+=vec3(.8,.85,1.)*step(.96,h2(c2))*smoothstep(.35,0.,length(f2))*disk*1.2;gl_FragColor=vec4(col*smoothstep(1.,.85,r),1.);}`);
    mats.push(gm);const gal=new THREE.Mesh(new THREE.PlaneGeometry(2600,2600),gm);gal.position.copy(P);gal.rotation.order='YXZ';gal.rotation.set(-1.25,.7,0);parent.add(gal);
    const g=glow('#ffd8a0',380,.6);g.material.toneMapped=false;g.position.copy(P);parent.add(g)},
  /* ---------- pozostatok supernovy s pulzarom ---------- */
  remnant(parent,S,P,mats,bbs){deepPlane(parent,{a:'#6a2ad0',b:'#c02030',dust:'#0e0d14',k:.3,e:.1,s:1.4,c:[P.x,0,P.z]},mats);
    const rm=bbMat(`uniform float uT;varying vec2 vUv;
void main(){vec2 p=(vUv-.5)*2.;float r=length(p);vec2 w=vec2(fbm(p*2.+uT*.006),fbm(p*2.+7.-uT*.005));
  float sh=exp(-pow((r-.62+(w.x-.5)*.18)*7.,2.));float fil=pow(ridge(p*5.+w*3.),3.);
  vec3 outer=vec3(1.,.25,.2),inner=vec3(.3,.7,1.);vec3 c=mix(inner,outer,smoothstep(.45,.7,r+(w.y-.5)*.2));
  vec3 col=c*sh*(.35+1.6*fil)+mix(c,vec3(1.),.5)*sh*pow(fil,3.)*1.2;
  col+=vec3(.25,.5,1.)*exp(-r*5.)*(.25+.5*fbm(p*8.-uT*.02));                                                   // vnútorná mlhovina
  float ang=atan(p.y,p.x)-uT*.35;float beam=pow(abs(cos(ang)),300.)*exp(-r*2.5)*1.4;col+=vec3(.75,.85,1.)*beam;   // otáčajúce sa lúče pulzara
  col+=vec3(.9,.95,1.)*exp(-r*r*900.)*3.;gl_FragColor=vec4(col,1.);}`);
    mats.push(rm);billboard(rm,2800,P,parent,bbs);const st=starSprite('#dfe8ff',220,1);st.position.copy(P);parent.add(st)},
  /* ---------- plynný obor s prstencami ---------- */
  giant(parent,S,P,mats,bbs){deepPlane(parent,{a:'#c0283a',b:'#5a1a6a',dust:'#1a1012',k:.7,e:.5,s:1,c:[P.x,0,P.z]},mats);const R=330;
    const gm=new THREE.ShaderMaterial({uniforms:{uT:{value:0}},vertexShader:'varying vec3 vN;varying vec3 vP;void main(){vP=position;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);}',
      fragmentShader:BG_NOISE+`uniform float uT;varying vec3 vN;varying vec3 vP;
void main(){vec3 n=normalize(vN);float lat=vP.y/${R}.;float lon=atan(vP.z,vP.x);
  float wv=fbm(vec2(lon*3.+uT*.01,lat*8.))*.25;float band=sin((lat+wv)*28.)*.5+.5;float b2=fbm(vec2(lon*6.-uT*.02,(lat+wv)*30.));
  vec3 col=mix(vec3(.45,.16,.1),vec3(.95,.62,.42),band*.7+b2*.3);
  float storm=smoothstep(.2,0.,length(vec2((lon-.8)*.5,(lat+.25)*2.2)));col=mix(col,vec3(.85,.25,.12),storm*.8);
  vec3 L=normalize(vec3(.6,.55,.45));float d=dot(n,L);col*=smoothstep(-.15,.4,d)*1.1+.03;
  gl_FragColor=vec4(col,1.);}`});
    mats.push(gm);const pl=new THREE.Mesh(new THREE.SphereGeometry(R,64,48),gm);pl.position.copy(P);pl.rotation.z=.25;parent.add(pl);
    const rgm=new THREE.ShaderMaterial({uniforms:{uT:{value:0}},transparent:true,depthWrite:false,side:THREE.DoubleSide,vertexShader:'varying vec2 vL;void main(){vL=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:BG_NOISE+`uniform float uT;varying vec2 vL;void main(){float r=length(vL)/${R}.;float t=(r-1.45)/1.0;if(t<0.||t>1.)discard;
  float b=h2(vec2(floor(t*90.),1.))*.6+n2(vec2(t*40.,0.))*.4;float gap=smoothstep(.02,.0,abs(t-.62));
  vec3 col=mix(vec3(.9,.7,.55),vec3(.6,.35,.28),t);gl_FragColor=vec4(col*(.5+.5*b),(.25+.55*b)*(1.-gap)*smoothstep(0.,.05,t)*smoothstep(1.,.92,t));}`});
    mats.push(rgm);const ring=new THREE.Mesh(new THREE.RingGeometry(R*1.45,R*2.45,180,4),rgm);ring.position.copy(P);ring.rotation.order='YXZ';ring.rotation.set(-1.95,.35,0);parent.add(ring);
    const at=glow('#ff7050',R*3.2,.25);at.position.copy(P);parent.add(at)},
};
/* postaví pozadie sektora i do rodiča; vráti tick */
function buildBg(i,parent){const S=SECTORS[i];if(S.bg==='disk')return buildDiskBg(parent);
  const f=BG_SCENES[S.bg];if(!f)return null;const P=new V3(...BG_POS[S.bg]),mats=[],bbs=[];f(parent,S,P,mats,bbs);
  return(dt,tt)=>{for(const m of mats)if(m.uniforms&&m.uniforms.uT)m.uniforms.uT.value=tt;for(const b of bbs)b.quaternion.copy(camera.quaternion)}}
/* náhľad pre kartu mapy (rovnaká scéna, samostatný renderer) */
function bgThumb(i,W,H){const S=SECTORS[i];if(S.bg==='disk')return diskBgThumb(W,H);if(!BG_SCENES[S.bg])return null;
  try{const R=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});R.setPixelRatio(1);R.setSize(W,H,false);R.outputEncoding=THREE.sRGBEncoding;
    R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.15;const sc=new THREE.Scene();sc.background=new THREE.Color('#020306');
    const P=new V3(...BG_POS[S.bg]),k=BG_K[S.bg],cam=new THREE.PerspectiveCamera(40,W/H,1,8000);cam.position.copy(P).add(new V3(380*k,900*k,620*k));cam.lookAt(P.x+80*k,P.y,P.z+40*k);
    const mats=[],bbs=[];BG_SCENES[S.bg](sc,S,P,mats,bbs);for(const m of mats)if(m.uniforms&&m.uniforms.uT)m.uniforms.uT.value=40;cam.updateMatrixWorld();for(const b of bbs)b.quaternion.copy(cam.quaternion);
    R.render(sc,cam);const out=document.createElement('canvas');out.width=W;out.height=H;out.getContext('2d').drawImage(R.domElement,0,0);R.dispose();if(R.forceContextLoss)R.forceContextLoss();return out}catch(e){return null}}

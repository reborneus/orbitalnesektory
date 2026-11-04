'use strict';
/* ==================== == 5c. POZADIE SEKTORA: PLANÉTA S OHNIVÝM DISKOM (v0.21) ====================
   Pozadie 1. mapy podľa videa: tmavá planéta obklopená žeravým akrečným diskom (biely až žltý vnútorný okraj, oranžové
   a červené pásy, prašný šedý vonkajší okraj s hrudkami), jasná žiara na okraji planéty, prachový výtrysk smerom hore
   a hlboké pozadie s dymovými oblakmi, ohnivými mrakmi, žeravými iskrami a hviezdami. Všetko je počítané shadermi
   (šum fbm / „ridged“ šum), takže je to ostré pri každom priblížení a disk sa pomaly otáča.
   buildDiskBg(parent) pridá objekty do sveta a vráti funkciu tick(dt, tt) na animáciu; diskBgThumb() nakreslí náhľad mapy. */
const BG_NOISE=`
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1.,0.)),u.x),mix(h2(i+vec2(0.,1.)),h2(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n2(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}
float ridge(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){float k=1.-abs(n2(p)*2.-1.);v+=a*k*k;p=p*2.1+vec2(3.1,1.3);a*=.5;}return v;}`;
const BG_VERT='varying vec2 vUv;varying vec3 vW;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}';
const BG_DISK={planet:[-560,-1500,-1200],R:240,inner:1.06,outer:3.3,tilt:-2.0};   // hlboko pod rovinou letu (paralaxa)
function buildDiskBg(parent){const B=BG_DISK,mats=[],P=new V3(...B.planet);
  const U=()=>({uT:{value:0}});
  // 1) hlboké pozadie (veľká rovina): dym, ohnivé oblaky, iskry, hviezdy
  const bgM=new THREE.ShaderMaterial({uniforms:Object.assign(U(),{uC:{value:new THREE.Vector2(P.x,P.z)}}),depthWrite:false,vertexShader:BG_VERT,fragmentShader:BG_NOISE+`
uniform float uT;uniform vec2 uC;varying vec2 vUv;varying vec3 vW;
void main(){vec2 p=vW.xz*.0016;float dc=length(vW.xz-uC)/3200.;
  vec2 w=vec2(fbm(p+vec2(uT*.004,0.)),fbm(p*1.3+vec2(4.1,-uT*.003)));
  float d=fbm(p*1.6+w*1.8);float d2=fbm(p*4.+w*2.5+3.);
  float smoke=smoothstep(.38,.85,d)*(.45+.6*d2);
  vec3 col=vec3(.075,.085,.11)*smoke*1.9+vec3(.16,.17,.2)*pow(smoothstep(.55,.95,d2),2.)*smoke;   // šedomodrý dym
  float fireMask=smoothstep(.5,.8,fbm(p*1.1+w+7.))*(1.-smoothstep(.15,1.,dc)*.8);
  float fire=pow(ridge(p*2.6+w*2.),3.)*fireMask;
  col+=vec3(.8,.26,.05)*fire*.5+vec3(1.,.55,.2)*pow(fire,2.5)*.6;                               // ohnivé oblaky
  col*=1.-.55*smoothstep(.3,.8,fbm(p*2.3-w*1.5+11.))*(1.-fire);                                     // tmavé prachové pásy
  // žeravé iskry (viac v ohnivých oblakoch) a hviezdy
  vec2 c=floor(vW.xz*.06);vec2 f=fract(vW.xz*.06)-.5;float hh=h2(c);vec2 o=vec2(h2(c+3.1),h2(c+7.7))-.5;
  float e=step(.93-fireMask*.12,hh)*smoothstep(.16,0.,length(f-o*.6))*(.5+.5*sin(uT*2.+hh*40.));col+=vec3(1.,.55,.18)*e*1.4;
  vec2 c2=floor(vW.xz*.11);vec2 f2=fract(vW.xz*.11)-.5;float s=step(.985,h2(c2+9.))*smoothstep(.09,0.,length(f2-(vec2(h2(c2),h2(c2+1.))-.5)*.7));col+=vec3(.85,.9,1.)*s;
  gl_FragColor=vec4(col,1.);}`});
  mats.push(bgM);const bg=new THREE.Mesh(new THREE.PlaneGeometry(3000+LIMIT*4,3000+LIMIT*4,1,1),bgM);bg.rotation.x=-Math.PI/2;bg.position.y=-2200;bg.renderOrder=-10;parent.add(bg);
  // 2) planéta: tmavý kamenný povrch, oranžový lem od disku a biela žiara na okraji (smer FL)
  const plM=new THREE.ShaderMaterial({uniforms:U(),vertexShader:'varying vec3 vN;varying vec3 vV;varying vec3 vP;void main(){vec4 w=modelMatrix*vec4(position,1.);vP=position;vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:BG_NOISE+`uniform float uT;varying vec3 vN;varying vec3 vV;varying vec3 vP;
void main(){vec3 n=normalize(vN);float ndv=max(0.,dot(n,vV));vec2 sp=vec2(atan(vP.z,vP.x)*1.2+uT*.01,vP.y*.012);
  float g=fbm(sp*3.)*.6+fbm(sp*9.)*.4;vec3 base=mix(vec3(.03,.035,.05),vec3(.1,.08,.11),g);base+=vec3(.06,.02,.09)*smoothstep(.55,.8,fbm(sp*5.+2.));  // fialovkastý nádych
  vec3 FL=normalize(vec3(-.55,.35,.45));float lit=max(0.,dot(n,FL));
  vec3 col=base*(.35+1.4*pow(lit,2.))+vec3(1.,.45,.12)*pow(1.-ndv,4.)*.4+vec3(1.,.9,.7)*pow(lit,18.)*1.8;
  gl_FragColor=vec4(col,1.);}`});
  mats.push(plM);const planet=new THREE.Mesh(new THREE.SphereGeometry(B.R,64,48),plM);planet.position.copy(P);parent.add(planet);
  // 3) akrečný disk: polárne súradnice, pruhy pozdĺž obvodu, vnútro sa otáča rýchlejšie; bez švu (prelínanie f(a) a f(a-2π))
  const dkM=new THREE.ShaderMaterial({uniforms:Object.assign(U(),{uIn:{value:B.R*B.inner},uOut:{value:B.R*B.outer}}),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
    vertexShader:'varying vec2 vL;void main(){vL=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:BG_NOISE+`uniform float uT;uniform float uIn;uniform float uOut;varying vec2 vL;
float band(float t,float a){return fbm(vec2(t*26.,a*3.))*.65+fbm(vec2(t*70.,a*7.))*.35;}
float clump(float t,float a){return fbm(vec2(t*9.,a*10.));}
void main(){float r=length(vL);float t=(r-uIn)/(uOut-uIn);if(t<0.||t>1.)discard;
  float a=atan(vL.y,vL.x)-uT*.03-.5*sin(uT*.04)*(1.-t);   /* otáčanie bez trvalého skrúcania (inak by sa pásy časom „rozmazali“) */a=mod(a+3.14159,6.28318)-3.14159;float w=(a+3.14159)/6.28318;
  float b=mix(band(t,a),band(t,a-6.28318),w);float cl=mix(clump(t,a),clump(t,a-6.28318),w);
  vec3 hot=vec3(1.,.97,.85),yel=vec3(1.,.72,.22),ora=vec3(1.,.38,.06),red=vec3(.6,.08,.03),dust=vec3(.26,.24,.26);
  vec3 c=t<.08?mix(hot,yel,t/.08):t<.3?mix(yel,ora,(t-.08)/.22):t<.62?mix(ora,red,(t-.3)/.32):mix(red,dust,smoothstep(.62,.85,t));
  float bright=(1.15-t*.95)*(.4+.85*b)*.95;
  float edge=smoothstep(0.,.03,t)*(1.-smoothstep(.78,1.,t+(cl-.5)*.35));
  float dustK=smoothstep(.6,.95,t)*smoothstep(.35,.75,cl);
  vec3 col=c*bright*edge+dust*dustK*.8*(1.-smoothstep(.95,1.,t));
  col+=hot*exp(-t*30.)*.8;
  gl_FragColor=vec4(col,1.);}`});
  mats.push(dkM);const disk=new THREE.Mesh(new THREE.RingGeometry(B.R*B.inner,B.R*B.outer,256,12),dkM);
  disk.position.copy(P);disk.rotation.order='YXZ';disk.rotation.set(B.tilt,.55,0);parent.add(disk);   // šikmo voči kamere (ako na videu), nie zhora
  // 4) prachový výtrysk z okraja planéty (plochý pás natočený ku kamere, jemné vlákna)
  const jtM=new THREE.ShaderMaterial({uniforms:U(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,vertexShader:BG_VERT,fragmentShader:BG_NOISE+`
uniform float uT;varying vec2 vUv;
void main(){vec2 u=vUv;float x=u.x-.5;float spread=.08+u.y*.42;float m=smoothstep(spread,0.,abs(x))*smoothstep(1.,.35,u.y)*smoothstep(0.,.05,u.y);
  float s=fbm(vec2(x/spread*3.,u.y*4.-uT*.05))*.7+fbm(vec2(x/spread*9.,u.y*10.-uT*.08))*.3;
  vec3 col=mix(vec3(1.,.75,.45),vec3(.55,.55,.62),smoothstep(.1,.6,u.y))*m*s*(1.3-u.y);
  gl_FragColor=vec4(col*.9,1.);}`});
  mats.push(jtM);const jet=new THREE.Mesh(new THREE.PlaneGeometry(B.R*3.2,B.R*7),jtM);
  jet.position.copy(P).add(new V3(-B.R*1.5,B.R*.6,-B.R*3.3));jet.rotation.set(-1.15,0,-.45);parent.add(jet);
  // 5) žiara na okraji planéty
  const fl=new V3(-.55,.35,.45).normalize().multiplyScalar(B.R*1.02).add(P);
  for(const[c,s,o]of[['#ffffff',B.R*.9,1],['#ffd28a',B.R*2.6,.75],['#ff7a2a',B.R*6.5,.38]]){const g=glow(c,s,o);g.material.toneMapped=false;g.position.copy(fl);parent.add(g)}
  const halo=glow('#ff6a1a',B.R*10,.18);halo.position.copy(P);parent.add(halo);
  return(dt,tt)=>{for(const m of mats)m.uniforms.uT.value=tt;planet.rotation.y+=dt*.004}}
/* náhľad pre kartu mapy: vykreslí rovnaké pozadie samostatným rendererom do obrázka 560×200 */
function diskBgThumb(W,H){try{const R=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});R.setPixelRatio(1);R.setSize(W,H,false);R.outputEncoding=THREE.sRGBEncoding;
    R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.15;const sc=new THREE.Scene();sc.background=new THREE.Color('#020306');
    const tick=buildDiskBg(sc);tick(0,40);const P=new V3(...BG_DISK.planet);const cam=new THREE.PerspectiveCamera(40,W/H,1,6000);
    const k=BG_DISK.R/150;cam.position.copy(P).add(new V3(380*k,900*k,620*k));cam.lookAt(P.x+80*k,P.y,P.z+40*k);R.render(sc,cam);const out=document.createElement('canvas');out.width=W;out.height=H;out.getContext('2d').drawImage(R.domElement,0,0);
    R.dispose();if(R.forceContextLoss)R.forceContextLoss();return out}catch(e){return null}}   // vráti 2D canvas s obrázkom

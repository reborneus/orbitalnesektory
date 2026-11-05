'use strict';
/* ==================== v0.40: ODRAZY PROSTREDIA + BLOOM (Nastavenia → Grafika) ====================
   1) Odrazy: kovové povrchy (MeshStandardMaterial) odrážajú okolie (scene.environment). Predvolené je vstavané
      vesmírne prostredie (tmavá obloha, teplé slnko, modré protisvetlo – rovnaké smery ako svetlá scény);
      vlastnú HDRI mapu alebo panorámu nastavíš v js/models.js (ASSETS.env). Sila odrazov = ASSETS.envStrength.
   2) Bloom: jasné miesta (motory, lasery, jadro stanice, žily minerálov) dostanú žiaru, ktorá presahuje do okolia.
      Scéna sa vykreslí do textúry s rovnakým výsledkom ako doteraz (tónovanie + sRGB), z nej sa vyberú jasné miesta,
      rozmažú sa (UnrealBloomPass z three.js) a pripočítajú sa späť. S vypnutým bloomom sa kreslí priamo ako predtým. */
let _envTex=null,_envSrc=null,_envOn=false;
/* sila odrazov pre všetky materiály naraz: vlastnosť envMapIntensity sa číta cez spoločný násobič */
let ENV_K=1;
Object.defineProperty(THREE.MeshStandardMaterial.prototype,'envMapIntensity',{configurable:true,
  get(){return (this._emi===undefined?1:this._emi)*ENV_K},set(v){this._emi=v}});
{const cp=THREE.MeshStandardMaterial.prototype.copy;   // kópia materiálu nesmie násobič započítať dvakrát
  THREE.MeshStandardMaterial.prototype.copy=function(s){cp.call(this,s);this._emi=s._emi;return this}}

/* vstavané prostredie: guľa s farebným prechodom, slnkom a protisvetlom (kreslí sa raz do PMREM mapy) */
function envSpaceScene(){const s=new THREE.Scene();
  const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,
    uniforms:{sun:{value:new V3(90,120,50).normalize()},rim:{value:new V3(-70,30,-90).normalize()}},
    vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform vec3 sun,rim;varying vec3 vD;
void main(){vec3 d=normalize(vD);
  vec3 c=mix(vec3(.012,.008,.02),vec3(.05,.065,.1),smoothstep(-.2,1.,d.y));              /* obloha: dole tmavá, hore modrastá */
  float s=max(dot(d,sun),0.);c+=vec3(1.,.84,.64)*(pow(s,900.)*80.+pow(s,30.)*.9+pow(s,4.)*.1);   /* slnko: kotúč + halo */
  float r=max(dot(d,rim),0.);c+=vec3(.3,.62,1.)*(pow(r,60.)*6.+pow(r,6.)*.2);                    /* modré protisvetlo */
  c+=vec3(.3,.12,.42)*pow(max(-d.y,0.),2.)*.2;                                              /* fialová hmlovina zdola */
  float a=atan(d.z,d.x);float band=smoothstep(.985,1.,abs(sin(a*4.)))*smoothstep(.05,.3,d.y)*smoothstep(.75,.45,d.y);
  c+=vec3(.55,.68,.9)*band*.6;                                                              /* pásy svetla – ostré odlesky na chróme */
  gl_FragColor=vec4(c,1.);
  #include <encodings_fragment>
}`});   /* PMREM kreslí do RGBE textúry – farbu treba zakódovať */
  s.add(new THREE.Mesh(new THREE.SphereGeometry(100,64,32),m));return s}

function envBuild(){if(_envTex)return _envTex;const pm=new THREE.PMREMGenerator(renderer);
  _envTex=pm.fromScene(envSpaceScene(),.02).texture;pm.dispose();
  // vlastná mapa z js/models.js: po načítaní nahradí vstavanú
  const f=typeof ASSETS!=='undefined'&&ASSETS.env;
  if(f&&!_envSrc){_envSrc=f;const done=tex=>{const p=new THREE.PMREMGenerator(renderer);_envTex=p.fromEquirectangular(tex).texture;p.dispose();tex.dispose();envApply()};
    const fail=e=>console.warn('[prostredie] '+f+' sa nepodarilo načítať – ostáva vstavané',e);
    if(/\.hdr$/i.test(f)&&THREE.RGBELoader)new THREE.RGBELoader().load(f,done,undefined,fail);
    else new THREE.TextureLoader().load(f,t=>{t.encoding=THREE.sRGBEncoding;t.mapping=THREE.EquirectangularReflectionMapping;done(t)},undefined,fail)}
  return _envTex}
const envNow=()=>_envOn?envBuild():null;
function envApply(){_envOn=!!gfxCfg().env;ENV_K=(typeof ASSETS!=='undefined'&&ASSETS.envStrength!=null?+ASSETS.envStrength:1);
  const e=envNow();scene.environment=e;if(typeof menuArt!=='undefined'&&menuArt)menuArt.fg.environment=e}

/* ---------- bloom ---------- */
let _bl=null;
function bloomSetup(){if(_bl)return _bl;if(!THREE.UnrealBloomPass||!THREE.FullScreenQuad)return null;
  const o={format:THREE.RGBAFormat,encoding:THREE.sRGBEncoding,depthBuffer:true};
  const ms=renderer.capabilities.isWebGL2&&THREE.WebGLMultisampleRenderTarget;   // vyhladzovanie hrán aj v textúre (WebGL2)
  const rt=ms?new THREE.WebGLMultisampleRenderTarget(1,1,o):new THREE.WebGLRenderTarget(1,1,o);if(ms)rt.samples=4;
  const bp=new THREE.UnrealBloomPass(new THREE.Vector2(1,1),.5,.4,.86);
  const cm=new THREE.ShaderMaterial({uniforms:THREE.UniformsUtils.clone(THREE.CopyShader.uniforms),vertexShader:THREE.CopyShader.vertexShader,fragmentShader:THREE.CopyShader.fragmentShader,depthTest:false,depthWrite:false});
  return _bl={rt,bp,copy:new THREE.FullScreenQuad(cm),cm,w:0,h:0}}
const BLOOM_K=[0,.45,.85];   // vypnutý / jemný / silný
const _dbs=new THREE.Vector2();
/* Vykreslí vrstvy [[scéna,kamera],…] (ďalšia vrstva sa kreslí cez predchádzajúcu, so zmazanou hĺbkou). */
function gfxRender(layers){const lv=gfxCfg().bloom|0,b=lv&&bloomSetup();
  if(!b){renderer.setRenderTarget(null);layers.forEach(([s,c],i)=>{renderer.autoClear=!i;if(i)renderer.clearDepth();renderer.render(s,c)});renderer.autoClear=true;return}
  renderer.getDrawingBufferSize(_dbs);const w=_dbs.x|0,h=_dbs.y|0;
  if(b.w!==w||b.h!==h){b.w=w;b.h=h;b.rt.setSize(w,h);b.bp.setSize(w,h)}
  b.bp.strength=BLOOM_K[lv]*(isTouch?.9:1);
  renderer.setRenderTarget(b.rt);renderer.autoClear=false;renderer.clear();
  layers.forEach(([s,c],i)=>{if(i)renderer.clearDepth();renderer.render(s,c)});
  b.bp.render(renderer,null,b.rt,0,false);
  b.cm.uniforms.tDiffuse.value=b.rt.texture;renderer.setRenderTarget(null);b.copy.render(renderer);renderer.autoClear=true}

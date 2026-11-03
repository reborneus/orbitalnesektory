'use strict';
/* ==================== == 5. LOĎ "Klepeto" ====================
   Loď smeruje dopredu po osi +z. Klepetá sú dve časti kruhu (TorusGeometry), druhé je zrkadlovo otočené (scale.x = -1). */
const ship=new THREE.Group();
(function buildShip(){
  const body=new THREE.Group();ship.add(body);ship.userData.body=body;ship.userData.eng=[];
  const hull=new THREE.Mesh(new THREE.CylinderGeometry(.8,1.4,4.4,6),M.metal);hull.rotation.x=Math.PI/2;hull.scale.z=.55;hull.position.z=-.9;body.add(hull);
  const spine=new THREE.Mesh(new THREE.BoxGeometry(1,.5,3),M.plate);spine.position.set(0,.55,-1.4);body.add(spine);
  const bridge=new THREE.Mesh(new THREE.BoxGeometry(.85,.4,1),M.dark);bridge.position.set(0,.95,-.55);body.add(bridge);
  const visor=new THREE.Mesh(new THREE.BoxGeometry(.7,.14,.12),M.hullGlow);visor.position.set(0,1,-.02);body.add(visor);
  const block=new THREE.Mesh(new THREE.BoxGeometry(2.9,.95,1.3),M.plate);block.position.set(0,.05,-3.15);body.add(block);
  const fin=new THREE.Mesh(new THREE.BoxGeometry(.18,.9,1.4),M.dark);fin.position.set(0,.85,-3);body.add(fin);
  for(const x of[-1,0,1]){const n=new THREE.Mesh(new THREE.CylinderGeometry(.34,.46,.8,8),M.dark);n.rotation.x=Math.PI/2;n.position.set(x,.05,-4.05);body.add(n);
    const g=glow('#6fe3ff',2.2,.9);g.position.set(x,.05,-4.55);body.add(g);ship.userData.eng.push(g)}
  const R=2.25,ARC=2.45,A0=-1.22;
  for(const s of[-1,1]){
    const pod=new THREE.Mesh(new THREE.BoxGeometry(.75,.65,2.3),M.dark);pod.position.set(1.6*s,0,-2.25);pod.rotation.y=-.16*s;body.add(pod);
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(.1,.12,1.9),M.hullGlow);stripe.position.set(1.98*s,.14,-2.3);stripe.rotation.y=-.16*s;body.add(stripe);
    const w=new THREE.Group();w.position.set(-.3*s,0,.9);w.rotation.x=Math.PI/2;w.scale.set(s,1,.55);body.add(w);
    const arm=new THREE.Mesh(new THREE.TorusGeometry(R,.44,6,22,ARC),M.metal);arm.rotation.z=A0;w.add(arm);
    const edge=new THREE.Mesh(new THREE.TorusGeometry(R,.1,4,22,ARC*.86),M.hullGlow);edge.rotation.z=A0+.12;edge.position.z=-.62;w.add(edge);
    const th=A0+ARC;const tip=new THREE.Mesh(new THREE.ConeGeometry(.3,.8,5),M.plate);tip.position.set(R*Math.cos(th),R*Math.sin(th),0);tip.rotation.z=th;w.add(tip);
    for(const f of[.35,.75]){const ang=A0+ARC*f;const tooth=new THREE.Mesh(new THREE.ConeGeometry(.16,.6,4),M.dark);
      tooth.position.set((R-.5)*Math.cos(ang),(R-.5)*Math.sin(ang),0);tooth.rotation.z=ang+Math.PI/2;w.add(tooth)}
    const tg=glow('#58d0c0',1.4,.9);tg.position.set(.3*s,.1,3.15);body.add(tg);
    const nav=glow(s<0?'#ff6a4d':'#7ef2e2',1.6,1);nav.position.set(2.45*s,.15,.9);body.add(nav)}
  const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.42,1),M.hullGlow);core.position.set(0,.05,1.9);body.add(core);
  const cg=glow('#7ef2e2',3.2,.85);cg.position.copy(core.position);body.add(cg);ship.userData.core=cg;
  const halo=glow('#58d0c0',10,.16);halo.position.y=-.5;ship.add(halo);
  // shield bubble: fresnel rim, invisible until shields exist
  const bm=new THREE.ShaderMaterial({uniforms:{c:{value:new THREE.Color('#5aa9ff')},o:{value:0}},
    vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform vec3 c;uniform float o;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.-abs(dot(vN,vV)),2.2);gl_FragColor=vec4(c*(f*1.7+.06)*o,1.);}',
    transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
  const bubble=new THREE.Mesh(new THREE.SphereGeometry(3.4,28,16),bm);bubble.scale.set(1,.55,1.25);ship.add(bubble);ship.userData.bubble=bubble;
  ship.scale.setScalar(1.1);
})();
scene.add(ship);
const shipVel=new V3();let shipYaw=0;
const NOSE=new V3(0,0,2.0);

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
function emit(p,pos,color,life,vel,to){const it=p.find(x=>x.life<=0);if(!it)return;it.s.visible=true;it.s.position.copy(pos);it.from.copy(pos);it.s.material.color.set(color);
  it.life=it.max=life;it.v.copy(vel||_zero);it.to=to||null}
function tickPool(p,dt){for(const it of p){if(it.life<=0)continue;it.life-=dt;const k=clamp(it.life/it.max,0,1);
  if(it.to){it.s.position.lerpVectors(it.to,it.from,k*k)}else it.s.position.addScaledVector(it.v,dt);
  it.s.material.opacity=k*.9;const sc=it.size*(it.to?1:(.4+k*.8));it.s.scale.set(sc,sc,1);if(it.life<=0)it.s.visible=false}}

const marker=new THREE.Mesh(new THREE.RingGeometry(1.1,1.3,40),new THREE.MeshBasicMaterial({color:new THREE.Color('#58d0c0'),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
marker.rotation.x=-Math.PI/2;scene.add(marker);let markerT=0;
const tRing=new THREE.Mesh(new THREE.RingGeometry(1,1.08,48,1,0,TAU*.82),new THREE.MeshBasicMaterial({color:new THREE.Color('#58d0c0'),transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
tRing.rotation.x=-Math.PI/2;tRing.visible=false;scene.add(tRing);

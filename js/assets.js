'use strict';
/* ==================== v0.40: NAČÍTANIE VLASTNÝCH MODELOV (GLB) ====================
   Zoznam modelov je v js/models.js (ASSETS.models). Pri štarte sa všetky načítajú naraz (glbPreload),
   potom ich funkcia glbApply vkladá do hotových procedurálnych modelov: pôvodné plné diely sa skryjú,
   GLB sa prispôsobí ich veľkosti (šírka a dĺžka pri pohľade zhora) a stredu. Svetelné body, štíty,
   neviditeľné „klikacie“ gule a pod. ostávajú, takže hra funguje rovnako. Ak model chýba, nič sa nemení. */
const GLB={};                     // kľúč → načítaná scéna z .glb
let _gltfL=null;
const glbCfg=k=>(typeof ASSETS!=='undefined'&&ASSETS.models&&ASSETS.models[k])||null;
function gltfLoader(){if(_gltfL)return _gltfL;if(!THREE.GLTFLoader)return null;const L=new THREE.GLTFLoader();
  if(THREE.DRACOLoader){const d=new THREE.DRACOLoader();d.setDecoderPath('assets/draco/');d.setDecoderConfig({type:'wasm'});L.setDRACOLoader(d)}
  if(typeof MeshoptDecoder!=='undefined')L.setMeshoptDecoder(MeshoptDecoder);
  return _gltfL=L}
/* Načíta všetky modely zo zoznamu; hra čaká najviac 15 s (neskôr načítané modely sa použijú pri ďalšom postavení objektu). */
function glbPreload(){const list=Object.entries((typeof ASSETS!=='undefined'&&ASSETS.models)||{}).filter(([k,c])=>c&&c.file);
  const L=list.length&&gltfLoader();if(!L)return Promise.resolve();
  const jobs=list.map(([k,c])=>new Promise(res=>L.load(c.file,g=>{
      g.scene.traverse(o=>{if(o.isMesh){o.frustumCulled=true;const ms=Array.isArray(o.material)?o.material:[o.material];
        for(const m of ms)if(m&&m.map)m.map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy())}});
      GLB[k]=g.scene;res()},undefined,e=>{console.warn('[modely] '+k+': súbor '+c.file+' sa nepodarilo načítať – ostáva pôvodný model',e);res()})));
  return Promise.race([Promise.all(jobs),new Promise(r=>setTimeout(r,15000))])}

/* Prechádza strom objektov, podstrom „skip“ vynechá. */
function _glbWalk(o,skip,fn){if(o===skip)return;fn(o);for(const c of o.children)_glbWalk(c,skip,fn)}
const _glbSolid=o=>{const m=Array.isArray(o.material)?o.material[0]:o.material;return !!(m&&m.isMeshStandardMaterial&&m.visible!==false)};
/* Obal zoznamu sietí v súradniciach objektu root. */
function _glbBox(root,meshes){root.updateWorldMatrix(true,true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert(),box=new THREE.Box3(),b=new THREE.Box3(),m=new THREE.Matrix4();
  for(const o of meshes){const g=o.geometry;if(!g)continue;if(!g.boundingBox)g.computeBoundingBox();box.union(b.copy(g.boundingBox).applyMatrix4(m.multiplyMatrices(inv,o.matrixWorld)))}
  return box}

/* Vloží GLB s kľúčom key do skupiny group (skip = podstrom, ktorého sa nedotkne, napr. otočné delo veže). */
function glbApply(key,group,skip){const src=GLB[key];if(!src||!group)return false;const c=glbCfg(key)||{};
  const old=[],spr=[];_glbWalk(group,skip,o=>{if(o.isMesh&&o.visible&&_glbSolid(o))old.push(o);else if(o.isSprite)spr.push(o)});
  const tb=_glbBox(group,old);for(const o of old)o.visible=false;if(c.glows===false)for(const s of spr)s.visible=false;
  const holder=new THREE.Group();holder.name='glb:'+key;const inner=src.clone(true);const r=c.rot||[0,0,0],D=Math.PI/180;
  inner.rotation.set(r[0]*D,r[1]*D,r[2]*D);holder.add(inner);
  const ms=[];inner.traverse(o=>{if(o.isMesh)ms.push(o)});const gb=_glbBox(holder,ms);if(gb.isEmpty())return false;
  const ts=tb.getSize(new V3()),gs=gb.getSize(new V3());
  let k=c.size?c.size/Math.max(gs.x,gs.y,gs.z):(tb.isEmpty()?1:Math.max(ts.x,ts.z)/Math.max(gs.x,gs.z,1e-6));k*=c.scale||1;
  holder.scale.setScalar(k);holder.position.copy(tb.isEmpty()?new V3():tb.getCenter(new V3())).sub(gb.getCenter(new V3()).multiplyScalar(k));
  if(c.pos)holder.position.add(new V3(...c.pos));
  group.add(holder);return true}

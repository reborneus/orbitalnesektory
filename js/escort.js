'use strict';
/* ==================== == 16h. POMOCNÉ DRONY (v0.20) ====================
   Guľové sprievodné drony pre Sokola a Bizóna (ESCORT.ships). Kupujú sa len u obchodníka v sektore 5 (ESCORT.sec),
   najviac ESCORT.max kusov, sú veľmi drahé (escortCost; druhý je drahší). Každý má osadený laser:
   'gun'  = útočný: strieľa na cieľ lode jednu salvu (bez dodatočných efektových sálv) v rovnakom tempe ako loď,
            poškodenie = ESCORT.dmg × poškodenie salvy lode (rovnaká šanca na zásah a kritický zásah),
   'mine' = ťažobný: pri ťažbe svieti lúčom do asteroidu a zrýchli ťažbu lode o ESCORT.mine (×100 %).
   Pohyb: mimo boja a ťažby krúžia ponad a popod loď (dráha vo zvislej rovine naprieč loďou); v boji a pri ťažbe zostanú
   po bokoch lode. Na ostatných lodiach (Klepeto) sú drony uložené a nelietajú. Laser sa dá prepnúť kedykoľvek (Loď → Hangár). */
const ESCORT={max:2,sec:4,ships:['sokol','bizon'],dmg:.35,mine:.25,orbit:3.4,side:2.8,scale:.5};
const escortCost=i=>{const k=i?1.8:1;return{ore:Math.round(60000*k),green:Math.round(30000*k),crystal:Math.round(15000*k),cr:Math.round(600000*k)}};
const escList=()=>state.escorts||(state.escorts=[]);
const escActive=()=>!!state&&ESCORT.ships.includes(state.shipId)&&!dead&&!inArenaDead();
const inArenaDead=()=>false;   // rezerva (napr. vypnutie v niektorých režimoch)
/* násobok rýchlosti ťažby (control.js) */
function escortMineMul(){if(!escActive())return 1;return 1+escList().filter(e=>e.mode==='mine').length*ESCORT.mine}

/* ---------- model (podľa predlohy): tmavá guľa so svetlejším pásom, šošovka vpredu so svietiacim prstencom a oblúkmi,
   bočné štíty so svietiacim lemom, priduchmi a kruhovými portmi, rebrované kĺby. Farba svetiel podľa lasera:
   oranžová = útočný, tyrkysová = ťažobný. ---------- */
const _escTpl={};
function escortModel(mode){if(_escTpl[mode])return _escTpl[mode].clone();
  const col=mode==='mine'?'#00d0ff':'#ff4d00',H=Math.PI/2;
  const K={body:kitHullMat('escB',{base:'#3b3e44',vari:.12,line:'#24262a',seed:71},{metalness:.55,roughness:.45,emissiveIntensity:0}),
    band:new THREE.MeshStandardMaterial({color:new THREE.Color('#6d727b'),metalness:.5,roughness:.4}),
    dark:new THREE.MeshStandardMaterial({color:new THREE.Color('#1c1e22'),metalness:.6,roughness:.5,flatShading:true}),
    glow:kitGlowMat(col,1.1),lens:new THREE.MeshStandardMaterial({color:new THREE.Color('#0d0d10'),metalness:.9,roughness:.15,emissive:new THREE.Color(col),emissiveIntensity:.25})};
  const P=kitParts(),g=new THREE.Group(),bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
  P.add(K.body,new THREE.SphereGeometry(1,40,28));
  // svetlejší pás cez vrch (pozdĺžny pruh od spodku cez vrch po zadok)
  P.add(K.band,new THREE.SphereGeometry(1.012,40,20,-.28,.56,.25,Math.PI-.5),{r:[0,H,H]});
  for(const z of[-.7,.7])P.add(K.dark,bx(.36,.04,.1),{p:[0,.995*Math.cos(Math.asin(z*.6)),z*.6],r:[-z*.6,0,0]});
  // šošovka vpredu: rám, zapustený prstenec, svietiaci kruh, tmavé sklo, štyri svietiace oblúky okolo
  P.add(K.band,new THREE.TorusGeometry(.5,.07,8,40),{p:[0,0,.92]});
  P.add(K.dark,new THREE.CylinderGeometry(.46,.5,.3,40,1,true),{p:[0,0,.86],r:[H,0,0]});
  P.add(K.glow,new THREE.TorusGeometry(.3,.035,6,40),{p:[0,0,.93]});
  P.add(K.glow,new THREE.TorusGeometry(.18,.02,6,32,TAU*.75),{p:[0,0,.94],r:[0,0,.6]});
  P.add(K.lens,new THREE.CircleGeometry(.44,40),{p:[0,0,.9]});
  for(let i=0;i<4;i++)P.add(K.glow,new THREE.TorusGeometry(.66,.028,4,24,.85),{p:[0,0,.76],r:[0,0,i*H+H/2-.42]});
  // bočné štíty (zvislé plechy) so svietiacim lemom, priduchmi a dvomi portmi; rebrovaný kĺb ku guli
  const shield=[[-.75,.55],[-.55,.95],[.55,1.0],[.95,.4],[.85,-.55],[-.15,-.95],[-.8,-.5]].map(([y,z])=>[y*.82,z*.82]);   // [y,z] obrys štítu
  for(const s of[-1,1]){
    const out=shield.map(([y,z])=>[y,z]),rim=shield.map(([y,z])=>[y*1.07,z*1.07]);
    P.add(K.glow,kitSlab(rim,.04,{bev:0}),{p:[1.08*s,0,0],r:[0,0,H]});
    P.add(K.body,kitSlab(out,.1,{bev:.03}),{p:[1.13*s,0,0],r:[0,0,H]});
    for(let i=0;i<4;i++)P.add(K.dark,bx(.05,.05,.32),{p:[1.2*s,.35-i*.13,-.15],r:[0,0,0]});
    for(const y of[-.3,-.62]){P.add(K.dark,new THREE.TorusGeometry(.11,.03,6,18),{p:[1.19*s,y,.45],r:[0,H,0]});P.add(K.dark,new THREE.CircleGeometry(.1,16),{p:[1.2*s,y,.45],r:[0,H*s,0]})}
    P.add(K.glow,bx(.03,.03,.5),{p:[1.2*s,.62,.25],r:[.5,0,0]});
    for(let i=0;i<5;i++)P.add(K.dark,new THREE.CylinderGeometry(.3-(i%2)*.03,.3-(i%2)*.03,.05,20),{p:[(.9+i*.04)*s,0,0],r:[0,0,H]})}
  // zadná dýza
  P.add(K.dark,new THREE.CylinderGeometry(.22,.28,.2,20),{p:[0,0,-.98],r:[H,0,0]});P.add(K.glow,new THREE.CircleGeometry(.17,20),{p:[0,0,-1.09],r:[0,Math.PI,0]});
  P.done(g);const l=glow(col,1.6,.8);l.position.set(0,0,.98);g.add(l);const e=glow(col,1.3,.7);e.position.set(0,0,-1.25);g.add(e);
  glbApply('escort.'+mode,g);g.scale.setScalar(ESCORT.scale);_escTpl[mode]=g;return g.clone()}

/* ---------- objekty v scéne ---------- */
let escObjs=[];
function syncEscorts(){for(const o of escObjs){scene.remove(o.g);if(o.beam){hideBeam(o.beam)}}escObjs=[];
  escList().forEach((e,i)=>{const g=escortModel(e.mode);g.position.copy(ship.position);scene.add(g);escObjs.push({g,mode:e.mode,i,cd:.3*i,beam:null})})}
const _ep=new V3(),_er=new V3(),_eu=new V3(0,1,0);
function tickEscorts(dt,tt){if(escObjs.length!==escList().length||escObjs.some((o,i)=>o.mode!==escList()[i].mode))syncEscorts();
  const on=escActive()&&!jumping;const ct=typeof combatTarget==='function'?combatTarget():null;const mineOn=mining&&mineTarget&&mineTarget.alive;
  const fx=Math.sin(shipYaw),fz=Math.cos(shipYaw);_er.set(fz,0,-fx);   // pravá strana lode
  for(const o of escObjs){o.g.visible=on;if(!on){if(o.beam)hideBeam(o.beam);continue}
    const s=o.i?-1:1;
    if(ct||mineOn){_ep.copy(ship.position).addScaledVector(_er,ESCORT.side*s).add(new V3(fx*-.4,1.1+.2*Math.sin(tt*2+o.i),fz*-.4))}   // po boku lode
    else{const a=tt*1.5+o.i*Math.PI;_ep.copy(ship.position).addScaledVector(_er,Math.cos(a)*ESCORT.orbit).add(new V3(fx*.6,Math.sin(a)*ESCORT.orbit*.8+.6,fz*.6))}   // krúženie ponad a popod loď
    o.g.position.lerp(_ep,1-Math.exp(-dt*6));
    const look=ct?ct.pos:mineOn&&o.mode==='mine'?mineTarget.pos:_ep.copy(o.g.position).add(new V3(fx,0,fz));o.g.lookAt(look.x,o.g.position.y,look.z);
    // útočný laser: jedna salva na cieľ lode v tempe lode
    o.cd-=dt;
    if(o.mode==='gun'&&ct&&o.cd<=0&&o.g.position.distanceTo(ct.pos)<=gunRange()+ct.r+2){o.cd=GUN_VIS_INT;
      const hit=Math.random()<hitChance(),crit=hit&&Math.random()<critChance();const st=laserStyle();
      fireStreak(o.g.position.clone(),ct,{miss:!hit,crit,dmg:gunVolleyDmg()*ESCORT.dmg*(crit?critMult():1)*(1+(((bonus().rs||{}).escPct||0)+(rsK('s2')?RSK.s2.k:0))/100),side:'player',col:st.col,w:st.w,st:st.k==='bolt'||st.k==='primal'?'blue':st.k})}
    // ťažobný lúč
    if(o.mode==='mine'&&mineOn){if(!o.beam)o.beam=makeBeam('#2ee6ff');setBeam(o.beam,o.g.position,mineTarget.pos,.16+.04*Math.sin(tt*20+o.i),'#2ee6ff')}
    else if(o.beam)hideBeam(o.beam)}}

/* ---------- obchod (obchodník v sektore 5) a nastavenie lasera ---------- */
function escortShopHtml(near){if(state.cur!==ESCORT.sec)return'';const L=escList();
  let h=`<div class="sec-h"><span>${t('esc.h')}</span><span>${L.length}/${ESCORT.max}</span></div><div class="card escard">${escIcon('gun',true)}<h3>${t('esc.name')}</h3>`;
  if(L.length>=ESCORT.max)h+=`<button class="act max" disabled>${t('btn.max')}</button>`;
  else{const c=escortCost(L.length);h+=actBtn('escBuy',t('btn.buy'),c,!near)+`<div class="costs">${costHtml(c)}</div>`}
  h+=`<p>${t('esc.d',{d:Math.round(ESCORT.dmg*100),m:Math.round(ESCORT.mine*100)})}</p><div class="stat">${t('esc.ships')}</div></div>`;
  return h+escortModesHtml()}
function escortModesHtml(){const L=escList();if(!L.length)return'';
  return L.map((e,i)=>`<div class="card"><h3>${escIcon(e.mode)} ${t('esc.n',{n:i+1})} <span class="lv">${t('esc.m.'+e.mode)}</span></h3><div class="langs">${['gun','mine'].map(m=>`<button class="langb" data-act="escMode" data-i="${i}" data-v="${m}" aria-pressed="${e.mode===m}">${t('esc.m.'+m)}</button>`).join('')}</div>
    <p>${t('esc.m.'+e.mode+'.d',{d:Math.round(ESCORT.dmg*100),m:Math.round(ESCORT.mine*100)})}</p>${ESCORT.ships.includes(state.shipId)?'':`<div class="stat" style="color:var(--warn)">${t('esc.ships')}</div>`}</div>`).join('')}
const escIconSvg=()=>`<svg class="escico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.6"/><path d="M3.5 7.5l2 1v7l-2 1M20.5 7.5l-2 1v7l2 1"/></svg>`;
/* v0.22: náhľad z 3D modelu (mode = farba svetiel), inak SVG ikona */
const escPreview=(mode='gun')=>typeof modelPreview==='function'?modelPreview('esc_'+mode,()=>{const g=escortModel(mode);g.scale.setScalar(1);return g},{w:220,h:220,dir:[.7,.35,1],fit:.9}):'';
const escIcon=(mode='gun',big)=>{const s=escPreview(mode);return s?`<img class="escico${big?' big':''}" src="${s}" alt="">`:escIconSvg()};
function escortAct(act,b){if(act!=='escBuy'&&act!=='escMode')return false;const L=escList();
  if(act==='escBuy'){if(state.cur!==ESCORT.sec||L.length>=ESCORT.max)return true;if(!nearNpc('trader')){toast(t('trd.far'));return true}
    const c=escortCost(L.length);if(!afford(c)){toast(t('tt.noRes'));return true}pay(c);L.push({mode:'gun'});toast(t('esc.bought',{n:L.length}),true)}
  else{const e=L[+b.dataset.i];if(!e)return true;e.mode=b.dataset.v==='mine'?'mine':'gun'}
  save();renderSheet();updateHUD();return true}

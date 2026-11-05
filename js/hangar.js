'use strict';
/* ==================== == 16b. HANGÁR (v0.8) ====================
   Panel Loď → záložka Hangár: zoznam lodí zo SHIPS (data.js). Loď sa kupuje za suroviny a kredity, keď je obsadený
   sektor SHIPS[id].need. Prestúpiť na inú loď sa dá len pri stanici; náklad sa pritom vyloží na stanicu.
   Každá loď si pamätá vlastné úrovne vylepšení (state.hangar), predmety vo výbave zostávajú nasadené. */

/* Siluety lodí zhora (SVG) pre hangár a príručku. */
const SHIP_SVG={
  klepeto:`<path d="M40 50 C 20 44, 18 20, 40 8" stroke="#b9c6d4" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M60 50 C 80 44, 82 20, 60 8" stroke="#b9c6d4" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M38 44 C 25 38, 24 22, 38 13" stroke="#58d0c0" stroke-width="1.6" fill="none"/><path d="M62 44 C 75 38, 76 22, 62 13" stroke="#58d0c0" stroke-width="1.6" fill="none"/>
    <path d="M42 38 L58 38 L62 76 L38 76 Z" fill="#4a5a6e"/><rect x="33" y="74" width="34" height="11" rx="2" fill="#4a5a6e"/><circle cx="50" cy="30" r="5" fill="#7ef2e2"/>
    <circle cx="40" cy="89" r="3" fill="#6fe3ff"/><circle cx="50" cy="89" r="3" fill="#6fe3ff"/><circle cx="60" cy="89" r="3" fill="#6fe3ff"/>`,
  sokol:`<path d="M50 6 L58 44 L90 70 L88 78 L58 66 L56 84 L44 84 L42 66 L12 78 L10 70 L42 44 Z" fill="#4a5a6e"/><path d="M50 6 L56 40 L44 40 Z" fill="#b9c6d4"/>
    <ellipse cx="50" cy="38" rx="4" ry="8" fill="#ffb35a"/><path d="M58 46 L88 70" stroke="#ffb35a" stroke-width="2"/><path d="M42 46 L12 70" stroke="#ffb35a" stroke-width="2"/>
    <rect x="40" y="22" width="3" height="16" fill="#1d2635"/><rect x="57" y="22" width="3" height="16" fill="#1d2635"/><circle cx="45" cy="88" r="3.5" fill="#ffc070"/><circle cx="55" cy="88" r="3.5" fill="#ffc070"/>`,
  bizon:`<rect x="38" y="8" width="24" height="20" rx="3" fill="#b9c6d4"/><rect x="40" y="9" width="20" height="3" fill="#b38bff"/><rect x="44" y="26" width="12" height="60" fill="#4a5a6e"/>
    <rect x="22" y="34" width="18" height="46" rx="2" fill="#1d2635"/><rect x="60" y="34" width="18" height="46" rx="2" fill="#1d2635"/>
    <rect x="22" y="44" width="18" height="2" fill="#b38bff"/><rect x="22" y="58" width="18" height="2" fill="#b38bff"/><rect x="60" y="44" width="18" height="2" fill="#b38bff"/><rect x="60" y="58" width="18" height="2" fill="#b38bff"/>
    <circle cx="31" cy="85" r="4" fill="#c3a0ff"/><circle cx="69" cy="85" r="4" fill="#c3a0ff"/><circle cx="45" cy="92" r="3.5" fill="#c3a0ff"/><circle cx="55" cy="92" r="3.5" fill="#c3a0ff"/>`};
const shipIconSvg=(id,cls='hship')=>`<svg class="${cls}" viewBox="0 0 100 100" role="img" aria-label="${t('ship.'+id)}">${SHIP_SVG[id]}</svg>`;
/* v0.22: náhľad lode z 3D modelu (spredu, mierne zboku a zhora, ako na výstave); bez Three.js (samostatná príručka) silueta SVG */
function shipPreviewSrc(id){if(typeof modelPreview!=='function'||typeof THREE==='undefined')return'';
  return modelPreview('ship_'+id,()=>{const g=new THREE.Group(),body=new THREE.Group();g.add(body);const keep=ship.userData.eng;ship.userData.eng=[];
    const info=SHIP_MODELS[id](body);glbApply('ship.'+id,body);ship.userData.eng=keep;const cg=glow(info.coreCol,2.6,.8);cg.position.set(...info.core);body.add(cg);
    if(info.coreMesh){const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.3,1),M.hullGlow);core.position.set(...info.core);body.add(core)}return g},{w:360,h:220,dir:[.5,.3,1],fit:.62}   /* bez pozadia a spotu */)}
const shipIcon=(id,cls='hship')=>{const src=shipPreviewSrc(id);return src?`<img class="${cls} pv" src="${src}" alt="${t('ship.'+id)}">`:shipIconSvg(id,cls)};
/* Krátky prehľad násobkov lode, napr. „Rýchlosť ×1.2 · Náklad ×0.6“. */
const MUL_KEYS=['speed','turn','hull','cargo','shield','laser','gun'];
const MUL_LBL={speed:'s.speed',turn:'s.turn',hull:'s.hull',cargo:'s.cargo',shield:'s.shield',laser:'s.mine',gun:'s.dmg'}; // krátke názvy
function mulLine(id){const m=SHIPS[id].mul;const parts=MUL_KEYS.filter(k=>m[k]&&m[k]!==1).map(k=>`<span class="${m[k]>1?'up':'dn'}">${t(MUL_LBL[k])} ×${m[k]}</span>`);
  return parts.length?parts.join(' · '):t('hg.base')}
const shipUnlocked=id=>SHIPS[id].need<0||!!(state.sec[SHIPS[id].need]&&state.sec[SHIPS[id].need].captured);

function renderHangar(){let h=`<p class="note">${t('hg.note')}</p>`;const near=nearStation();
  for(const id of SHIP_IDS){const S=SHIPS[id];const own=state.owned.includes(id),act=state.shipId===id;
    h+=`<div class="card hcard${act?' on':''}${shipPreviewSrc(id)?' big':''}" style="--sc:${S.col}">${shipIcon(id,'hship hprev')}<h3>${t('ship.'+id)} ${act?`<span class="chip here">${t('hg.active')}</span>`:own?`<span class="chip won">${t('hg.owned')}</span>`:''}</h3>`;
    if(act)h+=`<button class="act max" disabled>${t('hg.flying')}</button>`;
    else if(own)h+=`<button class="act" data-act="shipUse" data-id="${id}" data-block="${near?0:1}">${t('hg.use')}</button>`;
    else if(!shipUnlocked(id))h+=`<button class="act max" disabled>${t('btn.locked')}</button>`;
    else h+=actBtn('shipBuy',t('btn.buy'),S.cost,false,`data-id="${id}"`)+`<div class="costs">${costHtml(S.cost)}</div>`;
    h+=`<p>${t('ship.'+id+'.d')}</p><div class="stat hmul">${S.extra?`<span class="up">${t('hg.extra',{s:S.extra.map(x=>t('slot.'+x)).join(', ')})}</span> · `:''}${mulLine(id)}${S.upMul!==1?` · <span class="dn">${t('hg.upCost',{n:S.upMul})}</span>`:''}</div>`;
    if(!own&&!shipUnlocked(id))h+=`<div class="stat" style="color:var(--warn)">${t('hg.need',{s:secName(S.need)})}</div>`;
    else if(own&&!act&&!near)h+=`<div class="stat">${t('hg.far')}</div>`;
    h+='</div>'}
  if(escList().length)h+=`<div class="sec-h"><span>${t('esc.h')}</span><span>${escList().length}/${ESCORT.max}</span></div>`+escortModesHtml();   // v0.20
  return h}

/* Prestup na inú kúpenú loď (len pri stanici). Pomer trupu sa zachová, štíty sa nabijú. */
function switchShip(id){if(!state.owned.includes(id)||state.shipId===id)return;
  const hr=state.hp/Math.max(1,shipVal('hull'));
  for(const r of RES){state[r]+=state.cargo[r];state.cargo[r]=0}
  state.hangar[state.shipId]=state.ship;state.ship=state.hangar[id]||baseLevels();delete state.hangar[id];state.shipId=id;
  // v0.40.3: predmety zo slotov, ktoré nová loď nemá (druhý laser/štít), sa vrátia do inventára
  {const ok=shipSlots();for(const s of ALL_SLOTS)if(!ok.includes(s)&&state.eq[s]){state.inv.push(state.eq[s]);state.eq[s]=null;toast(t('tt.slotBack',{s:t('slot.'+s)}))}}
  bonusDirty();
  state.hp=Math.max(1,Math.round(hr*shipVal('hull')));state.sh=shieldMax();state.radCharge=Math.min(state.radCharge,shipVal('radShield'));
  buildShip(id);toast(t('tt.shipUse',{n:t('ship.'+id)}),true)}
function hangarAct(act,b){
  if(act==='shipUse'){if(!nearStation()){toast(t('hg.far'));return true}switchShip(b.dataset.id);changed();return true}
  if(act==='shipBuy'){const id=b.dataset.id;const S=SHIPS[id];if(!S||state.owned.includes(id)||!shipUnlocked(id)||!afford(S.cost))return true;
    pay(S.cost);state.owned.push(id);state.hangar[id]=baseLevels();toast(t('tt.shipBuy',{n:t('ship.'+id)}),true);
    if(nearStation())switchShip(id);changed();return true}
  return false}

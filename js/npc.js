'use strict';
/* ==================== == 16g. LODE NPC: zadávateľ misií a obchodník (v0.15) ====================
   Zadávateľ misií (fialová loď) stojí v každom sektore v páse 2. Menu misií sa otvorí ťuknutím na neho
   (loď k nemu doletí) alebo keď sa k nemu ručne priblížiš do NPC_RANGE.
   Obchodník (zlatá loď) je len v sektoroch v TRADER_SECS, na hranici pásov 2/3 (mimo radiácie, ďalej od stanice).
   Predáva predmety za kredity – ponuka sa po TRADER_TIME sekundách zmení; v sektore 5 občas aj Epický predmet.
   Predmety mu predáš výhodnejšie než pri rozoberaní (× TRADER_SELL hodnoty rozobratia). */
const NPC_RANGE=16;
const TRADER_SECS=[2,4];                                  // indexy sektorov (3. a 5. mapa)
const TRADER_TIME=600,TRADER_STOCK=6,TRADER_BUY=8,TRADER_SELL=2.5;
const TRADER_RAR={2:{max:4,top:.5},4:{max:5,top:.06}};    // strop rarity ponuky (5. mapa: Epické len zriedka)
let npcs=[],npcOpenOnArrive=null,npcNear={};
function npcPos(kind){const S=SECTORS[state.cur];const r=rng(S.seed*31+(kind==='trader'?7:3));const a=r()*TAU;
  const d=kind==='trader'?Z2-10:(Z1+Z2)/2;return new V3(Math.cos(a)*d,0,Math.sin(a)*d)}
function makeNpcShip(kind){const g=new THREE.Group();const col=kind==='trader'?'#ffd27a':MCOL;
  const mat=new THREE.MeshStandardMaterial({color:col_(col,.25),metalness:.6,roughness:.4,flatShading:true});
  const em=new THREE.MeshStandardMaterial({color:col_(col,.1),emissive:new THREE.Color(col),emissiveIntensity:1.6});
  const hull=new THREE.Mesh(new THREE.CylinderGeometry(1.6,2.4,9,8),mat);hull.rotation.z=Math.PI/2;g.add(hull);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(3.6,.35,6,24),M.metal);ring.rotation.y=Math.PI/2;g.add(ring);
  if(kind==='trader'){for(const s of[-1,1]){const pod=new THREE.Mesh(new THREE.BoxGeometry(3,2,2.4),M.plate);pod.position.set(0,0,3*s);g.add(pod);
      const st=new THREE.Mesh(new THREE.BoxGeometry(3.1,.25,2.5),em);st.position.set(0,1.05,3*s);g.add(st)}}
  else{const dish=new THREE.Mesh(new THREE.ConeGeometry(2.2,1.2,12,1,true),M.metal);dish.position.set(0,2.4,0);g.add(dish);
    const ant=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,3,6),em);ant.position.set(0,3.6,0);g.add(ant)}
  const light=new THREE.Mesh(new THREE.BoxGeometry(8,.3,.3),em);light.position.y=1.4;g.add(light);
  const gl=glow(col,14,.35);g.add(gl);g.userData.glow=gl;
  const halo=new THREE.Mesh(new THREE.RingGeometry(NPC_RANGE-.4,NPC_RANGE,64),new THREE.MeshBasicMaterial({color:new THREE.Color(col),transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  halo.rotation.x=-Math.PI/2;halo.position.y=-1.5;g.add(halo);
  const proxy=new THREE.Mesh(new THREE.SphereGeometry(6,8,6),M.pick);proxy.userData.npc=kind;g.add(proxy);g.userData.proxy=proxy;return g}
function col_(c,k){const x=new THREE.Color(c);if(x.multiplyScalar)x.multiplyScalar(k);return x}
function buildNpcs(){npcs=[];npcNear={};npcOpenOnArrive=null;if(SECTORS[state.cur].arena)return;
  const kinds=['giver'];if(TRADER_SECS.includes(state.cur))kinds.push('trader');
  for(const k of kinds){const g=makeNpcShip(k);const p=npcPos(k);g.position.copy(p).setY(1);g.lookAt(0,1,0);world.add(g);pickables.push(g.userData.proxy);npcs.push({kind:k,g,pos:p})}}
const npcOf=k=>npcs.find(n=>n.kind===k);
function npcDist(k){const n=npcOf(k);return n?Math.hypot(ship.position.x-n.pos.x,ship.position.z-n.pos.z):1e9}
const nearNpc=k=>npcDist(k)<NPC_RANGE+2;
const NPC_SHEET={giver:'missions',trader:'trader'};
/* ťuknutie na NPC: pri ňom otvorí menu, inak k nemu loď doletí a menu otvorí po prílete */
function npcTap(k){const n=npcOf(k);if(!n)return;if(nearNpc(k)){openSheet(NPC_SHEET[k]);return}
  const d=new V3().subVectors(ship.position,n.pos).setY(0);const L=d.length()||1;cmdMove(n.pos.clone().addScaledVector(d,(NPC_RANGE-6)/L));npcOpenOnArrive=k;flashMarker(n.pos,k==='trader'?'#ffd27a':MCOL)}
function tickNpc(dt,tt){for(const n of npcs){n.g.rotation.y+=dt*.05;const s=14*(1+.12*Math.sin(tt*2));n.g.userData.glow.scale.set(s,s,1);
    const near=nearNpc(n.kind);
    if(near&&!npcNear[n.kind]){npcNear[n.kind]=true;
      // automaticky otvorí menu pri ručnom priblížení (nie počas autopilota) alebo po prílete na ťuknutie
      if(npcOpenOnArrive===n.kind||(!state.autoPilot&&!sheetTab&&!dead))openSheet(NPC_SHEET[n.kind]);npcOpenOnArrive=null}
    else if(!near&&npcDist(n.kind)>NPC_RANGE+10)npcNear[n.kind]=false}
  if(sheetTab==='trader'){const T=tstate();if(Date.now()>=T.until){renderSheet()}}}

/* ---------- obchodník ---------- */
function tstate(){if(!state.trader)state.trader={};let T=state.trader[state.cur];
  if(!T||Date.now()>=T.until){T=state.trader[state.cur]={until:Date.now()+TRADER_TIME*1000,stock:traderStock()}}return T}
function traderStock(){const cap=TRADER_RAR[state.cur]||{max:4,top:.3};const a=[];
  for(let i=0;i<TRADER_STOCK;i++){const r=rollRarity(1+state.cur*.3+(typeof tierMul==='function'?tierMul('mf'):0),2,cap);a.push(genItem(r,SECTORS[state.cur].ilvl+5+Math.floor(Math.random()*4),Math.random()<.15?pick(CHIP_BASES):null))}return a}
const buyPrice=it=>Math.round(RAR[it.r].salv*(1+it.ilvl/10)*NUM*TRADER_BUY*secGain(state.cur));
const sellPrice=it=>Math.round(salvValue(it)*TRADER_SELL);
function renderTrader(){const T=tstate(),near=nearNpc('trader');const left=Math.max(0,Math.ceil((T.until-Date.now())/1000));
  let h=`<div class="gear-top"><span class="credits"><span class="coin"></span>${fmtN(state.credits)} ¢</span><span class="note" style="margin:0">${t('trd.refresh',{t:Math.floor(left/60)+':'+String(left%60).padStart(2,'0')})}</span></div>`;
  if(!near)h+=`<p class="note" style="color:var(--warn)">${t('trd.far')}</p>`;
  h+=`<div class="sec-h"><span>${t('trd.buyH')}</span></div>`;
  h+=T.stock.length?`<div class="trgrid">${T.stock.map(it=>`<div class="trrow it r${it.r}" ${rc(it)}><button class="itm it r${it.r}" ${rc(it)} data-act="trSel" data-id="${it.id}">${icon(it.b)}<span class="il">${it.ilvl}</span></button>
    <div class="eqc-txt"><b>${itemName(it)}</b><small>${t('r.'+RAR[it.r].k)} · ${t('slot.'+BASES[it.b].slot)}</small><small>${itemStats(it).slice(0,2).map(x=>`${t('s.'+x.k)} ${fmtStat(x.k,x.v)}`).join(' · ')}</small></div>
    ${actBtn('trBuy',fmtN(buyPrice(it))+' ¢',{ore:0,green:0,crystal:0,cr:buyPrice(it)},!near,`data-id="${it.id}"`)}</div>`).join('')}</div>`:`<p class="note">${t('trd.sold')}</p>`;
  h+=`<div class="sec-h"><span>${t('trd.sellH',{x:TRADER_SELL})}</span><span>${t('gear.inv',{a:state.inv.length,b:INV_MAX})}</span></div>`;
  const inv=state.inv.slice().sort(byRarity);
  h+=inv.length?`<div class="inv">${inv.map(it=>`<button class="itm it r${it.r}" ${rc(it)} data-act="trSell" data-id="${it.id}" ${near&&!it.lock?'':'disabled'} title="${fmtN(sellPrice(it))} ¢">${icon(it.b)}${it.enh?`<span class="enh">+${it.enh}</span>`:''}<span class="il">${fmtN(sellPrice(it))}</span>${it.lock?'<i class="lk">🔒</i>':''}</button>`).join('')}</div><p class="note">${t('trd.sellD')}</p>`:`<p class="note">${t('gear.none')}</p>`;
  return h}
function traderAct(act,b){if(act!=='trBuy'&&act!=='trSell'&&act!=='trSel')return false;const T=tstate();
  if(act==='trSel')return true;
  if(!nearNpc('trader')){toast(t('trd.far'));return true}
  if(act==='trBuy'){const i=T.stock.findIndex(x=>x.id===+b.dataset.id);if(i<0)return true;const it=T.stock[i],p=buyPrice(it);
    if(state.credits<p){toast(t('tt.noRes'));return true}if(state.inv.length>=INV_MAX){toast(t('tt.invFull'),'bad');return true}
    state.credits-=p;T.stock.splice(i,1);state.inv.push(it);toast(t('trd.bought',{n:itemName(it),c:p}),{rar:it.r})}
  else{const i=state.inv.findIndex(x=>x.id===+b.dataset.id);if(i<0)return true;const it=state.inv[i];if(it.lock)return true;
    if(it.r>=4&&(!b.dataset.arm||performance.now()-(+b.dataset.arm)>3000)){b.dataset.arm=performance.now();b.classList.add('arm');toast(t('trd.sure'));return true}
    const p=sellPrice(it);state.credits+=p;state.inv.splice(i,1);invWarned=false;toast(t('trd.soldOne',{n:itemName(it),c:p}))}
  save();renderSheet();updateHUD();return true}

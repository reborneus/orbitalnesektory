'use strict';
/* ==================== == 16g. LODE NPC: zadávateľ misií a obchodník (v0.15) ====================
   Zadávateľ misií (fialová loď) stojí v každom sektore v páse 2. Menu misií sa otvorí ťuknutím na neho
   (loď k nemu doletí) alebo keď sa k nemu ručne priblížiš do NPC_RANGE.
   Obchodník (zlatá loď) je len v sektoroch v TRADER_SECS, na hranici pásov 2/3 (mimo radiácie, ďalej od stanice).
   Predáva predmety za kredity – ponuka sa po TRADER_TIME sekundách zmení; v sektore 5 občas aj Epický predmet.
   Predmety mu predáš výhodnejšie než pri rozoberaní (× TRADER_SELL hodnoty rozobratia). */
const NPC_RANGE=16;
const TRADER_SECS=[0,1,2,3,4,5];                          // v0.47: obchodník je na každej mape (okrem arény)
const TRADER_TIME=600,TRADER_STOCK=6,TRADER_BUY=8,TRADER_SELL=2.5;
const TRADER_RAR={0:{max:3,top:.4},1:{max:3,top:.7},2:{max:4,top:.5},3:{max:4,top:.8},4:{max:5,top:.06},5:{max:5,top:.15}};    // strop rarity ponuky podľa mapy
let npcs=[],npcOpenOnArrive=null,npcNear={};
function npcPos(kind){const S=SECTORS[state.cur];const r=rng(S.seed*31+(kind==='trader'?7:3));const a=r()*TAU;
  const d=kind==='trader'?Z2-10:(Z1+Z2)/2;return new V3(Math.cos(a)*d,0,Math.sin(a)*d)}
/* ==================== v0.47: MODELY NPC ====================
   Zadávateľ misií = biela veža s červenými prvkami (podľa predlohy): široká základňa so žiariacim podbruškom,
   vysoká hranatá veža s červenou svetelnou štrbinou, dve zahnuté čepele po bokoch, tmavé jadro s červenými oknami a dve antény.
   Obchodník = tmavosivá bojová stanica s modrými svetlami: dlhý pancierový trup s nadstavbami a vežami, uprostred kruhový
   disk s kupolou a sústrednými modrými prstencami, bočné moduly a niekoľko malých lodí v sprievode.
   Všetko je procedurálne (shipkit.js); diely s rovnakým materiálom sa zlúčia do jednej siete. */
const _npcM={};
function npcMats(){if(_npcM.w)return _npcM;
  _npcM.w=kitHullMat('npcW',{base:'#dfe3e8',vari:.07,line:'#8d939c',lit:['#ff3a2a'],litP:.02,trim:'#ff2a1a',trimP:.05,seed:41},{metalness:.3,roughness:.36,emissiveIntensity:1.8});
  _npcM.gd=kitHullMat('npcGD',{base:'#17191e',vari:.22,line:'#08090b',lit:['#ff3a2a','#ff6a4a'],litP:.16,seed:42},{metalness:.7,roughness:.38,emissiveIntensity:2.4});
  _npcM.red=kitGlowMat('#ff1505',1.9);
  _npcM.td=kitHullMat('npcTD',{base:'#2b2f36',vari:.26,line:'#101216',lit:['#3fa8ff','#7fd0ff'],litP:.12,trim:'#3a8fff',trimP:.04,seed:43},{metalness:.72,roughness:.42,emissiveIntensity:2.2,flatShading:true});
  _npcM.tk=kitHullMat('npcTK',{base:'#1a1d22',vari:.3,line:'#0a0b0d',lit:['#3fa8ff'],litP:.2,seed:44},{metalness:.75,roughness:.45,emissiveIntensity:2.4,flatShading:true});
  _npcM.blue=kitGlowMat('#2a8cff',2.1);return _npcM}
function giverModel(g){const K=npcMats(),P=kitParts(),U=-Math.PI/2;
  // základňa: plochý zaoblený trup + spodná tmavá vrstva
  P.add(K.w,kitLoft([{z:-6.5,w:2.6,h:.9,hb:.6},{z:-4,w:4.6,h:1.3,hb:.9},{z:2,w:5,h:1.4,hb:1},{z:5.5,w:3.6,h:1,hb:.8},{z:7,w:1.6,h:.5,hb:.4}],{n:10,p:3}));
  P.add(K.gd,kitLoft([{z:-5.5,w:2.4,h:.3},{z:-3,w:4,h:.4},{z:3,w:4.2,h:.4},{z:6,w:2,h:.3}],{n:8,p:3}),{p:[0,-1.1,0]});
  // vysoká veža: hranatý ihlan (rez kosoštvorec → špička), stojí zvislo
  P.add(K.w,kitLoft([{z:0,w:2.2,h:1.6},{z:6,w:1.8,h:1.3},{z:12,w:1.2,h:.9},{z:17,w:.55,h:.45},{z:20.5,w:.08,h:.08}],{n:6,p:1.25}),{p:[0,1.2,-.6],r:[U,0,0]});
  P.add(K.red,new THREE.BoxGeometry(.22,17.5,.2),{p:[0,10.4,.75]});                     // červená štrbina vpredu veže
  P.add(K.red,new THREE.BoxGeometry(.18,9,.18),{p:[0,7,-2.05]});                         // a vzadu
  // tmavé jadro za vežou s oknami
  P.add(K.gd,kitLoft([{z:0,w:1.9,h:1.6},{z:7,w:1.6,h:1.3},{z:11.5,w:.9,h:.8}],{n:8,p:2.4}),{p:[0,1,-2.4],r:[U,0,0]});
  // dve zahnuté čepele po bokoch (zvislé dosky podľa obrysu, zrkadlovo)
  // (obrys v rovine XZ: x = von od veže, z = výška; otočením okolo osi x sa postaví zvislo)
  const blade=kitSlab([[0,0],[1.6,.6],[2.8,3],[3.1,7],[2.3,11.5],[1.6,8.5],[.9,4.5],[.2,1.6]],.6,{bev:.14});
  P.add(K.w,blade,{p:[1.7,.9,.3],r:[U,0,0],m:true});
  P.add(K.red,new THREE.BoxGeometry(.14,5.2,.2),{p:[4.65,5.2,.3],r:[0,0,.08],m:true});     // svetelné hrany čepelí
  P.add(K.red,new THREE.BoxGeometry(.14,3.2,.2),{p:[3.05,4.2,.3],r:[0,0,-.2],m:true});
  // bočné krídla základne so svetlami a menšie čepele vpredu
  P.add(K.w,kitSlab([[0,-3],[2.6,-1.6],[3.4,1.5],[1.8,3],[0,2.4]],.5),{p:[4,-.1,0],m:true});
  P.add(K.red,new THREE.BoxGeometry(2.4,.14,.14),{p:[5.4,.2,1.8],r:[0,-.5,0],m:true});
  P.add(K.w,kitSlab([[0,0],[1.1,.8],[1.4,3.6],[.6,1.8]],.4),{p:[3.4,.9,3.6],r:[U,0,0],m:true});   // menšie čepele vpredu
  // podbruško: červené žiariace pásy a predné svetlo
  for(const z of[-3.5,-1.5,.5,2.5])P.add(K.red,new THREE.BoxGeometry(6.4,.12,.3),{p:[0,-1.35,z]});
  P.add(K.red,new THREE.BoxGeometry(2.6,.25,.2),{p:[0,.2,6.9]});
  // antény s červenými hrotmi
  for(const x of[-1.1,1.1]){P.add(K.gd,new THREE.CylinderGeometry(.05,.07,7,6),{p:[x,17,-1.4]});P.add(K.red,new THREE.SphereGeometry(.13,8,6),{p:[x,20.6,-1.4]})}
  P.done(g);
  for(const[x,y,z,sz]of[[0,-1.6,0,9],[0,20.6,-1.4,3],[0,1,6.9,4],[-3.3,-1.2,-3,4],[3.3,-1.2,-3,4]]){const l=glow('#ff3a2a',sz,.75);l.position.set(x,y,z);g.add(l)}}
function traderModel(g){const K=npcMats(),P=kitParts();
  // hlavný pancierový trup (dlhý, hranatý), nos vpredu sa zužuje
  P.add(K.td,kitLoft([{z:-12,w:2.2,h:1.4},{z:-8,w:2.8,h:1.8},{z:-2,w:3,h:2},{z:6,w:2.8,h:1.8},{z:11,w:1.9,h:1.3},{z:14,w:.9,h:.7}],{n:8,p:3.2}));
  // nadstavby a bloky na trupe
  const r=rng(77);
  for(let i=0;i<16;i++){const z=-11+r()*23,x=(r()-.5)*3.6,w=.8+r()*1.6,h=.5+r()*1.4,d=1+r()*2.4;P.add(r()<.5?K.td:K.tk,new THREE.BoxGeometry(w,h,d),{p:[x,1.6+h/2,z]})}
  // veže (vzadu vyššie)
  for(const[x,z,h]of[[0,-9,6],[-1,-6.5,4.2],[1.2,-7.5,3.4],[.4,-3.5,2.6]]){P.add(K.tk,new THREE.BoxGeometry(.9,h,.9),{p:[x,1.8+h/2,z]});P.add(K.gd||K.tk,new THREE.CylinderGeometry(.04,.06,2.2,5),{p:[x,1.8+h+1.1,z]})}
  // bočné moduly
  P.add(K.td,kitLoft([{z:-7,w:1.2,h:.9},{z:-4,w:1.6,h:1.1},{z:5,w:1.5,h:1},{z:8,w:.8,h:.6}],{n:8,p:3}),{p:[5.6,0,-2],m:true});
  P.add(K.tk,new THREE.BoxGeometry(2.8,.5,1.2),{p:[3.9,0,-1],m:true});                 // spojovacie nosníky
  // kruhový disk uprostred: hrubý prstenec, kupola, sústredné modré prstence
  P.add(K.td,new THREE.CylinderGeometry(6.2,6.8,1.8,40,1),{p:[0,.6,1]});
  P.add(K.tk,new THREE.CylinderGeometry(4.4,5.6,.7,40,1),{p:[0,1.85,1]});
  P.add(K.td,new THREE.SphereGeometry(3.2,32,12,0,TAU,0,Math.PI/2),{p:[0,2.1,1],s:[1,.6,1]});
  P.add(K.tk,new THREE.CylinderGeometry(1.2,1.6,.8,16),{p:[0,4,1]});
  for(const[rr,y]of[[6.3,1.55],[5.1,2.22],[3.6,2.5],[2.2,3.6]])P.add(K.blue,new THREE.TorusGeometry(rr,.07,6,64),{p:[0,y,1],r:[-Math.PI/2,0,0]});
  for(let i=0;i<12;i++){const a=i/12*TAU;P.add(K.blue,new THREE.BoxGeometry(.9,.3,.12),{p:[Math.cos(a)*6.75,.7,1+Math.sin(a)*6.75],r:[0,-a+Math.PI/2,0]})}   // okná po obvode disku
  // modré pásy okien na trupe a motory vzadu
  for(const s of[-1,1])for(const z of[-10,-6,6,9.5])P.add(K.blue,new THREE.BoxGeometry(.08,.22,2.2),{p:[s*2.85,.4,z]});
  for(const x of[-1.2,0,1.2])P.add(K.blue,new THREE.CylinderGeometry(.45,.45,.2,12),{p:[x,.2,-12.1],r:[Math.PI/2,0,0]});
  P.done(g);
  for(const[x,y,z,sz]of[[0,2.6,1,10],[-1.2,.2,-12.6,3],[0,.2,-12.6,3],[1.2,.2,-12.6,3],[0,4.6,1,3]]){const l=glow('#3a9cff',sz,.7);l.position.set(x,y,z);g.add(l)}
  // malé lode v sprievode
  const sm=new THREE.Group();const PS=kitParts();
  for(const[x,y,z,ry]of[[9,1.5,5,.3],[-8.5,2,-6,-.2],[7.5,-1,-9,.1],[-9.5,.5,8,-.4]]){
    PS.add(K.tk,kitLoft([{z:-1.2,w:.5,h:.3},{z:0,w:.7,h:.35},{z:1.4,w:.15,h:.1}],{n:6,p:1.6}),{p:[x,y,z],r:[0,ry,0]});
    PS.add(K.blue,new THREE.BoxGeometry(.3,.12,.1),{p:[x-Math.sin(ry)*1.25,y,z-Math.cos(ry)*1.25],r:[0,ry,0]})}
  PS.done(sm);g.add(sm)}
function makeNpcShip(kind){const g=new THREE.Group();const col=kind==='trader'?'#3a9cff':'#ff3a2a';
  if(kind==='trader')traderModel(g);else giverModel(g);
  const gl=glow(col,14,.22);g.add(gl);g.userData.glow=gl;
  const halo=new THREE.Mesh(new THREE.RingGeometry(NPC_RANGE-.4,NPC_RANGE,64),new THREE.MeshBasicMaterial({color:new THREE.Color(col),transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  halo.rotation.x=-Math.PI/2;halo.position.y=-1.5;g.add(halo);
  glbApply('npc.'+kind,g);   // v0.40: vlastný model z js/models.js
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
      if(npcOpenOnArrive===n.kind&&!dead)openSheet(NPC_SHEET[n.kind]);npcOpenOnArrive=null}   /* v0.33: len po kliku na tlačidlo, nie pri prelete */
    else if(!near&&npcDist(n.kind)>NPC_RANGE+10)npcNear[n.kind]=false}
  if(sheetTab==='trader'){const T=tstate();if(Date.now()>=T.until){renderSheet()}}}

/* ---------- obchodník ---------- */
function tstate(){if(!state.trader)state.trader={};let T=state.trader[state.cur];
  if(!T||Date.now()>=T.until){T=state.trader[state.cur]={until:Date.now()+TRADER_TIME*1000,stock:traderStock()}}return T}
function traderStock(){const cap=TRADER_RAR[state.cur]||{max:4,top:.3};const a=[];
  for(let i=0;i<TRADER_STOCK;i++){const r=rollRarity(1+state.cur*.3,2,cap,1+(typeof tierMul==='function'?tierMul('mf'):0));a.push(genItem(r,SECTORS[state.cur].ilvl+5+Math.floor(Math.random()*4),Math.random()<.15?pick(CHIP_BASES):null))}return a}
const buyPrice=it=>Math.round(RAR[it.r].salv*(1+it.ilvl/10)*NUM*TRADER_BUY*secGain(state.cur));
const sellPrice=it=>Math.round(salvValue(it)*TRADER_SELL);
function renderTrader(){const T=tstate(),near=nearNpc('trader');const left=Math.max(0,Math.ceil((T.until-Date.now())/1000));
  let h=`<div class="gear-top"><span class="credits"><span class="coin"></span>${fmtN(state.credits)} ¢</span><span class="note" style="margin:0">${t('trd.refresh',{t:Math.floor(left/60)+':'+String(left%60).padStart(2,'0')})}</span></div>`;
  if(!near)h+=`<p class="note" style="color:var(--warn)">${t('trd.far')}</p>`;
  h+=escortShopHtml(near);   // v0.20: pomocné drony (len sektor 5)
  h+=`<div class="sec-h"><span>${t('trd.buyH')}</span></div>`;
  h+=T.stock.length?`<div class="trgrid">${T.stock.map(it=>`<div class="trrow it r${it.r}" ${rc(it)}><button class="itm it r${it.r}" ${rc(it)} data-act="trSel" data-id="${it.id}">${icon(it.b)}<span class="il">${it.ilvl}</span></button>
    <div class="eqc-txt"><b>${itemName(it)}</b><small>${t('r.'+RAR[it.r].k)} · ${t('slot.'+BASES[it.b].slot)}</small><small>${itemStats(it).slice(0,2).map(x=>`<span class="qs${qCls(x.q)}">${t('s.'+x.k)} ${fmtStat(x.k,x.v)}</span>`).join(' · ')}</small></div>
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

'use strict';
/* ==================== v0.45: VEĽKÁ MAPA (len PC, kláves TAB) ====================
   Celá obrazovka s mapou sektora (rovnaké kreslenie ako minimapa – paintMap v input.js). Myšou nad značkou sa ukáže,
   čo tam je: asteroid (surovina, koľko z neho ešte vyťažíš, ako dlho to potrvá), pirát (druh, výdrž, poškodenie, správanie),
   korisť, cieľ misie, NPC, brána, stanica, miesto smrti. Koliesko = priblíženie, ťahanie = posun,
   klik = let na miesto / ťažba asteroidu / útok na piráta. TAB alebo Esc mapu zavrie. */
let bigEl=null,bigCv=null,bigG=null,bigHits=[],bigHov=null,bigMouse=null,bigT=0;
const bigView={z:1,cx:0,cz:0};
const bigOpen=()=>!!(bigEl&&!bigEl.hidden);
const bigAllowed=()=>matchMedia('(pointer: fine)').matches;   // len PC (myš)
function bigInit(){bigEl=document.createElement('div');bigEl.id='bigMap';bigEl.hidden=true;
  bigEl.innerHTML=`<canvas></canvas><div class="bm-top glass"></div><div class="bm-tip glass" hidden></div><div class="bm-legend glass"></div>`;
  document.body.appendChild(bigEl);bigCv=bigEl.querySelector('canvas');bigG=bigCv.getContext('2d');
  let drag=null;
  bigCv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,cx:bigView.cx,cz:bigView.cz,moved:false};bigCv.setPointerCapture(e.pointerId)});
  bigCv.addEventListener('pointermove',e=>{bigMouse={x:e.clientX,y:e.clientY};
    if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)drag.moved=true;if(drag.moved){const k=bigK();bigView.cx=drag.cx-dx/k;bigView.cz=drag.cz-dy/k}}});
  bigCv.addEventListener('pointerup',e=>{if(drag&&!drag.moved)bigClick(e);drag=null});
  bigCv.addEventListener('pointerleave',()=>{bigMouse=null});
  bigCv.addEventListener('wheel',e=>{e.preventDefault();const k0=bigK(),wx=bigView.cx+(e.clientX-innerWidth/2)/k0,wz=bigView.cz+(e.clientY-innerHeight/2)/k0;
    bigView.z=clamp(bigView.z*Math.exp(-e.deltaY*.0015),1,8);const k1=bigK();bigView.cx=wx-(e.clientX-innerWidth/2)/k1;bigView.cz=wz-(e.clientY-innerHeight/2)/k1},{passive:false});
  bigCv.addEventListener('contextmenu',e=>e.preventDefault())}
/* pixely na meter: pri z = 1 sa celý sektor (po hranicu LIMIT) zmestí na obrazovku */
const bigK=()=>Math.min(innerWidth,innerHeight)*.46/LIMIT*bigView.z;
function bigToggle(){if(!bigAllowed()&&!bigOpen())return;if(!bigEl)bigInit();
  if(bigOpen()){bigEl.hidden=true;sfx('close');return}
  if(typeof closeSheet==='function'&&sheetTab)closeSheet();bigView.z=1;bigView.cx=0;bigView.cz=0;bigEl.hidden=false;sfx('open');bigDraw()}
function bigTick(dt){if(!bigOpen())return;bigT-=dt;if(bigT>0)return;bigT=.05;bigDraw()}
function bigDraw(){const dpr=Math.min(devicePixelRatio||1,2),W=Math.round(innerWidth*dpr),H=Math.round(innerHeight*dpr);
  if(bigCv.width!==W||bigCv.height!==H){bigCv.width=W;bigCv.height=H}
  const k=bigK(),ox=innerWidth/2-bigView.cx*k,oy=innerHeight/2-bigView.cz*k,u=1.6+(bigView.z-1)*.12;
  bigHits=[];bigG.setTransform(dpr,0,0,dpr,0,0);
  paintMap(bigG,innerWidth,innerHeight,ox,oy,k,u,0,bigHits);
  // popisy zón
  bigG.font=`600 ${11+bigView.z*.5}px Inter,system-ui,sans-serif`;bigG.fillStyle='rgba(160,190,225,.55)';bigG.textAlign='center';
  [[Z1/2,'1'],[(Z1+Z2)/2,'2'],[(Z2+Z3)/2,'3'],[(Z3+HORIZON)/2,'4'],[(HORIZON+LIMIT)/2,'☢']].forEach(([r,l])=>bigG.fillText(l==='☢'?t('bm.void'):t('bm.zone',{n:l}),ox,oy-r*k));
  // značka pod myšou
  bigHov=null;if(bigMouse){let bd=1e9;for(const h of bigHits){const d=Math.hypot(h.x-bigMouse.x,h.y-bigMouse.y);if(d<=h.r+5&&d<bd){bd=d;bigHov=h}}}
  if(bigHov){bigG.strokeStyle='#fff';bigG.lineWidth=1.5;bigG.beginPath();bigG.arc(bigHov.x,bigHov.y,bigHov.r+5,0,TAU);bigG.stroke()}
  bigEl.querySelector('.bm-top').innerHTML=`<b>${inArena()?t('ar.h'):secName(state.cur)}</b><span>${t('bm.help')}</span>`;
  const L=bigEl.querySelector('.bm-legend');if(!L.dataset.l||L.dataset.l!==lang){L.dataset.l=lang;L.innerHTML=bigLegend()}
  const tip=bigEl.querySelector('.bm-tip');
  if(bigHov&&bigMouse){tip.hidden=false;tip.innerHTML=bigInfo(bigHov.info);const r=tip.getBoundingClientRect();
    tip.style.left=Math.min(innerWidth-r.width-10,bigMouse.x+18)+'px';tip.style.top=Math.min(innerHeight-r.height-10,bigMouse.y+14)+'px'}else tip.hidden=true}
function bigLegend(){const it=(sw,l)=>`<div><i style="${sw}"></i>${l}</div>`;
  return it(`background:${RCOL.ore};border-radius:50%`,t('res.ore'))+it(`background:${RCOL.green};border-radius:50%`,t('res.green'))+it(`background:${RCOL.crystal};border-radius:50%`,t('res.crystal'))
    +it(`background:${RCOL.relic};transform:rotate(45deg)`,cap1(t('relic')))+it('background:#ff5a4a;clip-path:polygon(50% 0,100% 100%,0 100%)',t('bm.enemy'))+it('background:#ffb35a;clip-path:polygon(50% 0,100% 100%,0 100%)',t('bm.passive'))
    +it(`background:${MCOL};border:1px solid #fff`,t('bm.npc'))+it('border:2px solid #7ef2e2;border-radius:50%',t('bm.gate'))+it('background:#fff;transform:rotate(45deg)',t('bm.loot'))}
const _bd=p=>fmtN(Math.round(ship.position.distanceTo(p)))+' m';
function bigInfo(I){let h='';const row=(a,b)=>`<div class="bm-r"><span>${a}</span><b>${b}</b></div>`;
  if(I.t==='ast'){const a=I.a,nm=a.type==='relic'?cap1(t('relic')):a.type==='mix'?t('res.mix'):cap1(t('res.'+a.type));
    h=`<h4 style="color:${RCOL[a.type]}">${nm}</h4>`;
    if(a.type==='relic')h+=`<p>${t('bm.relic')}</p>`;
    else{const y=D().yield*(1+bonus().yield/100)*tierMul('gain'),rate=shipVal('laser')*MINE_RATE[a.type];
      h+=row(t('bm.left'),`${fmtN(Math.round(a.amt*y))} t · ${Math.round(a.amt/a.max*100)} %`)+row(t('bm.yield'),`${fmtN(Math.round(a.max*y))} t`)+row(t('bm.time'),`${Math.ceil(a.amt/rate)} s`)+row(t('bm.rate'),`${nf1(rate*y)} t/s`)}
    h+=row(t('bm.zoneL'),zoneOf(Math.hypot(a.pos.x,a.pos.z)))+row(t('bm.dist'),_bd(a.pos))+(a.mission?`<p class="bm-mis">${t('bm.misAst')}</p>`:'')}
  else if(I.t==='en'){const e=I.e,r=e.hp/e.max;const st=e.leaving?t('bm.leaving'):e.passive&&!e.hostile?t('bm.pas'):e.passive&&e.hostile?t('bm.hostile'):t('bm.attack');
    h=`<h4 style="color:${e.passive&&!e.hostile?'#ffb35a':'#ff6a5a'}">${t('bb.n.'+e.kind)}${e.bounty?' · '+t('bb.bounty'):''}</h4>
      <div class="bm-hp"><i style="width:${r*100}%"></i></div>`+row(t('bm.hp'),`${fmtN(Math.ceil(e.hp))} / ${fmtN(Math.ceil(e.max))} · ${Math.ceil(r*100)} %`)
      +row(t('bm.dmg'),fmtN(Math.round(e.dmg)))+row(t('bm.state'),st)+(e.invuln?row(t('bm.inv'),'✓'):'')+row(t('bm.dist'),_bd(e.pos))}
  else if(I.t==='loot'){const it=I.l.it;h=`<h4 style="color:${RAR[it.r].col}">${itemName(it)}</h4>`+row(t('bm.rar'),t('r.'+RAR[it.r].k))+row('ilvl',it.ilvl)+row(t('bm.dist'),_bd(I.l.g.position))}
  else if(I.t==='mis')h=`<h4 style="color:${MCOL}">${missionTitle(I.m)}</h4>`+row(t('bm.dist'),_bd(new V3(I.m.pos.x,0,I.m.pos.z)));
  else if(I.t==='npc')h=`<h4 style="color:${I.n.kind==='trader'?'#ffd27a':MCOL}">${t(I.n.kind==='trader'?'bm.trader':'bm.giver')}</h4><p>${t(I.n.kind==='trader'?'bm.traderD':'bm.giverD')}</p>`+row(t('bm.dist'),_bd(I.n.pos));
  else if(I.t==='gate')h=`<h4 style="color:#7ef2e2">${t('bm.gate')}</h4><p>${t('bm.gateD')}</p>`+row(t('bm.dist'),_bd(gate.position));
  else if(I.t==='st'){const s=cur(),brk=typeof stationBroken==='function'&&stationBroken();
    h=`<h4 style="color:${brk?'#ff5a4a':s.captured?'#ffd27a':'#58d0c0'}">${t('bm.station')} · ${secName(state.cur)}</h4>`+row(t('bm.state'),brk?t('bm.broken'):s.captured?t('bm.captured'):t('bm.free'))
      +row(t('bm.core'),s.core)+row(t('bm.mods'),s.slots.filter(Boolean).length+' / '+slotsFor(s.core))+row(t('bm.dist'),_bd(new V3()))}
  else if(I.t==='death')h=`<h4 style="color:#ff5a4a">${t('bm.death')}</h4><p>${t('bm.deathD')}</p>`;
  else if(I.t==='ship')h=`<h4>${t('ship.'+state.shipId)}</h4>`+row(t('bm.hull'),`${fmtN(Math.ceil(state.hp))} / ${fmtN(shipVal('hull'))}`)+row(t('bm.cargo'),`${fmtN(Math.floor(cargoTotal()))} / ${fmtN(shipVal('cargo'))}`);
  return h}
function bigClick(e){const h=bigHov;
  if(h&&h.info.t==='ast'&&!dead){cmdMine(h.info.a);return}
  if(h&&h.info.t==='en'&&!dead){cmdAttack(h.info.e);return}
  const k=bigK(),wx=bigView.cx+(e.clientX-innerWidth/2)/k,wz=bigView.cz+(e.clientY-innerHeight/2)/k;
  if(!dead){const p=clampLimit(new V3(wx,0,wz));cmdMove(p);flashMarker(p,'#58d0c0')}}
addEventListener('keydown',e=>{if(e.key!=='Tab')return;if(e.target&&e.target.tagName==='INPUT')return;
  if(!$('#intro').hidden||(typeof wikiOpen==='function'&&wikiOpen())||(typeof rsOpen==='function'&&rsOpen()))return;
  if(!bigAllowed())return;e.preventDefault();if(!e.repeat)bigToggle()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&bigOpen()){bigEl.hidden=true;e.stopImmediatePropagation()}},true);

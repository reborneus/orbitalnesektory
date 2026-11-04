'use strict';
/* ==================== == 16. MISIE ====================
   Opakovateľné úlohy z panela stanice (záložka Misie). Stanica ponúka MISSION_OFFERS misií pre aktuálny sektor,
   naraz môžeš mať MISSION_ACTIVE_MAX aktívnych. Ponuky sa obnovia každých MISSION_REFRESH s alebo za kredity.
   Typy: deliver (dovez surovinu), scan (zostaň v okruhu bodu kým skener nedobehne), relic (vyťaž označený relikt),
   hunt (znič N pirátov), defend (odraz najbližší nájazd bez pádu stanice). Stupne: 0 ľahká, 1 stredná, 2 ťažká.
   Misia = {id, type, tier, sec, res, need, prog, pos:{x,z}, rad, reward:{cr,ore,item}}. Ukladá sa v state.missions. */
const MISSION_OFFERS=3,MISSION_ACTIVE_MAX=3,MISSION_REFRESH=240,MISSION_REROLL=40*NUM;
/* Stupne misie: mult = násobok odmeny, minR = najnižšia rarita predmetu z odmeny, itemCh = šanca na predmet, w = váha pri losovaní. */
const MTIER=[{k:'easy',mult:1,minR:2,itemCh:.35,w:.45},{k:'med',mult:1.7,minR:3,itemCh:.7,w:.35},{k:'hard',mult:2.8,minR:5,itemCh:1,w:.2}];
const MSEC_MULT=[1,1.6,2.4,3.4,4.6,6];   // násobok odmien podľa sektora
/* Základná odmena v kredítoch podľa typu (ľahká misia v 1. sektore) a ruda navyše pri prieskume/relikte/love. */
const MREWARD={deliver:60,scan:70,relic:60,hunt:80,defend:100},MORE={scan:100,relic:80,hunt:120,defend:150};
const MDELIVER={ore:[150,300,500],green:[40,90,160],crystal:[15,35,60]};
// v0.9: × NUM (veľké čísla)
for(const o of[MREWARD,MORE])for(const k in o)o[k]*=NUM;for(const r in MDELIVER)MDELIVER[r]=MDELIVER[r].map(v=>v*NUM);
/* Kde leží cieľ prieskumu/reliktu: ľahká = pás 3, stredná = pás 4, ťažká = za horizontom (treba radiačný štít). */
const MPOS=[[Z2+10,Z3-5],[Z3+5,HORIZON-5],[HORIZON+12,LIMIT-30]];
const MSCAN={dur:[8,10,12],rad:9},MHUNT=[4,7,12];
const MCOL='#c38bff';

function mstate(){if(!state.missions)state.missions={sec:-1,offers:[],active:[],refreshT:MISSION_REFRESH,done:0};return state.missions}
function pickTier(){let x=Math.random();for(let i=0;i<MTIER.length;i++){x-=MTIER[i].w;if(x<=0)return i}return 0}
function genMission(sec){const types=['deliver','scan','relic'];if(PIRATES.raid[sec])types.push('hunt','defend');
  const type=pick(types),tier=type==='defend'?1+Math.floor(Math.random()*2):pickTier();const T=MTIER[tier],M=MSEC_MULT[sec];
  const m={id:state.nextId++,type,tier,sec,prog:0,need:1,res:null,pos:null,rad:MSCAN.rad,
    reward:{cr:Math.round(MREWARD[type]*T.mult*M),ore:Math.round((MORE[type]||0)*T.mult*M),item:Math.random()<T.itemCh&&type!=='relic'}};
  if(type==='deliver'){m.res=pick(SECTORS[sec].res);m.need=Math.round(MDELIVER[m.res][tier]*(1+sec*.25))}
  if(type==='scan'||type==='relic'){const [a,b]=MPOS[tier];const r=rnd(a,b),an=Math.random()*TAU;m.pos={x:Math.cos(an)*r,z:Math.sin(an)*r};if(type==='scan')m.need=MSCAN.dur[tier]}
  if(type==='hunt')m.need=MHUNT[tier];
  return m}
/* Ponuky patria k aktuálnemu sektoru; po skoku do iného sektora sa vytvoria nové. */
function ensureOffers(){const S=mstate();if(S.sec!==state.cur||S.offers.length<MISSION_OFFERS){if(S.sec!==state.cur)S.offers=[];S.sec=state.cur;
  while(S.offers.length<MISSION_OFFERS)S.offers.push(genMission(state.cur))}}
function missionTitle(m){return m.type==='deliver'?t('m.deliver',{r:t('res.'+m.res)}):t('m.'+m.type)}
function zoneLbl(m){return m.tier===2?t('ms.void'):m.tier===1?t('ms.zone4'):t('ms.zone3')}
function missionDesc(m){const v={n:m.need,r:m.res?t('res.'+m.res+'.acc'):t('r.'+RAR[MTIER[m.tier].minR].k),zone:zoneLbl(m),rad:m.rad,s:m.need};
  let d=t('md.'+m.type,v);if((m.type==='scan'||m.type==='relic')&&m.tier===2)d+=' '+t('ms.needRS');return d}
function rewardHtml(m){const R=m.reward;let h=`<span class="cost crd gain"><span class="coin"></span>+${R.cr}</span>`;if(R.ore)h+=`<span class="cost ore gain"><span class="gem"></span>+${R.ore}</span>`;
  if(R.item||m.type==='relic')h+=`<span class="mitem" style="color:${RAR[MTIER[m.tier].minR].col}">${t('ms.item',{r:t('r.'+RAR[MTIER[m.tier].minR].k)})}</span>`;return h}
const progTxt=m=>m.type==='scan'?Math.floor(m.prog/m.need*100)+' %':m.type==='defend'||m.type==='relic'?'':`${Math.floor(m.prog)}/${m.need}`;

/* ---------- akcie ---------- */
function acceptMission(id){const S=mstate();if(S.active.length>=MISSION_ACTIVE_MAX){toast(t('ms.full'));return}const i=S.offers.findIndex(m=>m.id===id);if(i<0)return;
  const m=S.offers.splice(i,1)[0];S.active.push(m);S.offers.push(genMission(state.cur));missionsRebuild();toast(t('tt.mAccept',{n:missionTitle(m)}));save()}
function abandonMission(id){const S=mstate();S.active=S.active.filter(m=>m.id!==id);missionsRebuild();save()}
function rerollOffers(){if(state.credits<MISSION_REROLL){toast(t('tt.noRes'));return}state.credits-=MISSION_REROLL;const S=mstate();S.offers=[];S.refreshT=MISSION_REFRESH;ensureOffers();save()}
function completeMission(m){const S=mstate();S.active=S.active.filter(x=>x!==m);S.done++;const R=m.reward;state.credits+=R.cr;state.ore+=R.ore;
  if(R.item){const it=dropItem('capture',4,MTIER[m.tier].minR);if(state.inv.length<INV_MAX)state.inv.push(it);else spawnLoot(it,ship.position.clone())}
  missionsRebuild();toast(t('tt.mDone',{n:missionTitle(m)})+' +'+R.cr+' ¢',true);bump('#crTxt');save();if(sheetTab==='station')renderSheet()}
function failMission(m){const S=mstate();S.active=S.active.filter(x=>x!==m);missionsRebuild();toast(t('tt.mFail',{n:missionTitle(m)}),'bad');save()}
const activeHere=type=>mstate().active.filter(m=>m.sec===state.cur&&(!type||m.type===type));
/* ---------- napojenie na hru (volá sa z ťažby, boja a sveta) ---------- */
function missionDeliver(res,n){for(const m of activeHere('deliver'))if(m.res===res){m.prog+=n;if(m.prog>=m.need)completeMission(m)}}
function missionKill(){for(const m of activeHere('hunt')){m.prog++;if(m.prog>=m.need)completeMission(m)}}
function missionRaid(won){for(const m of activeHere('defend'))won?completeMission(m):failMission(m)}
function missionRelic(a){const m=mstate().active.find(x=>x.id===a.mission);if(m)completeMission(m)}

/* ---------- značky v sektore ----------
   Prieskum: fialový svetelný stĺp s kruhom (polomer = okruh skenovania). Relikt: skutočný relikt na označenom mieste so stĺpom. */
let mMarks=[];
function missionsRebuild(){if(!world)return;for(const k of mMarks){world.remove(k.g)}mMarks=[];
  // relikty misií, ktoré už nie sú aktívne, zmiznú
  for(const a of asts.slice())if(a.mission&&!mstate().active.some(m=>m.id===a.mission)){world.remove(a.g);asts.splice(asts.indexOf(a),1);pickables=pickables.filter(p=>p.userData.ast!==a)}
  for(const m of activeHere()){if(!m.pos)continue;const g=new THREE.Group();g.position.set(m.pos.x,0,m.pos.z);
    const pil=new THREE.Mesh(CYL,new THREE.MeshBasicMaterial({color:new THREE.Color(MCOL),transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false}));pil.scale.set(.6,40,.6);pil.position.y=20;g.add(pil);
    const ring=new THREE.Mesh(new THREE.RingGeometry(m.rad-.35,m.rad,64),new THREE.MeshBasicMaterial({color:new THREE.Color(MCOL),transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=-.3;
    if(m.type==='scan')g.add(ring);const gl=glow(MCOL,8,.6);gl.position.y=1;g.add(gl);world.add(g);mMarks.push({m,g,ring,pil});
    if(m.type==='relic'&&!asts.some(a=>a.mission===m.id)){const r=Math.hypot(m.pos.x,m.pos.z);const a=makeAst('relic',{r:[r,r]},Math.random);a.g.position.set(m.pos.x,0,m.pos.z);setAstScale(a);a.mission=m.id;a.max=a.amt=Math.round(a.amt*1.5);asts.push(a)}}}
function tickMissions(dt,tt){const S=mstate();S.refreshT-=dt;if(S.refreshT<=0){S.refreshT=MISSION_REFRESH;S.offers=[];ensureOffers()}
  for(const k of mMarks){k.pil.material.opacity=.16+.08*Math.sin(tt*3);
    if(k.m.type==='scan'&&!dead){const d=Math.hypot(ship.position.x-k.m.pos.x,ship.position.z-k.m.pos.z);const inside=d<k.m.rad;
      k.ring.material.color.set(inside?'#7ef2e2':MCOL);if(inside){k.m.prog+=dt;if(k.m.prog>=k.m.need){completeMission(k.m);break}}}}}

/* ---------- záložka Misie v paneli stanice ---------- */
function renderMissions(){ensureOffers();const S=mstate();let h=`<div class="sec-h"><span>${t('ms.active',{a:S.active.length,b:MISSION_ACTIVE_MAX})}</span></div>`;
  if(!S.active.length)h+=`<p class="note">${t('ms.none')}</p>`;
  for(const m of S.active){const here=m.sec===state.cur;const pr=m.type==='scan'||m.type==='deliver'||m.type==='hunt'?Math.min(1,m.prog/m.need):0;
    h+=`<div class="card mcard t${m.tier}"><h3>${missionTitle(m)} <span class="chip">${t('mt.'+MTIER[m.tier].k)}</span>${here?'':`<span class="chip">${t('ms.other',{s:secName(m.sec)})}</span>`}</h3>
      <button class="act sell" data-act="mAbandon" data-id="${m.id}">${t('ms.abandon')}</button><p>${missionDesc(m)}</p>
      ${pr?`<div class="meter" style="grid-column:1/-1"><div class="bar"><i style="width:${pr*100}%;background:${MCOL}"></i></div><span class="num">${progTxt(m)}</span></div>`:''}
      <div class="costs">${rewardHtml(m)}</div></div>`}
  h+=`<div class="sec-h"><span>${t('ms.offers')}</span><span>${t('ms.refresh',{t:Math.ceil(S.refreshT/60)+' min'})}</span></div>`;
  for(const m of S.offers)h+=`<div class="card mcard t${m.tier}"><h3>${missionTitle(m)} <span class="chip">${t('mt.'+MTIER[m.tier].k)}</span></h3>
      <button class="act" data-act="mAccept" data-id="${m.id}" ${S.active.length>=MISSION_ACTIVE_MAX?'disabled':''}>${t('ms.accept')}</button><p>${missionDesc(m)}</p><div class="costs">${rewardHtml(m)}</div></div>`;
  h+=`<button class="ghost" data-act="mReroll">${t('ms.reroll',{c:MISSION_REROLL})}</button><p class="note">${t('ms.doneN',{n:S.done})}</p>`;return h}
function missionAct(act,b){switch(act){
  case 'mAccept':acceptMission(+b.dataset.id);renderSheet();return true;
  case 'mAbandon':if(!b.dataset.arm||performance.now()-(+b.dataset.arm)>3000){b.dataset.arm=performance.now();b.textContent=t('btn.sellSure');return true}abandonMission(+b.dataset.id);renderSheet();return true;
  case 'mReroll':rerollOffers();renderSheet();return true}return false}
/* Sledovanie aktívnych misií v paneli sektora (vľavo hore). */
function missionTracker(){const el=$('#mTrack');if(!el)return;const S=state.missions;if(!S||!S.active.length){el.hidden=true;return}el.hidden=false;
  el.innerHTML=S.active.map(m=>`<div class="mtr${m.sec===state.cur?'':' dim'}"><i style="background:${MCOL}"></i><span>${missionTitle(m)}</span><b>${m.sec===state.cur?progTxt(m):secName(m.sec)}</b></div>`).join('')}

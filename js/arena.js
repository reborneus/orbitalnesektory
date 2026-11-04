'use strict';
/* ==================== == 16e. PIRÁTSKA ARÉNA (v0.13) ====================
   Špeciálna mapa za posledným sektorom (SECTORS[...] s arena:true). Neťaží sa – piráti útočia vo VLNÁCH (1 až ARENA_WAVES).
   Po každej vlne sa v strede mapy objaví KOZMICKÁ ANOMÁLIA: prileť do nej a dostaneš odmenu (kredity, suroviny, predmety),
   loď sa opraví a dobijú sa štíty. Odmeny rastú s číslom vlny. Každá 20. vlna = BOSS (Dreadnought) a garantovaný
   špeciálny predmet (Mytický / Božský / Prvotný – šanca na Prvotný = 30 % × vlna/100).
   Vlna 100 = HLAVNÝ BOSS: bojový krížnik, ktorý z hangáru vypúšťa pirátov a je NEZRANITEĽNÝ, kým nezničíš všetky
   jeho moduly. Moduly zbraň nestrieľa sama – treba ich ručne zamerať (ťuknúť na ne, ako na asteroid).
   Nové typy pirátov: roj (rýchle malé drony), raketová veža (statická, strieľa navádzané rakety na veľkú vzdialenosť).
   Zničenie lode alebo odchod bránou beh ukončí. Po porazení bossa sa uloží kontrolný bod (ďalší beh môže začať odtiaľ). */
const ARENA_WAVES=100,ARENA_BOSS=20;
/* základné hodnoty nepriateľov v aréne (× NUM); hp a dmg rastú s vlnou: × ARENA_HP^(vlna-1), × ARENA_DMG^(vlna-1) */
const ARENA_HP=1.045,ARENA_DMG=1.03;
const AK={
  fighter:{hp:400,dmg:26,speed:18,range:26,fire:1.5,r:1.8},
  swarm:  {hp:150,dmg:8, speed:28,range:14,fire:.8,r:1.2,sc:.6},
  corsair:{hp:1300,dmg:45,speed:12,range:32,fire:2,r:3.2},
  frigate:{hp:3400,dmg:65,speed:8,range:38,fire:2.6,r:4.6},
  turret: {hp:900,dmg:90,speed:0,range:80,fire:4,r:3,missile:true,stat:true},
  dread:  {hp:25000,dmg:90,speed:6,range:45,fire:1.4,r:7,burst:3,spawn:12},
  carrier:{hp:200000,dmg:140,speed:3,range:55,fire:1.8,r:11,burst:4,spawn:8},
  cmod:   {hp:6000,dmg:60,speed:0,range:50,fire:2.2,r:2.2,stat:true,manual:true},
};
/* kredity a šanca na predmet za zničenie (doplnené do PIRATES, aby fungoval spoločný killEnemy) */
Object.assign(PIRATES,{swarm:{cr:[3,6],drop:.03,mf:.3},turret:{cr:[40,80],drop:.25,mf:1},dread:{cr:[2000,3000],drop:1,mf:3},carrier:{cr:[20000,30000],drop:1,mf:5},cmod:{cr:[300,500],drop:.5,mf:2}});
for(const k of['swarm','turret','dread','carrier','cmod'])PIRATES[k].cr=PIRATES[k].cr.map(v=>v*NUM);
Object.assign(XP.kill,{swarm:40,turret:500,dread:20000,carrier:150000,cmod:2000});
Object.assign(MF_SOURCE,{swarm:.3,turret:1,dread:3,carrier:5,cmod:2,anomaly:1.5});
const ARENA_IDX=SECTORS.findIndex(s=>s.arena);
const inArena=()=>!!(state&&SECTORS[state.cur]&&SECTORS[state.cur].arena);
function astate(){if(!state.arena)state.arena={best:0,ckpt:0,runs:0};return state.arena}
let arenaRun=null;   // {wave, phase:'idle'|'count'|'fight'|'reward', t, anom}
let anomaly=null;

/* ---------- modely nových pirátov ---------- */
function makeArenaPirate(kind){if(kind==='fighter'||kind==='corsair'||kind==='frigate')return makePirate(kind);
  const g=new THREE.Group();const body=new THREE.Group();g.add(body);const A=AK[kind];let sc=1;
  if(kind==='swarm'){const h=new THREE.Mesh(new THREE.OctahedronGeometry(.9,0),PIR_MAT);h.scale.set(1,.5,1.4);body.add(h);const e=glow('#ff5a3a',2.2,.9);body.add(e);sc=1}
  else if(kind==='turret'){const base=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.8,1.2,8),PIR_MAT);body.add(base);
    const top=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.6,1,6),PIR_MAT);top.position.y=1;body.add(top);
    for(const s of[-1,1]){const tube=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,2.6),PIR_GLOW);tube.position.set(.8*s,1.3,.8);body.add(tube)}
    const e=glow('#ff9a3a',5,.7);e.position.y=1.5;body.add(e);sc=1.2}
  else if(kind==='cmod'){const m=new THREE.Mesh(new THREE.BoxGeometry(2.4,1.4,2.4),PIR_MAT);body.add(m);const c=new THREE.Mesh(new THREE.IcosahedronGeometry(.8,0),PIR_GLOW);c.position.y=1;body.add(c);
    const e=glow('#ffd23a',5,.8);e.position.y=1.2;body.add(e);sc=1}
  else{ // dread / carrier: veľký trup s mostíkom, motormi a (krížnik) hangárom
    const big=kind==='carrier';
    const hull=new THREE.Mesh(new THREE.BoxGeometry(4,1.6,10),PIR_MAT);body.add(hull);
    const nose=new THREE.Mesh(new THREE.ConeGeometry(2,4,4),PIR_MAT);nose.rotation.x=Math.PI/2;nose.position.z=7;body.add(nose);
    const br=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.6,2.2),PIR_MAT);br.position.set(0,1.5,-2);body.add(br);
    const ridge=new THREE.Mesh(new THREE.BoxGeometry(.4,.5,8),PIR_GLOW);ridge.position.set(0,.9,0);body.add(ridge);
    for(const s of[-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(3,.4,5),PIR_MAT);w.position.set(3.2*s,0,-1);body.add(w);
      const e=glow('#ff6a4d',4,.9);e.position.set(1.4*s,0,-5.4);body.add(e)}
    if(big){const hg=new THREE.Mesh(new THREE.BoxGeometry(2.6,1,3),PIR_GLOW);hg.position.set(0,-.4,3.5);body.add(hg)}
    sc=big?2.6:1.6}
  body.scale.setScalar(sc);const R=(A.r||2);
  const bg=new THREE.Mesh(BAR_GEO,new THREE.MeshBasicMaterial({color:new THREE.Color('#2a0808'),transparent:true,opacity:.85,depthWrite:false}));bg.rotation.x=-Math.PI/2;bg.position.set(0,3,-R-1);g.add(bg);
  const bar=new THREE.Mesh(BAR_GEO,new THREE.MeshBasicMaterial({color:new THREE.Color(kind==='cmod'?'#ffd23a':'#ff5a4a'),depthWrite:false}));bar.rotation.x=-Math.PI/2;bar.position.set(0,3.05,-R-1);g.add(bar);
  if(kind==='dread'||kind==='carrier'){bg.scale.set(3,2,1);bar.scale.set(3,2,1)}
  const proxy=new THREE.Mesh(new THREE.SphereGeometry(R+.6,8,6),M.pick);g.add(proxy);return{g,body,bar,proxy}}

/* ---------- nepriatelia ---------- */
function arenaEnemy(kind,pos,w){const A=AK[kind];const v=makeArenaPirate(kind);v.g.position.copy(pos);world.add(v.g);
  const hp=A.hp*NUM*Math.pow(ARENA_HP,w-1)*(typeof tierMul==='function'?tierMul('hp'):1),dmg=A.dmg*NUM*Math.pow(ARENA_DMG,w-1)*D().pdmg*(typeof tierMul==='function'?tierMul('dmg'):1);
  const e={...v,kind,hp,max:hp,dmg,speed:A.speed,range:A.range,fire:A.fire,r:A.r,cd:1+Math.random()*2,vel:new V3(),aggro:true,leaving:false,orb:Math.random()<.5?1:-1,pos:v.g.position,
    arena:true,stat:!!A.stat,missile:!!A.missile,burst:A.burst||0,spawnT:A.spawn||0,manual:!!A.manual};
  v.proxy.userData.enemy=e;pickables.push(v.proxy);enemies.push(e);return e}
const ringPos=(r0,r1)=>{const a=Math.random()*TAU,r=r0+Math.random()*(r1-r0);return new V3(Math.cos(a)*r,2,Math.sin(a)*r)};
/* zloženie vlny w */
function waveKinds(w){const k=[];const n=(c,x)=>{for(let i=0;i<x;i++)k.push(c)};
  n('fighter',Math.min(14,3+Math.floor(w/6)));if(w>=3)n('swarm',Math.min(12,Math.floor(w/4)));if(w>=5)n('corsair',Math.min(6,1+Math.floor(w/12)));
  if(w>=8)n('turret',Math.min(5,1+Math.floor(w/25)));if(w>=12)n('frigate',Math.min(4,Math.floor(w/20)+(w%5===0?1:0)));return k}
function spawnWave(w){const isBoss=w%ARENA_BOSS===0;
  if(w===ARENA_WAVES){spawnCarrier(w);for(let i=0;i<6;i++)arenaEnemy('fighter',ringPos(110,140),w);}
  else{for(const kd of waveKinds(w))arenaEnemy(kd,kd==='turret'?ringPos(60,95):ringPos(110,150),w);if(isBoss)arenaEnemy('dread',ringPos(120,140),w)}
  toast(w===ARENA_WAVES?t('ar.final'):isBoss?t('ar.boss',{n:w}):t('ar.wave',{n:w}),'bad');rumble(.4,300)}
/* hlavný boss: krížnik + 6 modulov okolo neho; kým žije aspoň 1 modul, je nezraniteľný */
const CMOD_OFF=[[-6,0,6],[6,0,6],[-7,0,-2],[7,0,-2],[-4,0,-9],[4,0,-9]];
function spawnCarrier(w){const c=arenaEnemy('carrier',ringPos(120,130),w);c.invuln=true;c.mods=[];
  for(const o of CMOD_OFF){const m=arenaEnemy('cmod',c.pos.clone(),w);m.host=c;m.off=new V3(...o);c.mods.push(m)}}

/* ---------- anomália (odmena po vlne) ---------- */
function spawnAnomaly(){const g=new THREE.Group();const core=glow('#c38bff',9,.95);g.add(core);const c2=glow('#7ff6ff',6,.8);g.add(c2);
  const ring=new THREE.Mesh(new THREE.RingGeometry(4,4.4,64),new THREE.MeshBasicMaterial({color:new THREE.Color('#c38bff'),transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));ring.rotation.x=-Math.PI/2;g.add(ring);
  const pil=new THREE.Mesh(CYL,new THREE.MeshBasicMaterial({color:new THREE.Color('#c38bff'),transparent:true,opacity:.25,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));pil.scale.set(1.2,30,1.2);pil.position.y=15;g.add(pil);
  g.position.set(0,1.5,0);world.add(g);anomaly={g,core,c2,ring};toast(t('ar.anom'),true)}
function removeAnomaly(){if(anomaly){world.remove(anomaly.g);anomaly=null}}
/* odmena za vlnu w: kredity a suroviny rastú s vlnou, počet a kvalita predmetov tiež; občas „jackpot“ ×3 */
function anomalyReward(w){const tm=typeof tierMul==='function'?tierMul('gain'):1;const jack=Math.random()<.05+w*.002;const m=(jack?3:1)*tm;
  const cr=Math.round(400*NUM*(1+.12*w)*m*(1+(bonus().cr||0)/100)),ore=Math.round(600*NUM*(1+.1*w)*m),green=Math.round(150*NUM*(1+.1*w)*m),cry=Math.round(50*NUM*(1+.1*w)*m);
  state.credits+=cr;state.ore+=ore;state.green+=green;state.crystal+=cry;
  const items=[];const n=1+Math.floor(w/10)+(Math.random()<.3+w*.004?1:0)+(jack?1:0);
  const cap={max:6,top:Math.min(1.5,.2+w*.012)};
  for(let i=0;i<n;i++)items.push(dropItem('anomaly',5,w>=50?3:2,cap));
  // Mytické aj v bežných vlnách – veľmi zriedka a až v neskorších vlnách
  if(Math.random()<w*.0004)items.push(specialItem(7));
  if(w%ARENA_BOSS===0){const pP=.3*w/100,pD=.15+.35*w/100;const x=Math.random();items.push(specialItem(x<pP?9:x<pP+pD?8:7))}
  for(const it of items)giveItem(it,ship.position.clone());
  addXP(800*w*(1+state.cur*.3));
  state.hp=shipVal('hull');state.sh=shieldMax();state.radCharge=shipVal('radShield');
  toast(t(jack?'ar.jack':'ar.got',{c:cr,o:ore,n:items.length}),{rar:Math.max(...items.map(x=>x.r))})}
function specialItem(r){const it=genItem(r,SECTORS[state.cur].ilvl+10+Math.floor(Math.random()*5),Math.random()<.15?pick(CHIP_BASES):null);return it}

/* ---------- priebeh behu ---------- */
function arenaStart(from){const A=astate();removeAnomaly();arenaRun={wave:Math.max(1,from||1),phase:'count',t:5};A.runs++;toast(t('ar.start',{n:arenaRun.wave}));save()}
function arenaEnd(reason){const A=astate();if(!arenaRun)return;const w=arenaRun.wave-(arenaRun.phase==='fight'?1:0);
  if(w>A.best)A.best=w;for(const e of enemies.slice()){world.remove(e.g);pickables=pickables.filter(p=>p!==e.proxy)}enemies=[];bolts.forEach(b=>world.remove(b.s));bolts=[];
  removeAnomaly();arenaRun=null;if(reason)toast(t(reason,{n:Math.max(0,w)}),'bad');save()}
function arenaEnter(){arenaRun=null;removeAnomaly()}
function tickArena(dt,tt){if(!inArena())return;const R=arenaRun;
  if(anomaly){anomaly.ring.rotation.z+=dt;const k=1+.2*Math.sin(tt*3);anomaly.core.scale.set(9*k,9*k,1);anomaly.c2.material.color.setHSL((tt*.2)%1,.8,.7)}
  if(!R)return;
  if(dead){arenaEnd('ar.dead');return}
  // moduly krížnika sa držia pri krížniku; krížnik je zraniteľný až bez modulov
  for(const e of enemies){if(e.host){const h=e.host;if(!enemies.includes(h)){e.hp=0}else{const a=h.body.rotation.y;e.pos.set(h.pos.x+e.off.x*Math.cos(a)+e.off.z*Math.sin(a),h.pos.y+1,h.pos.z-e.off.x*Math.sin(a)+e.off.z*Math.cos(a))}}
    if(e.mods){const alive=e.mods.filter(m=>enemies.includes(m)).length;if(e.invuln&&!alive){e.invuln=false;toast(t('ar.vuln'),true);rumble(.6,400)}}
    // boss a krížnik vypúšťajú pirátov z hangáru
    if(e.spawnT){e.spT=(e.spT||e.spawnT)-dt;if(e.spT<=0){e.spT=e.spawnT;if(enemies.length<40)for(let i=0;i<(e.kind==='carrier'?3:2);i++)arenaEnemy(Math.random()<.5?'fighter':'swarm',e.pos.clone().add(new V3((Math.random()-.5)*8,0,(Math.random()-.5)*8)),R.wave)}}}
  enemies=enemies.filter(e=>{if(e.host&&e.hp<=0){world.remove(e.g);pickables=pickables.filter(p=>p!==e.proxy);return false}return true});
  if(R.phase==='count'){R.t-=dt;if(R.t<=0){R.phase='fight';spawnWave(R.wave)}}
  else if(R.phase==='fight'){if(!enemies.length){R.phase='reward';spawnAnomaly();const A=astate();if(R.wave>A.best)A.best=R.wave;if(R.wave%ARENA_BOSS===0)A.ckpt=Math.max(A.ckpt,R.wave);save()}}
  else if(R.phase==='reward'){if(anomaly&&ship.position.distanceTo(anomaly.g.position)<6){removeAnomaly();anomalyReward(R.wave);
      if(R.wave>=ARENA_WAVES){toast(t('ar.win'),true);arenaRun=null;save();return}R.wave++;R.phase='count';R.t=6}}}
/* zásah: nezraniteľný krížnik ukáže „imúnny“ */
function arenaHitFilter(e,dmg){if(e.invuln){dmgText(e.pos,1,'imm');return 0}return dmg}

/* ---------- panel arény (namiesto panela stanice) ---------- */
function renderArena(){const A=astate(),R=arenaRun;let h='';
  h+=`<div class="card arcard"><h3>${t('ar.h')} <span class="lv">${t('ar.best',{n:A.best})}</span></h3><p>${t('ar.p',{w:ARENA_WAVES,b:ARENA_BOSS})}</p>`;
  if(R)h+=`<div class="stat"><em>${t('ar.now',{n:R.wave,p:t('ar.ph.'+R.phase)})}</em></div><button class="act" data-act="arQuit">${t('ar.quit')}</button>`;
  else{h+=`<button class="act" data-act="arGo" data-w="1">${t('ar.go',{n:1})}</button>`;
    if(A.ckpt&&A.ckpt<ARENA_WAVES)h+=`<button class="act" data-act="arGo" data-w="${A.ckpt+1}" style="grid-column:2">${t('ar.go',{n:A.ckpt+1})}</button>`}
  h+='</div>';
  h+=`<ul class="caps arl">${[t('ar.l1'),t('ar.l2',{b:ARENA_BOSS}),t('ar.l3'),t('ar.l4')].map(x=>`<li>${x}</li>`).join('')}</ul>`;
  h+=`<p class="note">${t('ar.note')}</p>`;
  return h}
function arenaAct(act,b){if(act==='arGo'){if(arenaRun)return true;arenaStart(+b.dataset.w);closeSheet();return true}
  if(act==='arQuit'){arenaEnd('ar.quitT');renderSheet();return true}return false}
function arenaHud(){if(!inArena())return false;const A=astate(),R=arenaRun;
  $('#secTag').textContent=t('ar.tag')+(state.tier?' · V+'+state.tier:'');$('#infBar').style.width=((R?R.wave-1:A.best)/ARENA_WAVES*100)+'%';
  $('#infTxt').textContent=R?t('ar.hud',{n:R.wave,m:ARENA_WAVES,e:enemies.length}):t('ar.hudIdle',{n:A.best});return true}

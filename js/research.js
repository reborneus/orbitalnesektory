'use strict';
/* ==================== v0.42: STROM VÝSKUMU ====================
   Od RS_MIN_LV. úrovne pilota idú všetky získané XP aj do samostatnej úrovne výskumu (max RS_MAX = 250). Každá úroveň výskumu
   = 1 bod výskumu. Body sa míňajú v strome (inšpirácia: pasívny strom z Path of Exile + konštelácie): zo stredu (Jadro výskumu)
   vedie 6 vetiev, každá zameraná na niečo iné. Uzol sa dá preskúmať, ak susedí s už preskúmaným uzlom.
     malý uzol (s)  = základné vylepšenie, napr. +1 % poškodenia
     význačný (n)   = silnejšie kombinované vylepšenie (každý 3. uzol na hlavnej osi a konce bočných ramien)
     kľúčový (k)    = míľnik so špeciálnou schopnosťou (6., 12. a 18. uzol hlavnej osi každej vetvy)
   Vetvy spájajú 2 prstence s hybridnými uzlami. Uzlov je viac (265) ako bodov (250) – treba si vyberať; reset stojí kredity.
   Plátno sa dá posúvať ťahaním, približovať kolieskom / dvoma prstami / tlačidlami +−, na ovládači krížom vyberáš uzly. */
const RS_MIN_LV=70,RS_MAX=250;
const rsNeed=L=>Math.round(xpNeed(RS_MIN_LV)*.4*(1+L*.02));   // XP na ďalšiu úroveň výskumu (L = aktuálna úroveň)
const RS_PCT_KEYS=['shieldPct','cargoPct','xpPct','tDmgPct','dRatePct','escPct','stHpPct','tRangePct'];   // vlastnosti len z výskumu
/* vetvy: small = cyklus malých vylepšení, note = význačné (dvojice vlastnosť, hodnota), ks = kľúčové schopnosti */
const RS_BR=[
  {k:'wpn',col:'#ff5a4a',small:[['dmg',1],['frate',1],['dmg',1],['critDmg',3],['crit',.25]],note:[['dmg',4,'frate',3],['crit',1.5,'critDmg',10],['dmg',5,'hit',1.5]],ks:['w1','w2','w3']},
  {k:'def',col:'#5aa9ff',small:[['hullPct',1],['shieldPct',1],['sregen',2],['hullPct',1],['shieldPct',1]],note:[['hullPct',4,'shieldPct',4],['sregen',8,'sdelay',.3],['shieldPct',6,'rad',3]],ks:['d1','d2','d3']},
  {k:'min',col:'#ffb35a',small:[['mine',1],['yield',1],['cargoPct',1],['mine',1],['range',.1]],note:[['mine',4,'yield',3],['cargoPct',5,'magnet',.5],['yield',5,'mine',3]],ks:['m1','m2','m3']},
  {k:'fly',col:'#58d0c0',small:[['speed',1],['accel',1.5],['turn',1.5],['speed',1],['coll',1]],note:[['speed',4,'accel',4],['turn',6,'coll',4],['speed',3,'rad',3]],ks:['f1','f2','f3']},
  {k:'eco',col:'#ffd27a',small:[['cr',1.5],['mf',1],['xpPct',1.5],['cr',1.5],['mf',1]],note:[['cr',5,'mf',3],['xpPct',6,'cr',3],['mf',5,'xpPct',3]],ks:['e1','e2','e3']},
  {k:'stn',col:'#b38bff',small:[['tDmgPct',2],['dRatePct',2],['escPct',2],['stHpPct',2],['tDmgPct',2]],note:[['tDmgPct',8,'stHpPct',6],['dRatePct',8,'escPct',6],['tRangePct',6,'tDmgPct',6]],ks:['s1','s2','s3']}];
/* parametre kľúčových schopností (použité v hre aj v popisoch) */
const RSK={w1:{p:25,d:50,r:22},w2:{j:3,d:70},w3:{n:8,d:60,r:10},d1:{p:15,d:100},d2:{h:1},d3:{cd:180},
  m1:{p:20,b:50},m2:{r:12,k:35},m3:{p:15},f1:{p:10},f2:{s:35,t:3},f3:{k:50},e1:{p:20},e2:{k:40},e3:{p:10},s1:{p:30,d:50},s2:{k:40},s3:{r:40,g:3,h:25}};

let RS=null;
function rsBuild(){if(RS)return RS;const N=[];
  const add=o=>{o.id=N.length;o.links=[];N.push(o);return o},link=(a,b)=>{a.links.push(b.id);b.links.push(a.id)};
  const pair=a=>{const o={};for(let i=0;i<a.length;i+=2)o[a[i]]=a[i+1];return o};
  const core=add({kind:'core',br:-1,st:{},x:0,y:0});const spines=[];
  RS_BR.forEach((B,b)=>{const A=-Math.PI/2+b*Math.PI/3,dx=Math.cos(A),dy=Math.sin(A);let prev=core,si=0,ni=0,ki=0;const sp=[];
    const small=()=>{const s=B.small[si++%B.small.length];return{kind:'s',br:b,st:{[s[0]]:s[1]}}};
    for(let i=1;i<=18;i++){const r=110+i*78;const n=add(i%6===0?{kind:'k',br:b,ks:B.ks[ki++],st:{}}:i%3===0?{kind:'n',br:b,st:pair(B.note[ni++%3]),nm:b*10+ni}:small());
      n.x=dx*r;n.y=dy*r;link(prev,n);prev=n;sp[i]=n}
    // bočné ramená (5 uzlov, na konci význačný); strany sa striedajú rovnako vo všetkých vetvách, aby sa ramená nezrazili
    [[4,1],[8,-1],[11,1],[16,-1]].forEach(([i,side],ai)=>{const base=sp[i],a2=A+side*.85;let p=base;
      for(let j=1;j<=5;j++){const n=add(j===5?{kind:'n',br:b,st:pair(B.note[(ai+1)%3]),nm:b*10+4+ai}:small());n.x=base.x+Math.cos(a2)*j*64;n.y=base.y+Math.sin(a2)*j*64;link(p,n);p=n}});
    spines.push(sp)});
  // dva prstence spájajúce susedné vetvy (v strede hybridný význačný uzol)
  for(const i of[9,15])for(let b=0;b<6;b++){const b2=(b+1)%6,A=-Math.PI/2+b*Math.PI/3,r=110+i*78;let p=spines[b][i];
    for(let j=1;j<=3;j++){const a=A+j*Math.PI/12;let o;
      if(j===2){const s={},x=pair(RS_BR[b].note[0]),y=pair(RS_BR[b2].note[0]);for(const k in x)s[k]=(s[k]||0)+Math.round(x[k]*.6*10)/10;for(const k in y)s[k]=(s[k]||0)+Math.round(y[k]*.6*10)/10;o={kind:'n',br:b,br2:b2,st:s,hyb:1}}
      else{const B=RS_BR[j===1?b:b2],s=B.small[(i+j)%B.small.length];o={kind:'s',br:j===1?b:b2,st:{[s[0]]:s[1]}}}
      const n=add(o);n.x=Math.cos(a)*r;n.y=Math.sin(a)*r;link(p,n);p=n}
    link(p,spines[b2][i])}
  return RS={nodes:N}}

/* stav výskumu v uloženej hre: pstate().rs = {lv, xp, pts, a: [id preskúmaných uzlov]} */
function rstate(){const P=pstate();if(!P.rs)P.rs={lv:0,xp:0,pts:0,a:[]};return P.rs}
let _rsSet=null;const rsHas=id=>{if(!_rsSet)_rsSet=new Set(state&&state.pilot&&state.pilot.rs?state.pilot.rs.a:[]);return id===0||_rsSet.has(id)};
const rsDirty=()=>{_rsSet=null;_rsK=null;if(typeof bonusDirty==='function')bonusDirty()};
let _rsK=null;
/* má hráč kľúčovú schopnosť? (rýchle – zoznam sa prepočíta len po zmene) */
function rsK(k){if(!state||!state.pilot||!state.pilot.rs)return false;if(!_rsK){_rsK=new Set();const N=rsBuild().nodes;for(const id of state.pilot.rs.a){const n=N[id];if(n&&n.ks)_rsK.add(n.ks)}}return _rsK.has(k)}
/* vlastnosti z výskumu do bonus(): známe vlastnosti predmetov sa pripočítajú, ostatné idú do b.rs */
function rsBonus(b){b.rs=b.rs||{};if(!state||!state.pilot||!state.pilot.rs)return;const N=rsBuild().nodes;
  for(const id of state.pilot.rs.a){const n=N[id];if(!n)continue;for(const k in n.st){if(RS_PCT_KEYS.includes(k))b.rs[k]=(b.rs[k]||0)+n.st[k];else b[k]=(b[k]||0)+n.st[k]}}
  if(rsK('s3'))b.rs.stHpPct=(b.rs.stHpPct||0)+RSK.s3.h;if(rsK('s3'))b.rs.tRangePct=(b.rs.tRangePct||0)+RSK.s3.r}
const rsV=k=>{const b=bonus();return(b.rs&&b.rs[k])||0};
/* XP z addXP (pilot.js): od RS_MIN_LV. úrovne pilota */
function rsAddXP(g){const P=pstate();if(P.lv<RS_MIN_LV)return;const R=rstate();if(R.lv>=RS_MAX)return;R.xp+=g;let up=0;
  while(R.lv<RS_MAX&&R.xp>=rsNeed(R.lv)){R.xp-=rsNeed(R.lv);R.lv++;R.pts++;up++}if(R.lv>=RS_MAX)R.xp=0;
  if(up){toast(t('rs.up',{n:R.lv}),true);bump('#pilotBtn');save();if(sheetTab==='pilot')renderSheet();if(rsOpen())rsRender()}}
const rsCan=id=>{const n=rsBuild().nodes[id],R=rstate();return!!n&&!rsHas(id)&&R.pts>0&&n.links.some(rsHas)};
function rsAlloc(id){if(!rsCan(id))return false;const R=rstate();R.a.push(id);R.pts--;rsDirty();sfx('good');save();return true}
const rsResetCost=()=>Math.round(800*NUM*Math.max(1,rstate().lv));
function rsReset(){const R=rstate(),c=rsResetCost();if(!R.a.length)return;if(state.credits<c){toast(t('tt.noRes'),'bad');return}
  state.credits-=c;R.pts+=R.a.length;R.a=[];rsDirty();toast(t('rs.resetOk'));save();rsRender()}

/* ---------- názvy a popisy ---------- */
const rsStatName=k=>RS_PCT_KEYS.includes(k)?t('rsS.'+k):k==='cr'?t('pl.cr'):t('s.'+k);
const rsUnit=k=>STATS[k]?(STATS[k].u||''):'%';
const rsFmt=(k,v)=>(v>0?'+':'')+(Math.round(v*100)/100).toString().replace('.',lang==='sk'?',':'.')+(rsUnit(k)==='%'?' %':rsUnit(k)?' '+rsUnit(k):'');
function rsName(n){if(n.kind==='core')return t('rs.core');if(n.kind==='k')return t('rs.k.'+n.ks);
  if(n.kind==='n')return n.hyb?t('rs.hyb',{a:t('rs.br.'+RS_BR[n.br].k),b:t('rs.br.'+RS_BR[n.br2].k)}):t('rs.nm.'+RS_BR[n.br].k+'.'+((n.nm||0)%10));
  const k=Object.keys(n.st)[0];return rsFmt(k,n.st[k])+' '+rsStatName(k)}
function rsDesc(n){if(n.kind==='core')return t('rs.coreD');if(n.kind==='k')return t('rs.k.'+n.ks+'.d',RSK[n.ks]);
  return Object.entries(n.st).map(([k,v])=>`${rsFmt(k,v)} ${rsStatName(k)}`).join(' · ')}

/* ==================== OKNO STROMU ==================== */
const RS_OFF=1900;   // posun súradníc uzlov, aby boli kladné (plátno 3800 × 3800)
let rsView={x:0,y:0,z:.55},rsSel=0,rsHov=null,rsEl=null;
const rsOpen=()=>!!(rsEl&&!rsEl.hidden);
function rsOpenTree(){if(!rsEl)rsInitEl();if(typeof closeSheet==='function'&&sheetTab)closeSheet();rsEl.hidden=false;sfx('open');
  if(!rsView.init){rsView.init=1;rsCenter(0,true)}rsRender();rsApply()}
function rsClose(){if(rsEl){rsEl.hidden=true;sfx('close')}}
function rsInitEl(){rsEl=document.createElement('div');rsEl.id='rsTree';rsEl.hidden=true;
  rsEl.innerHTML=`<div class="rs-view"><div class="rs-world"><svg class="rs-links" width="${RS_OFF*2}" height="${RS_OFF*2}"></svg><div class="rs-nodes"></div></div></div>
    <div class="rs-top glass"></div><div class="rs-ctl"><button data-rz="1" aria-label="+">+</button><button data-rz="-1" aria-label="−">−</button><button data-rz="0" aria-label="⌖">⌖</button></div>
    <div class="rs-info glass"></div>`;
  document.body.appendChild(rsEl);const V=rsEl.querySelector('.rs-view');
  // ťahanie = posun, dva prsty = priblíženie, klik na uzol = výber
  const ptrs=new Map();let drag=null,pinch=null;
  V.addEventListener('pointerdown',e=>{V.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(ptrs.size===1)drag={x:e.clientX,y:e.clientY,vx:rsView.x,vy:rsView.y,moved:false,node:e.target.closest('.rsn')};
    else if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:rsView.z};drag=null}});
  V.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId)){rsHover(e);return}ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&ptrs.size===2){const[a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);rsZoomAt(pinch.z*d/pinch.d/rsView.z,(a.x+b.x)/2,(a.y+b.y)/2);return}
    if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>6)drag.moved=true;if(drag.moved){rsView.x=drag.vx+dx;rsView.y=drag.vy+dy;rsApply()}}});
  const up=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;
    if(drag&&!drag.moved&&drag.node){const id=+drag.node.dataset.id;if(rsSel===id&&rsCan(id)&&e.pointerType!=='mouse'){rsAlloc(id);rsRender()}else{rsSel=id;rsRender()}}   // dotyk: 2. ťuknutie na vybraný uzol ho preskúma
    if(!ptrs.size)drag=null};
  V.addEventListener('pointerup',up);V.addEventListener('pointercancel',up);
  V.addEventListener('dblclick',e=>{const n=e.target.closest('.rsn');if(n&&rsAlloc(+n.dataset.id))rsRender()});
  V.addEventListener('wheel',e=>{e.preventDefault();rsZoomAt(Math.exp(-e.deltaY*.0015),e.clientX,e.clientY)},{passive:false});
  rsEl.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.rz!==undefined){const z=+b.dataset.rz;if(z)rsZoomAt(z>0?1.25:.8,innerWidth/2,innerHeight/2);else rsCenter(rsSel,false);return}
    const a=b.dataset.rs;if(a==='close')rsClose();else if(a==='alloc'){if(rsAlloc(rsSel))rsRender()}else if(a==='reset')rsReset();else if(a==='center')rsCenter(0,false)});
  addEventListener('keydown',e=>{if(rsOpen()&&e.key==='Escape'){rsClose();e.preventDefault()}})}
function rsHover(e){const n=e.target.closest&&e.target.closest('.rsn');const id=n?+n.dataset.id:null;if(id!==rsHov){rsHov=id;rsInfo()}}
function rsApply(){if(!rsEl)return;rsEl.querySelector('.rs-world').style.transform=`translate(${rsView.x}px,${rsView.y}px) scale(${rsView.z})`}
function rsZoomAt(f,cx,cy){const z=clamp(rsView.z*f,.18,1.8),k=z/rsView.z;rsView.x=cx-(cx-rsView.x)*k;rsView.y=cy-(cy-rsView.y)*k;rsView.z=z;rsApply()}
function rsCenter(id,instant){const n=rsBuild().nodes[id]||rsBuild().nodes[0];rsView.x=innerWidth/2-(RS_OFF+n.x)*rsView.z;rsView.y=innerHeight*.46-(RS_OFF+n.y)*rsView.z;rsApply()}
function rsRender(){if(!rsEl)return;const N=rsBuild().nodes,R=rstate(),P=pstate();
  let svg='';const seen=new Set();
  for(const n of N)for(const l of n.links){const key=Math.min(n.id,l)+'-'+Math.max(n.id,l);if(seen.has(key))continue;seen.add(key);const m=N[l];
    const on=rsHas(n.id)&&rsHas(l),half=rsHas(n.id)||rsHas(l);const c=RS_BR[(n.br>=0?n.br:m.br)].col;
    svg+=`<line x1="${RS_OFF+n.x}" y1="${RS_OFF+n.y}" x2="${RS_OFF+m.x}" y2="${RS_OFF+m.y}" class="${on?'on':half?'half':''}" style="--c:${c}"/>`}
  rsEl.querySelector('.rs-links').innerHTML=svg;
  rsEl.querySelector('.rs-nodes').innerHTML=N.map(n=>{const c=n.br>=0?RS_BR[n.br].col:'#e8f0ff';const has=rsHas(n.id),can=!has&&n.links.some(rsHas);
    return `<button class="rsn ${n.kind}${has?' on':can?' can':''}${rsSel===n.id?' sel':''}" data-id="${n.id}" style="left:${RS_OFF+n.x}px;top:${RS_OFF+n.y}px;--c:${c}${n.br2!==undefined?';--c2:'+RS_BR[n.br2].col:''}" aria-label="${rsName(n)}">${n.kind==='k'?`<i>${RS_ICO[n.ks]||'✦'}</i>`:n.kind==='core'?'<i>◎</i>':''}</button>`}).join('');
  const need=rsNeed(R.lv),lock=P.lv<RS_MIN_LV;
  rsEl.querySelector('.rs-top').innerHTML=`<div class="rs-ttl"><b>${t('rs.h')}</b><span>${lock?t('rs.lock',{n:RS_MIN_LV}):t('rs.lv',{n:R.lv,m:RS_MAX})}</span></div>
    <div class="meter rs-xp"><div class="bar"><i style="width:${lock||R.lv>=RS_MAX?(R.lv>=RS_MAX?100:0):R.xp/need*100}%;background:var(--xp)"></i></div><span class="val">${lock?'–':R.lv>=RS_MAX?'MAX':fmtN(R.xp)+' / '+fmtN(need)+' XP'}</span></div>
    <div class="rs-pts"><b>${R.pts}</b> ${t('rs.pts')} · ${t('rs.spent',{n:R.a.length})}</div>
    <div class="rs-btns"><button class="ghost sm" data-rs="center">${t('rs.center')}</button>${R.a.length?`<button class="ghost sm" data-rs="reset">${t('rs.reset',{c:fmtN(rsResetCost())})}</button>`:''}<button class="ghost sm" data-rs="close">${t('rs.close')}</button></div>`;
  rsInfo()}
const RS_ICO={w1:'↯',w2:'⚡',w3:'✸',d1:'◈',d2:'✚',d3:'♥',m1:'⬙',m2:'≋',m3:'✧',f1:'↝',f2:'➤',f3:'◌',e1:'¤',e2:'♻',e3:'★',s1:'⌬',s2:'⬡',s3:'▣'};
function rsInfo(){if(!rsEl)return;const N=rsBuild().nodes,id=rsHov!=null?rsHov:rsSel,n=N[id];if(!n)return;
  const has=rsHas(id),can=rsCan(id),adj=n.links.some(rsHas),R=rstate();
  const st=has?t('rs.st.on'):!adj?t('rs.st.far'):R.pts<=0?t('rs.st.nopts'):t('rs.st.can');
  const kind=t('rs.kind.'+n.kind)+(n.br>=0?' · '+t('rs.br.'+RS_BR[n.br].k)+(n.br2!==undefined?' + '+t('rs.br.'+RS_BR[n.br2].k):''):'');
  rsEl.querySelector('.rs-info').innerHTML=`<div class="rs-ik" style="--c:${n.br>=0?RS_BR[n.br].col:'#e8f0ff'}">${kind}</div><h3>${rsName(n)}</h3>${n.kind==='s'?'':`<p>${rsDesc(n)}</p>`}
    <div class="rs-ia"><span class="rs-st${has?' on':''}">${st}</span>${id===rsSel&&!has?`<button class="act" data-rs="alloc" ${can?'':'disabled'}>${t('rs.alloc')}</button>`:''}</div>
    <p class="rs-hint">${inputMode==='pad'?t('rs.hintPad',{A:padGlyph('A'),B:padGlyph('B')}):isTouch?t('rs.hintTouch'):t('rs.hintPc')}</p>`}
const padGlyph=k=>(typeof GLY!=='undefined'&&GLY[padType]&&GLY[padType][k])||k;
/* ovládač: kríž / ľavá páčka = výber najbližšieho uzla v danom smere, A = preskúmať, B = zavrieť, pravá páčka = posun, LT/RT = priblíženie */
let rsNavT=0,rsNavLast=0;
function rsPad(p,btn,press,lx,ly,dx,dy,dt){let vx=dx,vy=dy;if(!vx&&!vy&&Math.hypot(lx,ly)>.55){vx=lx;vy=ly}
  const key=Math.round(Math.atan2(vy,vx)*4/Math.PI);rsNavT-=dt;const on=vx||vy;
  if(on&&(key!==rsNavLast||rsNavT<=0)){rsStep(vx,vy);rsNavT=key===rsNavLast?.16:.36}rsNavLast=on?key:99;
  const rx=p.axes[2]||0,ry=p.axes[3]||0;if(Math.hypot(rx,ry)>.2){rsView.x-=rx*dt*900;rsView.y-=ry*dt*900;rsApply()}
  const lt=(p.buttons[6]&&p.buttons[6].value)||0,rt=(p.buttons[7]&&p.buttons[7].value)||0;if(lt>.1||rt>.1)rsZoomAt(Math.exp((rt-lt)*dt*1.6),innerWidth/2,innerHeight*.46);
  if(press(0)){if(rsAlloc(rsSel))rsRender()}if(press(1)||press(9))rsClose();if(press(3))rsCenter(rsSel,false)}
function rsStep(vx,vy){const N=rsBuild().nodes,c=N[rsSel]||N[0];const L=Math.hypot(vx,vy)||1;vx/=L;vy/=L;let best=null,bs=1e9;
  for(const n of N){if(n.id===c.id)continue;const ex=n.x-c.x,ey=n.y-c.y,d=Math.hypot(ex,ey);const cos=(ex*vx+ey*vy)/d;if(cos<.5)continue;const s=d*(2-cos);if(s<bs){bs=s;best=n}}
  if(!best)return;rsSel=best.id;rsHov=null;sfx('hover');rsRender();
  const sx=rsView.x+(RS_OFF+best.x)*rsView.z,sy=rsView.y+(RS_OFF+best.y)*rsView.z;if(sx<innerWidth*.18||sx>innerWidth*.82||sy<innerHeight*.2||sy>innerHeight*.7)rsCenter(best.id,false)}

/* panel Pilot → Výskum */
function renderResearch(){const P=pstate(),R=rstate(),lock=P.lv<RS_MIN_LV,need=rsNeed(R.lv);
  let h=`<div class="card plcard"><h3>${t('rs.h')} <span class="lv">${lock?t('rs.lock',{n:RS_MIN_LV}):t('rs.lv',{n:R.lv,m:RS_MAX})}</span></h3>
    <div class="meter" style="grid-column:1/-1"><div class="bar"><i style="width:${lock?0:R.lv>=RS_MAX?100:R.xp/need*100}%;background:var(--xp)"></i></div></div>
    <p>${t('rs.p',{n:RS_MIN_LV,m:RS_MAX})}</p><div class="stat">${R.pts?`<em>${t('rs.ptsN',{n:R.pts})}</em>`:t('rs.noPts')} · ${t('rs.spent',{n:R.a.length})}</div>
    <button class="act" data-act="rsOpen" style="grid-column:1/-1;grid-row:auto;margin-top:6px">${t('rs.open')}</button></div>`;
  const ks=rsBuild().nodes.filter(n=>n.kind==='k'&&rsHas(n.id));
  if(ks.length)h+=`<div class="card"><h3>${t('rs.ksH')}</h3><ul class="caps" style="grid-column:1/-1;margin:4px 0 0">${ks.map(n=>`<li><b>${RS_ICO[n.ks]} ${rsName(n)}</b> – ${rsDesc(n)}</li>`).join('')}</ul></div>`;
  return h}

/* ==================== ŠPECIÁLNE SCHOPNOSTI V HRE ==================== */
let rsLastT=0,rsBurnT=0,rsNova=0;
function rsTick(dt){if(!state||!state.pilot||!state.pilot.rs)return;rsLastT-=dt;rsBurnT-=dt;
  if(rsK('d2')&&!dead){const hm=shipVal('hull');if(state.hp<hm)state.hp=Math.min(hm,state.hp+hm*RSK.d2.h/100*dt)}}
const _rsNear=(from,ex,R)=>{let best=null,bd=R;for(const e of enemies){if(ex.includes(e)||e.leaving||e.invuln)continue;const d=from.distanceTo(e.pos);if(d<bd){bd=d;best=e}}return best};
/* zásah strely hráča (lasers.js → landShot): odraz na ďalšieho nepriateľa, reťaz, supernova */
function rsOnHit(tg,o){if(!state.pilot||!state.pilot.rs)return;
  let jumps=o.bj;if(jumps===undefined)jumps=rsK('w1')&&Math.random()<RSK.w1.p/100?(rsK('w2')?RSK.w2.j:1):0;
  if(jumps>0){const ex=(o.bx||[]).concat(tg);const e2=_rsNear(tg.pos,ex,RSK.w1.r);
    if(e2)laserFx(tg.pos.clone(),e2,{dmg:o.dmg*(o.bj===undefined?RSK.w1.d:RSK.w2.d)/100,side:'player',bj:jumps-1,bx:ex,crit:false})}
  if(rsK('w3')&&o.bj===undefined&&++rsNova>=RSK.w3.n){rsNova=0;boltFlash(tg.pos,'#ffd27a',9);
    for(const e of enemies.slice())if(e!==tg&&!e.invuln&&e.pos.distanceTo(tg.pos)<=RSK.w3.r){const d=o.dmg*RSK.w3.d/100;hitEnemy(e,d,'player');dmgText(e.pos,d,'player')}}}
/* zásah strely veže: prepojené veže (odraz) */
function rsTowerHit(tg,o){if(o.bj!==undefined||!rsK('s1')||Math.random()>=RSK.s1.p/100)return;const e2=_rsNear(tg.pos,[tg],RSK.w1.r);
  if(e2)laserFx(tg.pos.clone(),e2,{dmg:o.dmg*RSK.s1.d/100,side:'tower',bj:0})}
/* strela piráta na loď: úskok alebo zrkadlový štít; vráti true, ak sa zásah zrušil */
function rsShipHit(o){if(!state.pilot||!state.pilot.rs)return false;
  if(rsK('f1')&&Math.random()<RSK.f1.p/100){dmgText(ship.position,1,'miss');return true}
  if(rsK('d1')&&Math.random()<RSK.d1.p/100){const e2=_rsNear(ship.position,[],gunRange()*1.4);bubbleT=1;
    if(e2)laserFx(ship.position.clone(),e2,{dmg:gunVolleyDmg()*RSK.d1.d/100,side:'player',bj:0,col:'#9fd8ff'});return true}
  return false}
/* smrteľný zásah: posledná šanca */
function rsLastChance(){if(!rsK('d3')||rsLastT>0)return false;rsLastT=RSK.d3.cd;state.hp=1;state.sh=shieldMax();bubbleT=1;toast(t('rs.k.d3.t'),true);return true}

/* ==================== v0.29: KOMPAKTNÝ A AUTOMATICKY SCHOVÁVANÝ HUD ====================
   state.hudCompact: undefined = automaticky (dotykový displej s kratšou stranou ≤ 600 px), true = vždy, false = nikdy.
   state.hudAuto:    true = HUD sa po HUD_IDLE sekundách bez dotyku HUD zbalí (spodné menu zmizne, panely ukážu len to podstatné).
   Triedy na <body>: hudc = kompaktný režim, hudah = schovávanie zapnuté, hudhid = HUD je práve zbalený. */
const HUD_IDLE=4;   // sekundy nečinnosti HUD, po ktorých sa zbalí
let hudIdleT=HUD_IDLE,hudMtOpen=false;

/* Má byť HUD kompaktný? Automaticky na telefónoch (dotyk + malý displej v ľubovoľnej orientácii). */
function hudCompactOn(){const v=state&&state.hudCompact;if(v===true||v===false)return v;return isTouch&&Math.min(innerWidth,innerHeight,screen.width||1e4,screen.height||1e4)<=600}
function applyHudMode(){if(!state)return;const B=document.body;B.classList.toggle('hudc',hudCompactOn());B.classList.toggle('hudah',!!state.hudAuto);
  if(!state.hudAuto)B.classList.remove('hudhid');hudWake();if(typeof applyRadial==='function')applyRadial();if(typeof applyMini==='function')applyMini();if(typeof missionTracker==='function')missionTracker()}
/* Prebudenie HUD: rozbalí ho a znova spustí odpočet nečinnosti. */
function hudWake(t){hudIdleT=t||HUD_IDLE;document.body.classList.remove('hudhid')}
/* Volá sa každý snímok z hlavnej slučky; HUD sa nezbalí, kým je otvorené menu, beží smrť alebo úvodná obrazovka. */
function tickHudMode(dt){if(!state||!state.hudAuto)return;
  if(sheetTab||dead||hudEditing||!$('#intro').hidden||(typeof wikiOpen==='function'&&wikiOpen())){hudIdleT=HUD_IDLE;return}
  if(hudIdleT>0){hudIdleT-=dt;if(hudIdleT<=0){document.body.classList.add('hudhid');hudMtOpen=false;missionTracker()}}}

/* Úchytka spodného menu – keď je HUD zbalený, ťuknutím ho vysunie. */
(function(){const tab=document.createElement('button');tab.id='dockTab';tab.type='button';tab.setAttribute('aria-label','Menu');
  tab.innerHTML='<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg>';
  tab.addEventListener('click',e=>{e.stopPropagation();hudWake(6)});$('.hud-bottom').appendChild(tab);
  // dotyk alebo klik na panel HUD ho prebudí (dotyky hracej plochy nie – tam sa hrá)
  document.addEventListener('pointerdown',e=>{if(!state||!state.hudAuto)return;if(e.target.closest&&e.target.closest('.hud-top,.hud-bottom,.sheet'))hudWake()},true);
  // myš: priblíženie k spodnému okraju alebo prejdenie nad horné panely HUD tiež prebudí
  document.addEventListener('pointermove',e=>{if(!state||!state.hudAuto||e.pointerType!=='mouse')return;
    if(e.clientY>innerHeight-90||(e.target.closest&&e.target.closest('.hud-top .glass,#miniWrap')))hudWake()});
  addEventListener('resize',()=>{if(state)applyHudMode()})})();

/* Kompaktný sledovač misií: ukáže len prvú misiu a čip „+N“; ťuknutím sa rozbalí celý zoznam. */
document.addEventListener('click',e=>{const m=e.target.closest&&e.target.closest('#mTrack');if(!m||!document.body.classList.contains('hudc'))return;hudMtOpen=!hudMtOpen;missionTracker()});

/* Karta v Nastaveniach. */
function hudModeCard(){const c=state.hudCompact,a=!!state.hudAuto;
  const b=(act,v,on,lbl)=>`<button class="langb" data-act="${act}" data-v="${v}" aria-pressed="${on}">${lbl}</button>`;
  return `<div class="card"><h3>${t('set.hc')}</h3><div class="langs">${b('hudc','auto',c!==true&&c!==false,t('set.hc.auto'))}${b('hudc','1',c===true,t('on'))}${b('hudc','0',c===false,t('off'))}</div><p>${t('set.hc.d')}</p></div>`+
    `<div class="card"><h3>${t('set.ha')}</h3><div class="langs">${b('huda','1',a,t('on'))}${b('huda','0',!a,t('off'))}</div><p>${t('set.ha.d',{n:HUD_IDLE})}</p></div>`+
    `<div class="card"><h3>${t('set.rad')}</h3><div class="langs">${b('hudr','1',!!state.hudRadial,t('on'))}${b('hudr','0',!state.hudRadial,t('off'))}</div><p>${t('set.rad.d')}</p></div>`}
function hudModeAct(act,b){if(act==='hudc'){const v=b.dataset.v;state.hudCompact=v==='auto'?undefined:v==='1'}else if(act==='hudr')state.hudRadial=b.dataset.v==='1';else state.hudAuto=b.dataset.v==='1';
  applyHudMode();save();renderSheet()}

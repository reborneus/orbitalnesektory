'use strict';
/* ==================== v0.51: HODNOSŤ V HUD, BODY NA ROZDELENIE, RADIÁLNE MENU ====================
   1) hudRank(): odznak a názov hodnosti vedľa stavu sektora; pri povýšení oznámenie.
   2) hudPts(): pod úrovňou pilota pulzujúce čipy s počtom voľných bodov (pilot / výskum); ťuknutie otvorí správnu záložku.
   3) Radiálne menu (Nastavenia → Rozhranie): spodný panel sa schová a nahradí ho okrúhle tlačidlo; po ťuknutí sa okolo neho
      v polkruhu rozbalia všetky položky menu (stanica, loď, výbava, pilot, mapa, nastavenia, príručka, domov). Kláves Q ho otvorí na PC. */
let _rkLast=-1;
function hudRank(){const el=$('#rankB');if(!el||!state||typeof rankOf!=='function')return;const r=rankOf();
  if(r!==_rkLast){const up=_rkLast>=0&&r>_rkLast;_rkLast=r;el.innerHTML=rankBadge(r,22)+`<span>${rankName(r)}</span>`;el.title=rankName(r);
    if(up){toast(t('rk.up',{r:rankName(r)}),true);el.classList.remove('rkup');void el.offsetWidth;el.classList.add('rkup')}}}
/* jazyk sa zmenil – názov treba prekresliť */
function hudRankReset(){_rkLast=-1;hudRank()}

let _ptsKey='';
/* tvar podľa počtu: „a|b|c“ = 1 / 2–4 / 5+ (slovenčina), angličtina 1 / viac */
const plural=(s,n)=>{const f=s.split('|');return f[n===1?0:n>=2&&n<=4?1:2]||f[f.length-1]};
function hudPts(){const el=$('#ptsRow');if(!el||!state)return;const P=pstate(),a=P.pts|0,r=(P.rs&&P.rs.pts)|0,key=a+'/'+r+lang;
  if(key===_ptsKey)return;_ptsKey=key;el.hidden=!(a||r);
  el.innerHTML=(a?`<button type="button" class="ptsb pl" data-p="lv"><b>${a}</b><span>${plural(t('pt.pl'),a)}</span></button>`:'')+(r?`<button type="button" class="ptsb rs" data-p="rs"><b>${r}</b><span>${plural(t('pt.rs'),r)}</span></button>`:'')}
(function(){const el=$('#ptsRow');if(!el)return;el.addEventListener('click',e=>{const b=e.target.closest('.ptsb');if(!b)return;e.stopPropagation();
  plTab=b.dataset.p;if(sheetTab==='pilot')renderSheet();else openSheet('pilot')})})();

/* ---------- radiálne menu ---------- */
const RAD_ITEMS=[['station','dock.station'],['ship','dock.ship'],['gear','dock.gear'],['pilot','sh.pilot'],['map','dock.map'],['settings','dock.settings'],['wiki','dock.wiki'],['home','dock.home']];
const RAD_ICON={pilot:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-4 3.6-6 7-6s6.2 2 7 6"/></svg>'};
let radOpen=false;
const radOn=()=>!!(state&&state.hudRadial);
function radIcon(k){if(RAD_ICON[k])return RAD_ICON[k];const b=k==='wiki'?$('#wikiBtn'):k==='home'?$('#homeBtn'):$(`.dock [data-tab="${k}"]`);const s=b&&b.querySelector('svg');return s?s.outerHTML:''}
function radBuild(){let w=$('#radial');if(w)return w;w=document.createElement('div');w.id='radial';
  w.innerHTML=`<div class="rad-ring" id="radRing"></div><button type="button" class="rad-hub" id="radHub" aria-label="Menu"><svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/></svg></button>`;
  $('.hud-bottom').appendChild(w);
  $('#radHub').addEventListener('click',e=>{e.stopPropagation();radToggle()});
  $('#radRing').addEventListener('click',e=>{const b=e.target.closest('.rad-it');if(!b)return;e.stopPropagation();radToggle(false);radGo(b.dataset.k)});
  document.addEventListener('pointerdown',e=>{if(radOpen&&!e.target.closest('#radial'))radToggle(false)},true);
  return w}
function radGo(k){if(k==='wiki')openWiki();else if(k==='home')goHome();else toggleTab(k)}
/* položky v polkruhu nad tlačidlom (od ľava doprava); polomer podľa šírky obrazovky */
function radLayout(){const ring=$('#radRing');const n=RAD_ITEMS.length,R=Math.min(172,Math.max(120,innerWidth*.37));
  ring.innerHTML=RAD_ITEMS.map(([k,l],i)=>{const a=Math.PI*(1-(i+.5)/n)+0,x=Math.cos(a)*R,y=-Math.sin(a)*R*.92;
    return `<button type="button" class="rad-it" data-k="${k}" style="--x:${x.toFixed(1)}px;--y:${y.toFixed(1)}px;--d:${i*18}ms">${radIcon(k)}<span>${t(l)}</span></button>`}).join('')}
function radToggle(v){radOpen=v===undefined?!radOpen:v;const w=radBuild();if(radOpen)radLayout();w.classList.toggle('open',radOpen);if(radOpen&&typeof hudWake==='function')hudWake(8)}
function applyRadial(){const on=radOn();document.body.classList.toggle('hudrad',on);if(on)radBuild();else radToggle(false)}
addEventListener('keydown',e=>{if(e.key.toLowerCase()!=='q'||e.repeat||!radOn()||!state||e.target.tagName==='INPUT')return;if(e.target.closest&&e.target.closest('#sheet,.intro,#wiki'))return;if(!$('#intro').hidden)return;radToggle()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&radOpen)radToggle(false)},true);
/* PC (myš a klávesnica): na tlačidlách menu sa ukážu klávesové skratky */
if(typeof isTouch!=='undefined'&&!isTouch)document.body.classList.add('pc');

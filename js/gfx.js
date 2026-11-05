'use strict';
/* ==================== v0.35: GRAFICKÉ PREDVOĽBY (Nastavenia → Grafika) ====================
   state.gfx = {q: predvoľba, pr: max. hustota pixelov (rozlíšenie), fx: množstvo častíc 0–1, bg: animované pozadie, fps: limit snímok (0 = bez limitu)}.
   Spoločné pre všetky sloty (PREF_KEYS). Predvoľby nastavia všetko naraz, jednotlivé položky sa dajú zmeniť aj ručne (predvoľba = Vlastná). */
const GFX_PRESETS={low:{pr:.75,fx:.35,bg:0,fps:30},mid:{pr:1,fx:.65,bg:1,fps:60},high:{pr:isTouch?1.6:2,fx:1,bg:1,fps:0},ultra:{pr:3,fx:1,bg:1,fps:0}};
const gfxCfg=()=>Object.assign({q:'high'},GFX_PRESETS.high,(state&&state.gfx)||{});
let _gfxLastF=0;
function applyGfx(){const g=gfxCfg();renderer.setPixelRatio(Math.min(devicePixelRatio||1,g.pr));if(typeof resize==='function')resize()}
/* limit snímok: vráti true, ak sa tento snímok má preskočiť */
function gfxSkip(){const f=gfxCfg().fps;if(!f)return false;const n=performance.now();if(n-_gfxLastF<1000/f-1.5)return true;_gfxLastF=n;return false}
const gfxFx=()=>gfxCfg().fx;
const gfxBgT=tt=>gfxCfg().bg?tt:40;   // nepohyblivé pozadie = zastavený čas shaderov
function gfxCard(){const g=gfxCfg();const b=(act,v,on,l)=>`<button class="langb" data-act="${act}" data-v="${v}" aria-pressed="${on}">${l}</button>`;
  return `<div class="card"><h3>${t('gfx.q')}</h3><div class="langs">${['low','mid','high','ultra'].map(k=>b('gfxQ',k,g.q===k,t('gfx.'+k))).join('')}</div><p>${t('gfx.qd')}${g.q==='custom'?' '+t('gfx.custom'):''}</p></div>
  <div class="card"><h3>${t('gfx.pr')}</h3><div class="langs">${[[.75,'75 %'],[1,'1×'],[1.5,'1,5×'],[2,'2×'],[3,t('gfx.max')]].map(([v,l])=>b('gfxPr',v,g.pr===v,l)).join('')}</div><p>${t('gfx.prd')}</p></div>
  <div class="card"><h3>${t('gfx.fx')}</h3><div class="langs">${[[.35,t('gfx.low')],[.65,t('gfx.mid')],[1,t('gfx.high')]].map(([v,l])=>b('gfxFx',v,g.fx===v,l)).join('')}</div><p>${t('gfx.fxd')}</p></div>
  <div class="card"><h3>${t('gfx.bg')}</h3><div class="langs">${b('gfxBg',1,!!g.bg,t('on'))}${b('gfxBg',0,!g.bg,t('off'))}</div><p>${t('gfx.bgd')}</p></div>
  <div class="card"><h3>${t('gfx.fps')}</h3><div class="langs">${[[30,'30'],[60,'60'],[0,t('gfx.nolim')]].map(([v,l])=>b('gfxFps',v,g.fps===v,l)).join('')}</div><p>${t('gfx.fpsd')}</p></div>`}
function gfxAct(act,b){if(!/^gfx/.test(act))return false;const g=gfxCfg(),v=b.dataset.v;
  if(act==='gfxQ')state.gfx=Object.assign({q:v},GFX_PRESETS[v]);
  else{const k={gfxPr:'pr',gfxFx:'fx',gfxBg:'bg',gfxFps:'fps'}[act];state.gfx=Object.assign(g,{[k]:+v,q:'custom'})}
  applyGfx();save();renderSheet();return true}

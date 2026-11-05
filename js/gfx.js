'use strict';
/* ==================== v0.35: GRAFICKÉ PREDVOĽBY (Nastavenia → Grafika) ====================
   state.gfx = {q: predvoľba, pr: max. hustota pixelov (rozlíšenie), fx: množstvo častíc 0–1, bg: animované pozadie, fps: limit snímok (0 = bez limitu)}.
   Spoločné pre všetky sloty (PREF_KEYS). Predvoľby nastavia všetko naraz, jednotlivé položky sa dajú zmeniť aj ručne (predvoľba = Vlastná). */
const GFX_PRESETS={low:{pr:.75,fx:.35,bg:0,fps:30,env:0,bloom:0},mid:{pr:1,fx:.65,bg:1,fps:0,env:1,bloom:0},   /* v0.36.1: okrem Nízkej bez limitu = toľko snímok, koľko zvládne monitor (aj 144 / 240 / 360 Hz) */high:{pr:isTouch?1.6:2,fx:1,bg:1,fps:0,env:1,bloom:1},ultra:{pr:3,fx:1,bg:1,fps:0,env:1,bloom:2}};
/* v0.40: env = odrazy prostredia, bloom = žiara 0 / 1 jemná / 2 silná (js/fx.js); chýbajúce hodnoty v starších nastaveniach dopĺňa zvolená predvoľba */
const gfxCfg=()=>{const g=(state&&state.gfx)||{};return Object.assign({q:'high'},GFX_PRESETS.high,GFX_PRESETS[g.q]||{},g)};
let _gfxLastF=0;
function applyGfx(){const g=gfxCfg();renderer.setPixelRatio(Math.min(devicePixelRatio||1,g.pr));if(typeof resize==='function')resize();envApply()}
/* limit snímok: vráti true, ak sa tento snímok má preskočiť */
/* limit snímok: snímok sa vykreslí, keď uplynul jeho čas; ďalší cieľ sa posúva o presný interval (bez driftu) */
let _gfxNext=0,_fpsN=0,_fpsT=0,_fpsEl=null,_fpsMax=0;
function gfxSkip(){const g=gfxCfg(),n=performance.now();
  if(g.fps){const iv=1000/g.fps;if(n<_gfxNext-1)return true;_gfxNext=Math.max(_gfxNext+iv,n-iv*.5)}
  // počítadlo snímok (Nastavenia → Grafika → Ukazovať FPS)
  _fpsN++;if(n-_fpsT>=500){const fps=_fpsN*1000/(n-_fpsT);_fpsN=0;_fpsT=n;_fpsMax=Math.max(_fpsMax*.98,fps);
    if(g.cnt){if(!_fpsEl){_fpsEl=document.createElement('div');_fpsEl.id='fpsCnt';document.body.appendChild(_fpsEl)}_fpsEl.hidden=false;_fpsEl.textContent=Math.round(fps)+' FPS'}else if(_fpsEl)_fpsEl.hidden=true}
  return false}
const gfxFx=()=>gfxCfg().fx;
const gfxBgT=tt=>gfxCfg().bg?tt:40;   // nepohyblivé pozadie = zastavený čas shaderov
function gfxCard(){const g=gfxCfg();const b=(act,v,on,l)=>`<button class="langb" data-act="${act}" data-v="${v}" aria-pressed="${on}">${l}</button>`;
  return `<div class="card"><h3>${t('gfx.q')}</h3><div class="langs">${['low','mid','high','ultra'].map(k=>b('gfxQ',k,g.q===k,t('gfx.'+k))).join('')}</div><p>${t('gfx.qd')}${g.q==='custom'?' '+t('gfx.custom'):''}</p></div>
  <div class="card"><h3>${t('gfx.pr')}</h3><div class="langs">${[[.75,'75 %'],[1,'1×'],[1.5,'1,5×'],[2,'2×'],[3,t('gfx.max')]].map(([v,l])=>b('gfxPr',v,g.pr===v,l)).join('')}</div><p>${t('gfx.prd')}</p></div>
  <div class="card"><h3>${t('gfx.fx')}</h3><div class="langs">${[[.35,t('gfx.low')],[.65,t('gfx.mid')],[1,t('gfx.high')]].map(([v,l])=>b('gfxFx',v,g.fx===v,l)).join('')}</div><p>${t('gfx.fxd')}</p></div>
  <div class="card"><h3>${t('gfx.bg')}</h3><div class="langs">${b('gfxBg',1,!!g.bg,t('on'))}${b('gfxBg',0,!g.bg,t('off'))}</div><p>${t('gfx.bgd')}</p></div>
  <div class="card"><h3>${t('gfx.env')}</h3><div class="langs">${b('gfxEnv',1,!!g.env,t('on'))}${b('gfxEnv',0,!g.env,t('off'))}</div><p>${t('gfx.envd')}</p></div>
  <div class="card"><h3>${t('gfx.bloom')}</h3><div class="langs">${[[0,t('off')],[1,t('gfx.soft')],[2,t('gfx.strong')]].map(([v,l])=>b('gfxBloom',v,(g.bloom|0)===v,l)).join('')}</div><p>${t('gfx.bloomd')}</p></div>
  <div class="card"><h3>${t('gfx.fps')}</h3><div class="langs fpsopts">${[[30,'30'],[60,'60'],[120,'120'],[144,'144'],[240,'240'],[0,t('gfx.nolim')]].map(([v,l])=>b('gfxFps',v,g.fps===v,l)).join('')}</div><p>${t('gfx.fpsd')}</p></div>
  <div class="card"><h3>${t('gfx.cnt')}</h3><div class="langs">${b('gfxCnt',1,!!g.cnt,t('on'))}${b('gfxCnt',0,!g.cnt,t('off'))}</div><p>${t('gfx.cntd')}</p></div>`}
function gfxAct(act,b){if(!/^gfx/.test(act))return false;const g=gfxCfg(),v=b.dataset.v;
  if(act==='gfxQ')state.gfx=Object.assign({q:v,cnt:g.cnt},GFX_PRESETS[v]);
  else if(act==='gfxCnt')state.gfx=Object.assign(g,{cnt:+v});   // počítadlo nemení predvoľbu
  else{const k={gfxPr:'pr',gfxFx:'fx',gfxBg:'bg',gfxFps:'fps',gfxEnv:'env',gfxBloom:'bloom'}[act];state.gfx=Object.assign(g,{[k]:+v,q:'custom'})}
  _gfxNext=0;
  applyGfx();save();renderSheet();return true}

'use strict';
/* ==================== == 16d. PILOT – úrovne a schopnosti (v0.11) ====================
   Pilot získava body skúsenosti (XP) za ťažbu, relikty, zničených pirátov, misie, obsadenie sektora,
   stavbu modulov a vylepšovanie predmetov. Každá úroveň dá 1 bod schopnosti, ktorý vložíš do jednej zo 4 schopností.
   state.pilot = {lv, xp (XP v aktuálnej úrovni), total (XP spolu), pts (nevložené body), sk:{mining, combat, flight, trade}}.
   Bonusy schopností sa pripočítajú k bonusom výbavy v bonus() (items.js → pilotBonus). */
const PILOT_MAX=100;                                         // najvyššia úroveň pilota
const xpNeed=L=>Math.round(120*NUM*Math.pow(L,1.8));   // v0.12: strmšia krivka         // XP potrebné z úrovne L na L+1
/* XP za zdroje (pred násobkom sektora a obtiažnosti): za tonu suroviny, za relikt, za piráta, za akcie */
const XP={ton:{ore:1,green:2.5,crystal:4},relic:250,kill:{fighter:120,corsair:700,frigate:3000},
  missionPerCr:.5,capture:4000,build:150,enh:60};
const XP_DIFF={easy:1,hard:1.25,nightmare:1.6};
const xpSecMul=()=>1+state.cur*.3;                           // vyššie sektory dávajú viac XP
/* Schopnosti: max = najviac bodov, per = bonus za 1 bod (kľúče ako vlastnosti STATS v items.js; cr = viac kreditov) */
const SKILLS={
  mining:{max:25,per:{mine:2,yield:1},ico:'⛏'},
  combat:{max:25,per:{dmg:2,crit:.2,critDmg:2},ico:'✦'},
  flight:{max:25,per:{speed:1,turn:1.5,accel:1.5,hullPct:1},ico:'➤'},
  trade:{max:25,per:{cr:2,mf:1},ico:'¢'},
};
const respecCost=()=>({ore:0,green:0,crystal:0,cr:Math.round(200*NUM*pstate().lv)});
function pstate(){if(!state.pilot)state.pilot={lv:1,xp:0,total:0,pts:0,sk:{mining:0,combat:0,flight:0,trade:0}};return state.pilot}
/* bonusy pilota – volá bonus() v items.js */
function pilotBonus(b){if(!state||!state.pilot)return;for(const k in SKILLS){const n=state.pilot.sk[k]||0;if(!n)continue;
  for(const[s,v]of Object.entries(SKILLS[k].per))b[s]=(b[s]||0)+v*n}}
/* násobok kreditov zo zničených pirátov, misií, odmien a rozoberania (schopnosť Obchodník) */
const crMul=()=>1+(bonus().cr||0)/100;
let lvlFlash=0;
function addXP(n,src){if(!(n>0)||!state)return;const P=pstate();if(P.lv>=PILOT_MAX)return;
  const g=n*(XP_DIFF[state.diff]||1);P.xp+=g;P.total+=g;let up=0;
  while(P.lv<PILOT_MAX&&P.xp>=xpNeed(P.lv)){P.xp-=xpNeed(P.lv);P.lv++;P.pts++;up++}
  if(P.lv>=PILOT_MAX)P.xp=0;
  if(up){toast(t('pl.up',{n:P.lv}),true);lvlFlash=1.2;bump('#pilotBtn');save();if(sheetTab==='pilot')renderSheet()}}
function xpAt(n){addXP(n*xpSecMul())}   // XP s násobkom sektora
function hudPilot(){const el=$('#pilotBtn');if(!el||!state)return;const P=pstate();const need=xpNeed(P.lv);
  $('#plvTxt').textContent=t('pl.lv',{n:P.lv});$('#xpBar').style.width=(P.lv>=PILOT_MAX?100:P.xp/need*100)+'%';
  $('#xpTxt').textContent=P.lv>=PILOT_MAX?'MAX':`${fmtN(P.xp)}/${fmtN(need)} XP`;el.classList.toggle('pts',P.pts>0)}

function renderPilot(){const P=pstate(),need=xpNeed(P.lv);
  let h=`<div class="card plcard"><h3>${t('pl.lv',{n:P.lv})} <span class="lv">${P.lv>=PILOT_MAX?'MAX':`${fmtN(P.xp)} / ${fmtN(need)} XP`}</span></h3>
    <div class="meter" style="grid-column:1/-1"><div class="bar"><i style="width:${P.lv>=PILOT_MAX?100:P.xp/need*100}%;background:var(--xp)"></i></div></div>
    <p>${t('pl.p',{t:fmtN(P.total)})}</p><div class="stat">${P.pts?`<em>${t('pl.pts',{n:P.pts})}</em>`:t('pl.noPts')}</div></div>`;
  for(const k in SKILLS){const S=SKILLS[k],n=P.sk[k]||0;
    const eff=Object.entries(S.per).map(([s,v])=>`${t(s==='cr'?'pl.cr':'s.'+s)} +${nf1(v*n)} %`).join(' · ');
    const nxt=Object.entries(S.per).map(([s,v])=>`+${nf1(v)} % ${t(s==='cr'?'pl.cr':'s.'+s)}`).join(', ');
    h+=`<div class="card"><h3><span class="plico">${S.ico}</span> ${t('pl.sk.'+k)} <span class="lv">${n}/${S.max}</span></h3>
      <button class="act" data-act="plUp" data-k="${k}" ${P.pts>0&&n<S.max?'':'disabled'}>${n>=S.max?t('btn.max'):'+1'}</button>
      <p>${t('pl.sk.'+k+'.d')} ${t('pl.per',{x:nxt})}</p><div class="stat">${n?eff:'–'}</div></div>`}
  const spent=Object.values(P.sk).reduce((a,b)=>a+b,0);
  if(spent){const c=respecCost();h+=`<div class="card"><h3>${t('pl.respec')}</h3>${actBtn('plReset',t('pl.respecBtn'),c,false)}<div class="costs">${costHtml(c)}</div><p>${t('pl.respecD')}</p></div>`}
  h+=`<p class="note">${t('pl.how')}</p>`;
  return h}
const nf1=x=>(Math.round(x*10)/10).toString();
function pilotAct(act,b){if(act!=='plUp'&&act!=='plReset')return false;const P=pstate();
  if(act==='plUp'){const k=b.dataset.k;if(P.pts<=0||(P.sk[k]||0)>=SKILLS[k].max)return true;P.sk[k]=(P.sk[k]||0)+1;P.pts--}
  else{const c=respecCost();if(!afford(c)){toast(t('tt.noRes'));return true}pay(c);for(const k in P.sk){P.pts+=P.sk[k];P.sk[k]=0}toast(t('pl.respecOk'))}
  bonusDirty();save();renderSheet();updateHUD();return true}

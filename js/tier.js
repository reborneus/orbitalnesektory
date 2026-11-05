'use strict';
/* ==================== == 16f. ÚROVEŇ VÝZVY +1 až +16 (v0.14) ====================
   Ako „Torment“ v Diablo 3: hráč si v Nastaveniach (pri stanici) zvýši výzvu. Piráti majú viac výdrže a poškodenia,
   radiácia je silnejšia – ale rastú aj odmeny: suroviny, kredity, XP a šanca na vzácnejšiu korisť.
   state.tier = 0 (bez výzvy) až TIER_MAX. tierMul(druh) vráti násobok; v paneli sa ukazuje v percentách. */
const TIER_MAX=16;
const TIER={hp:1.35,dmg:1.2,rad:1.08,gain:1.17,mf:.12,top:.15};   // za každú úroveň výzvy
function tierMul(k){const n=(state&&state.tier)||0;if(!n)return 1;
  if(k==='mf')return TIER.mf*n;                 // pripočíta sa k mf (0.12 = +12 % za úroveň)
  if(k==='top')return 1+TIER.top*n;             // násobok šance na najvyššiu povolenú raritu
  return Math.pow(TIER[k],n)}
const pctUp=m=>'+'+fmtN(Math.round((m-1)*100))+' %';
/* v0.33: karta výzvy v stanici (záložka Výzva): 16 štvorčekov, ktoré sa plnia červenou – čím vyššia úroveň, tým sýtejšia.
   Klik na štvorček nastaví úroveň priamo (klik na aktuálny ju zníži o 1), − / + pre ovládač, ✕ = bez výzvy. */
/* v0.38: dostupné úrovne výzvy sa odomykajú postupom: +1 za každý obsadený sektor, +2 za každých 5 vĺn v aréne (najlepší beh).
   Všetkých 16 je pri 25. vlne a obsadení mapách; strop sa dá zvýšiť pridaním ďalších úrovní (TIER_MAX). */
function tierUnlocked(){const cap=(state.sec||[]).filter(x=>x.captured).length;const best=(state.arena&&state.arena.best)||0;return Math.min(TIER_MAX,cap+2*Math.floor(best/5))}
const tierCol=k=>`hsl(${(4-k*.25).toFixed(1)},${(38+k*3.7).toFixed(0)}%,${(30+k*1.5).toFixed(0)}%)`;
function tierCard(){const n=state.tier||0,can=nearStation()&&!(typeof arenaRun!=='undefined'&&arenaRun);
  const nx=Math.min(TIER_MAX,n+1),f=k=>Math.pow(TIER[k],n),dis=can?'':'disabled';
  const un=tierUnlocked();let sq='';for(let k=1;k<=TIER_MAX;k++)sq+=k>un?`<button class="trsq lock" disabled title="${t('tr.lock')}" aria-label="${t('tr.lock')}"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></button>`:`<button class="trsq${k<=n?' on':''}" style="--c:${tierCol(k)};--d:${((k<=n?k:TIER_MAX-k)*.03).toFixed(2)}s" data-act="tierSet" data-n="${k}" ${dis} aria-label="+${k}" title="+${k}"></button>`;
  return `<div class="card tiercard"><div class="trhead"><h3>${t('tr.h')}</h3><b class="trlv" style="color:${n?tierCol(n):'var(--muted)'}">${n?'+'+n:t('tr.none')}</b><div class="langs trbtns"><button class="langb" data-act="tierSet" data-n="0" ${n>0&&can?'':'disabled'} aria-label="${t('tr.none')}">✕</button><button class="langb" data-act="tier" data-d="-1" ${n>0&&can?'':'disabled'}>−</button><button class="langb" data-act="tier" data-d="1" ${n<un&&can?'':'disabled'}>+</button></div></div>
    <div class="trq">${sq}</div>

    <p class="note" style="margin:0">${t('tr.un',{n:un,m:TIER_MAX})}</p>
    <p>${t('tr.p')}</p>
    <ul class="stats trst"><li class="down"><span>${t('tr.hp')}</span><b>${n?pctUp(f('hp')):'–'}</b></li><li class="down"><span>${t('tr.dmg')}</span><b>${n?pctUp(f('dmg')):'–'}</b></li>
      <li class="down"><span>${t('tr.rad')}</span><b>${n?pctUp(f('rad')):'–'}</b></li><li class="up"><span>${t('tr.gain')}</span><b>${n?pctUp(f('gain')):'–'}</b></li>
      <li class="up"><span>${t('tr.mf')}</span><b>${n?'+'+Math.round(TIER.mf*n*100)+' %':'–'}</b></li></ul>
    ${n<TIER_MAX?`<div class="stat">${t('tr.next',{n:nx,h:pctUp(Math.pow(TIER.hp,nx)),g:pctUp(Math.pow(TIER.gain,nx))})}</div>`:''}
    ${can?'':`<div class="stat" style="color:var(--warn)">${t('tr.far')}</div>`}</div>`}
function tierAct(act,b){if(act!=='tier'&&act!=='tierSet')return false;if(!nearStation()||(typeof arenaRun!=='undefined'&&arenaRun)){toast(t('tr.far'));return true}
  const prev=state.tier||0;if(act==='tierSet'){const k=+b.dataset.n;state.tier=k&&k===prev?k-1:k}else state.tier=clamp(prev+(+b.dataset.d),0,TIER_MAX);
  state.tier=Math.min(state.tier,tierUnlocked());if(state.tier===prev)return true;bonusDirty();toast(t('tr.set',{n:state.tier}),state.tier?'bad':true);save();renderSheet();updateHUD();
  if(!inArena())jumpTo(state.cur,false,true);   // v0.38: sektor sa znova načíta (ako po skoku) – piráti a odmeny hneď podľa novej výzvy
  return true}

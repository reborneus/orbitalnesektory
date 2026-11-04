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
function tierCard(){const n=state.tier||0,can=nearStation()&&!(typeof arenaRun!=='undefined'&&arenaRun);
  const nx=Math.min(TIER_MAX,n+1),f=k=>Math.pow(TIER[k],n);
  return `<div class="card tiercard"><h3>${t('tr.h')} <span class="lv">${n?'+'+n:t('tr.none')} / +${TIER_MAX}</span></h3>
    <div class="langs"><button class="langb" data-act="tier" data-d="-1" ${n>0&&can?'':'disabled'}>−</button><button class="langb" data-act="tier" data-d="1" ${n<TIER_MAX&&can?'':'disabled'}>+</button></div>
    <p>${t('tr.p')}</p>
    <ul class="stats trst"><li class="down"><span>${t('tr.hp')}</span><b>${n?pctUp(f('hp')):'–'}</b></li><li class="down"><span>${t('tr.dmg')}</span><b>${n?pctUp(f('dmg')):'–'}</b></li>
      <li class="down"><span>${t('tr.rad')}</span><b>${n?pctUp(f('rad')):'–'}</b></li><li class="up"><span>${t('tr.gain')}</span><b>${n?pctUp(f('gain')):'–'}</b></li>
      <li class="up"><span>${t('tr.mf')}</span><b>${n?'+'+Math.round(TIER.mf*n*100)+' %':'–'}</b></li></ul>
    ${n<TIER_MAX?`<div class="stat">${t('tr.next',{n:nx,h:pctUp(Math.pow(TIER.hp,nx)),g:pctUp(Math.pow(TIER.gain,nx))})}</div>`:''}
    ${can?'':`<div class="stat" style="color:var(--warn)">${t('tr.far')}</div>`}</div>`}
function tierAct(act,b){if(act!=='tier')return false;if(!nearStation()||(typeof arenaRun!=='undefined'&&arenaRun)){toast(t('tr.far'));return true}
  state.tier=clamp((state.tier||0)+(+b.dataset.d),0,TIER_MAX);bonusDirty();toast(t('tr.set',{n:state.tier}),state.tier?'bad':true);save();renderSheet();updateHUD();return true}

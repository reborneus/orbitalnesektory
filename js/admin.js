'use strict';
/* ==================== == 17. ADMIN PANEL (testovanie) ====================
   Skrytý panel na testovanie: PC = Ctrl+Shift+F8, mobil = 5× rýchlo ťuknúť na názov sektora vľavo hore.
   Pridanie surovín a kreditov, nesmrteľnosť (trup / štíty / radiácia), predmety ľubovoľnej rarity, maximálne vylepšenia,
   odomknutie sektorov, okamžitý nájazd pirátov a ďalšie. Prepínače sa ukladajú do state.admin. */
const A=(sk,en)=>lang==='en'?en:sk;
const adm=()=>state&&state.admin||{};
function toggleAdmin(){sheetTab==='admin'?closeSheet():openSheet('admin')}
let admTaps=[];
$('#secName').addEventListener('pointerdown',e=>{e.stopPropagation();const n=performance.now();admTaps=admTaps.filter(x=>n-x<2500);admTaps.push(n);if(admTaps.length>=5){admTaps=[];toggleAdmin()}});
function renderAdmin(){const a=adm();let h='';
  const resBtn=(r,n)=>`<button class="btn" data-act="adm" data-op="res" data-r="${r}" data-n="${n}">+${fmtN(n)}</button>`;
  const onoff=(k,lbl)=>`<div class="mctl"><span>${lbl}</span><div class="langs"><button class="langb" data-act="adm" data-op="tog" data-k="${k}" data-v="1" aria-pressed="${!!a[k]}">${A('ZAP','ON')}</button><button class="langb" data-act="adm" data-op="tog" data-k="${k}" data-v="0" aria-pressed="${!a[k]}">${A('VYP','OFF')}</button></div></div>`;
  h+=`<p class="note">${A('Testovací panel. Zmeny sa uložia do hry.','Testing panel. Changes are saved to the game.')}</p>`;
  h+=`<div class="sec-h"><span>${A('Suroviny a kredity','Resources and credits')}</span></div><div class="card adm">`;
  for(const r of[...RES,'cr'])h+=`<div class="mctl"><span>${r==='cr'?'<span class="coin"></span>':`<span class="gem" style="display:inline-block;width:8px;height:8px;transform:rotate(45deg);background:${RCOL[r]}"></span>`} ${t('res.'+r)}</span><div class="admrow">${resBtn(r,1000*NUM)}${resBtn(r,10000*NUM)}</div></div>`;
  h+=`<button class="btn prim" data-act="adm" data-op="all">${A(`Všetkého +${fmtN(10000*NUM)} (kredity +${fmtN(50000*NUM)})`,`+${fmtN(10000*NUM)} of everything (credits +${fmtN(50000*NUM)})`)}</button></div>`;
  h+=`<div class="sec-h"><span>${A('Nesmrteľnosť','God mode')}</span></div><div class="card adm">`+
    onoff('godHull',A('Neobmedzený trup','Unlimited hull'))+onoff('godShield',A('Neobmedzené štíty (zachytia všetko)','Unlimited shields (absorb everything)'))+onoff('godRad',A('Imunita voči radiácii','Radiation immunity'))+
    `<button class="btn" data-act="adm" data-op="heal">${A('Opraviť trup, štíty a radiačný štít','Restore hull, shields and radiation shield')}</button></div>`;
  h+=`<div class="sec-h"><span>${A('Predmety','Items')}</span></div><div class="card adm"><div class="mctl"><span>${A('Typ','Type')}</span><div class="langs">
    <button class="langb" data-act="adm" data-op="ikind" data-v="ship" aria-pressed="${a.ikind!=='chip'}">${A('Modul lode','Ship module')}</button><button class="langb" data-act="adm" data-op="ikind" data-v="chip" aria-pressed="${a.ikind==='chip'}">${A('Čip','Chip')}</button></div></div>
    <div class="admrar">${RAR.map((R,i)=>`<button class="itm it r${i}" style="--rc:${R.col}" data-act="adm" data-op="item" data-r="${i}" title="${t('r.'+R.k)}"><span style="font-size:11px;font-weight:700;color:${R.col}">${t('r.'+R.k)}</span></button>`).join('')}</div>
    <p class="note" style="margin:0">${A('Predmet sa vloží do inventára (úroveň podľa sektora +10).','The item goes to your inventory (sector level +10).')}</p></div>`;
  h+=`<div class="sec-h"><span>${A('Postup a svet','Progress and world')}</span></div><div class="card adm"><div class="admrow">
    <button class="btn" data-act="adm" data-op="maxShip">${A('Loď na max. úroveň','Max ship upgrades')}</button>
    <button class="btn" data-act="adm" data-op="ships">${A('Všetky lode do hangára','All ships to hangar')}</button>
    <button class="btn" data-act="adm" data-op="maxCore">${A('Jadro stanice na max.','Max station core')}</button>
    <button class="btn" data-act="adm" data-op="capture">${A('Obsadiť tento sektor','Claim this sector')}</button>
    <button class="btn" data-act="adm" data-op="unlock">${A('Odomknúť všetky sektory','Unlock all sectors')}</button>
    <button class="btn" data-act="adm" data-op="raid">${A('Nájazd pirátov teraz','Pirate raid now')}</button>
    <button class="btn" data-act="adm" data-op="kill">${A('Zničiť pirátov','Destroy pirates')}</button>
    <button class="btn" data-act="adm" data-op="missions">${A('Nové misie','New missions')}</button>
    <button class="btn" data-act="adm" data-op="relics">${A('Obnoviť relikty','Respawn relics')}</button></div></div>`;
  return h}
function adminAct(act,b){if(act!=='adm')return false;const op=b.dataset.op;state.admin=state.admin||{};const a=state.admin;const s=cur();
  switch(op){
    case 'res':{const n=+b.dataset.n;if(b.dataset.r==='cr')state.credits+=n;else state[b.dataset.r]+=n;break}
    case 'all':for(const r of RES)state[r]+=10000*NUM;state.credits+=50000*NUM;break;
    case 'tog':a[b.dataset.k]=b.dataset.v==='1';break;
    case 'heal':state.hp=shipVal('hull');state.sh=shieldMax();state.radCharge=shipVal('radShield');break;
    case 'ikind':a.ikind=b.dataset.v;break;
    case 'item':{const r=+b.dataset.r;const it=genItem(r,SECTORS[state.cur].ilvl+10,a.ikind==='chip'?pick(CHIP_BASES):null);
      if(state.inv.length<INV_MAX)state.inv.push(it);else spawnLoot(it,ship.position.clone());toast(t('tt.loot',{r:t('r.'+RAR[r].k),n:t('base.'+it.b)}),{rar:r});break}
    case 'maxShip':for(const k in UP)state.ship[k]=UP[k].max;state.hp=shipVal('hull');state.sh=shieldMax();state.radCharge=shipVal('radShield');break;
    case 'ships':for(const id of SHIP_IDS)if(!state.owned.includes(id)){state.owned.push(id);state.hangar[id]=baseLevels()}break;
    case 'maxCore':s.core=CORE_MAX;rebuildStation();stationHp=stationMaxHp();break;
    case 'capture':if(!s.captured){s.captured=true;s.rewarded=true;const nx=state.sec[state.cur+1];if(nx)nx.unlocked=true;rebuildStation();updateGate();toast(t('tt.capturedOne',{s:secName(state.cur)}),true)}break;
    case 'unlock':for(const x of state.sec)x.unlocked=true;updateGate();break;
    case 'raid':spawnRaid(true);break;
    case 'kill':for(const e of enemies.slice())if(!e.leaving)hitEnemy(e,1e9,'player');break;
    case 'missions':{const S=mstate();S.offers=[];S.refreshT=MISSION_REFRESH;ensureOffers();break}
    case 'relics':for(const x of asts)if(x.type==='relic'&&!x.alive&&!x.mission)x.respawn=0;break;
  }
  bonusDirty();save();renderSheet();updateHUD();return true}
const godActive=()=>{const a=adm();return!!(a.godHull||a.godShield||a.godRad)};

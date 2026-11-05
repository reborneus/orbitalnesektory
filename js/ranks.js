'use strict';
/* ==================== v0.51: HODNOSTI PILOTA ====================
   Hodnosť závisí od úrovne pilota (posledná aj od úrovne výskumu). Ukazuje sa v hornom HUD vedľa stavu sektora
   ako odznak (SVG) s názvom; pri povýšení príde oznámenie. Odznaky:
   - Kadet až Kapitán: štít z bronzu / ocele so šípmi (krokvami),
   - Vesmírny major až Veliteľ sektora: šesťuholník zo striebra / zlata s hviezdami, Veliteľ s planétou a prstencom,
   - Admirál flotily až Vládca vesmíru: okrídlený znak (platina, kozmická fialová, dúhový), Vládca s korunou a žiarou. */
const RANKS=[
  {lv:1,  m:'bronze', k:'cadet'},
  {lv:5,  m:'bronze', k:'pilot'},
  {lv:10, m:'bronze', k:'lt'},
  {lv:18, m:'steel',  k:'capt'},
  {lv:26, m:'steel',  k:'major'},
  {lv:35, m:'silver', k:'col'},
  {lv:45, m:'gold',   k:'cdre'},
  {lv:55, m:'gold',   k:'sector'},
  {lv:65, m:'plat',   k:'fadm'},
  {lv:80, m:'plat',   k:'gadm'},
  {lv:100,m:'cosmic', k:'lord'},
  {lv:100,rs:150,m:'prism',k:'ruler'}];
/* farby kovov: [svetlá, stredná, tmavá, žiara] */
const RK_MET={bronze:['#ffd9ae','#d08a4e','#6e3a17','#ff9d55'],steel:['#f1f7fc','#9fb3c6','#3e5165','#9fd0ff'],silver:['#ffffff','#c9d6e2','#6a7f93','#dfeaff'],
  gold:['#fff4c2','#f0bf4c','#8a5a10','#ffcf5a'],plat:['#e9fffb','#8fe8dc','#1f7c75','#58f0dc'],cosmic:['#f6e6ff','#b77cff','#4a1a8f','#c38bff'],prism:['#ffffff','#ffd27a','#7a3cff','#ff7ad9']};
const rankName=i=>t('rk.'+RANKS[i].k);
function rankOf(P){P=P||(typeof pstate==='function'?pstate():{lv:1});const rl=(P.rs&&P.rs.lv)||0;let r=0;
  RANKS.forEach((R,i)=>{if(P.lv>=R.lv&&rl>=(R.rs||0))r=i});return r}
/* 5-cípa hviezda so stredom cx,cy a polomerom r */
function rkStar(cx,cy,r){let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.42:r;d+=(i?'L':'M')+(cx+Math.cos(a)*q).toFixed(2)+' '+(cy+Math.sin(a)*q).toFixed(2)}return d+'Z'}
/* Odznak hodnosti i ako SVG (veľkosť sz px). Každá hodnosť má vlastné prechody (id podľa hodnosti), takže viac odznakov na stránke sa nebije. */
function rankBadge(i,sz=28){const R=RANKS[i],[c1,c2,c3,gl]=RK_MET[R.m],id='rk'+i;
  const met=`url(#${id}m)`,dark='#0a1220';
  let defs=`<linearGradient id="${id}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".5" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient>
    <radialGradient id="${id}c" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="${c3}" stop-opacity=".55"/><stop offset="1" stop-color="${dark}"/></radialGradient>`;
  if(R.m==='prism')defs+=`<linearGradient id="${id}p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7ef2e2"/><stop offset=".35" stop-color="#c38bff"/><stop offset=".7" stop-color="#ff7ad9"/><stop offset="1" stop-color="#ffd27a"/></linearGradient>`;
  const core=`url(#${id}c)`,edge=R.m==='prism'?`url(#${id}p)`:met;let b='';
  const chev=y=>`<path d="M15 ${y}L24 ${y+6}L33 ${y}" fill="none" stroke="${met}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(i<=3){   // štít so šípmi
    b+=`<path d="M24 3.5L40.5 9.5V23.5C40.5 33.5 33 40.5 24 44.5C15 40.5 7.5 33.5 7.5 23.5V9.5Z" fill="${core}" stroke="${edge}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M24 7.5L37 12.3V23.5C37 31.5 31.3 37.4 24 40.6" fill="none" stroke="${c1}" stroke-opacity=".25" stroke-width="1"/>`;
    const n=Math.min(3,i+1),y0=i===3?17:24-n*3.2;for(let k=0;k<n;k++)b+=chev(y0+k*6.4);
    if(i===3)b+=`<rect x="15" y="10.5" width="18" height="3.2" rx="1.2" fill="${met}"/>`}
  else if(i<=7){   // šesťuholník s hviezdami / planétou
    b+=`<path d="M24 2.5L42.6 13.25V34.75L24 45.5L5.4 34.75V13.25Z" fill="${core}" stroke="${edge}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M24 7L38.7 15.5V32.5L24 41L9.3 32.5V15.5Z" fill="none" stroke="${c1}" stroke-opacity=".22" stroke-width="1"/>`;
    if(i===7){b+=`<circle cx="24" cy="27" r="7.2" fill="${met}"/><ellipse cx="24" cy="27" rx="13" ry="3.6" fill="none" stroke="${c1}" stroke-width="1.8" transform="rotate(-18 24 27)"/><path d="${rkStar(24,12.5,4.6)}" fill="${c1}"/>`}
    else{const n=i-3,pos=n===1?[[24,24,9]]:n===2?[[17,24,6.6],[31,24,6.6]]:[[24,16.5,6],[16,29,6],[32,29,6]];for(const[x,y,r]of pos)b+=`<path d="${rkStar(x,y,r)}" fill="${met}" stroke="${c3}" stroke-width=".6"/>`}}
  else{   // okrídlený znak
    const wing=`<path d="M18 19C12.5 13.5 6.5 11 .8 8C2.6 14.5 6 18.5 11 20.6C7.4 20.8 4.2 20.2 1.4 19C3.8 23.6 7.8 26 12.6 26.6C9.6 27.6 6.8 27.8 4.2 27.3C7.6 31.6 12.6 33.8 18 33Z" fill="${met}" stroke="${c3}" stroke-width=".7" stroke-linejoin="round"/>
      <path d="M17 21.5C13 19.5 8.5 17 4 13.5M16.5 26C12.5 25.5 8.5 24 5 22.5M16.8 30C13 30.2 10 29.6 7.2 28.6" stroke="${c3}" stroke-width=".7" fill="none" opacity=".6"/>`;
    b+=wing+`<g transform="translate(48 0) scale(-1 1)">${wing}</g>`;
    b+=`<circle cx="24" cy="26" r="11.5" fill="${core}" stroke="${edge}" stroke-width="2.6"/>`;
    if(i===8)b+=`<path d="${rkStar(24,26,7.2)}" fill="${met}"/>`;
    else if(i===9)b+=`<path d="${rkStar(19.8,26.5,4.6)}" fill="${met}"/><path d="${rkStar(28.2,26.5,4.6)}" fill="${met}"/><path d="${rkStar(24,11,3.6)}" fill="${c1}"/>`;
    else{   // galaxia (Pán galaxie, Vládca vesmíru)
      b+=`<g fill="none" stroke="${edge}" stroke-width="2" stroke-linecap="round"><path d="M24 26c0-3 3.5-4.5 6-2.5 3 2.5 1.5 8-3.5 9-6 1.3-10.5-3.5-9.5-9 1.2-6.5 8.5-9.5 14-6.5"/><path d="M24 26c0 3-3.5 4.5-6 2.5" /></g><circle cx="24" cy="26" r="1.8" fill="${c1}"/>`;
      if(i===11)b+=`<path d="M15 12L18.5 4.5L22 9.5L24 3L26 9.5L29.5 4.5L33 12Z" fill="url(#${id}p)" stroke="${c1}" stroke-width=".7" stroke-linejoin="round"/><circle cx="24" cy="3.2" r="1.3" fill="#fff"/>`}}
  return `<svg class="rkb rk-${R.m}${i>=10?' rk-top':''}" viewBox="0 0 48 48" width="${sz}" height="${sz}" style="--rkg:${gl}" aria-hidden="true"><defs>${defs}</defs>${b}</svg>`}

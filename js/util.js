'use strict';
/* Pomocné funkcie zdieľané všetkými súbormi. (Samostatná príručka wiki.html sa načíta bez 3D knižnice, preto V3 môže byť prázdne.) */
const $=s=>document.querySelector(s);
/* v0.9: zápis veľkých čísel. Do 9 999 celé číslo s medzerou (4 750), potom skrátene: 12.5K, 1.25M, 1.1B, 3T.
   Desatinné miesta sa ukážu len pri malých číslach v skratke (12.5K, ale 125K). */
function fmtN(n){if(typeof n!=='number'||!isFinite(n))return String(n);const neg=n<0;let a=Math.abs(n);let s;
  if(a<10000)s=Math.floor(a+1e-9).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'\u202f');
  else{const U=[[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'K']];for(const[d,u]of U)if(a>=d){const v=a/d;s=(v<100?(Math.floor(v*10)/10).toString():Math.floor(v).toString())+u;break}}
  return(neg?'-':'')+s}
/* Rarita Prvotné: do každého prvku .r9 vložíme 2 vrstvy blikajúcich hviezd (<i class="pst">).
   MutationObserver ich doplní aj do prvkov, ktoré sa vykreslia neskôr (inventár, detail, toasty, príručka). */
(function primalStars(){if(!document.body)return document.addEventListener('DOMContentLoaded',primalStars);
  const add=()=>{for(const e of document.querySelectorAll('.r9:not([data-pst])')){e.dataset.pst=1;e.insertAdjacentHTML('afterbegin','<i class="pst"></i><i class="pst b"></i>')}};
  add();new MutationObserver(add).observe(document.body,{childList:true,subtree:true})})();
const V3=typeof THREE!=='undefined'?THREE.Vector3:null;
const col=h=>new THREE.Color(h).convertSRGBToLinear();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const TAU=Math.PI*2;
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

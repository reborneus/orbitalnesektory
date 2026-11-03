'use strict';
/* Pomocné funkcie zdieľané všetkými súbormi. (Samostatná príručka wiki.html sa načíta bez 3D knižnice, preto V3 môže byť prázdne.) */
const $=s=>document.querySelector(s);
const V3=typeof THREE!=='undefined'?THREE.Vector3:null;
const col=h=>new THREE.Color(h).convertSRGBToLinear();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const TAU=Math.PI*2;
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

'use strict';
/* ==================== == 13b. NÁHĽAD MAPY NA KARTE SEKTORA (v0.14.2) ====================
   sectorThumb(i) nakreslí do canvasu malý pohľad na sektor (bez 3D): hmlovina v farbách sektora, planéta,
   radiačné pásy a horizont, asteroidy podľa SECTORS[i].fields (farba suroviny), stanica v strede.
   Pri aréne: červené pole s pirátmi a anomáliou v strede. Obrázok sa vytvorí raz a uloží (dataURL). */
const _secThumbs={};
function sectorThumb(i){if(_secThumbs[i])return _secThumbs[i];const S=SECTORS[i];const W=560,H=200;
  const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');if(!g)return'';const r=rng(S.seed*13+7);
  g.fillStyle='#04070e';g.fillRect(0,0,W,H);
  // hmlovina
  g.globalCompositeOperation='lighter';
  for(let k=0;k<18;k++){const x=r()*W,y=r()*H,rad=40+r()*140,cc=r()<.5?S.neb[0]:S.neb[1];const gr=g.createRadialGradient(x,y,0,x,y,rad);
    gr.addColorStop(0,cc+'88');gr.addColorStop(.5,cc+'30');gr.addColorStop(1,cc+'00');g.fillStyle=gr;g.fillRect(0,0,W,H)}
  for(let k=0;k<90;k++){g.fillStyle=`rgba(255,255,255,${.25+r()*.6})`;g.fillRect(r()*W,r()*H,r()<.1?2:1,r()<.1?2:1)}
  g.globalCompositeOperation='source-over';
  // planéta vpravo hore
  {const px=W*.9,py=H*.28,pr=40;const gr=g.createRadialGradient(px-pr*.4,py-pr*.4,pr*.1,px,py,pr);gr.addColorStop(0,S.planet);gr.addColorStop(1,'#05070c');
    g.fillStyle=gr;g.beginPath();g.arc(px,py,pr,0,TAU);g.fill();g.strokeStyle=S.planet+'55';g.lineWidth=6;g.beginPath();g.arc(px,py,pr+4,0,TAU);g.stroke()}
  // pohľad zhora na sektor (zošikmená elipsa): stred vľavo
  const cx=W*.6,cy=H*.56,sx=W*.3/LIMIT,sy=H*.42/LIMIT;const P=(d,a)=>[cx+Math.cos(a)*d*sx,cy+Math.sin(a)*d*sy];
  const ring=(d,col,w,dash)=>{g.strokeStyle=col;g.lineWidth=w;g.setLineDash(dash||[]);g.beginPath();g.ellipse(cx,cy,d*sx,d*sy,0,0,TAU);g.stroke();g.setLineDash([])};
  if(S.arena){ring(150,'rgba(255,80,80,.35)',1.5,[4,4]);ring(90,'rgba(255,80,80,.25)',1);
    for(let k=0;k<26;k++){const [x,y]=P(70+r()*150,r()*TAU);g.fillStyle=r()<.2?'#ff9a3a':'#ff3b2f';g.beginPath();g.moveTo(x,y-4);g.lineTo(x+3,y+3);g.lineTo(x-3,y+3);g.fill()}
    const gr=g.createRadialGradient(cx,cy,0,cx,cy,26);gr.addColorStop(0,'#ffffff');gr.addColorStop(.3,'#c38bff');gr.addColorStop(1,'rgba(195,139,255,0)');g.fillStyle=gr;g.beginPath();g.arc(cx,cy,26,0,TAU);g.fill()}
  else{
    // radiačné pásy (jantárové) a horizont (červený)
    g.fillStyle='rgba(255,154,77,.07)';g.beginPath();g.ellipse(cx,cy,HORIZON*sx,HORIZON*sy,0,0,TAU);g.ellipse(cx,cy,Z2*sx,Z2*sy,0,0,TAU,true);g.fill('evenodd');
    for(const d of[Z1,Z2,Z3])ring(d,'rgba(127,167,208,.22)',1);ring(HORIZON,'rgba(255,90,70,.55)',1.5);
    for(const f of S.fields)for(let k=0;k<f.n;k++){const [x,y]=P(f.r[0]+r()*(f.r[1]-f.r[0]),r()*TAU);const col=RCOL[f.type];
      const s=f.type==='relic'?2.6:1.4+r()*2;if(f.type!=='ore'||f.type==='relic'){g.fillStyle=col+'55';g.beginPath();g.arc(x,y,s*2.4,0,TAU);g.fill()}g.fillStyle=col;g.beginPath();g.arc(x,y,s,0,TAU);g.fill()}
    // stanica
    g.fillStyle='#58d0c0';g.beginPath();g.arc(cx,cy,4,0,TAU);g.fill();g.strokeStyle='rgba(88,208,192,.6)';g.lineWidth=1.5;g.beginPath();g.ellipse(cx,cy,9,6,0,0,TAU);g.stroke()}
  return _secThumbs[i]=c.toDataURL('image/png')}

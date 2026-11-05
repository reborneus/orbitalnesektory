'use strict';
/* ==================== v0.35: ZVUK – všetko sa syntetizuje v reálnom čase (Web Audio API), žiadne zvukové súbory ====================
   Zbernice: master → hudba / efekty / rozhranie (každá má vlastnú hlasitosť v Nastaveniach → Zvuk).
   Priestorový zvuk: efekty v 3D svete idú cez PannerNode (HRTF), poslucháč je nad stredom obrazovky – zvuk vľavo
   počuť vľavo, vzdialený tichšie. Nastavenie je spoločné pre všetky sloty: state.snd = {m,mu,s,u,sp}.
   Prehliadače povolia zvuk až po prvom kliknutí/dotyku – kontext sa vytvorí pri prvom geste hráča.
   Použitie v hre: sfx('meno', poloha?, voľby?) · sndLoop() každý snímok (motory, ťažobný laser, poslucháč) · music. */
const SND_DEF={m:80,mu:45,s:80,u:60,sp:1};
const sndCfg=()=>Object.assign({},SND_DEF,(state&&state.snd)||{});
let AC=null,SB=null;   // AudioContext a zbernice
const _sndLast={};let _sndVoices=0;

function sndInit(){if(AC)return AC;const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
  try{AC=new C({latencyHint:'interactive'})}catch(e){return null}
  sndBuses();return AC}
/* zbernice, dozvuk a šum pre aktuálny kontext (oddelené, aby sa dali zvuky vyrenderovať aj offline) */
function sndBuses(){
  const g=()=>AC.createGain();SB={master:g(),music:g(),sfx:g(),ui:g(),rev:AC.createConvolver(),revIn:g(),comp:AC.createDynamicsCompressor()};
  SB.comp.threshold.value=-14;SB.comp.ratio.value=4;SB.comp.attack.value=.004;SB.comp.release.value=.2;
  SB.music.connect(SB.master);SB.sfx.connect(SB.master);SB.ui.connect(SB.master);SB.master.connect(SB.comp);
  SB.lim=AC.createDynamicsCompressor();SB.lim.threshold.value=-2;SB.lim.knee.value=0;SB.lim.ratio.value=20;SB.lim.attack.value=.001;SB.lim.release.value=.12;SB.comp.connect(SB.lim);SB.lim.connect(AC.destination);   // limiter proti skresleniu
  // dozvuk: impulz = doznievajúci šum (2,8 s), vo vesmíre zvuk pôsobí „priestranne“
  const L=AC.sampleRate*3.6,ir=AC.createBuffer(2,L,AC.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);let lp=0;for(let i=0;i<L;i++){lp+=((Math.random()*2-1)-lp)*(.35-.25*i/L);d[i]=lp*Math.pow(1-i/L,2.2)*1.6}}   // tmavší, dlhší dozvuk
  SB.rev.buffer=ir;SB.revIn.connect(SB.rev);SB.rev.connect(SB.master);SB.revIn.gain.value=.5;
  // v0.38: vesmírna ozvena (ping-pong medzi kanálmi, tmavne s každým odrazom) – dlhší „filmový“ chvost výstrelov
  {SB.echoIn=AC.createGain();const dl=AC.createDelay(1),dr=AC.createDelay(1);dl.delayTime.value=.23;dr.delayTime.value=.31;const fb=AC.createGain();fb.gain.value=.42;const lp=filt('lowpass',1600,.6);
    const mL=AC.createChannelMerger(2),pl=AC.createGain(),pr=AC.createGain();SB.echoIn.connect(dl);dl.connect(lp);lp.connect(dr);dr.connect(fb);fb.connect(dl);
    dl.connect(pl);dr.connect(pr);pl.connect(mL,0,0);pr.connect(mL,0,1);const eo=AC.createGain();eo.gain.value=.55;mL.connect(eo);eo.connect(SB.sfx)}
  // spoločný biely šum (2 s)
  const N=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),nd=N.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;SB.noise=N;
  sndApply()}
function sndApply(){if(!AC)return;const c=sndCfg(),t=AC.currentTime,v=x=>Math.pow(x/100,1.6);
  SB.master.gain.setTargetAtTime(v(c.m),t,.05);SB.music.gain.setTargetAtTime(v(c.mu)*.55,t,.3);SB.sfx.gain.setTargetAtTime(v(c.s),t,.05);SB.ui.gain.setTargetAtTime(v(c.u)*.7,t,.05)}
// prvé gesto hráča: vytvoriť / prebudiť zvuk (iOS a Safari to inak nedovolia) a spustiť hudbu
function sndWake(){const a=sndInit();if(!a)return;if(a.state!=='running')a.resume();musicStart()}
for(const ev of['pointerdown','keydown','touchend'])addEventListener(ev,sndWake,{capture:true,passive:true});
document.addEventListener('visibilitychange',()=>{if(!AC)return;if(document.hidden)AC.suspend();else AC.resume()});

/* ---- stavebné kamene ---- */
let _sndOff=0;const now=()=>AC.currentTime+_sndOff;   // _sndOff: posun času (len pre offline ukážku zvukov)
function env(gn,t,a,peak,d,end=.0001){const g=gn.gain;g.cancelScheduledValues(t);g.setValueAtTime(.0001,t);g.exponentialRampToValueAtTime(peak,t+a);g.exponentialRampToValueAtTime(end,t+a+d)}
function osc(type,f,t,dur,out){const o=AC.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);o.connect(out);o.start(t);o.stop(t+dur+.05);return o}
function noise(t,dur,out,rate=1){const s=AC.createBufferSource();s.buffer=SB.noise;s.loop=true;s.playbackRate.value=rate;s.connect(out);s.start(t,Math.random()*1.5);s.stop(t+dur+.05);return s}
function filt(type,f,q=1){const b=AC.createBiquadFilter();b.type=type;b.frequency.value=f;b.Q.value=q;return b}
/* výstup zvuku: s polohou → panner (priestorový zvuk), inak priamo do zbernice; rev = podiel dozvuku */
function outNode(bus,pos,rev=.15,dur=1){const g=AC.createGain();let head=g;
  if(pos&&sndCfg().sp){const p=AC.createPanner();p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=28;p.maxDistance=600;p.rolloffFactor=1.1;
    p.positionX?(p.positionX.value=pos.x,p.positionY.value=pos.y,p.positionZ.value=pos.z):p.setPosition(pos.x,pos.y,pos.z);g.connect(p);p.connect(bus);if(rev>0){const s=AC.createGain();s.gain.value=rev;p.connect(s);s.connect(SB.revIn)}}
  else if(pos){const d=Math.hypot(pos.x-camTarget.x,pos.z-camTarget.z),k=1/(1+Math.max(0,d-28)/40);const a=AC.createGain();a.gain.value=k;g.connect(a);a.connect(bus);if(rev>0){const s=AC.createGain();s.gain.value=rev*k;a.connect(s);s.connect(SB.revIn)}}
  else{g.connect(bus);if(rev>0){const s=AC.createGain();s.gain.value=rev;g.connect(s);s.connect(SB.revIn)}}
  _sndVoices++;setTimeout(()=>{_sndVoices--;try{g.disconnect()}catch(e){}},(dur+.3)*1000);return g}

/* v0.36.2: FILMOVÉ ZVUKY – vrstvené: ostrý prechodový „úder“ (filtrovaný šum), tónové jadro s rýchlym poklesom
   výšky a frekvenčnou moduláciou (energia), sub-basový náraz, jemné skreslenie (saturácia) a dlhší dozvuk.
   Žiadne štvorcové „8-bit“ pípania – rozhranie má krátke sklenené tóny a vzdušné šuchoty. */
function dist(k){const n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(x*k)/Math.tanh(k)}const w=AC.createWaveShaper();w.curve=c;w.oversample='2x';return w}
/* tónové jadro s FM: nosná + modulátor (dáva „energetický“ kovový charakter) */
function fmTone(t,f0,f1,dur,ratio,idx,out,type='sine'){const c=AC.createOscillator(),m=AC.createOscillator(),mg=AC.createGain();c.type=type;
  c.frequency.setValueAtTime(f0,t);c.frequency.exponentialRampToValueAtTime(f1,t+dur);m.frequency.setValueAtTime(f0*ratio,t);m.frequency.exponentialRampToValueAtTime(f1*ratio,t+dur);
  mg.gain.setValueAtTime(f0*idx,t);mg.gain.exponentialRampToValueAtTime(f1*idx*.3+1,t+dur);m.connect(mg);mg.connect(c.frequency);c.connect(out);c.start(t);m.start(t);c.stop(t+dur+.05);m.stop(t+dur+.05);return c}
function sub(t,f0,f1,dur,peak,out){const g=AC.createGain();env(g,t,.004,peak,dur);g.connect(out);const o=osc('sine',f0,t,dur,g);o.frequency.exponentialRampToValueAtTime(f1,t+dur)}
function burst(t,dur,type,f,q,peak,out,rate=1){const g=AC.createGain();env(g,t,.002,peak,dur);g.connect(out);const b=filt(type,f,q);b.connect(g);noise(t,dur+.02,b,rate);return b}
const SFX={
  // ---- rozhranie: krátke sklenené tóny a vzdušné šuchoty ----
  click(){const t=now(),o=outNode(SB.ui,null,.12,.2);const h=filt('highpass',900);h.connect(o);env(o,t,.002,.22,.08);osc('sine',1750,t,.09,h);const o2=AC.createGain();o2.gain.value=.4;o2.connect(h);osc('sine',2630,t,.06,o2);burst(t,.025,'bandpass',6000,1.5,.12,o)},
  hover(){const t=now(),o=outNode(SB.ui,null,.05,.08);env(o,t,.003,.045,.05);osc('sine',3200,t,.06,o)},
  open(){const t=now(),o=outNode(SB.ui,null,.45,.7);const b=burst(t,.45,'bandpass',300,1.2,.18,o,.8);b.frequency.exponentialRampToValueAtTime(4200,t+.4);
    const g=AC.createGain();env(g,t,.06,.07,.5);g.connect(o);osc('sine',392,t,.55,g);const g2=AC.createGain();env(g2,t+.05,.06,.05,.5);g2.connect(o);osc('sine',587.3,t+.05,.5,g2)},
  close(){const t=now(),o=outNode(SB.ui,null,.35,.5);const b=burst(t,.32,'bandpass',3600,1.2,.15,o,.8);b.frequency.exponentialRampToValueAtTime(280,t+.3);const g=AC.createGain();env(g,t,.02,.05,.3);g.connect(o);osc('sine',587.3,t,.32,g).frequency.exponentialRampToValueAtTime(392,t+.25)},
  toast(){const t=now();[659.3,987.8].forEach((f,i)=>{const o=outNode(SB.ui,null,.55,1.4);env(o,t+i*.07,.004,.11,1.2);osc('sine',f,t+i*.07,1.25,o);const o2=AC.createGain();o2.gain.value=.25;o2.connect(o);osc('sine',f*2.76,t+i*.07,.5,o2)})},
  good(){const t=now();[523.3,659.3,784,1046.5].forEach((f,i)=>{const o=outNode(SB.ui,null,.6,1.8);env(o,t+i*.06,.02,.09,1.5);const lp=filt('lowpass',3000);lp.connect(o);
      for(const d of[-6,6]){const x=osc('sawtooth',f,t+i*.06,1.6,lp);x.detune.value=d}})},
  bad(){const t=now(),o=outNode(SB.ui,null,.35,.9);env(o,t,.008,.3,.7);const lp=filt('lowpass',420,2);lp.connect(o);for(const f of[98,103.8]){osc('sawtooth',f,t,.8,lp)}sub(t,80,45,.5,.25,o)},
  coin(){const t=now();[1318.5,1975.5,2637].forEach((f,i)=>{const o=outNode(SB.ui,null,.55,1.3);env(o,t+i*.05,.003,.1,1.1);osc('sine',f,t+i*.05,1.15,o);const g=AC.createGain();g.gain.value=.3;g.connect(o);osc('sine',f*2.01,t+i*.05,.4,g)})},
  beep(){const t=now(),o=outNode(SB.ui,null,.6,1.2);env(o,t,.004,.16,1);osc('sine',880,t,1.05,o);const g=AC.createGain();g.gain.value=.2;g.connect(o);osc('sine',1760,t,.3,g)},   // sonarový ping
  // ---- zbrane ----
  /* v0.37: výstrely podľa hráčových ukážok (Dark / Deep / Universe / Bass): bleskový pokles výšky na začiatku („piu“),
     potom hutné basové telo – pílovitý tón 60–110 Hz cez zatvárajúci sa filter, sub-bas a tmavé doznievanie šumu. */
  laser(pos,o={}){const st=o.st||'blue',k=(o.fx?.45:1)*(o.tower?1.1:1),t=now(),j=.97+Math.random()*.06;
    const P={grey:{f0:2400,b:105,d:.42,cut:1800,ds:2,sub:.35,tail:.8,ring:520},blue:{f0:3200,b:82,d:.58,cut:2400,ds:2.5,sub:.5,tail:1.1,ring:410},gold:{f0:2600,b:62,d:.75,cut:2000,ds:3,sub:.7,tail:1.4,ring:330},
      red:{f0:3600,b:74,d:.68,cut:2800,ds:6,sub:.6,tail:1.2,trem:34,ring:370},primal:{f0:4200,b:55,d:.9,cut:3200,ds:2,sub:.65,tail:1.7,chord:1,ring:290}}[st]||{f0:3200,b:82,d:.58,cut:2400,ds:2.5,sub:.5,tail:1.1,ring:410};   // v0.38: dlhšie (inšpirácia DarkOrbit)
    const tw=o.tower?.78:1,d=P.d*(o.tower?1.25:1),out=outNode(SB.sfx,pos,.2,d+P.tail+.4);const m=AC.createGain();m.gain.value=.55*k;m.connect(out);
    // 1) „piu“: rýchly pokles zhora do basu
    {const g=AC.createGain();env(g,t,.002,.22,.11);g.connect(m);const lp=filt('lowpass',5000,.8);lp.connect(g);const x=osc('sawtooth',P.f0*j*tw,t,.13,lp);x.frequency.exponentialRampToValueAtTime(P.b*1.5*tw,t+.09)}
    // 2) basové telo: 2 rozladené píly + skreslenie + filter, ktorý sa zatvára (tmavne)
    {const sat=dist(P.ds),lp=filt('lowpass',P.cut,1.6),g=AC.createGain();env(g,t+.01,.006,.5,d);sat.connect(lp);lp.connect(g);g.connect(m);
      lp.frequency.setValueAtTime(P.cut,t);lp.frequency.exponentialRampToValueAtTime(160,t+d);
      let tg=sat;if(P.trem){const tr=AC.createGain();tr.gain.value=.6;const lf=AC.createOscillator();lf.frequency.value=P.trem;const lg=AC.createGain();lg.gain.value=.4;lf.connect(lg);lg.connect(tr.gain);lf.start(t);lf.stop(t+d+.1);tr.connect(sat);tg=tr}
      for(const dt of[-9,9]){const x=osc('sawtooth',P.b*1.9*j*tw,t,d+.05,tg);x.detune.value=dt;x.frequency.exponentialRampToValueAtTime(P.b*j*tw,t+d*.6)}
      if(P.chord)for(const r of[1.5,2.01]){const x=osc('sawtooth',P.b*r*1.9*j,t,d,tg);x.frequency.exponentialRampToValueAtTime(P.b*r*j,t+d*.6)}}
    // 3) sub-bas a 4) tmavé doznievanie (šum cez nízky filter)
    // kovové doznievanie (rezonancia trupu zbrane) a ozvena – dlhší chvost ako v klasických vesmírnych hrách
    {const g=AC.createGain();env(g,t+.02,.01,.08,d+.5);g.connect(m);const bp=filt('bandpass',P.ring*tw,22);bp.connect(g);noise(t,d+.6,bp,.7);const o2=AC.createGain();env(o2,t+.02,.01,.05,d+.4);o2.connect(m);osc('sine',P.ring*tw*1.5,t,d+.45,o2)}
    if(!o.fx){const es=AC.createGain();es.gain.value=.28;m.connect(es);es.connect(SB.echoIn)}
    sub(t,P.b*1.2*tw,34,d+.15,P.sub,m);
    {const g=AC.createGain();env(g,t+.03,.03,.12,P.tail);g.connect(m);const lp=filt('lowpass',700,.7);lp.connect(g);lp.frequency.exponentialRampToValueAtTime(120,t+P.tail);noise(t,P.tail+.1,lp,.5)}},
  /* blesk (Božská zbraň): krátke „nabitie“ s vlniacim sa filtrom a hlboký výboj s padajúcimi harmonickými (ako charge-zap) */
  zap(pos){const t=now(),out=outNode(SB.sfx,pos,.5,1.6),m=AC.createGain();m.gain.value=.55;m.connect(out);
    {const lp=filt('lowpass',300,4),g=AC.createGain();env(g,t,.06,.18,.22);lp.connect(g);g.connect(m);lp.frequency.setValueAtTime(250,t);lp.frequency.linearRampToValueAtTime(2200,t+.18);osc('sawtooth',78,t,.26,lp)}
    {const tt=t+.2,sat=dist(5),lp=filt('lowpass',4000,1),g=AC.createGain();env(g,tt,.002,.55,.9);sat.connect(lp);lp.connect(g);g.connect(m);lp.frequency.exponentialRampToValueAtTime(150,tt+.9);
      for(const r of[1,2,3,4.02]){const x=osc('sawtooth',300*r,tt,.95,sat);x.frequency.exponentialRampToValueAtTime(70*r,tt+.35)}
      const ng=AC.createGain();env(ng,tt,.002,.3,1);ng.connect(m);const nl=filt('lowpass',3000,.7);nl.connect(ng);nl.frequency.exponentialRampToValueAtTime(200,tt+1);noise(tt,1.05,nl,.8);sub(tt,90,30,.8,.7,m)}},
  /* piráti: bzučivé „stredné“ výstrely s rýchlym chvením (ako laser-1) – odlíšené od hráča, ale tiež tmavé */
  pirate(pos){const t=now(),j=.94+Math.random()*.12,out=outNode(SB.sfx,pos,.32,.9),m=AC.createGain();m.gain.value=.4;m.connect(out);
    const sat=dist(4),bp=filt('bandpass',900,1.1),g=AC.createGain();env(g,t,.003,.4,.5);{const es=AC.createGain();es.gain.value=.2;m.connect(es);es.connect(SB.echoIn)}sat.connect(bp);bp.connect(g);g.connect(m);bp.frequency.exponentialRampToValueAtTime(300,t+.3);
    const tr=AC.createGain();tr.gain.value=.55;tr.connect(sat);const lf=AC.createOscillator();lf.frequency.value=38;const lg=AC.createGain();lg.gain.value=.45;lf.connect(lg);lg.connect(tr.gain);lf.start(t);lf.stop(t+.6);
    for(const d of[-12,12]){const x=osc('sawtooth',220*j,t,.55,tr);x.detune.value=d;x.frequency.exponentialRampToValueAtTime(95*j,t+.45)}sub(t,90,40,.35,.3,m)},
  hit(pos){const t=now(),out=outNode(SB.sfx,pos,.3,.7);burst(t,.09,'lowpass',1400,.7,.35,out,.7);
    const g=AC.createGain();env(g,t,.002,.07,.35);g.connect(out);const b=filt('bandpass',900+Math.random()*1400,18);b.connect(g);noise(t,.4,b);sub(t,110,40,.18,.35,out)},   // náraz + kovové zvonenie trupu
  hurt(){const t=now(),out=outNode(SB.sfx,null,.3,.9);const sat=dist(4);sat.connect(out);burst(t,.35,'lowpass',900,.8,.6,sat,.7);sub(t,70,30,.45,.6,out);
    const g=AC.createGain();env(g,t,.003,.08,.6);g.connect(out);const b=filt('bandpass',620,25);b.connect(g);noise(t,.65,b)},
  boom(pos,o={}){const big=o.big?1:0,t=now(),d=2.2+big*2.4,out=outNode(SB.sfx,pos,.55,d+.5);const sat=dist(2.5+big*2);sat.connect(out);{const es=AC.createGain();es.gain.value=.3;out.connect(es);es.connect(SB.echoIn)}
    burst(t,.05,'highpass',1500,.7,.5,out);                                                    // prasknutie
    const b=burst(t,d,'lowpass',big?2200:3000,.6,.9,sat,.6);b.frequency.setValueAtTime(big?2200:3000,t);b.frequency.exponentialRampToValueAtTime(90,t+d);   // telo výbuchu
    sub(t,big?75:95,22,d*.8,big?1:.7,out);                                                     // sub-basový náraz
    for(let i=0;i<(big?14:7);i++){const tt=t+.08+Math.random()*d*.6;const g=AC.createGain();env(g,tt,.001,.06+Math.random()*.06,.05+Math.random()*.1);g.connect(out);
      const f=filt('bandpass',600+Math.random()*3500,3);f.connect(g);noise(tt,.18,f)}                                       // praskanie úlomkov
    if(big){const r=AC.createGain();r.gain.setValueAtTime(.0001,t);r.gain.linearRampToValueAtTime(.35,t+.4);r.gain.exponentialRampToValueAtTime(.0001,t+4.5);r.connect(out);const lp=filt('lowpass',140);lp.connect(r);noise(t,4.6,lp,.4)}},
  loot(pos){const t=now();[1046.5,1568,2093,2637].forEach((f,i)=>{const o=outNode(SB.sfx,pos,.6,1.6);env(o,t+i*.06,.004,.07,1.3);osc('sine',f,t+i*.06,1.4,o);const g=AC.createGain();g.gain.value=.3;g.connect(o);osc('triangle',f*1.5,t+i*.06,.5,g)})},
  warp(){const t=now(),out=outNode(SB.sfx,null,.6,3.2);    const wg=AC.createGain();wg.gain.setValueAtTime(.0001,t);wg.gain.exponentialRampToValueAtTime(.4,t+1.05);wg.gain.exponentialRampToValueAtTime(.0001,t+1.3);wg.connect(out);
    const bp=filt('bandpass',150,2.5);bp.connect(wg);bp.frequency.exponentialRampToValueAtTime(6000,t+1.15);noise(t,1.35,bp,.8);
    const tg=AC.createGain();tg.gain.setValueAtTime(.0001,t);tg.gain.exponentialRampToValueAtTime(.12,t+1);tg.gain.exponentialRampToValueAtTime(.0001,t+1.25);tg.connect(out);
    for(const r of[1,1.5,2]){const x=osc('sawtooth',55*r,t,1.3,tg);x.frequency.exponentialRampToValueAtTime(880*r,t+1.15)}
    setTimeout(()=>SFX.boom(null,{}),1100);sub(t+1.15,60,25,1.4,.9,out)},
  alarm(){const t=now();for(let i=0;i<3;i++){const tt=t+i*.6,o=outNode(SB.sfx,null,.45,.8);env(o,tt,.04,.16,.45);const lp=filt('lowpass',1400,3);lp.connect(o);
      for(const d of[-8,8]){const x=osc('sawtooth',330,tt,.55,lp);x.detune.value=d;x.frequency.linearRampToValueAtTime(247,tt+.5)}}},
  shield(pos){const t=now(),o=outNode(SB.sfx,pos,.45,.8);env(o,t,.01,.12,.6);fmTone(t,260,780,.5,2,1.5,o)},
};

/* sfx(meno, poloha, voľby): obmedzenie počtu hlasov a rovnakých zvukov v krátkom čase (aby salvy nezahlušili mix) */
function sfx(name,pos,o){if(!AC||AC.state!=='running'||!SFX[name])return;const tt=performance.now(),gap={hover:60,hit:35,laser:28,pirate:40,loot:80}[name]||20;
  if(tt-(_sndLast[name]||0)<gap)return;_sndLast[name]=tt;if(_sndVoices>90&&name!=='boom'&&name!=='click')return;_sndVoices=Math.max(0,_sndVoices);
  try{SFX[name](pos||null,o||{})}catch(e){}}

/* ---- slučky: motory a ťažobný laser (bez polohy – je to tvoja loď), poslucháč ---- */
let _eng=null,_mine=null;
function makeLoop(kind){const g=AC.createGain();g.gain.value=0;g.connect(SB.sfx);const L={g,nodes:[]};
  if(kind==='eng'){   // motory: hlboký hnedý šum + sub tón s pomalým kolísaním (hukot pohonu)
    if(!SB.brown){const N=AC.createBuffer(1,AC.sampleRate*3,AC.sampleRate),d=N.getChannelData(0);let v=0;for(let i=0;i<d.length;i++){v=(v+.02*(Math.random()*2-1))/1.02;d[i]=v*3.5}SB.brown=N}
    const f=filt('lowpass',220,.7);f.connect(g);L.f=f;const n=AC.createBufferSource();n.buffer=SB.brown;n.loop=true;n.connect(f);n.start();
    const o=AC.createOscillator();o.type='sine';o.frequency.value=38;const og=AC.createGain();og.gain.value=.5;o.connect(og);og.connect(g);o.start();L.o=o;
    const o2=AC.createOscillator();o2.type='triangle';o2.frequency.value=76.5;const g2=AC.createGain();g2.gain.value=.12;o2.connect(g2);g2.connect(f);o2.start();L.o2=o2;
    const lfo=AC.createOscillator();lfo.frequency.value=.35;const lg=AC.createGain();lg.gain.value=.15;lfo.connect(lg);lg.connect(og.gain);lfo.start();L.nodes.push(n,o,o2,lfo)}
  else{   // ťažobný lúč: dva rozladené tóny s chorusom, plazmové syčanie a pomalé pulzovanie
    // pulzovanie ide cez vlastný zosilňovač (am) ZA hlavným g – keď je ťažba vypnutá (g = 0), je úplné ticho
    const amg=AC.createGain();amg.gain.value=.75;amg.connect(g);const f=filt('bandpass',700,1.2);f.connect(amg);L.f=f;
    for(const[fr,ty,gv]of[[146.8,'sine',.6],[147.9,'sine',.6],[293.7,'triangle',.25],[440.6,'sine',.12]]){const o=AC.createOscillator();o.type=ty;o.frequency.value=fr;const og=AC.createGain();og.gain.value=gv;o.connect(og);og.connect(f);o.start();L.nodes.push(o)}
    const am=AC.createOscillator();am.frequency.value=5.5;const ag=AC.createGain();ag.gain.value=.25;am.connect(ag);ag.connect(amg.gain);am.start();
    const n=AC.createBufferSource();n.buffer=SB.noise;n.loop=true;const nh=filt('bandpass',5200,1.5);const ng=AC.createGain();ng.gain.value=.18;n.connect(nh);nh.connect(ng);ng.connect(amg);n.start();L.nodes.push(am,n)}
  return L}
function sndLoop(dt){if(!AC||AC.state!=='running'||!(AC instanceof (window.AudioContext||window.webkitAudioContext)))return;const t=AC.currentTime,on=state&&$('#intro').hidden&&!dead&&!jumping;
  // poslucháč: nad stredom pohľadu, pozerá „dolu do obrazovky“ (hore na obrazovke = −z)
  const Ls=AC.listener,px=camTarget.x,pz=camTarget.z;
  if(Ls.positionX){Ls.positionX.setTargetAtTime(px,t,.05);Ls.positionY.setTargetAtTime(26,t,.05);Ls.positionZ.setTargetAtTime(pz+6,t,.05);Ls.forwardX.value=0;Ls.forwardY.value=-.85;Ls.forwardZ.value=-.53;Ls.upX.value=0;Ls.upY.value=.53;Ls.upZ.value=-.85}
  else if(Ls.setPosition){Ls.setPosition(px,26,pz+6);Ls.setOrientation(0,-.85,-.53,0,.53,-.85)}
  if(!_eng)_eng=makeLoop('eng');if(!_mine)_mine=makeLoop('mine');
  const sp=on?shipVel.length()/Math.max(1,shipVal('speed')):0;
  _eng.g.gain.setTargetAtTime(on?(sp>.02?.03+sp*.26:.015):0,t,.15);   // v pokoji len veľmi tichý hukot_eng.f.frequency.setTargetAtTime(120+sp*420,t,.2);_eng.o.frequency.setTargetAtTime(34+sp*22,t,.3);_eng.o2.frequency.setTargetAtTime(68+sp*60,t,.3);
  _mine.g.gain.setTargetAtTime(on&&mining?.07:0,t,mining?.08:.15);
  musicTick()}

/* ==================== HUDBA – generovaná ambientná vesmírna hudba ====================
   Pomalé akordy (rozladené pílovité oscilátory cez dýchajúci filter) + basový tón + zriedkavé „hviezdne“ zvončeky
   s ozvenou. V boji (nájazd alebo agresívni piráti nablízku) sa pridá tepajúca vrstva. V hlavnom menu je jasnejšia. */
const PROG=[[57,60,64,67,71],[53,57,60,64,67],[48,52,55,59,64],[55,59,62,64,69],[50,53,57,60,64],[52,55,59,62,67]];   // Am9, Fmaj9, Cmaj9, G6/9, Dm9, Em7
const PENTA=[69,72,74,76,79,81,84,86,88];
const mtof=n=>440*Math.pow(2,(n-69)/12);
let MU=null;
function musicStart(){if(MU||!AC)return;const delay=AC.createDelay(2);delay.delayTime.value=.66;const fb=AC.createGain();fb.gain.value=.38;const dl=filt('lowpass',2600);
  delay.connect(dl);dl.connect(fb);fb.connect(delay);const dOut=AC.createGain();dOut.gain.value=.5;delay.connect(dOut);dOut.connect(SB.music);
  const tens=AC.createGain();tens.gain.value=0;tens.connect(SB.music);
  MU={next:AC.currentTime+.3,ci:0,bell:AC.currentTime+2,delay,tens,beat:AC.currentTime+.5,fight:0}}
function padChord(notes,t,dur,bright){for(const n of notes){for(const d of[-7,6]){const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=mtof(n-12);o.detune.value=d;
      const f=filt('lowpass',bright?1300:800,.6);const lfo=AC.createOscillator();lfo.frequency.value=.07+Math.random()*.06;const lg=AC.createGain();lg.gain.value=bright?700:450;lfo.connect(lg);lg.connect(f.frequency);
      const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.022,t+dur*.35);g.gain.linearRampToValueAtTime(.0001,t+dur*1.15);
      o.connect(f);f.connect(g);g.connect(SB.music);const s=AC.createGain();s.gain.value=.6;g.connect(s);s.connect(SB.revIn);
      o.start(t);lfo.start(t);o.stop(t+dur*1.2);lfo.stop(t+dur*1.2)}}
  const b=AC.createOscillator();b.type='sine';b.frequency.value=mtof(notes[0]-24);const bg=AC.createGain();bg.gain.setValueAtTime(.0001,t);bg.gain.linearRampToValueAtTime(.07,t+2);bg.gain.linearRampToValueAtTime(.0001,t+dur*1.1);b.connect(bg);bg.connect(SB.music);b.start(t);b.stop(t+dur*1.15)}
function bell(t,n){const o=AC.createOscillator();o.type='sine';o.frequency.value=mtof(n);const o2=AC.createOscillator();o2.type='triangle';o2.frequency.value=mtof(n)*2.01;
  const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.05,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+3);const g2=AC.createGain();g2.gain.value=.25;
  o.connect(g);o2.connect(g2);g2.connect(g);g.connect(SB.music);g.connect(MU.delay);const s=AC.createGain();s.gain.value=.8;g.connect(s);s.connect(SB.revIn);o.start(t);o2.start(t);o.stop(t+3.1);o2.stop(t+3.1)}
function musicTick(){if(!MU||!AC)return;const t=AC.currentTime,menu=!$('#intro').hidden,cfg=sndCfg();if(cfg.mu<=0)return;
  const dur=menu?12:10;if(t>MU.next-.5){padChord(PROG[MU.ci%PROG.length],MU.next,dur,menu);MU.ci++;MU.next+=dur}
  if(t>MU.bell){const n=PENTA[(Math.random()*PENTA.length)|0];bell(MU.bell,n);if(Math.random()<.4)bell(MU.bell+.33,PENTA[(Math.random()*PENTA.length)|0]);MU.bell+=menu?1.8+Math.random()*2.5:2.5+Math.random()*4}
  // bojová vrstva: tepajúci basový pulz a tlmené „hi-haty“ (100 BPM), plynulo sa prilína
  const fight=!menu&&typeof enemies!=='undefined'&&(raidActive||enemies.some(e=>e.aggro&&!e.leaving&&e.pos.distanceTo(ship.position)<90));
  MU.tens.gain.setTargetAtTime(fight?1:0,t,fight?.8:2.5);
  if(t>MU.beat-.2){const bt=MU.beat,q=.3;if(MU.tens.gain.value>.02)for(let i=0;i<4;i++){const tb=bt+i*q;
      if(i%2===0){const k=AC.createOscillator();k.type='sine';k.frequency.setValueAtTime(110,tb);k.frequency.exponentialRampToValueAtTime(40,tb+.18);const kg=AC.createGain();kg.gain.setValueAtTime(.18,tb);kg.gain.exponentialRampToValueAtTime(.0001,tb+.25);k.connect(kg);kg.connect(MU.tens);k.start(tb);k.stop(tb+.3)}
      const h=AC.createBufferSource();h.buffer=SB.noise;const hf=filt('highpass',7000);const hg=AC.createGain();hg.gain.setValueAtTime(.05,tb+q/2);hg.gain.exponentialRampToValueAtTime(.0001,tb+q/2+.06);h.connect(hf);hf.connect(hg);hg.connect(MU.tens);h.start(tb+q/2,Math.random());h.stop(tb+q/2+.08)}
    MU.beat+=4*q}}

/* ---- karta Zvuk v Nastaveniach ---- */
function soundCard(){const c=sndCfg();const row=(k,l)=>`<div class="sndrow"><span>${t(l)}</span><input type="range" min="0" max="100" step="5" data-snd="${k}" value="${c[k]}"><b>${c[k]} %</b></div>`;
  return `<div class="card sndcard"><h3>${t('snd.h')}</h3>${row('m','snd.m')}${row('mu','snd.mu')}${row('s','snd.s')}${row('u','snd.u')}
    <div class="sndrow"><span>${t('snd.sp')}</span><div class="langs"><button class="langb" data-act="sndSp" data-v="1" aria-pressed="${!!c.sp}">${t('on')}</button><button class="langb" data-act="sndSp" data-v="0" aria-pressed="${!c.sp}">${t('off')}</button></div></div>
    <div class="sndrow"><span>${t('snd.test')}</span><button class="langb" data-act="sndTest">▶ ${t('snd.testB')}</button><small class="note" id="sndState" style="margin:0">${sndState()}</small></div>
    <p>${t('snd.d')}</p></div>`}
/* stav zvuku pre Nastavenia (pomáha nájsť, prečo nič nehrá) */
function sndState(){if(!(window.AudioContext||window.webkitAudioContext))return t('snd.st.none');if(!AC)return t('snd.st.wait');return AC.state==='running'?t('snd.st.ok'):t('snd.st.susp')+' ('+AC.state+')'}
/* tlačidlo „Test zvuku“: prebudí zvuk (ak ho prehliadač uspal) a zahrá výstrel + tón */
function sndTest(){sndWake();const go=()=>{sfx('laser',null,{st:'blue'});setTimeout(()=>sfx('toast'),350);const el=document.getElementById('sndState');if(el)el.textContent=sndState()};
  if(AC&&AC.state!=='running')AC.resume().then(go,go);else go()}
document.addEventListener('input',e=>{const k=e.target&&e.target.dataset&&e.target.dataset.snd;if(!k||!state)return;state.snd=Object.assign(sndCfg(),{[k]:+e.target.value});
  const b=e.target.nextElementSibling;if(b)b.textContent=e.target.value+' %';sndWake();sndApply();save()});
document.addEventListener('change',e=>{if(e.target&&e.target.dataset&&e.target.dataset.snd==='u')sfx('click')});

/* kliknutie a prechod myšou po tlačidlách (menu, HUD, okná) */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button,summary,.itm,.eqc');if(b&&!b.disabled&&!b.closest('#sheetClose'))sfx('click')},true);
document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse')return;const b=e.target.closest&&e.target.closest('button,.itm');if(b&&!b.disabled&&!(e.relatedTarget&&b.contains(e.relatedTarget)))sfx('hover')});

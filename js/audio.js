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
  const g=()=>AC.createGain();SB={master:g(),music:g(),sfx:g(),ui:g(),rev:AC.createConvolver(),revIn:g(),comp:AC.createDynamicsCompressor()};
  SB.comp.threshold.value=-14;SB.comp.ratio.value=4;SB.comp.attack.value=.004;SB.comp.release.value=.2;
  SB.music.connect(SB.master);SB.sfx.connect(SB.master);SB.ui.connect(SB.master);SB.master.connect(SB.comp);SB.comp.connect(AC.destination);
  // dozvuk: impulz = doznievajúci šum (2,8 s), vo vesmíre zvuk pôsobí „priestranne“
  const L=AC.sampleRate*2.8,ir=AC.createBuffer(2,L,AC.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<L;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/L,2.6)}
  SB.rev.buffer=ir;SB.revIn.connect(SB.rev);SB.rev.connect(SB.master);SB.revIn.gain.value=.5;
  // spoločný biely šum (2 s)
  const N=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),nd=N.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;SB.noise=N;
  sndApply();return AC}
function sndApply(){if(!AC)return;const c=sndCfg(),t=AC.currentTime,v=x=>Math.pow(x/100,1.6);
  SB.master.gain.setTargetAtTime(v(c.m),t,.05);SB.music.gain.setTargetAtTime(v(c.mu)*.55,t,.3);SB.sfx.gain.setTargetAtTime(v(c.s),t,.05);SB.ui.gain.setTargetAtTime(v(c.u)*.7,t,.05)}
// prvé gesto hráča: vytvoriť / prebudiť zvuk (iOS a Safari to inak nedovolia) a spustiť hudbu
function sndWake(){const a=sndInit();if(!a)return;if(a.state!=='running')a.resume();musicStart()}
for(const ev of['pointerdown','keydown','touchend'])addEventListener(ev,sndWake,{capture:true,passive:true});
document.addEventListener('visibilitychange',()=>{if(!AC)return;if(document.hidden)AC.suspend();else AC.resume()});

/* ---- stavebné kamene ---- */
const now=()=>AC.currentTime;
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

/* ---- zvukové efekty ---- */
const SFX={
  // rozhranie
  click(){const t=now(),o=outNode(SB.ui,null,.05,.12);env(o,t,.003,.35,.07);const a=osc('triangle',1500,t,.1,o);a.frequency.exponentialRampToValueAtTime(900,t+.07)},
  hover(){const t=now(),o=outNode(SB.ui,null,0,.06);env(o,t,.002,.07,.04);osc('sine',2400,t,.05,o)},
  open(){const t=now(),o=outNode(SB.ui,null,.25,.4);env(o,t,.04,.22,.3);const f=filt('bandpass',500,2);f.connect(o);f.frequency.exponentialRampToValueAtTime(3200,t+.3);noise(t,.38,f);const a=osc('sine',320,t,.3,o);a.frequency.exponentialRampToValueAtTime(640,t+.25)},
  close(){const t=now(),o=outNode(SB.ui,null,.2,.3);env(o,t,.02,.18,.24);const f=filt('bandpass',2600,2);f.connect(o);f.frequency.exponentialRampToValueAtTime(400,t+.25);noise(t,.28,f)},
  toast(){const t=now(),o=outNode(SB.ui,null,.3,.6);env(o,t,.005,.18,.5);osc('sine',880,t,.5,o);const o2=outNode(SB.ui,null,.3,.6);env(o2,t+.09,.005,.16,.5);osc('sine',1320,t+.09,.5,o2)},
  good(){const t=now();[0,4,7,12].forEach((n,i)=>{const o=outNode(SB.ui,null,.35,.7);env(o,t+i*.07,.005,.2,.55);osc('triangle',523.25*Math.pow(2,n/12),t+i*.07,.6,o)})},
  bad(){const t=now(),o=outNode(SB.ui,null,.1,.4);env(o,t,.01,.22,.3);const f=filt('lowpass',900);f.connect(o);const a=osc('sawtooth',180,t,.35,f);a.frequency.linearRampToValueAtTime(120,t+.3)},
  coin(){const t=now();[0,1].forEach(i=>{const o=outNode(SB.ui,null,.3,.5);env(o,t+i*.08,.003,.2,.4);const f=filt('lowpass',4000);f.connect(o);osc('square',i?1975:1318,t+i*.08,.42,f)})},
  // zbrane: hráč podľa štýlu strely, veža, pirát
  laser(pos,o={}){const st=o.st||'blue',k=o.fx?.55:1,t=now(),out=outNode(SB.sfx,pos,.18,.4);
    const P={grey:[1600,420,'square',.16],blue:[1900,380,'sawtooth',.2],gold:[1100,220,'sawtooth',.26],red:[1400,160,'square',.24],primal:[2400,600,'sine',.22]}[st]||[1900,380,'sawtooth',.2];
    env(out,t,.003,P[3]*k*(o.tower?.8:1),.16);const f=filt('lowpass',5200,1.5);f.connect(out);const a=osc(P[2],P[0]*(o.tower?.7:1)*(0.96+Math.random()*.08),t,.2,f);a.frequency.exponentialRampToValueAtTime(P[1]*(o.tower?.7:1),t+.15);
    const n=AC.createGain();n.gain.value=.25;n.connect(out);const hp=filt('highpass',3000);hp.connect(n);noise(t,.06,hp)},
  zap(pos){const t=now(),out=outNode(SB.sfx,pos,.25,.4);env(out,t,.002,.35,.28);const f=filt('bandpass',2400,.8);f.connect(out);noise(t,.32,f,1.6);const a=osc('sawtooth',90,t,.3,out);a.frequency.linearRampToValueAtTime(40,t+.25)},
  pirate(pos){const t=now(),out=outNode(SB.sfx,pos,.15,.35);env(out,t,.003,.17,.18);const f=filt('lowpass',2400,2);f.connect(out);const a=osc('square',700*(0.95+Math.random()*.1),t,.22,f);a.frequency.exponentialRampToValueAtTime(140,t+.18)},
  hit(pos){const t=now(),out=outNode(SB.sfx,pos,.1,.2);env(out,t,.002,.16,.1);const f=filt('bandpass',1800,1.2);f.connect(out);noise(t,.12,f)},
  hurt(){const t=now(),out=outNode(SB.sfx,null,.1,.35);env(out,t,.003,.35,.25);const f=filt('lowpass',700);f.connect(out);noise(t,.3,f);osc('sine',90,t,.25,out)},
  boom(pos,o={}){const big=o.big?1:0,t=now(),d=1.1+big*1.6,out=outNode(SB.sfx,pos,.35,d+.2);env(out,t,.005,.55+big*.35,d);
    const f=filt('lowpass',big?1400:2200,.7);f.connect(out);f.frequency.exponentialRampToValueAtTime(120,t+d);noise(t,d,f,.7);
    const s=osc('sine',big?70:110,t,d,out);s.frequency.exponentialRampToValueAtTime(28,t+d)},
  loot(pos){const t=now();[0,7,12,19].forEach((n,i)=>{const o=outNode(SB.sfx,pos,.4,.8);env(o,t+i*.05,.003,.12,.6);osc('sine',1046.5*Math.pow(2,n/12),t+i*.05,.65,o)})},
  warp(){const t=now(),out=outNode(SB.sfx,null,.5,1.6);env(out,t,.5,.4,1);const f=filt('bandpass',200,3);f.connect(out);f.frequency.exponentialRampToValueAtTime(5000,t+1.1);noise(t,1.5,f);
    const lp=filt('lowpass',900);lp.connect(out);const a=osc('sawtooth',60,t,1.4,lp);a.frequency.exponentialRampToValueAtTime(900,t+1.1)},
  beep(){const t=now(),o=outNode(SB.ui,null,.2,.3);env(o,t,.004,.2,.2);const f=filt('lowpass',2000);f.connect(o);osc('square',660,t,.22,f)},
  alarm(){const t=now();for(let i=0;i<3;i++){const o=outNode(SB.sfx,null,.3,.4);env(o,t+i*.28,.01,.22,.22);const a=osc('sawtooth',520,t+i*.28,.25,o);a.frequency.linearRampToValueAtTime(380,t+i*.28+.22)}},
  shield(pos){const t=now(),o=outNode(SB.sfx,pos,.3,.5);env(o,t,.01,.14,.4);const a=osc('sine',300,t,.45,o);a.frequency.exponentialRampToValueAtTime(900,t+.35)},
};
/* sfx(meno, poloha, voľby): obmedzenie počtu hlasov a rovnakých zvukov v krátkom čase (aby salvy nezahlušili mix) */
function sfx(name,pos,o){if(!AC||AC.state!=='running'||!SFX[name])return;const tt=performance.now(),gap={hover:60,hit:35,laser:28,pirate:40,loot:80}[name]||20;
  if(tt-(_sndLast[name]||0)<gap)return;_sndLast[name]=tt;if(_sndVoices>40&&name!=='boom')return;
  try{SFX[name](pos||null,o||{})}catch(e){}}

/* ---- slučky: motory a ťažobný laser (bez polohy – je to tvoja loď), poslucháč ---- */
let _eng=null,_mine=null;
function makeLoop(kind){const g=AC.createGain();g.gain.value=0;g.connect(SB.sfx);const L={g,nodes:[]};
  if(kind==='eng'){const f=filt('lowpass',300,.8);f.connect(g);L.f=f;const n=AC.createBufferSource();n.buffer=SB.noise;n.loop=true;n.playbackRate.value=.5;n.connect(f);n.start();
    const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=42;const og=AC.createGain();og.gain.value=.35;o.connect(og);og.connect(f);o.start();L.o=o;L.nodes.push(n,o)}
  else{const f=filt('bandpass',900,4);f.connect(g);L.f=f;const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=110;o.connect(f);o.start();
    const o2=AC.createOscillator();o2.type='square';o2.frequency.value=221;const g2=AC.createGain();g2.gain.value=.4;o2.connect(g2);g2.connect(f);o2.start();
    const lfo=AC.createOscillator();lfo.frequency.value=7;const lg=AC.createGain();lg.gain.value=180;lfo.connect(lg);lg.connect(f.frequency);lfo.start();
    const n=AC.createBufferSource();n.buffer=SB.noise;n.loop=true;const nh=filt('highpass',4000);const ng=AC.createGain();ng.gain.value=.25;n.connect(nh);nh.connect(ng);ng.connect(g);n.start();L.nodes.push(o,o2,lfo,n)}
  return L}
function sndLoop(dt){if(!AC||AC.state!=='running')return;const t=AC.currentTime,on=state&&$('#intro').hidden&&!dead&&!jumping;
  // poslucháč: nad stredom pohľadu, pozerá „dolu do obrazovky“ (hore na obrazovke = −z)
  const Ls=AC.listener,px=camTarget.x,pz=camTarget.z;
  if(Ls.positionX){Ls.positionX.setTargetAtTime(px,t,.05);Ls.positionY.setTargetAtTime(26,t,.05);Ls.positionZ.setTargetAtTime(pz+6,t,.05);Ls.forwardX.value=0;Ls.forwardY.value=-.85;Ls.forwardZ.value=-.53;Ls.upX.value=0;Ls.upY.value=.53;Ls.upZ.value=-.85}
  else if(Ls.setPosition){Ls.setPosition(px,26,pz+6);Ls.setOrientation(0,-.85,-.53,0,.53,-.85)}
  if(!_eng)_eng=makeLoop('eng');if(!_mine)_mine=makeLoop('mine');
  const sp=on?shipVel.length()/Math.max(1,shipVal('speed')):0;
  _eng.g.gain.setTargetAtTime(on?.05+sp*.22:0,t,.12);_eng.f.frequency.setTargetAtTime(160+sp*900,t,.15);_eng.o.frequency.setTargetAtTime(38+sp*30,t,.2);
  _mine.g.gain.setTargetAtTime(on&&mining?.09:0,t,mining?.05:.12);
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
    <p>${t('snd.d')}</p></div>`}
document.addEventListener('input',e=>{const k=e.target&&e.target.dataset&&e.target.dataset.snd;if(!k||!state)return;state.snd=Object.assign(sndCfg(),{[k]:+e.target.value});
  const b=e.target.nextElementSibling;if(b)b.textContent=e.target.value+' %';sndWake();sndApply();save()});
document.addEventListener('change',e=>{if(e.target&&e.target.dataset&&e.target.dataset.snd==='u')sfx('click')});

/* kliknutie a prechod myšou po tlačidlách (menu, HUD, okná) */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button,summary,.itm,.eqc');if(b&&!b.disabled&&!b.closest('#sheetClose'))sfx('click')},true);
document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse')return;const b=e.target.closest&&e.target.closest('button,.itm');if(b&&!b.disabled&&!(e.relatedTarget&&b.contains(e.relatedTarget)))sfx('hover')});

// Vykreslí ikonu hry do assets/ (icon-1024.png ... icon-16.png) a poskladá icon.ico pre Windows.
// Použitie: node tools/make_icon.js   (potrebuje Playwright s Chromiom)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const root=path.join(__dirname,'..');const b=await chromium.launch();const p=await b.newPage();
  await p.goto('file://'+path.join(__dirname,'icon.html'));
  const sizes=[1024,512,256,128,64,48,32,16];const pngs={};
  for(const s of sizes){const url=await p.evaluate(([s,simple])=>draw(s,simple),[s,s<=48]);pngs[s]=Buffer.from(url.split(',')[1],'base64');
    fs.writeFileSync(path.join(root,'assets',`icon-${s}.png`),pngs[s])}
  // ICO s PNG obrázkami (Windows Vista a novšie)
  const ico=[256,128,64,48,32,16];const head=Buffer.alloc(6+16*ico.length);head.writeUInt16LE(0,0);head.writeUInt16LE(1,2);head.writeUInt16LE(ico.length,4);
  let off=head.length;const parts=[];ico.forEach((s,i)=>{const d=pngs[s];const e=6+16*i;head.writeUInt8(s>=256?0:s,e);head.writeUInt8(s>=256?0:s,e+1);
    head.writeUInt16LE(1,e+4);head.writeUInt16LE(32,e+6);head.writeUInt32LE(d.length,e+8);head.writeUInt32LE(off,e+12);off+=d.length;parts.push(d)});
  fs.writeFileSync(path.join(root,'assets','icon.ico'),Buffer.concat([head,...parts]));
  await b.close();console.log('icons written')})();

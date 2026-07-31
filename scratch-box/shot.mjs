import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const url = 'file://' + process.cwd() + '/public/box/index.html';
const shots = [['hero',0,1440,900],['carlos','#carlos',1440,900],['edzesek','#edzesek',1440,980],['reg','#regisztracio',1440,1000]];
const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto(url,{waitUntil:'networkidle'});
await p.waitForTimeout(700);
for(const [name,sel,w,h] of shots){
  await p.setViewportSize({width:w,height:h});
  if(sel){ await p.evaluate(s=>document.querySelector(s).scrollIntoView(), sel); await p.waitForTimeout(900);}
  await p.screenshot({path:`scratch-box/d-${name}.png`});
}
const m = await b.newPage({ viewport:{width:390,height:844} });
await m.goto(url,{waitUntil:'networkidle'}); await m.waitForTimeout(700);
await m.screenshot({path:'scratch-box/m-hero.png'});
await m.evaluate(()=>document.querySelector('#regisztracio').scrollIntoView()); await m.waitForTimeout(800);
await m.screenshot({path:'scratch-box/m-reg.png'});
await b.close(); console.log('ok');

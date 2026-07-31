import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const url = 'file://' + process.cwd() + '/public/box/index.html';
const devices = [['iphone-port',390,844],['iphone-land',844,390],['android-port',412,915],['android-land',915,412]];
for (const [tag,w,h] of devices){
  const p = await b.newPage({ viewport:{width:w,height:h}, deviceScaleFactor:1, isMobile:true, hasTouch:true });
  await p.goto(url,{waitUntil:'networkidle'}); await p.waitForTimeout(400);
  const over = await p.evaluate(()=>({sw:document.documentElement.scrollWidth, iw:window.innerWidth}));
  console.log(tag, 'scrollWidth',over.sw,'innerWidth',over.iw, over.sw>over.iw+1?'❌ OVERFLOW':'✅ ok');
  await p.close();
}
// registration in landscape
const p = await b.newPage({ viewport:{width:844,height:390}, deviceScaleFactor:1.5, isMobile:true, hasTouch:true });
await p.goto(url,{waitUntil:'networkidle'});
await p.evaluate(()=>document.querySelector('#regisztracio').scrollIntoView());
await p.waitForTimeout(500);
await p.screenshot({path:'scratch-box/mob-reg-land.png'});
await b.close(); console.log('done');

import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const url = 'file://' + process.cwd() + '/public/box/index.html';
const devices = [
  ['iphone-port', 390, 844],
  ['iphone-land', 844, 390],
  ['android-port', 412, 915],
  ['android-land', 915, 412],
];
for (const [tag,w,h] of devices){
  const p = await b.newPage({ viewport:{width:w,height:h}, deviceScaleFactor:2, isMobile:true, hasTouch:true });
  await p.goto(url,{waitUntil:'networkidle'}); await p.waitForTimeout(600);
  await p.screenshot({path:`scratch-box/mob-${tag}-1.png`});
  // scroll to hero actions area to check overlap
  await p.evaluate(()=>window.scrollTo(0, Math.max(0, document.querySelector('.hero').offsetHeight - window.innerHeight)));
  await p.waitForTimeout(400);
  await p.screenshot({path:`scratch-box/mob-${tag}-2.png`});
  await p.close();
}
await b.close(); console.log('ok');

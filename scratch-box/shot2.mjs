import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const url = 'file://' + process.cwd() + '/public/box/index.html';
const m = await b.newPage({ viewport:{width:390,height:844} });
await m.goto(url,{waitUntil:'networkidle'}); await m.waitForTimeout(500);
await m.screenshot({path:'scratch-box/m-top.png'});
await m.evaluate(()=>window.scrollTo(0,600)); await m.waitForTimeout(500);
await m.screenshot({path:'scratch-box/m-scrolled.png'});
await b.close(); console.log('ok');

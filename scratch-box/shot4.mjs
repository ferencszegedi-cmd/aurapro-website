import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const url = 'file://' + process.cwd() + '/public/box/index.html';
const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto(url,{waitUntil:'networkidle'}); await p.waitForTimeout(700);
await p.screenshot({path:'scratch-box/v-hero-hu.png'});
// switch to Chinese
await p.click('.langsw button[data-lang="zh"]'); await p.waitForTimeout(500);
await p.screenshot({path:'scratch-box/v-hero-zh.png'});
// switch to Roma
await p.click('.langsw button[data-lang="rom"]'); await p.waitForTimeout(400);
await p.screenshot({path:'scratch-box/v-hero-rom.png'});
// back to HU, gallery + lightbox
await p.click('.langsw button[data-lang="hu"]'); await p.waitForTimeout(300);
await p.evaluate(()=>document.querySelector('#galeria').scrollIntoView()); await p.waitForTimeout(700);
await p.screenshot({path:'scratch-box/v-gallery.png'});
await p.evaluate(()=>document.querySelectorAll('.gallery figure')[2].click()); await p.waitForTimeout(600);
await p.screenshot({path:'scratch-box/v-lightbox.png'});
await p.close();
// mobile
const m = await b.newPage({ viewport:{width:390,height:844} });
await m.goto(url,{waitUntil:'networkidle'}); await m.waitForTimeout(600);
await m.screenshot({path:'scratch-box/v-m-top.png'});
await b.close(); console.log('ok');

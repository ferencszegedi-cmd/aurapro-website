import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto('file://'+process.cwd()+'/public/box/index.html',{waitUntil:'networkidle'});
await p.waitForTimeout(600);
await p.click('.langsw button[data-lang="en"]'); await p.waitForTimeout(500);
await p.screenshot({path:'scratch-box/en-hero.png'});
await b.close(); console.log('ok');

import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport:{width:1200,height:900} });
await p.goto('file://'+process.cwd()+'/public/box/index.html',{waitUntil:'networkidle'});
await p.addStyleTag({content:'.reveal{opacity:1!important;transform:none!important}'});
await p.evaluate(()=>document.querySelector('#galeria').scrollIntoView());
await p.waitForTimeout(700);
await p.screenshot({path:'scratch-box/gal-carlos.png'});
await b.close(); console.log('ok');

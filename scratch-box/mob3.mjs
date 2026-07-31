import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const url = 'file://' + process.cwd() + '/public/box/index.html';
const p = await b.newPage({ viewport:{width:844,height:390}, deviceScaleFactor:1.5, isMobile:true, hasTouch:true });
await p.goto(url,{waitUntil:'networkidle'});
// force all reveals visible to avoid animation timing artifacts
await p.addStyleTag({content:'.reveal{opacity:1!important;transform:none!important}'});
const y = await p.evaluate(()=>{document.querySelector('#regisztracio').scrollIntoView(); return window.scrollY;});
await p.waitForTimeout(700);
await p.screenshot({path:'scratch-box/mob-reg-land2.png'});
await p.evaluate(()=>document.querySelector('#galeria').scrollIntoView());
await p.waitForTimeout(700);
await p.screenshot({path:'scratch-box/mob-gal-land2.png'});
await b.close(); console.log('ok');

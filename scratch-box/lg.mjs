import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const url='file://'+process.cwd()+'/public/box/index.html';
for(const [w,h,t] of [[360,780,'xs'],[390,844,'m'],[915,412,'land']]){
  const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:2,isMobile:true});
  await p.goto(url,{waitUntil:'networkidle'});await p.waitForTimeout(400);
  await p.screenshot({path:`scratch-box/lg-${t}.png`,clip:{x:0,y:0,width:w,height:Math.min(h,150)}});
  const of=await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
  console.log(t,of?'OVERFLOW':'ok');
  await p.close();
}
await b.close();console.log('done');

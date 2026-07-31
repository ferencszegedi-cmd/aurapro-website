import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const url = 'file://' + process.cwd() + '/public/box/index.html';
for(const [w,h,tag] of [[390,844,'m'],[360,640,'xs']]){
  const p = await b.newPage({ viewport:{width:w,height:h} });
  await p.goto(url,{waitUntil:'networkidle'}); await p.waitForTimeout(500);
  await p.screenshot({path:`scratch-box/fix-${tag}-top.png`});
  await p.evaluate(()=>window.scrollTo(0,400)); await p.waitForTimeout(500);
  await p.screenshot({path:`scratch-box/fix-${tag}-scroll.png`});
  await p.close();
}
await b.close(); console.log('ok');

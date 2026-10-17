import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/zhuji/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output=fileURLToPath(new URL('./verification/',import.meta.url));
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[],report={};
const check=(value,message)=>{if(!value)throw new Error(message);};
const state=page=>page.evaluate(()=>window.__portfolioPreview.state);
async function jump(page,id){await page.evaluate(id=>document.getElementById(id).scrollIntoView({behavior:'instant',block:'start'}),id);await page.waitForTimeout(1050);}
async function shot(page,name){await page.screenshot({path:path.join(output,name+'.png')});}
async function swipe(page,x1,y1,x2,y2){
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x1,y:y1}]});
  for(let i=1;i<=12;i++){
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x1+(x2-x1)*i/12,y:y1+(y2-y1)*i/12}]});
    await page.waitForTimeout(20);
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await cdp.detach();await page.waitForTimeout(1000);
}
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  page.on('pageerror',error=>errors.push(error.message));
  check((await page.goto('http://127.0.0.1:4177/',{waitUntil:'networkidle'})).status()===200,'HTTP 200 expected');
  await page.waitForFunction(()=>window.__portfolioPreview?.state.ready);
  check((await state(page)).activePanel==='profile','Initial profile missing');await shot(page,'desktop-profile');
  check((await state(page)).activeImage===4,'Profile night scene missing');
  const profileA=await page.screenshot();await page.waitForTimeout(550);const profileB=await page.screenshot();
  check(!profileA.equals(profileB),'Profile night scene is not animated');
  await page.mouse.move(700,500);await page.mouse.wheel(0,120);
  for(let i=0;i<4;i++){await page.waitForTimeout(65);await page.mouse.wheel(0,90);}
  await page.waitForTimeout(1100);
  check((await state(page)).activePanel==='skills','One wheel gesture did not select skills only');
  await shot(page,'desktop-skills');
  await page.mouse.wheel(0,120);await page.waitForTimeout(1100);
  check((await state(page)).activePanel==='rust','Second wheel gesture did not select Rust');
  await shot(page,'desktop-rust');
  const a=await page.screenshot();await page.waitForTimeout(450);const b=await page.screenshot();
  check(!a.equals(b),'Ambient background not animated');
  for(const expected of [1,2,3,0]){
    await page.locator('#rust').getByRole('button',{name:'下一张图片',exact:true}).click();await page.waitForTimeout(650);
    check((await state(page)).galleryIndex===expected,'Next image or forward wrap failed');
    check((await state(page)).activeImage===[0,1,2,9][expected],'Ambient image out of sync');
  }
  await page.locator('#rust').getByRole('button',{name:'上一张图片',exact:true}).click();await page.waitForTimeout(650);
  check((await state(page)).galleryIndex===3,'Reverse wrap failed');
  await page.locator('#rust .film-card[data-offset="0"]').click();
  check(await page.locator('#image-dialog').evaluate(n=>n.open),'Image dialog missing');
  check((await page.locator('#dialog-image').getAttribute('src')).includes('gameplay'),'Dialog shows wrong image');
  await page.keyboard.press('Escape');
  check(!(await page.locator('#image-dialog').evaluate(n=>n.open)),'Escape did not close image');
  check(await page.locator('#rust .film-card[data-offset="0"]').evaluate(n=>n===document.activeElement),'Image focus not restored');
  await page.locator('#rust .film-gallery').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(650);
  check((await state(page)).galleryIndex===0,'Gallery keyboard failed');
  await page.mouse.wheel(0,120);await page.waitForTimeout(1100);
  check((await state(page)).activePanel==='boom'&&(await state(page)).activeImage===3,'Next wheel did not select BOOM');
  await shot(page,'desktop-boom');
  await page.mouse.click(30,200);await page.keyboard.press('PageDown');await page.waitForTimeout(1100);
  check((await state(page)).activePanel==='pkball','PKBall PageDown navigation failed');
  check((await state(page)).activeImage===6,'PKBall ambient missing');await shot(page,'desktop-pkball');
  for(let i=0;i<3;i++){await page.locator('#pkball .gallery-next').click();await page.waitForTimeout(650);}
  await page.locator('#pkball .film-card[data-offset="0"]').click();
  check((await page.locator('#dialog-image').getAttribute('src')).includes('pkball-loadout'),'PKBall screenshot dialog mismatch');
  await page.keyboard.press('Escape');
  check(await page.locator('.play-link').count()===3,'Expected three separate project play links');
  const binaries=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>/\.(wasm|unityweb)(\?|$)/.test(r.name)).length);
  check(binaries===0,'Portfolio must not load game binaries');
  await page.mouse.click(30,200);await page.keyboard.press('PageDown');await page.waitForTimeout(1100);
  check((await state(page)).activePanel==='notes','PageDown navigation failed');await shot(page,'desktop-notes');
  check((await state(page)).activeImage===5,'Notes night scene missing');
  const notesA=await page.screenshot();await page.waitForTimeout(550);const notesB=await page.screenshot();
  check(!notesA.equals(notesB),'Notes night scene is not animated');
  await page.keyboard.press('Home');await page.waitForTimeout(1100);
  check((await state(page)).activePanel==='profile','Home navigation failed');
  check((await state(page)).activeImage===4,'Returning home retained the game scene');
  report.nightBackground={profileAnimated:true,notesAnimated:true,returnHomeRestoresScene:true};
  await page.locator('.project-index a[href="#rust"]').click();await page.waitForTimeout(1100);
  check((await state(page)).activePanel==='rust','Project shortcut failed');
  await page.locator('#motion-toggle').click();await page.waitForTimeout(1100);
  const pausedA=await page.screenshot();await page.waitForTimeout(450);const pausedB=await page.screenshot();
  check(pausedA.equals(pausedB),'Pause did not freeze background');
  report.desktop={renderer:(await state(page)).renderer,onePanelPerWheelGesture:true,keyboard:true,projectShortcuts:true,filmLoopBothDirections:true,imageAmbientSync:true,dialogAndFocus:true,motionAndPause:true};
  report.responsive=[];
  for(const [width,height] of [[320,568],[390,844],[768,1024],[1440,600],[1440,1000]]){
    await page.setViewportSize({width,height});
    for(const id of ['profile','skills','rust','boom','pkball','notes']){
      await jump(page,id);
      const geometry=await page.evaluate(id=>{
        const panel=document.getElementById(id),r=panel.getBoundingClientRect(),content=panel.querySelector('.panel-inner').getBoundingClientRect();
        return{viewport:innerWidth,width:document.documentElement.scrollWidth,height:r.height,contentWithinPanel:content.top>=r.top-1&&content.bottom<=r.bottom+1,images:[...panel.querySelectorAll('img')].every(n=>n.complete&&n.naturalWidth>0)};
      },id);
      check(geometry.width<=width,`Horizontal overflow ${width} / ${id}`);
      check(geometry.contentWithinPanel,`Clipped content ${width} / ${id}`);
      check(geometry.images,`Missing image ${id}`);
      report.responsive.push({viewportWidth:width,viewportHeight:height,panel:id,...geometry});
    }
  }
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:'no-preference'});
  mobile.on('pageerror',e=>errors.push(e.message));
  await mobile.goto('http://127.0.0.1:4177/',{waitUntil:'networkidle'});await mobile.waitForFunction(()=>window.__portfolioPreview?.state.ready);
  await shot(mobile,'mobile-profile');await jump(mobile,'rust');await shot(mobile,'mobile-rust');
  const box=await mobile.locator('#rust .film-gallery').boundingBox();
  await swipe(mobile,300,box.y+box.height/2,90,box.y+box.height/2+4);
  check((await state(mobile)).galleryIndex===1,'Real mobile horizontal swipe failed');
  check((await state(mobile)).activePanel==='rust','Horizontal swipe moved vertical panel');
  check(!(await mobile.locator('#image-dialog').evaluate(n=>n.open)),'Swipe accidentally opened image');
  await swipe(mobile,90,box.y+box.height/2,300,box.y+box.height/2);
  check((await state(mobile)).galleryIndex===0,'Mobile reverse swipe failed');
  await swipe(mobile,195,690,195,220);
  check((await state(mobile)).activePanel==='boom','Mobile vertical swipe did not advance section');
  await jump(mobile,'notes');await shot(mobile,'mobile-notes');
  report.mobile={realTouchSwipeBothDirections:true,swipeDoesNotOpenDialog:true,verticalTouchNavigation:true};
  const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  reduced.on('pageerror',e=>errors.push(e.message));
  await reduced.goto('http://127.0.0.1:4177/',{waitUntil:'networkidle'});await reduced.waitForFunction(()=>window.__portfolioPreview?.state.ready);
  check(!(await state(reduced)).motionEnabled,'Reduced motion ignored');
  check((await state(reduced)).activeImage===4,'Reduced motion night scene missing');
  await jump(reduced,'rust');await reduced.locator('#rust .gallery-next').click();
  check((await state(reduced)).galleryIndex===1&&(await state(reduced)).activeImage===1,'Reduced motion gallery failed');
  report.reducedMotion={startsPaused:true,gallery:true};
  const fallback=await browser.newPage({viewport:{width:390,height:844}});
  await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:original.call(this,type,...args);};});
  fallback.on('pageerror',e=>errors.push(e.message));
  await fallback.goto('http://127.0.0.1:4177/',{waitUntil:'networkidle'});await fallback.waitForFunction(()=>window.__portfolioPreview?.state.ready);
  check((await state(fallback)).renderer==='css-fallback','Fallback missing');await jump(fallback,'boom');
  check((await state(fallback)).activeImage===3,'Fallback scene switch failed');
  await jump(fallback,'notes');check((await state(fallback)).activeImage===5,'Fallback notes scene missing');
  await jump(fallback,'profile');check((await state(fallback)).activeImage===4,'Fallback profile scene missing');
  report.fallback={activated:true,sceneSwitch:true};
  check(errors.length===0,'Browser errors: '+errors.join('; '));report.pageErrors=errors;report.result='passed';
  await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}catch(error){console.error(error);process.exitCode=1;}finally{await browser.close();}

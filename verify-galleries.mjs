import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/zhuji/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url=process.env.PORTFOLIO_URL||'http://127.0.0.1:4177/';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',...(url.startsWith('https:')?{proxy:{server:'http://127.0.0.1:65532'}}:{})});
const errors=[],report={url,desktop:[],mobile:[]},ids=['rust','boom','pkball'];
const check=(ok,message)=>{if(!ok)throw Error(message);};
async function jump(page,id){await page.evaluate(id=>document.getElementById(id).scrollIntoView({behavior:'instant',block:'start'}),id);await page.waitForTimeout(650);}
async function closed(page){await page.waitForFunction(()=>!document.querySelector('#image-dialog').open);check(await page.locator('#image-dialog').isHidden(),'Closed dialog still visible');}
async function open(page,id){await page.locator('#'+id+' .film-card[data-offset="0"]').click();await page.waitForFunction(()=>document.querySelector('#image-dialog').open);}
async function swipe(page,box,direction){const cdp=await page.context().newCDPSession(page);const x1=direction>0?box.x+box.width*.75:box.x+box.width*.25,x2=direction>0?box.x+box.width*.25:box.x+box.width*.75,y=box.y+box.height/2;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x1,y}]});for(let i=1;i<=10;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x1+(x2-x1)*i/10,y}]});await page.waitForTimeout(20);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();await page.waitForTimeout(650);}
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
 // An old cached unversioned resource must no longer be requested by the current page.
 let oldScriptRequested=false;
 await page.route('**/app.js',route=>{oldScriptRequested=true;return route.abort();});
 await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__portfolioPreview?.state.ready);
 check(!oldScriptRequested,'Unversioned app script requested');
 check(await page.locator('script[src^="app.js?v="]').count()===1,'App content version missing');
 check(await page.locator('.film-gallery').count()===3,'Expected three film galleries');
 for(const id of ids){
  await jump(page,id);const sources=[];
  for(let i=0;i<4;i++){
   const card=page.locator('#'+id+' .film-card[data-offset="0"]');const src=await card.locator('img').getAttribute('src');sources.push(src);
   check(await card.locator('img').evaluate(n=>n.complete&&n.naturalWidth>0),'Image missing '+id+' '+i);
   await open(page,id);check(await page.locator('#dialog-image').getAttribute('src')===src,'Wrong enlarged image');
   await page.locator('#dialog-close').click();await closed(page);
   check(await card.evaluate(n=>n===document.activeElement),'Focus not restored '+id);
   await page.locator('#'+id+' .gallery-next').click();await page.waitForTimeout(650);
  }
  check(new Set(sources).size===4,'Expected four distinct images '+id);
  check(await page.evaluate(id=>window.__portfolioPreview.state.galleryIndices[id]===0,id),'Forward loop failed '+id);
  await page.locator('#'+id+' .gallery-prev').click();await page.waitForTimeout(650);
  check(await page.evaluate(id=>window.__portfolioPreview.state.galleryIndices[id]===3,id),'Reverse loop failed '+id);
  await page.locator('#'+id+' .film-gallery').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(650);
  await open(page,id);await page.keyboard.press('Escape');await closed(page);
  await open(page,id);await page.mouse.click(5,5);await closed(page);
  await page.screenshot({path:'verification/gallery-'+id+'-desktop.png'});
  report.desktop.push({project:id,images:4,loopBothWays:true,clickCloseForEveryImage:true,escape:true,backdrop:true,keyboard:true});
 }
 await page.setViewportSize({width:1440,height:600});await jump(page,'rust');await open(page,'rust');const close=await page.locator('#dialog-close').boundingBox();check(close.y>=0&&close.y+close.height<=600,'Close button outside short viewport');await page.locator('#dialog-close').click();await closed(page);
 for(const width of [320,390]){
  const mobile=await browser.newPage({viewport:{width,height:width===320?568:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(url,{waitUntil:'networkidle'});await mobile.waitForFunction(()=>window.__portfolioPreview?.state.ready);
  for(const id of ids){
   await jump(mobile,id);const gallery=mobile.locator('#'+id+' .film-gallery');await gallery.scrollIntoViewIfNeeded();const box=await gallery.boundingBox();
   await swipe(mobile,box,1);check(await mobile.evaluate(id=>window.__portfolioPreview.state.galleryIndices[id]===1,id),'Mobile swipe failed '+id);
   check(await mobile.locator('#image-dialog').isHidden(),'Swipe opened dialog '+id);
   await swipe(mobile,box,-1);check(await mobile.evaluate(id=>window.__portfolioPreview.state.galleryIndices[id]===0,id),'Mobile reverse swipe failed '+id);
   await mobile.locator('#'+id+' .film-card[data-offset="0"]').tap();await mobile.waitForFunction(()=>document.querySelector('#image-dialog').open);
   const bounds=await mobile.locator('#dialog-close').boundingBox();check(bounds.y>=0&&bounds.y+bounds.height<=(width===320?568:844),'Mobile close button clipped');
   await mobile.locator('#dialog-close').tap();await closed(mobile);
   check(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile overflow');
   await mobile.screenshot({path:'verification/gallery-'+id+'-'+width+'.png'});
   report.mobile.push({width,project:id,swipeBothWays:true,tapToEnlarge:true,tapToClose:true});
  }
  await mobile.close();
 }
 // The close form must survive script initialization failure, which caused the reported bug.
 const fallback=await browser.newPage();await fallback.route('**/app.js?*',route=>route.abort());await fallback.goto(url);await fallback.locator('#image-dialog').evaluate(n=>n.showModal());await fallback.locator('#dialog-close').click();await closed(fallback);
 const withoutAmbient=await browser.newPage({viewport:{width:1440,height:1000}});withoutAmbient.on('pageerror',e=>errors.push(e.message));await withoutAmbient.route('**/ambient.js?*',route=>route.abort());await withoutAmbient.goto(url);await jump(withoutAmbient,'boom');await open(withoutAmbient,'boom');await withoutAmbient.locator('#dialog-close').click();await closed(withoutAmbient);
 report.galleryWithoutAmbient=true;
 report.nativeCloseWithoutApp=true;report.versionedResources=true;report.pageErrors=errors;check(errors.length===0,errors.join('\n'));
 await writeFile('verification/galleries-report.json',JSON.stringify(report,null,2));console.log('PASS: three independent four-image films; click/tap close, Esc, backdrop, keyboard, mobile swipes, short windows, versioned cache, native close fallback.');
}finally{await browser.close();}

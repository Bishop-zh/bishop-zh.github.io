import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const require = createRequire(import.meta.url);
const {chromium} = require('C:/Users/zhuji/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors = [], checks = [];
const assert = (ok, message) => {if (!ok) throw new Error(message);};
try {
  const page = await browser.newPage({reducedMotion:'reduce'});
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    for (const route of ['/', '/resume.html']) {
      const response = await page.goto('http://127.0.0.1:4177'+route);
      assert(response.status() === 200, 'HTTP error');
      await page.evaluate(() => document.fonts.ready);
      assert(await page.locator('h1').innerText().then(t=>t.includes('张梓彦')), 'Name missing');
      assert(await page.locator('body').innerText().then(t=>t.includes('2027') && (route!=='/' || t.includes('2026 年 11 月 10 日后'))), 'Education or availability missing');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), `Overflow: ${width} ${route}`);
      if (route === '/') {
        assert(await page.locator('.capabilities h3').count()===5, 'Skill groups missing');
        assert(await page.locator('.panel').evaluateAll(nodes=>nodes.map(n=>n.id).join(',')==='profile,skills,rust,boom,notes'), 'Panel order incorrect');
        await page.locator('.site-header a[href="#skills"]').click();
        await page.waitForFunction(()=>window.__portfolioPreview.state.activePanel==='skills');
        assert(await page.locator('#page-number').innerText()==='02', 'Skills page number incorrect');
        assert(await page.locator('#notes .capabilities').count()===0, 'Duplicate skills');
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), 'Skills overflow');
        await page.screenshot({path:fileURLToPath(new URL(`verification/skills-${width}.png`,import.meta.url))});
        await page.locator('.wordmark').click();
        await page.locator('.profile-actions a[href="resume.html"]').click();
        assert(page.url().endsWith('/resume.html'), 'Resume link failed');
        await page.goBack();
      } else {
        assert(await page.locator('.resume-avatar').evaluate(n=>n.complete && n.naturalWidth===850), 'Resume avatar missing');
        assert(await page.locator('.resume-project').count()===3, 'Expected three resume projects');
        await page.evaluate(()=>{window.print=()=>{window.printInvoked=true;};});
        await page.locator('#print-resume').click();
        assert(await page.evaluate(()=>window.printInvoked), 'Print button failed');
      }
      checks.push({width,route,passed:true});
      if ([390,1440].includes(width)) await page.screenshot({path:fileURLToPath(new URL(`verification/profile-update-${width}-${route==='/'?'home':'resume'}.png`,import.meta.url)),fullPage:route!=='/'});
    }
  }
  await page.emulateMedia({media:'print'});
  assert(await page.locator('.resume-toolbar').isHidden(),'Print toolbar visible');
  await page.screenshot({path:fileURLToPath(new URL('verification/resume-print.png',import.meta.url)),fullPage:true});
  assert(errors.length===0,errors.join('\n'));
  await writeFile(new URL('verification/profile-report.json',import.meta.url),JSON.stringify({checks,printButton:true,printStyles:true,errors},null,2));
  console.log('PASS: five panels, skills navigation and page 02, profile and resume at 320/390/768/1440px, print action and print CSS; no page errors.');
} finally {await browser.close();}

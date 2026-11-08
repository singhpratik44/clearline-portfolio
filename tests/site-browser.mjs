import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const server=spawn('python3',['-m','http.server','8767','--bind','127.0.0.1'],{stdio:'ignore'});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let browser;
try {
 await sleep(1200);
 browser=await chromium.launch({headless:true});
 for(const viewport of [{width:390,height:844},{width:1280,height:800}]) {
   const page=await browser.newPage({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8767/');
   await page.locator('#aperture-site-navigation').waitFor();
   assert.equal(await page.locator('.project').count(),19);
   assert.match(await page.title(),/APERTURE/);
   await page.getByRole('button',{name:'Sports',exact:true}).click();
   assert.equal(await page.locator('.project:visible').count(),3);
   await page.getByRole('button',{name:'All',exact:true}).click();
   await page.locator('#project-search').fill('basketball');
   assert.ok((await page.locator('.project:visible').count())>=1);
   await page.locator('#project-search').fill('');
   const menu=page.locator('#aperture-site-navigation').locator('summary');
   await menu.click();
   assert.ok((await page.locator('#aperture-site-navigation').locator('.menu a').count())>=19);
   assert.deepEqual(errors,[],'Homepage JavaScript errors');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'Homepage horizontal overflow');
   for(const path of ['basketball.html','clearline/','lab/']){
      await page.goto('http://127.0.0.1:8767/'+path);
      await page.locator('#aperture-site-navigation').waitFor();
      const home=page.locator('#aperture-site-navigation').locator('a.logo');
      assert.ok((await home.getAttribute('href')).endsWith('/'));
   }
   await page.close();
 }
 console.log('PASS: APERTURE shared navigation and homepage mobile/desktop smoke tests');
}finally{if(browser)await browser.close();server.kill()}

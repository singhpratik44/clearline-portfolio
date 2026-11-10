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
   assert.equal(await page.locator('.project').count(),20);
   assert.match(await page.title(),/APERTURE/);
   await page.getByRole('button',{name:'Sports',exact:true}).click();
   assert.equal(await page.locator('.project:visible').count(),4);
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
   await page.goto('http://127.0.0.1:8767/sports-os/');
   await page.locator('#stage-name').waitFor();
   assert.equal(await page.locator('#stage-name').innerText(),'Youth / assistant coach');
   await page.locator('[data-role="mental"]').click();
   assert.equal(await page.locator('#stage-name').innerText(),'Mental performance explorer');
   await page.locator('#duration').selectOption('75');
   await page.locator('#build-practice').click();
   assert.equal(await page.locator('#practice-list time').count(),5);
   assert.equal((await page.locator('#practice-list time').allTextContents()).reduce((sum,v)=>sum+Number.parseInt(v,10),0),75);
   await page.locator('#evidence-title').fill('Coaching sample');
   await page.locator('#evidence-form button[type="submit"]').click();
   assert.equal(await page.locator('.ledger-row').count(),1);
   assert.deepEqual(errors,[],'Sports Career OS JavaScript errors');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'Sports Career OS horizontal overflow');
   await page.goto('http://127.0.0.1:8767/sports-os/opportunities.html');
   await page.locator('#job-list .card').first().waitFor();
   assert.ok((await page.locator('#job-list .card').count())>=4);
   await page.locator('#lane').selectOption('Coaching');
   assert.equal(await page.locator('#job-list .card').count(),1);
   await page.locator('#job-list button').first().click();
   assert.equal(await page.locator('#metric-saved').textContent(),'1');
   await page.locator('#lane').selectOption('all');
   assert.deepEqual(errors,[],'Sports opportunity UI JavaScript errors');

   await page.goto('http://127.0.0.1:8767/sports-os/profile.html');
   await page.locator('#name').fill('Sample Coach');
   await page.locator('#bio').fill('Youth practice systems with verified, consent-aware evidence.');
   await page.locator('#skills').fill('Practice design, Coaching');
   await page.locator('#ack').check();
   await page.locator('#preview-btn').click();
   assert.match(await page.locator('#profile-preview').innerText(),/Sample Coach/);
   assert.equal(await page.locator('#export-html').isEnabled(),true);
   await page.locator('#clear').click();
   assert.equal(await page.locator('#export-html').isDisabled(),true);
   assert.deepEqual(errors,[],'Sports profile builder JavaScript errors');

   await page.goto('http://127.0.0.1:8767/sports-os/marketplace.html');
   await page.locator('[data-select="club"]').click();
   await page.locator('#client').fill('Sample Community Sports Club');
   await page.locator('#objective').fill('Improve staffing capacity and coach retention.');
   await page.locator('#metric').fill('Coach retention rate');
   await page.locator('#scope-confirm').check();
   await page.locator('#scope-form button[type="submit"]').click();
   assert.match(await page.locator('#scope-preview').innerText(),/DRAFT ONLY/);
   assert.equal(await page.locator('#download').isEnabled(),true);
   assert.deepEqual(errors,[],'Sports services studio JavaScript errors');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'Sports V2 horizontal overflow');
   await page.close();
 }
 console.log('PASS: APERTURE Sports V2 mobile/desktop careers, profiles and services');
}finally{if(browser)await browser.close();server.kill()}

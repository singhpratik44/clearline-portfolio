import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const server=spawn('python3',['-m','http.server','8997','--bind','127.0.0.1'],{stdio:'ignore'});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let browser;
try{
 await sleep(1200);
 browser=await chromium.launch({headless:true});
 for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
  const page=await browser.newPage({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8997/sports-os/market/');
  await page.locator('#gift-grid .product').first().waitFor({timeout:15000});
  assert.equal(await page.locator('.launch-actions .launch-tile').count(),4,'Four immediate mobile entry points');
  assert.ok(await page.locator('.launchpad').isVisible());
  if(viewport.width<500){
    assert.ok(await page.locator('.mobile-dock').isVisible(),'Persistent mobile actions');
    await page.locator('#mobile-menu-toggle').click();
    assert.equal(await page.locator('#mobile-menu-toggle').getAttribute('aria-expanded'),'true');
    await page.locator('#mobile-menu-toggle').click();
    assert.equal(await page.locator('#mobile-menu-toggle').getAttribute('aria-expanded'),'false');
    assert.ok((await page.locator('.launchpad').boundingBox()).y<150,'Command deck appears immediately');
  }

  assert.ok((await page.locator('#gift-grid .product').count())>=42,'42+ existing sports gifts on marketplace');
  assert.equal(await page.locator('#sponsor-products .panel.ad').count(),3);
  assert.equal(await page.locator('#sponsor-products a[href^="https://book.stripe.com/"]').count(),3);
  await page.locator('[data-world="gifts"]').click();
  assert.match(await page.locator('#world-title').innerText(),/Give the game meaning/);
  assert.equal(await page.locator('#world-action').getAttribute('href'),'#gifts');
  await page.locator('[data-world="moments"]').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('[data-world="gifts"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('[data-world="moments"]').getAttribute('aria-pressed'),'false');
  assert.ok((await page.locator('#league-cards .panel').count())>=6);
  await page.locator('[data-league="basketball"]').click();
  assert.ok((await page.locator('#league-cards .panel').count())>=2);
  await page.locator('[data-league="all"]').click();
  await page.locator('#recipient').fill('A');
  await page.locator('#occasion').selectOption('thanks');
  await page.locator('#message').fill('You made the team stronger!');
  await page.locator('#moment-form button[type="submit"]').click();
  assert.match(await page.locator('#moment-title').innerText(),/^A,/);
  assert.ok(page.url().includes('#m='),'share moment is encoded in URL fragment');
  await page.reload();
  assert.match(await page.locator('#moment-title').innerText(),/^A,/,'moment restores from share URL');
  await page.locator('#gift-category').selectOption('soccer');
  assert.ok((await page.locator('#gift-grid .product').count())>=1);
  await page.locator('#gift-category').selectOption('all');
  await page.locator('#gift-sort').selectOption('low');
  assert.ok((await page.locator('#gift-grid .product').count())>=42);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'no marketplace overflow');
  assert.deepEqual(errors,[],'no uncaught marketplace errors');
  await page.goto('http://127.0.0.1:8997/sports-os/market/advertising.html');
  assert.match(await page.title(),/Advertising Conditions/);
  assert.match(await page.locator('main').innerText(),/full refund/i);
  await page.goto('http://127.0.0.1:8997/sports-os/market/technology.html');
  assert.match(await page.title(),/Live Data/);
  await page.close();
 }
 console.log('APERTURE SPORTS MARKET: mobile and desktop buy, sponsor, live-link and shareability smoke PASS');
}finally{await browser?.close();server.kill()}

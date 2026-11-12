import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const server=spawn('python3',['-m','http.server','8771','--bind','127.0.0.1'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let browser;
try {
 await sleep(1100);
 browser=await chromium.launch({headless:true});
 for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
  const page=await browser.newPage({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://buy.stripe.com/**',route=>route.abort('blockedbyclient'));
  await page.goto('http://127.0.0.1:8771/code-the-game/');
  assert.match(await page.title(),/CODE THE GAME/);
  assert.equal(await page.locator('#before-you-buy').count(),1);
  assert.equal(await page.locator('a[href^="https://buy.stripe.com/"]').count()>=4,true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'storefront horizontal overflow');
  await page.getByRole('link',{name:/Try a free lesson/i}).first().click();
  assert.match(page.url(),/\/code-the-game\/start\//);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'starter horizontal overflow');
  await page.goto('http://127.0.0.1:8771/code-the-game/marketing/');
  assert.match(await page.title(),/Free Game Coding/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'marketing horizontal overflow');
  await page.goto('http://127.0.0.1:8771/code-the-game/learn/');
  assert.match(await page.title(),/Coding Pathways/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'reader horizontal overflow');
  assert.deepEqual(errors,[],'no uncaught page errors');
  await page.close();
 }
 console.log('CODE THE GAME mobile + desktop read-only journey passed; no checkout initiated');
}finally{await browser?.close();server.kill()}

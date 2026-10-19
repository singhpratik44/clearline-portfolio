import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let browser;
try{
 await sleep(1200);
 browser=await chromium.launch({headless:true});
 for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
  const page=await browser.newPage({viewport,hasTouch:viewport.width<500,isMobile:viewport.width<500});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765/interactive-decision-universe.html');
  await page.locator('#served').waitFor();
  assert.equal(await page.locator('#served').innerText(),'50');
  assert.match(await page.locator('#integrity').innerText(),/PASS/);
  await page.locator('#absence').click();
  assert.equal(await page.locator('#served').innerText(),'45');
  await page.locator('#undo').click();
  assert.equal(await page.locator('#served').innerText(),'50');
  await page.locator('#campaign').click();
  assert.equal(await page.locator('#unserved').innerText(),'10');
  await page.locator('#reset').click();
  assert.equal(await page.locator('#unserved').innerText(),'0');
  await page.locator('[data-plan="follow"]').click();
  assert.match(await page.locator('#comparison').innerText(),/Illustrative revenue/);
  await page.locator('#record').click();
  assert.match(await page.locator('#history').innerText(),/compared: follow/);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
  assert.equal(overflow,false,'Unexpected horizontal overflow');
  assert.deepEqual(errors,[],'Page errors');
  await page.close();
 }
 console.log('PASS: mobile and desktop browser interaction smoke tests');
}finally{if(browser)await browser.close();server.kill();}

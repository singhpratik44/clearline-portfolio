import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const server=spawn('python3',['-m','http.server','8766','--bind','127.0.0.1'],{stdio:'ignore'});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let browser;
try {
  await sleep(1250);
  browser=await chromium.launch({headless:true});
  for(const viewport of [{width:390,height:844},{width:1280,height:800}]) {
    const page=await browser.newPage({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:8766/civilization-lab.html');
    assert.match(await page.locator('h1').innerText(),/Turn complex/i);
    await page.locator('[data-preset="stem"]').click();
    assert.equal(await page.locator('#participants').inputValue(),'120');
    assert.match(await page.locator('#simResult').innerText(),/36 enrollments/);
    assert.equal(await page.locator('.barwrap').count(),3);
    await page.locator('[data-agent="6"]').click();
    assert.match(await page.locator('#agentDetail').innerText(),/Coach and scout/);
    await page.locator('#runPreflight').click();
    assert.match(await page.locator('#preflightResult').innerText(),/BLOCKED/);
    await page.locator('#proposal').fill('Add a second weekly youth basketball coaching session to reduce the waitlist.');
    await page.locator('#owner').fill('Center program manager');
    await page.locator('#mappedDeps').check();
    await page.locator('#humanGate').check();
    await page.locator('#claim').fill('Baseline count documented in program records');
    await page.locator('#source').fill('https://example.org/illustrative-source');
    await page.locator('#status').selectOption({label:'Reviewer-attested (not independently audited)'});
    await page.locator('#addEvidence').click();
    await page.locator('#linkedEvidence').selectOption('0');
    await page.locator('#runPreflight').click();
    assert.match(await page.locator('#preflightResult').innerText(),/READY FOR HUMAN REVIEW/);
    await page.locator('#recordPreflight').click();
    assert.equal(await page.locator('#decisionCount').innerText(),'1');
    await page.reload();
    assert.equal(await page.locator('#decisionCount').innerText(),'1');
    assert.deepEqual(errors,[], 'No runtime JS errors');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
    assert.equal(overflow,false,'No horizontal overflow');
    await page.close();
  }
  console.log('PASS: civilization lab mobile + desktop interaction journeys');
} finally {if(browser)await browser.close();server.kill();}

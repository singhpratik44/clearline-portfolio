import {chromium} from "playwright";
import {spawn} from "node:child_process";
import assert from "node:assert/strict";
const server=spawn("python3",["-m","http.server","8793","--bind","127.0.0.1"],{stdio:"ignore"});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const BASE="http://127.0.0.1:8793/mission-control/";
let browser;
try{
 await sleep(1000);
 browser=await chromium.launch({headless:true});
 for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500,acceptDownloads:true});
  const page=await context.newPage(),errors=[],remote=[];
  page.on("pageerror",e=>errors.push(e.stack||e.message));
  page.on("request",r=>{if(!r.url().startsWith("http://127.0.0.1:8793/"))remote.push(r.url());});
  await page.goto(BASE,{waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>document.querySelectorAll("#papers .paper").length===10,{timeout:15000});
  assert.equal(await page.locator("#stat-meetings").innerText(),"4");
  assert.equal(await page.locator("#stat-proposals").innerText(),"1");
  assert.ok(await page.locator("#loom").isVisible());
  assert.equal(await page.locator("#meeting-list .item").count(),4);
  assert.equal(await page.locator("#task-list .item").count(),8);
  assert.equal(await page.locator("#proposal-list .item").count(),1);
  assert.equal((await page.locator("#privacy-state").innerText()).includes("SYNTHETIC DEMO"),true);
  await page.locator('[data-mode="meetings"]').click();
  assert.equal(await page.locator('[data-mode="meetings"]').getAttribute("aria-pressed"),"true");
  await page.locator("#meeting-list .title-button").first().click();
  assert.equal(await page.locator("#meeting-editor").isEnabled(),true);
  await page.locator("#meeting-editor").fill("This is a synthetic meeting note for QA.");
  await page.locator("#save-notes").click();
  await page.waitForFunction(()=>document.querySelector("#inspector-body")?.textContent?.includes("synthetic meeting note for QA"));
  const before=await page.locator("#task-list .item").count();
  await page.locator("#decision-module details.create summary").click();
  await page.locator("#proposal-meeting").selectOption("m-atlas");
  await page.locator("#proposal-title").fill("Verify lead handoff status in CRM");
  await page.locator("#proposal-owner").fill("Test reviewer");
  await page.locator("#proposal-source").fill("Exact QA note: verify response-time ownership before outreach.");
  await page.locator("#proposal-due").fill("2026-11-20");
  await page.locator("#proposal-form button[type=submit]").click();
  assert.equal(await page.locator("#stat-proposals").innerText(),"2");
  await page.locator("#reviewer").fill("Human reviewer");
  await page.locator("#approve-check").check();
  const row=page.locator("#proposal-list .item").filter({hasText:"Verify lead handoff status"});
  await row.getByRole("button",{name:"Review + approve"}).click();
  assert.equal(await page.locator("#task-list .item").count(),before+1);
  assert.equal(await page.locator("#stat-proposals").innerText(),"1");
  assert.match(await page.locator("#activity-log").innerText(),/ACTION APPROVED/);
  await page.locator("#vault-pass").fill("a strong test-only passphrase 2026");
  await page.locator("#vault-repeat").fill("a strong test-only passphrase 2026");
  await page.locator("#vault-save").click();
  await page.waitForFunction(()=>document.querySelector("#privacy-state")?.textContent?.includes("SAVED"));
  assert.equal(await page.evaluate(()=>localStorage.length),0);
  await page.reload();
  await page.locator("#stat-meetings").waitFor();
  await page.locator("#vault-pass").fill("a strong test-only passphrase 2026");
  await page.locator("#vault-open").click();
  await page.waitForTimeout(800);
  const vaultCheck=await page.evaluate(()=>({
   state:window.ApertureMissionUI?.getState?.(),
   status:document.querySelector("#privacy-state")?.textContent,
   toast:document.querySelector("#toast")?.textContent,
   errors:[],
   taskText:document.querySelector("#task-list")?.textContent?.slice(0,700)
  }));
  console.log("VAULT DEBUG",JSON.stringify({status:vaultCheck.status,toast:vaultCheck.toast,
   taskText:vaultCheck.taskText,stateCount:vaultCheck.state?.tasks?.length,projectCount:vaultCheck.state?.projects?.length,errors}));
  await page.waitForFunction(()=>document.querySelector("#task-list")?.textContent?.includes("Verify lead handoff status"),null,{timeout:10000});
  assert.equal(await page.locator("#task-list .item").count(),before+1);
  assert.equal(await page.locator("#stat-proposals").innerText(),"1");
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+3),false,"No horizontal overflow");
  assert.deepEqual(errors,[],"Browser scripting errors");
  assert.deepEqual(remote,[],"No third-party data requests");
  await context.close();
 }
 console.log("PASS APERTURE Causal Loom: mobile and desktop meetings, action review, task creation, evidence trail, research, vault encryption and restore; no outside calls.");
}finally{if(browser)await browser.close();server.kill();}

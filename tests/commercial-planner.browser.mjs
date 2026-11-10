import {chromium} from "playwright";
import {spawn} from "node:child_process";
import assert from "node:assert/strict";

const server=spawn("python3",["-m","http.server","8782","--bind","127.0.0.1"],{stdio:"ignore"});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const BASE="http://127.0.0.1:8782/commercial-4d/opportunities/";
const thread="abc123abc123abc1";
const opportunity={
 id:"synthetic-test-1",organization:"Example Partner",title:"Hypothetical referral partnership",
 kind:"partnership",stage:"meeting_offered",status_confidence:"confirmed",
 last_evidence_at:"2026-11-09T20:00:00Z",
 source_url:"https://mail.google.com/mail/u/0/#all/"+thread,
 evidence:"The recipient proposed a meeting to discuss possible referrals.",
 terms:"Possible referral partner; no written fee yet.",blockers:"Signed terms and partner approval missing.",
 proposed_next:"Ask the buyer to define one valid referral and the permission process.",
 contract_value:null,terms_confirmed:false
};
const bundle={
 schema:"aperture-commercial-private-v1",
 opportunities:[opportunity],
 plans:{"synthetic-test-1":{
 scope:"PROPOSED, NOT APPROVED: assess a permissioned family referral pilot.",
 metric:"Count only buyer-confirmed referred admissions after an approved baseline.",
 reviewer:"",fee:null,probability:null,directCost:null,acquisitionCost:null,deliveryHours:null,
 capacityHours:null,permissionConfirmed:false,capacityConfirmed:false
 }}
};
let browser;
try{
 await sleep(1200);
 browser=await chromium.launch({headless:true});
 for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
  const page=await context.newPage();
  const errors=[],external=[];
  page.on("pageerror",e=>errors.push(e.stack||e.message));
  page.on("request",r=>{if(/(?:accounts.google.com|gmail.googleapis.com)/i.test(r.url()))external.push(r.url());});
  await page.goto(BASE,{waitUntil:"domcontentloaded"});
  await page.locator("#plan-form").waitFor({state:"hidden"});
  assert.equal(await page.locator("#count").innerText(),"0");
  assert.equal((await page.content()).includes("Example Partner"),false,"Source code must contain no customer data");
  await page.locator("#upload").setInputFiles({name:"private-fixture.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(bundle))});
  await page.locator("#plan-form").waitFor({state:"visible"});
  assert.equal(await page.locator("#count").innerText(),"1");
  assert.match(await page.locator("#plan-account").innerText(),/Example Partner/i);
  await page.locator("#plan-study-total").waitFor({state:"visible"});
  const researchState=await page.evaluate(()=>({
    itemCount:document.querySelectorAll("#plan-studies .plan-study").length,
    studyLabel:document.querySelector("#plan-study-total")?.textContent,
    status:document.querySelector("#plan-status")?.textContent,
    planResultsHidden:document.querySelector("#plan-results")?.hidden,
    researchResponse:performance.getEntriesByType("resource").filter(r=>r.name.includes("research.json")).map(r=>({name:r.name,duration:r.duration}))
  }));
  console.log("RESEARCH DEBUG",JSON.stringify(researchState),"PAGE ERRORS",JSON.stringify(errors));
  await page.waitForFunction(()=>document.querySelectorAll("#plan-studies .plan-study").length===10,{timeout:10000});
  assert.equal(await page.locator("#plan-scope").inputValue(),bundle.plans["synthetic-test-1"].scope);
  assert.equal(await page.locator("#plan-record").isDisabled(),true,"Missing reviewer must block review");
  await page.locator("#plan-reviewer").fill("Test operator");
  await page.locator("#plan-fee").fill("12000");
  await page.locator("#plan-probability").fill("50");
  await page.locator("#plan-direct-cost").fill("3000");
  await page.locator("#plan-acquisition-cost").fill("300");
  await page.locator("#plan-hours").fill("30");
  assert.match(await page.locator("#plan-cases").innerText(),/\$4,200/,"Expected contribution is 50%×(12k−3k)−300");
  assert.equal(await page.locator("#plan-record").isEnabled(),true);
  await page.locator("#plan-confirm").check();
  await page.locator("#plan-record").click();
  await page.waitForFunction(()=>document.querySelector("#audit-records")?.textContent?.includes("PLAN REVIEWED"));
  assert.match(await page.locator("#audit-records").innerText(),/PLAN REVIEWED/);
  assert.match(await page.locator("#plan-readiness").innerText(),/Execution remains blocked/);
  await page.locator("#vault-passphrase").fill("strong testing passphrase 2026");
  await page.locator("#vault-confirm").fill("strong testing passphrase 2026");
  await page.locator("#save-vault").click();
  await page.waitForFunction(()=>document.querySelector("#vault-state")?.textContent?.includes("Encrypted vault saved"));
  assert.equal(await page.evaluate(()=>localStorage.length),0,"No private plain data in localStorage");
  await page.reload();
  await page.locator("#count").waitFor({state:"visible"});
  assert.equal(await page.locator("#count").innerText(),"0","App does not auto-open private storage");
  await page.locator("#vault-passphrase").fill("strong testing passphrase 2026");
  await page.locator("#unlock-vault").click();
  await page.waitForFunction(()=>document.querySelector("#count")?.textContent==="1");
  assert.equal(await page.locator("#plan-reviewer").inputValue(),"Test operator");
  assert.equal(await page.locator("#plan-fee").inputValue(),"12000");
  assert.match(await page.locator("#audit-records").innerText(),/PLAN REVIEWED/);
  assert.equal(await page.locator("#plan-record").isEnabled(),true,"A new changed plan could be separately reviewed but duplicates are rejected on click");
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3),false,"Mobile viewport should not overflow");
  assert.deepEqual(errors,[],"No browser script errors");
  assert.deepEqual(external,[],"No Google data calls without user consent");
  await context.close();
 }
 console.log("PASS: Commercial 4D private planning studio browser E2E (mobile & desktop, 10 studies, financial cases, audit, encrypted restore, no Google calls)");
}finally{
 if(browser)await browser.close();
 server.kill();
}

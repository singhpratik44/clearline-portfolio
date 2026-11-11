import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const PORT=8789, BASE="http://127.0.0.1:"+PORT;
const KEY="aqj-local-encrypted-vault-v1";
const PASS="synthetic-journey-qa-passphrase-2026!";
const NOTE="SYNTHETIC_TEST_REFLECTION__DELETE_AFTER";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const server=spawn("python3",["-m","http.server",String(PORT),"--bind","127.0.0.1"],{stdio:"ignore"});
let browser;
async function load(page){
  const errors=[],consoleErrors=[],resourceFailures=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("console",m=>{if(m.type()==="error")consoleErrors.push(m.text());});
  page.on("requestfailed",req=>resourceFailures.push(req.url()+": "+(req.failure()?.errorText||"failed")));
  page.on("response",res=>{if(res.status()>=400)resourceFailures.push(res.status()+" "+res.url());});
  const res=await page.goto(BASE+"/prayer/three-year/",{waitUntil:"networkidle",timeout:30000});
  assert.equal(res.status(),200);
  await page.locator("#treeMode").waitFor({state:"visible"});
  const startValue=await page.locator("#startDate").inputValue();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(startValue)){
    console.log("DIAGNOSTICS: app initialization not observed",JSON.stringify({startValue,consoleErrors,resourceFailures,errors}));
  }
  assert.match(startValue,/^\d{4}-\d{2}-\d{2}$/,"App module must initialize form and register event handlers");
  assert.deepEqual(errors,[],"No browser JavaScript exceptions on load");
  return errors;
}
async function erase(page){
  await page.locator("#eraseVault").click();
  await page.locator("#eraseConfirm").waitFor({state:"visible"});
  assert.equal(await page.locator("#eraseApprove").isDisabled(),true);
  await page.locator("#eraseAcknowledge").check();
  await page.locator("#eraseApprove").click();
  await page.locator("#eraseConfirm").waitFor({state:"hidden"});
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),KEY),null);
  assert.match(await page.locator("#vaultState").innerText(),/erased/i);
  assert.equal(await page.locator("#journalText").isDisabled(),true);
}
try{
  await sleep(1100);
  browser=await chromium.launch({headless:true});
  for(const viewport of [{width:1365,height:768},{width:390,height:844},{width:320,height:640}]){
    const page=await browser.newPage({viewport,acceptDownloads:true});
    const errors=await load(page);
    const overflowStart=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    assert.ok(overflowStart<=1,"Initial horizontal overflow at "+viewport.width+": "+overflowStart);
    await page.locator("#treeMode").click();
    assert.equal(await page.locator("#treeMode").getAttribute("aria-pressed"),"true");
    assert.equal(await page.locator("#visual").evaluate(el=>el.classList.contains("tree-view")),true);
    await page.locator("#monthSlider").evaluate(el=>{el.value="14";el.dispatchEvent(new Event("input",{bubbles:true}));});
    assert.match(await page.locator("#visualMonth").innerText(),/MONTH 14/);
    assert.match(await page.locator("#visualYear").innerText(),/YEAR 2/);
    assert.match(await page.locator("#livingTree").getAttribute("aria-label"),/month 14/i);
    await page.locator("#duration").selectOption("120");
    await page.locator("#apply").click();
    assert.equal(await page.locator("#monthSlider").getAttribute("max"),"120");
    await page.locator("#monthSlider").evaluate(el=>{el.value="119";el.dispatchEvent(new Event("input",{bubbles:true}));});
    assert.match(await page.locator("#monthIndex").innerText(),/119 \/ 120/);
    assert.match(await page.locator("#visualYear").innerText(),/YEAR 10/);
    // Daily experience runs entirely in the local browser without recording anything.
    assert.match(await page.locator("#dailyHeading").innerText(),/Day 1 of/);
    await page.locator('[data-daily-step="1"]').click();
    assert.equal(await page.locator("#dailySource").isVisible(),true);
    assert.match(await page.locator("#dailyStepDescription").innerText(),/Gurbani/);
    await page.locator('[data-daily-step="4"]').click();
    assert.equal(await page.locator("#dailyRecord").isVisible(),true);
    await page.locator("#dailyRecord").click();
    assert.match(await page.locator("#dailyStatus").innerText(),/unlock or create/i);
    assert.equal(await page.evaluate(key=>localStorage.getItem(key),KEY),null,"Daily preview must not persist plaintext or check-ins");
    const overflowEnd=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    assert.ok(overflowEnd<=1,"10-year horizontal overflow at "+viewport.width+": "+overflowEnd);
    if(viewport.width<700)assert.equal(await page.locator(".mobile-nav").isVisible(),true);
    assert.deepEqual(errors,[],"JavaScript exceptions at viewport "+viewport.width);
    console.log("PASS responsive",viewport.width,viewport.height,"Living Tree + Year 10");
    const shopResponse=await page.goto(BASE+"/prayer/three-year/companion/shop.html",{waitUntil:"networkidle",timeout:30000});
    assert.equal(shopResponse.status(),200);
    await page.waitForFunction(()=>document.querySelector("#checkoutStatus")?.textContent.includes("Secure card processing"));
    assert.equal(await page.locator("#buyCompanion").getAttribute("aria-disabled"),null,"Verified LIVE checkout should activate");
    assert.match(await page.locator("#buyCompanion").getAttribute("href"),/^https:\/\/buy\.stripe\.com\/[A-Za-z0-9_-]+$/);
    assert.match(await page.locator("#price").innerText(),/\$29/);
    let commerceWidth=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    assert.ok(commerceWidth<=1,"Companion shop horizontal overflow at "+viewport.width+": "+commerceWidth);
    const sampleResponse=await page.goto(BASE+"/prayer/three-year/companion/sample.html",{waitUntil:"networkidle",timeout:30000});
    assert.equal(sampleResponse.status(),200);
    assert.equal(await page.locator("#worksheet").count(),1);
    assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth))<=1,"Free sample overflow at "+viewport.width);
    const workbookResponse=await page.goto(BASE+"/prayer/three-year/companion/workbook.html",{waitUntil:"networkidle",timeout:30000});
    assert.equal(workbookResponse.status(),200);
    await page.waitForFunction(()=>document.querySelectorAll(".month-sheet").length===36 && document.querySelectorAll(".review-sheet").length===12);
    assert.equal(await page.locator(".month-sheet").count(),36);
    assert.equal(await page.locator(".review-sheet").count(),12);
    commerceWidth=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    assert.ok(commerceWidth<=1,"Companion workbook overflow at "+viewport.width+": "+commerceWidth);
    assert.deepEqual(errors,[],"No browser exceptions in companion pages at "+viewport.width);
    console.log("PASS companion shop live one-time Stripe checkout and printable 36+12 workbook",viewport.width);
    const startResponse=await page.goto(BASE+"/prayer/start/",{waitUntil:"networkidle",timeout:30000});
    assert.equal(startResponse.status(),200);
    await page.locator("#focus").selectOption("gratitude");
    await page.locator("#next").click();
    assert.match(await page.locator("#stepPrayer").innerText(),/given without entitlement/i);
    await page.locator("#next").click();
    assert.match(await page.locator("#stepPrayer").innerText(),/Thank one person/i);
    assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth))<=1,"Starter overflow at "+viewport.width);
    assert.deepEqual(errors,[],"No JavaScript exceptions on free starter");
    console.log("PASS five-minute starter practice",viewport.width);
    await page.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
  const errors=await load(page);
  await page.locator("#vaultPassword").fill(PASS);
  await page.locator("#vaultOpen").click();
  await page.waitForFunction(()=>document.querySelector("#vaultState").textContent.includes("Unlocked"));
  await page.locator('[data-daily-step="4"]').click();
  await page.locator("#dailyRecord").click();
  await page.waitForFunction(()=>document.querySelector("#dailyStatus").textContent.includes("encrypted and recorded"));
  assert.match(await page.locator("#dailyRecordedCount").innerText(),/1 day of practice recorded/);
  assert.equal(await page.locator("#practiceDone").isChecked(),true,"Completed daily practice is reflected in journal");
  await page.locator("#journalText").fill(NOTE);
  await page.locator("#practiceDone").check();
  await page.locator("#saveEntry").click();
  await page.waitForFunction(()=>document.querySelector("#journalStatus").textContent.includes("Encrypted and saved"));
  assert.match(await page.locator("#entryList").innerText(),/SYNTHETIC_TEST_REFLECTION/);
  const raw=await page.evaluate(key=>localStorage.getItem(key),KEY);
  assert.ok(raw&&!raw.includes(NOTE),"Only encrypted journal may be stored");

  const [download]=await Promise.all([page.waitForEvent("download",{timeout:15000}),page.locator("#exportVault").click()]);
  assert.match(download.suggestedFilename(),/quiet-journey-encrypted.*\.json/);
  const downloaded=await readFile(await download.path());
  const backupText=downloaded.toString("utf8");
  const backup=JSON.parse(backupText);
  assert.ok(backup.iv&&backup.salt&&backup.ciphertext);
  assert.equal(backupText.includes(NOTE),false);
  console.log("PASS real encrypted JSON download");

  await page.locator("#eraseVault").click();
  await page.locator("#eraseCancel").click();
  assert.equal(await page.evaluate(key=>localStorage.getItem(key)!==null,KEY),true);
  await erase(page);
  console.log("PASS confirmed erase and cancel protection");

  await page.locator("#vaultPassword").fill(PASS);
  await page.locator("#importVault").setInputFiles({name:"backup.json",mimeType:"application/json",buffer:downloaded});
  await page.waitForFunction(()=>document.querySelector("#vaultState").textContent.includes("restored"));
  assert.match(await page.locator("#entryList").innerText(),/SYNTHETIC_TEST_REFLECTION/);
  console.log("PASS decrypted JSON import with recovered entry");

  await page.locator("#vaultLock").click();
  const intact=await page.evaluate(key=>localStorage.getItem(key),KEY);
  await page.locator("#vaultPassword").fill("incorrect-test-passphrase-999!");
  await page.locator("#replaceVault").check();
  await page.locator("#importVault").setInputFiles({name:"backup.json",mimeType:"application/json",buffer:downloaded});
  await page.waitForFunction(()=>document.querySelector("#vaultState").textContent.includes("Restore failed"));
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),KEY),intact);

  await page.locator("#replaceVault").uncheck();
  await page.locator("#vaultPassword").fill(PASS);
  await page.locator("#importVault").setInputFiles({name:"backup.json",mimeType:"application/json",buffer:downloaded});
  await page.waitForFunction(()=>document.querySelector("#vaultState").textContent.includes("Existing vault preserved"));
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),KEY),intact);

  await page.locator("#replaceVault").check();
  await page.locator("#importVault").setInputFiles({name:"backup.json",mimeType:"application/json",buffer:downloaded});
  await page.waitForFunction(()=>document.querySelector("#vaultState").textContent.includes("restored"));
  await erase(page);
  assert.deepEqual(errors,[],"No browser exceptions during encryption/backup/erase");
  console.log("PASS invalid passphrase, overwrite consent and cleanup");
  await page.close();
}finally{
  if(browser)await browser.close();
  server.kill();
}

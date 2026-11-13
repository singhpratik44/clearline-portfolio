import test from "node:test";
import assert from "node:assert/strict";
import {readFile, stat} from "node:fs/promises";
import {existsSync} from "node:fs";
import {createServer} from "node:http";
import {join} from "node:path";
import vm from "node:vm";
import {chromium} from "playwright-core";

const root=process.cwd();
const dir=join(root,"gifts","faith");

test("Faith Gift has exactly 100 original, complete, unique experiences",async()=>{
  const catalogSrc=await readFile(join(dir,"experiences.js"),"utf8");
  const appSrc=await readFile(join(dir,"experience-app.js"),"utf8");
  const page=await readFile(join(dir,"experience.html"),"utf8");
  const scope={window:{}};
  vm.runInNewContext(catalogSrc,scope,{filename:"experiences.js"});
  new vm.Script(appSrc,{filename:"experience-app.js"});
  const catalog=scope.window.APERTURE_GIFT_ACTIONS;
  assert.equal(catalog.length,100);
  assert.deepEqual(Array.from(catalog,x=>x.id),Array.from({length:100},(_,i)=>String(i+1).padStart(3,"0")));
  assert.equal(new Set(Array.from(catalog,x=>x.title)).size,100,"Each gift has its own title");
  assert.equal(new Set(Array.from(catalog,x=>x.category)).size,10);
  for(const item of catalog){
    assert.ok(item.action.length>40,"Real-world action for "+item.id);
    assert.ok(item.reflect.length>15,"A follow-up prompt for "+item.id);
    assert.ok(item.title.length>7);
  }
  assert.match(page,/src="\.\/experiences\.js"/);
  assert.match(page,/src="\.\/experience-app\.js"/);
  assert.ok(page.indexOf('src="./experiences.js"')<page.indexOf('src="./experience-app.js"'));
  assert.match(page,/100 real actions/);
  assert.match(await readFile(join(dir,"index.html"),"utf8"),/href="experience\.html/);
  assert.match(await readFile(join(root,"gifts","print.html"),"utf8"),/href="faith\/experience\.html"/);
  assert.match(await readFile(join(root,"gifts","index.html"),"utf8"),/href="faith\/experience\.html"/);
});

test("100 gift modes work in an actual mobile browser, with private sharing and keepsake",{timeout:90000},async()=>{
  const chrome=["/usr/bin/google-chrome","/usr/bin/google-chrome-stable","/usr/bin/chromium","/usr/bin/chromium-browser"].find(existsSync);
  assert.ok(chrome,"Chromium required for interactive acceptance test");
  const allowed=new Map([
    ["/gifts/faith/experience.html","experience.html"],
    ["/gifts/faith/experiences.js","experiences.js"],
    ["/gifts/faith/experience-app.js","experience-app.js"],
  ]);
  const requested=[];
  const server=createServer(async(req,res)=>{
    const path=new URL(req.url,"http://localhost").pathname;
    requested.push(req.url);
    const name=allowed.get(path);
    if(!name){res.writeHead(404);res.end();return;}
    try{
      const body=await readFile(join(dir,name));
      res.writeHead(200,{"Content-Type":name.endsWith(".js")?"text/javascript; charset=utf-8":"text/html; charset=utf-8"});
      res.end(body);
    }catch(err){res.writeHead(500);res.end(String(err));}
  });
  await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
  const origin="http://127.0.0.1:"+server.address().port;
  const browser=await chromium.launch({headless:true,executablePath:chrome,args:["--no-sandbox","--disable-dev-shm-usage"]});
  try{
    const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true});
    const errors=[];page.on("pageerror",e=>errors.push(e.message));
    await page.addInitScript(()=>{
      Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async value=>{window.__lastCopy=value;}}});
    });
    const url=origin+"/gifts/faith/experience.html";
    const response=await page.goto(url,{waitUntil:"networkidle"});
    assert.equal(response.status(),200);
    assert.equal(await page.locator("#allGifts button").count(),100);
    assert.equal(await page.locator("#category option").count(),11);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2);
    assert.equal(overflow,false,"Mobile horizontal overflow");
    await page.locator("#search").fill("service");
    assert.ok((await page.locator("#allGifts button").count())<100);
    await page.locator("#search").fill("");
    assert.equal(await page.locator("#allGifts button").count(),100);
    await page.selectOption("#category","Courage");
    assert.equal(await page.locator("#allGifts button").count(),10);
    await page.selectOption("#category","all");

    await page.locator("#recipient").fill("Nia");
    await page.locator("#sender").fill("Kai");
    await page.locator("#guided").click();
    assert.equal(await page.locator("#giftStep").textContent(),"Step 1 of 3");
    assert.equal(await page.locator("#dedication").textContent(),"For Nia · From Kai");
    await page.locator("#startTimer").click();
    assert.equal(await page.locator("#pauseTimer").isEnabled(),true);
    await page.locator("#pauseTimer").click();
    assert.equal(await page.locator("#pauseTimer").textContent(),"Resume");
    await page.locator("#markDone").click();
    assert.equal(await page.locator("#nextStep").isVisible(),true);
    await page.locator("#nextStep").click();
    assert.equal(await page.locator("#pauseTimer").textContent(),"Pause","Changing gifts resets timer");
    assert.equal(await page.locator("#giftStep").textContent(),"Step 2 of 3");
    await page.locator("#copyGift").click();
    const shared=await page.evaluate(()=>window.__lastCopy);
    assert.match(shared,/#seq=001%2C041%2C021/);
    assert.match(shared,/to=Nia/);assert.match(shared,/from=Kai/);
    const recipient=await browser.newPage();
    const recipientResponse=await recipient.goto(shared,{waitUntil:"networkidle"});
    assert.equal(recipientResponse.status(),200);
    assert.equal(await recipient.locator("#dedication").textContent(),"For Nia · From Kai");
    assert.equal(await recipient.locator("#giftStep").textContent(),"Step 1 of 3");
    await recipient.close();
    assert.equal(requested.some(r=>r.includes("Nia")||r.includes("Kai")),false,"No names transmitted to the origin");

    await page.locator("#markDone").click();
    await page.locator("#nextStep").click();
    assert.equal(await page.locator("#giftStep").textContent(),"Step 3 of 3");
    await page.locator("#markDone").click();
    assert.match(await page.locator("#giftStatus").textContent(),/Experience complete/);
    assert.match(await page.locator("#progress").textContent(),/3 of 100/);
    await page.locator("#today").click();
    const daily=await page.locator("#giftTitle").textContent();
    await page.locator("#surprise").click();
    await page.locator("#today").click();
    assert.equal(await page.locator("#giftTitle").textContent(),daily,"Daily selection is deterministic on a given date");
    await page.locator("#randomThree").click();
    assert.equal(await page.locator("#giftStep").textContent(),"Step 1 of 3");
    await page.locator("#copyGift").click();
    const triple=new URLSearchParams(new URL(await page.evaluate(()=>window.__lastCopy)).hash.slice(1)).get("seq").split(",");
    assert.equal(triple.length,3);
    assert.equal(new Set(triple).size,3,"Three random gifts must be distinct");
    await page.locator('[data-gift-id="078"]').click();
    assert.match(await page.locator("#giftKind").textContent(),/078/);
    const downloadPromise=page.waitForEvent("download");
    await page.locator("#saveCard").click();
    const download=await downloadPromise;
    assert.equal(download.suggestedFilename(),"aperture-gift-078.png");
    assert.deepEqual(errors,[],"No JavaScript runtime errors");
    await page.close();
  }finally{
    await browser.close();
    await new Promise(ok=>server.close(ok));
  }
});
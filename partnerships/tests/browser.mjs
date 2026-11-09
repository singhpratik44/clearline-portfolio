import {chromium} from "playwright";
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const files={"/partnerships/":"index.html","/partnerships/os.css":"os.css","/partnerships/os.js":"os.js","/partnerships/catalog.js":"catalog.js"};
const server=createServer(async(req,res)=>{
  const route=new URL(req.url,"http://localhost").pathname,name=files[route];
  if(!name){res.writeHead(404);res.end("Not found");return;}
  try {const data=await readFile(path.join(dir,name));res.writeHead(200,{"content-type":name.endsWith(".js")?"text/javascript":name.endsWith(".css")?"text/css":"text/html"});res.end(data);}
  catch(_){res.writeHead(500);res.end("Internal error");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
let browser;
try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const context=await browser.newContext({viewport:{width:1280,height:920},acceptDownloads:true});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const url="http://127.0.0.1:"+server.address().port+"/partnerships/";
  await page.goto(url,{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:/DON'T SELL/}).waitFor();
  assert.equal(await page.locator("#opportunity-cards .opportunity").count(),10);
  assert.equal(await page.locator("#metric-sourced").textContent(),"10");
  assert.equal(await page.locator("#metric-money").textContent(),"4");
  console.log("PASS market loads ten primary-source opportunities and verified compensation flags");

  await page.locator("#search").fill("Anova");
  assert.equal(await page.locator("#opportunity-cards .opportunity").count(),1);
  await page.locator("#search").fill("");
  await page.getByRole("button",{name:"Sports technology"}).click();
  assert.equal(await page.locator("#opportunity-cards .opportunity").count(),3);
  await page.getByRole("button",{name:"All opportunities"}).click();
  console.log("PASS search and lane filters");

  await page.getByRole("button",{name:"Inspect Laurel Springs School"}).click();
  assert.match(await page.locator("#detail-name").textContent(),/Laurel Springs/);
  assert.match(await page.locator("#detail-source").getAttribute("href"),/laurelsprings.com/);
  await page.locator("#detail-save").click();
  assert.equal(await page.locator("#metric-active").textContent(),"1");
  assert.match(await page.locator("#pipeline-list").textContent(),/Laurel Springs/);
  console.log("PASS source-bound detail and pipeline add");

  await page.locator("#record-stage").selectOption("replied");
  await page.locator("#record-evidence").fill("");
  await page.locator("#record-notes").fill("");
  await page.locator("#pipeline-form button[type=submit]").click();
  assert.match(await page.locator("#form-warning").textContent(),/evidence reference/i);
  assert.equal(await page.locator("#metric-sent").textContent(),"0");
  await page.locator("#record-evidence").fill("https://example.com/my-evidence");
  await page.locator("#record-notes").fill("Actual exploratory outreach needs to be documented with a verified note.");
  await page.locator("#pipeline-form button[type=submit]").click();
  assert.match(await page.locator("#form-warning").textContent(),/Authorization confirmation/i);
  await page.locator("#record-authorized").check();
  await page.locator("#pipeline-form button[type=submit]").click();
  assert.equal(await page.locator("#metric-sent").textContent(),"1");
  await page.locator("#record-stage").selectOption("signed");
  await page.locator("#pipeline-form button[type=submit]").click();
  assert.match(await page.locator("#form-warning").textContent(),/signed agreement/i);
  console.log("PASS evidence and authorization gates, self-reported stage counts");

  await page.locator("#rate").fill("150");
  await page.locator("#pilot-hours").fill("60");
  assert.equal(await page.locator("#pilot-price").textContent(),"$9,000");
  await page.locator("#proposal-partner").selectOption("rizzler");
  await page.locator("#proposal-kind").selectOption("pilot");
  assert.match(await page.locator("#proposal-text").inputValue(),/Rizzler Sports/);
  assert.match(await page.locator("#proposal-text").inputValue(),/9,000/);
  assert.match(await page.locator("#proposal-text").inputValue(),/No promise of admissions/);
  console.log("PASS dynamic pricing and tailored evidence-bound proposals");

  await page.reload({waitUntil:"domcontentloaded"});
  assert.equal(await page.locator("#metric-active").textContent(),"1");
  assert.equal(await page.locator("#metric-sent").textContent(),"1");
  assert.equal(await page.locator("#rate").inputValue(),"150");
  const downloadPromise=page.waitForEvent("download");await page.locator("#export").click();const dl=await downloadPromise;
  assert.match(dl.suggestedFilename(),/partnership-workspace\.json/);
  console.log("PASS local persistence and JSON export");

  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator(".hero").isVisible(),true);
  assert.equal(await page.locator("#detail").isVisible(),true);
  const w=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert(w.scroll<=w.client+4,"Unexpected horizontal overflow on mobile: "+JSON.stringify(w));
  console.log("PASS responsive mobile layout and no horizontal overflow");
  assert.deepEqual(errors,[],"No runtime page errors");
  console.log("PASS no uncaught runtime errors");
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}

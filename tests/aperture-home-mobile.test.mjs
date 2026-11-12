import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,stat} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,join,extname} from 'node:path';
import {chromium} from 'playwright-core';
const root=process.cwd();
const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(existsSync);
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
async function serve(req,res){try{const url=new URL(req.url,'http://localhost');let path=resolve(root,'.'+decodeURIComponent(url.pathname));if(path!==root&&!path.startsWith(root+'/')){res.writeHead(403);res.end();return}if((await stat(path)).isDirectory())path=join(path,'index.html');const bytes=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});res.end(bytes)}catch{res.writeHead(404);res.end('Not found')}}
test('APERTURE v5 mobile layout and local decision controls',{timeout:120000},async t=>{
 assert.ok(chrome,'Google Chrome is required for real browser testing');
 const server=createServer((req,res)=>{void serve(req,res)});await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{await mkdir('_artifacts',{recursive:true});const base='http://127.0.0.1:'+server.address().port+'/';
 for(const [width,height] of [[375,812],[390,844],[768,1024],[1280,900]]){await t.test('layout '+width+'px',async()=>{
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:width<500,hasTouch:width<500});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(base,{waitUntil:'networkidle',timeout:30000});
  assert.equal(response.status(),200);assert.equal(await page.locator('#missionTitle').count(),1);
  assert.equal(await page.locator('.project').count(),23);assert.equal(await page.locator('.gate').count(),4);
  const sizes=await page.evaluate(()=>({root:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  assert.ok(sizes.scroll<=sizes.root+2,'Root horizontal overflow: '+width+' '+JSON.stringify(sizes));assert.ok(sizes.body<=sizes.root+2,'Body horizontal overflow: '+width+' '+JSON.stringify(sizes));
  assert.ok(await page.locator('#workbench').isVisible());
  if(width===375||width===1280)await page.screenshot({path:'_artifacts/aperture-v5-'+width+'.png',fullPage:true});
  assert.deepEqual(errors,[],'Unexpected browser errors');await page.close();
 })}
 await t.test('focus selection, review gates and project search',async()=>{
  const page=await browser.newPage({viewport:{width:390,height:844}});await page.goto(base,{waitUntil:'networkidle'});
  await page.locator('[data-focus="sports"]').click();assert.equal(await page.locator('#focusTitle').textContent(),'Sports and athlete development');
  assert.ok(await page.locator('#recordDecision').isDisabled());
  for(let i=0;i<4;i++)await page.locator('.gate').nth(i).check();
  assert.ok(await page.locator('#recordDecision').isEnabled());await page.locator('#recordDecision').click();
  assert.match(await page.locator('#decisionLedger').textContent(),/Sports and athlete development/);
  await page.locator('#undoDecision').click();assert.match(await page.locator('#decisionLedger').textContent(),/No decisions recorded yet/);
  await page.locator('#project-search').fill('basketball');const n=await page.locator('.project:visible').count();assert.ok(n>0&&n<23);
  await page.locator('#project-search').fill('');await page.locator('[data-filter="Reflection"]').click();assert.ok(await page.locator('.project:visible').count()>0);
  assert.equal(await page.locator('#projectTotal').textContent(),'23');await page.close();
 });
 }finally{await browser.close();await new Promise(ok=>server.close(ok))}
});

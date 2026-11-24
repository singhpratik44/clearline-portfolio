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
test('APERTURE current homepage responsive catalog and interactions',{timeout:120000},async t=>{
 assert.ok(chrome,'Google Chrome is required for real browser testing');
 const server=createServer((req,res)=>{void serve(req,res)});
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
 try {
  const base='http://127.0.0.1:'+server.address().port+'/';
  for(const width of [375,390,768,1280]) await t.test('catalog at '+width+'px',async()=>{
   const page=await browser.newPage({viewport:{width,height:900},hasTouch:width<500,isMobile:width<500});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(base,{waitUntil:'networkidle',timeout:30000});
   assert.equal(response.status(),200);
   assert.ok(await page.locator('article.product').count()>=10,'Catalog must contain real offerings');
   assert.ok(await page.locator('#project-search').isVisible(),'Search must be accessible');
   const sizes=await page.evaluate(()=>({root:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
   assert.ok(sizes.scroll<=sizes.root+2,'Horizontal overflow: '+JSON.stringify(sizes));
   await page.locator('#project-search').fill('coding');
   assert.ok(await page.locator('article.product:visible').count()>0,'Search must find coding offerings');
   await page.locator('#project-search').fill('no-such-product-123456');
   assert.equal(await page.locator('article.product:visible').count(),0,'Search must hide nonmatches');
   assert.ok((await page.locator('#result-count').textContent()).includes('0 ways'));
   await page.locator('#project-search').fill('');
   await page.locator('[data-filter="learning"]').click();
   assert.equal(await page.locator('[data-filter="learning"]').getAttribute('aria-pressed'),'true');
   assert.ok(await page.locator('article.product:visible').count()>0);
   assert.deepEqual(errors,[],'Unexpected browser errors');
   await page.close();
  });
 } finally {await browser.close();await new Promise(ok=>server.close(ok))}
});

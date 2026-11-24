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
test('Current APERTURE homepage mobile and desktop navigation', {timeout:120000}, async t=>{
 assert.ok(chrome,'Chrome required');
 const server=createServer((req,res)=>{void serve(req,res)});await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{const base='http://127.0.0.1:'+server.address().port+'/';
 for(const width of [375,390,768,1280])await t.test('homepage '+width+'px',async()=>{
 const page=await browser.newPage({viewport:{width,height:width<500?844:900},isMobile:width<500,hasTouch:width<500});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(base,{waitUntil:'networkidle',timeout:30000});assert.equal(response.status(),200);
 assert.equal(await page.locator('h1').count(),1);assert.ok(await page.locator('#project-search').count());
 const sizes=await page.evaluate(()=>({root:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
 assert.ok(sizes.scroll<=sizes.root+2,'Horizontal overflow '+width+': '+JSON.stringify(sizes));
 assert.ok(await page.locator('a[href]').count()>15);
 await page.locator('#project-search').fill('basketball');assert.ok(await page.locator('#catalog').count());
 await page.locator('#project-search').fill('');
 assert.deepEqual(errors,[]);await page.close();
 });
 }finally{await browser.close();await new Promise(ok=>server.close(ok))}
});

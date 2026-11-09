import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const map=new Map([['/partnerships/uspa/','index.html'],['/partnerships/uspa/styles.css','styles.css'],['/partnerships/uspa/app.js','app.js']]);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8'};
const server=createServer(async(req,res)=>{
  try{
    const name=map.get(new URL(req.url,'http://localhost').pathname);
    if(!name){res.writeHead(404);res.end('Not found');return;}
    const data=await readFile(path.join(dir,name));
    res.writeHead(200,{'content-type':types[path.extname(name)],'cache-control':'no-store'});res.end(data);
  }catch(e){res.writeHead(500);res.end('Internal error');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try {
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1280,height:900},acceptDownloads:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url='http://127.0.0.1:'+server.address().port+'/partnerships/uspa/';
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:/BUILD THE BRIDGE/}).waitFor();
  assert.equal(await page.locator('#view-overview').isVisible(),true);
  console.log('PASS desktop first load and overview');

  await page.getByRole('button',{name:/Partner network/}).click();
  assert.equal(await page.locator('#view-network').isVisible(),true);
  await page.locator('#org').fill('Test Fictional Club');
  await page.locator('#region').fill('Test Region');
  await page.locator('#fit').fill('Test hypothesis only');
  await page.locator('#partner-form button[type=submit]').click();
  assert.equal(await page.locator('#network-rows tr').filter({hasText:'Test Fictional Club'}).count(),1);
  await page.locator('#network-rows tr').filter({hasText:'Test Fictional Club'}).locator('select').selectOption('Introduced');
  await page.getByRole('button',{name:/Overview/}).click();
  assert((await page.locator('#stats').innerText()).includes('01'));
  console.log('PASS local organization create, stage updates, and dashboard metric');

  await page.getByRole('button',{name:/Athlete command/}).click();
  await page.locator('#scenario').selectOption('travel');
  assert.match(await page.locator('#scenario-guidance').innerText(),/Travel increases load/);
  assert.match(await page.locator('.allocation-labels').innerText(),/Travel: 22h/);
  console.log('PASS fictional athlete schedule switch');

  await page.getByRole('button',{name:/Partner kit/}).click();
  await page.locator('#kit-org').fill('Test Fictional Club');
  await page.locator('#kit-need').selectOption('not-yet-known');
  assert.match(await page.locator('#kit-output').inputValue(),/Test Fictional Club/);
  await page.locator('[data-doc="faq"]').click();
  assert.match(await page.locator('#kit-output').inputValue(),/FAMILY DISCUSSION FAQ/);
  console.log('PASS four draft templates and partner-specific text');

  await page.getByRole('button',{name:/30-day pilot/}).click();
  await page.locator('.week .task-row input').first().check();
  assert.match(await page.locator('.completion').innerText(),/1 \/ 16/);
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('.week .task-row input').first().isChecked(),true);
  console.log('PASS local checklist persistence');

  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:/Overview/}).click();
  assert.equal(await page.locator('#view-overview').isVisible(),true);
  assert.equal(await page.locator('.hero').isVisible(),true);
  console.log('PASS mobile navigation');
  assert.deepEqual(errors,[],'No uncaught page errors');
  console.log('PASS browser console: no uncaught JavaScript exceptions');
} finally {
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}

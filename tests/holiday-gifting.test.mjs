import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {chromium} from 'playwright-core';

test('Holiday gift link personalizes and shares safely on mobile',{timeout:90000},async()=>{
  const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(existsSync);
  assert.ok(chrome,'Chrome browser missing');
  const server=createServer(async(req,res)=>{
    try{
      const path=new URL(req.url,'http://localhost').pathname;
      if(path!=='/holiday/'&&path!=='/holiday/index.html'){res.writeHead(404);res.end();return}
      const body=await readFile(join(process.cwd(),'holiday/index.html'));
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(body);
    }catch(e){res.writeHead(500);res.end(String(e))}
  });
  await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  const base='http://127.0.0.1:'+server.address().port+'/holiday/';
  const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{
    const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copied=text}}});
    });
    const response=await page.goto(base+'?theme=love&to=Alex&from=Sam',{waitUntil:'networkidle'});
    assert.equal(response.status(),200);
    assert.equal(await page.locator('#dear').textContent(),'For Alex');
    assert.equal(await page.locator('#signature').textContent(),'With love, Sam');
    assert.match(await page.locator('#message').textContent(),/You matter/);
    assert.equal(await page.locator('#sms').count(),1);
    assert.equal(await page.locator('#email').count(),1);
    assert.equal(await page.locator('#share').count(),1);
    await page.selectOption('#theme','peace');
    assert.match(await page.locator('#message').textContent(),/quiet place/);
    await page.locator('#copy').click();
    assert.equal(await page.locator('#status').textContent(),'Message copied.');
    const copied=await page.evaluate(()=>window.__copied);
    assert.ok(copied.includes('theme=peace&to=Alex&from=Sam'),copied);
    assert.match(copied,/May you find a quiet place/);
    const url=copied.slice(copied.lastIndexOf('http'));
    const second=await browser.newPage();
    await second.goto(url,{waitUntil:'networkidle'});
    assert.equal(await second.locator('#dear').textContent(),'For Alex');
    assert.match(await second.locator('#message').textContent(),/quiet place/);
    assert.equal(await second.locator('#signature').textContent(),'With love, Sam');
    await second.close();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2);
    assert.equal(overflow,false,'Mobile horizontal overflow');
    assert.deepEqual(errors,[],'JavaScript runtime errors');
    await page.close();
  }finally{await browser.close();await new Promise(ok=>server.close(ok))}
});

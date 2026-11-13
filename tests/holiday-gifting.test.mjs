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
      if(!['/holiday/','/holiday/index.html','/holiday/privacy.html','/holiday/sms-terms.html','/holiday/partners/','/holiday/analytics-config.js','/holiday/analytics.js'].includes(path)){res.writeHead(404);res.end();return}
      const target=path.endsWith('/analytics-config.js')?'analytics-config.js':path.endsWith('/analytics.js')?'analytics.js':path.endsWith('privacy.html')?'privacy.html':path.endsWith('sms-terms.html')?'sms-terms.html':path.endsWith('/partners/')?'partners/index.html':'index.html';
      const body=await readFile(join(process.cwd(),'holiday',target));
      res.writeHead(200,{'Content-Type':target.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8'});res.end(body);
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
    const response=await page.goto(base+'?theme=love&to=Alex&from=Sam&utm_source=unity&utm_medium=partner&utm_campaign=holiday2026',{waitUntil:'networkidle'});
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
    assert.ok(copied.includes('utm_source=unity'),copied);
    assert.ok(copied.includes('utm_medium=partner'),copied);
    assert.ok(copied.includes('utm_campaign=holiday2026'),copied);
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
    assert.equal(await page.locator('#sms-interest').count(),1);
    assert.equal(await page.locator('#analytics-choices').isVisible(),false);
    assert.match(await page.locator('#analytics-status').textContent(),/not connected/i);
    assert.ok((await page.evaluate(()=>window.APERTURE_HOLIDAY_EVENTS)).some(x=>x.name==='gift_copy_success'));
    assert.equal(await page.locator('#sms-interest #sms-consent').count(),1);
    assert.equal(await page.locator('#sms-consent').isChecked(),false);
    assert.equal(await page.locator('#sms-terms').isChecked(),false);
    assert.match(await page.locator('#sms-result').textContent(),/must send/i);
    for(const p of ['privacy.html','sms-terms.html']){
      const policy=await browser.newPage();const res=await policy.goto(base+p);assert.equal(res.status(),200);assert.ok((await policy.locator('main').textContent()).length>300);await policy.close();
    }
    const partner=await browser.newPage();
    const partnerRes=await partner.goto(base+'partners/');assert.equal(partnerRes.status(),200);
    await partner.locator('#code').fill('testpartner');
    assert.match(await partner.locator('#generated').textContent(),/ref=testpartner/);
    assert.match(await partner.locator('#generated').textContent(),/utm_campaign=holiday2026/);
    await partner.close();
    // A separately provisioned mock project demonstrates true consent gating without live network calls.
    const measured=await browser.newPage({viewport:{width:390,height:844}});
    await measured.route('**/holiday/analytics-config.js',route=>route.fulfill({
      status:200,contentType:'text/javascript',body:'window.APERTURE_ANALYTICS_CONFIG={provider:"posthog",projectToken:"phc_TestToken1234567",apiHost:"https://us.i.posthog.com"};'
    }));
    await measured.addInitScript(()=>{
      window.__sentEvents=[];
      window.posthog={
        __SV:1, consent:false,
        init(token,options){this.options=options;options.loaded(this)},
        opt_in_capturing(){this.consent=true},
        opt_out_capturing(){this.consent=false},
        capture(name,properties){
          if(!this.consent)return;
          const event=this.options.before_send({event:name,properties:{...properties,$referrer:'https://example.com/?name=PRIVATE'}});
          if(event)window.__sentEvents.push(event);
        }
      };
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{}}});
    });
    await measured.goto(base+'?theme=love&to=SECRETNAME&from=HIDDEN&utm_source=partner&utm_campaign=holiday2026',{waitUntil:'networkidle'});
    assert.equal(await measured.locator('#analytics-choices').isVisible(),true);
    assert.equal((await measured.evaluate(()=>window.__sentEvents)).length,0,'No data before consent');
    await measured.locator('#analytics-accept').click();
    const allowed=await measured.evaluate(()=>window.__sentEvents);
    assert.equal(allowed.length,1,'One view after consent');
    assert.equal(allowed[0].event,'gift_view');
    assert.equal(allowed[0].properties.utm_source,'partner');
    assert.ok(!JSON.stringify(allowed).includes('SECRETNAME'),'Gift name was leaked');
    assert.ok(!JSON.stringify(allowed).includes('HIDDEN'),'Sender name was leaked');
    assert.ok(!JSON.stringify(allowed).includes('PRIVATE'),'Referrer was leaked');
    await measured.locator('#copy').click();
    assert.ok((await measured.evaluate(()=>window.__sentEvents)).some(e=>e.event==='gift_copy_success'));
    await measured.locator('#analytics-decline').click();
    const before=await measured.evaluate(()=>window.__sentEvents.length);
    await measured.locator('#copy').click();
    assert.equal(await measured.evaluate(()=>window.__sentEvents.length),before,'Tracking continued after withdrawal');
    await measured.close();
    assert.deepEqual(errors,[],'JavaScript runtime errors');
    await page.close();
  }finally{await browser.close();await new Promise(ok=>server.close(ok))}
});

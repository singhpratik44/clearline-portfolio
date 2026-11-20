import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const html=await readFile('learning-lab.html');
test('all 12 learning pathways work in a real browser', {timeout:120000}, async()=>{
 const server=createServer((req,res)=>{res.writeHead(200,{'content-type':'text/html'});res.end(html)});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  assert.equal(await page.locator('#course option').count(),12);
  const values=await page.locator('#course option').evaluateAll(nodes=>nodes.map(n=>n.value));
  for(const value of values){
   await page.selectOption('#course',value);
   assert.equal(await page.locator('#lessons button').count(),3,value);
   for(let lesson=0;lesson<3;lesson++){
    await page.locator('#lessons button').nth(lesson).click();
    assert.ok((await page.locator('#heading').textContent()).trim(),value+' lesson '+lesson);
    await page.locator('#answer').fill('I tested this project and explained the key concept using a practical example.');
    await page.locator('#complete').click();
    assert.match(await page.locator('#feedback').textContent(),/complete/i);
   }
   assert.match(await page.locator('#progress').textContent(),/3\/3/);
  }
  await page.reload();
  await page.selectOption('#course','scratch');
  assert.match(await page.locator('#progress').textContent(),/3\/3/);
  const dimensions=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(dimensions.scroll<=dimensions.viewport+2,'Mobile horizontal overflow');
  assert.deepEqual(errors,[]);
  await page.close();
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
});

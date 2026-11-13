import { createServer } from "node:http";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const mockPort=18253, appPort=18254, price="price_test_gift_story_799";
const mock=createServer(async(req,res)=>{
 const url=new URL(req.url,"http://127.0.0.1");
 let data={},status=200;
 if(url.pathname==="/v1/prices/"+price) data={id:price,livemode:false,active:true,currency:"usd",unit_amount:799,type:"one_time"};
 else if(url.pathname==="/v1/checkout/sessions"&&req.method==="POST"){
  let body="";for await(const c of req)body+=c;
  const p=new URLSearchParams(body);
  assert.equal(p.get("line_items[0][price]"),price);
  assert.equal(p.get("metadata[product]"),"gift-story-v1");
  assert.equal(body.includes("recipient"),false,"Never send recipient data to Stripe");
  data={id:"cs_test_paid",url:"https://checkout.stripe.com/c/pay/cs_test_paid",livemode:false};
 }else if(url.pathname==="/v1/checkout/sessions/cs_test_paid") data={livemode:false,mode:"payment",payment_status:"paid",status:"complete",currency:"usd",amount_total:799,metadata:{product:"gift-story-v1"}};
 else if(url.pathname==="/v1/checkout/sessions/cs_test_unpaid") data={livemode:false,mode:"payment",payment_status:"unpaid",status:"open",currency:"usd",amount_total:799,metadata:{product:"gift-story-v1"}};
 else if(url.pathname.endsWith("/line_items")) data={data:[{price:{id:price},quantity:1}]};
 else{status=404;data={error:"not found"};}
 res.writeHead(status,{"Content-Type":"application/json"});res.end(JSON.stringify(data));
});
await new Promise(resolve=>mock.listen(mockPort,"127.0.0.1",resolve));
const app=spawn(process.execPath,["server.mjs"],{cwd:new URL(".",import.meta.url),env:{...process.env,NODE_ENV:"test",PORT:String(appPort),STRIPE_MOCK_BASE:"http://127.0.0.1:"+mockPort,STRIPE_TEST_SECRET_KEY:"sk_test_simulated_only",GIFT_STORY_TEST_PRICE_ID:price},stdio:["ignore","pipe","pipe"]});
let errors="";app.stderr.on("data",x=>errors+=x);
const base="http://127.0.0.1:"+appPort;
const post=(route,body)=>fetch(base+route,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
try{
 let ready=false;for(let i=0;i<50;i++){try{const r=await fetch(base+"/health");if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,150));}
 assert.ok(ready,"App startup failed: "+errors);
 const health=await(await fetch(base+"/health")).json();
 assert.equal(health.checkoutLive,false);
 assert.equal(health.giftStoryTestConfigured,true);
 const checkout=await post("/api/checkout/gift-story",{sku:"gift-story-v1"});
 assert.equal(checkout.status,200);
 assert.equal((await checkout.json()).testMode,true);
 const unpaid=await post("/api/checkout/download",{session_id:"cs_test_unpaid",recipient:"Mum"});
 assert.equal(unpaid.status,403,"Unpaid must never receive PDF");
 const fake=await post("/api/checkout/download",{session_id:"invalid",recipient:"Mum"});
 assert.equal(fake.status,400);
 const paid=await post("/api/checkout/download",{session_id:"cs_test_paid",recipient:"Mum",sender:"Me",message:"Thank you for everything."});
 assert.equal(paid.status,200);
 assert.match(paid.headers.get("content-type"),/application\/pdf/);
 const bytes=Buffer.from(await paid.arrayBuffer());
 assert.equal(bytes.subarray(0,8).toString(),"%PDF-1.4");
 assert.ok(bytes.length>600);
 assert.ok(bytes.includes(Buffer.from("Thank you for everything.")));
 const verify=await post("/api/checkout/verify",{session_id:"cs_test_paid"});
 assert.equal(verify.status,200);
 assert.equal((await verify.json()).entitled,true);
 console.log("PASS: mock Stripe checkout, unpaid denial, paid PDF delivery, PDF header, verified entitlement");
}finally{app.kill();await new Promise(resolve=>mock.close(resolve));}

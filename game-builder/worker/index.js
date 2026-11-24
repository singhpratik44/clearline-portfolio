// Cloudflare Worker — TEST MODE ONLY. Requires STRIPE_TEST_SECRET_KEY, STRIPE_TEST_WEBHOOK_SECRET,
// STRIPE_TEST_PRICE_ID, APP_ORIGIN, COURSE_KV binding. Never put live keys in this worker.
// KV provides eventual consistency; durable transactional storage is recommended before launch.
const json=(x,status=200)=>new Response(JSON.stringify(x),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
const hex=a=>[...new Uint8Array(a)].map(x=>x.toString(16).padStart(2,"0")).join("");
async function signatureValid(payload,header,secret){
 const parts=Object.fromEntries((header||"").split(",").map(x=>x.split("=")));
 const t=Number(parts.t); if(!t||Math.abs(Date.now()/1000-t)>300)return false;
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const actual=hex(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(t+"."+payload)));
 const expected=(header||"").split(",").filter(x=>x.startsWith("v1=")).map(x=>x.slice(3));
 return expected.some(x=>x.length===actual.length&&[...x].reduce((a,c,i)=>a|(c.charCodeAt(0)^actual.charCodeAt(i)),0)===0);
}
export default {async fetch(request,env){
 const url=new URL(request.url),origin=env.APP_ORIGIN;
 if(!origin||!env.STRIPE_TEST_SECRET_KEY?.startsWith("sk_test_")||!env.STRIPE_TEST_PRICE_ID?.startsWith("price_"))return json({error:"Test environment not configured"},503);
 if(url.pathname==="/api/checkout"&&request.method==="POST"){
  if(request.headers.get("origin")!==origin)return json({error:"Origin denied"},403);
  const user=request.headers.get("x-demo-user");
  // Replace demo header with verified server-side authentication before exposing endpoint.
  if(!user||!/^[a-zA-Z0-9_-]{8,80}$/.test(user))return json({error:"Authenticated user required"},401);
  return json({error:"Checkout disabled until real authentication and private storage are configured"},503);
 }
 if(url.pathname==="/api/webhook"&&request.method==="POST"){
  if(!env.STRIPE_TEST_WEBHOOK_SECRET)return json({error:"Webhook not configured"},503);
  const raw=await request.text();
  if(!await signatureValid(raw,request.headers.get("stripe-signature"),env.STRIPE_TEST_WEBHOOK_SECRET))return json({error:"Invalid signature"},400);
  let event;try{event=JSON.parse(raw)}catch{return json({error:"Invalid JSON"},400)}
  if(event.livemode!==false)return json({error:"Live event rejected"},400);
  if(event.type!=="checkout.session.completed")return json({ignored:true});
  const s=event.data?.object;
  if(s?.mode!=="payment"||s?.payment_status!=="paid"||s?.amount_total!==2900||s?.currency!=="usd"||s?.line_items?.data?.[0]?.price?.id!==env.STRIPE_TEST_PRICE_ID)return json({error:"Unverified purchase details"},422);
  // A Checkout Session webhook does not necessarily include expanded line_items.
  // No entitlement is granted until line items are retrieved from Stripe and validated.
  return json({error:"Fulfillment intentionally gated pending server-side Stripe line-item retrieval"},503);
 }
 if(url.pathname.startsWith("/api/course"))return json({error:"Private course access disabled until auth and entitlement verification"},403);
 return json({error:"Not found"},404);
}};
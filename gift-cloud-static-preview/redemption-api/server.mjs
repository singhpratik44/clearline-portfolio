// Gift redemption API prototype. Independent from production; do not deploy without durable storage and secrets.
// Node >=20. POST /api/claim {session_id,recipient,message} verifies Stripe Checkout Session
// and creates an opaque, single-use claim token. GET /api/redeem?token=... consumes it.
// No payment or customer PII is trusted from the browser.
import {createServer} from 'node:http';
import {randomBytes,createHash,timingSafeEqual} from 'node:crypto';
import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
const PORT=Number(process.env.PORT||8787), KEY=process.env.STRIPE_SECRET_KEY;
const DB=process.env.GIFT_REDEMPTION_DB; // must be on a persistent mounted disk
const ORIGIN=process.env.PUBLIC_ORIGIN;
if(!KEY||!DB||!ORIGIN)throw Error('STRIPE_SECRET_KEY, GIFT_REDEMPTION_DB and PUBLIC_ORIGIN required');
const allowed=new Set((process.env.ALLOWED_STRIPE_PRICE_IDS||'').split(',').filter(Boolean));
if(!allowed.size)throw Error('ALLOWED_STRIPE_PRICE_IDS required');
const sha=s=>createHash('sha256').update(s).digest('hex');
async function load(){try{return JSON.parse(await readFile(DB,'utf8'))}catch(e){if(e.code==='ENOENT')return {sessions:{},tokens:{}};throw e}}
async function save(db){await mkdir(dirname(DB),{recursive:true});const tmp=DB+'.'+process.pid+'.tmp';await writeFile(tmp,JSON.stringify(db),{mode:0o600});await rename(tmp,DB)}
let lock=Promise.resolve();
function serialized(fn){const p=lock.then(fn);lock=p.catch(()=>{});return p}
function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':ORIGIN,'Vary':'Origin'});res.end(JSON.stringify(data))}
async function stripeSession(id){if(!/^cs_(test_)?[A-Za-z0-9_]{10,}$/.test(id))throw Error('Invalid session ID');const r=await fetch('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(id)+'?expand%5B%5D=line_items',{headers:{Authorization:'Bearer '+KEY}});if(!r.ok)throw Error('Payment verification unavailable');return r.json()}
const server=createServer(async(req,res)=>{
const url=new URL(req.url,'http://localhost');if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Methods':'POST,GET,OPTIONS','Access-Control-Allow-Headers':'Content-Type'});return res.end()}
if(req.headers.origin&&req.headers.origin!==ORIGIN)return send(res,403,{error:'Origin not allowed'});
try{
if(req.method==='GET'&&url.pathname==='/health')return send(res,200,{ok:true});
if(req.method==='POST'&&url.pathname==='/api/claim'){
let raw='';for await(const c of req){raw+=c;if(raw.length>8000)return send(res,413,{error:'Request too large'})}
let body;try{body=JSON.parse(raw)}catch{return send(res,400,{error:'Invalid JSON'})}
const id=String(body.session_id||''),recipient=String(body.recipient||'').trim().slice(0,80),message=String(body.message||'').trim().slice(0,500);
if(!recipient||!message)return send(res,400,{error:'Recipient and message required'});
const session=await stripeSession(id);
if(session.payment_status!=='paid'||session.mode!=='payment'||session.livemode!==(KEY.startsWith('sk_live_')))return send(res,403,{error:'Verified payment required'});
const lineItems=session.line_items?.data||[];
if(!lineItems.length||lineItems.some(x=>!allowed.has(x.price?.id)))return send(res,403,{error:'Product not eligible'});
const token=randomBytes(32).toString('base64url'),hash=sha(token);
const outcome=await serialized(async()=>{const db=await load();if(db.sessions[id])return null;db.sessions[id]=hash;db.tokens[hash]={recipient,message,product:lineItems.map(x=>x.description).join(', '),created:Date.now(),used:false};await save(db);return token});
if(!outcome)return send(res,409,{error:'This purchase has already been claimed'});
return send(res,201,{gift_url:ORIGIN+'/redeem?token='+encodeURIComponent(outcome)});
}
if(req.method==='GET'&&url.pathname==='/api/redeem'){
const token=url.searchParams.get('token')||'';if(token.length<30||token.length>128)return send(res,400,{error:'Invalid token'});
const gift=await serialized(async()=>{const db=await load(),key=sha(token),entry=db.tokens[key];if(!entry||entry.used||Date.now()-entry.created>30*864e5)return null;entry.used=true;await save(db);return {recipient:entry.recipient,message:entry.message,product:entry.product}});
if(!gift)return send(res,410,{error:'Gift expired or already redeemed'});
return send(res,200,{gift});
}
return send(res,404,{error:'Not found'});
}catch(e){console.error('Gift API error',e.message);return send(res,503,{error:'Gift service unavailable'})}
});
server.listen(PORT,()=>console.log('Gift redemption prototype on',PORT));

/** CLASSICX paid download gateway. Only encrypted assets are in public git. */
import {createDecipheriv, createHash, createHmac, timingSafeEqual} from 'node:crypto';
import {readFile} from 'node:fs/promises';

export const CLASSICX = Object.freeze({
  'plink_1UaToIRuy3ohymOH8tg5g2io': {sku:'one',name:'One Moment',cents:500,filename:'CLASSICX-One-Moment.zip',sha256:'cad990767dc61a680925013bc9555a6481b04741927e8bdd424d2f58078bfabf'},
  'plink_1UaToKRuy3ohymOHqr0aKSpR': {sku:'six',name:'The Clutch Six',cents:1500,filename:'CLASSICX-Clutch-Six.zip',sha256:'3607f8f0521666edfa025913017222de59b47da8e09923505882f3501eb70a0f'},
  'plink_1UaToMRuy3ohymOHV9dEar4F': {sku:'creator',name:'Play Designer Edition',cents:2900,filename:'CLASSICX-Play-Designer.zip',sha256:'a7d22500780503f4c8bc166dcbfb27deaf60e4c2e25a18dcbe3f6e9639be159f'},
  'plink_1UaTvXRuy3ohymOHC2efIbZf': {sku:'arcade',name:'Arcade Moment Trilogy',cents:900,filename:'CLASSICX-Arcade-Trilogy.zip',sha256:'68959f7f2bd7e408a32bad609df276bdd8a2a3283edd9c82594d551b1e7260b4'}
});

const SESSION_PATTERN=/^cs_live_[A-Za-z0-9_]{10,256}$/;
const ACK_TYPES=new Set(['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed']);
const clean=(v)=>typeof v==='string'?v:'';

/** Uses the verified on-server Stripe secret, never a browser-provided claim. */
export async function verifyClassicxPurchase(sessionId,{secret=process.env.STRIPE_SECRET_KEY,fetchFn=globalThis.fetch}={}){
  if(!SESSION_PATTERN.test(clean(sessionId))) return {ok:false,code:'invalid_session',status:400};
  if(typeof secret!=='string'||! /^(?:sk|rk)_live_/.test(secret))return {ok:false,code:'not_configured',status:503};
  let result;
  try{
    result=await fetchFn('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(sessionId),{
      method:'GET',headers:{Authorization:'Bearer '+secret,Accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(9000)});
  }catch{return {ok:false,code:'verification_unavailable',status:503};}
  if(!result?.ok)return {ok:false,code:'session_unverified',status:result?.status===404?403:503};
  let session;try{session=await result.json();}catch{return {ok:false,code:'invalid_response',status:503};}
  const id=typeof session.payment_link==='string'?session.payment_link:session.payment_link?.id;
  const item=Object.hasOwn(CLASSICX,id)?CLASSICX[id]:null;
  if(!item||session.status!=='complete'||session.payment_status!=='paid'||session.livemode!==true||session.mode!=='payment'||session.currency!=='usd'||
      !Number.isInteger(session.amount_subtotal)||session.amount_subtotal!==item.cents||
      !Number.isInteger(session.amount_total)||session.amount_total<=0||
      (session.id&&session.id!==sessionId))return {ok:false,code:'not_authorized',status:403};
  return {ok:true,item,sku:item.sku,status:200};
}

/** AES-256-GCM authenticated decryption with per-asset associated data. */
export async function decryptClassicxZip(sku,{key=process.env.CLASSICX_VAULT_KEY,readFn=readFile}={}){
  const item=Object.values(CLASSICX).find(x=>x.sku===sku);
  if(!item)throw new Error('Unknown SKU');
  if(typeof key!=='string')throw new Error('Vault not configured');
  const rawKey=Buffer.from(key,'base64url');
  if(rawKey.length!==32)throw new Error('Invalid vault key');
  const encoded=(await readFn(new URL('./classicx-vault/'+sku+'.b64',import.meta.url),'utf8')).trim();
  const blob=Buffer.from(encoded,'base64');
  if(blob.length<29)throw new Error('Invalid vault payload');
  const decipher=createDecipheriv('aes-256-gcm',rawKey,blob.subarray(0,12));
  decipher.setAAD(Buffer.from('CLASSICX-v1:'+sku));
  decipher.setAuthTag(blob.subarray(blob.length-16));
  const zip=Buffer.concat([decipher.update(blob.subarray(12,-16)),decipher.final()]);
  if(createHash('sha256').update(zip).digest('hex')!==item.sha256||!zip.subarray(0,4).equals(Buffer.from([0x50,0x4b,0x03,0x04])))throw new Error('Vault payload integrity failure');
  return {item,zip};
}

function headers(res,mime='text/html; charset=utf-8'){
  res.setHeader('Content-Type',mime);
  res.setHeader('Cache-Control','private, no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  res.setHeader('Cross-Origin-Resource-Policy','same-origin');
  res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'");
}
function send(res,status,body,mime){res.statusCode=status;headers(res,mime);return res.end(body);}
function page(title,content){return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · CLASSICX</title><style>html{color-scheme:dark}body{background:#0b1017;color:#f2f0ec;font:16px/1.7 system-ui;min-height:80vh;display:grid;place-items:center;margin:0}.card{margin:20px;max-width:600px;padding:45px 34px;border:1px solid #46494c;background:#181b22;border-radius:10px}.brand{font-weight:900;color:#edc17a;letter-spacing:.2em}h1{font-size:clamp(30px,6vw,48px);line-height:1.1;margin:18px 0;color:#f2f0ec}p{color:#c8cbd0}.button{display:inline-block;padding:15px 24px;margin:16px 0;background:#edc17a;color:#171411;text-decoration:none;font-weight:900;border-radius:4px}.muted{color:#9fa6b0;font-size:13px}a{color:#edc17a}</style></head><body><main class="card"><div class="brand">CLASSICX / DIGITAL ACCESS</div>${content}<p class="muted">Support: <a href="mailto:kobez2417@gmail.com">kobez2417@gmail.com</a></p></main></body></html>`;}
function errorPage(res,code,status){const title=status===503?'Your download is temporarily unavailable':'We could not verify this purchase'; const description=status===503?'Please retry shortly. Your payment has not been charged again; you can also contact support with your Stripe receipt.':'Use the private link from a successfully completed CLASSICX checkout. If you paid but cannot download, contact support with your Stripe receipt.';return send(res,status,page(title,`<h1>${title}</h1><p>${description}</p><p class="muted">Reference: ${code}</p><a href="https://classicx-moments-store.onrender.com">Return to store</a>`));}
export async function handleClassicx(req,res,url){
  if(req.method!=='GET')return send(res,405,'Method not allowed','text/plain; charset=utf-8');
  const sessionId=url.searchParams.get('session_id')||'';
  const result=await verifyClassicxPurchase(sessionId);
  if(!result.ok)return errorPage(res,result.code,result.status);
  if(url.pathname==='/classicx/download'){
    let data;try{data=await decryptClassicxZip(result.sku);}catch{ return errorPage(res,'download_unavailable',503); }
    res.statusCode=200;headers(res,'application/zip');res.setHeader('Content-Disposition',`attachment; filename="${data.item.filename}"`);
    res.setHeader('Content-Length',String(data.zip.length));return res.end(data.zip);
  }
  const link='/classicx/download?session_id='+encodeURIComponent(sessionId);
  return send(res,200,page('Purchase verified',`<h1>Your moment is ready.</h1><p>Your verified purchase: <strong>${result.item.name}</strong>. Your digital collection can be downloaded instantly.</p><a class="button" href="${link}">Download ${result.item.name} (.zip) ↓</a><p class="muted">Save the ZIP to your device; it contains your original offline experience and study guide. No extra payment is required.</p><p>Lost access? Reply to your Stripe receipt or email support with the receipt so we can help.</p>`));
}

/** Signed webhook; logs redacted purchase events (does NOT email or deliver). */
export async function handleClassicxWebhook(req,res,{secret=process.env.CLASSICX_STRIPE_WEBHOOK_SECRET,now=()=>Date.now()}={}){
  if(req.method!=='POST')return send(res,405,'Method not allowed','text/plain; charset=utf-8');
  if(!secret||!/^whsec_/.test(secret))return send(res,503,'Webhook unavailable','text/plain; charset=utf-8');
  const raw=[];let length=0;
  try{for await(const part of req){length+=part.length;if(length>262144) return send(res,413,'Too large','text/plain; charset=utf-8');raw.push(Buffer.isBuffer(part)?part:Buffer.from(part));}}catch{return send(res,400,'Bad request','text/plain; charset=utf-8');}
  const body=Buffer.concat(raw);
  const signature=clean(req.headers['stripe-signature']);const t=/\bt=(\d+)\b/.exec(signature)?.[1];
  const sigs=[...signature.matchAll(/\bv1=([a-f0-9]{64})\b/g)].map(m=>m[1]);
  if(!t||Math.abs(now()-Number(t)*1000)>300000||!sigs.length)return send(res,400,'Invalid signature','text/plain; charset=utf-8');
  const expected=createHmac('sha256',secret).update(t+'.').update(body).digest();
  if(!sigs.some(s=>{const actual=Buffer.from(s,'hex');return actual.length===expected.length&&timingSafeEqual(actual,expected);}))return send(res,400,'Invalid signature','text/plain; charset=utf-8');
  let e;try{e=JSON.parse(body.toString('utf8'));}catch{return send(res,400,'Invalid JSON','text/plain; charset=utf-8');}
  if(e?.livemode!==true||!ACK_TYPES.has(e?.type))return send(res,200,'ignored','text/plain; charset=utf-8');
  const s=e?.data?.object;const link=s?.payment_link;const item=Object.hasOwn(CLASSICX,link)?CLASSICX[link]:null;
  if(item && s.mode==='payment'&&s.currency==='usd'&&s.amount_subtotal===item.cents){
    const state=s.payment_status==='paid'?'paid':s.payment_status==='unpaid'?'unpaid':'other';
    // No identifiers or personal data in logs. Stripe itself is the durable order ledger.
    process.stdout.write(`CLASSICX webhook ${e.type} sku=${item.sku} state=${state}\n`);
  }
  return send(res,200,'ok','text/plain; charset=utf-8');
}
import {createHmac, createHash, timingSafeEqual} from 'node:crypto';

export const ART_PRODUCTS = Object.freeze({
  plink_1UbOdSRuy3ohymOHdcurManK: {sku:'courtside',name:'Courtside Collection',subtotal:1900},
  plink_1UbOdURuy3ohymOHR9RXlQ1T: {sku:'beyond',name:'Beyond Collection',subtotal:1900},
  plink_1UbOdWRuy3ohymOHDkwpGqRe: {sku:'premium',name:'Premium Archive',subtotal:2900}
});
const ERROR_PAGE='Your download cannot be verified yet. Please check your payment receipt or contact Clearline support.';
const isSession=s=>typeof s==='string' && /^cs_live_[A-Za-z0-9_]{10,256}$/.test(s);
const fail=(status,code)=>({ok:false,status,code});
export async function verifyArtPurchase(sessionId,{secret=process.env.STRIPE_SECRET_KEY,fetchFn=fetch}={}){
  if(!isSession(sessionId))return fail(400,'invalid_session');
  if(!/^(sk|rk)_live_[A-Za-z0-9]+$/.test(secret||''))return fail(503,'not_configured');
  let r;
  try{
    r=await fetchFn('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(sessionId),{
      headers:{Authorization:'Bearer '+secret,Accept:'application/json'},
      cache:'no-store',signal:AbortSignal.timeout(8000)
    });
  }catch{return fail(502,'stripe_unavailable')}
  if(!r?.ok)return fail(r?.status===404?403:502,'stripe_unverified');
  let s;
  try{s=await r.json()}catch{return fail(502,'invalid_response')}
  const id=typeof s.payment_link==='string'?s.payment_link:s.payment_link?.id;
  const product=ART_PRODUCTS[id];
  if(!product)return fail(403,'unknown_product');
  if(s.id!==sessionId||s.livemode!==true||s.status!=='complete'||s.payment_status!=='paid'||s.mode!=='payment')return fail(403,'not_paid');
  if(s.currency!=='usd'||s.amount_subtotal!==product.subtotal||!Number.isInteger(s.amount_total)||s.amount_total<1)return fail(403,'wrong_amount');
  return {ok:true,product};
}

export function signArtToken(sku,{key=process.env.ART_TOKEN_KEY,now=Date.now()}={}){
  if(typeof key!=='string'||key.length<40)throw Error('ART_TOKEN_KEY missing');
  if(!['courtside','beyond','premium'].includes(sku))throw Error('unsupported sku');
  const payload=Buffer.from(JSON.stringify({v:1,sku,exp:Math.floor(now/1000)+10*60})).toString('base64url');
  return payload+'.'+createHmac('sha256',key).update(payload).digest('base64url');
}

const escapeHtml=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function artPage(name,sessionId){
  const url='/art/download?session_id='+encodeURIComponent(sessionId);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>Payment verified — CLEARLINE ART</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 75% 15%,#355b52,#090e19 60%);color:#f6f4ef;font:16px/1.55 system-ui}main{max-width:530px;border:1px solid #ffffff3c;background:#101a28;border-radius:24px;padding:clamp(26px,6vw,50px)}small{font-weight:800;color:#c5f6d9;letter-spacing:.16em}h1{font-size:clamp(36px,8vw,60px);line-height:1.06;letter-spacing:-.05em;margin:18px 0}p{color:#bac7cc}a.button{display:block;background:#c5f6d9;color:#09251b;border-radius:999px;padding:16px;text-align:center;font-weight:800;text-decoration:none;margin:30px 0 18px}a:focus-visible{outline:3px solid white}footer{font-size:12px;color:#b7bbc5}</style></head><body><main><small>CLEARLINE ORIGINAL ART / ORDER VERIFIED</small><h1>Your art is ready.</h1><p><strong>${escapeHtml(name)}</strong></p><p>Your secure payment is verified. Download your digital collection as a ZIP containing print posters, phone wallpapers and scalable source vectors.</p><a class="button" href="${url}">Download my collection ↓</a><footer>Save your ZIP somewhere safe. This is a digital download, not a physical shipment. Need help? <a style="color:#c5f6d9" href="mailto:parry.s.2324@gmail.com?subject=Art%20order%20support">Contact support</a>.</footer></main></body></html>`;
}
function artSend(res,status,body,html=false){
  res.writeHead(status,{'Content-Type':html?'text/html; charset=utf-8':'text/plain; charset=utf-8','Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex,nofollow','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"});
  return res.end(body);
}
export async function handleArt(req,res,url,{verify=verifyArtPurchase,sign=signArtToken,downloadOrigin=process.env.ART_DOWNLOAD_ORIGIN}={}){
  if(req.method!=='GET')return artSend(res,405,'Method not allowed');
  if(url.search.length>700)return artSend(res,414,'Request too long');
  const check=await verify(url.searchParams.get('session_id'));
  if(!check.ok)return artSend(res,check.status,ERROR_PAGE);
  if(url.pathname==='/art/redeem')return artSend(res,200,artPage(check.product.name,url.searchParams.get('session_id')),true);
  if(url.pathname==='/art/download'){
    let parsed;
    try{parsed=new URL(downloadOrigin);if(parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.search||parsed.hash||parsed.pathname!=='/')throw Error('not origin');}
    catch{return artSend(res,503,'Secure download endpoint is not configured. Please contact support.')}
    let token;try{token=sign(check.product.sku)}catch{return artSend(res,503,'Secure download is not yet configured.')}
    res.writeHead(303,{'Location':parsed.origin+'/download?token='+encodeURIComponent(token),'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex,nofollow'});
    return res.end();
  }
  return artSend(res,404,'Not found');
}

import {createServer} from 'node:http';
import redeem from './api/redeem.mjs';
import {buildQuietPdf,verifyQuietPurchase} from './quiet-journal.mjs';
import {handleClassicx,handleClassicxWebhook} from './classicx.mjs';
import {verifyPathwayPurchase,buildPathwayPdf} from './love-pathway.mjs';

const port=Number.parseInt(process.env.PORT||'3000',10);
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('PORT must be a valid port');
const send=(res,status,body,method='GET')=>{
  res.statusCode=status;
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(method==='HEAD')return res.end();
  return res.end(body);
};

async function verifyStripeCredentialAtStartup(){
  const key=process.env.STRIPE_SECRET_KEY;
  if(typeof key!=='string'||!/^((sk|rk)_live_)/.test(key)){
    process.stdout.write('Stripe read credential status: MISSING_OR_INCORRECT_MODE\n');
    return;
  }
  try{
    // A nonexistent session ID should return 404 when the Stripe credential
    // can authenticate and is permitted to read Checkout Sessions.
    const r=await fetch('https://api.stripe.com/v1/checkout/sessions/cs_live_APERTURE_credentials_check_not_a_real_session',{
      headers:{Authorization:'Bearer '+key,Accept:'application/json'},
      signal:AbortSignal.timeout(8000),cache:'no-store'
    });
    // Print only the non-sensitive diagnostic category, never key or Stripe body.
    const status=r.status===404?'STRIPE_READ_AUTHENTICATED':r.status===401?'STRIPE_AUTH_FAILED':r.status===403?'STRIPE_PERMISSION_DENIED':'UNEXPECTED_STATUS_'+r.status;
    process.stdout.write('Stripe read credential status: '+status+'\n');
  }catch(_err){
    process.stdout.write('Stripe read credential status: STRIPE_UNREACHABLE\n');
  }
}

async function smokeTestPrivateRoutes(){
  const base='http://127.0.0.1:'+port;
  const checks=[
    {name:'health',path:'/healthz',want:200},
    {name:'invalid_session_denied',path:'/api/redeem?session_id=invalid',want:400},
    {name:'missing_session_denied',path:'/api/redeem',want:400},
    {name:'public_book_denied',path:'/api/redeem?book=basketball-iq',want:400},
    {name:'unsupported_route_denied',path:'/private-content/basketball-iq.html',want:404},
    {name:'pathway_missing_payment_denied',path:'/api/love-pathway',want:400},
    {name:'pathway_invalid_payment_denied',path:'/api/love-pathway?session_id=invalid',want:400},
    {name:'quiet_missing_payment_denied',path:'/api/quiet-journal',want:400},
    {name:'quiet_invalid_payment_denied',path:'/api/quiet-journal?session_id=invalid',want:400},
    {name:'classicx_missing_payment_denied',path:'/classicx/redeem',want:400},
    {name:'classicx_invalid_payment_denied',path:'/classicx/download?session_id=invalid',want:400},
    {name:'classicx_encrypted_assets_denied',path:'/classicx-vault/one.b64',want:404}
  ];
  for(const c of checks) {
    try{
      const r=await fetch(base+c.path,{signal:AbortSignal.timeout(6000),redirect:'manual',cache:'no-store'});
      process.stdout.write('APERTURE private route '+c.name+': '+(r.status===c.want?'PASS':'FAIL')+' (HTTP '+r.status+')\n');
    }catch(_err){
      process.stdout.write('APERTURE private route '+c.name+': REQUEST_FAILED\n');
    }
  }
}
createServer(async(req,res)=>{
  try {
    const url=new URL(req.url||'/', 'http://localhost');
    if(url.pathname==='/classicx/traffic.gif') {
      if(req.method!=='GET')return send(res,405,'Method not allowed');
      const allowedEvents=new Set(['visit','free_sample','shop','checkout','arcade','replay','team_license']);
      const event=url.searchParams.get('e')||'';
      const source=(url.searchParams.get('s')||'direct').slice(0,32);
      if(!allowedEvents.has(event)||!(/^[a-zA-Z0-9_-]{1,32}$/.test(source)))return send(res,400,'Invalid event');
      // Anonymous aggregate events only: never log IP, URL, cookies, email or checkout IDs.
      process.stdout.write('CLASSICX_TRAFFIC '+JSON.stringify({event,source})+'\\n');
      res.statusCode=200;
      res.setHeader('Content-Type','image/gif');
      res.setHeader('Cache-Control','no-store, private');
      res.setHeader('Access-Control-Allow-Origin','https://classicx-moments-store.onrender.com');
      res.setHeader('X-Content-Type-Options','nosniff');
      return res.end(Buffer.from('R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=','base64'));
    }
    if(url.pathname==='/healthz') {
      if(!['GET','HEAD'].includes(req.method))return send(res,405,'Method not allowed');
      return send(res,200,'ok',req.method);
    }
    if(url.pathname==='/classicx/webhook')return await handleClassicxWebhook(req,res);
    if(url.pathname==='/classicx/redeem'||url.pathname==='/classicx/download'){
      if(url.search.length>1024)return send(res,414,'Request too long');
      return await handleClassicx(req,res,url);
    }
    if(url.pathname==='/api/love-pathway-test') {
      // Isolated sandbox-only endpoint; never accepts live Checkout sessions.
      res.setHeader('Cache-Control','private, no-store');
      res.setHeader('Referrer-Policy','no-referrer');
      res.setHeader('X-Content-Type-Options','nosniff');
      res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
      if(req.method!=='GET')return send(res,405,'Method not allowed');
      if(url.search.length>1024)return send(res,414,'Request too long');
      if(process.env.PATHWAY_TEST_ENABLED!=='true')return send(res,404,'Not found');
      const check=await verifyPathwayPurchase(url.searchParams.get('session_id'),{secret:process.env.STRIPE_TEST_SECRET_KEY,testMode:true});
      if(!check.ok)return send(res,check.status,'Sandbox download unavailable');
      const pdf=buildPathwayPdf();
      res.statusCode=200;
      res.setHeader('Content-Type','application/pdf');
      res.setHeader('Content-Disposition','attachment; filename="APERTURE-30-Days-SANDBOX.pdf"');
      res.setHeader('Content-Length',String(pdf.length));
      return res.end(pdf);
    }
    if(url.pathname==='/api/love-pathway') {
      res.setHeader('Cache-Control','private, no-store');
      res.setHeader('Referrer-Policy','no-referrer');
      res.setHeader('X-Content-Type-Options','nosniff');
      res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
      res.setHeader('Content-Security-Policy',"default-src 'none'; frame-ancestors 'none'");
      if(req.method!=='GET')return send(res,405,'Method not allowed');
      if(url.search.length>1024)return send(res,414,'Request too long');
      const check=await verifyPathwayPurchase(url.searchParams.get('session_id'));
      if(!check.ok)return send(res,check.status,'Download unavailable. Verify your Stripe receipt or contact support.');
      const pdf=buildPathwayPdf();
      res.statusCode=200;
      res.setHeader('Content-Type','application/pdf');
      res.setHeader('Content-Disposition','attachment; filename="APERTURE-30-Days-Love-in-Action.pdf"');
      res.setHeader('Content-Length',String(pdf.length));
      return res.end(pdf);
    }
    if(url.pathname==='/api/quiet-journal') {
      res.setHeader('Cache-Control','private, no-store, max-age=0');
      res.setHeader('Referrer-Policy','no-referrer');
      res.setHeader('X-Content-Type-Options','nosniff');
      res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
      res.setHeader('Content-Security-Policy',"default-src 'none'; frame-ancestors 'none'");
      if(req.method!=='GET')return send(res,405,'Method not allowed');
      if(url.search.length>1024)return send(res,414,'Request too long');
      const sessionId=url.searchParams.get('session_id');
      const check=await verifyQuietPurchase(sessionId);
      if(!check.ok)return send(res,check.status,'Journal unavailable: '+check.code+'. For a verified paid order, contact APERTURE Quiet Practice support with your Stripe receipt.');
      const pdf=buildQuietPdf();
      res.statusCode=200;
      res.setHeader('Content-Type','application/pdf');
      res.setHeader('Content-Disposition','attachment; filename="APERTURE-21-Day-Reflection-Journal.pdf"');
      res.setHeader('Content-Length',String(pdf.length));
      return res.end(pdf);
    }
    if(url.pathname==='/redeem'||url.pathname==='/api/redeem') {
      if(url.search.length>2048)return send(res,414,'Request too long');
      return await redeem(req,res);
    }
    return send(res,404,'Not found');
  } catch(_err) {
    return send(res,500,'Unable to process request');
  }
}).listen(port,'0.0.0.0',()=>{process.stdout.write('APERTURE private gift delivery server listening\n');void verifyStripeCredentialAtStartup();void smokeTestPrivateRoutes()});

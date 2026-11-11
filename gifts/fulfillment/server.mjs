import {createServer} from 'node:http';
import redeem from './api/redeem.mjs';

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
createServer(async(req,res)=>{
  try {
    const url=new URL(req.url||'/', 'http://localhost');
    if(url.pathname==='/healthz') {
      if(!['GET','HEAD'].includes(req.method))return send(res,405,'Method not allowed');
      return send(res,200,'ok',req.method);
    }
    if(url.pathname==='/redeem'||url.pathname==='/api/redeem') {
      if(url.search.length>2048)return send(res,414,'Request too long');
      return await redeem(req,res);
    }
    return send(res,404,'Not found');
  } catch(_err) {
    return send(res,500,'Unable to process request');
  }
}).listen(port,'0.0.0.0',()=>{process.stdout.write('APERTURE private gift delivery server listening\n');void verifyStripeCredentialAtStartup()});

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
}).listen(port,'0.0.0.0',()=>{process.stdout.write('APERTURE private gift delivery server listening\n')});

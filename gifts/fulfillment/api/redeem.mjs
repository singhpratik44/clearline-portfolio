import {readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {verifyGiftPurchase} from '../verify.mjs';
import {BUNDLE_BOOKS} from '../bundles.mjs';

const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
function headers(res) {
  res.setHeader('Cache-Control','private, no-store, max-age=0');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  res.setHeader('Cross-Origin-Resource-Policy','same-origin');
  res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
}
function fail(res,status,code) {
  res.statusCode=status;
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  res.end('APERTURE gift access unavailable: '+code+'. For an existing paid order, contact seller support with your Stripe receipt.');
}
function chooseBook(sku,want) {
  const entitled=BUNDLE_BOOKS[sku]||[sku];
  if(want===undefined || want===null || want==='') return {book:entitled.length===1?sku:null,entitled};
  if(typeof want!=='string'||!entitled.includes(want))return null;
  return {book:want,entitled};
}
function bundlePage(sessionId,entitled) {
  const links=entitled.map((book,i)=>'<li><a href="/api/redeem?session_id='+encodeURIComponent(sessionId)+'&book='+encodeURIComponent(book)+'">Workbook '+(i+1)+': '+esc(book.replaceAll('-',' '))+'</a></li>').join('');
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your APERTURE Gift Collection</title><style>body{font:18px/1.65 system-ui;background:#f3faf4;color:#172535;max-width:720px;margin:40px auto;padding:24px}h1{font-size:42px;letter-spacing:-.05em}a{color:#284f66}li{padding:12px 0}footer{font-size:13px;color:#52657a}</style></head><body><h1>Your APERTURE Gift Collection</h1><p>Payment verified. Select each workbook and print or save it as a PDF. The link to this page contains a checkout-session access token; keep it private.</p><ol>'+links+'</ol><footer>For questions or lost access, contact APERTURE support with your Stripe receipt. No child profile is required.</footer></body></html>';
}
export default async function handler(req,res) {
  headers(res);
  if(req.method!=='GET') {
    res.setHeader('Allow','GET');
    return fail(res,405,'method_not_allowed');
  }
  const url=new URL(req.url||'/api/redeem','https://localhost');
  const sessionId=typeof req.query?.session_id==='string'?req.query.session_id:url.searchParams.get('session_id');
  const want=typeof req.query?.book==='string'?req.query.book:url.searchParams.get('book');
  const result=await verifyGiftPurchase(sessionId);
  if(!result.ok)return fail(res,result.status,result.code);
  const selection=chooseBook(result.sku,want);
  if(!selection)return fail(res,403,'book_not_in_purchase');
  if(!selection.book) {
    res.statusCode=200;
    res.setHeader('Content-Type','text/html; charset=utf-8');
    return res.end(bundlePage(sessionId,selection.entitled));
  }
  // Private files must be packaged at deploy time; do NOT check copyrighted content into public GitHub.
  const root=resolve(process.env.GIFT_PRIVATE_CONTENT_DIR||join(process.cwd(),'private-content'));
  const filepath=join(root,selection.book+'.html');
  // Names are allowlisted SKUs; never accept an unvalidated path.
  if(!selection.entitled.includes(selection.book)||!/^[-a-z0-9]+$/.test(selection.book))return fail(res,403,'book_not_allowed');
  let content;
  try {content=await readFile(filepath,'utf8');} catch(_err) {
    return fail(res,503,'private_workbook_not_deployed');
  }
  res.statusCode=200;
  res.setHeader('Content-Type','text/html; charset=utf-8');
  return res.end(content);
}

import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,join} from 'node:path';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'..','..');
const sources=[
 ['collection-2.js','window.APERTURE_GIFT_LAB_V2='],
 ['sports-collection.js','window.APERTURE_GIFT_LAB_SPORTS='],
 ['basketball-collection.js','window.APERTURE_GIFT_LAB_BASKETBALL='],
 ['basketball-extra.js','window.APERTURE_GIFT_LAB_BASKETBALL_EXTRA='],
];
const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
let cached=null;
export async function loadBooks() {
 if(cached)return cached;
 const books={};
 const old=await readFile(join(root,'gifts','print.html'),'utf8');
 const start='const catalog=',end=';\nObject.assign(catalog,',a=old.indexOf(start),b=old.indexOf(end,a);
 if(a<0||b<a)throw Error('Original workbook catalog missing');
 Object.assign(books,JSON.parse(old.slice(a+start.length,b)));
 for(const [name,prefix] of sources){
  const t=await readFile(join(root,'gifts',name),'utf8'),p=t.indexOf(prefix);
  if(p<0)throw Error('Missing book registry '+name);
  const data=JSON.parse(t.slice(p+prefix.length).trim().replace(/;\s*$/,''));
  Object.assign(books,data.kits);
 }
 cached=Object.freeze(books);
 return cached;
}
const style=`*{box-sizing:border-box}body{margin:0;background:#f1f5f0;color:#20313e;font:16px/1.6 system-ui}header{background:#17343c;color:white;padding:17px 25px;display:flex;align-items:center;justify-content:space-between;gap:20px}main{max-width:850px;margin:auto;padding:28px}button{border:0;border-radius:9px;padding:10px 15px;background:#d5ffab;font:800 13px system-ui;cursor:pointer}.cover,.guide,.quest,.finish{border:1px solid #ccd8d7;background:white;border-radius:14px;padding:35px;margin:20px 0}.cover{background:#e4e9ff;padding:55px 32px}h1{font-size:clamp(39px,7vw,67px);letter-spacing:-.065em;line-height:1.05}h2{letter-spacing:-.035em}.tag{font:900 12px ui-monospace,monospace;letter-spacing:.12em;color:#37756a}.hint{font-size:13px;background:#eaf5dd;padding:13px;border-radius:9px}.space{height:120px;border-bottom:1px solid #dadfdd}.recipient{display:block;margin:16px 0;font-weight:700}input{padding:9px 13px;width:min(100%,370px);font:inherit;border:1px solid #849497;border-radius:7px}.award{border:2px dotted #8d969b;padding:30px;text-align:center;margin:25px 0}.terms{font-size:13px;color:#596b70}a{color:#285682}button:focus-visible,input:focus-visible{outline:3px solid #856aa9}@media print{header,.terms{display:none}body{background:white}main{max-width:none;margin:0;padding:0}.cover,.guide,.quest,.finish{border:0;border-radius:0;page-break-before:always;break-after:page;min-height:88vh;margin:0;padding:18mm 12mm}.cover{background:white}input{border:0;border-bottom:1px solid #aaa}}@page{size:letter;margin:9mm}`;
export function renderBook(book){
 if(!book||!Array.isArray(book.quests))throw Error('Invalid book');
 const pages=book.quests.map((a,i)=>'<section class="quest"><div class="tag">'+(book.kind==='awards'?'CERTIFICATE':'ACTIVITY')+' '+(i+1)+' / '+book.quests.length+'</div><h2>'+esc(a[0])+'</h2>'+(book.kind==='awards'?'<div class="award">Presented to: _________________________________</div>':'')+'<p>'+esc(a[1])+'</p><div class="space"></div><p class="hint"><b>Facilitator tip:</b> '+esc(a[2])+'</p></section>').join('');
 const html='<header><b>APERTURE / VERIFIED GIFT</b><button type="button" onclick="window.print()">Print / Save PDF</button></header><main><section class="cover"><div class="tag">'+esc(book.tag||'ORIGINAL EDUCATIONAL GIFT')+'</div><h1>'+esc(book.title)+'</h1><p>'+esc(book.intro)+'</p><strong>'+esc(book.age)+' · '+book.quests.length+' activities</strong><label class="recipient">To: <input maxlength="60" placeholder="A future creator"></label><label class="recipient">From: <input maxlength="60" placeholder="Someone who believes in you"></label><p class="terms">Dedication fields stay in your browser, never uploaded. Do not share your checkout session URL.</p></section><section class="guide"><div class="tag">HOW TO USE</div><h2>Getting started</h2><p>'+esc(book.instructions)+'</p></section>'+pages+'<section class="finish"><h2>Celebrate progress</h2><p>'+esc(book.bonus)+'</p><p><b>Facilitator notes:</b> '+esc(book.answers)+'</p><p>Signed: ___________________ &nbsp; Date: _________________</p></section><p class="terms">Personal-use digital license. No physical shipment, professional sports training or official athlete/team endorsement.</p></main>';
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>'+esc(book.title)+'</title><style>'+style+'</style></head><body>'+html+'</body></html>';
}

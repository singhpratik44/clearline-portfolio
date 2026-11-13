import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const api=require('../sports-os/market/market.js');
const {products,filterProducts,cleanMoment,momentText,encodeMoment,decodeMoment,approvedPlacements,LEAGUES,ROADMAP,validHttps}=api;
const root='sports-os/market/';
const window={};
const scripts=['gifts/sports-collection.js','gifts/basketball-collection.js','gifts/basketball-extra.js','gifts/checkout-links.js',root+'sponsors.js'];
for(const file of scripts)vm.runInNewContext(readFileSync(file,'utf8'),{window},{filename:file,timeout:1000});
const catalog=products([window.APERTURE_GIFT_LAB_SPORTS,window.APERTURE_GIFT_LAB_BASKETBALL,window.APERTURE_GIFT_LAB_BASKETBALL_EXTRA],window.APERTURE_GIFT_CHECKOUT);
const sponsor=window.APERTURE_SPORTS_ADS;
test('catalog reuses existing real gift products and unique Stripe links without invented goods',()=>{
 assert.ok(catalog.length>=42, 'At least existing 42 sports products');
 assert.equal(new Set(catalog.map(p=>p.sku)).size,catalog.length);
 assert.ok(catalog.every(p=>p.checkout.startsWith('https://buy.stripe.com/')));
 assert.ok(catalog.every(p=>p.price>0&&p.name.length>4));
 assert.ok(catalog.some(p=>p.sku==='all-sports-bundle'));
 const original=window.APERTURE_GIFT_LAB_SPORTS.products.find(p=>p.sku==='all-sports-bundle');
 assert.equal(catalog.find(p=>p.sku===original.sku).price,original.price);
});
test('search, category and price sort work on real store data',()=>{
 const soccer=filterProducts(catalog,{category:'soccer'});
 assert.ok(soccer.length>=1);
 assert.ok(soccer.some(p=>/soccer/i.test(p.name+" "+p.sku)));
 const cheap=filterProducts(catalog,{sort:'low'});
 assert.ok(cheap.every((x,i)=>i===0||cheap[i-1].price<=x.price));
 const pricey=filterProducts(catalog,{sort:'high'});
 assert.ok(pricey.every((x,i)=>i===0||pricey[i-1].price>=x.price));
 const match=filterProducts(catalog,{query:'basketball'});
 assert.ok(match.length>=5);
 assert.ok(match.every(x=>[x.name,x.description,x.age,x.category,x.sku].join(' ').toLowerCase().includes('basketball')));
});
test('fan moments roundtrip via URL fragment and safely handle untrusted input',()=>{
 const m=cleanMoment({sport:'basketball',occasion:'thanks',recipient:'Jules <script>',from:'Coach B',message:'Amazing pass!'});
 const hash=encodeMoment(m);
 const loaded=decodeMoment(hash);
 assert.deepEqual(loaded,m);
 assert.equal(momentText(loaded).icon,'🏀');
 assert.match(momentText(loaded).title,/Jules/);
 assert.doesNotMatch(momentText(loaded).title,/script|</);
 assert.equal(decodeMoment('#m=%GG'),null);
 assert.equal(decodeMoment('#m='+'.'.repeat(2000)),null);
 assert.equal(decodeMoment('#unrelated'),null);
 assert.equal(cleanMoment({sport:'not-real',occasion:'NIL'}).sport,'basketball');
});
test('official sports sources are fixed HTTPS links, not scraped data',()=>{
 const required=['nba','wnba','nfl','mlb','nhl','mls','ncaa'];
 assert.ok(required.every(id=>LEAGUES.some(x=>x.id===id)));
 assert.ok(LEAGUES.every(x=>validHttps(x.url)&&/Official/.test(x.detail)));
 assert.ok(ROADMAP.length>=10);
 assert.ok(ROADMAP.some(x=>/Licensed live scores/.test(x.title)));
});
test('three real one-time advertising links have verified inventory identifiers, separated pricing, and no fake activated sponsors',()=>{
 assert.equal(sponsor.schema_version,1);
 assert.equal(sponsor.packages.length,3);
 assert.equal(sponsor.placements.length,0);
 const expected={community:4900,moment:9900,presenter:24900};
 for(const p of sponsor.packages){
   assert.equal(p.price_cents,expected[p.id]);
   assert.ok(p.checkout_url.startsWith('https://book.stripe.com/'));
   assert.match(p.stripe_link_id,/^plink_/);
   assert.equal(p.inventory_max,1);
 }
 assert.equal(new Set(sponsor.packages.map(p=>p.checkout_url)).size,3);
});
test('advertising is approval-gated, payment-gated, date-bounded, and advertiser links must be HTTPS',()=>{
 const now=Date.parse('2026-11-12T12:00:00Z');
 const good={surface:'moment',name:'Approved Demo Company',headline:'Original fan gear',description:'Independent family-safe sponsor',url:'https://example.com/sports',approved:true,payment_verified:true,approval_ref:'decision-123',starts_at:'2026-11-01T00:00:00Z',ends_at:'2026-12-01T00:00:00Z'};
 assert.equal(approvedPlacements([good],now).length,1);
 assert.equal(approvedPlacements([{...good,approved:false}],now).length,0);
 assert.equal(approvedPlacements([{...good,payment_verified:false}],now).length,0);
 assert.equal(approvedPlacements([{...good,url:'http://example.com'}],now).length,0);
 assert.equal(approvedPlacements([{...good,url:'javascript:alert(1)'}],now).length,0);
 assert.equal(approvedPlacements([{...good,approval_ref:null}],now).length,0);
 assert.equal(approvedPlacements([{...good,ends_at:'2026-11-02T00:00:00Z'}],now).length,0);
});
test('public page includes all operational surfaces and discloses actual licensing/advertising constraints',()=>{
 const page=readFileSync(root+'index.html','utf8');
 for(const id of ['league-cards','moment-form','moment-preview','gift-grid','gift-search','gift-sort','gift-category','sponsor-products','roadmap-cards','share-moment','save-moment'])
   assert.ok(page.includes('id="'+id+'"'),id);
 for(const f of ['sports-collection.js','basketball-collection.js','basketball-extra.js','checkout-links.js','sponsors.js','market.js'])assert.ok(page.includes('src="'+(f.includes('collection')||f==='basketball-extra.js'||f==='checkout-links.js'?'../../gifts/':'')+f+'"'),f);
 assert.match(page,/licensed feed or widget agreement/);
 assert.match(page,/STRIPE-HOSTED CHECKOUTS/);
 assert.match(page,/No affiliation, endorsement/);
 const terms=readFileSync(root+'advertising.html','utf8');
 assert.match(terms,/full refund/i);
 assert.match(terms,/No advertising impressions/i);
 assert.match(terms,/One-time USD prices/i);
 assert.match(terms,/No targeting based on children|Ads are contextual placements/i);
 assert.match(readFileSync(root+'technology.html','utf8'),/provider account access/);
});
test('front end is deterministic and no client credentials, persistent identity collection or unlicensed scoreboard fetches',()=>{
 const code=readFileSync(root+'market.js','utf8');
 assert.doesNotThrow(()=>new vm.Script(code));
 assert.doesNotMatch(code,/\b(localStorage|sessionStorage|indexedDB|XMLHttpRequest|WebSocket|EventSource)\b/);
 assert.doesNotMatch(code,/\bfetch\s*\(/);
 assert.doesNotMatch(code,/\.innerHTML\s*=/);
 assert.doesNotMatch(code,/api_key|secret_key|sk_live|Bearer\s+[A-Za-z0-9]/);
 assert.doesNotMatch(code,/window\.open\s*\(/);
});

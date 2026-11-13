import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const get=p=>fs.readFileSync(path.join(root,p),"utf8");
test("revenue page is reachable from store and homepage",()=>{
 const page=get("sprint/index.html"),home=get("index.html"),shop=get("shop/index.html");
 assert.match(page,/<meta name="viewport"/);
 assert.match(page,/<main>/);
 assert.match(home,/href="sprint\/"/);
 assert.match(shop,/href="\.\.\/sprint\/"/);
 assert.match(page,/href="https:\/\/buy\.stripe\.com\/aFa9AVcsKcMs1Vy1ND6kg1o"/);
 assert.match(page,/\$500/);
 assert.match(page,/\$250 kickoff deposit/);
 assert.match(page,/remaining \$250/);
});
test("revenue copy protects buyers from premature collection and unverified claims",()=>{
 const page=get("sprint/index.html");
 for(const phrase of ["FICTIONAL WORKFLOW","after scope approval","48 hours after confirmed kickoff","No guaranteed revenue increase","No subscription","Do not email student identities"])
   assert.ok(page.includes(phrase), "Expected promise or boundary: "+phrase);
 assert.doesNotMatch(page,/get-rich|guaranteed sales|guaranteed returns/i);
 assert.doesNotMatch(page,/<form|localStorage|fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
 const paths=[...page.matchAll(/href="(\.\.\/[^"#?]+)"/g)].map(x=>x[1].replace(/^\.\.\//,""));
 for(const p of paths){const file=p.endsWith("/")?p+"index.html":p;assert.ok(fs.existsSync(path.join(root,file)),"Missing local link: "+p)}
});
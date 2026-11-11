import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
const read = path => readFileSync(new URL("../"+path, import.meta.url),"utf8");
const starter=read("prayer/start/index.html"),style=read("prayer/start/style.css"),script=read("prayer/start/app.js");
const prayer=read("prayer/index.html"),long=read("prayer/three-year/index.html"),sitemap=read("sitemap.xml");
test("five-minute starter is functional and privacy-first",()=>{
 assert.doesNotThrow(()=>new Script(script));
 for(const id of ["practice","focus","stepCount","stepTitle","stepBody","stepPrayer","previous","next","share","shareStatus"])
  assert.ok(starter.includes('id="'+id+'"'),"missing "+id);
 assert.match(starter,/connect-src 'none'/);
 assert.match(starter,/script-src 'self'/);
 assert.doesNotMatch(starter+script,/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|<script[^>]*src="https?:/i);
 assert.match(script,/navigator\.share/);
 assert.match(script,/navigator\.clipboard/);
 assert.match(script,/textContent/);
 assert.match(style,/max-width:480px/);
 assert.match(style,/prefers-reduced-motion:reduce/);
 assert.match(starter,/href="\.\.\/three-year\/"/);
 assert.match(starter,/href="\.\.\/#commitment"/);
});
test("free-first navigation is accessible from both existing prayer experiences",()=>{
 assert.match(prayer,/href="\.\/start\/"/);
 assert.match(prayer,/id="commitment"/);
 assert.match(long,/href="\.\.\/start\/"/);
 assert.match(starter,/class="skip"/);
 assert.match(starter,/role="status"/);
 assert.match(starter,/no account|no sign-up/i);
});
test("search previews and sitemap direct people to the right experience",()=>{
 for(const body of [starter,prayer,long]){
  assert.match(body,/rel="canonical"/);
  assert.match(body,/property="og:title"/);
  assert.match(body,/name="description"/);
 }
 assert.match(sitemap,/\/prayer\/start\//);
 assert.doesNotMatch(starter,/spiritual ranking|guaranteed spiritual results|pay to pray/i);
});
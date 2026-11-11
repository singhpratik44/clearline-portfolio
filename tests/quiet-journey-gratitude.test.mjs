import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
const load=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const page=load("prayer/gratitude/index.html");
const style=load("prayer/gratitude/styles.css");
const app=load("prayer/gratitude/app.js");
const workbook=load("prayer/three-year/companion/workbook.js");
const site=load("prayer/start/index.html");
const home=load("prayer/index.html");
const long=load("prayer/three-year/index.html");
const sitemap=load("sitemap.xml");

test("gratitude page is functional, accessible and safe to navigate by keyboard",()=>{
 assert.doesNotThrow(()=>new Script(app));
 assert.match(page,/<main>/);
 assert.match(page,/href="#practice"/);
 assert.match(page,/aria-labelledby="practice-heading"/);
 for(const id of ["practice","dayGrid","previousDay","nextDay","dayTitle","dayStatus","prayerLanguage","letter","person","specific","impact","hard","makeNote","clearNote","noteWrap","notePreview","copyNote","printNote","noteStatus","sharePage"])
   assert.ok(page.includes('id="'+id+'"'),"Missing "+id);
 assert.equal((page.match(/class="day-button"/g)||[]).length,7);
 assert.match(page,/aria-pressed="true"/);
 assert.match(page,/role="status"/);
 assert.match(style,/max-width:420px/);
 assert.match(style,/prefers-reduced-motion:reduce/);
 assert.match(style,/@media print/);
 assert.match(style,/min-height:50px/);
});

test("gratitude copy and printable note remain local, ephemeral and opt-in",()=>{
 assert.match(page,/connect-src 'none'/);
 assert.match(page,/script-src 'self'/);
 assert.match(page,/form-action 'none'/);
 assert.doesNotMatch(app,/localStorage|sessionStorage|indexedDB|fetch\s*\(|XMLHttpRequest|sendBeacon/);
 assert.doesNotMatch(page,/<script[^>]*src="https?:\/\//i);
 assert.match(app,/notePreview"\)\.textContent/);
 assert.match(app,/validPreview/);
 assert.match(app,/navigator\.clipboard/);
 assert.match(app,/navigator\.share/);
 assert.match(app,/window\.print/);
 // The optional difficulty reflection is explicitly excluded from exports.
 assert.match(app,/const person=value\("person"\),specific=value\("specific"\),impact=value\("impact"\)/);
 assert.match(app,/optional difficulty field is intentionally excluded/);
 assert.match(app,/resetPreview\(\)/);
});

test("the paid product has 36 distinct thankfulness prompts while retaining 48 worksheets",()=>{
 const part=workbook.split("const GRATITUDE_PROMPTS=[")[1]?.split("\n];")[0];
 assert.ok(part,"Distinct gratitude prompts missing");
 assert.equal((part.match(/^ "/gm)||[]).length,36);
 assert.match(workbook,/\["Thankfulness",null\]/);
 assert.match(workbook,/heading==="Thankfulness"\?GRATITUDE_PROMPTS\[i\]/);
 assert.match(workbook,/const MONTHS=36/);
 assert.match(workbook,/quarter<=12/);
 assert.doesNotThrow(()=>new Script(workbook));
});
test("existing spiritual routes remain free and link to the gratitude experience",()=>{
 assert.match(site,/href="\.\.\/gratitude\//);
 assert.match(home,/href="\.\/gratitude\//);
 assert.match(long,/href="\.\.\/gratitude\//);
 assert.match(page,/href="\.\.\/three-year\//);
 assert.match(page,/href="\.\.\/start\//);
 assert.match(page,/36 original monthly guides and 12 seasonal reviews/);
 assert.match(page,/free/);
 assert.match(sitemap,/\/prayer\/gratitude\//);
 assert.doesNotMatch(sitemap,/companion\/workbook\.html/);
});
test("gratitude does not promise healing or claim religious authority",()=>{
 assert.match(page,/Gratitude need not deny pain/);
 assert.match(page,/not Gurbani/);
 assert.match(page,/not.*clinical treatment/);
 assert.doesNotMatch(page,/guaranteed happiness|miracle|cure your|God promises you/i);
});

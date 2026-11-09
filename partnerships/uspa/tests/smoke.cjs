const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
new vm.Script(app, {filename:"app.js"});
console.log("PASS: JavaScript syntax parses");

const sections = ["overview","network","athlete","kit","pilot"];
for (const section of sections) {
  assert(html.includes(`data-panel="${section}"`), `Missing section ${section}`);
  assert(html.includes(`data-view="${section}"`), `Missing nav ${section}`);
}
console.log("PASS: five navigable views exist");

const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
const usedIds = [...app.matchAll(/\$\("#([^"]+)"\)/g)].map(match => match[1]);
for (const id of usedIds) assert(ids.has(id), `JavaScript selector #${id} absent from HTML`);
console.log(`PASS: ${usedIds.length} direct JS ID selectors resolve`);

const allocations = [...app.matchAll(/hours:\s*\[([\d,\s]+)\]/g)];
assert.equal(allocations.length,3,"Expected three schedule scenarios");
for(const scenario of allocations) {
  const total=scenario[1].split(",").map(Number).reduce((a,b)=>a+b,0);
  assert.equal(total,168,"Scenario must allocate 168 hours");
}
console.log("PASS: all three illustrative scenarios allocate 168 hours");

for (const phrase of ["not an official","not uspa","fictional","not independently verified"]) {
  assert((html+" "+app+" "+css).toLowerCase().includes(phrase), `Safeguard phrase missing: ${phrase}`);
}
assert(!/\bfetch\s*\(/.test(app),"No remote network fetch is allowed");
assert(!/XMLHttpRequest|sendBeacon|WebSocket/.test(app),"No remote data transmission allowed");
assert(app.includes('write("partners"'),"Local workspace persistence missing");
assert(app.includes('textContent =') || app.includes('textContent='),"Safe text rendering missing");
for (const name of ["email:","onepager:","agenda:","faq:"]) assert(app.includes(name),`Missing kit: ${name}`);
console.log("PASS: safe demo boundary and four draft assets");

assert(html.includes('href="./styles.css"') && html.includes('src="./app.js"'),"Assets not linked");
assert(css.includes("@media(max-width:740px)"),"Mobile design missing");
console.log("PASS: asset links and mobile breakpoint");
console.log("APERTURE USPA smoke suite complete.");

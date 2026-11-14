import {readFileSync,existsSync} from "node:fs";
import {spawnSync} from "node:child_process";
import assert from "node:assert/strict";
import {fileURLToPath} from "node:url";
import {dirname,join} from "node:path";

const here=dirname(fileURLToPath(import.meta.url));
const file=(p)=>readFileSync(join(here,p),"utf8");
const html=file("index.html"),app=file("app.js"),css=file("style.css"),worlds=file("worlds.html"),prompt=file("adaptive-intelligence.txt");
const ids=["stage","bottom","sidebar","drawer","action","export","hotspots","recipient","message","giftOpen","downloadGift","styleSelect","daylight","verifyPlan","verifyDimensions","verifyApproval","verifyPhone","pilot","quality","motion","share"];
for(const id of ids)assert(html.includes('id="'+id+'"'),"Missing interactive UI element: "+id);
for(const mode of ["home","district","sports","gifts"]){
  assert(html.includes('data-scene="'+mode+'"'),"Missing navigation for "+mode);
  assert(app.includes("  "+mode+":"),"Missing scene content: "+mode);
}
assert(app.includes("new THREE.WebGLRenderer"),"Missing actual 3D renderer");
assert(app.includes("new OrbitControls"),"Missing camera gesture controls");
assert(app.includes("setPalette"),"Missing style variants");
assert(app.includes("setLight"),"Missing day/night control");
assert(app.includes("clientBrief()"),"Missing client brief");
assert(app.includes("keepsake()"),"Missing private keepsake");
assert(app.includes("drawGiftLabel()"),"Missing personalized in-world gift");
assert(app.includes("navigator.share"),"Missing native sharing");
assert(app.includes("prefers-reduced-motion"),"Missing reduced-motion support");
assert(css.includes("safe-area-inset-bottom"),"Missing iOS safe area styling");
assert(css.includes("@media(max-width:760px)"),"Missing portrait/mobile layout");
assert(!app.includes("localStorage")&&!app.includes("XMLHttpRequest"),"Unexpected browser persistence or request");
assert(html.includes("not a third-party inspection"),"Missing attestation disclosure");
assert(html.includes("No sign-in"),"Missing gift privacy statement");
assert(worlds.includes("scene=district"),"Living Worlds must open on the district scene");
assert(prompt.includes("Seek evidence that could prove you wrong"),"Master prompt incomplete");
assert(existsSync(join(here,"../assets/aperture-mark.svg")),"Missing referenced asset");
const check=spawnSync("node",["--check",join(here,"app.js")],{encoding:"utf8"});
assert.equal(check.status,0,"JavaScript parse failed: "+check.stderr);
console.log("APERTURE Spatial V2 static regression checks PASS");
console.log("Scenes: home / district / sports / gifts; controls, privacy, accessibility and syntax present.");
console.log("Note: static tests do NOT verify 3D rendering or actual iPhone touch behavior.");

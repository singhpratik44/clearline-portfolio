import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script} from "node:vm";

const text=file=>readFileSync(new URL("../"+file,import.meta.url),"utf8");
const free=text("prayer/three-year/index.html");
const shop=text("prayer/three-year/companion/shop.html");
const page=text("prayer/three-year/companion/workbook.html");
const workbook=text("prayer/three-year/companion/workbook.js");
const config=text("prayer/three-year/companion/checkout-config.mjs");
const storefront=text("prayer/three-year/companion/shop.js");
const sample=text("prayer/three-year/companion/sample.html");
const sitemap=text("sitemap.xml");

test("The free scripture and journal experience is not paywalled",()=>{
  assert.match(free,/id="daily"/);
  assert.match(free,/id="journal"/);
  assert.match(free,/id="monthSlider"/);
  assert.match(free,/href="\.\/companion\/shop\.html"/);
  assert.match(shop,/free[\s\S]*Gurbani|Gurbani[\s\S]*free/i);
  assert.match(shop,/remains free without paying|remain available without paying|remain free/i);
});

test("The optional companion has a tangible printable deliverable",()=>{
  assert.match(page,/id="months"/); assert.match(page,/id="reviews"/);
  assert.match(page,/id="printWorkbook"/);
  assert.match(page,/noindex,nofollow/);
  assert.match(workbook,/const MONTHS=36/);
  const chapters=workbook.split("const CHAPTERS = [")[1].split("\n];")[0];
  assert.equal((chapters.match(/^\s+\["/gm)||[]).length,36);
  assert.match(workbook,/quarter<=12/);
  assert.doesNotThrow(()=>new Script(workbook));
  assert.match(page,/not a religious authority/i);
});

test("Owner-approved one-time $29 Stripe payment link is configured and verified, not embedded",()=>{
  assert.match(config,/enabled:true/);
  assert.match(config,/stripePaymentUrl:"https:\/\/buy\.stripe\.com\/[A-Za-z0-9_-]+"/);
  assert.match(config,/proposedOneTimeUSD:29/);
  assert.match(config,/non-recurring|one-time/);
  assert.match(storefront,/u\.hostname===expectedHost/);
  assert.match(storefront,/buy\.stripe\.com/);
  assert.match(storefront,/validUrl\(checkoutConfig\.stripePaymentUrl\)/);
  assert.match(shop,/id="buyCompanion"[^>]*aria-disabled="true"/,"HTML starts fail-closed until JS validates config");
  assert.match(shop,/instant|after a successful payment/i);
  assert.match(shop,/id="faq"/);
  for(const [name,body] of [["shop",shop],["workbook",page],["config",config],["frontend",storefront]]){
    assert.doesNotMatch(body,/(sk_live_|sk_test_|rk_live_|rk_test_)[A-Za-z0-9]+/,"No Stripe secret in "+name);
    assert.doesNotMatch(body,/<script[^>]+src="https?:\/\//i,"No third-party scripts in "+name);
  }
});

test("No invented paywall or authenticated entitlement assertions",()=>{
  assert.match(shop,/static website cannot independently authenticate a Stripe payment/);
  assert.match(shop,/shareable link/);
  assert.match(shop,/not.*spiritual advancement/i);
  assert.match(shop,/one-time/i);
  assert.match(sitemap,/prayer\/three-year\/companion\/shop\.html/);
  assert.doesNotMatch(sitemap,/companion\/workbook\.html/);
});

test("Free, substantive printable sample is accessible and promotes informed choice",()=>{
  assert.match(sample,/id="worksheet"/);
  assert.match(sample,/NOTICE/);
  assert.match(sample,/CARE/);
  assert.match(sample,/ACT/);
  assert.match(sample,/REFLECT/);
  assert.match(sample,/RELEASE/);
  assert.match(shop,/href="\.\/sample\.html"/);
  assert.match(sitemap,/companion\/sample\.html/);
  assert.match(sample,/style-src 'self'/);
  assert.doesNotMatch(sample,/<script/);
  assert.match(sample,/not restricted to buyers|not paywalled|publicly accessible/i);
});

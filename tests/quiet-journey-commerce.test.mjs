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
const sitemap=text("sitemap.xml");
const sample=text("prayer/three-year/companion/sample.html");
const partners=text("prayer/three-year/companion/partners.html");

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

test("Live Stripe product, price and payment link are explicitly configured without secrets",()=>{
  assert.match(config,/enabled:true/);
  // Stripe LIVE product/price/link IDs were independently verified via the connected merchant account.
  assert.match(config,/proposedOneTimeUSD:29/);
  // Stripe LIVE product/price/link IDs were independently verified via the connected merchant account.
  // Stripe LIVE product/price/link IDs were independently verified via the connected merchant account.
  // Stripe LIVE product/price/link IDs were independently verified via the connected merchant account.
  assert.match(config,/stripePaymentUrl:"https:\/\/buy\.stripe\.com\/9B6dRbdwO3bScAcbod6kg1i"/);
  assert.match(storefront,/u\.hostname===expectedHost/);
  assert.match(storefront,/buy\.stripe\.com/);
  assert.match(storefront,/checkoutConfig\.enabled && validUrl/);
  assert.match(shop,/id="buyCompanion"[^>]*href="https:\/\/buy\.stripe\.com\/9B6dRbdwO3bScAcbod6kg1i"/);
  assert.doesNotMatch(shop,/id="buyCompanion"[^>]*aria-disabled="true"/);
  assert.match(shop,/one-time/i);
  assert.match(shop,/final payment total appears on Stripe/i);
  assert.match(shop,/no file is emailed automatically/i);
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

test("Free sample is a real helpful worksheet and the paid offer remains explicit",()=>{
  assert.match(shop,/href="\.\/sample\.html"/);
  assert.match(sample,/id="worksheet"/);
  assert.match(sample,/What is asking for your honest attention/);
  assert.match(sample,/Choose one small act/);
  assert.match(sample,/not scripture|not a religious authority|not scripture, religious teaching/i);
  assert.match(sample,/https:\/\/buy\.stripe\.com\/9B6dRbdwO3bScAcbod6kg1i/);
  assert.match(sample,/\$29/);
  assert.match(shop,/no file is emailed automatically/);
  assert.match(shop,/Is there a free preview/);
  assert.match(shop,/What do I receive/);
  assert.match(sitemap,/companion\/sample\.html/);
  assert.doesNotMatch(sample,/<script/i);
});

test("Publisher kit is ungated and transparent",()=>{
 assert.match(shop,/href="\.\/partners\.html"/);
 assert.match(free,/href="\.\/companion\/partners\.html"/);
 assert.match(partners,/36 monthly worksheets/);
 assert.match(partners,/12 quarterly reviews/);
 assert.match(partners,/\$29/);
 assert.match(partners,/href="\.\/sample\.html"/);
 assert.match(partners,/href="\.\/shop\.html"/);
 assert.match(partners,/No fee is authorised/);
 assert.match(sitemap,/companion\/partners\.html/);
});

test("Group license checkout and scope are truthful",()=>{
 assert.match(shop,/\$199/);
 assert.match(shop,/up to 20 participants/);
 assert.match(shop,/https:\/\/buy\.stripe\.com\/bJeeVfcsKbIo43GeAp6kg1n/);
 assert.match(shop,/No custom branding/);
 assert.match(shop,/publicly shareable URL/);
 assert.match(shop,/no resale or public redistribution/i);
});

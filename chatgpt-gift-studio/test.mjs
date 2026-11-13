import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const PORT = 18251;
const base = "http://127.0.0.1:" + PORT;
const server = spawn(process.execPath, ["server.mjs"], {
  cwd: new URL(".", import.meta.url),
  env: { ...process.env, PORT: String(PORT) },
  stdio: ["ignore", "pipe", "pipe"]
});
let stderr = "";
server.stderr.on("data", chunk => { stderr += chunk.toString(); });
async function ready() {
  for (let i = 0; i < 40; i++) {
    if (server.exitCode !== null) throw new Error("Server exited unexpectedly: " + stderr);
    try { const r = await fetch(base + "/health"); if (r.ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error("Health check timed out: " + stderr);
}
let client;
try {
  await ready();
  const health = await (await fetch(base + "/health")).json();
  assert.equal(health.ok, true);
  assert.equal(health.checkoutLive, false);
  const page = await fetch(base + "/");
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Find the gift\. Give the feeling\./);
  const checkout = await fetch(base + "/api/checkout/gift-story", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sku: "gift-story-v1" })
  });
  assert.equal(checkout.status, 503, "No payment without verified test Stripe configuration");
  const verify = await fetch(base + "/api/checkout/verify", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: "cs_test_fake" })
  });
  assert.equal(verify.status, 503, "No entitlement without Stripe configuration");
  const download = await fetch(base + "/api/checkout/download", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: "cs_test_fake", recipient: "Friend", message: "Thank you" })
  });
  assert.equal(download.status, 503, "Never deliver a PDF without configured Stripe verification");
  const landing = await fetch(base + "/");
  assert.equal(landing.status, 200);
  const landingHtml = await landing.text();
  assert.match(landingHtml, /Gift Digital Twin/);
  assert.match(landingHtml, /Personalized Gift Story PDF/);
  assert.match(landingHtml, /id="storyCheckout" disabled/);
  assert.match(landingHtml, /id="runTwin"/);
  assert.match(landingHtml, /function simulateTwin\(/);
  assert.match(landingHtml, /affiliate commissions/i);
  assert.match(landingHtml, /NOT AN AFFILIATE LINK/);
  assert.match(landingHtml, /id="shopCategory"/);
  const giftPage = await fetch(base + "/gift");
  assert.equal(giftPage.status, 200);
  assert.match(await giftPage.text(), /Open your gift/);
  const giftApi = await fetch(base + "/api/gift", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient: "Mum", sender: "Me", occasion: "christmas", feeling: "gratitude" })
  });
  assert.equal(giftApi.status, 200);
  const giftPayload = (await giftApi.json()).gift;
  assert.match(giftPayload.shareUrl, /^https:\/\/aperture-gift-studio\.onrender\.com\/gift#/);
  assert.equal(giftPayload.sent, false);
  const form = await fetch(base + "/api/plan", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient: "my mentor", budget: 30, feeling: "gratitude", occasion: "holidays" })
  });
  assert.equal(form.status, 200);
  const body = await form.json();
  assert.equal(body.plan.recommendations.length, 3);
  assert.equal(body.plan.purchaseReady, false);
  const transport = new StreamableHTTPClientTransport(new URL(base + "/mcp"));
  client = new Client({ name: "gift-studio-smoke-test", version: "1.0.0" });
  await client.connect(transport);
  const tools = await client.listTools();
  assert.ok(tools.tools.some(x => x.name === "make_gift_plan"));
  assert.ok(tools.tools.some(x => x.name === "create_shareable_gift"));
  const result = await client.callTool({
    name: "make_gift_plan",
    arguments: { recipient: "a friend", occasion: "holidays", feeling: "joy", budget: 30 }
  });
  assert.equal(result.structuredContent.plan.recommendations.length, 3);
  assert.equal(result.structuredContent.plan.purchaseReady, false);
  const shareResult = await client.callTool({
    name: "create_shareable_gift", arguments: { recipient: "Mum", sender: "Me", feeling: "gratitude" }
  });
  assert.match(shareResult.structuredContent.gift.shareUrl, /\/gift#/);
  assert.equal(shareResult.structuredContent.gift.sent, false);
  console.log("PASS: health, gift reveal, API plan/gift, MCP initialize/list-tools/both tool calls");
} catch (err) {
  console.error("FAIL:", err);
  process.exitCode = 1;
} finally {
  try { await client?.close(); } catch {}
  server.kill();
}

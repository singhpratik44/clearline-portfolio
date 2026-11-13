import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const base = process.env.TARGET_BASE || "https://aperture-gift-studio.onrender.com";
async function get(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try { return await fetch(base + path, { signal: controller.signal }); }
  finally { clearTimeout(timer); }
}
let client;
try {
  const hRes = await get("/health");
  assert.equal(hRes.status, 200, "Public /health should return 200");
  const h = await hRes.json();
  assert.equal(h.ok, true);
  assert.equal(h.checkoutLive, false);
  const page = await get("/");
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Make generosity tangible/);

  const giftPage = await get("/gift");
  assert.equal(giftPage.status, 200);
  assert.match(await giftPage.text(), /Open your gift/);
  const giftApi = await fetch(base + "/api/gift", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient: "Coach", sender: "A student", occasion: "thank-you" })
  });
  assert.equal(giftApi.status, 200);
  assert.match((await giftApi.json()).gift.shareUrl, /\/gift#/);
  const pRes = await fetch(base + "/api/plan", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient: "my mentor", budget: 30, feeling: "gratitude", occasion: "holidays" })
  });
  assert.equal(pRes.status, 200);
  const plan = (await pRes.json()).plan;
  assert.equal(plan.recommendations.length, 3);
  assert.equal(plan.purchaseReady, false);

  client = new Client({ name: "aperture-production-smoke", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(base + "/mcp"));
  await client.connect(transport);
  const tools = await client.listTools();
  assert.ok(tools.tools.some(t => t.name === "make_gift_plan"), "MCP tool available");
  assert.ok(tools.tools.some(t => t.name === "create_shareable_gift"), "Gift giver tool available");
  const result = await client.callTool({ name: "make_gift_plan", arguments: { recipient: "friend", budget: 25, feeling: "joy" } });
  assert.equal(result.structuredContent.plan.recommendations.length, 3);
  assert.equal(result.structuredContent.plan.purchaseReady, false);
  const share = await client.callTool({ name: "create_shareable_gift", arguments: { recipient: "a friend", sender: "me", occasion: "birthday" } });
  assert.equal(share.structuredContent.gift.sent, false);
  assert.match(share.structuredContent.gift.shareUrl, /\/gift#/);
  console.log("PASS production HTTPS /health, public pages, /api/plan, /api/gift, /mcp both tools");
} catch (error) { console.error("Production smoke FAILED", error); process.exitCode = 1; }
finally { await client?.close().catch(()=>{}); }

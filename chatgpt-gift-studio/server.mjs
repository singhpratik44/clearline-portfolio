import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";

const landing = readFileSync(new URL("./public/index.html", import.meta.url), "utf8");
const widget = readFileSync(new URL("./public/widget.html", import.meta.url), "utf8");
const privacy = readFileSync(new URL("./public/privacy.html", import.meta.url), "utf8");
const allowedFeelings = ["gratitude", "joy", "encouragement", "wonder"];
const allowedOccasions = ["holidays", "birthday", "thank-you", "just-because", "celebration"];
const giftSets = [
  { label: "Thoughtful under $15", minimum: 0, ideas: [
    ["A handwritten postcard", "A specific, honest memory makes a small physical gift meaningful.", "$3–$10"],
    ["A personalized bookmark", "Pair their favorite theme with a short note.", "$5–$12"],
    ["A set of encouragement notes", "A few well-chosen handwritten messages can be revisited.", "$4–$14"]
  ] },
  { label: "Thoughtful under $35", minimum: 15, ideas: [
    ["A printed keepsake card set", "Design a handful of messages they can display or share.", "$12–$30"],
    ["A book with a handwritten dedication", "Choose a subject they already care about.", "$15–$35"],
    ["A small art print", "A physical reminder of a shared moment or value.", "$18–$35"]
  ] },
  { label: "Thoughtful under $70", minimum: 35, ideas: [
    ["A framed inspirational art print", "Choose imagery that reflects their taste rather than generic slogans.", "$30–$65"],
    ["A reading and reflection bundle", "Pair a book, a note, and a journal from a real seller.", "$35–$65"],
    ["A personal stationery collection", "Add a custom opening letter and space for future memories.", "$25–$60"]
  ] },
  { label: "An elevated gift", minimum: 70, ideas: [
    ["A framed custom memory print", "Commission a verified printer to make the moment tangible.", "$65–$120+"],
    ["A curated gift box", "Select real goods from a merchant who can fulfill and ship.", "$60–$120+"],
    ["A set of illustrated keepsake cards", "Create a cohesive series of meaningful physical cards.", "$50–$100+"]
  ] }
];

function shortString(value, fallback, max = 80) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : fallback;
}
function formatText(value) {
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("-", " ");
}
function makePlan(args = {}) {
  const recipient = shortString(args.recipient, "someone important", 60);
  const occasion = allowedOccasions.includes(args.occasion) ? args.occasion : "holidays";
  const feeling = allowedFeelings.includes(args.feeling) ? args.feeling : "gratitude";
  const detail = shortString(args.detail, "", 140);
  const n = Number(args.budget);
  const budget = Number.isFinite(n) ? Math.max(5, Math.min(500, Math.round(n))) : 30;
  const group = budget < 15 ? giftSets[0] : budget < 35 ? giftSets[1] : budget < 70 ? giftSets[2] : giftSets[3];
  const openers = {
    gratitude: "Thank you for the difference you make.",
    joy: "You make ordinary days brighter.",
    encouragement: "I believe in the good you are growing into.",
    wonder: "There is still so much beauty ahead of us."
  };
  const line = detail ? " I especially appreciate " + detail.replace(/[.!?]+$/, "") + "." : "";
  const message = "Dear " + recipient + ", " + openers[feeling] + line + " Wishing you a meaningful " + (occasion === "thank-you" ? "day" : formatText(occasion).toLowerCase()) + ".";
  return {
    recipient, occasion, feeling, budget, message,
    heading: "Three gift directions for " + recipient,
    recommendations: group.ideas.map(([title, why, estimate]) => ({ title, why, estimate })),
    disclaimer: "These are product concepts and illustrative price ranges, not live inventory, fixed quotes or purchase offers. Checkout is disabled until a real merchant, fulfillment, shipping, returns and taxes are verified.",
    purchaseReady: false
  };
}
const planShape = z.object({
  recipient: z.string(), occasion: z.string(), feeling: z.string(),
  budget: z.number(), message: z.string(), heading: z.string(),
  recommendations: z.array(z.object({ title: z.string(), why: z.string(), estimate: z.string() })),
  disclaimer: z.string(), purchaseReady: z.boolean()
});
function createGiftServer() {
  const server = new McpServer({ name: "aperture-gift-studio", version: "0.1.0" });
  registerAppResource(server, "gift-studio-widget", "ui://gift-studio/plan.html", {},
    async () => ({ contents: [{ uri: "ui://gift-studio/plan.html", mimeType: RESOURCE_MIME_TYPE, text: widget }] }));
  registerAppTool(server, "make_gift_plan", {
    title: "Make a meaningful physical gift plan",
    description: "Create three practical physical gift ideas and a personalized gift note. Works without accounts or model API costs. It DOES NOT sell items, claim inventory, charge customers, or send messages.",
    inputSchema: {
      recipient: z.string().max(60).optional().describe("Recipient's first name or relationship (avoid sensitive details)"),
      occasion: z.enum(allowedOccasions).optional(),
      feeling: z.enum(allowedFeelings).optional(),
      budget: z.number().min(5).max(500).optional().describe("Approximate total gift budget in USD"),
      detail: z.string().max(140).optional().describe("Optional short non-sensitive memory or compliment")
    },
    outputSchema: { plan: planShape },
    _meta: { ui: { resourceUri: "ui://gift-studio/plan.html" }, "openai/toolInvocation/invoking": "Creating a thoughtful gift plan", "openai/toolInvocation/invoked": "Gift plan ready" }
  }, async (args) => {
    const plan = makePlan(args);
    return {
      structuredContent: { plan },
      content: [{ type: "text", text: JSON.stringify({ plan }, null, 2) }]
    };
  });
  return server;
}
function respond(res, status, contentType, body) {
  res.writeHead(status, { "Content-Type": contentType, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" });
  res.end(body);
}
const port = Number(process.env.PORT || 8787);
createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  if (req.method === "GET" && url.pathname === "/") return respond(res, 200, "text/html; charset=utf-8", landing);
  if (req.method === "GET" && url.pathname === "/privacy") return respond(res, 200, "text/html; charset=utf-8", privacy);
  if (req.method === "GET" && url.pathname === "/health") return respond(res, 200, "application/json", JSON.stringify({ ok: true, name: "aperture-gift-studio", checkoutLive: false }));
  if (req.method === "POST" && url.pathname === "/api/plan") {
    try {
      let body = "";
      for await (const chunk of req) {
        body += chunk.toString();
        if (body.length > 8192) return respond(res, 413, "application/json", JSON.stringify({ error: "Input too large" }));
      }
      return respond(res, 200, "application/json", JSON.stringify({ plan: makePlan(JSON.parse(body || "{}")) }));
    } catch {
      return respond(res, 400, "application/json", JSON.stringify({ error: "Invalid JSON input" }));
    }
  }
  if (url.pathname === "/mcp" && req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, mcp-session-id, mcp-protocol-version, authorization, last-event-id",
      "Access-Control-Expose-Headers": "Mcp-Session-Id"
    });
    return res.end();
  }
  if (url.pathname === "/mcp" && ["POST", "GET", "DELETE"].includes(req.method)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
    const server = createGiftServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on("close", () => { transport.close().catch(() => {}); server.close().catch(() => {}); });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (err) {
      console.error("MCP error:", err?.message || "unknown");
      if (!res.headersSent) respond(res, 500, "application/json", JSON.stringify({ error: "MCP request failed" }));
    }
    return;
  }
  return respond(res, 404, "text/plain; charset=utf-8", "Not found");
}).listen(port, "0.0.0.0", () => console.log("Gift Studio listening on :" + port));

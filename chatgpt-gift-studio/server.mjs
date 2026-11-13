import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";

const landing = readFileSync(new URL("./public/index.html", import.meta.url), "utf8");
const widget = readFileSync(new URL("./public/widget.html", import.meta.url), "utf8");
const privacy = readFileSync(new URL("./public/privacy.html", import.meta.url), "utf8");
const giftCard = readFileSync(new URL("./public/gift.html", import.meta.url), "utf8");
const termsPage = readFileSync(new URL("./public/terms.html", import.meta.url), "utf8");
const supportPage = readFileSync(new URL("./public/support.html", import.meta.url), "utf8");
const allowedFeelings = ["gratitude", "joy", "encouragement", "wonder"];
const allowedOccasions = ["holidays", "birthday", "thank-you", "just-because", "celebration", "anniversary", "christmas", "secret-santa", "graduation"];
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
const byRecipient = [
  { pattern: /mom|mother|mum|dad|father|parent|grandma|grandpa|family/i, suggestions: [
    ["A family-memory photo print", "Choose one meaningful memory and add a handwritten explanation.", "$8–$28"],
    ["A personalized family keepsake", "A framed photograph or print can remind them of time together.", "$18–$65"],
    ["A set of handwritten appreciation cards", "Give them several specific reasons you value them.", "$4–$15"]
  ] },
  { pattern: /teacher|mentor|coach|tutor|principal/i, suggestions: [
    ["A handwritten thank-you note set", "Name one specific way they made a difference.", "$4–$15"],
    ["A thoughtful desk bookmark", "Select a design reflecting their interests, then add a personal note.", "$5–$12"],
    ["A framed gratitude print", "Celebrate the influence they have on others without assuming their tastes.", "$18–$50"]
  ] },
  { pattern: /girlfriend|boyfriend|wife|husband|partner|spouse|fianc/i, suggestions: [
    ["An illustrated memory postcard", "Highlight a shared story with an original message.", "$5–$15"],
    ["A mini printed photo album", "Tell the story of a few meaningful moments together.", "$15–$35"],
    ["A framed favorite photograph", "Pair it with a promise of shared quality time.", "$25–$70"]
  ] },
  { pattern: /child|kid|son|daughter|niece|nephew/i, suggestions: [
    ["A creative activity kit", "Choose an age-appropriate craft based on what they already enjoy.", "$10–$35"],
    ["A storybook with a dedication", "Add an encouraging inscription at the front.", "$8–$30"],
    ["A memory scrapbook", "Make space for their drawings, stories and adventures.", "$15–$45"]
  ] }
];
function estimateMax(estimate) {
  const values = [...estimate.matchAll(/\$(\d+)/g)].map(m => Number(m[1]));
  return values.length ? Math.max(...values) : Infinity;
}
function pickIdeas(recipient, budget, group, interests) {
  const match = byRecipient.find(x => x.pattern.test(recipient));
  const query = (interests || "").toLowerCase();
  const interestSuggestions = /book|reading/.test(query) ?
    [["A book with a personal dedication", "Choose a genre they already enjoy and write why you picked it.", "$10–$30"]] :
    /basketball|sport|fitness/.test(query) ?
    [["A sports-themed keepsake", "Choose a real team-neutral design and include an encouraging message.", "$8–$30"]] :
    /art|drawing|craft/.test(query) ?
    [["A small art and craft kit", "Match their skill level and preferred materials.", "$12–$35"]] :
    /plant|garden|nature/.test(query) ?
    [["A small plant or seed kit", "Check their space and preferences before choosing.", "$8–$30"]] : [];
  const fallback = [
    ["A handwritten letter", "Share a specific moment you appreciate about them.", "$1–$5"],
    ["A printed favorite photo", "Choose a happy shared memory and write a note on the back.", "$1–$5"],
    ["A handmade appreciation card", "Make something original that reflects their interests.", "$1–$5"]
  ];
  const ideas = [...interestSuggestions, ...(match?.suggestions || []), ...group.ideas, ...giftSets.flatMap(g => g.ideas), ...fallback];
  const deduped = ideas.filter((item, index, arr) => arr.findIndex(x => x[0] === item[0]) === index);
  const fitting = deduped.filter(item => estimateMax(item[2]) <= budget);
  return fitting.slice(0, 3).map(([title, why, estimate]) => ({ title, why, estimate }));
}
function createGiftMessage(args = {}) {
  const recipient = shortString(args.recipient, "someone special", 60);
  const sender = shortString(args.sender, "Someone who appreciates you", 60);
  const feeling = allowedFeelings.includes(args.feeling) ? args.feeling : "joy";
  const occasion = allowedOccasions.includes(args.occasion) ? args.occasion : "just-because";
  const customMessage = shortString(args.message, "", 240);
  const defaults = {
    joy: "You bring so much light into ordinary moments. Here's a little reminder that you matter.",
    gratitude: "Thank you for the kindness you give to the world. It makes a difference.",
    encouragement: "You have more strength and possibility in you than you know. Keep going.",
    wonder: "May today hold one lovely surprise and many reasons to smile."
  };
  const message = customMessage || defaults[feeling];
  // A URL fragment is not sent to our web server. Anyone with the full shared link can read its content.
  const shareUrl = "https://aperture-gift-studio.onrender.com/gift#" + Buffer.from(JSON.stringify({ recipient, sender, message, feeling, occasion }), "utf8").toString("base64url");
  return { recipient, sender, message, occasion, feeling, shareUrl, sent: false,
    notice: "A free interactive greeting card, not a purchased or shipped gift. Nothing is sent automatically. Anyone possessing the full URL can view its message; do not include sensitive information." };
}
function makePlan(args = {}) {
  const recipient = shortString(args.recipient, "someone important", 60);
  const occasion = allowedOccasions.includes(args.occasion) ? args.occasion : "holidays";
  const feeling = allowedFeelings.includes(args.feeling) ? args.feeling : "gratitude";
  const detail = shortString(args.detail, "", 140);
  const interests = shortString(args.interests, "", 80);
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
    recommendations: pickIdeas(recipient, budget, group, interests),
    disclaimer: "These are product concepts and illustrative price ranges, not live inventory, fixed quotes or purchase offers. Checkout is disabled until a real merchant, fulfillment, shipping, returns and taxes are verified.",
    purchaseReady: false
  };
}
const cardShape = z.object({
  recipient: z.string(), sender: z.string(), message: z.string(), occasion: z.string(), feeling: z.string(),
  shareUrl: z.string(), sent: z.boolean(), notice: z.string()
});
const planShape = z.object({
  recipient: z.string(), occasion: z.string(), feeling: z.string(),
  budget: z.number(), message: z.string(), heading: z.string(),
  recommendations: z.array(z.object({ title: z.string(), why: z.string(), estimate: z.string() })),
  disclaimer: z.string(), purchaseReady: z.boolean()
});
function createGiftServer() {
  const server = new McpServer({ name: "gift-finder-gift-giver", version: "0.2.0" });
  registerAppResource(server, "gift-studio-widget", "ui://gift-studio/plan.html", {},
    async () => ({ contents: [{ uri: "ui://gift-studio/plan.html", mimeType: RESOURCE_MIME_TYPE, text: widget }] }));
  registerAppTool(server, "make_gift_plan", {
    title: "Find personalized gift ideas by recipient and budget",
    description: "Use when someone asks for gift ideas, what to buy someone, a birthday present, Christmas gift, Secret Santa idea, anniversary gift, teacher appreciation gift, or budget-friendly presents for mom, dad, partner, friend, coach or child. Return three personalized PHYSICAL gift concepts with illustrative price ranges, a reason each fits, and a suggested card message. This is NOT a live product search, purchase, inventory check, shipment or price quote; never say we found items in stock.",
    inputSchema: {
      recipient: z.string().max(60).optional().describe("Recipient's first name or relationship (avoid sensitive details)"),
      occasion: z.enum(allowedOccasions).optional(),
      feeling: z.enum(allowedFeelings).optional(),
      budget: z.number().min(5).max(500).optional().describe("Approximate total gift budget in USD"),
      detail: z.string().max(140).optional().describe("Optional short non-sensitive memory or compliment"),
      interests: z.string().max(80).optional().describe("Gift recipient interests, for example books, sports, art or gardening")
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
  registerAppTool(server, "create_shareable_gift", {
    title: "Give a free shareable digital greeting card",
    description: "Use when someone asks to give a gift, surprise a friend, send a thoughtful message, create a birthday greeting, share a thank-you or make a personalized gift link. Creates a free interactive greeting card with a reveal moment and optional note. Returns a shareable link for the USER to send; does not send SMS, email, make purchases, ship goods or imply a paid gift. The recipient's name and note are encoded in the link fragment and readable by anyone with the link, so do not include private details.",
    inputSchema: {
      recipient: z.string().max(60).optional().describe("First name or relation, do not include sensitive details"),
      sender: z.string().max(60).optional().describe("Display name of sender"),
      occasion: z.enum(allowedOccasions).optional().describe("Reason for sending the greeting"),
      feeling: z.enum(allowedFeelings).optional().describe("Tone of the card"),
      message: z.string().max(240).optional().describe("Optional original custom note, do not include confidential data")
    },
    outputSchema: { gift: cardShape },
    _meta: { ui: { resourceUri: "ui://gift-studio/plan.html" }, "openai/toolInvocation/invoking": "Creating your shareable gift", "openai/toolInvocation/invoked": "Gift link ready" },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async (args) => {
    const gift = createGiftMessage(args);
    return {
      structuredContent: { gift },
      content: [{ type: "text", text: JSON.stringify({ gift }, null, 2) }]
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
  if (req.method === "GET" && url.pathname === "/terms") return respond(res, 200, "text/html; charset=utf-8", termsPage);
  if (req.method === "GET" && url.pathname === "/support") return respond(res, 200, "text/html; charset=utf-8", supportPage);
  if (req.method === "GET" && url.pathname === "/gift") return respond(res, 200, "text/html; charset=utf-8", giftCard);
  if (req.method === "GET" && url.pathname === "/privacy") return respond(res, 200, "text/html; charset=utf-8", privacy);
  if (req.method === "GET" && url.pathname === "/health") return respond(res, 200, "application/json", JSON.stringify({ ok: true, name: "aperture-gift-studio", checkoutLive: false }));
  if (req.method === "POST" && url.pathname === "/api/gift") {
    try {
      let body = "";
      for await (const chunk of req) {
        body += chunk.toString();
        if (body.length > 8192) return respond(res, 413, "application/json", JSON.stringify({ error: "Input too large" }));
      }
      return respond(res, 200, "application/json", JSON.stringify({ gift: createGiftMessage(JSON.parse(body || "{}")) }));
    } catch {
      return respond(res, 400, "application/json", JSON.stringify({ error: "Invalid JSON input" }));
    }
  }
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

# Gift Finder & Gift Giver (by Clearline)

A deployed ChatGPT MCP plugin for **finding thoughtful physical gift ideas** and **creating an interactive digital greeting link that the user shares**. The same app is available as a mobile-first web experience.

**Live website:** https://aperture-gift-studio.onrender.com/  
**MCP endpoint:** https://aperture-gift-studio.onrender.com/mcp  
**Recipient's reveal page:** https://aperture-gift-studio.onrender.com/gift  
**Privacy:** https://aperture-gift-studio.onrender.com/privacy  
**Support:** https://aperture-gift-studio.onrender.com/support  
**Terms:** https://aperture-gift-studio.onrender.com/terms

## Two MCP tools

- `make_gift_plan` — three illustrative physical gift concepts matched to recipient, interests, budget and occasion, with estimated price ranges and a suggested note. No retailer inventory, shopping transaction, real-time price checks or shipping.
- `create_shareable_gift` — a shareable URL for a free greeting with a recipient-visible reveal, using only optional short names and a message. The user decides whether and whom to send it to. The app does **not** send SMS/email. The shared message is inside the URL fragment and can be read by anyone who has the complete link.

## Run locally

Node.js 20+:
```bash
cd chatgpt-gift-studio
npm install --omit=dev
npm start
# server starts at http://localhost:8787
node test.mjs
```

For your own ChatGPT account, add the public HTTPS MCP endpoint via **Plugins > Add > Add custom MCP server**, no authentication. Paste "Gift Finder & Gift Giver" as the plugin name. The MCP server is a working deployment; creating a custom connection does not make the app publicly listed.

## Public directory package

A portable package is prepared under:
- `plugin.json` — brand, organic gift search intent, two real user workflows and reviewer scenarios
- `mcp.json` — stable HTTPS Streamable HTTP endpoint with no auth
- `assets/logo.svg`, `assets/icon.svg` — square vector icons
- Web pages for required product, privacy, support and terms URLs

Before submission, the owner must confirm the chosen verified publisher identity, validate support/privacy policies, test mobile ChatGPT invocations, record an accessible video walkthrough, complete domain verification (as instructed in the portal) and upload a **ZIP containing the plugin.json, mcp.json and assets folder at its root**. Public review and approval are not automatic.

### Quality and safety

- Read-only/deterministic tools, no Stripe integration, no checkout, no physical order claims
- No recipients contacted automatically and no gift-message database
- Some web server operational metadata may be retained by Render
- No fabricated sales, rankings, referrals or installs
- Keep all marketing and metadata truthful: don't keyword stuff or claim special OpenAI endorsement

### Testing

```bash
node test.mjs
node test-production.mjs
```

CI checks Node syntax, local MCP initialization, two tools, public HTTPS server routes, interactive gift link generation and dependency audit.

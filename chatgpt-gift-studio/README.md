# APERTURE Gift Maker (by Clearline)

An MCP server for **finding thoughtful physical gift ideas** and **creating an interactive digital greeting link that the user shares**. The same app is available as a mobile-first web experience.

**Live website:** https://aperture-gift-studio.onrender.com/  
**MCP endpoint:** https://aperture-gift-studio.onrender.com/mcp  
**Recipient's reveal page:** https://aperture-gift-studio.onrender.com/gift  
**Privacy:** https://aperture-gift-studio.onrender.com/privacy  
**Support:** https://aperture-gift-studio.onrender.com/support  
**Terms:** https://aperture-gift-studio.onrender.com/terms

## MCP tools

- `make_gift_plan` — three illustrative physical gift concepts matched to recipient, interests, budget and occasion, with estimated price ranges and a suggested note. No retailer inventory, shopping transaction, real-time price checks or shipping.
- `create_shareable_gift` — a shareable URL for a free greeting with a recipient-visible reveal, using only optional short names and a message. The user decides whether and whom to send it to. The app does **not** send SMS/email. The shared message is inside the URL fragment and can be read by anyone who has the complete link.

The repository also implements two tools awaiting deployment to the hosted server. Their browser experiences are already available through the included gift guide.

- `create_holiday_postcard` — prepares a printable holiday card link, a blank two-design PDF and an unsent subject/body. Anyone with the full link can read the included note.

- `find_catalog_gifts` — ranks existing APERTURE digital offers by recipient, interests, occasion and budget, returning a price and listing for each. A zero budget returns free options.

Partner sites can copy the [postcard maker embed](https://singhpratik44.github.io/clearline-portfolio/gifts/embed/) or link to the full-page maker. An authorized website owner installs the snippet. Sending through a connected Gmail or other messaging app is a separate action for a chosen recipient.

## Run locally

Node.js 20+:
```bash
cd chatgpt-gift-studio
npm install --omit=dev
npm start
# server starts at http://localhost:8787
node test.mjs
```

For your own ChatGPT account, add the public HTTPS MCP endpoint via **Plugins > Add > Add custom MCP server**, no authentication. Paste "APERTURE Gift Maker" as the plugin name. The MCP server is a working deployment; creating a custom connection does not make the app publicly listed.

## Public directory package

Download the [v1.2.0 directory package](../plugin-build/aperture-gift-maker.zip). Its root contains the following files from this directory.

- `plugin.json` — brand, organic gift search intent, gift planning and card creation workflows and reviewer scenarios
- `mcp.json` — stable HTTPS Streamable HTTP endpoint with no auth
- `assets/logo.svg`, `assets/icon.svg` — square vector icons
- `skills/make-a-gift/SKILL.md` — free activities, group cards and holiday exchanges

Before submission, the owner must confirm the chosen verified publisher identity, validate support/privacy policies, test mobile ChatGPT invocations, record an accessible video walkthrough, complete domain verification (as instructed in the portal) and upload a **ZIP containing plugin.json, mcp.json, assets and skills at its root**. Public review and approval are not automatic.

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

CI checks Node syntax, local MCP initialization, core tools, public HTTPS server routes, interactive gift link generation and dependency audit.

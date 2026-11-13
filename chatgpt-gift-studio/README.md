# APERTURE Gift Studio — ChatGPT MCP plugin

An actual runnable, read-only ChatGPT gift planning plugin and mobile-first public demo from Clearline. This version generates **three physical-gift concepts** and a short personal message, for free. It does not use an LLM API, collect payments, promise stock, store input, require sign-in or initiate outreach.

## Run
Node.js >=20:
- cd chatgpt-gift-studio
- npm install
- npm start
- Open http://localhost:8787 and http://localhost:8787/health
- Test the POST /api/plan endpoint with a JSON body such as {"recipient":"my mentor","budget":30,"feeling":"gratitude","occasion":"holidays"}.

## ChatGPT setup
Deploy on a server with public HTTPS. In ChatGPT Plugins, select **Add custom MCP server**, enter the exact \`https://YOUR-HOST/mcp\` endpoint, review permissions and connect. Call \`make_gift_plan\` from the new plugin. The tool returns structuredContent and a lightweight MCP Apps UI card. This requires account eligibility and user-controlled setup. **Not submitted to the public plugin directory.**

## Monetization architecture
The plugin remains a useful free tool. Current OpenAI plugin rules permit commerce only for **physical goods**. Digital goods, consulting services, subscriptions, and paid upgrades must not be marketed or transacted inside this plugin. The preferred route is to establish a verified physical goods supply (e.g., print-on-demand postcards/prints with real SKU, costs, shipping zones, refunds/returns), then place a merchant-owned external checkout behind an explicit inventory/fulfillment readiness gate. Do not enable a checkout merely because a Stripe link exists.

For selling Clearline's AI workflow or custom-plugin installation service, market independently through Clearline's own website and opt-in business outreach; do not pitch or route to that digital service from this plugin.

## Readiness checklist
- [x] Deterministic gift plan and public mobile-first preview
- [x] Read-only MCP tool and optional visual card
- [x] No checkout, no misleading availability
- [x] Privacy notice and no app-side input persistence
- [ ] Verify HTTPS /mcp live from ChatGPT
- [ ] Test MCP Inspector / client init + tool call
- [ ] Configure a dedicated support email and terms
- [ ] Verify maker/fulfillment and real physical product prices
- [ ] Review sales tax / shipping / refund / delivery policies
- [ ] Test mode purchase and payment-confirmed fulfillment
- [ ] Developer verification and directory approval

Marketing hypotheses are not revenue data. Record actual visits, plan generations, opted-in leads, confirmed orders, gross receipts, fees and refunds separately.

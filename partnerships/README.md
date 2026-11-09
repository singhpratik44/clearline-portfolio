# APERTURE Partnership OS — market-to-contract workflow

Live route after publication: https://singhpratik44.github.io/clearline-portfolio/partnerships/

## Why this replaces the first USPA-centric concept

The first prototype was a presentation built around one hypothetical school's partnership. It was not a real partner acquisition or contracting workflow. A fictional student schedule looked impressive but did not solve Manny Iloba's actual interest: **evaluating a potential referral relationship**.

This second system is deliberately *not* a fake CRM, artificial athlete portal, or autonomous mailer. It answers five operational questions:

1. **Who?** Ten public partner programs, each backed by an official primary source and research date.
2. **Why them?** A counterparty-specific hypothesis, fit reasoning, defined unknowns and first step.
3. **What to sell?** A paid audit, 90-day operator pilot, or conditional referral arrangement, with a user-controlled gross rate/hours model.
4. **How to advance?** Evidence-gated operator stages, authorization confirmation and written-agreement gate. Every claim of progress is labeled *self-reported* and requires a reference.
5. **How to leave an audit trail?** Source CSV export, local decision ledger, pipeline JSON export, and human-approved commercial drafts.

The existing USPA proof-of-concept at `partnerships/uspa/` is retained for historical continuity and labeled as an independent concept. Do not confuse it with a signed USPA agreement or production student service.

## Architecture

- `index.html` — accessible, navigable mission control
- `catalog.js` — versioned public source data; official organization landing pages, not scraped/guessed personal email addresses
- `os.css` — responsive editorial/enterprise visual language
- `os.js` — deterministic local client state, filters, deal desk, evidence gates, proposal generation and file export
- `tests/static.cjs` — syntax/source/invariant tests
- `tests/browser.mjs` — Chromium desktop/mobile end-to-end interactions
- `.github/workflows/partnership-os.yml` — isolated CI (does not interrupt existing Career OS)

No account login, database, hosted APIs, LLM API keys, CRM sync, Gmail connection, or third-party script. The app runs entirely in a public GitHub Pages static folder. Partner notes remain in **localStorage on the device** and are not synchronized across devices. Anyone with the same browser profile may see them; do not enter confidential business terms or identifying student/family details.

## Commercial model: differentiate earned fees from public affiliate terms

- Published affiliate percentages / stipends are recorded only as claims on the provider's official program page; eligibility, contractual scope and payout are unverified.
- The hourly-rate calculator is a **proposal pricing tool**, not an income projection. It multiplies gross target rate by estimated effort and excludes overhead, tax, costs and contract negotiation.
- The order of work is *source → qualify → approve → correspond → negotiate → agreement → pilot*. No action in this repository sends correspondence.
- "Self-reported outreach" counters record operator classifications only, never pretend messages were sent or recipients replied.

## Manual status and evidence gates

Stages: Research, Qualified, Outreach Authorized, Outreach Sent, Reply Received, Commercial Negotiation, Signed Agreement.

Advancement requires at least a reference and meaningful notes. Statuses at/after authorization additionally require explicit operator confirmation that outreach is authorized. Signed requires a separate signed-agreement confirmation. These browser checkboxes **do not authenticate authorization**; a production version requires independent evidence capture.

## Production gating

Before real partners can be managed in production:

1. Implement a private authenticated server and role-based permissions.
2. Store signed-scope/consent evidence with immutable provenance (or reference to audited external system).
3. Connect provider-approved Gmail/CRM workflows with authorization and user approval before any external send.
4. Establish contract economics and sign-off for commission, retainers, territory rights, IP, and data ownership.
5. Implement source refresh/review cycles with stale/removed opportunity detection; catalog reviewed 2026-11-09 can go stale.
6. Keep minors' personal, educational and medical information out of the system until legal privacy and data-protection review.
7. Publish measurable outcomes only after independent verification, not mere status toggles.

## Smoke tests

```bash
node --check partnerships/os.js
node --check partnerships/catalog.js
node partnerships/tests/static.cjs
```

Browser checks (requires Playwright and Chromium):
```bash
npm install --no-save --no-package-lock playwright
npx playwright install chromium
node partnerships/tests/browser.mjs
```

## Research methods

All data is referenced to public pages reviewed November 9, 2026. Do not infer approval, contract availability, active headcount, or verified commissions from a generic partnership landing page. The scores are independent APERTURE fit judgments based on the operator's stated background, not ratings from each organization.

USPA's November 2026 email reply is not copied into this **public** repository; correspondence and contracts must stay in private systems.

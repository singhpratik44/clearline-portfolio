# APERTURE SPORTS — athletic career operating system (public V1)

**Demo URL (after Pages deployment):** https://singhpratik44.github.io/clearline-portfolio/sports-os/

## Implemented

- Four independently modeled career tracks: coaching, mental performance, scouting/analysis and sports operations.
- Five selectable stages per track, with keyboard-accessible SVG graph and time-horizon scrubber.
- Deterministic 30/60/90-day development plans personalized by starting background, sport, selected pathway and weekly capacity; TXT download and clipboard copy.
- Basketball practice architect with age, focus and duration, exportable drills; links to the existing APERTURE Arena.
- Hypothetical club capacity simulator with editable coach count, athletes per coach and weekly sessions.
- In-memory, session-only self-reported evidence ledger with JSON export and removal.
- Clearly differentiated mental performance education vs licensed clinical sport psychology.
- Responsive layout, reduced-motion support, skip link and labeled controls.

## Limits / safeguards

This is a **public functional prototype**, not an authenticated SaaS, job board, verified labor market source, clinical service, scouting database or working payments platform. No live job listings, employer access, user accounts, AI API, server-side data storage, external prospect contact, booking or Stripe checkout is implemented. No sensitive athlete or patient information should be entered. Nothing is sent to a server by application code. Any entered evidence is self-reported and not externally verified. Exported files are the user's responsibility to protect.

Career timelines are illustrative **stages**, not a promise of advancement. Credentialing, role requirements, professional titles, legal and clinical scopes, working-with-minors safeguards and income need independent verification.

The simulator computes *weekly participant-slots*, not unique athletes or safe staffing ratios.

## Governed expansion

1. Validate the first 3–5 coaches/organizations with consent-based feedback. Avoid collecting private athlete records in a static website.
2. Research official bodies for up-to-date licensure and certification mapping (jurisdiction-specific). Require review by qualified professionals.
3. Build a consent-aware authenticated backend, data-minimization rules, access controls, account deletion and audit logging before accepting personal profiles or private journals.
4. Connect official job requisitions and employer directories only with source URLs, freshness, correction flows and explicit evidence / outreach approval gates. No automatic submissions.
5. Add booking, Stripe integration and professional marketplace only after identity, compliance, service/refund policies, abuse reporting and merchant onboarding are implemented and tested.

## QA and deployment

Run the deterministic contract and interaction suite:

\`\`\`bash
node --test tests/sports-os.test.mjs
\`\`\`

The existing Pages workflow must stage the entire \`sports-os/\` directory and run this test. Updates preserve existing APERTURE modules and all other directories.

Source of truth: this repository. This module does not depend on an external service to render.

## V2 — Opportunity Intelligence + Professional Portfolio + Services Studio

**Navigation / public routes**
- \`/sports-os/opportunities.html\` — filter official-source sports opportunities by role type, arrangement and source verification; export a session-only shortlist.
- \`/sports-os/profile.html\` — create a private self-reported professional summary; download a locally generated HTML portfolio or JSON. Claims are never marked verified.
- \`/sports-os/marketplace.html\` — select a proposed APERTURE service concept and build a scoped request for review; download or copy the brief, without submitting or accepting an offer.

**Source of truth and ATS refresh**
- \`sports-os/sources.json\` contains a narrowly curated set of official employer links, exact Greenhouse board names and requisition IDs where applicable, and the date each posting was manually observed.
- \`sports-os/refresh_opportunities.py\` checks only approved public Greenhouse API URLs, with timeouts and bounded response sizes. It requires an exact requisition ID and title and approved Greenhouse ATS hostname before marking \`confirmed-active\`. 404 results are marked \`not-found\`; transient failures and unsupported sources are \`review-required\`.
- The GitHub Pages build creates \`_site/sports-os/opportunities.json\` from that read-only verifier on every Pages release (including the scheduled daily workflow). The checked timestamp and verdict travel with each record, and front-end \`confirmed-active\` status expires after seven days. Nothing silently contacts employers.
- Research-only directory links are not represented as verified active individual vacancies.
- The app never downloads CVs, accesses user email, applies, sends outreach or runs a credentialing decision.

**Status and commercial limits**
- V2 is a **functional public research and drafting tool**. No real authenticated user accounts, server-side profiles, licensed-professional onboarding, payments, Stripe checkout, availability calendar, signed contracts, clinical services or marketplace matching are in production.
- Marketplace products are proposal templates with no price or service fulfillment promise. Explicit provider authorization, terms, pricing, secure payment handling, user consent, qualification verification and child safeguarding checks must precede paid launches.
- The portfolio editor stores data in JavaScript memory only. User-initiated downloads persist wherever the user saves them. Do not input sensitive athlete, patient, financial or minor-identifying data.

**QA**

\`\`\`bash
node --test tests/sports-os.test.mjs
python3 -m unittest discover -s sports-os -p test_refresh_opportunities.py -v
python3 sports-os/refresh_opportunities.py --offline --output /tmp/aperture-sports-preview.json
\`\`\`

CI additionally exercises real Chromium mobile and desktop journeys in \`tests/site-browser.mjs\` and verifies the published HTML, JS and status feed after Pages deploy. The live data gate must report \`review-required\` rather than claiming active if the ATS cannot be queried.
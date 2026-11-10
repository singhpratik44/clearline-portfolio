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
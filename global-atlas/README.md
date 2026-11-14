# APERTURE Global Atlas — isolated integration preview

## User-approved scope
Ten architecture choices were accepted using the recommended defaults. Decision 6 merges ALL THREE CS scopes: (a) K–12 to career pathways, (b) youth robotics, gaming and AI literacy, and (c) advanced CS research, engineering and AI agents.

This is a **public-data preview**, not a connected production operating system. Existing APERTURE pages and all six Protecting the Center instruments remain intact; this branch adds a new page and two navigation links.

## Current functional modules
- Responsive 2D world map via Leaflet and OpenStreetMap map tiles; mobile-friendly.
- Optional WebGL 3D globe, loaded on request only with a fallback to 2D.
- Geographic jump buttons (Orange County, Bay Area, New York, London, Singapore, Sydney) and manual geographic search.
- On-demand public community-POI search of the currently visible *city-scale* bounding box via Overpass, capped at 400 source records. Layer filters: schools/colleges/universities, sports venues, named coding/STEM spaces and libraries.
- Map pins, browsable record list, selected record information, OSM evidence link, website link (when supplied by the source).
- Hypothetical scenario mode: up to 12 dashed lines showing locations within 5 km across the school and sports/coding layers, clearly marked as **not affiliations**.
- Local-only CSV export of currently loaded public results with source status. Safeguards against spreadsheet-formula injection.
- Draft intro-request text copied to clipboard; **no outreach or messages are sent**.
- Computer science continuum: introductory coding/robotics, K–12 and college CS, professional engineering/cyber/data/cloud, research and AI agents, applied sports/education projects.
- Existing governance instruments remain live at their original links.

## Source/provenance rules
OpenStreetMap is community-contributed and licensed under ODbL. A map location is not an authorized partner, current program, or trustworthy contact until individually verified. The user's theCoderSchool / Code Ninjas history is framed as past operating experience; no official network endorsement is claimed. USPA should not appear as an approved partnership until written authorization/compensation/outreach rules are confirmed.

No personal student data is present. Individual student/mentor points must never appear without privacy permissions and age-appropriate safeguards. The user must approve consequential outreach, affiliations, partner listings and production releases.

## QA checklist (manual browser testing REQUIRED before merge)
1. Open `global-atlas/index.html` on iPhone Safari and desktop Chrome, verify OSM map tiles and credits appear.
2. Tap "Orange County"; map should center near Santa Ana. Pan and pinch-zoom.
3. At zoom >= 9, select "Find places"; check real live POI pins and list load, or graceful service failure.
4. Turn on/off all four layers; verify both list and pins update with no stale markers.
5. Select a place; check record link, listed website (if any), and absence of endorsement claims.
6. Enable scenario mode; confirm nearby candidate pairs show a count and dashed lines, and toggle off cleanly.
7. Load 3D; if WebGL is unavailable verify useful error and accessible 2D fallback.
8. Search "London, UK"; verify geographic jump; do not test excessive automated searches on public APIs.
9. Check all five CS stages and six governance links.
10. Check CSV export, clipboard copy, keyboard navigation, portrait mode at 375px and reduced-motion.
11. Verify existing APERTURE home, store, learning, and athlete pages unchanged except new Global Atlas navigation.
12. Verify CSP, third-party API/service terms, data freshness, and quota planning before production.

## Deferred
Not yet implemented: permissioned APERTURE organization database, verified partners, real introductions, live admissions, student accounts, governance-ledger/API connections, enterprise billing, true enrollment conversions, and predictive scenario simulations. These require separate authorization, integrations, testing and data governance. The current map's geographic pairing is a proximity exploration tool, not an outcome model.

## Learning Economics extension (November 14, 2026)

The same isolated branch adds `learning-economics/index.html` and connects it to the APERTURE homepage and atlas sidebar.

### Official USPA prices (public source: https://gouspa.org/truth-in-tuition/)
- Middle school grades 6–8: $17,140 full academic year; $9,430 one semester; $50 application fee.
- High school grades 9–12: $19,490 full academic year; $10,540 one semester; $50 application fee.
- Individual courses and summer/accelerated: $1,650 per credit/course; $3,250 with Learning Coach; up to 2 individual courses concurrently.
- Application fee for individual courses is not listed on the cited tuition page; calculator does not invent one.
- The only live APERTURE coding payment product evidenced in repository is the existing general $65 private coding and game-development lesson at `learning/book/`. Proposed bundle scenarios ($60/hr for 5 hours, $55/hr for 10, $50/hr for 20) are NOT live or separately purchasable until approved and connected.
- A combined budget calculator is arithmetic only; no integration, enrollment or authorized partnership with USPA is asserted.
- The user controls coaching hours, estimated self-directed baseline and optional hourly value-of-time. Difference is an input-driven assumption, NOT measured time saved or an earnings projection.

### Success stories with responsible provenance
- Public record: https://www.congressionalappchallenge.us/22-ca15/ identifies Tvisha Choubey as 2022 CA-15 winner for Happy Hub. Public award proven; connection to user's coaching is NOT independently proven and must not be asserted.
- Founder-reported biology app project: identity withheld and anecdote kept in draft state until evidence and publication consent.
- A local-only CSV interface accepts up to 2,000 records for review, includes a blank 125-row template (NOT 125 success claims), requires source URL + documented consent for review-ready candidates, and exports JSON explicitly marked unpublished. It does not store or upload student data.
- Before releasing any named case study, confirm relevant student / guardian permission as appropriate, verify project artifacts and claims, and avoid reuse of any former-employer's confidential student records.

### Additional testing before any merge
- Test tuition selection across full year, semester, 2 semesters, individual and accelerated courses, and the Learning Coach toggle.
- Test coding 1/5/10/20-hour scenarios, skill changes, hours baseline, optional value of time and combined totals.
- Test CSV parser with quoted commas, malicious spreadsheet formulas, zero records, missing headers, large uploads and consent/source gating; confirm no server requests from user-imported story data.
- Test links to official USPA pricing and the actual existing $65 checkout; ensure proposed bundles have no payment button.
- Verify under-18 content approval and accessibility. Review all live external links.

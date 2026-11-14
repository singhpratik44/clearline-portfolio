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

# Clearline Portfolio v8.0 — Full critique implementation

## Why these files exist
The connected GitHub account does **not** have write access to `singhpratik44/clearline-portfolio`.  
Push these files yourself from an account that owns the repo.

## Files to add/replace

| File | Action |
|------|--------|
| `implementation.html` | **NEW** — CLG-07 Implementation Record (theCoderSchool, Code Ninjas, Kaiser) |
| `hire.html` | **NEW** — Employer / recruiter entry |
| `engage.html` | **NEW** — Consulting client entry + contact form |
| `invest.html` | **NEW** — Investor / partner entry |
| `index.html` | **REPLACE** — Use the v8 index (see below for how to get it, or apply the checklist) |

## How to push

```bash
cd clearline-portfolio   # your local clone
# copy the four new HTML files into the repo root
git add implementation.html hire.html engage.html invest.html
# then replace index.html with the updated version (or apply the checklist edits)
git add index.html
git commit -m "v8.0: fix simulated framing, Field Record, audience doors, CLG-07, validation badges"
git push origin main
```

GitHub Pages will update within ~1 minute.

## Checklist if you edit index.html manually (instead of full replace)

1. **Banner language (docmeta)**  
   Change:  
   `Data status: simulated unless expressly cited`  
   To:  
   `Live architecture demonstration · Canonical state recomputed at render · Historical data: actual where cited; projections: modeled`

2. **Headline (h1)**  
   Change to:  
   `Operating Systems for Governed Multi-Unit Networks — Architecture, Implementation, and Economic Control`

3. **Audience entry cards**  
   Insert three cards (Hire / Engage / Invest) linking to hire.html, engage.html, invest.html right after the sub-paragraph and before the search bar.

4. **Validation badges**  
   On each system card add a badge, e.g.:  
   - CLG-01: `Architecture deployed at theCoderSchool · Seed data: modeled`  
   - CLG-02: `Architecture deployed at Code Ninjas / Mags · 348-unit seed: modeled from public FDD`  
   - CLG-04: `Architecture in development · Seed: modeled · Highest-value IP`  
   - CLG-07 card linking to implementation.html

5. **Field Record section**  
   Between Article I grid and Article II, add a “Field Record — Documented Results” block with the three deployments (theCoderSchool, Code Ninjas, Kaiser) and links to CLG-07.

6. **Register**  
   Bump instruments to 7, version to 8.0, add CLG-07 line.

7. **CLG-04 title on main card**  
   Rename to: `Governance Architecture for Agentic AI`

## CLG-02 (unit-defense.html) — economics lead (optional quick edit)

In the header tagline or first KPI area, surface:  
`Modeled opportunity: $1.36M/year in additional royalty at 400 units from unit-economics improvement alone.`

Move the economic valuation section higher (right after posture / gates) if you want the full restructure from the critique.

## CLG-04 (self-review.html) — framing (optional)

- Title / H1 → `Governance Architecture for Agentic AI — CLG-04`
- Add a short threat-model line near the top: e.g. lack of operational governance for agentic AI in finance / enterprise contexts.
- Emphasize: Proposal-only authority. Every irreversible action holds at a named human gate.
- Keep ISO/IEC 42001 + NIST AI RMF mapping as the hero table.

## After push

Visit:
- https://singhpratik44.github.io/clearline-portfolio/
- …/hire.html
- …/engage.html
- …/invest.html
- …/implementation.html

Confirm the new banner language and Field Record appear on the main page.

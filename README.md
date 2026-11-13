## Public website (November 2026)

**APERTURE Experiences & Innovation:** [Main public homepage](https://singhpratik44.github.io/clearline-portfolio/) · [Render deployment](https://aperture-main-website.onrender.com/)

The homepage is a responsive, no-sign-in discovery site with twelve linked experience, learning, and innovation projects, live client-side category/search filtering, and accessible navigation. The earlier APERTURE v5 decision workbench is preserved at [previous-home.html](./previous-home.html). Original project URLs are unchanged.

**Deployment:** GitHub `main` is the source of truth; the Render static site `aperture-main-website` auto-deploys from this repository. GitHub Pages publication is configured separately. The homepage is static and does not process payments or store customer information. Individual paid offerings must be verified independently before promotion.

**Verification:** All 18 internal homepage link targets resolved in the GitHub repository on November 13, 2026; Render reported a successful live deployment. An independent browser fetch of the public URLs was not available in this environment, so production browser/visual QA remains open.

---

# Clearline — APERTURE Operating Intelligence

**[NEW: Experience Layer v2 — Awareness · Joy · Love · Wonder](https://singhpratik44.github.io/clearline-portfolio/experience/)** — Four free, private interactive journeys. No sign-in, tracking, streaks or pressure. [Editable source](./experience/).\n\n**Mission:** Make consequential organizational decisions explainable, testable, authorized, recoverable, and more efficient through one versioned operating model.

**[Live portfolio](https://singhpratik44.github.io/clearline-portfolio/)** · **[Coaching journey: Faith × APERTURE](./coaching-journey.html)** · **[Sports & Media case study](https://singhpratik44.github.io/clearline-portfolio/sports-media.html)** · **[Interactive Decision Universe (development source)](./interactive-decision-universe.html)** · **[Jason Rules](./jason-rules.html)** · **[Thinkverse work sample](./thinkverse-jason-rules.html)** · **[Architecture and goals](./docs/MASTER_PLAN.md)**

**A Quiet Journey — guided three-year reflection**: [Explore the free living journey](https://singhpratik44.github.io/clearline-portfolio/prayer/three-year/) · [Try a printable sample month (free)](https://singhpratik44.github.io/clearline-portfolio/prayer/three-year/companion/sample.html) · [36-month Companion Workbook ($29 one-time)](https://singhpratik44.github.io/clearline-portfolio/prayer/three-year/companion/shop.html). Personal planning materials only; not a substitute for religious guidance, counseling, or spiritual authority. The core journey and Gurbani links remain free.

> Status: the public APERTURE hub and Civilization Lab prototype are published via GitHub Pages. Core interactions remain local/illustrative; ten AI roles are defined specifications, not running agents. The reversible representation work is classical computation and does not demonstrate quantum advantage.

## New: Mission Operations work sample (November 2026)

- **[Launch Mission Operations](https://singhpratik44.github.io/clearline-portfolio/mission-operations.html)** — three interactive simulated exercises covering sports-media delivery, technical partnership integration, and physical-AI event activation. Requires human approval before a sandbox dry run; exports local JSON evidence. All scenarios and metrics are illustrative, not employer deployments.

## Start here (November 2026)

- **[APERTURE homepage](https://singhpratik44.github.io/clearline-portfolio/)** — newly organized index of 19 public projects, search and domain filters.
- **[Civilization Lab](https://singhpratik44.github.io/clearline-portfolio/civilization-lab.html)** — linked systems, deterministic simulations, evidence, preflight review and local decision exports.
- **[Basketball academy](https://singhpratik44.github.io/clearline-portfolio/basketball.html)** and **[Sports & Media](https://singhpratik44.github.io/clearline-portfolio/sports-media.html)** — sport-specific operating demonstrations and research.
- **[Clearline register](https://singhpratik44.github.io/clearline-portfolio/clearline/)** — original portfolio and operating instruments.
- **[Public source and GitHub Actions](https://github.com/singhpratik44/clearline-portfolio/actions)** — inspect changes and validation results.

Every root and nested HTML showcase loads the shared, keyboard-accessible navigation from `assets/aperture-shell.js` without rewriting its original application logic. The former homepage's missing `app.bundle.js` dependency has been removed. `sitemap.xml` and `404.html` support discovery and recovery. Fast checks run via `node --test tests/site-integrity.test.mjs`; Chromium browser journeys are in `tests/site-browser.mjs` and the existing validation workflow.

**Truth boundary:** A page being publicly hosted does not mean an agent is deployed, a publisher granted permission, private integrations are connected, or a simulated outcome occurred.

## Coaching journey and scripture-guided basketball (November 2026)

The [coaching journey](./coaching-journey.html) describes Pratik “Parry” Singh’s actual high-school basketball background, youth coaching with SoCal Elite Sports in 2026, and education leadership. Personal coaching reflections draw respectfully from Sri Guru Granth Sahib Ji (Ang 1) and the Holy Bible (Proverbs 27:17, KJV), distinguishing the traditions instead of treating them as identical.

The embedded practice builder is a deterministic, illustrative 45/60/75-minute session planner. It does not collect athlete profiles, assess minors, access private coaching data, or claim demonstrated player outcomes. From the portfolio home and the existing basketball instrument, navigation links connect this personal narrative to APERTURE coaching and governance prototypes.

## Sports media and basketball audience growth (November 2026)

The public [APERTURE Sports & Media portfolio](./sports-media.html) presents an independent publisher-growth research proposal, an illustrative monthly advertising contribution calculator, a 30-day Lakers/Clippers audience experiment, and labeled basketball creative and operations demonstrations.

**Evidence boundary:** The publishing proposal is not commissioned, and no revenue or audience results are claimed. The Kobe narrative is AI-assisted creative work and not represented as human-only editorial content. Published journalism must comply with each outlet's editorial rules. The prototype cannot access private publisher analytics without permission.

## One organized system

| Layer | Responsibility | Truth boundary |
|---|---|---|
| Clearline | Portfolio, methodology, organization-specific experiences | No invented outcomes |
| APERTURE | Universal decision/governance kernel | Canonical versioned state |
| Operating worlds | Franchise, center, education, staffing, growth, jobs | Explicit domain assumptions |
| Decision router | Rule → targeted AI → simulation → authorized human | Agents propose; never self-approve |
| Dependency graph | Prerequisites, critical path, blast radius | Reject invalid transitions |
| Evidence and ledger | Supporting facts, decisions, replay, rollback | Append-only durable storage is planned |
| Jason/QIH research | Reversible representations, equivalence and tests | Hypotheses separate from verified results |
| Interface | Interactive universe, scenario comparison, mobile | Same model across views |

## Try the prototype

Open `interactive-decision-universe.html` through a local static server, because its ES module import requires HTTP rather than `file://`. No API key or build step is required. Example: `python3 -m http.server 8000` from the repository root, then open `http://localhost:8000/interactive-decision-universe.html`.

Run the deterministic research tests with `node --test research/representation.test.mjs` (Node.js 20+). CI configuration is in `.github/workflows/clearline-validation.yml`.

The [Jason Rules page](./jason-rules.html) turns the research boundary into an operational evaluator. The [Thinkverse work sample](./thinkverse-jason-rules.html) adapts it to district partnerships, educator trust, bounded pilots, adoption dependencies, and evidence before scale.

## Current verified implementation scope

- Standalone illustrative trial-to-enrollment simulator with capacity, follow-up, conversion, revenue and three alternatives.
- Shared versioned state encoding/decoding, round-trip certificate, operational calculation invariants and automated tests.
- Decision log in current page memory, export to JSON, bounded undo for button-driven scenario actions.
- No production persistence, real-time provider connections, agent execution, quantum advantage, or formal verification of causal impact is claimed.

## Change discipline

1. Audit the existing implementation and preserve production.
2. Create an isolated branch and record assumptions.
3. Implement the smallest useful capability.
4. Test invariants, mobile interactions, regression and security boundaries.
5. Review evidence and human authorization before merging.
6. Record results and maintain a rollback path.

See [MASTER_PLAN](./docs/MASTER_PLAN.md) for the goal hierarchy, milestones, and acceptance criteria.

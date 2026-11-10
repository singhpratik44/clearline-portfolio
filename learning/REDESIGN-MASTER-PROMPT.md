# APERTURE Learning — Three-Pass Master Prompt (Nov 2026)

## The outcome

Rebuild APERTURE Learning into the most coherent, credible and operationally honest version of the product: a parent-friendly pathway marketplace for live personalized coding, AI literacy, game development and STEM instruction. Keep existing portfolio sites and the separate prayer journey intact.

A parent should understand **what is taught, who teaches it, what a child makes, what it costs, and what happens next**, without navigating five unrelated demos.

## Pass 1 — Simplify the customer journey (3× clearer)

Create one memorable experience with exactly six top-level chapters:

**Discover a subject → Understand the pedagogy → See a project → Verify the instructor → Choose a lesson → Observe real progress.**

- Homepage: a single promise, project example, visible price and one primary CTA.
- 20 subjects: a searchable, filterable, mobile-friendly catalog built from one canonical source file (`learning/subject-catalog.js`).
- Each subject: a short human-readable card, an example project and two links: explore roadmap; review booking.
- A parent should never encounter a made-up review, partnership, curriculum certification, staffed subject, mastery figure, or guaranteed student outcome.
- The main website is marketing and navigation; the private portal is not activated until backend security and child-safety work is complete.
- Link interactive 4D learning map as an optional deeper experience rather than using it to interrupt basic enrollment.

## Pass 2 — Create a truthful subject-specific Stripe pathway (3× more useful)

For each of the 20 canonical specializations, create a **distinct public APERTURE handoff URL**:

`https://singhpratik44.github.io/clearline-portfolio/learning/book/?track=<subject-id>`

The handoff must:
1. Show the exact subject and age suitability; update dynamically when the parent changes interest.
2. Offer a coach-availability inquiry with the subject embedded in the email *before payment*.
3. Explain the 60-minute, $65 single-lesson scope and the lack of automatic scheduling.
4. Reveal the **existing** Stripe Buy Button only after an adult confirms actual availability, scope and terms.
5. Clearly disclose that the Stripe product remains the same general coding/game-development lesson and that the subject selection is **not automatically sent to Stripe**.
6. Never claim 20 distinct Stripe products or Payment Links have been created when only one is verified.
7. Treat one-off quantity purchases as multiple lessons at $65 each, with no invented pack discounts.
8. Do not show a weekly recurring Buy Button before Stripe has a separate recurring price/link, confirmed terms, cancellation and scheduling.
9. Avoid any child-name, birthday, medical or school data in public URLs, Google Analytics, ads or GitHub.

**Current merchant/account constraint:** The connected Stripe session exposes only a live account labeled Clearline Code, with no links listed. The existing public Buy Button in the source code was generated from the user's APERTURE Learning Stripe Dashboard. Do not generate twenty new live links under the wrong merchant. The correct merchant must be selected and tax obligations confirmed before separate payment-link creation.

## Pass 3 — Make it defensible, marketable and ready to deliver (3× more operational)

**Education:** Live instructor-led, project-based goals, tested artifacts, explanation and parent feedback. Age, experience and learning readiness shape the curriculum. Ten public 2026 research studies inform design hypotheses, not claims about APERTURE results.

**Trust:** Founder background in theCoderSchool and Code Ninjas leadership is presented as personal experience, not an affiliation or corporate endorsement. Former coaches can be invited only once participation, availability, qualifications, compensation and safeguarding procedures are verified.

**Operations:** Publish clear written scheduling, rescheduling, cancellation and refund policies, contact details, reasonable response windows, safeguarding and guardian consent procedures. Use a secure database with tested RLS for actual minor data. Payments should reconcile to confirmed bookings without exposing student PII.

**Marketing:** Start with staff capacity, then warm referrals and permitted Orange County parent groups; list eligible programs on ActivityHero, explore a compliant Nextdoor Business Page, investigate Outschool requirements, and offer useful demos to authorized PTA and school contacts. Avoid bulk unsolicited parent outreach, child profiling, invented storefronts or unsupported "world's #1" claims. Begin paid ads only after lesson fulfillment works.

**Measurement:** Count qualified *adult* inquiries, appointments confirmed, valid Stripe payments, lessons fulfilled, permissioned reviews and subsequent bookings. Keep audience metrics aggregate and avoid tracking individual minors.

## Acceptance tests / definition of done

- Homepage contains a clear singular promise and six-chapter narrative; no duplicated pricing sections.
- All 20 tracks have consistent stable IDs and working path-to-book links.
- Each book page uses the one known public Buy Button, not a fabricated Stripe URL.
- Checkout stays gated for 4–6 and unsuitable/advanced age combinations.
- All JS scripts parse; all DOM IDs used by scripts exist.
- Privacy portal remains closed until authorized backend setup is verified.
- Research methodology, portfolio preview, 4D map, school partnership and marketing pages remain connected without broken links.
- Site is mobile-friendly, respects `prefers-reduced-motion` and has accessible labelled controls.
- CI verifies the actual deployed files, not only the repo source. Public deployment should be independently verified before claiming live functionality.
- Outcome metrics and testimonials are never invented; all paid offers describe real deliverables.

**Work cycle:** Inspect → Simplify → Build → Check → Test → Deploy → Verify → Improve. Only deploy changes preserving unrelated APERTURE websites and the separate prayer experience.

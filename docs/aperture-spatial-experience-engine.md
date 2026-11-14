# APERTURE Spatial Experience Engine — Product & Build Specification

Status: proposed module; not yet implemented or publicly deployed.
Source: user-provided architectural walkthrough screenshots (November 14, 2026).

## Objective
Create reusable, mobile-first interactive 3D experiences with verified source geometry, accessible controls, client-ready sharing and a measurable commercial workflow. Initial vertical: pre-construction residential walkthroughs. Reuse the engine for sports arenas, classrooms, gifts and other APERTURE experiences only after a tested pilot.

## Seven-stage pipeline
1. **Interpret source** — ingest a floor-plan image/PDF; extract room names, dimensions, openings, stairs and wall heights. Flag ambiguous or missing measurements. Never invent exact dimensions.
2. **Construct scene** — generate a parameterized 3D model from verified measurements; support first-person and roof-off dollhouse views, collisions, doors and windows.
3. **Stage scene** — switch between modern, Scandinavian and warm-luxury furnishings; keep objects within rooms and preserve geometry.
4. **Light scene** — adjustable morning/sunset/night lighting, interior lights, soft shadows and performance budgets.
5. **Guide visitor** — camera path from entry through rooms, pause with room name, verified area and one supported selling point; finish in dollhouse view. Audio is opt-in with mute.
6. **Publish client experience** — project welcome screen, floor switch, contact CTA, touch controls, shareable URL, optional screen recording; inspect every room against source plan.
7. **Commercialize** — create an authorized sample and offer scoped paid production to builders and architects. Screenshot's $5k–$10k figure is an unverified marketing claim, not a validated market rate.

## Product requirements
- Inputs: floor plan, project title, permitted public address, authorized contact, brand assets, approved selling claims.
- Outputs: scene schema, geometry validation report, responsive walkthrough, guided-tour route, share page, lead CTA and audit log.
- Engine: Three.js or React Three Fiber; reusable scene components and deterministic geometry generation.
- Controls: mobile joystick/touch, desktop keyboard/mouse, reduced motion, captions and low-power quality presets.
- Security: do not expose private plans or addresses without permission; explicit client approval before publishing.
- Quality gates: dimension tolerances, wall/window/door counts, route collision checks, floor navigation, mobile frame rate, accessibility, browser tests and client sign-off.
- Governance: provenance for each measurement and claim; human approval for publication, outreach and payments.
- Commercial workflow: sample -> demo -> scoped quote -> client approval -> deposit -> production -> QA -> delivery.

## Pilot acceptance criteria
- One rights-cleared floor plan imported with an uncertainty report.
- Every visible room, wall, window and door reconciled with that plan.
- Walkthrough and dollhouse modes work on a phone.
- Lighting and one furnishing switch work without geometry changes.
- Guided tour completes without clipping or camera collisions.
- Share link and contact CTA are tested; no personal information leaks.
- Performance and test results are recorded; only then market the pilot.

## Proposed initial pricing experiments (not market facts)
- Proof-of-concept demo: free only for a strategically qualified client, with strict scope.
- Starter tour: quote after floor-plan review.
- Premium interactive tour: custom quote based on plan complexity, modeling, revision and hosting requirements.
- Recurring hosting/updates: optional separately priced service.

## Next engineering action
Implement a single test scene from a rights-cleared sample plan, with an explicit scene schema and deterministic geometry checks. Do not deploy to the live APERTURE site until QA passes.

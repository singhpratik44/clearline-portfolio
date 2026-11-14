# APERTURE Athlete Experience Studio — Independent concept (v0.1)

A working, editable, offline-first HTML/CSS/JavaScript prototype. It includes all 12 interactive athlete, parent and coach modules. No web framework or build step is necessary.

## Open

- Open `index.html` in a modern browser while keeping `styles.css` and `app.js` in the same folder.
- Or use `APERTURE_USPA_Interactive_Studio.html`, the fully self-contained version.

## What's interactive

1. Athlete Life Simulator: 168-hour calculator, conflict and balance suggestion.
2. Pathway Explorer: four-step decision guide with explainable output.
3. Future Athlete Story Map: four branching stages.
4. Weekly Planner: move/add/delete sample blocks, overlap alerts, JSON export.
5. Film Room: original SVG court, camera/tactic/frame controls, drawn annotations.
6. Parent Confidence Center: evidence review checklist and structure comparison.
7. Coach Referral Studio: fictional club handout, offline QR to general official website, print/copy.
8. Team Academy Portal: synthetic cohort pressure heat map.
9. Academic Journey Map: grade-band milestones with opt-in STEM activities.
10. Open House: five interactive concept rooms and completion path.
11. Athlete STEM Lab: ballistic model and apex-height challenge.
12. Family Decision Room: transparent weighted scores and JSON export.

## Safety and release constraints

This is an **independent APERTURE prototype**, not an authorized USPA service, partnership, curriculum, or admissions tool. Do not distribute as an official USPA program. No student/parent private data, messaging, backend, analytics, payments, admissions claims, eligibility claims or referral tracking are implemented. Only outbound navigation is an explicit external link to USPA's general official website. User interactions are local, ephemeral and reset on refresh.

Public USPA-branded deployment, endorsements, student-facing outreach, data collection and commercial referral activity require explicit written approval and appropriate consent, ownership and contract terms.

## Testing

The web app was loaded in headless Chromium in mobile dimensions using the combined offline HTML contents. All twelve module renderings and eighteen interaction checks passed without JavaScript page exceptions. Browser testing on the intended real iPhone is still outstanding.

## Code organization

- `index.html`: accessible shell and navigation
- `styles.css`: evergreen responsive design system
- `app.js`: deterministic state, module views, interactions

No external libraries, fonts or network requests are required to run.
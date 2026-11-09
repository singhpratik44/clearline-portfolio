# APERTURE Athlete Partnership Lab — independent concept

Public-demo route (after merge to the Pages branch):
https://singhpratik44.github.io/clearline-portfolio/partnerships/uspa/

This is **not** an official US Performance Academy (USPA) website, affiliate or endorsed integration. The proposal responds to USPA partnerships lead Manny Iloba's November 2026 message expressing interest in **exploring a referral relationship**. His response was not a contract or agreement to compensate, license APERTURE, share records, or conduct joint marketing.

## Five implementation tracks

| Track | Working demonstration | Evidence boundary |
| --- | --- | --- |
| 01 — Referral Network | Create/remove organization records, change stages, filter, export CSV | Four fictional sample organizations; operator-entered information is unverified and browser-only |
| 02 — Athlete Command | Switch between standard, travel and assessment-week personas, view allocation and export | Completely fictional student and weekly hours; no student record access |
| 06 — Partner-in-a-Box | Generate intro email, one-pager, 20-minute agenda and parent FAQ by sport/need; copy/download | Drafts only; no mail sending, USPA endorsement, or claim of discounts |
| 07 — Operations Dashboard | Counts added organizations and stage advancement; target progress | Not verified leads, enrolled families, admission results, or attributable revenue |
| 10 — 30-day pilot | Four weekly gates, 16 locally saved checklist items, target comparison | Planning target only; no executed pilot, consent, contract or performance guarantee |

## Use

1. Open the static site; the header identifies the independent concept.
2. Explore four **Example** organizations. Their stages are illustrative; they are excluded from the live-count metrics.
3. Add actual **organizations only**, as permitted by your research. Do not enter student identities, grades, educational records, contact information, phone numbers, emails, or medical details.
4. Draft materials for review in **Partner kit**; none are automatically sent.
5. Export a CSV locally when needed. The site never transmits data to an external API.
6. Use the pilot checklist as a self-reported planning tool, not a certified audit.

### Data and security boundary

- All data stays in browser `localStorage` and is available to anyone who uses the same browser profile/device. This is **not suitable for sensitive or personally identifiable data**.
- The site has no authentication, no remote database, no messaging, no analytics beacons and no school data integration.
- Exported CSV/text files are stored on the operator's device; handle them appropriately.
- The demo uses no names or contact details of real minors.
- No claim is made about compliance with FERPA, COPPA or other requirements. Any real processing of student data requires legal, security and USPA review before engineering integration.
- Do **not** put referral commissions, tuition discounts, NCAA outcomes, admission guarantees or official affiliations into outbound materials without USPA's written approval.

## Proposed pilot business gates

**Week 1:** Obtain written approval for scope and any co-branding, referral attribution, consent flow, data ownership, approved communication language, commercial terms, handoff destination, and oversight.

**Week 2:** Research/verify 25 candidate organizations using public primary sources. Determine actual family need (not simply presence of a basketball club). Produce reviewed materials and a referral log with permitted fields.

**Week 3:** Carry out only expressly authorized outreach. Aim for 10 partner conversations and 3 consented family introductions as stretch targets, not forecasts. Let USPA handle admissions.

**Week 4:** Reconcile introductions, test conversion definitions and feedback, review how families experienced the handoff, and decide whether to continue. Do not propose software licensing as an agreed deal without evidence.

### Acceptance conditions for a genuine live deployment

The static demonstration is **not** a full referral product. A live deployment additionally requires:

- signed referral agreement and approved partner language;
- USPA authorization for any branding and marketing;
- private, authenticated backend with role-based access controls and audit logging;
- explicit, revocable consent for each introduction and a secure handoff channel;
- minimal data collection/retention, incident response and deletion procedures;
- measurement definitions: organizations researched, conversations held, introductions consented, USPA-verified enrollment and verified compensation;
- written authorization to introduce third parties on USPA's behalf;
- separate security/privacy/educational counsel review before any real student-data integration.

## Verified public context

- USPA Partnerships: https://gouspa.org/uspa-partners/ — describes partner categories and flexible education.
- USPA Student Support: https://gouspa.org/student-support/ — describes Learning Coach support and time management.
- USPA Academics: https://gouspa.org/about/ — describes a flexible online school for grades 6–12.
- USPA Academic Partnerships: https://gouspa.org/academic-partnerships/ — describes various academic options.

These pages are cited only to describe USPA's **public** services, not to assert a USPA–APERTURE relationship.

## Developer smoke check

Run from repository root:

```bash
node --check partnerships/uspa/app.js
node partnerships/uspa/tests/smoke.cjs
```

Design intentionally isolated under `partnerships/uspa/` to avoid changing the existing Career OS or its production demos.
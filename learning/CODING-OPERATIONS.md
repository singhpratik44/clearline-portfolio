# APERTURE Learning — Coding Instructor & First-Lesson Operations

**Status: Prelaunch.** Internal operating guide, November 10, 2026. Public GitHub document contains **no instructor, guardian, child, or payment customer records**. Approval and appropriate child-safety screening are required before real assignments.

## The initial offer

- Service: One-on-one, live online **coding and game development** for a parent/guardian-authorized learner.
- Scope: One 60-minute lesson at **$65**, using the existing general one-time Stripe coding product; instructor availability and cancellation/refund terms must be confirmed **before checkout**.
- Initial focus for actual staffing: **Scratch, Roblox Studio, Python**. Broader APERTURE coding pathway options are exploratory until someone qualified accepts coverage.
- Scheduling: Parents choose a specialization, age band, preferred daypart and time zone. The booking page opens a prefilled **adult email inquiry**; it does not book a real appointment or transmit age/availability to Stripe.
- No automatic recurring billing, no published class calendar, no claims of coach availability until confirmed in writing.

## 1 — Recruit and screen instructors

Use each prospective instructor's own voluntary response, rather than reusing former employers' student rosters or applicant records without permission. Track the following **only in a private authorized system** (not the public repo):

| Field | Required evidence | Gate |
|---|---|---|
| Adult identity and contact | Verified personal email, preferred communications channel, verified adult status | Before learner contact |
| Subject mastery | Recent project/example, coding proficiency and live explanation demonstration | Before advertising that subject |
| Teaching quality | 10-minute mini-lesson, learner-safe prompting, clear debugging explanation | Before assigning |
| Availability | Approved dates/dayparts, time zone, teaching capacity | Before confirming a slot |
| Compensation | Proposed rate, employee/contractor classification review, written terms | Before any paid assignment |
| Child safety | Background check or legally required screening, mandated reporting training as applicable, reference checks if required, communication safeguards, escalation protocol | Before child interaction |
| Privacy | Signed rules: adult-controlled sessions, no private direct messages to children, no public work artifacts without guardian approval | Before access |
| Platform/tooling | Reliable internet, approved meeting channel, age-appropriate accounts, parent joining instructions | Before first lesson |

**Decision states:** contacted → responded → qualification pending → screening pending → contract pending → approved → available → assigned. Never collapse a contacted person into a hired instructor.

## 2 — Pilot lesson templates (examples, not guaranteed one-session completions)

### Scratch: Event-driven Space Collector

**Learning objective:** Demonstrate an event, a condition and a variable in a story/game rule.

| Time | Instructor and learner activity | Evidence to request |
|---|---|---|
| 0–8 min | Adult hello; choose the simple game objective and inspect prior experience | Stated goal in learner's words |
| 8–18 min | Build sprite movement with a simple input or event | Learner explains what triggers code |
| 18–32 min | Add collectible interaction and score variable | Project changes when a star is touched |
| 32–46 min | Test three scenarios; debug one issue with learner explanation | Before/after example or observation |
| 46–55 min | Have learner explain the event-condition-variable connection | Verbal explanation summarized by coach |
| 55–60 min | Share an appropriate parent-facing recap and next challenge | One achievement, one next step |

**Access:** Guardian-managed Scratch use where platform rules require it. No student full names, school names or unsupervised account creation in the demo.

### Roblox Studio: A Safe Interactive Door

**Learning objective:** Explain a trigger, one Lua condition and a visible game-world effect.

| Time | Activity | Evidence |
|---|---|---|
| 0–10 min | Confirm suitable age, account permissions, device and simple design objective | Instructor confirms tooling |
| 10–22 min | Construct room and door object | Initial geometry |
| 22–38 min | Add event-driven script to open the door on contact or action | Working interaction |
| 38–50 min | Debug a broken property or condition using a repeatable test | Learner explains the fix |
| 50–60 min | Recap what code and level design each contributed | Learner can point to script and outcome |

**Safety:** Parent-managed Roblox account as appropriate, private project, no public chat, multiplayer requirement or default publishing. Coach must confirm platform and safeguarding policies.

### Python: Guess-the-Number with Input Validation

**Learning objective:** Use variables, loops, branching and testing to solve a simple interactive problem.

| Time | Activity | Evidence |
|---|---|---|
| 0–10 min | Discuss program inputs, outputs and a test example | Learner states success rule |
| 10–25 min | Write a short program with target and guess | Runs at least once |
| 25–40 min | Add a loop and high/low hints | Program adapts to multiple guesses |
| 40–53 min | Handle unexpected text or out-of-range inputs | Learner demonstrates one defensive test |
| 53–60 min | Reflect on conditionals vs loops; propose next feature | Simple recap and next step |

**Safety:** Use a suitable approved editor, local sample files only, no personally identifiable information.

## 3 — Guardian inquiry → scheduling → billing → delivery

1. **Inquiry received:** Confirm adult payer/guardian contact and subject request; do not solicit child name or date of birth in the initial email. Record inquiry date and source in a **private** ledger.
2. **Fit checked:** Verify age-appropriate starting point, required device/tool, available approved adult instructor and capability.
3. **Capacity held manually:** Instructor agrees to a concrete date/time and time zone. Do not send a Stripe request before that.
4. **Written terms sent:** Include 60-minute scope, price, scheduling, cancellation window, refund/no-show policy, taxes if applicable and adult communication expectations. These terms require owner/legal approval and are **not currently published** as a binding policy.
5. **Guardian agrees:** Explicit confirmation of terms and date; a draft agreement or an unsent email does not count.
6. **Stripe checkout sent:** Existing one-time $65 coding Buy Button or another correct, merchant-authorized Stripe payment method. Check payment in Stripe, not from a screenshot or website click.
7. **Confirmed invitation:** Only after payment reconciliation, use an authorized calendar/meeting system to send the adult the date, time zone, tool/meeting instructions and safeguarding instructions.
8. **Lesson delivered:** Coach documents objective, code/project milestone, explanation, one issue solved and what to practice next. Send the recap **to the guardian**.
9. **Post-lesson:** Guardian may book another session. Do not interpret attendance as automatic recurring subscription consent.
10. **Exception handling:** If teacher cancels or an access issue occurs, apply previously accepted terms and provide a human point of contact.

### Status ledger (keep in private storage only)

`inquiry → fit-confirmed → slot-held → terms-agreed → payment-verified → calendar-confirmed → delivered → recap-sent → closed`.

Alternative statuses: `awaiting-instructor`, `scheduling-conflict`, `guardian-withdrew`, `payment-pending`, `refund-review`, `rescheduled`, `cancelled`.

Do not store payment card details in your own system. Store payment IDs and fulfillment receipts in an authorized, access-controlled system only.

## 4 — Email copy templates (do not send automatically)

### Parent: first response

**Subject:** Your APERTURE coding lesson inquiry — next steps

Hello,

Thank you for your interest in APERTURE Learning and the [subject] coding pathway. A private live coding/game-development lesson is $65 for 60 minutes. Before any purchase, I'd like to confirm a qualified instructor, the learner's starting level, and a mutually workable session time.

Would [time option 1 with time zone] or [time option 2] work? I'll also send the scope and written rescheduling/refund terms for your review before checkout. You do not need to send any child's full name or sensitive details at this stage.

Best,
APERTURE Learning

### Parent: confirmed booking (only after all gates pass)

**Subject:** Confirmed — APERTURE [subject] coding lesson, [date/time zone]

Hello,

Your live 60-minute [subject] lesson is confirmed for [exact date/time/time zone] with [screened, approved instructor]. The agreed lesson objective is [objective]. Your payment has been verified under [transaction reference, private]. The meeting details are [approved instructions]. A guardian should remain reachable during the session, and communication about the learner will remain guardian-directed.

The previously agreed cancellation and rescheduling policy applies: [approved terms]. Please reply directly if you need an adjustment.

Best,
APERTURE Learning

### Coach: onboarding confirmation

**Subject:** APERTURE coding instructor onboarding — prerequisites

Hello,

Thank you for your interest in APERTURE Learning. Before confirming sessions we will review your coding demo, preferred topics and availability, appropriate adult identity/background checks, training and safeguarding, compensation/classification, tools, and a written engagement agreement. This is an introductory discussion, not a confirmed assignment or offer.

Please share one recent project you can explain live, the subjects you are comfortable teaching, and your preferred availability in Pacific Time.

Best,
APERTURE Learning

### Post-lesson parent recap

**Subject:** [Subject] coding lesson recap — [date]

**Objective:** [concept taught]
**What the learner built or changed:** [specific artifact or code feature]
**What they could explain:** [observed, not predicted]
**Debugging moment:** [one issue and response]
**Next challenge:** [one appropriate action]
**Instructor:** [verified coach]
**Status:** [delivered / needs further practice] — not a certification or mastery score.

## 5 — Release acceptance checklist

- [ ] Two approved instructors with verified adult status, screening, signed terms and published subjects
- [ ] At least two instructor-approved session windows available
- [ ] Guardian policy and written cancellation/refund terms approved
- [ ] Stripe authorized merchant identity, actual checkout, receipts and payouts verified
- [ ] Real calendar invitations and privacy-safe adult contact workflow tested
- [ ] Rescheduling/refund exception tested by operator without taking an unauthorized payment
- [ ] Three lesson templates instructor-reviewed for readiness and safeguarding
- [ ] First two lessons delivered and evidenced before any success claims
- [ ] At least one permission-based marketing channel launched and attributed without profiling children
- [ ] Historical theCoderSchool parent/family invoice records **not** used as a marketing list without rights and consent

The website is **not** an automated booking system, not a school/teacher authorization system, and not a live calendar. It intentionally requires guardian and operator confirmation. Do not claim production readiness before these gates pass.

# APERTURE Learning — Execution Register
Updated November 10, 2026 · Owner review required before external outreach

## What is working in source

- Homepage `/learning/`: one focused parent story, featured subject explorer, optional expand-to-all 20, real projects, founder pedigree, honest tuition and FAQs
- Shared definitions: `/learning/subject-catalog.js` contains 20 canonical specialization IDs
- Subject-specific landing pattern: `/learning/book/?track=python-adventures` etc. No student information in query strings
- Existing Stripe Buy Button: `buy_btn_1Ua6avRo2jpgx3bldwAjYy0p`, public live-mode publishable key. **One $65 / 60-minute general private coding lesson**, *not* separate Stripe products for each subject
- Subject-specific checkout is behind an adult purchaser acknowledgement and request to confirm instructor, session availability, cancellation and refund terms. Weekly is inquiry-only
- Private portfolio: remains intentionally disabled pending Supabase setup + guardian access security test. No child account is stored on GitHub
- All other portfolio/prayer/career pages should remain untouched

## Launch gates that MUST be completed before paid acquisition

| Gate | Readiness | Exact next action |
|---|---|---|
| Instructor schedule | NOT VERIFIED | Ask 2–3 former qualified coding coaches for consent, available slots, topics and proposed compensation |
| Child safety and guardian verification | NOT VERIFIED | Document mandatory instructor screening, rules for parent communication and safeguarding escalation |
| Terms and cancellations | NOT PUBLISHED | Approve a written refund, no-show, rescheduling and scheduling response policy *before* accepting new payment |
| Payments | PARTIAL | Current Stripe one-time coding lesson embed is set; check live account payouts, checkout quantity, receipts and any required tax handling; test without processing unauthorized card payments |
| Separate subject-specific Stripe products | NOT CREATED | Create only when the user confirms price and the staff can actually teach that subject; one current payment product must not masquerade as 20 distinct SKUs |
| Weekly subscriptions | NOT CREATED | Confirm schedule, capacity, auto-renewal consent, cancellations and a dedicated recurring Stripe price/link |
| Parent intake | MANUAL EMAIL | Confirm timely reply process (ideally next business day), one private inbox and no collection of children's identifying info through GitHub Pages |
| Real student portfolio | DISABLED | Connect Supabase project, review RLS and access-control tests before activation |
| Testimonials and partners | NONE VERIFIED | Publish only permissioned guardian stories, instructor bios and authorized institutional names |
| Marketplace enrollment | NOT STARTED | Apply only after scheduling and eligibility are ready; keep marketplace payments inside their own platforms where required |

## Market/channel list — contact targets and actual requirements

1. **Warm instructor referrals**: personal check-in to former colleagues. No bulk unsolicited messages. Determine instructor availability first.
2. **ActivityHero free listing**: https://business.activityhero.com/pricing/ ; free directory profile. Its marketplace listing option may cost $49/month; MarketingHero can involve a 15% per-registration commission + processing. Start free, only promote sessions when instructor schedule exists.
3. **Nextdoor business page**: https://business.nextdoor.com/en-us/getting-started/business-page ; free page and local business posts, subject to account verification. Use original instructor-safe demos. Do not misrepresent a physical office.
4. **Outschool**: https://support.outschool.com/en/articles/2382129-teacher-earnings-and-payments-policy ; teacher share 70%, platform fee 30% on class price, plus marketplace fee for parent as described. Maintain on-platform checkout if selling there. Subject to onboarding and instructor qualifications.
5. **Fourth District PTA councils, Orange County**: https://fourthdistrictpta.org/councils/ ; request permission for a free coding demonstration from the appropriate council or unit. PTA explicitly does not endorse commercial entities; do not advertise an endorsement.
6. **Santa Ana Unified Engage 360°**: https://expandedlearning.sausd.us/programs/enrichment ; official enrichment includes STEM and programming-compatible activities. Ask vendor requirements (not presumed school partner). Vendor registration overview: https://www.sausd.us/departments/business-services/facilities/maintenance-operations/vendor-registration-bids.
7. **Organic project videos**: publish original screen recordings of a Scratch interaction, Roblox game rule and Python program on parent-facing social channels, with links to the corresponding `track` booking pages. No footage of children without informed guardian permission.
8. **Home-school and community organizations**: request admin permission before sharing invitations to free educational demonstrations. Never scrape members or use learner data for ad targeting.

## Campaigns ready for review — NOT sent or published

### Launch post 1 — Scratch
**Audience:** Families with younger school-age learners
**Copy:** “Your child's next favorite game might be the one they create. Explore a hands-on Scratch story that reacts to choices, and see how real coaching turns an idea into code.”
**Link:** https://singhpratik44.github.io/clearline-portfolio/learning/book/?track=scratch-stories
**Disclosure:** “Subject and instructor availability are confirmed separately. $65 buys one live 60-minute private coding lesson, not the full Scratch pathway.”

### Launch post 2 — Roblox
**Audience:** Parent communities, ages appropriate to tools
**Copy:** “A child can learn much more from a game than how to play it. Start exploring how a Roblox level works—rules, movement, testing and creative decisions—with a live coding coach.”
**Link:** https://singhpratik44.github.io/clearline-portfolio/learning/book/?track=roblox-worlds
**Disclosure:** As above.

### Launch post 3 — Python
**Audience:** Parents of middle-school learners
**Copy:** “Python becomes meaningful when students make something useful. Our project-led method helps learners write code, find mistakes and explain their own programs.”
**Link:** https://singhpratik44.github.io/clearline-portfolio/learning/book/?track=python-adventures
**Disclosure:** As above.

### Launch post 4 — Responsible AI
**Audience:** Parents of teens, school enrichment directors
**Copy:** “Learning AI shouldn't mean trusting everything it says. Explore how an algorithm makes predictions, where it can fail, and how to test results through guided coding.”
**Link:** https://singhpratik44.github.io/clearline-portfolio/learning/book/?track=ai-literacy
**Disclosure:** Advanced instruction is contingent on appropriate age/skills and qualified coach availability.

### Launch post 5 — Basketball analytics
**Audience:** Youth coaches and parent organizations
**Copy:** “Turn basketball curiosity into code. Students can explore shot charts, statistics and the difference between data and guesses—building an original project along the way.”
**Link:** https://singhpratik44.github.io/clearline-portfolio/learning/book/?track=sports-analytics
**Disclosure:** No affiliation with pro leagues, school teams or actual athlete analytics data.

## Coach recruitment script — personalized one-to-one only

Subject: Interested in teaching a few coding sessions through APERTURE Learning?

“Hi [Coach's Name], I'm building APERTURE Learning as an independent, live, project-based coding service. I'm organizing a small initial instructor network around Scratch, Roblox, Python and AI-literacy pathways. Are you open to a conversation about taking a few private online sessions? I'd appreciate knowing which subjects you feel confident teaching, your weekly availability and your compensation expectations. We'd confirm screening, learner safeguarding and logistics before any assignment. No commitment assumed. — Pratik”

## Parent/community organizer script — request permission, not an ad blast

Subject: Could we share a free coding project demonstration with your parent community?

“Hello [Organizer], I direct APERTURE Learning, an independent project-based coding education initiative. Would your group be open to a 20–30-minute complimentary, parent-supervised session showing how a student can design and test a simple game rule or Python project? I'd provide the sample agenda and instructor qualifications in advance. Please let me know the group's promotional and safeguarding policies; no sales pitch is required for the demonstration. — Pratik”

## School coordinator inquiry — vendor readiness first

Subject: STEM enrichment vendor requirements / project-based coding

“Hello [Coordinator], I'm evaluating whether APERTURE Learning could support a structured, project-based STEM workshop at your program. Before preparing a proposal, could you clarify current vendor eligibility, instructor screening, insurance, approved modalities, pricing submission procedures, and whether there are upcoming STEM enrichment opportunities? This is an initial inquiry, not a claim of existing partnership. — Pratik”

## Pilot targets and measurement

**Pilot teaching capacity:** only confirmed coach times; start with a subset of Scratch, Roblox and Python before expanding.

**Pilot marketing:** produce 3 original videos; publish 1 helpful adult-facing local post where permitted, request 2 school/community conversations, and set up 1 accurate free business directory listing. All external posts/listings need user's approval and relevant account access.

**Measurement:** daily adult inquiries; qualified subject matches; confirmed coach slots; paid Stripe sessions; fulfilled lessons; actual parent progress reports; voluntary renewals/referrals. Do not infer outcomes from website clicks or invent learner counts.

## Human action required

1. Connect Stripe in ChatGPT (optional) if direct payment-product creation is desired. The existing public Stripe button works without an API secret; no new products can be created from static GitHub Pages alone.
2. Confirm first two or three coaches and agree on their pay/schedules.
3. Approve a refund and rescheduling policy and a start-time booking process.
4. Approve particular posts and recipients before publishing externally.
5. If needed, connect Supabase **after** creating the project; keep private student records disabled until security reviewed.

**No outreach was sent, no activity marketplace listing was created, and no subscription or unique Stripe subject SKU is claimed by this file.**

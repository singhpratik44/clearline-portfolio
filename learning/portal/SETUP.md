# APERTURE Learning Private Portfolio — Secure Setup (Not Yet Live)

This is the **guardian-only private student project portfolio** that connects the learning world, coaching review and the four-stage learning timeline. The portal UI is at `/learning/portal/`, but **real accounts and uploads are intentionally disabled** until security tests pass.

## Current status

| Component | Status |
|---|---|
| Public 4D Learning Universe | Existing separately published website |
| Fictional example project and progression | Available without sign-in |
| Guardian/coach portal UI | Source committed, intentionally gated |
| Database schema + RLS draft | Source file `001_secure_schema.sql`; not executed in Supabase |
| Supabase organization / project | Must be created and connected by account owner |
| Adult account authentication | Not active |
| Private file uploads | Not active |
| Coach verification | Not active |
| Actual student records | None claimed |

**No child or parent data should be entered into the public demo. Never add Supabase service-role/secret keys, passwords, invitation tokens, or personal child information to GitHub.**

## 1. Create the Supabase project

From the Supabase dashboard, create the **APERTURE Learning** organization (Type: Personal is fine; the organization name is not proof of incorporation). Choose the **Free** plan if it fits. Under that organization, click **New project** and name it **APERTURE Learning Portfolio**. Choose an available U.S. West region if appropriate and keep the generated database password private.

Only the project owner should use the SQL editor or configure credentials. A ChatGPT connector must be explicitly connected and authorized separately from signing into the browser. A browser sign-in alone does not give ChatGPT control of the database.

## 2. Database setup, audit and policy tests

Review `learning/portal/001_secure_schema.sql` with an experienced database/security reviewer. Do not execute without checking it against your Supabase version and policies. On a fresh project, run it in **SQL Editor** only after approval.

Before changing `config.js`:

- Confirm RLS is enabled for all `public.ap_*` tables and storage objects.
- Authenticated Guardian A can see only learner A, projects A, evidence A and assigned coach reviews; Guardian B cannot access those.
- No anonymous user can create or query records.
- Unassigned coach cannot see any student record or sign a review.
- An assigned, verified coach may view only their assigned learner and submit a feedback review; **cannot** create a learner or change somebody else's submitted work.
- Guardians cannot sign their own coach reviews or edit a recorded review.
- Authenticated clients cannot UPDATE, DELETE or TRUNCATE submitted evidence/reviews.
- Private PDF/TXT/PNG file URLs require authenticated, authorized access; no public storage or open listings.
- Validate attachment size, type and privacy. Prohibit children's faces, legal names, addresses, school names and health information in artifacts unless specifically necessary with an approved policy.
- Confirm policies cannot be bypassed with a different project's file path or swapped project ID.
- Test data export, correction and deletion processes, including private storage artifacts, with an administrative operator. Requests are recorded; deletion is **not automated**.

## 3. Authentication and safeguarding

This website is for **guardians and authorized adult coaches**, not children signing in.

In Supabase Auth:
- Set Site URL to `https://singhpratik44.github.io/clearline-portfolio/learning/portal/` and add the same under **Redirect URLs**.
- Configure email OTP/magic-link templates, delivery limits and CAPTCHA/rate limits if supported.
- Decide how to verify an adult guardian relationship and coaches; **do not treat email-only authentication as proof of parent/guardian status**.
- Restrict email sign-up/invitations to approved adults before launch. The frontend OTP call currently permits new Supabase Auth accounts, but server-side access to data is additionally gated by RLS; choose the actual enrollment policy before activation.
- Use appropriate parental notices, privacy policy, retention/deletion rules, terms and safeguarding processes. Legal review is recommended before processing minors' data.
- The only intended student profile fields are a **pseudonym** and **age band**, not date of birth or home address.

Coach assignment is an **operator-only** action. No public signup flow is allowed to self-approve a coach. After separately verifying identity, work authorization as applicable, qualifications, safeguarding and guardian consent, the administrator may assign a coach via database administration. Example with *placeholder IDs only*:

```sql
-- ADMINISTRATOR ONLY, only after verified guardian consent and coach screening
insert into public.ap_coach_assignments
  (learner_id, coach_id, consent_confirmed_at, coach_verified_at, active)
values
  ('REPLACE-WITH-LEARNER-UUID', 'REPLACE-WITH-COACH-AUTH-UUID', now(), now(), true);
```

This is **not** a functional verification workflow; it merely records a prior completed verification decision.

## 4. Enable the browser portal *only after security sign-off*

In Supabase **Project Settings → API** (location may vary), copy **Project URL** and the **publishable/anon public key**. These are intended for client-side use, unlike secret/service-role keys.

Edit `learning/portal/config.js`:

```js
window.AP_PORTAL_CONFIG = Object.freeze({
  supabaseUrl: "https://YOUR-PROJECT-REF.supabase.co",
  supabasePublishableKey: "YOUR-PUBLISHABLE-KEY",
  enabled: true // DO NOT set true before tests and guardian privacy approval
});
```

The browser loads Supabase JS only when the configuration explicitly permits it. Session tokens use browser **sessionStorage**, not shared site-wide localStorage. If JavaScript, the CDN or authentication is unavailable, the site fails closed. Leave it disabled while tests or policies are incomplete.

## 5. Test the complete journey

1. Guardian signs in through an email verification link.
2. Guardian creates a pseudonymous learner profile, chooses a specialization and creates a private project.
3. Guardian submits a milestone note and, if necessary, a consent-reviewed private file.
4. Explicitly verified, authorized coach reviews the submitted evidence and chooses **verified** or **needs revision**.
5. The guardian sees a *verified* progress milestone only when server-stored coach approval exists.
6. The portal links to the public 4D Universe using **only the non-identifying specialization ID**. No learner identity is put into public query strings.
7. If review requires revision, a new evidence submission is added. Historical evidence and reviews cannot be edited by ordinary users.
8. Sign out; confirm session is removed. Repeat direct-access isolation tests using two separate browser profiles.
9. Guardian submits a data deletion/export request; operator handles it through a documented workflow.

## 6. Production requirements still outstanding

- Formal legal and safeguarding policies suitable for children's online education.
- Privacy notice, consent flow and authenticated account invitation policy.
- Secure coach onboarding with documented approvals.
- Operator processes for billing reconciliation, recurring weekly Stripe subscriptions and refund/scheduling terms.
- Secure project artifact scanning, retention policy, and abuse reporting.
- Database migrations/version history, backup/restore and incident response.
- End-to-end browser and database RLS tests with two isolated user accounts; public GitHub source tests alone are insufficient.

Only when these gates are complete should the UI say "production-ready" or accept actual student records.

## 7. Free static public experience

Even before the database is provisioned, families can use the public:

- [4D Universe](../universe/) — rotate and discover specialization pathways.
- [Specialization Catalog](../catalog/) — browse 20 specializations.
- [Interactive Learning Studio](../studio/) — live coding examples, sample progress.
- [Coding website](../) — transparent $65 one-time Stripe lesson checkout and weekly subscription inquiry.

**All portfolio demonstration content is fictional and clearly labeled.**

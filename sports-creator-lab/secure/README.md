# APERTURE secure instructor platform — deployment gate

This is **production-oriented source code**, NOT a deployed or approved student-record service. Branch: feature/secure-instructor-platform. Public GitHub Pages may host the client after a dedicated Supabase backend is configured; it must never host service-role secrets.

## Activation checklist
1. Create a dedicated Supabase project under APERTURE organizational control.
2. Review and apply `schema.sql` in the Supabase SQL editor. Run RLS authorization tests with two different organizations and instructor roles before enabling accounts.
3. Configure email/password authentication, require MFA for instructors, restrict invitations and redirect origins; no self-service student signup.
4. Provision organization, membership, class, class-instructor, and fictional learners through trusted administrative SQL or a privileged backend (never from browser). Use random pseudonyms.
5. Populate `config.js` with the Supabase project URL and **publishable/anon** key only. Never commit the service-role key.
6. Deploy only after security review. Test unauthorized cross-class and cross-organization reads/writes, invalid assessment inputs, token expiry, and audit entries.
7. Before any real student data: implement a legally reviewed guardian consent workflow (capture, verification, revocation, evidence), data retention/deletion, privacy notices, incident response, and child/education compliance assessment.
8. Run classroom acceptance tests with synthetic records first.

## Important constraints
- Current code supports instructor sign-in, class visibility, lesson assignments, pseudonymous learner codes, assessments, and server-side row-level policies.
- The database audit trigger logs assessment inserts/updates; broader audit coverage, MFA enforcement, and operational monitoring remain incomplete.
- This app intentionally does not collect real guardian details or provide consent approval.
- Never describe this branch as a launched secure student service until all gates pass.

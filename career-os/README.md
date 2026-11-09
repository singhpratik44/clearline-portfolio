# APERTURE Career OS — Verified Job-to-Prototype Pipeline (V7)

**System of record:** [GitHub repo](https://github.com/singhpratik44/clearline-portfolio)  
**Factory:** https://singhpratik44.github.io/clearline-portfolio/career-os/  
**Published registry:** https://singhpratik44.github.io/clearline-portfolio/career-os/registry.html  
**GitHub workflow:** [.github/workflows/aperture-career-os.yml](../../.github/workflows/aperture-career-os.yml)

## Mandatory new stage — Check their needs → Tailor the proof

This stage runs **between job discovery and prototype generation**, as part of the connected research agent (and the APERTURE Career Daily automation), not inside the offline static HTML builder.

1. **Verify**: open the employer's current ATS listing, job ID, location, compensation, required qualifications and posting freshness. Recheck dead links; never interpret a past cached page as a live vacancy.
2. **Understand**: extract the 2–5 most important *stated* employer needs, stakeholders, delivery constraints, business outcomes and desired metrics. Supplement with the employer's own product/mission pages and dated public announcements. Mark unsupported assumptions as hypotheses.
3. **Match honestly**: for each need, explain relevant candidate-provided experience and identify genuine gaps. Never claim employment, certifications, client results, or product-system access not documented by the candidate.
4. **Tailor the prototype**: define one functional interactive module per high-priority need, its expected metric, a 30/60/90-day pilot, and a concrete question to ask the employer. Avoid generic charts that do not measure the actual role.
5. **Trace and gate**: save \`needs_status\`, \`needs_reviewed_on\`, and \`employer_needs[]\` in the job JSON. Each item must include \`need\`, \`basis\` (\`job-posting\`, \`official-site\`, or \`hypothesis\`), \`source_url\` where sourced, \`prototype_feature\`, \`success_metric\`, \`candidate_fit\`, and optionally \`open_question\`. The builder checks fields and URLs, injects the needs into the Evidence & Controls panel, writes an evidence-specific outreach draft, and records needs status/count in the build report.
6. **Send gate**: no outreach is sent if the role is closed/unverified, the needs register is missing or speculative, the contact is unverified, the deployed demo fails, or user approval is absent. The generated \`outreach.md\` is a draft only.

The browser form can create **draft** prototypes but does not browse employer websites or verify facts. Direct browser submissions are labeled \`not-reviewed\` or \`needs-reverification\`, even if their author supplies a link. A GitHub build success validates formatting and JavaScript, *not* the truth or currency of the cited job posting.

Example entry:

\`\`\`json
{
  "needs_status": "posting-reviewed",
  "needs_reviewed_on": "2026-11-09",
  "employer_needs": [{
    "need": "Improve customer onboarding and account renewal readiness",
    "basis": "job-posting",
    "source_url": "https://example.org/careers/role-id",
    "prototype_feature": "Onboarding intervention and renewal-risk simulator",
    "success_metric": "Time-to-value and gross revenue retention",
    "candidate_fit": "Prior education-program retention experience is relevant; direct SaaS ownership is not yet proven",
    "open_question": "Which account segments have the highest churn risk?"
  }]
}
\`\`\`

## V8: Publish from one GitHub Actions form

1. Open the [Prototype Factory](https://singhpratik44.github.io/clearline-portfolio/career-os/) and select a role or enter a custom employer and job description.
2. Select **Copy spec + open publishing**.
3. In [APERTURE V8 — Publish role prototype](https://github.com/singhpratik44/clearline-portfolio/actions/workflows/aperture-one-job.yml), click **Run workflow**, paste the job JSON into `job_spec_json`, then run.
4. The authorized workflow validates input, replaces its provenance with *candidate-supplied/unverified*, generates and tests the work sample, produces an outreach draft, commits output to the portfolio, and explicitly dispatches the Pages workflow.
5. Review the demo in [Published registry](https://singhpratik44.github.io/clearline-portfolio/career-os/registry.html), check that public links work, independently verify the vacancy and recipient, then approve any outgoing email separately.

This is **not** a one-click anonymous write or autonomous email sender: only a signed-in GitHub account with repository workflow permission can launch publishing. Browser UI has no GitHub token. Built models use hypothetical figures. Avoid putting confidential or personal data into public job specs.

**Pages packaging fix:** The Pages workflow now rebuilds job demonstrations and stages the entire `career-os/` directory. Without that step, factory/registry links could be missing from the deployed site.

## What runs automatically now

1. A job is captured as a version-controlled JSON file in \`career-os/jobs/<job-id>.json\`. The browser factory can export a compatible file; in ChatGPT the connected GitHub integration can create this file directly.
2. GitHub Actions detects the commit or runs on \`workflow_dispatch\`.
3. The Python builder validates input provenance, HTTPS links, requirements, milestone schema, job-family type and unique slug.
4. The builder injects an escaped role configuration into the vetted standalone operating-lab template, producing a site with working charts, local scenario controls, and tailored milestone / evidence sections.
5. Tests verify schema, resistance to script injection, generated assets, email approval wording, and JavaScript syntax. The workflow also parses **every** generated site's script with Node.
6. Only if tests pass, the workflow commits validated static HTML, a public demos registry, email *draft text*, and integrity reports to the existing \`main\` Pages source branch.
7. A hiring contact and availability still need verification. An authorized Gmail integration can prepare a **draft** after the live URL has been checked and recipient approved. Sending always requires the user's explicit authorization. ATS applications are separate.

**No Gmail credentials or private candidate records are included in the GitHub workflow.** No auto-emailing occurs from a public website. The generated HTML works offline and uses no hidden model/API service.

## Status of the four starter roles

- Playfly Sports / Mater Dei General Manager: commercial sponsorship, P&L and rights-sensitive modeling; previous posting requires fresh status check.
- KidWorks K–12 Program Director: program capacity, participant continuity and program delivery assumptions.
- Pearson Customer Success: customer book-of-business, adoption and account continuity assumptions.
- Remote Operations Director: initiative/impact scenarios and implementation sustainability.

These are **work samples**, not evidence that the job is currently vacant or that the organizations supplied data.

## To build for any new job

**From ChatGPT:** provide the employer, job link or description, and say **“APERTURE: build a work sample for this job.”** The assistant should check the current job details if accessible, create a new job JSON with explicit provenance, let GitHub Actions generate the demo, check the resulting artifact and public URL, and create a Gmail draft only when a verified recipient is provided or found. Never send without approval.

**From the website:** fill the factory fields, click **Copy spec for auto-publish**, create \`career-os/jobs/<id>.json\` with that JSON in the linked GitHub editor, and commit to \`main\`. There is no PAT or Gmail token stored in the browser.

**From a local clone:**
\`\`\`bash
python3 career-os/engine/build.py
python3 -m unittest discover -s career-os/tests -v
\`\`\`

## JSON contract

\`\`\`json
{
  "id": "acme-ops-director",
  "type": "ops",
  "company": "Acme",
  "title": "Director of Operations",
  "location": "Remote",
  "link": "https://example.com/careers/123",
  "status": "Candidate-supplied, not yet verified",
  "source": "Official job page checked YYYY-MM-DD or candidate provided",
  "thesis": "An evidence-grounded operating hypothesis",
  "headline": "Measurable execution",
  "requirements": ["At least two relevant requirements", "Another real requirement"],
  "phases": [
    ["Days 1–30 action", "Concrete deliverable"],
    ["Days 31–60 action", "Concrete deliverable"],
    ["Days 61–90 action", "Concrete deliverable"]
  ],
  "references": [{"label": "Official posting", "url": "https://example.com/careers/123"}]
}
\`\`\`

Types are \`partnerships\`, \`education\`, \`customer\`, and \`ops\`. Each selects its own vocabulary, funnel stages, numeric meaning, and operating hypotheses; it does **not** assert real employer financial data.

## Verification gates

| Gate | Automatically checked? | Limitation |
|---|---|---|
| Schema, unique IDs, URL protocol | Yes | Cannot verify that URL content is authentic/current |
| JSON escaped inside script | Yes | Additional browser/security review advisable before complex changes |
| JS syntax and generated file presence | Yes | GitHub Actions test is not full end-to-end browser simulation |
| All financial figures labeled simulated | Yes | Actual employer forecasts require authorized data |
| Role-specific labels / 90-day plan | Yes | Human review for context and quality |
| GitHub Pages actually serves new files | Separate check required | Pages deployment may lag main commit |
| Recipient identity, email accuracy | Human / connected Gmail review | Not supplied by job JSON |
| Sending email and submitting ATS | **Never automatic** | Explicit consent required |

## Integrity and operating constraints

- The \`build-report.json\` for each demo includes SHA-256 of the source JSON and resulting HTML.
- The public \`manifest.json\` lists all generated demos; \`registry.html\` navigates them.
- Source material from recent arXiv, OpenReview, NeurIPS/ICML and other research is a **design input**, not a claim that a job site runs a frontier LLM or a quantum computing engine.
- Do not fabricate outreach success, sponsor rights, hiring contacts, recruiter replies, company results, or verified research.
- Never embed résumé contact details, private email history, OAuth tokens or employer confidential data in a public role specification.
- Sending and actual application outcomes must be tracked separately from generated demonstration status.

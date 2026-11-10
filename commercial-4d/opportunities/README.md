# APERTURE Commercial 4D / Private Gmail Evidence Vault

Status: browser-only read-only pilot. The website is public; opportunity data is NOT embedded in the website or published to GitHub. Not yet a production multi-user SaaS.

## Setup

1. Download the private six-opportunity bundle provided in ChatGPT. Keep it private.
2. Open https://singhpratik44.github.io/clearline-portfolio/commercial-4d/opportunities/ and import the JSON file.
3. To retain it, choose a passphrase of at least 12 characters and use Save encrypted vault. The app uses WebCrypto AES-256-GCM plus PBKDF2 SHA-256 (310,000 iterations) with fresh salts and IVs; ciphertext is saved only to browser IndexedDB. Save an encrypted backup separately if desired.
4. For direct Gmail sync, create your own Google Cloud OAuth 2.0 Web application Client ID. Enable the Gmail API, set up the consent screen, add your Gmail account as a test user if appropriate, and authorize JavaScript origin https://singhpratik44.github.io. A Google OAuth Client ID is not a secret; **never** enter a client secret into this website. The ChatGPT Gmail connector does not supply reusable credentials to an independent website.
5. Press Prepare Google sign-in, Connect Gmail, then grant read-only Gmail access. The token is kept in JavaScript memory and not persisted.
6. Press Sync imported threads. Each sync reads metadata for at most 25 previously imported Gmail thread IDs, serially. There is no mailbox-wide scan, no body/attachment fetch, and no Gmail send or modify permission.
7. Review evidence, study matches and plans; Record hash-linked planning review authorizes planning only. No email, contract, hiring or spending actions exist in this app.
8. Save encrypted vault again after changes. Unencrypted imports and unsaved sync results disappear on reload.

Google's client-side token-model documentation: https://developers.google.com/identity/oauth2/web/guides/use-token-model

## Threat model and limitations

- Gmail readonly is a restricted scope. Google may require OAuth verification for broader public use; personal test-user authorization depends on the user's Google Cloud configuration.
- Google API requests go directly from the browser to gmail.googleapis.com with an in-memory access token. The app never transmits imported opportunity records to the APERTURE host or GitHub. Google Identity Services is loaded when requested by the user.
- Encryption protects private data at rest when the vault is locked. It cannot protect against malware, malicious browser extensions, compromised pages/scripts on the same GitHub Pages origin, or a compromised device. The current shared origin and inline-script CSP are not suitable for a fully audited production SaaS.
- Passphrase recovery, cross-device sync, a server-side key manager, identity/role management, continuous background Gmail sync, and server-signed approvals are NOT implemented. GitHub Pages has no secure private server storage.
- No customer data, Gmail account address, provider thread IDs or tokens are hard-coded into public source. The downloadable six-record pilot contains private message IDs; do not upload it to the public repository.
- Provider thread IDs are the deduplication key, and unique provider message IDs determine whether a refresh changes evidence. Human-curated evidence and contract terms are preserved across automatic metadata refreshes. No algorithm auto-asserts that a contract was signed.
- A local hash-chained review log provides tamper evidence within one local copy, not an externally attested legal audit trail. A planning review is NOT permission to communicate, sign or spend.
- The private workspace synchronizes only when the user has the browser open and explicitly clicks Sync; token expiry requires renewed user consent.

## The six reviewed opportunities

US Performance Academy (meeting proposed), BOOMIN Business Solutions (human response), Anaheim Family YMCA (outbound only), Pronix (outbound only), YMCA of the USA (local referral direction), Nexplore (screening confirmed). None is automatically counted as awarded contract or booked revenue.

## Tests

Run: node --test tests/commercial-gmail-security.test.mjs tests/commercial-opportunities.test.mjs

The Pages deploy workflow bundles engine.js, gmail-core.js, gmail-oauth.js, vault.js, audit.js and secure-ui.js and runs deterministic Node tests against synthetic messages. Initial credentials and real Google authorization require user interaction and cannot be asserted as tested.

## Production upgrade path

Deploy on a dedicated independent origin with backend authorization-code OAuth, encrypted server-side per-user data, private secret management, Gmail History API cursor sync, explicit per-action approval receipts, and audit retention policy. Separate pilot findings from production authorization.

## Research-linked 90-day commercial planning studio (v2)

The private workspace now includes a per-opportunity commercial planning studio. It uses the same imported six-thread evidence bundle and **up to ten primary studies** from the public research register. Matching ranks verified paper metadata by relevance to the engagement, not a claim that an AI model independently validated the customer's needs or performed a new 10-paper literature review.

- **Import:** A private bundle may contain an optional `plans` object keyed by opportunity ID. Each proposal keeps buyer needs, metric, owner, value assumptions and manual checks separate from imported Gmail facts.
- **90 days:** Day 0–30 qualification, days 31–60 commercial design, days 61–90 outcomes review. All are hypothetical stages until verified externally.
- **Economics:** Fill fee, estimated close probability, direct cost, acquisition cost and delivery hours to see downside/base/upside stress cases. The model uses `p × (fee - direct cost) - acquisition cost`; forecast values never become booked revenue. Empty amounts remain unknown, not $0.
- **Shared resources:** Shows separate signed-capacity allocation and uncontracted prospective demand, plus missing hour estimates. Records without signed terms are not counted as committed delivery.
- **Evidence gates:** Eight explicit conditions distinguish source evidence, commercial need, measurable outcome, financial coverage, written terms, authorization, capacity and a named reviewer. A plan is eligible for **planning-only** review with a source, scope, metric and reviewer; all external actions remain unauthorized regardless of the checkboxes.
- **Review and privacy:** The review is SHA-256 hash-linked to the plan's exact source date, scope, assumptions and research selection and stored only in memory or the opt-in encrypted browser vault. Editing the plan creates a new version. Download as local Markdown for customer-independent review. A reviewed plan never sends Gmail, signs contracts or spends money.
- **Suggested six-account starter bundle:** Prepared privately in ChatGPT, not included in public GitHub files. It contains carefully labelled *operator-side hypotheses* for US Performance Academy, BOOMIN, Anaheim Family YMCA, Pronix, YMCA of the USA and Nexplore, with empty financial inputs and no named reviewer.

### Validation

`node --test tests/commercial-planner.test.mjs` verifies deterministic financial math, missing data handling, signed-vs-unsigned capacity, paper provenance, plan safety, and evidence linkage. `node tests/commercial-planner.browser.mjs` uses local synthetic data to test both mobile and desktop flows including import, paper matching, economics, planning review, AES vault save and reopen, without Gmail calls or real personal information. A targeted GitHub workflow runs the headless browser test on relevant changes.

**Not yet complete:** Live production Gmail OAuth verification on the user's own Google Cloud credentials, an independently hosted secure backend, automatic research publication from the public candidate discovery workflow, calibrated commercial forecasts, CRM/accounting integrations or automated external execution. These require separate user-controlled infrastructure and testing, not simply a public static site.

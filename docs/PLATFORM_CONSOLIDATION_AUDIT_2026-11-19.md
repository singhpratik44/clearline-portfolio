# APERTURE platform consolidation — verified inventory
Audit date: 2026-11-19. Sources: connected GitHub, Render, Vercel account inspection, Render build logs, and direct browser checks. This record distinguishes repository configuration, deployed state, and live HTTP behavior.

## Canonical source
- Main public source: `singhpratik44/clearline-portfolio` (main). GitHub Pages canonical URL: https://singhpratik44.github.io/clearline-portfolio/
- Main branch head observed: `efff60fc2fe0df9004d89af2baf7399c667bbf8f` (2026-11-20 02:26 UTC).
- Other accessible repositories: `codeninjas-governance-engine` (private), `job` (private), `research-graph-engine` (public), `Quantum-governance` (public, empty), `aegis-governance-kernel` (public, empty).
- Do not merge or delete repositories without dependency and ownership review.

## Render services observed
All seven services below point at `singhpratik44/clearline-portfolio`.

| Service | Kind | Branch | Auto deploy | Latest recorded live deployment | Commit |
| --- | --- | --- | --- | --- | --- |
| aperture-main-website | static | main | yes | Nov 13 | `4dcef4b` |
| aperture-own-the-room | static | main | yes | Nov 13 | `9e02e7e` |
| aperture-gift-studio | Node web | main | yes | Nov 13 | `3a360a4` |
| aperture-gift-delivery | Node web | main | no | Nov 13 | `4c145c1` |
| clearline-art-delivery | Python web | main | yes | Nov 13 | `4c145c1` |
| classicx-moments-store | static | main | yes | Nov 11 | `a091a1d` |
| aperture-gift-cloud-independent-preview | static | preview/gift-cloud-independent | no | Nov 14 | `2514db3` |

The core Render website's latest live commit (`4dcef4b`) predates the observed main head (`efff60f`). The live Render homepage displayed an older version with “12 ways to explore”; the GitHub Pages homepage displayed the newer directory with “13 ways to explore.” Both pages loaded in the browser. Treat Render as stale until its source SHA is refreshed and reviewed.

GitHub compare shows the website deployment is 247 commits behind main across 127 changed files (+3,400/−120 lines). The gift delivery deployment is 168 commits behind main across 76 changed files (+2,114/−85 lines). The diff includes a changed homepage and fulfillment server, plus many new public pages and workflows. This is a broad release; use an isolated review and regression pass before refreshing either live service.

The gift delivery service is live at https://aperture-gift-delivery.onrender.com, with automatic deployment disabled. Its active deployment (`4c145c1`) is from Nov 13. Render service metadata has no configured health check path, while repository `render.yaml` declares `/healthz`. The live `GET /healthz` returned `ok`. Direct invalid-session requests to `/api/redeem` and `/api/quiet-journal` were denied with invalid-session messages. No real checkout session was used.

The Nov 13 gift-delivery build log reports 32 tests passed and startup smoke checks passed, including health, purchase-denial routes, and secret isolation checks. This is dated build evidence; it does not prove a paid customer journey works today. Recent Render logs queried since Nov 19 contained no app/request entries for the website or delivery service.

Connected Vercel project listing returned zero projects in the queried account scope. This does not rule out projects in another account/team. Cloudflare account access was not available; Cloudflare Pages and DNS remain unverified.

## Follow-up CI and browser checks
- GitHub Actions audit workflow passed on branch `audit/render-deployment-drift-20261119`, commit `34182c754ca2c73a6df95f1df2b04a387b0b5b53`, run [44686002929](https://github.com/singhpratik44/clearline-portfolio/actions/runs/44686002929). The deployment configuration contract, homepage integrity checks, and gift fulfillment authorization tests all passed.
- The homepage tests were aligned with the current APERTURE directory and Athlete OS route; the Mission Operations sandbox assertion now checks its README link rather than obsolete homepage/shared-navigation links.
- The GitHub Pages homepage and public Gifter page loaded in the browser. This was a read-only page check; no gift form was submitted.
- The Render gift API's live health and invalid-session denial behavior were checked. This does not validate payment acceptance, successful entitlement delivery, webhook operations, accessibility, or mobile layout.

## Consolidation decisions
1. Keep `clearline-portfolio/main` as the current public source of truth pending architecture review.
2. Keep GitHub Pages canonical and Render website as an alternate until HTTP, DNS, redirects, metadata, and current deployed SHA are reconciled.
3. Keep separate runtime services for Gift Studio and fulfillment; do not move private keys or payment fulfillment into a static frontend.
4. Do not merge the audit branch or manually redeploy the stale production services before review of the deployment matrix, expected changes, and rollback plan.
5. The live `/healthz` path is verified, but setting it in the Render service configuration remains a separate change; the connected service currently reports an empty health-check setting.

## Verification gates
- [x] GitHub Actions audit workflow executes and passes on the audit branch.
- [x] Current main branch SHA and latest deployments for all seven Render services inventoried.
- [x] Browser-smoke checks: GitHub Pages homepage, Render homepage, public Gifter page, gift health endpoint, and two invalid-session denial routes.
- [ ] Inspect branch protection and reconcile GitHub Pages, Render, DNS, redirects, canonical metadata, and deployed SHAs.
- [ ] Complete mobile and accessibility browser checks and safely exercise the free gift creation flow without sharing personal data.
- [ ] Verify payment test mode, webhook signature validation, idempotency, delivery authorization, and secret isolation against current production settings; do not infer this from mocks or Nov 13 logs.
- [ ] Create a deployment matrix with source path, environment variable names, owner, rollback SHA, and health-check configuration.
- [ ] Only after passing gates: review a production redeploy plan, obtain explicit approval for any cutover, and monitor outcomes.

## Evidence boundaries
This follow-up used read-only GitHub and Render inspection plus direct GET requests to public pages and invalid-session routes. The only external writes were commits on the isolated audit branch. No main-branch merge, production deploy, DNS change, secret edit, payment, or real gift order was performed.

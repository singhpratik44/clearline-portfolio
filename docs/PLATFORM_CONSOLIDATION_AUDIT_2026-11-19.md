# APERTURE platform consolidation — verified inventory
Audit date: 2026-11-19. Source: connected GitHub, Render, and Vercel account inspections. This is an inventory, not a claim that end-to-end customer journeys have passed browser QA.

## Canonical source
- Main public source: `singhpratik44/clearline-portfolio` (main). GitHub Pages canonical URL: https://singhpratik44.github.io/clearline-portfolio/
- Other accessible repositories: `codeninjas-governance-engine` (private), `job` (private), `research-graph-engine` (public), `Quantum-governance` (public, empty), `aegis-governance-kernel` (public, empty).
- Do not merge or delete repositories without dependency and ownership review.

## Render services observed
All seven services below point at `singhpratik44/clearline-portfolio`.
| Service | Kind | Branch | Auto deploy | URL |
| --- | --- | --- | --- | --- |
| aperture-main-website | static | main | yes | https://aperture-main-website.onrender.com |
| aperture-own-the-room | static | main | yes | https://aperture-own-the-room.onrender.com |
| aperture-gift-studio | Node web | main | yes | https://aperture-gift-studio.onrender.com |
| aperture-gift-delivery | Node web | main | no | https://aperture-gift-delivery.onrender.com |
| clearline-art-delivery | Python web | main | yes | https://clearline-art-delivery.onrender.com |
| classicx-moments-store | static | main | yes | https://classicx-moments-store.onrender.com |
| aperture-gift-cloud-independent-preview | static | preview/gift-cloud-independent | no | https://aperture-gift-cloud-independent-preview.onrender.com |

Render deployment history checked: main website, gift studio, and gift delivery each had a latest recorded `live` deployment on Nov 13. These statuses do not prove present HTTP availability or functional checkout.
Connected Vercel project listing returned zero projects in the queried account scope. This does not rule out projects in another account/team.
Cloudflare account access was not available in this audit; Cloudflare Pages and DNS remain unverified.

## Consolidation decisions
1. Keep `clearline-portfolio/main` as the current public source of truth pending architecture review.
2. Keep GitHub Pages canonical and Render website as an alternate until HTTP, DNS, redirects, and metadata are independently verified.
3. Keep separate runtime services for Gift Studio and fulfillment; do not move private keys or payment fulfillment into a static frontend.
4. Avoid changing production DNS, disabling deployments, merging repos, or asserting payment readiness until a rollback plan and smoke tests exist.

## Verification gates before consolidation
- [ ] Enumerate GitHub Actions, branch protections, deployed SHA, and all Render deployment states.
- [ ] HTTP/browser smoke-test homepage, navigation, gift creation, accessibility, and mobile layout.
- [ ] Confirm Cloudflare account, project, domains, DNS records, SSL and canonical redirects.
- [ ] Verify payment test mode, webhook signature validation, idempotency, delivery authorization, and secret isolation.
- [ ] Create a deployment matrix with source path, environment variables (names only), owner, rollback SHA and health check.
- [ ] Only after passing gates: plan any migration, require explicit approval for DNS/production cutover, and monitor outcomes.

## Evidence boundaries
This audit was performed with read-only inspection of connected GitHub, Render and Vercel metadata, except for committing this documentation. It did not deploy new application code or alter DNS, secrets, payments, or service configuration.

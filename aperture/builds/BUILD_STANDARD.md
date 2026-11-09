# APERTURE Build Standard — v1.0

## Definition of done
A build is complete only when:
1. **Problem:** explicit business decision and affected user.
2. **Scope:** deliverables and non-goals are documented.
3. **Architecture:** data flow, state ownership, security boundary and deployment path are identified.
4. **Evidence:** source links and observed data are distinguishable from estimates.
5. **Acceptance:** objective tests exist and results are recorded.
6. **Accessibility:** keyboard, labels, contrast and mobile behavior are checked.
7. **Security:** no secrets in GitHub Pages; no private youth data; external actions gated.
8. **Release:** commit SHA, published URL, verification time, and rollback reference recorded.
9. **Operations:** owner, maintenance plan, incidents and change log defined.
10. **Integrity:** marketing claims reflect verified functionality.

## Mandatory release record
```json
{
  "id": "AP-YYYY-NNN",
  "version": "1.0.0",
  "owner": "Pratik Singh",
  "status": "implemented",
  "source_path": "",
  "commit_sha": "",
  "public_url": "",
  "verified_at": null,
  "acceptance_tests": [],
  "known_limitations": [],
  "rollback_commit": null
}
```

## Approval gates
- **G0 scope:** owner approves problem and non-goals.
- **G1 implementation:** code and documentation committed.
- **G2 verification:** independent tests, live URL and links checked.
- **G3 external pilot:** partner authorizes evaluation and data boundaries.
- **G4 production:** measurable real use, monitoring and rollback readiness.

## Architecture decisions
- GitHub Pages is static hosting, not an API, CRM or secure backend.
- LocalStorage and browser calculators are non-authoritative and unsuitable for cross-user operational records.
- Real partner workflows require authenticated backend, database, access control, audit log and consent/privacy design.
- AI agent roles are specifications until connected to runtime, tool permissions, evaluations and human approvals.

## Change control
Use semantic versioning; record migration and rollback for breaking changes. Never overwrite outcome history with a new projection. Keep evidence timestamps and origin. A superseded prototype remains archived rather than silently promoted to production.

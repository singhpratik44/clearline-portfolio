# APERTURE — canonical build system

APERTURE is a versioned decision and execution framework. Its source of truth is Git, not a landing page or a conversational claim.

## Contract
Every build has a unique ID, owner, problem statement, target users, evidence basis, deliverables, dependencies, risk controls, acceptance tests, status and immutable commit reference. A build is not called deployed merely because a commit exists.

## Status model
- proposed: idea only
- specified: scoped with acceptance criteria
- implemented: source committed
- verified: tests and actual public URL checked
- piloting: authorized partner/user evaluation
- operating: ongoing real use with measured outcomes
- archived: superseded and retained

## Layout
- `builds/registry.json` — machine-readable canonical registry
- `builds/BUILD_STANDARD.md` — requirements, evidence, release gates, and rollback
- `builds/basketball-futures-v1.md` — detailed program specification
- `career-os/basketball-futures/` — public-facing presentation, not the source of truth

## Release procedure
1. Specify the decision, users, scope, risks and evidence.
2. Implement the smallest complete vertical slice, including data contract and tests.
3. Record test output, accessibility and security checks, and preview link.
4. Independently check the public page, version and links.
5. Obtain human approval for outreach, spending, contracts and external claims.
6. Update registry with exact commit SHA and evidence; archive superseded releases.

## Principles
Truth before narrative. Evidence before assertion. Dependencies before deadlines. Human approval before external action. Avoid fabricating NBA affiliation, client data, sponsor commitments, job openings or achieved outcomes.

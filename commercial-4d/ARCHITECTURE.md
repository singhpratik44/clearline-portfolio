# APERTURE Commercial 4D — Architecture and release contract

Status: **interactive synthetic prototype deployed**. This document is the production design, not a statement that integrations or approvals are already implemented.

## Objective

Turn separate commercial contacts, franchise/unit data, research findings, contracts, delivery resources, and portfolio opportunities into one **time-aware decision system**. Optimize commercially relevant outcomes without permitting unreviewed external actions.

## Four-dimensional state

- **X = value:** expected bookings, revenue, contribution margin, contract value, and cash impact.
- **Y = risk:** uncertainty, collection risk, delivery failure, concentration, legal/compliance exposures, and downside constraints.
- **Z = dependency/network:** required people, institutions, counterparties, capital, effort, permission gates, and competing shared resources.
- **T = time:** discovery, pipeline maturation, delivery windows, renewals, cash receipt, and revisions to recorded assumptions.

The visualization is an inspectable projection of a typed underlying graph, **not** a substitute for the graph itself. No "4D" literal physical claim.

## Canonical graph entities

`Organization`, `Contact`, `Opportunity`, `Need`, `Offer`, `Agreement`, `Evidence`, `Study`, `Metric`, `Assumption`, `PlanVersion`, `Scenario`, `Milestone`, `Resource`, `Dependency`, `Approval`, `Action`, `Outcome`.

Every claim records `source_uri`, `retrieved_at`, `as_of`, `evidence_class`, `owner`, `confidence`, `review_status` and `supersedes`. External correspondence is private; public demos use synthetic records only.

## Opportunity-to-execution loop

1. **Discover** an authorized commercial opportunity and counterparty, preserving original words, requirements and response history.
2. **Validate** eligibility, contact/delivery status, current need, rights and economics; reject unsupported claims.
3. **Research** the last 90–150 days from the source registry, up to ten relevant primary studies; record publication type, version, findings, limitations and implementation hypotheses.
4. **Model** budget, leads, conversions, close cycles, supply/delivery capacity, staffing, project dependencies, gross contribution and cash movements in a common graph.
5. **Stress-test** baseline, downside, upside and adversarial failure cases; compare against simple deterministic baselines and backtests without temporal leakage.
6. **Propose** one action with counterfactual, reversible boundaries, owner, evidence, cost cap, and success/rollback triggers.
7. **Approve** through a human action-specific authorization mechanism. No auto-send, auto-sign, auto-hire, auto-purchase or spending without explicit permission.
8. **Execute and measure** the approved activity, record actual outcomes, and selectively patch affected plan branches rather than overwrite history.

## Research sources and practical handling

- arXiv API: query title, ID, submitted/updated dates, abstract, categories; maintain version lineage.
- OpenReview: query available public submissions, decisions, reviews and author revisions, without assuming review is always public.
- ICML/PMLR and NeurIPS: official paper lists, acceptance status and conference year; avoid representing submitted work as accepted.
- AutoML: use current conference/OpenReview pages; automl.org closure makes the older domain an archive, not a continuous source of new research.
- LangChain Blog: implementation patterns (evaluation traces, human review); label as industry guidance, not peer-reviewed.
- Hugging Face Papers: paper discovery, model/card/code links; verify all claims at primary sources.
- Papers with Code: verify the current maintained catalog at paperswithcode.co; join benchmarks to arXiv/DOI and code revision.
- MLPapersWeekly: newsletter discovery only; check archive availability and always trace claims back to papers.

Implementation rule: a research mention **cannot directly modify production policy**. It generates a change proposal and benchmark plan.

## Commercial core metrics

`pipeline_by_stage`; `partner_attributed_leads`; `qualified_conversion`; `sales_cycle`; `realized_revenue`; `gross_margin`; `delivery_utilization`; `customer_concentration`; `invoices_paid`; `cash_runway`; `proposal_to_contract`; `approved_vs_executed_variance`; `repeat_work`; `cost_per_qualified_outcome`.

## Safeguards

1. No private correspondence, medical details or access credentials published to GitHub Pages.
2. Partner status typed as `contacted`, `responded`, `negotiating`, `approved`, or `contracted` with evidence; never infer contracts from replies.
3. Separate unverified opportunity, illustrative target, historical performance, confirmed revenue, and forecast estimate.
4. Enforce company-level budget, capacity and concentration limits across agents, not only per-agent limits.
5. Each outbound action requires fresh, non-reusable approval; logs preserve exactly which material was authorized.
6. Retain asynchronous/scheduled tasks only as explicitly permitted and configured; pure simulation performs no side effects.

## Release stages

**V1 — delivered:** Public commercial spatial/time planner, sliders, four business verticals, 24-month deterministic projections, downside/base/upside cases, download, evidence register of ten studies, CI source/model tests.

**V2 — proposed:** Secure opportunity ledger from Gmail/CRM with deduplication and bounce detection, explicit provenance, role access, versioned assumptions, and owner-controlled plan export. Keep business data private.

**V3 — proposed:** Historical backtesting and forecast calibration, cost/capacity solver, contract-cycle accounting, approval kernel, agent execution traces and experiment outcomes.

**V4 — proposed:** Organization-specific commercial planner that generates a research-linked 30/60/90-day offer, counterfactual business case, and pre-approved presentation from a verified opportunity.

## Acceptance criteria for production

- Same inputs + model revision produce the same outputs, with variance within floating-point tolerance.
- Verified source timestamps, peer-review status and 10-paper research selections are reproducible and auditable.
- No future leakage in historical evaluation.
- Every task has a named owner; every external action has a unique approval record.
- Simultaneous projects cannot double-allocate people, dollars, time or contracted partner authority.
- Forecasts carry calibrated uncertainty and a baseline comparison; synthetic demonstration numbers never masquerade as actual customer results.
- Responsive mobile experience and reduced-motion support.
- Zero public PII or sensitive source data.

## Direct research register

See [research.json](./research.json) for the ten sourced papers (June–October 2026) and the source-provider roadmap.

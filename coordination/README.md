# Clearline shared agent ledger (proposal)

This is the shared, non-sensitive coordination contract for the scheduled Job Application Agent and Clearline Build Agent. A scheduled ChatGPT run does **not** automatically read or write this file; each run must explicitly fetch and update it using available GitHub tools. No submission or deployment may be inferred from a status label.

## Canonical record

Store one JSON record per action in `coordination/events.jsonl`, append-only in conceptual semantics. Each record must include:

- `id`: unique stable action ID
- `timestamp`: ISO-8601 timestamp of the recorded event
- `agent`: `jobs` or `build`
- `entity_id`: job posting ID or repository issue/PR reference
- `kind`: `discovered`, `verified`, `proposed`, `approved`, `submitted`, `confirmed`, `implemented`, `tested`, or `blocked`
- `evidence_urls`: array of direct evidence URLs
- `depends_on`: event IDs or blocker IDs
- `summary`: short non-sensitive statement
- `authority`: `agent-proposal`, `owner-approved`, or `provider-confirmed`

Never store personal contact details, student data, API keys, private job applications, or credentials in the public repository. Job-agent submissions require explicit role-specific approval and actual provider confirmation. Build-agent production merges/deployments require owner approval.

## Shared work loop

1. Read latest event history and reconcile GitHub PRs / application confirmations; treat missing evidence as unknown.
2. Jobs agent ranks live openings and proposes at most one **reusable** Clearline work-sample capability, referencing a verified job requirement.
3. Build agent ranks dependencies, chooses the smallest shared improvement, works on a feature branch and attaches test evidence.
4. Human approves external submissions, production merges, and deployments.
5. Each agent records only evidenced transitions and reports blockers. Never overwrite history or infer outcomes from a proposal.

## Initial status

This contract is installed as a proposal only. Automated cross-run ledger writes and conflict-safe append behavior are **not yet implemented**. Next implementation step: add a schema validator, deterministic deduplication and a safe append operation with optimistic concurrency. Keep the event log empty until there are verifiable events.

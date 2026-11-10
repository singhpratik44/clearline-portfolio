# APERTURE / CAUSAL LOOM
A meetings + project execution experience shaped like a causal/time constellation rather than a dashboard wall.

**Live:** https://singhpratik44.github.io/clearline-portfolio/mission-control/

## Working prototype features

- Interactive project-orbit visualization: meetings are teal portals, proposed decisions violet pulses, executable tasks luminous lime, blocked work coral. Explicit source-to-proposal-to-task and task-to-task dependencies become visible connections. Time scrubber reveals the state over a 90-day lookahead; project and lens filters focus the view.
- Private local meeting room: record title, scheduled start, facilitator, agenda, source notes, download standalone agenda/meeting brief and an unsent `.ics` calendar event file.
- Project execution field: create a project, goal and owner; create tasks with due dates; start, complete or reopen them; connect prerequisites across projects; prohibit cycles, duplicate prerequisites or completing a blocked task.
- Decision gate: manually draft an action from a meeting with the original source/excerpt and named owner, then explicitly review and approve local task creation. **This only creates an internal task.** It does not approve external email, contract, calendar, financial, hiring or vendor actions.
- Operational readouts: ready, blocked, overdue, unreviewed actions, upcoming meetings, critical unresolved predecessor-depth chains, and a recent local event trail.
- A synthetic interactive demonstration loads by default, prominently labeled. No real customer or calendar information is included in the repository.
- Private data: export/import JSON; opt-in encrypted browser vault (AES-256-GCM, PBKDF2-SHA256) using a separate IndexedDB namespace from Commercial 4D. No data is automatically saved or uploaded to GitHub. A lost passphrase is unrecoverable.
- Research observatory: ten dated, primary-source papers from July-November 2026, with explicit preprint/proceedings distinctions and application limitations; nine discovery resources are listed but **not claimed as connected ingestion feeds**.

## First use

1. Open the live site. Explore the clearly labeled synthetic world; click orbital nodes, switch between Universe, Meetings, Execution and Tension, and move the time lens.
2. Select a meeting in Meeting Room, edit notes and record them. Use the decision form below to cite an exact excerpt from a meeting and propose an action.
3. Enter a reviewer name and explicitly tick internal task creation before approving. The approved action becomes one traceable task with a source-meeting link; original proposal stays in history.
4. Change task progress; incomplete predecessors block completion. Use the dependency composer to connect work.
5. Select **Clear workspace** to begin a genuine private plan. Enter your own projects and meetings. Download JSON or choose an AES-256-GCM vault passphrase to save encrypted locally. **Never commit private exports to this public repository.**
6. Use standalone .ics export to put an event into a calendar. This is an importable file, not a meeting invitation or calendar sync.

## Evidence contract

A meeting note is a **user-entered source**, not an authenticated transcript. A proposed decision is not an agreement. A review creates only a local task and is not an operation-bound external approval. Dependency checks are deterministic and immediate. The graph shows a planning horizon, not a forecast of a promised completion date.

This personal pilot is not a production collaboration SaaS: it has no shared server, per-organization identity, Google Calendar/Meet or Zoom authorization, recording/transcription, concurrent editing, push sync, server-signed audit trail, external actions, or continuous research ingestion.

## Research

`research.json` contains ten individually dated recent sources. Sources such as arXiv (abstracts, dates, versions), OpenReview (submissions/reviews), NeurIPS and ICML official lists, AutoML, LangChain Blog, Hugging Face Papers, Papers with Code and MLPapersWeekly form a discovery plan. Merely listing them is **not** a claim that each feed or review status has been automatically checked.

Use [MASTER_PROMPT.md](./MASTER_PROMPT.md) for the 3x upgraded implementation mandate and acceptance criteria.

## Tests and release

- `node --test tests/mission-control.test.mjs`: graph validation, cycles, decision reviews, task transitions, ICS, primary research and privacy boundaries, encrypted roundtrip, script DOM wiring.
- `node tests/mission-control.browser.mjs`: Playwright mobile/desktop end-to-end test of meeting edits, evidence-linked proposal, human review, task creation, local audit, encryption and reopen.
- `.github/workflows/mission-browser.yml`: targeted browser verification on changes.
- `.github/workflows/deploy-pages.yml`: publishes this route (allowlist), stamps release commit SHA, verifies source files and public deployed page at the exact SHA.

## Next secure integrations

Use delegated, minimum-permission Google Calendar read-only (or approved Microsoft 365/Teams/Zoom) for meeting import. In a separate authenticated backend, store per-tenant encrypted data, idempotent external event IDs, consent for recording, and user-specific approval receipts. Any external calendar write or task write needs **separate** explicit action authorization, confirmed provider permissions and a reversible trail. Research ingestion can use the existing bounded public candidate-discovery workflow but should remain human-curated before changing business methods.

**Cost discipline:** zero mandatory model calls, no hosted database for the pilot, no paid API for deterministic graph operations.

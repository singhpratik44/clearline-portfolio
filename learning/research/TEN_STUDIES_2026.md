# APERTURE Learning — Evidence Review 01
## Ten recent research works, Aug–Oct 2026 | Reviewed 2026-11-09

**Scope:** Primary abstracts/metadata and accessible paper pages, NOT a systematic review or full reproduction of experiments. Ten distinct works are identified by stable source URLs, date and research type. They guide product *hypotheses*, not claims that APERTURE has demonstrated learning gains. The user requested a rolling recent-literature review from arXiv, OpenReview, NeurIPS/ICML lists, AutoML.org, LangChain Blog, Hugging Face Papers, Papers with Code and MLPapersWeekly. Those sources are a **discovery pool**; the ten verified items below are research works, most with primary arXiv pages. Non-study blogs, conference lists, and mirrored paper cards are supporting resources, not extra independent studies.

### 1. RegulaTutor — Evidence first, policy second
- **Source:** https://arxiv.org/abs/2610.13399
- **Submitted:** 2026-10-09. **Type:** Research preprint / technical evaluation.
- **Authors:** Yonggang Li, Boqian Han, Rui Sheng, Yushi Sun, Zixin Chen.
- **Reported:** Links longitudinal learner evidence to explicit interpretation and pedagogy; separates harness errors from model errors in refinement.
- **UI consequence:** In the private learner dossier, show **submitted artifact → evidence note → coach review → next proposed action**, instead of an unexplained progress percentage. Display origin, review state and timestamp.
- **Caveat:** The paper does not validate APERTURE or a specific portfolio UI.

### 2. CoLearn — Personalization should be inspectable
- **Source:** https://arxiv.org/abs/2609.21154
- **Submitted:** 2026-09-17. **Type:** Research preprint; evaluations including simulations and question preferences.
- **Authors:** Kailai He et al.
- **Reported:** A memory-and-knowledge-tracing tutor with visible evidence and iterative adaptation; blind comparisons preferred conditioned questions in the authors' tests.
- **UI consequence:** Present a **learner-controlled project history** and distinguish *observed*, *coach-verified*, *not yet assessed*. Never infer real mastery from clicks on the public 4D map.
- **Caveat:** Simulation preferences do not establish K–12 learning outcomes on our platform.

### 3. When AI Tutors Speak — Structure before spectacle
- **Source:** https://arxiv.org/abs/2609.23958
- **Submitted:** 2026-09-21. **Type:** Preregistered randomized field experiment in a graduate corporate-finance course.
- **Authors:** Shihao Yang, Marshall Van Alstyne, Chrysanthos Dellarocas.
- **Reported:** Structured tutoring improved measured outcomes versus consumer AI access; voice enhanced interaction more than educational performance in the reported setting.
- **UI consequence:** Make **learning objective, task, feedback, explanation** first-class UI. Animations and voice are optional supports, not the product's learning claim.
- **Caveat:** Adult MBA students, not 7–17-year-olds; do not project the measured effect onto APERTURE learners.

### 4. Sherpa — Different learners need different teaching approaches
- **Source:** https://arxiv.org/abs/2610.08778
- **Submitted:** 2026-10-06. **Type:** Research preprint; simulated student archetypes, benchmark and human preferences.
- **Authors:** Weixian Xu, Yanzhe Zhang, Zora Zhiruo Wang, Changyu Chen, Diyi Yang.
- **Reported:** Adaptive teacher strategies outperformed a base model across study conditions.
- **UI consequence:** Describe **why** a project pathway was proposed, with a human-instructor adjustment point, rather than treating an algorithm's recommendation as authoritative.
- **Caveat:** Do not import benchmark numbers as promised success for students.

### 5. DashAct — Stateful interfaces need visible dependencies
- **Source:** https://arxiv.org/abs/2609.32385
- **Submitted:** 2026-09-26; **revised:** 2026-10-19. **Type:** HCI/AI benchmark preprint.
- **Authors:** Chuhan Zhang et al.
- **Reported:** Interactive dashboard workflows require maintaining context and grounding actions; the benchmark disaggregates failures by stage.
- **UI consequence:** Add visible **step context, action state, origin and next step**, with semantic labels and accessible alternatives to the animated spatial map.
- **Caveat:** Evaluates GUI agents, not a study showing that one APERTURE layout improves engagement.

### 6. Pedagogical Suitability Index — Appropriate to the learner
- **Source:** https://arxiv.org/abs/2608.05411
- **Submitted:** 2026-08-05. **Type:** Research preprint, scenario-based tutor evaluation.
- **Authors:** Benjamin Barlog, Hudson Craig, Zedong Peng.
- **Reported:** Evaluates pedagogical fit beyond answer correctness; feedback-driven regeneration improved many weak cases in the authors' evaluations.
- **UI consequence:** Show **age band, prerequisites and learning readiness**, and request a coach check for advanced AI agents and computer vision tracks.
- **Caveat:** Not a clinically/educationally validated diagnostic tool for individual children.

### 7. Methodologies for Improving the Quality of AI Tutoring in K–12
- **Source:** https://arxiv.org/abs/2608.11259
- **Submitted:** 2026-08-07. **Type:** Practitioner/technical report, not a randomized effectiveness trial.
- **Authors:** Tushar Udeshi et al.
- **Reported:** Khanmigo team describes evaluating tutor quality, engagement and changes to models, prompting, personalization and agents.
- **UI consequence:** Add measurable **fulfilled lesson / artifact / coach review** checks. Keep experiments and AI tooling behind human approval.
- **Caveat:** This is not an endorsement of APERTURE by Khan Academy.

### 8. Learning to Prompt — Scaffold based on what is needed
- **Source:** https://arxiv.org/abs/2606.20138
- **Submitted:** 2026-06-18; **revised:** 2026-08-26. **Type:** Research paper, marked as accepted to EMNLP 2026 Industry Track.
- **Authors:** Po-Chin Chang, Nicholas Hogan, Aske Plaat, Michiel T. van der Meer.
- **Reported:** Adaptive prompt routing with simulation and high-school classroom interaction tests.
- **UI consequence:** Use **guided choices, goal-based scaffolding, and concise prompts**. Do not force endless conversation for a simple scheduling action.
- **Caveat:** Paper began in June; included because a substantive revision falls in August.

### 9. Incremental Predictive Value of LLM Tutoring Interactions — Beware false analytics
- **Source:** https://arxiv.org/abs/2610.33488
- **Submitted:** 2026-10-24. **Type:** Retrospective predictive analysis preprint.
- **Authors:** Zeyu Dong, Mikael Kwame Kuada, Asa Holley Buchakjian-Tweedy, Ibrahem Aljabea.
- **Reported:** Tutoring-interaction features offered little reliable gain over a constant baseline in that study; paper explicitly does **not** establish a learning effect.
- **UI consequence:** **No fake mastery scores, engagement-derived ability predictions, or progress percentages** when only clicks or sample interactions exist. Mark demonstrations as fictional.
- **Caveat:** Higher-education dataset and methodological question, not a judgment of APERTURE's learners.

### 10. Adaptive Large Language Model Scaffolding Supports Online Programming Education
- **Source:** https://link.springer.com/article/10.1007/s44217-026-02172-8
- **Published:** 2026-09-17. **Type:** Peer-reviewed/open-access research article (publisher page), mixed-method field comparison.
- **Author:** Pavel Bartoš.
- **Reported:** An adaptive programming-support design combining knowledge-component maps, event-history prediction, teacher recommendations and explainable analytics.
- **UI consequence:** Organize coding progress by **concept, evidence and next action**, keep the human coach visible, and clearly label what the product has and has not assessed.
- **Caveat:** We are borrowing a design principle, not replicating its system or asserting a measured gain.

---

## Cross-source discovery notes (not counted as 10 additional studies)

- [arXiv](https://arxiv.org/) — source abstracts, revision histories, identifiers and author metadata above.
- [OpenReview](https://openreview.net/) — source of submissions and reviews. A particular relevant recent decision/review was not independently verified for this ten-item set; do not claim one was.
- [NeurIPS 2026 downloads](https://neurips.cc/Downloads/2026) and [ICML 2026 downloads](https://icml.cc/Downloads/2026) — large paper indexes useful for search; listing alone is not a reviewed empirical study.
- [AutoML.org](https://automl.org/) — official August 6, 2026 closure notice; research lineage has moved to [automl.space](https://automl.space/). Avoid presenting the old site as an actively updated research feed.
- [LangChain Blog](https://www.langchain.com/blog) — operational design references, e.g. [searching agent traces (2026-10-13)](https://www.langchain.com/blog/agent-traces-ai-search-langsmith). Vendor engineering blog, not a peer-reviewed K–12 learning study.
- [Hugging Face Papers: Sherpa](https://huggingface.co/papers/2610.08778) — an accessible **mirror/curation entry for study 4**, not an 11th independent study.
- [Papers with Code](https://paperswithcode.com/) and [MLPapersWeekly](https://mlpapersweekly.com/) — discovery/indexing/newsletter channels; not automatically evidentiary proof of product decisions.

## Evidence → implementation gates

| Design decision | Primary research anchors | Public preview now | Private rollout gate |
|---|---|---|---|
| Hide fake success metrics | 9, 2 | Demo/preview clearly marked | Verified submissions + coach approval |
| Record the reason behind a milestone | 1, 5, 10 | Study-to-feature methods cards | Private, RLS-protected evidence chain |
| Human adaptation | 4, 6, 8 | Sample learning route with prerequisites | Verified instructor assigned |
| Keep the UI professional and instructional | 3, 5 | Focused cockpit, clear stages, no decorative gamification | Usability test with adults |
| Diagnose failure before adding AI | 7, 9, 5 | Source transparency and explicit unknown states | Evaluation plan with baselines |

**Public launch disclaimer:** APERTURE Learning is independent. Research citations are references for design exploration, not endorsement by researchers, venues, organizations or claims of equivalent educational results. Full-text critical appraisal and user testing are pending.

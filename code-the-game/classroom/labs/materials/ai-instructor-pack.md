# Explainable AI & Data Instructor Pack — CODE THE GAME

Independent classroom resource · Version 1 · 3 lessons × 45–60 minutes

**Important:** The interactive exercise uses a fixed deterministic threshold, not a trained machine learning model. Reference labels are fictional and intentionally include an outlier.

## Lesson 1 — Rules and predictions
**Question:** How does a computer make a repeatable decision?
Students predict outcomes for brightness readings 24, 38, 48, 55, 67 and 79 at threshold 50. If a reading is at least the threshold, the prediction is bright; otherwise dim.
**Evidence:** Six predictions and a written rule.
**Check:** At threshold 50, the predicted labels are dim, dim, dim, bright, bright, bright.

## Lesson 2 — Accuracy and failure cases
**Question:** Why can a transparent rule still be wrong?
Students compare reference labels: dim, dim, bright, bright, bright, dim.
Test thresholds 40, 50 and 70 and count matches.
**Answer key:**
- Threshold 40: predictions dim, dim, bright, bright, bright, bright → 5/6 correct.
- Threshold 50: dim, dim, dim, bright, bright, bright → 4/6 correct.
- Threshold 70: dim, dim, dim, dim, dim, bright → 2/6 correct.
**Important:** The reading 79 is intentionally labeled dim, so any simple monotonic threshold will struggle. Explain why more features, better labels or different measurement methods might be necessary.

## Lesson 3 — Human oversight
Students propose a safe use for a brightness rule, then explain when a human should override it.
Discuss whether one score represents fairness, safety or usefulness.
**Evidence:** Claim, numerical support, a limitation and a revised rule or data-collection plan.

## Reproducible student worksheet
Threshold A: ______ Matched labels: ____ / 6
Threshold B: ______ Matched labels: ____ / 6
Threshold C: ______ Matched labels: ____ / 6
Which example was hardest to classify? ______
What evidence would help? ______
Why is this *not* a trained AI model? ______
One privacy or safety concern: ______

## Rubric (/12)
Accurate calculations, evidence from comparisons, limitations, responsible design; score each 0–3.

## Teacher safeguards
All examples are fictional. Do not upload student information or ask learners to classify real people. Encourage critical thinking about bias without implying that six samples establish statistical fairness or a deployable model.

# APERTURE Basketball Creator Pathway — Instructor Pack v1

**Status:** Pilot teaching materials; not yet classroom validated. **Audience:** ages ~9–16, adapt by experience. **Schedule:** three 60-minute sessions plus a 60-minute showcase; expand to four weeks with independent work.

## Outcomes
Students will (1) identify an event and variable in Scratch, (2) implement a scoring rule in MakeCode Arcade, (3) record and calculate shot statistics in Python, and (4) explain one test and one improvement. Do not require students to publish accounts or personal information.

## Session 1 — Scratch: events and variables
**0–10 min:** Demonstrate a court backdrop, ball sprite, and hoop sprite. Ask students to predict what happens on green flag.
**10–25:** Students create sprites and a score variable. Add `when green flag clicked → set score to 0`.
**25–45:** Add `when space key pressed` to move the ball and `if touching hoop` to add 2 points; reset ball after the attempt. Explain that overlap is a simplified shot model.
**45–55:** Test miss, make, and restart. Fix accidental repeated scoring by allowing only one score per attempt.
**55–60:** Exit ticket: identify one event and one variable.
**Stretch:** Three-point region or timer.
**Evidence:** Student demonstrates reset, a miss, and a make.
Official editor: https://scratch.mit.edu/projects/editor/

## Session 2 — MakeCode Arcade: input and collisions
**0–10:** Compare Scratch event blocks with Arcade controller events.
**10–25:** New project at https://arcade.makecode.com/. Create player and hoop sprites; enable controller movement.
**25–45:** On A-button press, spawn a ball projectile. On overlap with hoop, increment score and destroy projectile. Add a separate overlap or timeout for misses.
**45–55:** Test multiple button presses and ensure a single projectile cannot score twice.
**55–60:** Exit ticket: explain the difference between an input event and an overlap event.
**Stretch:** Moving hoop, countdown, or lives.
**Evidence:** 30-second playable demo with score and at least one test.
**Note:** This pack provides build instructions, not an imported .png or .uf2 starter project.

## Session 3 — Python: sports data and tests
**0–10:** Connect game score to real data: makes, attempts, points.
**10–25:** Download/open `basketball_stats.py`; run `python basketball_stats.py` in Python 3.
**25–45:** Enter made/missed shots. Read `Player.shoot`, `percentage`, and `report`. Change the player's name and add a shot log.
**45–55:** Test no attempts, two makes, misses, and invalid input. Confirm zero attempts does not divide by zero.
**55–60:** Exit ticket: explain why attempts and points are different.
**Stretch:** Two-player comparison; CSV export using only the standard library.
**Evidence:** Screenshot or live run showing three valid shots and a correct percentage.

## Session 4 — Showcase and review
**0–15:** Teams rehearse a two-minute demo.
**15–40:** Each student demonstrates one working project and one bug fixed.
**40–50:** Peer feedback: one thing that works, one test to add.
**50–60:** Instructor completes rubric and recommends next pathway.

## 10-point rubric
- **Functionality (0–3):** 0 none; 1 partial; 2 core interaction works; 3 works reliably across tests.
- **Programming concepts (0–3):** 0 none; 1 identifies blocks/code; 2 modifies with explanation; 3 combines concepts independently.
- **Testing/debugging (0–2):** 0 none; 1 runs a test; 2 explains a failure and correction.
- **Communication/creativity (0–2):** 0 none; 1 shows or describes; 2 demonstrates and explains a meaningful improvement.

## Student worksheet
**Name/alias:** ______  **Date:** ______  **Project:** ______
1. What are you building and who will use it?
2. Draw the sprites/inputs/output before coding.
3. Predict what will happen when you press shoot.
4. Record three tests: **Input | Expected | Actual | Fix**.
5. Circle the concept used: event / variable / condition / loop / function.
6. What bug did you fix?
7. What would you improve with one more hour?
8. Demonstrate your project and ask a peer for feedback.

## Instructor safeguards
Use fictitious sports statistics; do not collect minors' names, video, or performance data without appropriate consent and safeguards. Third-party tools have their own age/account and classroom policies. Instructor confirms hardware and browser compatibility before class.

## Pilot validation
Track completion, minutes spent stuck, bugs by concept, student explanations, and instructor prep time. Revise after observing a real class.

---
description: Build a ROADMAP milestone end to end — plan, implement, review, verify the exit criterion, tick the box, commit.
argument-hint: [milestone, optional — defaults to the current ROADMAP milestone]
---

Build `$1`, or the current `ROADMAP.md` milestone if no argument is given. This command
orchestrates; the depth lives in the skills and agents.

1. **Plan.** Restate the milestone and its exit criterion. List the files you will add or change.
   Keep the change scoped to this one milestone.
2. **Implement.** Write the code or docs. Follow `.claude/STYLE.md`. For audit-runtime work,
   follow the relevant skill (`crawl`, `reason-pillars`, `write-report`, `eval-audit`); for an
   audit itself, run the full `audit-storefront` pipeline.
3. **Review.** Invoke the `code-reviewer` agent on the diff. Apply every required change before
   continuing. Do not self-certify.
4. **Verify the exit criterion.** Run the actual command the milestone names and confirm it
   produces the artifact or score required. A milestone is not done because the code looks right;
   it is done because its exit criterion passed.
5. **Guardrail.** If the change touches the audit pipeline and `sample_output/` exists, re-grade
   both calibration stores and confirm no regression below their current scores (the quality bar
   in `ROADMAP.md`).
6. **Tick and commit.** Mark the milestone `- [x]` in `ROADMAP.md` and commit everything in one
   Conventional Commits message.

Stop and report at the first step that fails. Do not proceed past a failing step, and do not tick
a box whose exit criterion did not pass.

---
name: eval-audit
description: Score an audit report. Use after writing a report, or to grade any report for any store. Runs the deterministic grader, then the judged quality pass, against the rubric.
---

# Score an audit

Two layers, cheap first.

## 1. Deterministic gate

```
node eval/grade.mjs sample_output/<host>/report.md
```

Scores structure, schema, pillar diversity, citation grounding, tech-check fidelity,
generalization, and prose hygiene against the store's own `crawl/manifest.json`. Prints a
scorecard, writes `sample_output/<host>/eval.json`, and exits non-zero below the gate. Each
failure names the exact experiment and check, for example a cited screenshot that is not on disk.
Fix those first; they are objective.

## 2. Judged pass (record it, do not skip it)

Then judge what a script cannot, scoring each 0 to 1 with a one-line reason that cites the part
of the report you read. Definitions are in `eval/rubric.md`:

- **J1 Evidence soundness** — does each hypothesis follow from the artifact it cites?
- **J2 Actionability** — is the primary change buildable, are its numbers grounded?
- **J3 Prioritization** — are the biggest leaks the top experiments?
- **J4 Competitor realism** — are competitors real, in-category, and worth copying?
- **J5 Executive insight** — does the summary name the true biggest leak?

Write the five scores and reasons into `eval.json` under a `judged` key, so every audit carries
its full record. A report that clears the gate but scores low on J1 or J5 is well-formed and
substantively weak, which is the most useful thing the eval can say.

## Calibration

`eval/cases/` holds graded reference audits with their expected scores. Run the grader against
them to catch regressions in `grade.mjs`, and compare the judged scores to the human notes there
to keep the judge calibrated. When a judged failure recurs, promote it into a deterministic check
in `grade.mjs` so it stops needing the model. That promotion loop is the subject of `EVAL_LOOP.md`.

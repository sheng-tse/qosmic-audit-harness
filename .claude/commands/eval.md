---
description: Score an existing audit report — deterministic grader plus the judged J1-J5 pass.
argument-hint: <path/to/report.md>
---

Score the report at `$1` against the rubric. Follow the `eval-audit` skill.

1. `node eval/grade.mjs $1` for the deterministic layer. Read the scorecard; every failure it
   lists is objective, so fix those first if you also own the report.
2. Run the judged pass (J1-J5 in `eval/rubric.md`): evidence soundness, actionability,
   prioritization, competitor realism, executive insight. Score each 0 to 1 with a one-line
   reason, and write them into the report's `eval.json` under a `judged` key.

Lead with the deterministic score and the weakest judged dimension.

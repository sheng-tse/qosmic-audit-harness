---
description: Acceptance check — confirm every deliverable in DELIVERABLES.md is met. Read-only; reports pass/fail and fixes nothing.
---

Run the acceptance check against `DELIVERABLES.md`. This is read-only: report status, change
nothing. Fixing is `/build`'s job.

For each item in `DELIVERABLES.md`, confirm it with the cheapest tool that proves it:

- **File deliverables** — check the file exists.
- **`scripts/crawl.mjs` / `eval/grade.mjs`** — confirm they exist and run.
- **Each sample audit** — run `node eval/grade.mjs sample_output/<host>/report.md` and read the
  score and the gate. A report that clears the gate satisfies the entire report contract, so do
  not re-check the four sections, the ten experiments, the pillar spread, or the citations by
  hand. The grader already did, and re-doing it by eye is how you miss things.
- **`eval/cases/`** — confirm it is non-empty.
- **Reproducibility** — confirm `package.json`, `.gitignore`, and `AGENTS.md` exist.
- **Manual items (the Loom)** — you cannot verify a video. Mark it MANUAL for the human.

Output one row per deliverable: PASS / FAIL / MANUAL, with the evidence (the score, the path, the
exit status). End with a one-line verdict: how many automated checks pass and what is left. For
every FAIL, name the exact deliverable and what is missing, so `/build` can act on it without
rereading anything.

Do not edit files. Do not tick any boxes. Just report.

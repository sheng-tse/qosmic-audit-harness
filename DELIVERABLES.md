# Deliverables

The acceptance checklist for a complete submission. `/verify` reads this file and confirms each
item with the cheapest tool that proves it. The only rows it cannot check are marked manual. This
is the distilled set of requirements, kept in the repo so acceptance never depends on anything
outside it.

## Runtime harness
- [ ] `.claude/` holds the entry context, the five skills, the agents, and the commands.
- [ ] `reference/target_report.anchor.md` is present as the calibration anchor the skills cite.
- [ ] `scripts/crawl.mjs` exists and runs: `node scripts/crawl.mjs <url>` writes
      `sample_output/<host>/crawl/manifest.json`.

## Eval system
- [ ] `eval/grade.mjs` and `eval/rubric.md` exist; the grader scores any report and writes
      `eval.json`.
- [ ] `eval/cases/` holds at least one graded reference audit for regression.

## Sample outputs (both stores)
- [ ] `sample_output/gingerpeople.com/report.md` exists and clears the grader gate.
- [ ] `sample_output/zenrojas.com/report.md` exists and clears the grader gate. This is the store
      the harness was not tuned on, so it is the generalization check.

## The report contract (every audit, enforced by the grader)
- [ ] Four sections in order: executive summary (prose), proposed experiments, competitor
      analysis, technical checks.
- [ ] Exactly 10 experiments, spanning all five pillars, none used more than three times.
- [ ] Every experiment's evidence resolves to a captured artifact.
- [ ] The technical-checks table matches the crawl manifest, no fabricated statuses.

A passing grader gate covers every line in this section, so `/verify` confirms the contract by
running `grade.mjs`, not by re-reading the report.

## Docs
- [ ] `README.md` — what it is and how to run it.
- [ ] `EVAL_LOOP.md` — how the eval becomes autonomous, one page.
- [ ] `WORKFLOWS.md` — how the author uses coding agents day to day, one page.
- [ ] `AGENT_LOG.md` — time, prompts, where the agent drove and where the human steered.

## Reproducibility
- [ ] `package.json` and a root `.gitignore` exist; a fresh clone runs `npm install` then
      `node scripts/crawl.mjs <url>` with no extra setup.
- [ ] `AGENTS.md` so a non-Claude agent has an entry point too.

## Manual (not machine-checkable)
- [ ] Loom recorded: a short walkthrough of the harness and the eval loop, one decision you would
      reverse, and one dimension you did not measure.

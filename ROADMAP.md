# Roadmap

Where the audit harness goes next. `.claude/` governs *how* the work gets done; this file
governs *what* gets built next, and it is what `/next` reads.

## How this works

- **Phases, not dates.** Each milestone has an observable exit criterion: a file exists, a
  command produces an artifact, a score clears a bar.
- **The current milestone is the first unchecked box** in the current phase. `/next` finds it,
  surfaces it, and dispatches the command that builds it.
- **Granularity decreases with distance.** The current phase is concrete; later phases are a line
  each and sharpen as they approach.
- **No dates.** Phase numbers are durable; calendar guesses are not.

## Goal

Point the harness at any storefront URL and get a CRO audit a merchant can act on: an executive
read, ten cited experiments balanced across the five revenue pillars, real competitors, and
grounded technical checks, at or above `reference/target_report.anchor.md`. Around it sits an
eval that grades audits with no fixed answer key, learns which audits actually moved revenue, and
needs less human oversight each month. The runtime stays thin; the eval is where the value compounds.

## Quality bar (non-negotiable)

No milestone ships a regression. The two calibration stores keep scoring at or above their
current deterministic grade, the prose holds the anchor bar, and every claim stays cited. The
golden audits in `eval/cases/` are the regression guard, and the `code-reviewer` agent enforces
it before any commit lands. Better is wanted; worse is blocked.

## Phase 1 — Runs end to end

The harness produces and scores a real audit for a store it has never seen.

- [x] `.claude/` harness: entry context, five runtime skills, the audit-reviewer and
      competitor-researcher agents, audit/eval commands, settings, and the build loop
      (`/next`, `/build`, `code-reviewer`).
- [x] `reference/target_report.anchor.md`, the calibration anchor, copied in from the provided
      brief. *Exit: the file exists and the skills and quality bar that cite it resolve.*
- [x] `scripts/crawl.mjs` that captures deep pages on Cloudflare stores (one cleared session and
      click-through, headful, CDP attach). *Exit: the calibration store's PDP, Where To Buy, and
      cart are captured at their real status, not a blanket 403.*
- [ ] `eval/grade.mjs` and `eval/rubric.md`. *Exit: `node eval/grade.mjs <report>` prints a
      scorecard and writes `eval.json`.*
- [ ] `eval/cases/` with at least one graded reference audit. *Exit: the grader runs green
      against it and fails on a deliberately broken copy.*
- [ ] `sample_output/` for both test stores. *Exit: both reports clear the gate and the
      audit-reviewer signs off; coverage beats the prototype, gingerpeople deep pages included.*
- [ ] `README.md`, `AGENTS.md`, `package.json`, root `.gitignore`. *Exit: a fresh clone runs
      `npm install` then `node scripts/crawl.mjs <url>` with no extra setup.*
- [ ] `EVAL_LOOP.md`, `AGENT_LOG.md`, `WORKFLOWS.md`. *Exit: the three docs exist and read clean.*
- [ ] All deliverables pass `/verify` against `DELIVERABLES.md`, the Loom being the only manual
      item. *Exit: `/verify` reports every automated check PASS.*

## Phase 2 — The eval earns trust

The judged layer is real, not a plan, and a human and the machine agree on what good means.

- [ ] Judged J1-J5 run and recorded under a `judged` key in `eval.json`.
- [ ] A seed set of human-rated audits; the judge tuned until its ranking tracks the humans.
- [ ] Grounding upgraded from file-existence to claim-support, formalizing the audit-reviewer.
- [ ] First recurring judged failures promoted into deterministic checks in `grade.mjs`.

## Phase 3 — The loop tightens

Humans review only the ambiguous edge; the routine is automated.

- [ ] Active-learning routing: only grader-vs-judge disagreement and boundary cases reach a human.
- [ ] Real Lighthouse and Core Web Vitals for the Performance pillar.
- [ ] Competitor section fully grounded through the `competitor-researcher` agent.
- [ ] CI runs the grader on the sample reports on every push.

## Phase 4 — Outcome grounding

The eval grades audits on whether they made money, not just whether they look right.

- [ ] Experiments carry trackable ids; shipped-experiment results flow back.
- [ ] Confidence recalibrated against realized lift.
- [ ] A red-team agent that writes audits built to pass the checks while being wrong.

## Phase 5 — Beyond Shopify

- [ ] Platform adapters (WooCommerce, custom) so discovery does not depend on Shopify JSON.
- [ ] Multi-locale and multi-storefront handling.

## How to build it

In a Claude Code session at the repo root, run `/next`. It reads this file, surfaces the current
milestone, and dispatches `/build`, which implements it, runs the `code-reviewer`, verifies the
exit criterion, ticks the box here, and commits. Repeat until the phase is done.

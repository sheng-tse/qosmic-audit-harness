# Qosmic runtime audit harness

You are **Qosmic's runtime audit agent**. Input is one storefront URL. Output is one audit
report that finds what is costing the store sales and proposes experiments to fix it, at the
quality bar of `reference/target_report.anchor.md`.

This file is the contract. The procedure for each phase lives in `.claude/skills/`, specialized
roles live in `.claude/agents/`, the build plan is `ROADMAP.md`, and the writing rules are
`.claude/STYLE.md`. Read STYLE before you write prose.

## Contract

**Input:** a storefront URL. Nothing else. No manual data, no config.

**Output:** `sample_output/<host>/report.md`, four sections in this order:

1. **Executive summary** — 2-3 paragraphs of prose. The highest-level read on what is costing
   the store sales. No lists.
2. **Proposed experiments** — exactly 10 in the canonical schema below, spanning all five
   pillars (Conversion, AOV, Retention, Acquisition, Performance), none more than 3.
3. **Competitor analysis** — a table against 3-4 real, in-category competitors.
4. **Technical checks** — about 15 checks, each Pass / Warn / Fail with a one-line detail,
   taken from the crawl manifest, not guessed.

## Pipeline

Five steps. Each writes artifacts the next one reads, so context stays on disk instead of in
one agent's head.

1. **Crawl** — `node scripts/crawl.mjs <url>`. Captures screenshots, page text, Shopify data,
   and 15 probed technical checks into `sample_output/<host>/crawl/manifest.json`. (skill: `crawl`)
2. **Reason** — read the manifest and the screenshots, find revenue leaks, draft 10 experiments
   across the pillars, each citing a real artifact. (skill: `reason-pillars`)
3. **Review** — the `audit-reviewer` agent adversarially checks the draft: every claim grounded
   in the cited artifact, not just that the file exists; pillars balanced; confidence honest;
   nothing claimed about a surface the crawl could not see. Fix everything it flags.
   (agent: `audit-reviewer`)
4. **Write** — assemble the four sections. Prose follows `.claude/STYLE.md`. (skill: `write-report`)
5. **Grade** — `node eval/grade.mjs <report>`, then the judged pass. Iterate until it clears the
   gate and the reviewer signs off. (skill: `eval-audit`)

## Canonical experiment schema

```
### exp-<12 hex chars> — <short imperative title>

**Pillar:** Conversion | AOV | Retention | Acquisition | Performance
**Affected surface:** <which page/pattern>
**URL:** <the real URL>
**Evidence:** <screenshot path from the manifest, or a crawled URL>
**Hypothesis:** <what improves and why, citing what the evidence shows>
**Primary change:** <the control to variant change, concrete enough to build>
**Primary KPI:** <one metric>
**Decision rule:** Ship if <KPI moves> without hurting <guardrail metric>.
**Expected lift:** +X-Y%
**Confidence:** NN%
```

The exp-id is a stable 12-hex slug derived from the store host plus the title, so the same
experiment keeps its id across re-runs.

## Crawling storefronts that fight back

Some stores sit behind Cloudflare. A real browser clears the challenge; a careless crawler
gets 403s on the deep pages and produces an empty audit. The `crawl` skill covers the robust
path: clear the challenge once on the homepage, then reach deep pages by following links inside
that same cleared session rather than a fresh `goto` per URL; run headful when the managed
challenge needs it; fall back to attaching over CDP to a human-opened Chrome. Whatever still
cannot be reached is recorded as blocked, never invented. A 403 to the crawler is bot-blocking,
not proof a page is broken for shoppers.

## Quality bars

- **Cite everything.** Every claim ties to a real manifest artifact. The reviewer rejects a
  claim the evidence does not actually support, not only one whose file is missing.
- **Diversify pillars.** Roughly two each across the five, never more than three in one.
- **Generalize.** Nothing hardcodes a specific store. Findings come from that store's manifest.
- **Be specific.** "Median price $5, no bundle over $20" beats "consider raising AOV."
- **Ship only what the reviewer passes.**

## End to end

```
node scripts/crawl.mjs gingerpeople.com                         # phase 1
# phases 2-4: reason, review (audit-reviewer), write -> sample_output/<host>/report.md
node eval/grade.mjs sample_output/gingerpeople.com/report.md    # phase 5
```

`/audit <url>` runs the whole pipeline; `/eval <report>` scores an existing report. The commands
orchestrate; the skills and agents hold the procedure.

## Git

Commit freely with Conventional Commits per `.claude/STYLE.md`. Push only when the user asks,
case by case, after they have seen the committed work. History-rewriting and destructive
commands (`git push --force` / `-f` / `--force-with-lease`, `git reset --hard`, `git clean -fd`,
destructive `git tag`, `rm -rf`) are denied in `.claude/settings.json`. If one is ever truly
needed, the user runs it directly.

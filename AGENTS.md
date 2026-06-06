# Agent guide

This repo is an agent-run audit harness. The job: take one storefront URL and produce one CRO
audit at the quality bar of `reference/target_report.anchor.md`. This file orients any coding
agent. Claude Code additionally reads `.claude/CLAUDE.md`, which is the same contract in more
detail; the procedures it points to are not Claude-specific.

## The contract

**Input:** one storefront URL. Nothing else, no manual data, no config.

**Output:** `sample_output/<host>/report.md`, four sections in this order:

1. Executive summary — 2-3 paragraphs of prose, the highest-level read on what is costing the
   store sales.
2. Proposed experiments — exactly 10 in the canonical schema, spanning all five pillars
   (Conversion, AOV, Retention, Acquisition, Performance), with no single pillar holding half.
3. Competitor analysis — a table against 3-4 real, in-category competitors.
4. Technical checks — about 15 checks, each Pass / Warn / Fail, taken from the crawl manifest.

Every claim cites a real captured artifact. The deterministic grader (`eval/grade.mjs`) enforces
the contract, so a report that clears the gate satisfies it.

## The pipeline

Five steps, each writing artifacts the next reads:

1. **Crawl** — `node scripts/crawl.mjs <url>` writes `sample_output/<host>/crawl/manifest.json`
   plus screenshots and page text.
2. **Reason** — read the manifest and screenshots, draft 10 grounded experiments across the pillars.
3. **Review** — check every claim against its cited artifact; never claim anything about a surface
   the crawl could not see.
4. **Write** — assemble the four sections; prose follows `.claude/STYLE.md`.
5. **Grade** — `node eval/grade.mjs <report>` prints a scorecard, writes `eval.json`, and exits
   non-zero below the gate.

The detailed procedure for each step lives in `.claude/skills/` (`crawl`, `reason-pillars`,
`write-report`, `eval-audit`). The build plan is `ROADMAP.md`. The writing rules are
`.claude/STYLE.md` — read them before writing prose.

## Rules that do not bend

- **Cite everything.** Every claim ties to a real manifest artifact, not just a file that exists.
- **Ground numbers in the manifest.** Prices, counts, statuses come from `manifest.json`, not
  intuition. A 403 to the crawler is bot-blocking, not proof a page is broken for shoppers.
- **Diversify pillars.** All five appear; weight where the leaks are, but don't let one pillar
  hold half the audit.
- **Ship only what the grader passes and the reviewer signs off.**

## Setup

`npm install` (pulls Playwright and Chromium via a postinstall step), then
`node scripts/crawl.mjs <url>`. Node 18 or newer. `npm run test:eval` runs the grader's
regression cases.

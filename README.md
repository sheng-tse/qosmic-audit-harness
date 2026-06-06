# Qosmic audit harness

Point it at a storefront URL and get back a CRO audit a merchant can act on: an executive read of
what is costing the store sales, ten cited experiments across the five revenue pillars, real
in-category competitors, and grounded technical checks. The runtime is deliberately thin. The
value compounds in the eval, which grades audits with no fixed answer key.

## Quickstart

```
npm install
node scripts/crawl.mjs gingerpeople.com
```

`npm install` pulls Playwright and a Chromium build, so the crawl runs with nothing else to set
up (it prefers your system Chrome and falls back to that Chromium). The crawl writes
`sample_output/<host>/crawl/`: a screenshot and the page text per surface, the Shopify catalog
data, and a `manifest.json` with 15 probed technical checks that everything downstream reads.

Grade a finished report against the store's own crawl:

```
node eval/grade.mjs sample_output/gingerpeople.com/report.md
```

It prints a scorecard, writes `eval.json` next to the report, and exits non-zero below the gate.
`npm run test:eval` runs the grader's own regression cases.

## The pipeline

A URL becomes a report in five steps, each writing artifacts the next one reads, so context stays
on disk instead of in one agent's head.

1. **Crawl** — drive a real browser over a representative set of surfaces into a manifest. Clears
   Cloudflare once and clicks through, so deep pages come back as content, not a 403.
2. **Reason** — turn the manifest into 10 experiments across the pillars, each citing a captured artifact.
3. **Review** — an adversarial reviewer checks every claim against the artifact it cites, not just
   that the file exists.
4. **Write** — assemble the four-section report at the bar of `reference/target_report.anchor.md`.
5. **Grade** — `eval/grade.mjs` runs the deterministic gate, then a judged pass.

In Claude Code, `/audit <url>` runs the whole pipeline, `/eval <report>` scores one report, and
`/verify` checks every deliverable. Any other coding agent starts from `AGENTS.md`.

## What's where

- `.claude/` — the harness: entry context (`CLAUDE.md`), the writing rules (`STYLE.md`), the five
  skills, the reviewer agents, and the commands.
- `scripts/crawl.mjs` — the crawler.
- `eval/` — `grade.mjs` (the deterministic gate), `rubric.md` (the checks and the J1-J5 judged
  dimensions), `cases/` (frozen regression fixtures with a runner).
- `reference/target_report.anchor.md` — the calibration anchor, the quality bar a report matches.
- `sample_output/` — graded audits for the two test stores, with the manifest and screenshots
  committed so the scores reproduce on a clone.
- `ROADMAP.md` — what gets built next. `AGENTS.md` — the entry point for any coding agent.

## The two sample audits

- `sample_output/gingerpeople.com/` — the calibration store, a non-Shopify retailer-routed brand
  where the buy path is the leak.
- `sample_output/zenrojas.com/` — the generalization check, a Shopify DTC brand the harness was
  not tuned on.

Both clear the grader at 100 and pass the adversarial review.

## Requirements

Node 18 or newer. A crawl needs network access and a browser; `npm install` provides the browser.

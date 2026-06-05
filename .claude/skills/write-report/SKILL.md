---
name: write-report
description: Phase 4 of a Qosmic audit. After the reviewer signs off, use this to assemble the final report (executive summary, 10 experiments, competitor table, technical checks) at the quality bar of the anchor.
---

# Write the report

Assemble `sample_output/<host>/report.md` from the manifest and your reviewed reasoning. Four
sections, in this exact order. Read `.claude/STYLE.md` first; the prose has to read like a person
wrote it. The bar to match is `reference/target_report.anchor.md`.

## 1. Executive summary

Two or three paragraphs of prose. No bullets, no labels. Lead with the single biggest thing
costing the store sales, stated as a claim. Name what the store does well, then show where that
strength leaks before it converts. Title the section with a sentence that states the thesis, the
way the anchor does, then `## Executive summary` as the header so it parses.

## 2. Proposed experiments

Exactly 10, ordered by impact, in the canonical schema (see `CLAUDE.md`). Check the spread before
moving on: every pillar present, none over three, roughly two each.

## 3. Competitor analysis

Use the `competitor-researcher` agent to get 3-4 real, in-category competitors rather than
guessing. One short paragraph, then a table:

| Competitor | Domain | Positioning | What they make easier | This store's edge | Pattern to adapt |

## 4. Technical checks

A 15-row table straight from `manifest.tech`. Do not re-judge; copy the grounded status and
detail. Rows, in this order: SSL Certificate, HTTPS Redirect, Sitemap, Robots.txt, Critical
Pages Loading, Meta Tags & Social Previews, Structured Data, Favicon, Mobile-Friendly, Page Speed
Mobile, Page Speed Desktop, Broken Links, Image Optimization, Cookie/Privacy, Checkout Reachable.

```
| Check | Status | Detail |
|---|---|---|
| SSL Certificate | Pass | ... |
```

Map each manifest key to its row: `ssl`, `httpsRedirect`, `sitemap`, `robots`, `criticalPages`,
`metaTags`, `structuredData`, `favicon`, `mobileFriendly`, `pageSpeedMobile`, `pageSpeedDesktop`,
`brokenLinks`, `imageOptimization`, `cookiePrivacy`, `checkoutReachable`.

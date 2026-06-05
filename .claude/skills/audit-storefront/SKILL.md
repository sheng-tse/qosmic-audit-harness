---
name: audit-storefront
description: Run a full Qosmic CRO audit of a storefront from a single URL. Use when asked to audit a store, produce a CRO report, or act as the Qosmic audit agent. Orchestrates crawl, reason, review, write, and grade.
---

# Run a Qosmic audit

You are the Qosmic audit agent. Input is one storefront URL. Output is one report at
`sample_output/<host>/report.md`, at the bar of `reference/target_report.anchor.md`.

Chain the five phases. Each writes to disk so the next reads artifacts, not your memory.

## 1. Crawl  (skill: crawl)

`node scripts/crawl.mjs <url>`. If deep pages return 403 behind Cloudflare, follow the robust
path in the crawl skill (headful, click-through in one cleared session, CDP attach). Confirm the
manifest has populated `surfaces` and `shopify` before moving on.

## 2. Reason  (skill: reason-pillars)

Read the manifest, the page text, and the screenshots. Draft 10 experiments across the five
pillars, each citing a real artifact. Cite everything; ground every number.

## 3. Review  (agent: audit-reviewer)

Hand the draft to the `audit-reviewer` agent. It checks that each claim is actually supported by
the artifact it cites, that pillars are balanced, and that confidence is honest, then runs the
grader. Apply every fix it returns. Do not skip this step; a draft is not a report.

## 4. Write  (skill: write-report)

Assemble the four sections in order. For the competitor table, use the `competitor-researcher`
agent so the brands are real, not guessed. Prose follows `.claude/STYLE.md`.

## 5. Grade  (skill: eval-audit)

`node eval/grade.mjs sample_output/<host>/report.md`, then the judged pass. Revise until it
clears the gate and the reviewer signs off.

## The bars

Cite everything. Span all five pillars. Hardcode nothing. Ship only what the reviewer passes.

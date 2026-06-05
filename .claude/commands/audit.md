---
description: Run a full Qosmic CRO audit of a storefront from a single URL — crawl, reason, review, write, then score.
argument-hint: <storefront-url>
---

Run a complete audit of `$1` and leave a scored report at `sample_output/<host>/report.md`.

This command is the front door; the depth lives in the skills and agents. Follow
`audit-storefront`, which chains the five phases:

1. **Crawl.** `node scripts/crawl.mjs $1`. If deeper pages return 403 behind Cloudflare, use the
   robust path in the crawl skill (headful, single cleared session, CDP attach).
2. **Reason.** Follow `reason-pillars`: 10 experiments across all five pillars, each citing a real
   artifact, every number from the manifest.
3. **Review.** Hand the draft to the `audit-reviewer` agent and apply every fix it returns.
4. **Write.** Follow `write-report`; use the `competitor-researcher` agent for the competitor
   table. Prose per `.claude/STYLE.md`.
5. **Score.** `node eval/grade.mjs sample_output/<host>/report.md`; fix failures and re-run until
   it clears the gate and the reviewer signs off.

Report the final deterministic score and the pillar spread when done.

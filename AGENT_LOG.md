# Agent log

How this harness was built with coding agents: the setup, time per part, the prompts I fed,
where the agent drove and where I took the wheel, and the decisions worth remembering.

## Setup

Driver: Claude Code (Opus). I set the architecture up front, then the harness built itself
through a `/next` → `/build` loop: `/next` reads `ROADMAP.md` and surfaces the next milestone,
`/build` implements it, the `code-reviewer` agent gates the diff and the `audit-reviewer` agent
gates each audit, then the box is ticked and committed. Most of the construction ran in that
loop; my job was the architecture, the decision points it surfaced, and a review between
milestones. Playwright drives a real Chrome for the crawl; the grader is plain Node, no deps.

## Time per part

Active build time, measured from the build session's own transcript: idle gaps over five
minutes removed, with the milestone commits used only as stage boundaries, not as the clock
(raw calendar span was ~6.5h, but the work was spread across an unfocused window). It comes to
~4.0h of active build, in line with the brief's timebox. The crawler dominated, which tracks —
it is the hardest piece, a real browser past Cloudflare and then flagship and mega-site
discovery. The harness scaffold and the build loop itself were set up earlier in the planning
thread, before `/next` first ran, so they read as zero in the build session; that architecture
and steering time is mine to add and is not in the numbers below.

| Phase 1 stage | Active build time |
|---|---|
| Harness scaffold, build loop, acceptance gate | set up in the planning thread (steer time: 30m) |
| Calibration anchor | 6m |
| Crawler — Playwright, Cloudflare clearance, flagship + second-hop | 104m |
| Grader + rubric (+ pillar-balance recalibration) | 27m |
| Golden regression cases | 21m |
| Sample audits, both stores | 41m |
| Docs + third-store scouting | 44m |
| **Active build total** | **~4.0h (243m)** |

Mapped to the brief's two parts: Part 1 (runtime harness) is the scaffold, the anchor, and the
crawler; Part 2 (eval system + autonomy plan) is the grader, rubric, golden cases, and
`EVAL_LOOP.md`. The sample audits and docs sit on top of both.

## Prompts I fed

The standing loop was `/next` then `/build`, milestone after milestone. The steering prompts
that shaped the work, lightly edited:

- *"Build the crawler to pick flagship products and discover PDPs off collection pages; gingerpeople must capture a real PDP, not just category pages."*
- *"The grader is stricter than the brief and the anchor — warn pillar balance only at a true wall (one pillar holding half), not above three, and align the contract to match."*
- *"Build `eval/cases/` with a grounded gold case plus broken variants that each trip a different critical check, and prove the guard bites by temporarily weakening a check."*
- *"Run the full pipeline per store; commit the crawl manifest and screenshots so the eval reproduces on a fresh clone; zenrojas is the real generalization test, make the lead experiment name the true biggest leak."*
- *"Don't pad allbirds to ten experiments. Scout a candidate's crawl before reasoning over it, and skip the third report rather than ship a thin one."*

## Agent drove vs. I took the wheel

**Agent drove:** every implementation. The crawler (Playwright, the Cloudflare clearance path,
flagship selection, the second hop into collections), the five skills, the agents and commands,
the `/next`-`/build` loop, the deterministic grader and rubric, the golden regression cases, both
sample audits through the reason → review → write → grade pipeline, and the docs. The
`code-reviewer` and `audit-reviewer` agents caught real problems on their own — most notably a
zenrojas draft that cleared the grader at 100 while making four claims the page text did not
support.

**I took the wheel on** the calls that were expensive to reverse or where the agent would have
guessed wrong: keeping the harness in its own repo; a real browser over a fetch-only crawl;
accepting a degraded Cloudflare crawl and then fixing it properly rather than faking it;
providing the calibration anchor instead of letting the agent invent the standard; the
pillar-balance recalibration; insisting the crawl manifest and screenshots be committed so the
eval reproduces on a clone, not just on my machine; the acceptance layer (`DELIVERABLES.md` +
`/verify`); the git guardrails that deny the agent force-push; and refusing to ship a padded
third report. The pieces only a human can supply, the anchor, these hours, and the Loom, are mine.

## What got built, and the decisions behind it

### 2026-06-05 — building Phase 1 with /next and /build

Phase 1 was built one milestone at a time through the `/next` then `/build` loop: read the
roadmap, surface the next exit criterion, implement it, hand the diff to the code-reviewer,
verify the criterion by running the real command, tick the box, commit. The crawler, the
deterministic grader, the golden regression cases, and the two sample audits each landed that
way. The agent did the implementation and the verification; I confirmed each milestone before it
ran and reviewed the work between them.

### 2026-06-06 — the pillar-balance rule was stricter than the brief

The grader warned when any pillar held more than three of ten experiments, which docked the
calibration anchor to 94 for running four Conversion experiments. I caught that the rule was
stricter than the brief, which asks for all five pillars and not an all-Conversion audit, not a
hard cap of three. The anchor's four-Conversion lean is correct prioritization, because the buy
path is that store's real leak. We moved the warn to a true wall, one pillar holding half the
audit, so the gold standard defines 100 and whether a lean is justified is left to the judged
pass. The anchor was the first golden case, and grading it immediately exposed a rule stricter
than the standard, which is the eval loop's self-correction working on day one.

### 2026-06-06 — the reviewer caught the audit fabricating

The first zenrojas draft cleared the grader at 100, but the audit-reviewer read the page-text
dumps the draft had skimmed and found four claims that did not hold: a shipping threshold the
store actually advertises on every page, a "none lazy-loaded" line true of the product pages but
not the homepage it cited, a half-grounded bundle citation, and two sold-out hero teas the draft
never surfaced. The agent fixed all four, the sold-out heroes became their own experiment, and a
fifth issue surfaced on re-review. The cheap gate cannot see whether a claim is true, only that
it is well-formed, so the reviewer is the layer that keeps the audit honest.

### 2026-06-06 — the optional third store, and why there isn't one

After the two required sample audits shipped at the bar, the plan was an optional third report to
widen the generalization story. It did not ship, and the reason is worth keeping. First try was
allbirds.com: on a 632-product mega-site, flagship and spread sampling pulled accessories (a
returns-coverage SKU, socks, laces) instead of the hero shoes, the mega-menu homepage surfaced no
content pages, and the site is technically pristine, so there was little to ground experiments
in. Padding to ten would have failed the cite-everything bar. So I scouted candidates by crawling
and reading the manifest before committing: otherland.com (candles) captured real PDPs but its JS
hero never painted for the screenshot; wildone.com (pet) had content coverage but a junk returns
SKU and accessory PDPs. The pattern is one limit seen three ways: generic discovery and headless
capture do not hold up on modern, JS-heavy, large-catalog storefronts. Rather than ship a thin
third report, we stopped at two; they carry generalization on their own (a non-Shopify
retailer-routed brand and a Shopify DTC brand, different categories, both grounded and
reviewer-approved). The fix is a roadmap item, not a patch: hero/flagship targeting for large
catalogs, content-page discovery for mega-menu navigation, and a capture step that waits for the
hero to paint.

## Known limits

- The eval's judged layer (J1-J5 in `eval/rubric.md`) is defined and run by the `audit-reviewer`,
  but not yet calibrated against a human-rated set or automated; that calibration is the first
  step in `EVAL_LOOP.md`.
- Generic crawl discovery is thin on large, JS-heavy storefronts (see the third-store entry).

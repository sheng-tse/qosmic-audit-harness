---
name: reason-pillars
description: Phase 2 of a Qosmic audit. After crawling, use this to turn the manifest into 10 experiments spanning the five revenue pillars, each grounded in a captured artifact.
---

# Reason over the crawl

Read `sample_output/<host>/crawl/manifest.json` and the `pages/*.txt` dumps. Open the
screenshots. Find where the store leaks revenue and turn each leak into one testable experiment.
Aim for 10, spread across the five pillars.

## Two rules that are not negotiable

1. **Cite a real artifact.** Every experiment's evidence is a `screenshot` path or a `url` that
   exists in the manifest. If the crawl did not capture it, you cannot cite it. A blocked surface
   (`status >= 400` or `challenged`) is missing evidence: you may propose a fix for it, but say it
   was not inspected and lower confidence. The audit-reviewer will check this, so be honest now.
2. **Ground every number in the manifest.** Prices, product counts, missing structured data, tag
   spam, load times, broken pages all come from `manifest.json`, not intuition.

## The five pillars and where their leaks hide

| Pillar | Look for | Manifest signals |
|---|---|---|
| Conversion | unclear PDP next step, missing price/CTA, weak trust, broken critical pages, dead cart, choice overload | `surfaces` (PDP/collection/cart screenshots), `tech.criticalPages`, `tech.checkoutReachable` |
| AOV | low median price, no bundles/kits/samplers, no cross-sell, no free-ship threshold | `shopify.priceRange`, `shopify.sampleProducts`, collection screenshots |
| Retention | no subscribe/reorder on consumables, no post-purchase routine, no email capture, no loyalty | PDP and home text, `shopify.sampleProducts` (is it replenishable?) |
| Acquisition | missing JSON-LD, weak meta, blog/recipes that never link to product, no intent landing pages, tag spam, missing alt | `tech.structuredData`, `tech.metaTags`, content screenshots, `shopify.sampleProducts[].tags` |
| Performance | slow load, unoptimized images, broken links, no next-gen formats, mobile issues | `tech.pageSpeedDesktop`, `tech.imageOptimization`, `tech.brokenLinks`, `tech.mobileFriendly` |

## Sizing lift and confidence

Tie both to evidence strength and severity, not to a feeling.

- A broken or dead critical surface you directly observed: high confidence (80-90%), lift +10-20%.
- A clear UX or merchandising gap visible in a screenshot: mid-high (72-82%), lift +8-20%.
- A net-new page or motion you are inferring from patterns: lower (65-75%), lift +8-18%.
- A speculative reach with thin evidence: do not ship it. Find a grounded experiment instead.

## Coverage check before you hand off

- Exactly 10 experiments.
- Each pillar appears at least once. Weight where the leaks are, but don't let one pillar hold
  half the audit.
- Every experiment cites a manifest artifact.
- At least one experiment addresses anything the crawl found broken (`Fail` in `tech`, or a
  `status >= 400` surface). Observed breakage is the most defensible experiment you have.

Generate each `exp-id` as 12 hex characters from the store host plus the title, stable across re-runs.

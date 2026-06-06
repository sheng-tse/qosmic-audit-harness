# Agent log

A running record of how this harness gets built with coding agents: where the agent
drove, where the human steered, and the decisions worth remembering. Newest last.

## 2026-06-06 — the optional third store, and why there isn't one

After the two required sample audits (gingerpeople.com, zenrojas.com) shipped at the
bar, the plan was an optional third report to widen the generalization story. It did
not ship, and the reason is worth keeping.

First try was allbirds.com. On a 632-product mega-site, flagship and spread sampling
pulled accessories (a returns-coverage SKU, socks, laces) instead of the hero shoes,
the mega-menu homepage surfaced no content pages, and the site is technically
pristine, so there was little to ground experiments in. Padding to ten experiments
would have failed the cite-everything bar. The human steered the call: don't ship a
thin report, and scout a candidate's crawl before reasoning over it.

So I scouted, crawling candidates and reading the manifest before committing. otherland.com
(candles, 59 products) captured three real hero PDPs cleanly but the homepage screenshot
came back blank, a JS hero that never painted, which takes the surface a sharp lead
usually needs off the table. wildone.com (pet, 62 products) had richer content-page
coverage but a junk returns SKU and accessory PDPs instead of heroes. All three are
also polished DTC brands with few grounded leaks.

The pattern is one limit, seen three ways: generic discovery and headless capture do
not hold up on modern, JS-heavy, large-catalog storefronts. Rather than ship a thin
third report, we stopped at two. They carry generalization on their own (a non-Shopify
retailer-routed brand and a Shopify DTC brand, different categories, both grounded and
reviewer-approved).

The fix is a real roadmap item, not a patch: hero and flagship targeting for large
catalogs, content-page discovery for mega-menu navigation, and a capture step that
waits for the hero to paint before the screenshot. Until then, the harness is honest
about which stores it can audit well, which is the right failure mode for an eval.

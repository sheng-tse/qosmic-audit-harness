---
name: crawl
description: Phase 1 of a Qosmic audit. Run first when auditing any storefront URL. Captures screenshots, page text, and Shopify catalog data into a manifest the reasoning phase consumes. Covers the robust path for Cloudflare-protected stores.
---

# Crawl a storefront

```
node scripts/crawl.mjs <url> [--headful] [--max-products N] [--max-collections N]
```

Playwright drives system Chrome over a representative set of surfaces, then pulls structured
data. Output lands under `sample_output/<host>/crawl/`.

## What it captures

- Homepage first; clearing it also clears Cloudflare for later requests in the same session.
- 2 collections and 3 products spread across the catalog on Shopify stores. On non-Shopify or
  JSON-gated stores it discovers category and content pages from the homepage nav instead.
- Content pages that signal intent: FAQ, Where To Buy, About, recipes, blog.
- Cart, plus a mobile homepage screenshot.

## What it writes

```
sample_output/<host>/crawl/
  screenshots/*.png   one per surface, plus home-mobile.png
  pages/*.txt         visible text per surface, your primary reading material
  data/*.json|xml     products.json, collections.json, cart.js, sitemap.xml, robots.txt
  manifest.json       the index everything downstream reads
```

## Reading the manifest

- `surfaces[]` — each page with `status`, `state`, `screenshot`, `text`, extracted `meta`, `perf`.
  `state` is one of `ok`, `soft-error`, `hard-error`, `challenged`, `unreachable`. A `soft-error`
  is a page the server answered with a 4xx/5xx but still rendered, like `/cart`'s branded 404: it
  is reachable, so read it for what it reveals (an absent feature), not as a page that failed to load.
- `notOk[]` — every surface whose `state` is not `ok`, each with its `status` and `state`.
- `shopify` — `productCount`, `priceRange` (min/max/median), `sampleProducts[]` with tags. This
  is your fuel for AOV and SEO reasoning.
- `tech` — 15 grounded checks, each `{status, detail}`.

## When the store fights back (Cloudflare)

The anchor store proves these sites are crawlable with a real browser, so a 403 on the deep
pages is a crawler problem to solve, not a wall to accept. In order of effort:

1. **Stay in one cleared session.** Clear the challenge on the homepage, then reach deep pages by
   clicking their nav links in the same page instead of a fresh `goto` per URL. A fresh goto to a
   deep path looks more like a bot than a click-through.
2. **Go headful.** `--headful` runs real Chrome visibly; the managed challenge clears far more
   often than in headless.
3. **Slow down.** Human-like pauses between navigations stay under rate-limiting.
4. **Attach to a human-cleared Chrome over CDP.** Launch Chrome with `--remote-debugging-port`,
   solve the challenge by hand once, then connect with `connectOverCDP` and crawl the cleared
   session. This is the reliable fallback when automation alone cannot pass.
5. **Last resort:** a residential proxy or a paid unlocker for fully hands-off runs.

Whatever still cannot be reached is recorded with its real status and `challenged: true`, never
treated as content. A 403 to the crawler is bot-blocking, not proof the page is broken for users.

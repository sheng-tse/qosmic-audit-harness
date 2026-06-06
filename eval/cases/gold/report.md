# Ginger People audit — the buy path is the constraint

> Gold regression fixture for `eval/cases`. Frozen on purpose: it is graded against
> `grade.mjs` forever, so it must not be regenerated from a live crawl. Every citation
> resolves against the trimmed `manifest.json` beside it.

## Executive summary

Ginger People sells through retailers, and the weakest seam is the handoff from intent to purchase. The hero product page earns intent with reviews and award proof, but the buying area shows no price, cart, or retailer button, so a ready shopper has nowhere to go. The two adjacent purchase surfaces make it worse: the primary Where To Buy page resolves to blog and footer content with no store locator, and the `/cart` URL returns a branded 404 that quietly drops returning sessions.

The catalog is broad and need-driven, spanning nausea, travel, cooking, and candy, but the store asks shoppers to decode product names instead of shopping their problem. That is a cost on every category and product page, and it falls hardest on first-time visitors who arrived with a symptom in mind.

The content is the moat and is under-commercialized. Recipes, GLP-1 education, and condition pages can carry guided shopping and reorder routines. The first tests are structural: give every product page a buying box, rebuild Where To Buy into a real handoff, and turn the `/cart` 404 into a recovery page.

## Proposed experiments

### exp-7f3a91c2e4d8 — Add a buying box to every product

**Pillar:** Conversion
**Affected surface:** GIN GINS Original PDP (pattern applies to all PDPs)
**URL:** https://gingerpeople.com/products/gin-gins-original-ginger-chews/
**Evidence:** `screenshots/product-gin-gins-original.png`
**Hypothesis:** The PDP builds intent through reviews and award proof but shows no price, cart, or retailer choice, so ready shoppers stall on the page. A clear buying choice converts that intent instead of leaking it.
**Primary change:** Add a "Choose how to buy" box under the product title with "Buy online," "Find near me," and compact retailer logos.
**Primary KPI:** Outbound retailer click rate
**Decision rule:** Ship if outbound retailer click rate improves without hurting PDP bounce.
**Expected lift:** +12-20%
**Confidence:** 78%

### exp-2b6e8f04a1c9 — Rebuild where to buy into a handoff

**Pillar:** Conversion
**Affected surface:** Where To Buy (primary nav)
**URL:** https://gingerpeople.com/where-to-buy-the-ginger-people-products/
**Evidence:** `screenshots/content-where-to-buy.png`
**Hypothesis:** The most explicit purchase-intent link in the nav resolves to header, blog cards, and footer with no retailer handoff, so high-intent shoppers dead-end. A real locator recovers them.
**Primary change:** Replace the body with a ZIP store locator, "Shop online" retailer cards, and product-family filters.
**Primary KPI:** Outbound retailer click rate
**Decision rule:** Ship if outbound retailer click rate improves without hurting Where To Buy session duration.
**Expected lift:** +15-25%
**Confidence:** 80%

### exp-c41d7a905be2 — Turn the homepage into shopper missions

**Pillar:** Conversion
**Affected surface:** Homepage first screen
**URL:** https://gingerpeople.com/
**Evidence:** `screenshots/home.png`
**Hypothesis:** One broad "Shop Now" entrance asks too much of a first-time visitor split across relief, candy, cooking, and wholesale. Mission cards match how shoppers describe the need.
**Primary change:** Rebuild the screen after the hero into four cards: settle my stomach, find ginger candy, cook with ginger, buy for my business.
**Primary KPI:** Homepage click-through to category
**Decision rule:** Ship if homepage CTR improves without hurting downstream conversion.
**Expected lift:** +6-10%
**Confidence:** 70%

### exp-9e02f7c3a8d1 — Make the empty cart a recovery page

**Pillar:** Performance
**Affected surface:** `/cart` URL
**URL:** https://gingerpeople.com/cart
**Evidence:** https://gingerpeople.com/cart
**Hypothesis:** A 404 at `/cart` silently loses returning users, browser memory, old links, and partner referrals. A branded recovery page routes them back to products and retailers.
**Primary change:** Replace the 404 with a recovery page carrying "Continue shopping," "Find a store," and support links.
**Primary KPI:** `/cart` exit rate
**Decision rule:** Ship if `/cart` exit rate drops without hurting site-wide conversion.
**Expected lift:** +10-20%
**Confidence:** 84%

### exp-5a8c1f6b30e7 — Help shoppers choose by need

**Pillar:** Acquisition
**Affected surface:** New page at `/find-your-ginger/`
**URL:** https://gingerpeople.com/find-your-ginger/
**Evidence:** `screenshots/collection-ginger-rescue.png`
**Hypothesis:** Category pages use need language then drop shoppers into dense tiles. A guided picker routes symptom-led visitors to the right family before they bounce.
**Primary change:** Build a five-prompt picker (nausea, travel, cooking, daily wellness, candy) that returns a recommendation and buy or find choices.
**Primary KPI:** Landing-page conversion rate
**Decision rule:** Ship if landing-page CVR improves without hurting site-wide conversion.
**Expected lift:** +12-18%
**Confidence:** 72%

### exp-e93b2d7c4f08 — Create a pregnancy nausea page

**Pillar:** Acquisition
**Affected surface:** New page at `/morning-sickness-ginger/`
**URL:** https://gingerpeople.com/morning-sickness-ginger/
**Evidence:** `screenshots/content-faq.png`
**Hypothesis:** Morning-sickness intent disperses across category, FAQ, and product pages. One compliant destination matches it to testimonials and product choices.
**Primary change:** Build `/morning-sickness-ginger/` from existing FAQ and testimonial content with "ask your clinician" language and buy or find choices.
**Primary KPI:** Landing-page conversion rate
**Decision rule:** Ship if landing-page CVR beats the average of existing condition pages without compliance flags.
**Expected lift:** +10-16%
**Confidence:** 70%

### exp-14c6a8e02b9d — Package a GLP-1 support routine

**Pillar:** Retention
**Affected surface:** GLP-1 article and routines hub
**URL:** https://gingerpeople.com/boost-your-glp-1-naturally-the-power-of-ginger-turmeric/
**Evidence:** `screenshots/content-blog-glp1.png`
**Hypothesis:** The GLP-1 article names a recurring side-effect moment but leaves shoppers to assemble the routine by hand. A named routine they can reorder lifts repeat purchase.
**Primary change:** Create a "GLP-1 Ginger and Turmeric Daily Support" routine bundling chews, ginger juice, and turmeric juice, placed in the article.
**Primary KPI:** 30-day repeat purchase rate among article visitors
**Decision rule:** Ship if 30-day repeat purchase rate improves without hurting first-order AOV.
**Expected lift:** +6-12%
**Confidence:** 68%

### exp-b7f0e3a91c52 — Add reorder reminders to wellness routines

**Pillar:** Retention
**Affected surface:** Post-purchase email and routine pages
**URL:** https://gingerpeople.com/boost-your-glp-1-naturally-the-power-of-ginger-turmeric/
**Evidence:** https://gingerpeople.com/boost-your-glp-1-naturally-the-power-of-ginger-turmeric/
**Hypothesis:** Daily-use formats have a natural replenishment cadence the store never prompts, so reorders depend on the shopper remembering. A timed reminder captures them.
**Primary change:** Send a reorder reminder timed to pack size, linking the named routine and a one-tap "find near me."
**Primary KPI:** 60-day repeat purchase rate
**Decision rule:** Ship if 60-day repeat purchase rate improves without raising email unsubscribe rate.
**Expected lift:** +5-9%
**Confidence:** 66%

### exp-360df8a2c1e4 — Sell a travel nausea kit

**Pillar:** AOV
**Affected surface:** New kit PDP plus cross-promotion on Ginger Rescue pages
**URL:** https://gingerpeople.com/products/travel-stomach-rescue-kit/
**Evidence:** `screenshots/collection-ginger-rescue.png`
**Hypothesis:** Three separate nausea formats sell one at a time. A travel-ready bundle raises order value on one of the highest-intent use cases on the site.
**Primary change:** Launch a "Travel Stomach Rescue Kit" of the three Ginger Rescue formats, promoted on those product pages.
**Primary KPI:** AOV among Ginger Rescue page visitors
**Decision rule:** Ship if AOV rises by at least $3 without hurting Ginger Rescue conversion.
**Expected lift:** +8-14%
**Confidence:** 70%

### exp-a2e7c419b8f3 — Build a flavor sampler pack

**Pillar:** AOV
**Affected surface:** GIN GINS category plus new sampler PDP
**URL:** https://gingerpeople.com/products/gin-gins-flavor-tour/
**Evidence:** `screenshots/content-faq.png`
**Hypothesis:** First-time candy shoppers face nine flavors with no trial entry, so they pick one or none. A multi-flavor sampler raises first-order value.
**Primary change:** Launch a "GIN GINS Flavor Tour" sampler of the core flavors with a single add-to-cart.
**Primary KPI:** AOV among first-time candy shoppers
**Decision rule:** Ship if first-time AOV rises by at least $4 without hurting candy conversion.
**Expected lift:** +7-12%
**Confidence:** 72%

## Competitor analysis

Competitors make the shopping job easier through symptom-led navigation, retailer handoffs, and flavor-led merchandising. Ginger People's edge is deeper ginger specialization, proof, reviews, and broader formats.

| Competitor | Domain | Positioning | What they make easier | Pattern to adapt |
|---|---|---|---|---|
| Dramamine | dramamine.com | OTC motion sickness relief | Immediate use-case clarity | Dedicated nausea and travel pages with product modules |
| Tummydrops | tummydrops.com | Ginger drops for nausea | Symptom-specific shopping | Symptom-led navigation and format comparisons |
| Reed's | drinkreeds.com | Ginger beverages and candy | Beverage-led discovery | Stronger retailer handoff per product family |
| Chimes Gourmet | chimesgourmet.com | Ginger chews and candy variety | Flavor-led candy shopping | Flavor sampler and heat comparison |

## Technical checks

| Check | Status | Detail |
|---|---|---|
| SSL Certificate | Pass | HTTPS storefront loaded successfully. |
| HTTPS Redirect | Pass | Requests resolved over HTTPS. |
| Sitemap | Warn | sitemap.xml returned 403 to the crawler. |
| Robots.txt | Pass | robots.txt present, references a sitemap. |
| Critical Pages Loading | Pass | Homepage, collection, and product all loaded. |
| Meta Tags & Social Previews | Pass | Title and Open Graph tags present. |
| Structured Data | Pass | JSON-LD found on the product page. |
| Favicon | Pass | Favicon link present. |
| Mobile-Friendly | Pass | Responsive viewport meta present. |
| Page Speed Mobile | Warn | Mobile homepage load event at 4.0s. |
| Page Speed Desktop | Warn | Desktop homepage load event at 4.5s. |
| Broken Links | Fail | `/cart` returned a branded 404. |
| Image Optimization | Warn | Product images use no modern format. |
| Cookie/Privacy | Pass | Privacy Policy link visible in the footer. |
| Checkout Reachable | Fail | `/cart` returned 404; no checkout was entered. |

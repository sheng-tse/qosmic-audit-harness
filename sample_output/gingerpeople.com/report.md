# Ginger People audit — the brand is rebuilt, the buy path is not

## Executive summary

Ginger People has rebuilt the brand and the proof; it has not rebuilt the path to purchase. The hero product page for GIN GINS Original Ginger Chews carries four-star reviews (86 of them), "Made with 10% fresh ginger — more than any other brand," "America's #1 selling ginger candy," and a Best Candy award, yet the captured buying area shows no price, no add-to-cart, and no retailer button. A shopper arrives convinced and finds no next step.

The two purchase surfaces next to that page make it worse. Where To Buy is the most explicit purchase-intent link in the nav, and the page loads a Destini store locator that never renders: the capture is a spinner sitting over blog cards. The `/cart` URL returns a branded "we're lost" 404. For a brand that sells through retailers, both of the handoffs a ready shopper would reach are broken at the same time, so the proof on the product page has nowhere to go.

The catalog and the content are the real moat, and they are under-commercialized. A health blog with GLP-1 and nausea education, a recipe library, and a need-driven range across travel, morning sickness, cooking, and candy pull the right shoppers in. The store then asks them to decode product names instead of shopping their problem, and leaves them without a way to buy. The first tests are structural: put a buying box on every product page, make Where To Buy resolve to a working locator, and turn the cart 404 into a recovery page. The merchandising and content tests follow once the path to purchase holds.

## Proposed experiments

### exp-90217248847d — Add a buying box to every product page

**Pillar:** Conversion
**Affected surface:** GIN GINS Original PDP (pattern applies to all PDPs)
**URL:** https://gingerpeople.com/products/gin-gins-original-ginger-chews/
**Evidence:** `screenshots/product-products-gin-gins-original-ginger-chews.png`
**Hypothesis:** The product page earns intent through proof (86 reviews, "America's #1 selling ginger candy," an award) but the captured buying area shows no price, cart, or retailer choice, so a ready shopper stalls. Converting that intent into a clear choice should lift the handoff to purchase.
**Primary change:** Add a persistent "Choose how to buy" box under the product title with "Buy online," "Find near me," and compact retailer logos, shown on every PDP.
**Primary KPI:** Outbound retailer click rate
**Decision rule:** Ship if outbound retailer click rate improves without hurting PDP bounce or time on page.
**Expected lift:** +12-20%
**Confidence:** 78%

### exp-a367c3387df9 — Make Where To Buy actually find a store

**Pillar:** Conversion
**Affected surface:** Where To Buy (primary nav)
**URL:** https://gingerpeople.com/where-to-buy-the-ginger-people-products/
**Evidence:** `screenshots/content-where-to-buy.png`
**Hypothesis:** The most explicit purchase-intent link in the nav loads a Destini locator that did not render in the capture, leaving a spinner above blog cards. High-intent shoppers who click it dead-end, which weakens every product page that says find it locally.
**Primary change:** Make the locator render reliably (lazy-load with a visible fallback, server-side store list, or a replacement), and lead the page with a ZIP search and "Shop online" retailer cards instead of blog content.
**Primary KPI:** Where To Buy to outbound retailer click rate
**Decision rule:** Ship if outbound retailer click rate improves without raising Where To Buy bounce.
**Expected lift:** +15-25%
**Confidence:** 80%

### exp-1e6d58f6afed — Turn the cart 404 into a recovery page

**Pillar:** Performance
**Affected surface:** `/cart` URL
**URL:** https://gingerpeople.com/cart
**Evidence:** `screenshots/cart.png`
**Hypothesis:** The `/cart` URL returns a branded 404, observed directly in the crawl. It is a common destination for returning users, browser memory, old links, and partner referrals, so a 404 there silently loses high-intent sessions even on a retailer-routed site.
**Primary change:** Replace the 404 with a purchase recovery page: "Continue shopping," "Find a store," "Shop online retailers," and support links, on the brand template.
**Primary KPI:** `/cart` exit rate
**Decision rule:** Ship if `/cart` exit rate drops without hurting site-wide conversion.
**Expected lift:** +10-20%
**Confidence:** 84%

### exp-5c9477ae52e9 — Turn the homepage into shopper missions

**Pillar:** Conversion
**Affected surface:** Homepage first screen
**URL:** https://gingerpeople.com/
**Evidence:** `screenshots/home.png`
**Hypothesis:** The buyer split across relief, candy, cooking, and wholesale means one broad entrance asks too much of a first-time visitor. Mission cards that match how shoppers describe the need should route them faster than a single shop entrance.
**Primary change:** Rebuild the screen after the hero into four cards: settle my stomach, find ginger candy, cook with ginger, buy for my business, each linking to the matching category.
**Primary KPI:** Homepage click-through to category
**Decision rule:** Ship if homepage click-through improves without hurting downstream conversion.
**Expected lift:** +6-10%
**Confidence:** 70%

### exp-17f0aed6ecda — Help shoppers choose ginger by need

**Pillar:** Acquisition
**Affected surface:** New page at `/find-your-ginger/`
**URL:** https://gingerpeople.com/find-your-ginger/
**Evidence:** `screenshots/collection-ginger-rescue-lozenges.png`
**Hypothesis:** Category pages already use need language (nausea, travel, motion sickness) then drop shoppers into product tiles. A guided picker that routes health-intent and snack-intent visitors to the right family should convert better than a dense list.
**Primary change:** Build `/find-your-ginger/` with five prompts (nausea, travel, cooking, daily wellness, candy), each returning a recommendation, a proof quote, and buy or find choices. Link it from the nav and key category pages.
**Primary KPI:** Landing-page conversion rate
**Decision rule:** Ship if landing-page conversion rate beats the category pages it replaces without hurting site-wide conversion.
**Expected lift:** +10-16%
**Confidence:** 72%

### exp-5f50e582fb91 — Build a morning sickness landing page

**Pillar:** Acquisition
**Affected surface:** New page at `/morning-sickness-ginger/`
**URL:** https://gingerpeople.com/morning-sickness-ginger/
**Evidence:** `screenshots/content-faq.png`
**Hypothesis:** Morning-sickness intent is high and disperses across the FAQ, category, and product pages. One compliant destination that matches it to testimonials, FAQ answers, and product choices should capture search and referral traffic the brand already earns.
**Primary change:** Build `/morning-sickness-ginger/` from existing FAQ and testimonial content with Ginger Rescue and GIN GINS recommendations, "ask your clinician" language, and buy or find choices.
**Primary KPI:** Landing-page conversion rate
**Decision rule:** Ship if landing-page conversion rate exceeds the average of existing condition pages without compliance flags.
**Expected lift:** +10-16%
**Confidence:** 70%

### exp-865109018898 — Package a GLP-1 daily ginger routine

**Pillar:** Retention
**Affected surface:** Health blog and a new routine module
**URL:** https://gingerpeople.com/health-blog/
**Evidence:** `screenshots/content-blog.png`
**Hypothesis:** The health blog already educates on GLP-1 nausea and ginger, but a reader has to assemble the routine by hand. Turning that recurring side-effect moment into a named routine they can reorder should lift repeat purchase among the visitors the content pulls in.
**Primary change:** Create a "GLP-1 Ginger and Turmeric Daily Support" routine that merchandises chews, ginger shots, and turmeric juice together, placed inside the relevant blog posts and on a routines hub.
**Primary KPI:** 30-day repeat purchase rate among health-blog visitors
**Decision rule:** Ship if 30-day repeat purchase rate improves without hurting first-order value.
**Expected lift:** +6-12%
**Confidence:** 68%

### exp-a5baab722452 — Sell a travel nausea rescue kit

**Pillar:** AOV
**Affected surface:** New kit PDP plus cross-promotion on the Ginger Rescue category
**URL:** https://gingerpeople.com/products/travel-stomach-rescue-kit/
**Evidence:** `screenshots/collection-ginger-rescue-lozenges.png`
**Hypothesis:** The Ginger Rescue lozenge formats sell one at a time, but travel and motion sickness is one of the highest-intent use cases on the site. A travel-ready bundle of the formats should raise order value without new demand.
**Primary change:** Launch a "Travel Stomach Rescue Kit" combining the Ginger Rescue lozenge and tablet formats, positioned for motion sickness and road trips, promoted on the Ginger Rescue category and product pages.
**Primary KPI:** AOV among Ginger Rescue visitors
**Decision rule:** Ship if AOV rises by at least $3 without hurting Ginger Rescue conversion.
**Expected lift:** +8-14%
**Confidence:** 70%

### exp-4d8e07ad8394 — Build a GIN GINS flavor sampler

**Pillar:** AOV
**Affected surface:** GIN GINS candy range plus a new sampler PDP
**URL:** https://gingerpeople.com/products/gin-gins-flavor-tour/
**Evidence:** `screenshots/product-products-gin-gins-original-ginger-chews.png`
**Hypothesis:** A first-time candy shopper faces many GIN GINS flavors with no trial entry, so they pick one or none. A multi-flavor sampler gives them one confident first order and raises first-order value.
**Primary change:** Launch a "GIN GINS Flavor Tour" sampler of the core chews flavors with a single buy-online and find-near-me choice, cross-linked from each flavor's page.
**Primary KPI:** AOV among first-time candy shoppers
**Decision rule:** Ship if first-time AOV rises by at least $4 without hurting candy conversion.
**Expected lift:** +7-12%
**Confidence:** 72%

### exp-3a38b4dd6eca — Add reorder reminders to juices and shots

**Pillar:** Retention
**Affected surface:** Fiji Ginger Juice PDP and post-purchase email
**URL:** https://gingerpeople.com/products/fiji-ginger-juice/
**Evidence:** `screenshots/product-products-fiji-ginger-juice.png`
**Hypothesis:** Juices and shots are daily-use formats with a natural replenishment cadence the store never prompts, so a reorder depends on the shopper remembering. A timed reminder tied to pack size should recover predictable repeat demand.
**Primary change:** Add a reorder reminder, timed to pack size, that links the product and a one-tap "find near me," sent after a juice or shot purchase and surfaced on the PDP.
**Primary KPI:** 60-day repeat purchase rate on juices and shots
**Decision rule:** Ship if 60-day repeat purchase rate improves without raising email unsubscribe rate.
**Expected lift:** +5-9%
**Confidence:** 66%

## Competitor analysis

Competitors win by making the shopping job easier, through symptom-led navigation, retailer handoffs, and flavor-led merchandising. Ginger People's edge is deeper ginger specialization, real proof and reviews, a recipe and health-content library, and broader formats. The pattern to copy is theirs; the authority to win with is already Ginger People's.

| Competitor | Domain | Positioning | What they make easier | Ginger People edge | Pattern to adapt |
|---|---|---|---|---|---|
| Dramamine | dramamine.com | OTC motion sickness relief | Immediate use-case clarity | Natural ginger formats and candy permission | Dedicated nausea and travel pages with product-choice modules |
| Tummydrops | tummydrops.com | Ginger and peppermint drops for nausea | Symptom-specific shopping | Broader catalog, recipes, mainstream candy formats | Symptom-led navigation and format comparisons |
| Reed's | drinkreeds.com | Ginger beverages and ginger candy | Beverage-led discovery and retail familiarity | Deeper ginger specialization and health education | Stronger retailer handoff per product family |
| Chimes Gourmet | chimesgourmet.com | Ginger chews and candy variety | Simple flavor-led candy shopping | Stronger functional use cases, reviews, recipes, family story | Flavor sampler and heat comparison |

## Technical checks

| Check | Status | Detail |
|---|---|---|
| SSL Certificate | Pass | HTTPS storefront loaded successfully. |
| HTTPS Redirect | Pass | Requests resolved over HTTPS. |
| Sitemap | Warn | sitemap.xml returned 403 to the crawler (bot-blocked, not confirmed absent). |
| Robots.txt | Pass | robots.txt present, references a sitemap. |
| Critical Pages Loading | Pass | Homepage, 1 collection and 3 products all loaded. |
| Meta Tags & Social Previews | Pass | Page title and Open Graph tags present on the homepage. |
| Structured Data | Pass | JSON-LD found on the product page. |
| Favicon | Pass | Favicon link present. |
| Mobile-Friendly | Pass | Responsive viewport meta present. |
| Page Speed Mobile | Warn | Mobile homepage load event at 4.1s (navigation timing). |
| Page Speed Desktop | Warn | Desktop homepage load event at 4.3s (navigation timing). |
| Broken Links | Fail | 0 of 10 sampled internal links dead; /cart returned 404. |
| Image Optimization | Warn | 18 images sampled; 9 lazy-loaded, none in a modern format. |
| Cookie/Privacy | Pass | Privacy Policy link present; cookie/consent banner detected. |
| Checkout Reachable | Fail | Cart edge at /cart returned 404; checkout not entered. |

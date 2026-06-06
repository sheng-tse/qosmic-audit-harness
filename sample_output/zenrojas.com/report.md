# Zen Rojas audit — a clean wellness catalog the storefront barely sells

## Executive summary

Zen Rojas has a clean wellness catalog and almost no words to sell it, and at the top of the funnel that costs it twice. The homepage opens on a flat-lay of tea pouches with no headline, no benefit, and no call to action, and the tea the homepage features most, Organic Sleep Tea, was sold out when the crawl reached it, with no back-in-stock option. A first-time visitor reads nothing in the hero, and a shopper who clicks the featured blend lands on a page they cannot buy from. Those two leaks sit ahead of every merchandising question.

The merchandising then works against the catalog. The Best Sellers collection is sorted price low to high, so it opens on the $2 sampler instead of the $12-13 organic teas it should be selling. The store already advertises free shipping, though the banner says over $50 and the FAQ says over $30, and the cart shows no progress toward either threshold and no add-on. The Tea Essentials collection then sells the tea bags, a $5 infuser, and an $8 mug as separate items with no starter kit. Every lever for a higher first order is in the catalog; nothing assembles them, and the median item sits at $5.

The store clearly invested in search, since every product carries twenty or more keyword tags, yet the pages ship no product structured data, so that work earns no rich results and the tag sprawl spins up thin near-duplicate collection pages. The four closest competitors all let a shopper browse by goal (sleep, immunity, digestion) and Zen Rojas does not. The brand, the range, and the organic positioning are real assets. The first tests make the storefront speak and keep its heroes buyable: a benefit-led homepage and product fold, back-in-stock capture on sold-out heroes, Best Sellers sorted by what sells, and a subscription and a starter kit to lift the first order and the second.

## Proposed experiments

### exp-7298657c8c16 — Lead the homepage with the benefit, not a photo

**Pillar:** Conversion
**Affected surface:** Homepage hero
**URL:** https://zenrojas.com/
**Evidence:** `screenshots/home.png`
**Hypothesis:** The first screen is a flat-lay of tea pouches with no headline, benefit, or call to action, so a wellness shopper never reads what the brand does before deciding to scroll. Stating the benefit and a clear action in the fold should lift engagement and click-through into the catalog.
**Primary change:** Replace the silent hero with a benefit-led headline (the outcome: sleep, calm, immunity, digestion), a one-line value proposition, and a primary "Shop by goal" call to action over the product photography.
**Primary KPI:** Homepage click-through to a product or collection
**Decision rule:** Ship if homepage click-through improves without raising homepage bounce.
**Expected lift:** +8-14%
**Confidence:** 74%

### exp-a07049fc1de2 — Show title, price, and add to cart above the fold

**Pillar:** Conversion
**Affected surface:** Product detail pages
**URL:** https://zenrojas.com/products/organicsleeptea
**Evidence:** `screenshots/product-organicsleeptea.png`
**Hypothesis:** The PDP opens on a full-bleed photo of loose leaf with no product title, price, benefit, or add-to-cart visible in the fold. A shopper who arrives on the page has to scroll past an unlabeled image to learn anything, which leaks intent on the highest-value screen.
**Primary change:** Restructure the PDP fold to lead with the product name, the benefit, the price, star rating, and an add-to-cart button beside a smaller image, not a full-screen photo.
**Primary KPI:** PDP add-to-cart rate
**Decision rule:** Ship if add-to-cart rate improves without hurting PDP scroll depth or time on page.
**Expected lift:** +10-16%
**Confidence:** 75%

### exp-75456a3dfcb4 — Sort Best Sellers by what sells, not by price

**Pillar:** Conversion
**Affected surface:** Best Sellers collection
**URL:** https://zenrojas.com/collections/best-sellers
**Evidence:** `screenshots/collection-best-sellers.png`
**Hypothesis:** The Best Sellers collection is sorted price low to high, so it opens on the $2 Tea Bag Samplers instead of the $12-13 organic teas it is meant to sell. Leading a best-seller page with the cheapest item anchors low and buries the hero products a first-time shopper should see.
**Primary change:** Default Best Sellers to a manual or best-selling sort that leads with the hero organic teas, and keep price sort as an option rather than the default.
**Primary KPI:** Collection click-through to PDP
**Decision rule:** Ship if collection-to-PDP click-through and revenue per session improve without hurting conversion.
**Expected lift:** +6-12%
**Confidence:** 76%

### exp-87a9d96709f2 — Offer subscribe and save on the teas

**Pillar:** Retention
**Affected surface:** Tea PDPs
**URL:** https://zenrojas.com/products/organicsleeptea
**Evidence:** `screenshots/product-organicsleeptea.png`
**Hypothesis:** Tea is a daily-use consumable with a natural replenishment cadence, but the PDP offers only a one-time purchase, so every reorder depends on the shopper coming back on their own. A subscribe-and-save option converts a recurring habit into recurring revenue.
**Primary change:** Add a subscribe-and-save toggle (for example 10-15% off, monthly) to the tea PDPs, defaulting to one-time, with a clear cadence and easy cancel.
**Primary KPI:** Subscription take rate on tea orders
**Decision rule:** Ship if subscription take rate and 90-day revenue per customer improve without cutting first-order conversion.
**Expected lift:** +8-15%
**Confidence:** 72%

### exp-e7cc1c307a70 — Bundle a tea ritual starter kit

**Pillar:** AOV
**Affected surface:** Tea Essentials collection plus a new kit PDP
**URL:** https://zenrojas.com/products/tea-ritual-starter-kit/
**Evidence:** `screenshots/collection-tea-essentials.png`
**Hypothesis:** The Tea Essentials collection sells the tea bags, a $5 infuser, and an $8 mug as separate items, so a new shopper assembling a loose-leaf ritual has to find and add several products. One starter kit raises order value and removes the friction of brewing loose leaf for the first time.
**Primary change:** Launch a "Tea Ritual Starter Kit" pairing a tea with the infuser and mug at a small bundle discount, promoted on Tea Essentials; add the loose-leaf hero teas to the kit once they are back in stock.
**Primary KPI:** AOV among first-time buyers
**Decision rule:** Ship if first-time AOV rises without cutting overall conversion.
**Expected lift:** +8-14%
**Confidence:** 70%

### exp-30b42cccb43c — Add a free shipping progress bar and cart upsell

**Pillar:** AOV
**Affected surface:** Cart
**URL:** https://zenrojas.com/cart
**Evidence:** `screenshots/cart.png`
**Hypothesis:** The store advertises free shipping but names two different thresholds (the banner says over $50, the FAQ says over $30), and the cart shows no progress toward either and no add-on suggestion, so a shopper with one $12 tea gets no nudge to reach free shipping or add a second item. Settling on one threshold and surfacing the gap to it is a cheap lever on order value.
**Primary change:** Reconcile the banner and FAQ to a single free-shipping threshold, add a "spend X more for free shipping" progress bar tied to it, and offer one or two relevant cart add-ons (a sampler, the infuser).
**Primary KPI:** AOV
**Decision rule:** Ship if AOV rises without lowering cart-to-checkout completion.
**Expected lift:** +6-12%
**Confidence:** 70%

### exp-983f64ec03f0 — Replace keyword-stuffed tags with shop-by-goal collections

**Pillar:** Acquisition
**Affected surface:** Product tags and collection structure
**URL:** https://zenrojas.com/products/unwind
**Evidence:** `screenshots/product-unwind.png`
**Hypothesis:** Each product carries twenty or more keyword-stuffed tags (Unwind alone has tags like "unwind tea for sleep" and "premium organic loose leaf tea"), which Shopify turns into thin near-duplicate collection pages, while the store exposes only generic Best Sellers and Tea Essentials. Every close competitor lets shoppers browse by goal; Zen Rojas does not.
**Primary change:** Cut the tag list to a clean taxonomy and build benefit-based collections (Sleep, Calm, Immunity, Digestion), linked from the nav, with the existing samplers as the trial path into each.
**Primary KPI:** Organic landing sessions to benefit collections
**Decision rule:** Ship if organic sessions and assisted conversions rise without cannibalizing existing collection traffic.
**Expected lift:** +8-14%
**Confidence:** 72%

### exp-4734cd008ff3 — Add product structured data for rich results

**Pillar:** Acquisition
**Affected surface:** Product detail pages
**URL:** https://zenrojas.com/products/organicsleeptea
**Evidence:** https://zenrojas.com/products/organicsleeptea
**Hypothesis:** The crawl found no JSON-LD structured data on the sampled pages, so a catalog clearly built for search (twenty-plus tags per product) earns no product rich results, price, or rating snippets in Google. Adding Product schema turns existing organic intent into richer, higher-CTR listings.
**Primary change:** Emit Product JSON-LD on every PDP (name, image, price, availability, and aggregate rating once reviews exist), and Organization schema on the homepage.
**Primary KPI:** Organic PDP click-through rate from search
**Decision rule:** Ship if organic CTR to PDPs improves without manual-action or markup warnings in Search Console.
**Expected lift:** +6-12%
**Confidence:** 70%

### exp-d8b174281417 — Recover demand on sold-out hero teas

**Pillar:** Retention
**Affected surface:** Sold-out product pages
**URL:** https://zenrojas.com/products/organicsleeptea
**Evidence:** `screenshots/product-organicsleeptea.png`
**Hypothesis:** The crawl reached Organic Sleep Tea, the tea the homepage features, and found it sold out with no back-in-stock option, and Unwind was sold out too. A sold-out hero with no way to register interest loses both the sale and the email, so demand for the brand's best-known blends leaves no trace.
**Primary change:** Add a "notify me when back in stock" capture to every out-of-stock product, route it into a restock email, and keep sold-out heroes out of the homepage and best-seller slots until they return.
**Primary KPI:** Back-in-stock signups and orders recovered on restock
**Decision rule:** Ship if restock-driven orders and captured emails rise without adding checkout friction.
**Expected lift:** +8-15%
**Confidence:** 75%

### exp-24d6e4e4ed31 — Serve next-gen images and lazy-load the product pages

**Pillar:** Performance
**Affected surface:** Product detail pages
**URL:** https://zenrojas.com/products/organicsleeptea
**Evidence:** `screenshots/product-organicsleeptea.png`
**Hypothesis:** The sampled product pages lazy-load none of their ten images, and the store serves no modern image format on any sampled surface, on a storefront that leads with large photography. Heavy, eager-loaded PDP images slow the screen the brand is betting on, especially on mobile.
**Primary change:** Serve WebP or AVIF with responsive sizes, lazy-load below-the-fold images on the PDPs, and compress the hero, then confirm with a Lighthouse pass.
**Primary KPI:** Largest Contentful Paint on the product pages
**Decision rule:** Ship if LCP improves without visible quality loss.
**Expected lift:** +3-8%
**Confidence:** 68%

## Competitor analysis

The competitive set splits into two shapes Zen Rojas sits between: established benefit-led organic brands that have already industrialized "shop by how you feel," and a near-identical Australian certified-organic loose-leaf peer. Zen Rojas's $8-13 organic loose-leaf range is squarely in category, but it is the only one of the five whose own site does not yet let a shopper navigate by symptom or buy a curated wellness bundle.

| Competitor | Domain | Positioning | What they make easier | Zen Rojas edge | Pattern to adapt |
|---|---|---|---|---|---|
| Traditional Medicinals | traditionalmedicinals.com | Organic medicinal herbal tea formulated for specific needs | Symptom-first navigation (Sleep, Immunity, Digestion, Stress) plus subscription 3- and 6-packs | Loose-leaf-forward and a cheaper entry than bagged-only boxes; a more personal family story | Add benefit collections so functional blends are findable by problem, not by product name |
| Yogi | yogiproducts.com | USDA-organic Ayurvedic wellness tea, shop by mood and moment | Browse by mood, plus gift and variety packs that bundle benefits into one SKU | Existing $2 samplers are the same trial mechanic at a far lower price, with a 100% loose-leaf option | Frame the samplers as a "shop by goal" variety pack and merchandise them as the low-risk trial |
| Pukka | pukkaherbs.com | B-Corp, 100% organic and FairWild herbal wellbeing blends | Browse by need with strong trust scaffolding (organic, B-Corp, FairWild marks on every page) | Materially lower price on comparable organic blends | Surface organic and ethical-sourcing proof on every PDP, which Zen Rojas claims but never shows |
| Love Tea | lovetea.com.au | Australian, ACO certified-organic, naturopath-designed loose-leaf | Functional collections each with a naturopath rationale, across loose leaf and pyramid bags | Lower price on comparable loose leaf; a distinct US-shipping story | Pair each blend with a short "why these herbs" rationale on the PDP to justify the benefit claim |

## Technical checks

| Check | Status | Detail |
|---|---|---|
| SSL Certificate | Pass | HTTPS storefront loaded successfully. |
| HTTPS Redirect | Pass | Requests resolved over HTTPS. |
| Sitemap | Pass | sitemap.xml present (5 entries). |
| Robots.txt | Pass | robots.txt present, references a sitemap. |
| Critical Pages Loading | Pass | Homepage, 2 collections and 3 products all loaded. |
| Meta Tags & Social Previews | Pass | Page title and Open Graph tags present on the homepage. |
| Structured Data | Warn | No JSON-LD structured data found on the sampled pages. |
| Favicon | Warn | No favicon link found in the homepage head. |
| Mobile-Friendly | Pass | Responsive viewport meta present. |
| Page Speed Mobile | Warn | Mobile homepage load time not measured. |
| Page Speed Desktop | Warn | Desktop homepage load time not measured. |
| Broken Links | Pass | No dead links among 10 sampled. |
| Image Optimization | Warn | 10 images sampled; 0 lazy-loaded, none in a modern format. |
| Cookie/Privacy | Pass | Privacy Policy link present; cookie/consent banner detected. |
| Checkout Reachable | Pass | Cart reachable at /cart and cart.js responded. |

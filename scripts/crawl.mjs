#!/usr/bin/env node
// Phase 1 of a Qosmic audit. Drives a real Chrome over a representative set of
// storefront surfaces and writes everything the reasoning phase reads to
// sample_output/<host>/crawl/. The hard part is staying in one Cloudflare-cleared
// session so the deep pages come back as content, not a blanket 403.
//
//   node scripts/crawl.mjs <url> [--headful] [--max-products N]
//                                [--max-collections N] [--cdp <endpoint>]
//
// --cdp attaches to a Chrome you launched with --remote-debugging-port and
// cleared the challenge in by hand; it is the reliable fallback when automation
// alone cannot pass. See .claude/skills/crawl/SKILL.md.

import { chromium, devices } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// ---------------------------------------------------------------- CLI

function parseArgs(argv) {
  const args = { headful: false, maxProducts: 3, maxCollections: 2, cdp: null, timeout: 30000 };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--headful') args.headful = true;
    else if (a === '--max-products') args.maxProducts = Number(argv[++i]);
    else if (a === '--max-collections') args.maxCollections = Number(argv[++i]);
    else if (a === '--cdp') args.cdp = argv[++i];
    else if (a === '--timeout') args.timeout = Number(argv[++i]);
    else rest.push(a);
  }
  args.url = rest[0];
  return args;
}

function normalizeUrl(raw) {
  let u = raw.trim();
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  return new URL(u);
}

// ---------------------------------------------------------------- small helpers

const Pass = (detail) => ({ status: 'Pass', detail });
const Warn = (detail) => ({ status: 'Warn', detail });
const Fail = (detail) => ({ status: 'Fail', detail });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Human-ish pause between navigations keeps us under rate-limiting.
const breathe = () => sleep(400 + Math.floor(Math.random() * 700));

function slug(s) {
  return (s || 'page').toLowerCase().replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'page';
}

function median(nums) {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

const round2 = (n) => (n == null ? null : Math.round(n * 100) / 100);

// A Cloudflare-style interstitial, not the page we asked for. We key off the
// well-known challenge titles and markup rather than the status alone, because a
// managed challenge can arrive as a 403, a 503, or even a 200 that swaps in later.
function looksLikeChallenge(status, title, bodySample) {
  const t = (title || '').toLowerCase();
  const b = (bodySample || '').toLowerCase();
  if (/just a moment|checking your browser|attention required|access denied/.test(t)) return true;
  if (/cf-browser-verification|cf_chl_opt|challenge-platform|_cf_chl/.test(b)) return true;
  if (status === 403 && /cloudflare/.test(b)) return true;
  return false;
}

// ---------------------------------------------------------------- browser

async function openBrowser({ headful, cdp }) {
  if (cdp) {
    const browser = await chromium.connectOverCDP(cdp);
    return { browser, channel: 'cdp', attached: true };
  }
  // Real system Chrome clears managed challenges far more often than bundled
  // Chromium and is less bot-shaped; fall back to Chromium if it is not installed.
  let lastErr;
  for (const channel of ['chrome', undefined]) {
    try {
      const browser = await chromium.launch({
        headless: !headful,
        channel,
        args: ['--disable-blink-features=AutomationControlled'],
      });
      return { browser, channel: channel || 'chromium', attached: false };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

async function getContext(browser, attached) {
  if (attached) {
    // Reuse the human-cleared session rather than opening a fresh, un-cleared one.
    const existing = browser.contexts();
    if (existing.length) return existing[0];
  }
  return browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US',
  });
}

// ---------------------------------------------------------------- navigation

// Navigate the SAME page (so the cleared cf_clearance cookie rides along) and, if
// we land on a challenge, give the managed flavor a chance to resolve itself.
async function visit(page, url, timeout) {
  let resp;
  try {
    resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
  } catch (err) {
    return { status: 0, challenged: false, finalUrl: url, error: err.message };
  }
  let status = resp ? resp.status() : 0;
  let title = await page.title().catch(() => '');
  let body = await page.evaluate(() => document.body?.innerText?.slice(0, 600) || '').catch(() => '');

  if (looksLikeChallenge(status, title, body)) {
    // Wait out the managed challenge; it usually swaps in the real page in a few seconds.
    for (let waited = 0; waited < 20000; waited += 1500) {
      await sleep(1500);
      title = await page.title().catch(() => '');
      body = await page.evaluate(() => document.body?.innerText?.slice(0, 600) || '').catch(() => '');
      if (!looksLikeChallenge(200, title, body)) break;
    }
  }
  const challenged = looksLikeChallenge(status, title, body);
  return { status, challenged, finalUrl: page.url() };
}

// Prefer clicking an in-page link to a target over a fresh goto: a click from a
// cleared page reads as a human, a cold goto to a deep path reads as a bot. Read
// the real navigation status off the response rather than assuming 200, and fall
// back to visit() (same context, so still cleared) when no link matches or the
// click does not navigate. The selector anchors on the path end so /cart does not
// also match /cart-guide.
async function reach(page, { href, match }, timeout) {
  const link = match ? page.locator(`a[href$="${match}"], a[href$="${match}/"]`).first() : null;
  if (link && (await link.count().catch(() => 0))) {
    // Bound the wait: a JS-only nav link that never fires a navigation should drop
    // to the goto fallback in a few seconds, not hang on the full page timeout.
    const navResponse = page
      .waitForResponse((r) => r.request().isNavigationRequest() && r.frame() === page.mainFrame(), { timeout: Math.min(timeout, 10000) })
      .catch(() => null);
    try {
      await link.click({ timeout: 5000 });
      const resp = await navResponse;
      await page.waitForLoadState('domcontentloaded', { timeout }).catch(() => {});
      const status = resp ? resp.status() : 0;
      if (status) {
        const title = await page.title().catch(() => '');
        const body = await page.evaluate(() => document.body?.innerText?.slice(0, 600) || '').catch(() => '');
        return { status, challenged: looksLikeChallenge(status, title, body), finalUrl: page.url(), via: 'click' };
      }
    } catch {
      // fall through to a direct visit
    }
  }
  const r = await visit(page, href, timeout);
  return { ...r, via: 'goto' };
}

// ---------------------------------------------------------------- capture

async function capture(page, name, dirs) {
  const file = `${name}.png`;
  await page.screenshot({ path: join(dirs.screenshots, file) }).catch(() => {});
  const text = await page.evaluate(() => document.body?.innerText || '').catch(() => '');
  await writeFile(join(dirs.pages, `${name}.txt`), text);

  const meta = await page
    .evaluate(() => {
      const get = (sel, attr) => document.querySelector(sel)?.getAttribute(attr) || '';
      const imgs = Array.from(document.images);
      return {
        title: document.title || '',
        description: get('meta[name="description"]', 'content'),
        ogTitle: get('meta[property="og:title"]', 'content'),
        ogImage: get('meta[property="og:image"]', 'content'),
        viewport: get('meta[name="viewport"]', 'content'),
        favicon: get('link[rel~="icon"]', 'href'),
        hasLdJson: !!document.querySelector('script[type="application/ld+json"]'),
        h1: document.querySelector('h1')?.innerText?.trim() || '',
        images: {
          total: imgs.length,
          sized: imgs.filter((i) => i.getAttribute('width') && i.getAttribute('height')).length,
          lazy: imgs.filter((i) => i.getAttribute('loading') === 'lazy').length,
          modern: imgs.filter((i) => /\.(webp|avif)(\?|$)/i.test(i.currentSrc || i.src)).length,
        },
        hasPrivacyLink: !!Array.from(document.querySelectorAll('a')).find(
          (a) => /privacy/i.test(a.textContent || '') || /privacy/i.test(a.getAttribute('href') || '')
        ),
        hasCookieBanner: !!document.querySelector(
          '[id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i],#onetrust-banner-sdk'
        ),
      };
    })
    .catch(() => ({}));

  const perf = await page
    .evaluate(() => {
      const n = performance.getEntriesByType('navigation')[0];
      if (!n) return {};
      return {
        ttfb: Math.round(n.responseStart),
        domContentLoaded: Math.round(n.domContentLoadedEventEnd),
        load: Math.round(n.loadEventEnd),
      };
    })
    .catch(() => ({}));

  return { screenshot: `screenshots/${file}`, text: `pages/${name}.txt`, textLength: text.length, meta, perf };
}

// ---------------------------------------------------------------- data fetches

// Pull text + status through the browser context so the cf_clearance cookie and
// real headers apply; a bare fetch() would look like a different, un-cleared client.
async function grab(request, url, timeout) {
  try {
    const r = await request.get(url, { timeout, failOnStatusCode: false });
    const body = await r.text();
    return { status: r.status(), ok: r.ok(), body };
  } catch (err) {
    return { status: 0, ok: false, body: '', error: err.message };
  }
}

async function fetchShopify(request, origin, timeout) {
  const out = { isShopify: false, productCount: 0, collectionCount: 0, priceRange: null, sampleProducts: [], raw: {} };

  // products.json is paginated; walk it until it runs dry or we have plenty.
  const products = [];
  for (let page = 1; page <= 8; page++) {
    const r = await grab(request, `${origin}/products.json?limit=250&page=${page}`, timeout);
    if (!r.ok) break;
    let parsed;
    try { parsed = JSON.parse(r.body); } catch { break; }
    if (!parsed.products?.length) break;
    products.push(...parsed.products);
    if (page === 1) out.raw.products = r.body;
    if (parsed.products.length < 250) break;
  }

  if (products.length) {
    out.isShopify = true;
    out.productCount = products.length;
    const prices = products.flatMap((p) => (p.variants || []).map((v) => parseFloat(v.price)).filter((n) => !isNaN(n)));
    if (prices.length) {
      out.priceRange = { min: round2(Math.min(...prices)), max: round2(Math.max(...prices)), median: round2(median(prices)) };
    }
    out.sampleProducts = products.slice(0, 12).map((p) => ({
      title: p.title,
      handle: p.handle,
      price: round2(parseFloat(p.variants?.[0]?.price)),
      tags: Array.isArray(p.tags) ? p.tags : String(p.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    }));
  }

  const col = await grab(request, `${origin}/collections.json?limit=250`, timeout);
  if (col.ok) {
    try {
      const parsed = JSON.parse(col.body);
      out.collectionCount = parsed.collections?.length || 0;
      out.collections = parsed.collections || [];
      out.raw.collections = col.body;
    } catch { /* not Shopify-shaped */ }
  }

  return { shopify: out, allProducts: products };
}

// Spread the sample across the catalog instead of taking the first N neighbors.
function spread(items, n) {
  if (items.length <= n) return items;
  const step = items.length / n;
  return Array.from({ length: n }, (_, i) => items[Math.floor(i * step)]);
}

function pathOf(u) {
  try { return new URL(u).pathname.replace(/\/+$/, '') || '/'; } catch { return '/'; }
}

function isInternal(href, origin) {
  try { return new URL(href).origin === origin; } catch { return false; }
}

// Sort homepage links into product and category buckets by URL shape and anchor
// text. This is the catalog discovery path on non-Shopify stores, where there is
// no products.json to read.
function classifyLinks(navLinks, origin) {
  const seen = new Set();
  const uniq = [];
  for (const l of navLinks) {
    if (!isInternal(l.href, origin)) continue;
    const path = pathOf(l.href);
    if (path === '/' || seen.has(path)) continue;
    seen.add(path);
    uniq.push({ href: l.href, text: l.text || '', path });
  }
  const isProduct = (p) => /\/(products?|item)\/[^/]+$/i.test(p);
  const isCategory = (p, t) =>
    /\/(product-category|collections?|categor(y|ies)|catalog)(\/[^/]+)?$/i.test(p) ||
    /^\/shop(\/[^/]+)?$/i.test(p) ||
    /\b(all products|shop all|view all|shop now|browse)\b/i.test(t);
  const products = uniq.filter((l) => isProduct(l.path));
  const categories = uniq.filter((l) => !isProduct(l.path) && isCategory(l.path, l.text));
  return { products, categories };
}

// ---------------------------------------------------------------- main

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.url) {
    console.error('usage: node scripts/crawl.mjs <url> [--headful] [--max-products N] [--max-collections N] [--cdp <endpoint>]');
    process.exit(2);
  }

  const target = normalizeUrl(args.url);
  const origin = target.origin;
  const host = target.host;
  const root = join('sample_output', host, 'crawl');
  const dirs = { root, screenshots: join(root, 'screenshots'), pages: join(root, 'pages'), data: join(root, 'data') };
  for (const d of Object.values(dirs)) await mkdir(d, { recursive: true });

  console.log(`crawling ${origin} -> ${root}`);
  const { browser, channel, attached } = await openBrowser(args);
  const context = await getContext(browser, attached);
  context.setDefaultTimeout(args.timeout);
  const request = context.request;

  const surfaces = [];
  const blocked = [];
  const record = (entry) => {
    surfaces.push(entry);
    if (entry.challenged || entry.status === 0 || entry.status >= 400) {
      blocked.push({ url: entry.url, status: entry.status, challenged: !!entry.challenged });
    }
    const flag = entry.challenged ? ' [challenged]' : '';
    console.log(`  ${String(entry.status).padStart(3)} ${entry.kind.padEnd(10)} ${entry.url}${flag}`);
  };

  // --- homepage first: clearing it clears Cloudflare for the rest of the session
  const page = await context.newPage();
  const homeNav = await visit(page, origin + '/', args.timeout);
  const home = { name: 'home', kind: 'home', url: homeNav.finalUrl, status: homeNav.status, challenged: homeNav.challenged, error: homeNav.error, ...(await capture(page, 'home', dirs)) };
  record(home);
  // Let the nav finish rendering before reading links off it; those links are the
  // spine of discovery on non-Shopify stores.
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  const navLinks = await page
    .evaluate(() => Array.from(document.querySelectorAll('a[href]')).map((a) => ({ href: a.href, text: (a.textContent || '').trim() })))
    .catch(() => []);

  // --- structured Shopify data (now that the session is cleared)
  const { shopify, allProducts } = await fetchShopify(request, origin, args.timeout);

  // Two ways to find the catalog: Shopify's JSON when it answers, otherwise the
  // homepage links classified by URL shape and anchor text (the skill's non-Shopify path).
  let collectionTargets, productTargets;
  if (shopify.isShopify && allProducts.length) {
    collectionTargets = spread(shopify.collections || [], args.maxCollections).map((c) => ({ name: `collection-${slug(c.handle)}`, url: `${origin}/collections/${c.handle}`, match: `/collections/${c.handle}` }));
    productTargets = spread(allProducts, args.maxProducts).map((p) => ({ name: `product-${slug(p.handle)}`, url: `${origin}/products/${p.handle}`, match: `/products/${p.handle}` }));
  } else {
    const { products, categories } = classifyLinks(navLinks, origin);
    collectionTargets = spread(categories, args.maxCollections).map((l) => ({ name: `collection-${slug(l.path)}`, url: l.href, match: l.path }));
    productTargets = spread(products, args.maxProducts).map((l) => ({ name: `product-${slug(l.path)}`, url: l.href, match: l.path }));
  }

  const captured = new Set(['/']); // homepage already done; never capture a surface twice
  const markCaptured = (url) => captured.add(pathOf(url));

  // --- collections / category pages
  for (const c of collectionTargets) {
    if (captured.has(pathOf(c.url))) continue;
    markCaptured(c.url);
    await breathe();
    const nav = await reach(page, { href: c.url, match: c.match }, args.timeout);
    record({ name: c.name, kind: 'collection', url: nav.finalUrl || c.url, status: nav.status, challenged: nav.challenged, via: nav.via, ...(await capture(page, c.name, dirs)) });
  }

  // --- products (PDP), spread across the catalog
  let firstProductSurface = null;
  for (const p of productTargets) {
    if (captured.has(pathOf(p.url))) continue;
    markCaptured(p.url);
    await breathe();
    const nav = await reach(page, { href: p.url, match: p.match }, args.timeout);
    const surface = { name: p.name, kind: 'product', url: nav.finalUrl || p.url, status: nav.status, challenged: nav.challenged, via: nav.via, ...(await capture(page, p.name, dirs)) };
    record(surface);
    if (!firstProductSurface && surface.status === 200 && !surface.challenged) firstProductSurface = surface;
  }

  // --- intent content pages: discover from the homepage nav, fall back to a common path
  const wanted = [
    { key: 'where-to-buy', re: /where.?to.?buy|stockist|store.?locator|find.?(us|a.?store)/i },
    { key: 'faq', re: /faq|frequently.?asked|help.?cent|support/i },
    { key: 'about', re: /about|our.?story|who.?we.?are/i },
    { key: 'recipes', re: /recipe/i },
    { key: 'blog', re: /blog|journal|news/i },
  ];
  const contentTargets = [];
  for (const w of wanted) {
    const hit = navLinks.find((l) => isInternal(l.href, origin) && pathOf(l.href).length > 1 && (w.re.test(l.text) || w.re.test(l.href)));
    if (hit) contentTargets.push({ key: w.key, url: hit.href, match: pathOf(hit.href) });
  }
  // Guarantee an attempt at Where To Buy even when the nav hides it (exit criterion).
  if (!contentTargets.some((t) => t.key === 'where-to-buy')) {
    contentTargets.push({ key: 'where-to-buy', url: `${origin}/pages/where-to-buy`, match: '/pages/where-to-buy' });
  }
  for (const t of contentTargets.slice(0, 5)) {
    if (captured.has(pathOf(t.url))) continue;
    markCaptured(t.url);
    await breathe();
    const nav = await reach(page, { href: t.url, match: t.match }, args.timeout);
    record({ name: `content-${t.key}`, kind: 'content', url: nav.finalUrl || t.url, status: nav.status, challenged: nav.challenged, via: nav.via, ...(await capture(page, `content-${t.key}`, dirs)) });
  }

  // --- cart (page for the screenshot/status, cart.js for the data)
  await breathe();
  const cartNav = await reach(page, { href: `${origin}/cart`, match: '/cart' }, args.timeout);
  const cartSurface = { name: 'cart', kind: 'cart', url: `${origin}/cart`, status: cartNav.status, challenged: cartNav.challenged, via: cartNav.via, ...(await capture(page, 'cart', dirs)) };
  record(cartSurface);
  const cartJs = await grab(request, `${origin}/cart.js`, args.timeout);

  // --- mobile homepage screenshot
  const mobileCtx = await browser.newContext({ ...devices['iPhone 13'] });
  const mobilePage = await mobileCtx.newPage();
  const mobileNav = await visit(mobilePage, origin + '/', args.timeout);
  const homeMobile = { name: 'home-mobile', kind: 'mobile', url: mobileNav.finalUrl, status: mobileNav.status, challenged: mobileNav.challenged, ...(await capture(mobilePage, 'home-mobile', dirs)) };
  record(homeMobile);
  await mobileCtx.close();

  // --- raw infra files
  const robots = await grab(request, `${origin}/robots.txt`, args.timeout);
  const sitemap = await grab(request, `${origin}/sitemap.xml`, args.timeout);

  // --- broken-link sample: a handful of internal links, plus the cart edge.
  // Keep genuinely dead links (404/410/5xx) apart from request-context 403s, which
  // are Cloudflare bot management rather than pages that are broken for a shopper.
  const internal = [...new Set(navLinks.map((l) => l.href).filter((h) => isInternal(h, origin)))].slice(0, 10);
  const linkResults = [];
  for (const href of internal) {
    const r = await grab(request, href, args.timeout);
    linkResults.push({ href, status: r.status });
  }
  const brokenLinks = linkResults.filter((l) => l.status === 404 || l.status === 410 || l.status >= 500);
  const botBlocked = linkResults.filter((l) => [401, 403, 429].includes(l.status) || l.status === 0);
  const links = { sampled: linkResults.length, broken: brokenLinks, botBlocked };

  // --- write raw data files
  if (shopify.raw.products) await writeFile(join(dirs.data, 'products.json'), shopify.raw.products);
  if (shopify.raw.collections) await writeFile(join(dirs.data, 'collections.json'), shopify.raw.collections);
  if (cartJs.ok) await writeFile(join(dirs.data, 'cart.js'), cartJs.body);
  if (robots.body) await writeFile(join(dirs.data, 'robots.txt'), robots.body);
  if (sitemap.body) await writeFile(join(dirs.data, 'sitemap.xml'), sitemap.body);

  // --- 15 probed technical checks, grounded in what we just captured
  const tech = buildTechChecks({ home, surfaces, robots, sitemap, cartSurface, cartJs, productSurface: firstProductSurface, homeMobile, links });

  const manifest = {
    url: target.href,
    origin,
    host,
    crawledAt: new Date().toISOString(),
    browser: channel,
    headful: args.headful,
    shopify: { isShopify: shopify.isShopify, productCount: shopify.productCount, collectionCount: shopify.collectionCount, priceRange: shopify.priceRange, sampleProducts: shopify.sampleProducts },
    surfaces,
    tech,
    blocked,
    links: { sampled: links.sampled, broken: brokenLinks.map((l) => ({ href: l.href, status: l.status })), botBlocked: botBlocked.length },
  };
  await writeFile(join(dirs.root, 'manifest.json'), JSON.stringify(manifest, null, 2));

  if (!attached) await browser.close();
  else await browser.close().catch(() => {});

  const reached = surfaces.filter((s) => s.status === 200 && !s.challenged).length;
  console.log(`\ndone: ${reached}/${surfaces.length} surfaces reached, ${blocked.length} blocked. manifest -> ${join(dirs.root, 'manifest.json')}`);
}

// ---------------------------------------------------------------- tech checks

function buildTechChecks({ home, surfaces, robots, sitemap, cartSurface, cartJs, productSurface, homeMobile, links }) {
  const checks = {};
  const homeOk = home.status === 200 && !home.challenged;
  const cols = surfaces.filter((s) => s.kind === 'collection');
  const prods = surfaces.filter((s) => s.kind === 'product');
  const loaded = (s) => s.status === 200 && !s.challenged;

  checks['SSL Certificate'] = home.url.startsWith('https')
    ? (homeOk ? Pass('HTTPS storefront loaded successfully.') : Warn(`HTTPS reachable but homepage returned ${home.status}${home.challenged ? ' (challenge)' : ''}.`))
    : Fail('Storefront did not resolve over HTTPS.');

  checks['HTTPS Redirect'] = home.url.startsWith('https')
    ? Pass('Requests resolved over HTTPS.')
    : Warn('Could not confirm an http to https redirect.');

  const sitemapUrls = (sitemap.body.match(/<loc>/g) || []).length;
  checks['Sitemap'] = sitemap.ok
    ? Pass(`sitemap.xml present${sitemapUrls ? ` (${sitemapUrls} entries)` : ''}.`)
    : sitemap.status === 404
      ? Fail('sitemap.xml returned 404.')
      : sitemap.status === 403
        ? Warn('sitemap.xml returned 403 to the crawler (bot-blocked, not confirmed absent).')
        : Warn(`sitemap.xml returned ${sitemap.status}.`);

  checks['Robots.txt'] = robots.ok
    ? Pass(`robots.txt present${/sitemap:/i.test(robots.body) ? ', references a sitemap' : ''}.`)
    : Warn(`robots.txt returned ${robots.status}.`);

  const deep = [...cols, ...prods];
  const deepLoaded = deep.filter(loaded).length;
  checks['Critical Pages Loading'] = !homeOk
    ? Fail(`Homepage returned ${home.status}${home.challenged ? ' (challenge)' : ''}.`)
    : deep.length && deepLoaded === deep.length
      ? Pass(`Homepage, ${cols.length} collections and ${prods.length} products all loaded.`)
      : Warn(`Homepage loaded; ${deepLoaded}/${deep.length} deep pages reached.`);

  const m = home.meta || {};
  checks['Meta Tags & Social Previews'] = m.title && (m.ogTitle || m.ogImage)
    ? Pass('Page title and Open Graph tags present on the homepage.')
    : m.title
      ? Warn('Page title present; Open Graph tags missing.')
      : Fail('Homepage exposed no title.');

  const ld = (productSurface?.meta?.hasLdJson) || m.hasLdJson;
  checks['Structured Data'] = ld
    ? Pass(`JSON-LD found on the ${productSurface?.meta?.hasLdJson ? 'product page' : 'homepage'}.`)
    : Warn('No JSON-LD structured data found on the sampled pages.');

  checks['Favicon'] = m.favicon
    ? Pass('Favicon link present.')
    : Warn('No favicon link found in the homepage head.');

  checks['Mobile-Friendly'] = m.viewport
    ? Pass(`Responsive viewport meta present ("${m.viewport.slice(0, 40)}").`)
    : Warn('No viewport meta tag on the homepage.');

  const speed = (surface, label) => {
    const load = surface?.perf?.load;
    if (!load) return Warn(`${label} load time not measured.`);
    const secs = (load / 1000).toFixed(1);
    if (load < 3000) return Pass(`${label} load event at ${secs}s (navigation timing).`);
    if (load < 6000) return Warn(`${label} load event at ${secs}s (navigation timing).`);
    return Fail(`${label} load event at ${secs}s (navigation timing).`);
  };
  checks['Page Speed Mobile'] = speed(homeMobile, 'Mobile homepage');
  checks['Page Speed Desktop'] = speed(home, 'Desktop homepage');

  // /cart's 404 is browser-confirmed so it counts; sampled-link 403s do not (bot management).
  const cartBroken = cartSurface.status === 404 || cartSurface.status === 410 || cartSurface.status >= 500;
  const dead = links.broken.length;
  checks['Broken Links'] = dead || cartBroken
    ? Fail(`${dead} of ${links.sampled} sampled internal links dead (404/410/5xx)${cartBroken ? `; /cart returned ${cartSurface.status}` : ''}.`)
    : Pass(`No dead links among ${links.sampled} sampled${links.botBlocked.length ? `; ${links.botBlocked.length} bot-blocked (inconclusive)` : ''}.`);

  const img = productSurface?.meta?.images || home.meta?.images;
  checks['Image Optimization'] = !img || !img.total
    ? Warn('No images sampled for an optimization read.')
    : img.modern > 0 || img.lazy / img.total > 0.5
      ? Pass(`${img.total} images sampled; ${img.lazy} lazy-loaded, ${img.modern} in webp/avif.`)
      : Warn(`${img.total} images sampled; ${img.lazy} lazy-loaded, none in a modern format.`);

  checks['Cookie/Privacy'] = m.hasPrivacyLink
    ? Pass(`Privacy Policy link present${m.hasCookieBanner ? '; cookie/consent banner detected' : '; no consent banner detected'}.`)
    : Warn('No Privacy Policy link found on the homepage.');

  const cartReachable = cartSurface.status === 200 && !cartSurface.challenged;
  checks['Checkout Reachable'] = cartReachable
    ? Pass(`Cart reachable at /cart${cartJs.ok ? ' and cart.js responded' : ''}.`)
    : Fail(`Cart edge at /cart returned ${cartSurface.status}${cartSurface.challenged ? ' (challenge)' : ''}; checkout not entered.`);

  return checks;
}

main().catch((err) => {
  console.error('crawl failed:', err);
  process.exit(1);
});

# Page speed tests

Page speed utilities to see First Contentful Paint (FCP) and Largest Contentful Paint (LCP) events.

- https://pagespeed.web.dev
  - Example: https://pagespeed.web.dev/report?url=https%3A%2F%2Ftradingstrategy.ai%2Ftrading-view%2Fbinance%2Fpancakeswap-v2%2Fdgt-bnb
- https://www.webpagetest.org/
  - Example: https://www.webpagetest.org/result/211230_BiDc5M_0b72ec65b0eb6523fddb06496ab832d4/1/details/#waterfall_view_step1

## Measuring with `perf:probe`

Single PageSpeed Insights runs are too noisy to decide anything: on 2026-11-22 three runs
of the same vault page gave a simulated LCP of 0.9, 2.4 and 4.2 s. Judge speed changes on
the median of several runs of `scripts/perf-probe.mjs` instead:

```shell
pnpm run perf:probe                                # production, default URL set, 5 runs each
pnpm run perf:probe --base http://127.0.0.1:5173   # dev server or a local build
pnpm run perf:probe --url /vaults/protocols/morpho --runs 9
pnpm run perf:probe --interactions                 # menu, sort, compare checkbox, filters
pnpm run perf:probe --cache-bust                   # force Cloudflare/origin misses
pnpm run perf:probe --json out.json                # keep the raw runs
```

It loads each page in a fresh Playwright context with Moto G4 emulation, 4× CPU slowdown
and slow-4G network emulation (150 ms latency, 1.6 Mbit/s), and reports median and range of
TTFB, FCP, LCP (with the element), DOMContentLoaded, load, TBT, CLS, HTML size, request
count and `cf-cache-status`. TBT counts long tasks from FCP to a fixed 8 s after navigation
start, so work that is merely deferred still counts. `--interactions` measures the Event
Timing duration of opening and closing the mobile menu, sorting a column, ticking a
comparison checkbox and opening the filters, after hydration.

Limits: CDP network emulation does not add connection set-up to the origin, so TTFB reads
far lower than real phones see (CrUX phone TTFB p75 was 1,070 ms in November 2026); use
the field data for TTFB. A local build also lacks Cloudflare's cache, Early Hints and
HTTP/2 prioritisation, so the final check of a change is the probe against production
after release.

### Baseline, 2026-11-22 (production, revision 5bfa11a1)

Median of 5 runs (range for LCP):

| Page                                    | FCP ms | LCP ms          | TBT ms | HTML KB (decoded / transfer) | Requests |
| --------------------------------------- | -----: | --------------- | -----: | ---------------------------- | -------: |
| `/`                                     |    644 | 728 (688–4,104) |     65 | 164 / 31                     |      129 |
| `/vaults`                               |    708 | 708 (600–772)   |    503 | 642 / 76                     |      161 |
| `/vaults/protocols/morpho`              |    664 | 664 (604–732)   |    757 | 685 / 74                     |      149 |
| `/vaults/protocols/lighter`             |    628 | 628 (588–656)   |    356 | 227 / 35                     |      142 |
| `/vaults/curators/steakhouse-financial` |    660 | 660 (616–768)   |    847 | 749 / 79                     |      142 |
| `/vaults/stablecoins/usdc`              |    668 | 668 (592–700)   |    777 | 663 / 79                     |      149 |
| `/vaults/rektober`                      |    616 | 616 (544–960)   |    125 | 175 / 34                     |      134 |
| `/glossary/morpho`                      |    588 | 588 (508–684)   |      0 | 90 / 19                      |       88 |

CLS was 0 everywhere. The 4.1 s home page run was a Cloudflare `EXPIRED` copy: the origin
rebuilt the page while the visitor waited (the reason for the background cache warmer, see
`docs/cache-invalidation.md`). In the lab, LCP on hub pages is fine; their problem is main-thread
work — TBT 500–850 ms on the listing pages.

Interaction durations (median ms), `/vaults` and Morpho hub: open menu 64 / 64, close menu
32 / 40, sort column 24 / 32, compare checkbox 80 / 80, open filters 64 / 56.

## Hub page weight (2026-11-22)

Vault listing pages (hubs, curators, `/vaults`) were the heaviest pages: 640–750 KB of HTML,
of which ~260 KB is the hydration data for the first 75 rows and ~270 KB their markup. A CPU
profile of the Morpho hub (4× CPU) split its ~1.9 s of main-thread work into ~0.85 s of
JavaScript (ECharts the largest at 0.26 s, then number formatting at 0.13 s) and ~1.0 s of
parsing, style and layout. What changed:

- Number formatting reuses one `Intl.NumberFormat` per locale and option set
  (`formatWithLocale` in `src/lib/helpers/formatters.ts`); `toLocaleString` with options
  built a new formatter on every call.
- `Tooltip` attaches its window resize/scroll listeners only while open, instead of two
  per instance (a table has a few hundred) on mount.
- The hub mini chart loads and draws ECharts once the chart is near the viewport and the
  browser is idle (`whenVisibleAndIdle`); the data request still starts at once.
- Listing rows carry only the rate values, CORE3 rating and Xerberus score/entity type of
  their nested objects (see `docs/vault-data-optimisation-plan.md`).
- The mobile navigation panel renders its compact footer on first open.

Result on a local production build (median of 3, 4× CPU): main-thread busy time Morpho hub
1,883 → 1,711 ms, Steakhouse curator 2,007 → 1,825 ms, `/vaults` 1,400 → 1,330 ms;
JavaScript time −13 to −18 %. HTML: Morpho 681 → 632 KB (hydration data 264 → 227 KB),
Steakhouse 746 → 701 KB, `/vaults` 639 → 604 KB. The remaining weight is the 75 server-rendered
rows; rendering fewer of them is the largest lever left.

Measure local builds through `scripts/h2-proxy.mjs` (HTTP/2) or with a CPU profile:
over plain HTTP/1.1 the ~130 JS chunks arrive a few at a time, hydration runs as many short
tasks, and TBT reads 0 although the same work takes 1.9 s.

## Homepage payloads

The homepage is server-rendered and its `load` result is serialised into the
initial HTML. Keep that payload limited to data that the route renders:

- Return only the vault cards displayed by `TopVaults`.
- For strategy tiles, retain only the selected chart series. Downsample it to
  daily points before serialisation because the tile renderer uses daily data.
- Do not add a server-side fetch for data that no homepage component consumes.

For a local before/after comparison, open a fresh Playwright browser context
against the Vite development server and compare the navigation entry's
`transferSize`. Development-server timing includes variable upstream data fetches,
so treat document transfer size as the reliable signal for frontend-only changes.

## Enabling early hint testing

https://blog.cloudflare.com/early-hints/#testing-early-hints-with-web-page-test

# Mobile friendliness tests

- https://search.google.com/test/mobile-friendly
  - Example https://search.google.com/test/mobile-friendly?url=https%3A%2F%2Ftradingstrategy.ai%2Ftrading-view%2Fbinance%2Fpancakeswap-v2%2Fbillntedsupsidedownbackwardsmatrixmetaverse5000xinu-bnb&url=https%3A%2F%2Ftradingstrategy.ai%2Ftrading-view%2Fbinance%2Fpancakeswap-v2%2Fbillntedsupsidedownbackwardsmatrixmetaverse5000xinu-bnb&hl=en

# Web fonts, preloads and Core Web Vitals

The licensed Neue Haas Grotesk faces, Source Serif Pro and Source Code Pro are declared in
`static/fonts/fonts7.css` (the file is renamed whenever its contents change: the woff2 files it
references are served with a one-year `Cache-Control` by `scripts/server.js`, see
`scripts/static-cache-control.js`). These mechanisms keep them, and the JS, from hurting Core Web Vitals:

1. **Inlined `@font-face` rules.** `src/lib/server/font-faces.ts` inlines the rules of
   `fonts7.css` into every page's `<head>` (the `%ts:font-faces%` placeholder in
   `src/app.html`), so they cost no request and apply from the first paint. Until 2026-11-22
   the stylesheet was loaded non-blocking (`media="print"` → `onload="this.media='all'"`):
   when the page painted before it applied — increasingly often as first paint got faster —
   the late rules made Chrome lay the text out again and that repaint was reported as a new
   LCP (curator page, lab: 0.4 s → 3.8–4.1 s once CSS was inlined; see "Inlining CSS" below).
   The trade-off: with the rules present from the start, `optional` allows its short block
   period (≤ 100 ms in Chrome) for text whose woff2 is not yet loaded on a first visit. In the
   lab, FCP was the same with and without the inlined rules (312 ms on `/`).
   All faces are `font-display: optional`: a face that
   is not ready when the text is first rendered is not swapped in for that page view, and the
   cached file is used from the next page on. They were `swap` until 2026-11; on a slow phone
   the swap landed seconds after first paint, and because a repaint that grows the text box —
   bold text especially — is reported as a new LCP entry, it moved LCP from first paint to the
   swap (Morpho hub, lab: 1.1 s → 4.4 s).
2. **Metric-matched fallbacks.** Every family has a `… Fallback` `@font-face` in
   `src/lib/components/css/font-fallbacks.css` — part of the render-blocking app CSS, so it
   applies from the first paint: a
   system font (`Arial`/`Roboto` for the grotesks, `Georgia` for the serif,
   `Courier New` for the mono) with `size-adjust`, `ascent-override`, `descent-override` and
   `line-gap-override` tuned so it occupies the same space as the web font, within the
   tolerance of the platform's actual fallback font; the 500–900 weights use the bold local
   face, rescaled for its wider glyphs. On a slow first visit this is what the visitor reads,
   laid out as with the web font. (Before the fallbacks existed, the swap alone was a CLS of
   0.17–0.25 on text-heavy pages.) The overrides were computed with `@capsizecss/core` from the metrics
   unpacked out of the woff2 files (Display and Text differ per weight, so their fallbacks
   are declared per weight range); recompute them if a font file changes. The font stacks in
   `src/lib/components/css/typography.css` and `typography-new.css` list the fallback right
   after the web font, and end in a generic family (`system-ui, sans-serif`, `serif`,
   `monospace`). The fallback faces are `font-display: swap`: a slow or missing local font
   never holds text invisible (without it they defaulted to `auto`, a block period of up to
   3 s by the spec; Chromium already paints during a local lookup, other engines may not).
3. **Preload headers.** `src/lib/server/font-preload.ts` adds `Link: rel=preload` headers
   (Cloudflare turns them into 103 Early Hints) for the three primary woff2 files on the templates whose LCP element is text (not the home
   page, where they delay the hero). With `optional` they only matter when they arrive before
   first render, i.e. on fast connections.
4. **No JS preloads in the `Link` header.** `handleResponseHeaders` in `src/hooks.server.ts`
   limits SvelteKit's own `Link` preloads to stylesheets. SvelteKit otherwise lists every JS
   chunk of the route (~100 files, 200–250 KB) there, Cloudflare sends them as 103 Early Hints,
   and on a phone they took the bandwidth the render-blocking CSS needed. Since 2026-11-22
   stylesheets under 40 KB are inlined (below), so most pages send no stylesheet preloads at all.

`tests/integration/layout-shift.test.ts` delays the woff2 responses and asserts the token,
pair and glossary pages stay under a CLS of 0.05 on a phone viewport.

## Inlining CSS (2026-11-22)

`inlineStyleThreshold` in `svelte.config.js` is 40 KB (was 8 KB): every stylesheet under 40 KB
is inlined into the HTML, so first paint no longer waits for five or six separate CSS
requests. Measured on a local production build through `scripts/h2-proxy.mjs` (HTTP/2,
Brotli), `perf:probe` defaults, median of 5:

| Page                                    | FCP 8 KB → 40 KB | LCP 8 KB → 40 KB + inlined font faces | HTML (Brotli) |
| --------------------------------------- | ---------------: | ------------------------------------: | ------------: |
| `/`                                     |     572 → 312 ms |                          624 → 520 ms |    24 → 41 KB |
| `/vaults/protocols/morpho`              |     588 → 328 ms |                          588 → 384 ms |    62 → 81 KB |
| `/vaults/rektober`                      |     668 → 464 ms |                          668 → 464 ms |    32 → 49 KB |
| `/glossary/morpho`                      |     620 → 404 ms |                          620 → 404 ms |    18 → 33 KB |
| `/vaults/curators/steakhouse-financial` |     608 → 320 ms |                          608 → 384 ms |    63 → 83 KB |

Inlining everything (`Infinity`) measured the same as 40 KB; 40 KB keeps any future large
stylesheet external and cacheable. Notes for the next attempt at this kind of change:

- **Compare with compression.** Without Brotli the inlined CSS added ~110 KB per page and the
  same change measured 0.5 s _slower_ on the emulated network; that is why the proxy compresses.
- **Inlining alone moved the curator page's LCP to 3.8–4.1 s.** Faster first paint now
  happened before the then-deferred `fonts7.css` applied, and the late `@font-face` rules made
  Chrome re-lay out the description paragraph (with bold text), which it reported as a new LCP.
  Inlining the `@font-face` rules (above) removed it. A `data-sveltekit-preload-data="tap"`
  attribute on `<body>` triggered the same effect earlier in the day and was dropped.
- **Merging small JS chunks** with Rollup's `output.experimentalMinChunkSize` breaks the build:
  the option also applies to the server bundle and SvelteKit's post-build analysis fails. The
  ~130 small chunks per page stay; over HTTP/2 they cost little.
- **Not attempted**: `bundleStrategy: 'single'` (inlines every dynamic import, so wallet and
  chart code would run on first load) and a modular ECharts build (ECharts now loads after
  hydration when idle, which took it off the critical path).

## First-paint delay in PageSpeed Insights (open, 2026-11-22)

PageSpeed Insights' unthrottled ("observed") run of a vault page shows a white screen until
about 2.4 s in every run, although the HTML, CSS, fonts and even the chart data have all
loaded by 1.2 s, the `load` event fired at 0.4 s, and the main thread is idle in between. The
filmstrip is blank (not even the dark page background), so nothing is painted at all, not
just text. Real Chrome on macOS paints the same page at 0.4 s (0.6–0.8 s throttled), and real
users' phone FCP p75 is 2.1 s with a 1.1 s TTFB, so this is not what visitors see.

What has been ruled out, from PSI runs on 2026-11-22:

| Page                        | woff2 preloads | Observed DCL | Observed first paint |
| --------------------------- | -------------: | -----------: | -------------------: |
| `/glossary/morpho`          |              3 |       204 ms |               207 ms |
| `/glossary`                 |              0 |       287 ms |               288 ms |
| `/vaults/protocols/lighter` |              0 |       490 ms |               489 ms |
| `/vaults/protocols/morpho`  |              0 |       807 ms |             1,448 ms |
| `/blog`                     |              0 |       361 ms |             1,322 ms |
| `/vaults/rektober`          |              3 |   332–600 ms |       2,327–2,416 ms |

- **Font preloads**: the glossary term page has the same three woff2 preloads and paints
  immediately; `/blog` has none and is delayed.
- **The `local()` fallback faces**: Chromium paints a fallback while a local lookup is
  pending (`local_font_face_source.cc`); `swap` was added anyway (above).

The delay appears on pages that do client-side work after load (the vault price chart, the
Morpho hub chart and table, the blog index), so the next step is a Chrome performance trace
from Linux Chrome — PSI's environment — e.g. `pnpm run perf:probe` inside the
`mcr.microsoft.com/playwright` Docker image with `--cpu 1 --no-network-throttle`, and a real
Android phone over USB remote debugging. Until a trace names the blocker, treat PSI's
vault-page LCP as a lab artefact and judge changes with `perf:probe` and CrUX.

# Analysing the client bundle

- https://www.npmjs.com/package/source-map-explorer

An example:

```shell
pnpm run build
npx source-map-explorer 'build/client/_app/immutable/chunks/*.js'
```

# Page speed tests

Page speed utilities to see First Contentful Paint (FCP) and Largest Contentful Paint (LCP) events.

- https://pagespeed.web.dev
  - Example: https://pagespeed.web.dev/report?url=https%3A%2F%2Ftradingstrategy.ai%2Ftrading-view%2Fbinance%2Fpancakeswap-v2%2Fdgt-bnb
- https://www.webpagetest.org/
  - Example: https://www.webpagetest.org/result/211230_BiDc5M_0b72ec65b0eb6523fddb06496ab832d4/1/details/#waterfall_view_step1

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

# Web fonts and layout shift

The licensed Neue Haas Grotesk faces, Source Serif Pro and Source Code Pro are declared in
`static/fonts/fonts6.css` (the file is renamed whenever its contents change: the woff2 files it
references are served with a one-year `Cache-Control` by `scripts/server.js`, see
`scripts/static-cache-control.js`). Three mechanisms keep them from hurting Core Web Vitals:

1. **Deferred stylesheet.** `src/app.html` loads the stylesheet with the `media="print"` →
   `onload="this.media='all'"` trick, so text paints immediately in the fallback face
   instead of waiting for the font CSS. All faces are `font-display: swap`.
2. **Metric-matched fallbacks.** Every family has a `… Fallback` `@font-face` in
   `src/lib/components/css/font-fallbacks.css` — part of the render-blocking app CSS, so it
   applies from the first paint rather than only once the deferred font stylesheet lands: a
   system font (`Arial`/`Roboto` for the grotesks, `Georgia` for the serif,
   `Courier New` for the mono) with `size-adjust`, `ascent-override`, `descent-override` and
   `line-gap-override` tuned so it occupies the same space as the web font, within the
   tolerance of the platform's actual fallback font (bold text is shown in the regular fallback
   face until the web font lands). The swap therefore barely moves text — before this, the swap alone was a CLS of 0.17–0.25 on
   text-heavy pages. The overrides were computed with `@capsizecss/core` from the metrics
   unpacked out of the woff2 files (Display and Text differ per weight, so their fallbacks
   are declared per weight range); recompute them if a font file changes. The font stacks in
   `src/lib/components/css/typography.css` and `typography-new.css` list the fallback right
   after the web font.
3. **Preload headers.** `src/lib/server/font-preload.ts` adds `Link: rel=preload` headers
   (Cloudflare turns them into 103 Early Hints) for the stylesheet on every HTML page, and
   for the three primary woff2 files on the templates whose LCP element is text.

`tests/integration/layout-shift.test.ts` delays the woff2 responses and asserts the token,
pair and glossary pages stay under a CLS of 0.05 on a phone viewport.

# Analysing the client bundle

- https://www.npmjs.com/package/source-map-explorer

An example:

```shell
pnpm run build
npx source-map-explorer 'build/client/_app/immutable/chunks/*.js'
```

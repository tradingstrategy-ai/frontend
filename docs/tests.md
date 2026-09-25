# Tests

This application includes three test suites:

1. **Unit Tests:** for testing individual components (except `+page` components) and library
   functions / classes in isolation.
2. **Integration Tests:** for testing `+page` components (which require a full browser context and a
   node server); uses a mock API server to provide deterministic test data.
3. **End-to-end Tests:** for smoke-tests to validate the full application stack against live
   production data.

See below to run each suite separately, or run all test suites sequentially with:

```shell
pnpm run test # runs unit, integration (with test build), and e2e (with production build)
pnpm run test:no-build # runs unit + integration only (skips e2e, requires prior test build)
```

## Running Tests

### Unit Tests

Run once:

```shell
pnpm run test:unit --run
```

Watch for file changes:

```shell
pnpm run test:unit
```

#### Options:

Pass additional options to `vitest` after `--` – e.g.,

- `pnpm run test:unit -- Search` to only run tests that match "Search"
- `pnpm run test:unit -- --help` to see additional `vitest` options

See [Unit test frameworks](#unit-test-frameworks) below for additional info.

### Integration tests

```shell
# Build first if source files have changed since last build
pnpm run build --mode=test

# Run all integration tests
pnpm run test:integration
```

#### Options:

- prefix with `CI=1` to run with the CI retry policy (`ciRetries` in `tests/helpers.ts`); no test is skipped in CI
- pass additional options to `playwright` after `--` – e.g.,
  - `pnpm run test:integration -- trading-view` to only run tests that match "trading-view"
  - `pnpm run test:integration -- --help` to see additional `playwright` options

#### This command does the following:

- runs tests in `tests/integration` folder (headlessly) and reports results
- automatically runs `pnpm preview --mode=test` to start a node preview server
- uses mock API data found in `tests/mocks`
- loads `.env.test` for deterministic test configuration

Everything the server fetches during a test must resolve to the mock server: `.env.test` points the
backend, vault, stablecoin-metadata and Ghost blog URLs at `http://127.0.0.1:4173/api/...`, and the
mocks mirror the upstream URL layout under that prefix (e.g. `tests/mocks/ghost/` serves the Ghost
content API for `/blog` and blog posts). A page that reaches an unmocked upstream fails or, worse,
passes against live data. The glossary is the one exception: it is scraped from the documentation
site and still goes to the network.

The strategies page persists its snapshot to disk (`TS_PRIVATE_STRATEGIES_CACHE_DIR`). The test
server uses its own directory (`.cache/strategies-test`, set in `.env.test`) and
`webServerConfig()` empties it before every run, so a snapshot left behind by a dev session with
real data cannot leak into the mocked suite — that was the cause of the strategy listing tests
failing locally while passing in CI.

#### Search-snippet coverage

`tests/integration/head-meta.test.ts` is the contract for what the indexable templates put in their
`<head>` (one sample URL per template) (one canonical, a branded title, a 70–155 character description, one `og:image`);
`tests/integration/response-headers.test.ts` covers the font preload, `X-Robots-Tag` and cache
headers; `tests/integration/layout-shift.test.ts` measures CLS on a phone viewport with the fonts
delayed. See `docs/google-webmasters.md` for the reasoning behind each.

`tests/integration/vaults/social-meta-tags.test.ts` owns the social card itself: the Open Graph and
Twitter tag values, which image URL each vault listing resolves to (sparkline, curator, protocol or
chain logo, or the default card), and that the image decodes at 1200×630 with visible content. It
does not re-check the title, description length or "exactly one `og:image`" that `head-meta` covers.

#### One owner per shared behaviour

Tests for behaviour that a shared component provides live in one file, not in every page that uses
the component:

- the vault listings navigation and its Charts dropdown — order, the 11 chart links, active state on
  every chart page, mobile — is `tests/integration/vaults/charts-dropdown.test.ts`; the chart-page
  files (`yield-*`, `historical-tvl-*`, `cumulative-tvl-apy`, …) assert only their own chart, plus
  the in-page "See charts" link row on the pages that render it;
- the SEO links added in round 4 — "Similar <protocol> vaults", the "<name> APY and returns"
  heading and the "How we rank vaults" methodology link — are
  `tests/integration/vaults/seo-links.test.ts`; hub insights and leader rules are unit-tested in
  `src/lib/top-vaults/listing/insights.test.ts`, because the mock vaults carry no `years` and so
  never qualify as leaders;
- the vault group index header (`protocols`, `stablecoins`, `chains`, `curators`, `funds`) is
  laid out once at three viewports in `group-market-share-pages.test.ts`; each page keeps a single
  render test.

Prefer one `test()` per page _state_ (initial, after an interaction, after a redirect) over one
`test()` per assertion: every `test()` reloads the page, and a `beforeEach` `goto` multiplies that by
the number of tests in the file. Tests that type into a form or open a menu right after `goto` must
call `waitForHydration(page)` from `tests/integration/helpers.ts` first, or the input is wiped and
the click is lost when the component hydrates.

#### Wallet coverage

`tests/integration/wallet/` covers restoring a wallet session that wagmi persisted on a previous
visit, and the deposit wizard's behaviour when that session is slow to come back or never does.
`fixtures.ts` holds the shared strategy, account and balance constants.

Instead of loading a real browser-extension wallet (Rabby, MetaMask) — which needs a persistent
browser profile, an unlock flow and network access, none of which is deterministic in CI — two
small emulations are installed per test:

- `mock-rabby.ts` installs a minimal EIP-1193 provider via `page.addInitScript()` that presents
  itself as Rabby (`window.ethereum` flags plus an EIP-6963 announcement with rdns `io.rabby`, which
  is how wagmi/AppKit discover it) and optionally seeds the persisted `wagmi.store`. It answers like a
  healthy extension (with a configurable delay, since a cold MV3 service worker is slow), switches
  chains on request, can hang (`hang: true`, or `hangMockRabby()` mid-test — persisted across
  reloads), be woken up later (`releaseMockRabby()`), reject network switches like a user
  dismissing the prompt, and announce a second always-healthy wallet for tests that connect a
  different wallet through the AppKit modal.
- `mock-rpc.ts` answers the page's JSON-RPC traffic (`eth_getBalance`, Multicall3 `aggregate3`
  batches, the Enzyme/ERC-20 reads the strategy page and wizard make) from canned values, so
  wallet-connected pages render without a public RPC. Everything else external is aborted. Set
  `MOCK_RPC_DEBUG=1` to log each intercepted request and its answer.

`reconnect.test.ts` checks the strategy page's "My deposits" panel: a hung extension settles to
`disconnected` (so "Connect wallet" is offered) instead of lingering half-connected, a healthy one
restores the session, a declined network switch does not escape as an uncaught rejection, and an
extension that wakes up after the timeout neither resurrects the dropped session (the user
reconnects through the AppKit modal, which the test drives) nor displaces a wallet the user
connected in the meantime, nor undoes an explicit disconnect, nor lingers as a stale connection
behind a session that was restored in time. `wizard.test.ts` checks that a page
refresh on the deposit wizard's balance step keeps the user there while a slow wallet reconnects,
and sends them back to the connect step when the wallet does not come back.

#### Responsive navigation coverage

`tests/integration/navigation.test.ts` covers the shared header at desktop, tablet and narrow-mobile
viewports. It verifies that the first compact-menu tap remains open after hydration, the open mobile
drawer remains within the viewport, that the first tablet search-field focus survives hydration, menu
closure after navigation to Pricing, and equivalent protocol/vault typeahead results.

`tests/integration/mobile-layout.test.ts` verifies that the home page, vault listing, and a representative
vault detail page cannot be horizontally panned at a 375px mobile viewport. It checks document width, body
width, and the actual horizontal scroll offset, while allowing intentionally scrollable elements such as the
vault table. It also verifies that the two home-hero actions share the same width and that all three
hero differentiators remain on one line at that viewport.

#### Local secrets and `.env.local`

For normal development, keep checked-in defaults in `.env` and place local-only secrets in
`.env.local`. Vite/SvelteKit loads `.env.local` automatically and it overrides `.env`.

In git worktrees, `.env.local` is not copied from the main checkout. Symlink or copy it before
running private-data tests or local dev servers; see [worktree setup](../.claude/docs/worktree.md).

The regular integration suite intentionally stays deterministic and uses `.env.test` plus mock
APIs. This means secret-backed features should not be added to the default `pnpm run test:integration`
flow unless they can be mocked reliably.

For checks that should use your local private secrets, use the dedicated private Playwright config:

```shell
pnpm exec playwright test --config tests/integration/private.playwright.config.ts
```

This private harness overlays the relevant private values from `.env.local` on top of the normal
test-mode configuration. Tests in this harness should skip when the required secrets are absent.

See [Integration and e2e test frameworks](#integration-and-e2e-test-frameworks) below for additional info.

#### Test build isolation

Test builds (`--mode=test`) use separate output directories so they don't interfere with the dev server:

- **SvelteKit output:** `.svelte-kit-test/` instead of `.svelte-kit/`
- **Vite cache:** `node_modules/.vite-test/` instead of `node_modules/.vite/`

This is configured in `vite.config.ts` (sets `cacheDir` and an env var) and `svelte.config.js` (reads the env var to set `outDir`). The env var `__SVELTEKIT_TEST_MODE` is used instead of `process.argv` because SvelteKit's postbuild analysis runs in a Worker thread that inherits `process.env` but not `process.argv`.

You can safely run the dev server and test builds concurrently without cache corruption.

### Manual remote previews over Tailscale

For manual browser checks from another machine, use the Vite dev server rather than Vite preview:

If the dev server runs from a git worktree, first make sure `.env.local` and the `data/` cache are
available in that worktree; see [worktree setup](../.claude/docs/worktree.md).

```shell
pnpm run dev --host 0.0.0.0
```

Then share a URL using the numeric Tailscale IPv4 address with the route being reviewed.
Do not use the Tailscale DNS name (`*.ts.net`), because local DNS resolution can conflict
with the viewer's network:

```shell
tailscale ip -4
```

Example:

```text
http://100.x.y.z:5173/vaults/stablecoins/frax
```

The Vite config allows `.ts.net` hosts so agent-hosted remote dev previews work without disabling host validation globally.

### End-to-end tests

E2e tests are smoke tests that run against the **live production API**. They require a **production
build** (not a test build), because the preview server runs with `--mode=production` and expects the
output in `.svelte-kit/` (the default output directory).

```shell
# Production build is required (not build:test)
pnpm run build

# Run all e2e tests
pnpm run test:e2e
```

#### Options:

- see `test:integration` options above (supports the same options)

#### This command does the following:

- runs tests in `tests/e2e` folder (headlessly) and reports results
- automatically runs `pnpm preview --mode=production` to start a node preview server
- uses real production backend API (not mock data)

#### CI setup

E2e tests run in a **separate CI job** (`test-e2e`) from unit/integration tests because they need a
different build:

- **Unit + integration** (`test` job): uses `pnpm run build:test` (test mode, output in `.svelte-kit-test/`)
- **E2e** (`test-e2e` job): uses `pnpm run build` (production mode, output in `.svelte-kit/`)

The `test:no-build` script only runs unit and integration tests. E2e tests are not included because
they require the production build.

See [Integration and e2e test frameworks](#integration-and-e2e-test-frameworks) below for additional info.

## Test Frameworks

### Unit test frameworks

- [Vitest](https://vitest.dev/) – overall testing framework; see
  [guide](https://vitest.dev/guide/), [API](https://vitest.dev/api/) and
  [config](https://vitest.dev/config/) docs for additional info.
- [Testing Library](https://testing-library.com/) – provides interface for inspecting and
  interacting with the DOM, using the
  [Svelte Testing Library](https://github.com/testing-library/svelte-testing-library) adapter.
- [jest-dom](https://github.com/testing-library/jest-dom) – extends Jest with DOM-specific matchers.

### Integration and e2e test frameworks

- [Playwright](https://playwright.dev/) – overall testing framework; see
  [docs](https://playwright.dev/docs/intro) and
  [API](https://playwright.dev/docs/api/class-playwright) reference for additional info.
- [vite-plugin-mock-dev-server](https://github.com/pengzhanbo/vite-plugin-mock-dev-server)
  – used when running `integration` tests to serve mock API data found in `tests/mocks`.

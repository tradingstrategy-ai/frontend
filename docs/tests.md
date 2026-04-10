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

- prefix with `CI=1` to skip some flaky tests that we skip in CI
- pass additional options to `playwright` after `--` – e.g.,
  - `pnpm run test:integration -- trading-view` to only run tests that match "trading-view"
  - `pnpm run test:integration -- --help` to see additional `playwright` options

#### This command does the following:

- runs tests in `tests/integration` folder (headlessly) and reports results
- automatically runs `pnpm preview --mode=test` to start a node preview server
- uses mock API data found in `tests/mocks`
- loads `.env.test` for deterministic test configuration

#### Local secrets and `.env.local`

For normal development, keep checked-in defaults in `.env` and place local-only secrets in
`.env.local`. Vite/SvelteKit loads `.env.local` automatically and it overrides `.env`.

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

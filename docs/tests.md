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
npm run test # use --skip-build flag to save time if you have already run `npm build`
```

## Running Tests

### Unit Tests

Run once:

```shell
npm run test:unit
```

Watch for file changes:

```shell
npm run test:unit:watch
```

#### Options:

Pass additional options to `vitest` after `--` – e.g.,

- `npm run test:unit -- Blog` to only run tests that match "Blog"
- `npm run test:unit -- --help` to see additional `vitest` options

See [Unit test frameworks](#unit-test-frameworks) below for additional info.

### Integration tests

```shell
npm run test:integration
```

#### Options:

- use `--skip-build` flag if you already have a current build (saves significant time)
- pass additional options to `playwright` after `--` – e.g.,
  - `npm run test:integration -- trading-view` to only run tests that match "trading-view"
  - `npm run test:integration -- --help` to see additional `playwright` options

#### This command does the following:

- runs tests in `tests/integration` folder (headlessly) and reports results
- automatically runs `npm build` and starts a node preview server with `npm preview`
- uses mock API data found in `tests/fixtures`

See [Integration and e2e test frameworks](#integration-and-e2e-test-frameworks) below for additional info.

### End-to-end tests

```shell
npm run test:e2e
```

#### Options:

- see `test:integration` options above (supports the same options)

#### This command does the following:

- runs tests in `tests/e2e` folder (headlessly) and reports results
- automatically runs `npm build` and starts a node preview server with `npm preview`
- uses real production backend API

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
- [vite-plugin-simple-json-server](https://github.com/alextim/vite-plugin-simple-json-server/tree/main/packages/vite-plugin-simple-json-server)
  – used when running `integration` tests to serving mock API data found in `tests/fixtures`.

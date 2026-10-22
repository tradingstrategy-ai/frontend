# Dependencies

This document lists key dependencies used in the Trading Strategy frontend application.

## Frontend libraries

| Package                   | Purpose                    |
| ------------------------- | -------------------------- |
| `lightweight-charts`      | Financial charting         |
| `@reown/appkit` + `wagmi` | Web3 wallet connectivity   |
| `viem`                    | Ethereum utilities         |
| `zod`                     | Schema validation          |
| `date-fns`                | Date manipulation          |
| `d3-array`, `d3-time`     | Data utilities for charts  |
| `echarts`                 | ECharts browser runtime    |
| `svelte-headless-table`   | Table component foundation |
| `micromark`               | Markdown parsing           |

## Backend integration

| Service                      | Purpose                          |
| ---------------------------- | -------------------------------- |
| Ghost CMS                    | Blog content                     |
| Trading Strategy backend API | Core data and trading operations |

## Build and dev tools

| Package                       | Purpose                                      |
| ----------------------------- | -------------------------------------------- |
| `unplugin-icons`              | Icon management with custom local collection |
| `@sveltejs/enhanced-img`      | Optimised image handling                     |
| `@sentry/sveltekit`           | Error tracking                               |
| `@opentelemetry/*`            | Optional SigNoz APM trace/log export         |
| `vite-plugin-mock-dev-server` | Integration test mocking                     |
| `@playwright/test`            | Integration and e2e testing                  |
| `vitest`                      | Unit testing                                 |

## Dependency management notes

- `devDependencies` are bundled by adapter-node
- `dependencies` must be installed in production environment
- Use pnpm (not npm or yarn)

## Runtime

- Node.js **24 LTS**, pinned to a full patch version in four places that must move together:
  `.nvmrc`, `package.json` `engines.node`, `Dockerfile` (both stages) and
  `.github/workflows/javascript.yml` (all `setup-node` steps).
- Upgraded from Node 20 in October 2026 after the Node.js security release (Brotli decoder
  CVE-2026-111497 and TLS hostname-verification bypasses); Node 20 was end-of-life and received
  no fix. Server-side `fetch` auto-decompresses Brotli responses, so the runtime patch is the
  only protection for fetched upstream content.
- Node 26 is blocked until `dd-trace` supports it (`engines.node >=18 <26` as of 5.87).

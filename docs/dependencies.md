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
| `svelte-headless-table`   | Table component foundation |
| `micromark`               | Markdown parsing           |

## Backend integration

| Service                      | Purpose                          |
| ---------------------------- | -------------------------------- |
| Ghost CMS                    | Blog content                     |
| Typesense                    | Search functionality             |
| Trading Strategy backend API | Core data and trading operations |

## Build and dev tools

| Package                       | Purpose                                      |
| ----------------------------- | -------------------------------------------- |
| `unplugin-icons`              | Icon management with custom local collection |
| `@sveltejs/enhanced-img`      | Optimised image handling                     |
| `@sentry/sveltekit`           | Error tracking                               |
| `vite-plugin-mock-dev-server` | Integration test mocking                     |
| `@playwright/test`            | Integration and e2e testing                  |
| `vitest`                      | Unit testing                                 |

## Dependency management notes

- `devDependencies` are bundled by adapter-node
- `dependencies` must be installed in production environment
- Use pnpm (not npm or yarn)

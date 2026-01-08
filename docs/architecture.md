# Architecture

This document describes the architecture and key patterns used in the Trading Strategy frontend application.

## Technology stack

- **Framework:** SvelteKit 2.x with Svelte 5.x (using runes and async components)
- **Language:** TypeScript with strict mode enabled
- **Styling:** PostCSS with preset-env, custom breakpoints, and dark theme support
- **Build tool:** Vite 7.x with custom plugins
- **Deployment:** Node adapter with `FRONTEND_` env prefix
- **Error tracking:** Sentry integration (client and server)

## Svelte 5 features

This project uses Svelte 5 with experimental features enabled in `svelte.config.js`:
- `async: true` - allows async components and top-level await
- `remoteFunctions: true` - enables remote function calls feature

## Directory structure

### Source code

- `src/routes/` - SvelteKit file-based routing (pages, layouts, API endpoints)
- `src/lib/` - Reusable library code, organised by feature/domain:
  - `components/` - Reusable UI components (Alert, Button, Dialog, DataBox, etc.)
  - `trade-executor/` - Trading strategy execution models and schemas
  - `charts/` - Chart components and utilities
  - `wallet/` - Web3 wallet integration
  - `helpers/` - Utility functions (formatters, date, financial calculations, etc.)
  - `schemas/` - Zod validation schemas
  - `explorer/` - Market data exploration features
  - `search/` - Search functionality
  - `blog/` - Blog/Ghost CMS integration
  - Other feature-specific directories (wizard, breadcrumb, header, etc.)
- `src/params/` - SvelteKit parameter matchers for routes
- `src/hooks.{server,client}.ts` - SvelteKit lifecycle hooks
- `src/app.html` - HTML shell template

### Configuration

- `svelte.config.js` - SvelteKit configuration with adapter-node, aliases, CSP
- `vite.config.ts` - Vite configuration with plugins (Sentry, icons, enhanced images)
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration (flat config format)
- `postcss.config.js` - PostCSS with global breakpoints and dark theme class

### Tests

- `tests/integration/` - Integration tests using Playwright with mock API data
- `tests/e2e/` - End-to-end tests using Playwright with production API
- `tests/fixtures/` - Mock API data for integration tests
- `*.test.ts` / `*.spec.ts` - Unit tests using Vitest (co-located with source)

## Key patterns

### Environment configuration

- Environment variables use `TS_PUBLIC_` prefix for client-accessible values
- Private server-only variables use `TS_PRIVATE_` prefix
- Configuration loaded and validated in `src/lib/config.ts`
- Runtime configuration via JSON env vars (strategies, RPC URLs, ToS contracts, etc.)

### Path aliases

- `$lib` - resolves to `src/lib` (SvelteKit default)
- `design-system-fonts` - resolves to `deps/fonts` (optional submodule)
- `trade-executor` - resolves to `src/lib/trade-executor`

### Routing patterns

- Dynamic routes use SvelteKit conventions: `[slug]`, `[chain=slug]`
- Layout hierarchy with `+layout.svelte` and `+layout.ts`
- Server-side data loading via `+page.server.ts` and `+layout.server.ts`
- API endpoints via `+server.ts` files

### Data fetching

- Backend API communication via configured `backendUrl`
- Server-side fetch uses `backendInternalUrl` when available (internal network optimisation)
- SWR-style caching utilities in `src/lib/swrCache.ts`

### Theming

- Dark/light mode via `data-color-mode` attribute on `<html>` tag
- Controlled by PostCSS dark-theme-class plugin
- Server-side rendering prevents FOUC (Flash of Unstyled Content)
- Colour mode stored in `ts-color-mode` cookie

### Server hooks (hooks.server.ts)

- Sentry error tracking integration
- Colour mode resolution (cookie-based)
- Lightweight admin authentication via password
- Announcement dismissal tracking
- IP country detection via Cloudflare headers

### Icons

- Managed via unplugin-icons with custom local icon collection
- Local icons in `src/lib/assets/icons/`
- Automatic class and style injection for sizing and colouring

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

SvelteKit-based frontend for the Trading Strategy protocol, featuring automated trading strategies, market data exploration, and DeFi vault management. Uses Svelte 5 with runes and async components, TypeScript strict mode, and PostCSS for styling.

## Language conventions

- Use UK/British English: `visualise` not `visualize`, `colour` not `color`
- For headings, only capitalise the first letter (not title case)

## Common commands

```shell
pnpm run dev              # Start development server
pnpm run build            # Build for production
pnpm run check            # Run Svelte type checking
pnpm run format           # Format code with Prettier
pnpm run lint             # Run ESLint and Prettier checks
pnpm run test:unit --run  # Run unit tests once
pnpm run test:integration # Run integration tests (requires build)
```

## Path aliases

- `$lib` - resolves to `src/lib`
- `trade-executor` - resolves to `src/lib/trade-executor`

## Key conventions

**Svelte 5:**

- Use runes (`$state`, `$derived`, `$effect`, etc.)
- Async components supported (can use `await` in markup)
- Update legacy Svelte 4 syntax to runes when modifying components
- Run `pnpm run check` on modified files before committing (e.g., `pnpm run check src/lib/components/MyComponent.svelte`)

**TypeScript:**

- Strict mode enabled
- Schemas defined with Zod in `src/lib/schemas/` and `trade-executor/schemas/`

**Environment variables:**

- `TS_PUBLIC_` prefix for client-accessible values
- `TS_PRIVATE_` prefix for server-only values

**Formatting:**

- Prettier for all code formatting
- Run `pnpm run format` before committing

## Inline documentation

Svelte components should include a JSDoc comment at the beginning:

````svelte
<!--
@component
Brief description of the component.

- Markdown supported
- Include usage notes

@example

```svelte
  <MyComponent prop="value" />
```
-->
<script lang="ts">
	// ...
</script>
````

Page components should have a basic HTML comment:

```svelte
<!--
Brief page summary
-->
```

Functions should include multiline JSDoc comments with `@param` tags when warranted.

## Testing

- **Unit tests:** Components (except `+page`) and utilities - use Vitest
- **Integration tests:** `+page` components with mock API - use Playwright
- **E2E tests:** Smoke tests against production API - use Playwright

See `docs/tests.md` for detailed testing documentation.

## Additional documentation

For detailed information on specific topics, see:

- `docs/architecture.md` - Directory structure, patterns, theming, data fetching
- `docs/dependencies.md` - Frontend libraries, backend integrations, build tools
- `docs/security.md` - CSP, geographic blocking, authentication, CAPTCHA
- `docs/tests.md` - Test suites, frameworks, running tests

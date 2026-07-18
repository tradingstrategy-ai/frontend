# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

SvelteKit-based frontend for the Trading Strategy protocol, featuring automated trading strategies, market data exploration, and DeFi vault management. Uses Svelte 5 with runes and async components, TypeScript strict mode, and PostCSS for styling.

## Reference docs for Claude

Topic deep-dives live under `.claude/docs/`. Consult the relevant one before
working on that area:

| Doc                                                | Description                                                                                                |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `.claude/docs/agent-tricks-and-troubleshooting.md` | **MANDATORY read before ANY Claude CLI or Codex CLI invocation** (reviews, sanity checks, or one-off runs) |
| `.claude/docs/worktree.md`                         | Required local env and data symlinks when running dev servers or private-data checks from git worktrees    |

## Agent review workflows

- **BLOCKING REQUIREMENT: before running ANY `codex` / `codex exec` or `claude` CLI command — reviews, sanity checks, or one-off runs — you MUST first read `.claude/docs/agent-tricks-and-troubleshooting.md`.** Do not invoke either CLI until you have read it in the current session. This is not optional and applies even when the call "looks trivial".
- Follow its recommended invocation patterns for plan reviews, code reviews, PR reviews, tool restrictions, timeouts, and handling silent or hanging agent runs. Review requests must allow at least 15 minutes before being treated as timed out.
- Always run non-interactive Codex reviews in **streaming mode** (`codex exec --json`) written to a raw file — never plain text mode piped through `tail`/`head`, which buffers output until completion and makes the run look hung.
- `codex exec` selects the sandbox directly (`--sandbox read-only` for reviews) and does **not** accept `--ask-for-approval` (that flag is interactive-only).
- Do not fall back to generic `claude --help`, plugin docs, or ad-hoc CLI flags until the local troubleshooting doc has been checked.

## Language conventions

- Use UK/British English: `visualise` not `visualize`, `colour` not `color`
- For headings, only capitalise the first letter (not title case)

## Design, art and graphics

See `docs/theme.md`.

## Common commands

```shell
pnpm run dev              # Start development server
pnpm run build            # Build for production
pnpm run preview          # Serve a production build — for verifying the build only, NOT for development
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
- For Svelte UI changes, check that tooltips remain readable and are not too wide.
- Run `pnpm run check` on modified files before committing (e.g., `pnpm run check src/lib/components/MyComponent.svelte`)

**TypeScript:**

- Strict mode enabled
- Schemas defined with Zod in `src/lib/schemas/` and `trade-executor/schemas/`

**Environment variables:**

- `TS_PUBLIC_` prefix for client-accessible values
- `TS_PRIVATE_` prefix for server-only values
- In git worktrees, copy or symlink ignored local files such as `.env.local` and `data/` from the main checkout before running dev servers; see `.claude/docs/worktree.md`.

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

## Browser automation

Prefer Playwright for browser-based validation in this repo when it is sufficient for the task.

Use it for:

- opening the local app
- taking screenshots
- checking rendered content
- reproducing layout and interaction issues

Always develop and verify against the Vite dev server started with `pnpm run dev` (typical local target `http://127.0.0.1:5173/`). Do **not** use `pnpm run preview` (Vite preview) for development or verification: its preview server runs its own prerender/manifest step that can resolve routes differently from both dev and the production adapter-node server (e.g. newly added routes may 404 under preview while working everywhere else). `pnpm run preview` is only for sanity-checking a production build. Integration tests (`pnpm run test:integration`) intentionally run against a build via the test harness; that is separate from manual development.

When using a git worktree, follow `.claude/docs/worktree.md` before starting the dev server so private env vars and cached vault datasets are available in that worktree.

```text
http://127.0.0.1:5173/
```

### Tailscale dev server previews

When a user needs to preview an agent-hosted dev server from their own browser, expose the Vite dev server over Tailscale:

```shell
pnpm run dev --host 0.0.0.0
```

Find the Tailscale URL:

```shell
tailscale ip -4
tailscale status --json | jq -r '.Self.DNSName'
```

Share the `*.ts.net` URL with the route being tested, for example:

```text
http://brian.tail71b97.ts.net:5173/trading-view/vaults/stablecoins/frax
```

If the DNS name is unavailable, share the Tailscale IP fallback:

```text
http://100.x.y.z:5173/trading-view/vaults/stablecoins/frax
```

`vite.config.ts` allows `.ts.net` in `server.allowedHosts` and `preview.allowedHosts` so remote agent previews are not blocked by Vite host validation. Keep this allowlist scoped to Tailscale hostnames; do not set `allowedHosts: true`.

Use Chrome remote debugging MCP only when you specifically need to attach to an already running Chrome session, inspect the live DevTools state, or reuse a signed-in/manual browser context.

## Chrome remote debugging MCP

Does not work properly yet.

## Additional documentation

For detailed information on specific topics, see:

- `docs/architecture.md` - Directory structure, patterns, theming, data fetching
- `docs/chart-pages.md` - Chart page routes, data flow, charting libraries, chart types, navigation
- `docs/dependencies.md` - Frontend libraries, backend integrations, build tools
- `docs/security.md` - CSP, geographic blocking, authentication, CAPTCHA
- `docs/tests.md` - Test suites, frameworks, running tests
- `docs/vault-data-source.md` - Vault data sources, R2 bucket config, known inconsistencies

## Pull requests

- Pull request description must have sections Why (the rational of change), Lessons learnt (memory for future agents) and Summary (what was changed). No test plan or verification section.
- Only push changes to remote when asked, never update pull requess automatically.
- Never push directly to a master if not told explicitly
- If the user ask to open a pull request as feature then start the PR title with "feat:" prefix and also add one line about the feature into `CHANGELOG.md`
- Each changelog entry should follow the date of the PR in YYYY-MM-DD format. Example: Something was updated (2026-01-01).
- Before opening or updating a pull request, format the code
- When merging pull request, squash and merge commits and use the PR description as the commit message
- If continuous integration (CI) tests fail on your PR, and they are marked flaky, run tests locally to repeat the issue if it is real flakiness or regression

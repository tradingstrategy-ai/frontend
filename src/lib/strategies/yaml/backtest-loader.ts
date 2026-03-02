/**
 * Load backtest HTML report files from `strategies/backtests/` at build time.
 *
 * Mirrors the YAML loader pattern: Vite glob imports with `?raw` provide the
 * raw HTML string keyed by file path. The slug is extracted from the filename
 * (e.g., `strategies/backtests/ichi-hyperliquid.html` → `ichi-hyperliquid`).
 */

const htmlFiles =
	import.meta.env.MODE === 'test'
		? import.meta.glob('/tests/strategies/backtests/*.html', { eager: true, query: '?raw', import: 'default' })
		: import.meta.glob('/strategies/backtests/*.html', { eager: true, query: '?raw', import: 'default' });

export const backtestHtml: Map<string, string> = new Map();

for (const [path, raw] of Object.entries(htmlFiles)) {
	const match = path.match(/\/([^/]+)\.html$/);
	if (match) {
		backtestHtml.set(match[1], raw as string);
	}
}

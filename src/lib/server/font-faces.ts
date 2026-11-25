/**
 * The web font `@font-face` rules, inlined into every page's `<head>` (the `%ts:font-faces%`
 * placeholder in `src/app.html`, filled in by `hooks.server.ts`).
 *
 * They used to come from `/fonts/fonts7.css` loaded non-blocking (`media="print"` swapped
 * to `all` on load). When the page painted before that stylesheet applied — more and more
 * often as first paint got faster — the late `@font-face` rules made Chrome lay the text
 * out again, and that repaint was reported as a new, later LCP (curator pages: 0.4 s → 3.8 s
 * in the 2026-11-22 lab runs; see docs/speed.md). Inline, the rules exist from the first
 * paint, cost no request, and add ~0.5 KB of compressed HTML.
 *
 * `static/fonts/fonts7.css` stays the single source (`scripts/setup-fonts.sh` reads it);
 * its relative `url("./…")` paths are rewritten to `/fonts/…` here.
 */
import fontFacesCss from '../../../static/fonts/fonts7.css?raw';

/**
 * Turn the font stylesheet into an inline `<style>` element: strip comments and whitespace,
 * and make the `url("./…")` paths absolute.
 *
 * @param css contents of `static/fonts/fonts7.css`
 */
export function buildInlineFontFacesStyle(css: string): string {
	const minified = css
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/url\("\.\//g, 'url("/fonts/')
		.replace(/\s+/g, ' ')
		.replace(/\s*([{};:,])\s*/g, '$1')
		.trim();
	return `<style id="font-faces">${minified}</style>`;
}

/** `<style>` element with every `@font-face` rule of the site's web fonts. */
export const inlineFontFacesStyle = buildInlineFontFacesStyle(fontFacesCss);

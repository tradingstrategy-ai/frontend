import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildInlineFontFacesStyle } from './font-faces';

// Vitest stubs CSS imports (even `?raw`), so read the real stylesheet here.
const style = buildInlineFontFacesStyle(readFileSync('static/fonts/fonts7.css', 'utf8'));

describe('buildInlineFontFacesStyle', () => {
	it('inlines every @font-face rule with absolute font URLs and no comments', () => {
		expect(style).toMatch(/^<style id="font-faces">@font-face\{.*\}<\/style>$/);
		expect(style).toContain('url("/fonts/NeueHaasGroteskText/55.woff2")');
		expect(style).not.toContain('url("./');
		expect(style).not.toContain('/*');
	});

	it('keeps every face optional so a late font is never swapped in', () => {
		const faces = style.match(/@font-face\{[^}]*\}/g) ?? [];
		expect(faces.length).toBeGreaterThan(10);
		for (const face of faces) expect(face).toContain('font-display:optional');
	});
});

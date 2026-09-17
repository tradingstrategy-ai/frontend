import { describe, expect, it } from 'vitest';
import { getStaticCacheControl } from './static-cache-control.js';

describe('getStaticCacheControl', () => {
	it('caches font files for a year', () => {
		expect(getStaticCacheControl('/fonts/NeueHaasGroteskText/55.woff2')).toBe('public, max-age=31536000, immutable');
		expect(getStaticCacheControl('/fonts/SourceCodePro/latin-normal.woff2')).toContain('immutable');
	});

	it('keeps the (renamed-on-change) font stylesheet short-lived', () => {
		expect(getStaticCacheControl('/fonts/fonts6.css')).toBe('public, max-age=86400');
	});

	it('caches avatars for a day with stale-while-revalidate', () => {
		expect(getStaticCacheControl('/avatars/hyper-ai.webp')).toBe(
			'public, max-age=86400, stale-while-revalidate=604800'
		);
	});

	it('leaves everything else to the handler', () => {
		for (const path of ['/', '/vaults', '/robots.txt', '/_app/immutable/chunks/x.js', '/social-card/vault/1']) {
			expect(getStaticCacheControl(path)).toBeUndefined();
		}
	});
});

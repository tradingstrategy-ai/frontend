import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/config', () => ({
	ghostConfig: { contentApiKey: 'test-key', apiUrl: 'https://ghost.test' }
}));

import { getBlogImageSrcSet, getBlogImageUrl } from './images';

describe('getBlogImageUrl', () => {
	it('proxies images served from the Ghost API host', () => {
		expect(getBlogImageUrl('https://ghost.test/content/images/2026/09/cover.png', { width: 380, format: 'webp' })).toBe(
			'/blog/image/content/images/2026/09/cover.png?w=380&format=webp'
		);
	});

	it('proxies images served from the Ghost storage CDN', () => {
		expect(
			getBlogImageUrl(
				'https://storage.ghost.io/c/c6/d9/c6d9ffb5-c9c2-4127-9dd5-12f60693d847/content/images/2026/09/cover.png',
				{
					width: 380,
					height: 380,
					quality: 42,
					format: 'webp'
				}
			)
		).toBe('/blog/image/content/images/2026/09/cover.png?w=380&h=380&q=42&format=webp');
	});

	it('proxies resized storage CDN variants under content/images/size', () => {
		expect(getBlogImageUrl('https://storage.ghost.io/c/ab/cd/site/content/images/size/w600/2026/09/cover.png')).toBe(
			'/blog/image/content/images/size/w600/2026/09/cover.png'
		);
	});

	it('returns unrelated hosts unchanged', () => {
		expect(getBlogImageUrl('https://example.com/content/images/cover.png', { width: 380 })).toBe(
			'https://example.com/content/images/cover.png'
		);
	});

	it('returns storage CDN URLs outside content/images unchanged', () => {
		expect(getBlogImageUrl('https://storage.ghost.io/c/ab/cd/site/other/cover.png')).toBe(
			'https://storage.ghost.io/c/ab/cd/site/other/cover.png'
		);
	});

	it('returns non-URL strings unchanged', () => {
		expect(getBlogImageUrl('not a url')).toBe('not a url');
	});

	it('serialises Date versions as ISO strings', () => {
		expect(
			getBlogImageUrl('https://ghost.test/content/images/cover.png', { version: new Date('2026-09-16T00:00:00Z') })
		).toBe('/blog/image/content/images/cover.png?v=2026-09-16T00%3A00%3A00.000Z');
	});
});

describe('getBlogImageSrcSet', () => {
	it('builds 1x and 2x WebP candidates for a crop box', () => {
		expect(
			getBlogImageSrcSet('https://ghost.test/content/images/cover.png', { width: 380, height: 380, quality: 42 })
		).toEqual({
			src: '/blog/image/content/images/cover.png?w=380&h=380&q=42&format=webp',
			srcset:
				'/blog/image/content/images/cover.png?w=380&h=380&q=42&format=webp 380w, /blog/image/content/images/cover.png?w=760&h=760&q=42&format=webp 760w'
		});
	});
});

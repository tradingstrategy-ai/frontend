import { describe, expect, test, vi } from 'vitest';

// client.ts reads Ghost credentials at module load; provide dummy values so the
// module can be imported in the unit-test environment. getAllPosts/getPosts hit
// the local proxy endpoint and never touch these directly.
vi.mock('$lib/config', () => ({
	ghostConfig: { contentApiKey: 'test-key', apiUrl: 'https://ghost.test' }
}));

import { getAllPosts } from './client';
import type { BlogPostIndexItem } from './schemas';

/**
 * Build a single valid blog post index item for the given index.
 */
function makePost(index: number): BlogPostIndexItem {
	return {
		id: `id-${index}`,
		slug: `post-${index}`,
		title: `Post ${index}`,
		feature_image: `https://example.com/image-${index}.png`,
		feature_image_alt: null,
		created_at: '2026-01-01T00:00:00.000Z',
		updated_at: '2026-01-02T00:00:00.000Z',
		published_at: '2026-01-01T12:00:00.000Z',
		excerpt: `Excerpt ${index}`
	};
}

/**
 * Create a mock proxy `fetch` that serves `total` posts, paginating in blocks of
 * 100 exactly like Ghost's Content API (which caps a single response at 100).
 */
function makePaginatedFetch(total: number) {
	const pageSize = 100;
	const pages = Math.max(1, Math.ceil(total / pageSize));

	return vi.fn(async (input: RequestInfo | URL) => {
		const url = new URL(String(input), 'http://localhost');
		const page = Number(url.searchParams.get('page') ?? '1');

		const start = (page - 1) * pageSize;
		const posts = Array.from({ length: Math.min(pageSize, total - start) }, (_, i) => makePost(start + i));

		const body = {
			posts,
			meta: {
				pagination: {
					page,
					limit: pageSize,
					pages,
					total,
					next: page < pages ? page + 1 : null,
					prev: page > 1 ? page - 1 : null
				}
			}
		};

		return new Response(JSON.stringify(body), { status: 200 });
	}) as unknown as Fetch;
}

describe('getAllPosts', () => {
	test('returns all posts across multiple pages (more than 100)', async () => {
		const fetch = makePaginatedFetch(250);

		const posts = await getAllPosts(fetch);

		// all 250 posts are returned, not just the first 100-post page
		expect(posts).toHaveLength(250);
		expect(posts.length).toBeGreaterThan(100);

		// three pages fetched: 100 + 100 + 50
		expect(fetch as ReturnType<typeof vi.fn>).toHaveBeenCalledTimes(3);

		// slugs are unique and span the full range
		expect(new Set(posts.map((p) => p.slug)).size).toBe(250);
		expect(posts.at(0)?.slug).toBe('post-0');
		expect(posts.at(-1)?.slug).toBe('post-249');
	});

	test('requests the maximum page size of 100', async () => {
		const fetch = makePaginatedFetch(150);

		await getAllPosts(fetch);

		const firstUrl = new URL(String((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]), 'http://localhost');
		expect(firstUrl.searchParams.get('limit')).toBe('100');
		expect(firstUrl.searchParams.get('page')).toBe('1');
	});

	test('handles a single page of fewer than 100 posts', async () => {
		const fetch = makePaginatedFetch(12);

		const posts = await getAllPosts(fetch);

		expect(posts).toHaveLength(12);
		expect(fetch as ReturnType<typeof vi.fn>).toHaveBeenCalledTimes(1);
	});
});

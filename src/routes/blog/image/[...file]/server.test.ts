import sharp from 'sharp';
import { describe, expect, test, vi } from 'vitest';

vi.mock('$lib/config', () => ({
	ghostConfig: { contentApiKey: 'test-key', apiUrl: 'https://ghost.test' }
}));

import { GET } from './+server';

/** Build a tiny PNG so the transform pipeline runs against real image bytes. */
async function pngFixture(width: number, height: number) {
	return sharp({
		create: { width, height, channels: 3, background: { r: 200, g: 30, b: 30 } }
	})
		.png()
		.toBuffer();
}

function imageResponse(body: Buffer, contentType = 'image/png') {
	return new Response(new Uint8Array(body), { status: 200, headers: { 'content-type': contentType } });
}

describe('blog image proxy', () => {
	test('resizes and re-encodes a Ghost content image as WebP', async () => {
		const source = await pngFixture(400, 300);
		const fetch = vi.fn().mockResolvedValue(imageResponse(source));

		const response = await GET({
			fetch,
			params: { file: 'content/images/2026/09/cover.png' },
			url: new URL('http://localhost/blog/image/content/images/2026/09/cover.png?w=100&h=100&format=webp&v=1')
		} as never);

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('image/webp');
		expect(response.headers.get('cache-control')).toContain('immutable');

		// the proxy fetches the /content/ path through the Ghost API host; the API host
		// redirects to storage.ghost.io and fetch follows that redirect transparently
		const fetchedUrl = fetch.mock.calls[0][0] as URL;
		expect(fetchedUrl.href).toBe('https://ghost.test/content/images/2026/09/cover.png');

		const output = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
		expect(output.format).toBe('webp');
		expect(output.width).toBe(100);
		expect(output.height).toBe(100);
	});

	test('does not enlarge images smaller than the requested crop', async () => {
		const source = await pngFixture(50, 50);
		const fetch = vi.fn().mockResolvedValue(imageResponse(source));

		const response = await GET({
			fetch,
			params: { file: 'content/images/small.png' },
			url: new URL('http://localhost/blog/image/content/images/small.png?w=100&h=100&format=webp')
		} as never);

		const output = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
		expect(output.width).toBe(50);
		expect(output.height).toBe(50);
	});

	test('rejects paths that escape the Ghost content origin', async () => {
		const fetch = vi.fn();

		await expect(
			GET({
				fetch,
				params: { file: 'https://evil.example/x.png' },
				url: new URL('http://localhost/blog/image/https://evil.example/x.png')
			} as never)
		).rejects.toMatchObject({ status: 400 });

		expect(fetch).not.toHaveBeenCalled();
	});
});

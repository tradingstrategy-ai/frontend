import sharp from 'sharp';
import { describe, expect, test, vi } from 'vitest';

vi.mock('$lib/config', () => ({
	vaultProtocolMetadataUrl: 'https://metadata.test/protocols',
	stablecoinMetadataUrl: 'https://metadata.test/stablecoins'
}));

import { GET } from './+server';

async function pngFixture(width: number, height: number) {
	return sharp({ create: { width, height, channels: 3, background: { r: 20, g: 120, b: 200 } } })
		.png()
		.toBuffer();
}

function imageResponse(body: Buffer) {
	return new Response(new Uint8Array(body), { status: 200, headers: { 'content-type': 'image/png' } });
}

function call(query: string, source: Buffer) {
	const fetch = vi.fn().mockResolvedValue(imageResponse(source));
	return GET({
		fetch,
		params: { kind: 'protocol', slug: 'lagoon-finance' },
		url: new URL(`http://localhost/metadata-logo/protocol/lagoon-finance${query}`)
	} as never);
}

describe('metadata logo proxy route', () => {
	test('caps re-encoded logos at the default bounding box when no size is requested', async () => {
		const response = await call('?format=webp', await pngFixture(1600, 800));
		const meta = await sharp(Buffer.from(await response.arrayBuffer())).metadata();

		expect(response.headers.get('content-type')).toBe('image/webp');
		expect(meta.width).toBe(512);
		expect(meta.height).toBe(256);
	});

	test('honours an explicit size inside the bounding box', async () => {
		const response = await call('?format=webp&w=96&h=96', await pngFixture(1600, 800));
		const meta = await sharp(Buffer.from(await response.arrayBuffer())).metadata();

		expect(meta.width).toBe(96);
		expect(meta.height).toBe(48);
	});

	test('serves the original bytes untouched when no transform is requested', async () => {
		const source = await pngFixture(1600, 800);
		const response = await call('?format=original', source);

		expect(response.headers.get('content-type')).toBe('image/png');
		expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array(source));
	});
});

import sharp from 'sharp';
import { describe, expect, test } from 'vitest';
import { createImagePipeline, MAX_CONCURRENT_IMAGE_JOBS, runImageJob } from './image-pipeline';

describe('image pipeline guards', () => {
	test('transforms ordinary images', async () => {
		const png = await sharp({ create: { width: 64, height: 64, channels: 3, background: '#336699' } })
			.png()
			.toBuffer();

		const webp = await runImageJob(() => createImagePipeline(png).resize({ width: 16 }).webp().toBuffer());
		const meta = await sharp(webp).metadata();

		expect(meta.format).toBe('webp');
		expect(meta.width).toBe(16);
	});

	test('builds generated canvases from options alone (social cards)', async () => {
		const png = await createImagePipeline(undefined, {
			create: { width: 12, height: 8, channels: 4, background: '#172554' }
		})
			.png()
			.toBuffer();
		const meta = await sharp(png).metadata();

		expect(meta.width).toBe(12);
		expect(meta.height).toBe(8);
	});

	test('rejects inputs above the pixel limit before decoding them', async () => {
		// 8000 × 8000 = 64 MP > 50 MP limit; a single-channel canvas keeps the fixture cheap.
		const huge = await sharp({ create: { width: 8000, height: 8000, channels: 3, background: '#000000' } })
			.png({ compressionLevel: 0 })
			.toBuffer();

		await expect(createImagePipeline(huge).toBuffer()).rejects.toThrow(/pixel limit/i);
	});

	test('runImageJob is bounded', () => {
		expect(MAX_CONCURRENT_IMAGE_JOBS).toBeLessThan(8);
		expect(runImageJob.active()).toBe(0);
	});
});

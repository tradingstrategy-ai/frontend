/**
 * Guarded sharp pipelines for the server-side image routes.
 *
 * sharp/libvips runs on the libuv threadpool shared with `dns.lookup` and `fs`. Unbounded
 * jobs (full-resolution AVIF encodes take seconds each) can occupy every pool thread and
 * stall the whole SSR process, so every pipeline created here is bounded in three ways:
 *
 * - input pixel count (`limitInputPixels`) — rejects decompression bombs up front;
 * - processing time (`timeout`) — libvips aborts the job instead of running indefinitely;
 * - concurrency (`runImageJob`) — at most {@link MAX_CONCURRENT_IMAGE_JOBS} jobs hold a
 *   pool thread at once; the rest queue in the event loop, where they cost nothing.
 *
 * @example
 * ```ts
 * const webp = await runImageJob(() => createImagePipeline(png).resize({ width: 256 }).webp().toBuffer());
 * ```
 */
import sharp, { type Sharp, type SharpOptions } from 'sharp';
import { createLimiter } from './concurrency-limit';

/** 50 MP — comfortably above any logo or blog image, far below sharp's 268 MP default. */
export const MAX_IMAGE_INPUT_PIXELS = 50_000_000;
export const IMAGE_JOB_TIMEOUT_SECONDS = 10;
export const MAX_CONCURRENT_IMAGE_JOBS = 2;

// libvips already defaults to one thread per job under glibc; pin it so a future allocator or
// platform change cannot silently turn each job into a core-count thread burst.
sharp.concurrency(1);

/** Run an image job once a slot is free; see {@link MAX_CONCURRENT_IMAGE_JOBS}. */
export const runImageJob = createLimiter(MAX_CONCURRENT_IMAGE_JOBS);

/**
 * Create a sharp pipeline with the shared input and time limits applied.
 *
 * @param input Encoded image bytes, or `undefined` when `options.create` builds the canvas
 * @param options Extra sharp options (`density`, `create`, …); limits below cannot be loosened
 */
export function createImagePipeline(input?: Buffer, options: SharpOptions = {}): Sharp {
	const guarded: SharpOptions = {
		failOn: 'none',
		...options,
		limitInputPixels: MAX_IMAGE_INPUT_PIXELS
	};
	// sharp rejects an explicit `undefined` input alongside options; a generated canvas
	// (`options.create`) must be constructed from the options object alone.
	const pipeline = input === undefined ? sharp(guarded) : sharp(input, guarded);
	return pipeline.timeout({ seconds: IMAGE_JOB_TIMEOUT_SECONDS });
}

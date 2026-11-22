/**
 * Bearer token for loopback-only internal endpoints (`/_internal/…`).
 *
 * `scripts/server.js` generates a random token at start-up and puts it in
 * `TS_PRIVATE_INTERNAL_REFRESH_TOKEN` before the SvelteKit handler loads, so only the
 * adapter-node process itself can call these endpoints; there is no public trigger.
 */
import { timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

/**
 * Whether the request carries this process's internal token.
 *
 * @param request incoming request
 */
export function hasInternalToken(request: Request) {
	const token = env.TS_PRIVATE_INTERNAL_REFRESH_TOKEN;
	const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
	if (!token || !supplied) return false;
	const encoder = new TextEncoder();
	const expectedBuffer = encoder.encode(token);
	const suppliedBuffer = encoder.encode(supplied);
	return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

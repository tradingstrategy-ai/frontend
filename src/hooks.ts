/**
 * Universal hooks, run on the server and in the browser.
 */
import type { Reroute } from '@sveltejs/kit';
import { stripEdgeCacheExtension } from '$lib/helpers/edge-cache';

/**
 * Serve `…/chart-data.bin`, `/social-card/….png` and `/metadata-logo/….webp` from the
 * extension-less routes; the extension only exists so Cloudflare caches the response. See
 * `$lib/helpers/edge-cache`.
 */
export const reroute: Reroute = ({ url }) => stripEdgeCacheExtension(url.pathname);

import type { Handle } from '@sveltejs/kit';
import {siteMode} from "$lib/config";
import * as cheerio from 'cheerio';


/**
 * SSR response transformations hook.
 */
export const handle: Handle = async ({ event, resolve }) => {

	const response = await resolve(event);

	// When the next client fetches this SSR rendered page,
	// Cloudflare servers CSS files as early hints
	// and browser can load and decode them while
	// the server is waiting for expensive database queries
	// to create the SSR page.
	if (response.headers["content-type"] === "text/html") {
		const earlyHintHeader = generateEarlyHintHeader(response);
		if(earlyHintHeader) {
			response.headers["Link"] = earlyHintHeader;
		}
	}

	return response;
};


/**
 * Generates early hint headers.
 *
 * This scrapes all stylesheet links from the HTML response and generates Link header
 * that contains all of them.
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link
 *
 * https://developers.cloudflare.com/cache/about/early-hints
 *
 * https://blog.cloudflare.com/early-hints/
 *
 * Example output:
 *
 * ```
 * Link: </fonts3.css>; rel="preconnect", </_app/assets/start-6f5e0715.css>; rel="preconnect", </_app/assets/pages/__layout.svelte-050f5ee5.css>; rel="preconnect", </_app/assets/pages/index.svelte-84a34be8.css>; rel="preconnect"
 * ```
 *
 * @param baseURL: The web server root URL
 *
 * @return Value for Link header. Empty string if no header added.
 *
 */
function generateEarlyHintHeader(response): string {

	if(!response.body) {
		throw new Error("text/html response was missing body");
	}

	const $ = cheerio.load(response.body);

	let header = "";

	$('link[rel="stylesheet"]').each(function(idx, elem) {
		const $this = $(this);

		// The SSR server generates root relative CSS links.
		// We need to transform them for full URLs for HTTP Link header spec
		const src = $this.attr('href');
		if(header) {
			header += ", ";
		}

		header += `<${src}>; rel="preconnect"`;
	});

	return header;
}


/**
 * Shortcut fetch() API requests on the server-side rendering.
 *
 * See https://github.com/tradingstrategy-ai/proxy-server/blob/master/Caddyfile
 *
 * @type {import('@sveltejs/kit').ExternalFetch}
 */
export async function externalFetch(request) {

	if(siteMode == "production") {

		// Write API URL to the internal network
		// TODO: Make these URLs part of config
		const publicHost = "https://tradingstrategy.ai/api";
		const internalHost = "http://127.0.0.1:3456/api"

		if (request.url.startsWith(publicHost)) {
			// clone the original request, but change the URL
			request = new Request(
				request.url.replace(publicHost, internalHost),
				request
			);}

	}
	return fetch(request);
}
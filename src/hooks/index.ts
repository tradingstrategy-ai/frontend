import type { Handle } from '@sveltejs/kit';
import {siteMode} from "$lib/config";


export const handle: Handle = async ({ request, resolve }) => {

	const response = await resolve(request);

	// Fix modulepreload issue
	// https://stackoverflow.com/a/70472372/315168

	if (response.headers["content-type"] === "text/html") {
		// Only try to transform HTML pages,
		// do not touch binary etc. loads
		// fixLinkModulePreloadIssue(response);
	}

	return response;
};


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
		const internalHost = "http://127.0.0.1:3456"

		if (request.url.startsWith(publicHost)) {
			// clone the original request, but change the URL
			request = new Request(
				request.url.replace(publicHost, internalHost),
				request
			);}

	}
	return fetch(request);
}
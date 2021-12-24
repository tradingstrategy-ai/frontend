import type { Handle } from '@sveltejs/kit';
import * as cheerio from 'cheerio';


/**
 * Modifies the response in-place to fix the link rel="modulepreload" issue.
 *
 * Note that this fix causes significant server-side processing time increase -
 * do not use long term, only proper fix is to fix Vite.
 *
 * For the source of the issue of loading times please see https://github.com/vitejs/vite/issues/5120
 *
 */
function fixLinkModulePreloadIssue(response: ServerResponse) {

	if(!response.body) {
		throw new Error("text/html response was missing body");
	}
	const $ = cheerio.load(response.body);

	// https://stackoverflow.com/a/60011663/315168
	// https://api.jquery.com/replacewith/
	$('link[rel="modulepreload"]').replaceWith(function() {
	  const src = $(this).attr('href');
	  return `<script type="module" defer src="${src}"></script>`;
	});

	response.body = $.html();
}


export const handle: Handle = async ({ request, resolve }) => {

	console.log("Hook triggered");

	// TODO https://github.com/sveltejs/kit/issues/1046
	if (request.query.has('_method')) {
		request.method = request.query.get('_method').toUpperCase();
	}

	const response = await resolve(request);

	// Fix modulepreload issue
	// https://stackoverflow.com/a/70472372/315168

	if (response.headers["content-type"] === "text/html") {
		// Only try to transform HTML pages,
		// do not touch binary etc. loads
		fixLinkModulePreloadIssue(response);
	}

	return response;
};

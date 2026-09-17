/**
 * Google Search metadata to provide enhanced search results:
 * https://developers.google.com/search/docs/advanced/structured-data/search-gallery
 */

import { ORGANIZATION_ID, SITE_NAME } from '$lib/helpers/seo';

// Utility function for generating metadata script tag
// See https://navillus.dev/blog/json-ld-in-sveltekit
export function serializeSchema(metadata: any) {
	return `<script type="application/ld+json">${JSON.stringify(metadata)}</script>`;
}

/**
 * WebSite SearchAction structured data for the site's query URL.
 *
 * Google retired the visual sitelinks search box, but this remains accurate
 * WebSite metadata for consumers that support SearchAction.
 * The generated <script> tag belongs in the home-page head as raw @html.
 */
export function sitelinksSearchBox() {
	const url = 'https://tradingstrategy.ai/';

	const metadata = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		url: url,
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${url}search?q={search_term_string}`
			},
			'query-input': 'required name=search_term_string'
		}
	};

	return serializeSchema(metadata);
}

/**
 * `Organization` node for the site — the publisher referenced by blog posts (`ORGANIZATION_ID`)
 * and the source of the knowledge-panel logo. Belongs in the home page head as raw @html.
 *
 * The logo must be an indexable image of at least 112×112 px:
 * https://developers.google.com/search/docs/appearance/structured-data/organization
 */
export function organizationSchema() {
	const url = 'https://tradingstrategy.ai/';

	const metadata = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': ORGANIZATION_ID,
		name: SITE_NAME,
		url,
		logo: `${url}brand-mark-512x512.png`,
		sameAs: [
			'https://twitter.com/TradingProtocol',
			'https://github.com/tradingstrategy-ai',
			'https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ',
			'https://open.spotify.com/show/0BXZEqA3uG5hYZiVYVRZP8'
		]
	};

	return serializeSchema(metadata);
}

/**
 * Google Search metadata to provide enhanced search results:
 * https://developers.google.com/search/docs/advanced/structured-data/search-gallery
 */

// Utility function for generating metadata script tag
// See https://navillus.dev/blog/json-ld-in-sveltekit
export function serializeSchema(metadata: any) {
	return `<script type="application/ld+json">${JSON.stringify(metadata)}</script>`;
}

/**
 * Google Article – enhanced search results for blog posts:
 * https://developers.google.com/search/docs/advanced/structured-data/article
 *
 * The generated <script> tag should included in the <head> of all blog posts
 * as raw @html
 */
interface Post {
	title: string;
	author: string;
	published_at: Date;
	updated_at: string;
}

export function serializePost(postData: Post) {
	const metadata = {
		'@context': 'http://schema.org',
		'@type': 'NewsArticle',
		headline: postData.title,
		author: {
			'@type': 'Person',
			name: 'Trading Strategy'
		},
		datePublished: postData.published_at,
		dateModified: postData.updated_at
	};

	return serializeSchema(metadata);
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

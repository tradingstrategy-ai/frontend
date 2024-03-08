/**
 * Generate a sitemap for glossary only.
 *
 * - All glossary terms are boosted to crawling priority 1.0
 */
import { getCachedGlossary } from '../glossary.js';

/**
 * Add the default XML headers around sitemap body
 *
 */
function renderSitemapHeaders(body: string): string {
	return `<?xml version="1.0" encoding="utf-8"?>
		<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
		xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
		xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
		${body}
		</urlset>`;
}

/**
 * Handle sitemap.xml generation
 *
 */
export async function GET({ fetch }) {
	const baseUrl = 'https://tradingstrategy.ai/glossary';
	const glossary = await getCachedGlossary(fetch);

	// Build sitemap XML
	const sitemapXmlBody = Object.keys(glossary)
		.map((slug) => {
			const fullUrl = `${baseUrl}/${slug}`;
			return `<url><loc>${fullUrl}</loc><priority>1.0</priority></url>`;
		})
		.join('');

	const sitemapXml = renderSitemapHeaders(sitemapXmlBody);

	const headers = {
		'content-type': 'application/xml',
		'cache-control': `public, max-age=${getCachedGlossary.ttl}`,
		age: getCachedGlossary.getAge(fetch).toFixed(0)
	};

	return new Response(sitemapXml, { headers });
}

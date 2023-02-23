/**
 * Generate a sitemap for glossary only.
 *
 * - All glossary terms are boosted to crawling priority 1.0
 */
import type { RequestHandler } from './$types';

/**
 * Add the default XML headers around sitemap bodh
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
export const GET = (async ({ fetch }) => {
	// Get URL slugs for all glossary terms
	const resp = await fetch('/glossary/api');
	const glossary = await resp.json();
	const slugs = Object.keys(glossary);

	// Build sitemap XML
	const baseUrl = 'https://tradingstrategy.ai/glossary';
	const sitemapXmlBody = slugs
		.map((slug) => {
			const fullUrl = `${baseUrl}/${slug}`;
			return `<url><loc>${fullUrl}</loc><priority>1.0</priority></url>`;
		})
		.join('');

	const sitemapXml = renderSitemapHeaders(sitemapXmlBody);

	const headers = {
		'content-type': 'application/xml',
		'cache-control': 'public, max-age=3600'
	};
	return new Response(sitemapXml, { headers });
}) satisfies RequestHandler;

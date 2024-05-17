/**
 * Generate a sitemap for blog posts
 */
import { SitemapStream } from 'sitemap';
import { Readable } from 'stream';
import ghostClient from '$lib/blog/client';

export async function GET({ setHeaders, url }) {
	const posts = await ghostClient.posts.browse({ limit: 'all' });

	const stream = new SitemapStream({ hostname: url.origin });
	const entries = posts.map((post: Record<string, string>) => ({
		url: `blog/${post.slug}`,
		lastmod: post.updated_at,
		priority: 0.8
	}));
	Readable.from(entries).pipe(stream);

	setHeaders({
		'content-type': 'application/xml',
		'cache-control': 'public, max-age=600'
	});

	// coerce stream to ReadableStream to make TypeScript happy
	return new Response(stream as unknown as ReadableStream<Uint8Array>);
}

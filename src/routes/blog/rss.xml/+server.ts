import type { BlogPost } from '$lib/schemas/blog.js';
import { getPosts, maxAge } from '$lib/blog/client';
import { escapeHtml } from '$lib/helpers/html';

export async function GET({ fetch, setHeaders }) {
	const { posts } = await getPosts(fetch, { limit: 'all' });

	setHeaders({
		'content-type': 'application/rss+xml; charset=utf-8',
		'cache-control': `public, max-age=${maxAge}`
	});

	return new Response(render(posts));
}

const render = (posts: BlogPost[]) => `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<atom:link href="https://tradingstrategy.ai/blog/rss.xml" rel="self" type="application/rss+xml" />
<title>Trading Strategy</title>
<link>https://tradingstrategy.ai</link>
<description>Algorithmic trading protocol for decentralised markets</description>
${posts.map(renderItem).join('')}
</channel>
</rss>`;

const renderItem = (post: BlogPost) => `<item>
<guid>https://tradingstrategy.ai/blog/${post.slug}</guid>
<title>${escapeHtml(post.title)}</title>
<link>https://tradingstrategy.ai/blog/${post.slug}</link>
<description>${escapeHtml(post.excerpt)}</description>
<pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
</item>`;

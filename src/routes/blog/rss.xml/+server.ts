import type { RequestHandler } from './$types';
import ghostClient from '$lib/blog/client';

export const GET: RequestHandler = async () => {
	const posts = await ghostClient.posts.browse({ limit: 'all' });
	const headers = {
		'content-type': 'application/rss+xml; charset=utf-8',
		'cache-control': 'public, max-age=600'
	};
	return new Response(render(posts), { headers });
};

const render = (posts: any[]) => `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<atom:link href="https://tradingstrategy.ai/rss" rel="self" type="application/rss+xml" />
<title>Trading Strategy</title>
<link>https://tradingstrategy.ai</link>
<description>Algorithmic trading protocol for decentralised markets</description>
${posts.map(renderItem).join('')}
</channel>
</rss>`;

const renderItem = (post: any) => `<item>
<guid>https://tradingstrategy.ai/blog/${post.slug}</guid>
<title>${escape(post.title)}</title>
<link>https://tradingstrategy.ai/blog/${post.slug}</link>
<description>${escape(post.custom_excerpt)}</description>
<pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
</item>`;

const entities = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&apos;'
};

const escape = (xml: string) => {
	// @ts-ignore
	return xml.replace(/[&<>"']/g, (char) => entities[char]);
};

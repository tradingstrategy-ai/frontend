import config from '$lib/config';
import getGhostClient from '$lib/blog/client';

const ghostClient = getGhostClient(config.ghost);

export const GET = async () => {
	const posts = await ghostClient.posts.browse({ limit: 'all' });
	const body = render(posts);
	const headers = {
		'Cache-Control': `max-age=0, s-max-age=${600}`,
		// https://stackoverflow.com/questions/595616/what-is-the-correct-mime-type-to-use-for-an-rss-feed
		//'Content-Type': 'application/xml',
		'Content-Type': 'application/rss+xml'
	};
	return {
		body,
		headers
	};
};

const render = (posts) => `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<atom:link href="https://tradingstrategy.ai/rss" rel="self" type="application/rss+xml" />
<title>Trading Strategy</title>
<link>https://tradingstrategy.ai</link>
<description>Algorithmic trading protocol for decentralised markets</description>
${posts
	.map((post) => {
		const excerpt = post.custom_excerpt.replace('&', '&amp;');
		return `<item>
        <guid>https://tradingstrategy.ai/blog/${post.slug}</guid>
        <title>${post.title}</title>
        <link>https://tradingstrategy.ai/blog/${post.slug}</link>
        <description>${excerpt}</description>
        <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
      </item>`;
	})
	.join('')}
</channel>
</rss>
`;

import { defineMock } from 'vite-plugin-mock-dev-server';
import postResponse from './post.data.json' with { type: 'json' };

/**
 * Ghost content API mocks. `TS_PUBLIC_GHOST_API_URL` points at `/api/ghost` in test mode
 * (see `.env.test`), so the paths below mirror Ghost's own URL layout under that prefix.
 */
export const BLOG_POST_SLUG = postResponse.posts[0].slug;

const indexPost = (({
	id,
	slug,
	title,
	feature_image,
	feature_image_alt,
	created_at,
	updated_at,
	published_at,
	excerpt
}) => ({
	id,
	slug,
	title,
	feature_image,
	feature_image_alt,
	created_at,
	updated_at,
	published_at,
	excerpt
}))(postResponse.posts[0]);

// Keep episodes beyond Ghost's 100-post response limit so the podcast index
// must fetch every API page before rendering its complete episode list.
export const PODCAST_EPISODE_COUNT = 105;
const indexPosts = [
	indexPost,
	...Array.from({ length: PODCAST_EPISODE_COUNT }, (_, index) => {
		const episode = PODCAST_EPISODE_COUNT - index;
		return {
			...indexPost,
			id: `podcast-episode-${episode}`,
			slug: `podcast-episode-${episode}`,
			title: `${episode <= 4 ? 'Podcast' : 'Episode'} #${episode}: Test podcast`
		};
	}),
	{
		...indexPost,
		id: 'external-podcast-interview',
		slug: 'external-podcast-interview',
		title: 'Trading Strategy interview at Citizen Cosmos podcast'
	}
];

export default defineMock([
	{
		url: '/api/ghost/ghost/api/content/posts/slug/:slug/',
		body: postResponse
	},
	{
		url: '/api/ghost/ghost/api/content/posts/',
		body: ({ query }) => {
			const limit = query.limit === 'all' ? 100 : Math.min(Number(query.limit ?? 40), 100);
			const page = Number(query.page ?? 1);
			const pages = Math.ceil(indexPosts.length / limit);
			const start = (page - 1) * limit;

			return {
				posts: indexPosts.slice(start, start + limit),
				meta: {
					pagination: {
						page,
						limit,
						pages,
						total: indexPosts.length,
						next: page < pages ? page + 1 : null,
						prev: page > 1 ? page - 1 : null
					}
				}
			};
		}
	}
]);

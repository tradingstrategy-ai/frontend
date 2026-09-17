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

export default defineMock([
	{
		url: '/api/ghost/ghost/api/content/posts/slug/:slug/',
		body: postResponse
	},
	{
		url: '/api/ghost/ghost/api/content/posts/',
		body: {
			posts: [indexPost],
			meta: { pagination: { page: 1, limit: 40, pages: 1, total: 1, next: null, prev: null } }
		}
	}
]);

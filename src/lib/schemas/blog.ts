import { z } from 'zod';

const datetime = z.string().datetime({ offset: true });
const url = z.string().url();
const positiveInteger = z.number().int().positive();

// See: https://ghost.org/docs/content-api/#posts
export const blogPostSchema = z.object({
	slug: z.string(),
	id: z.string(),
	uuid: z.string().uuid(),
	title: z.string(),
	html: z.string(),
	feature_image: url,
	feature_image_alt: z.string().nullable(),
	created_at: datetime,
	updated_at: datetime,
	published_at: datetime,
	url: url,
	excerpt: z.string(),
	og_image: url.nullable(),
	og_title: z.string().nullable(),
	og_description: z.string().nullable(),
	twitter_image: url.nullable(),
	twitter_title: z.string().nullable(),
	twitter_description: z.string().nullable(),
	meta_title: z.string().nullable(),
	meta_description: z.string().nullable()
});

export type BlogPost = z.infer<typeof blogPostSchema>;

// See: https://ghost.org/docs/content-api/#pagination
export const blogPaginationSchema = z.object({
	page: positiveInteger,
	limit: positiveInteger,
	pages: positiveInteger,
	total: positiveInteger,
	next: positiveInteger.nullable(),
	prev: positiveInteger.nullable()
});

export type BlogPagination = z.infer<typeof blogPaginationSchema>;

export const blogPostsSchema = z.object({
	posts: blogPostSchema.array()
});

export type BlogPostsSchema = z.infer<typeof blogPostsSchema>;

export const blogPostIndexSchema = blogPostsSchema.extend({
	meta: z.object({ pagination: blogPaginationSchema })
});

export type BlogPostIndex = z.infer<typeof blogPostIndexSchema>;

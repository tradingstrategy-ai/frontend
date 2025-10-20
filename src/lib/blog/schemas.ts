import { z } from 'zod';
import { isoDateTime } from '$lib/schemas/utility';

const url = z.url();
const positiveInteger = z.int().positive();

// See: https://ghost.org/docs/content-api/#posts
export const blogPostIndexItemSchema = z.object({
	id: z.string(),
	slug: z.string(),
	title: z.string(),
	feature_image: url,
	feature_image_alt: z.string().nullable(),
	created_at: isoDateTime,
	updated_at: isoDateTime,
	published_at: isoDateTime,
	excerpt: z.string()
});

export type BlogPostIndexItem = z.infer<typeof blogPostIndexItemSchema>;

// See: https://ghost.org/docs/content-api/#posts
export const blogPostDetailsSchema = blogPostIndexItemSchema.extend({
	uuid: z.uuid(),
	html: z.string(),
	url: url,
	og_image: url.nullable(),
	og_title: z.string().nullable(),
	og_description: z.string().nullable(),
	twitter_image: url.nullable(),
	twitter_title: z.string().nullable(),
	twitter_description: z.string().nullable(),
	meta_title: z.string().nullable(),
	meta_description: z.string().nullable()
});

export type BlogPostDetails = z.infer<typeof blogPostDetailsSchema>;

export const blogPostResponseSchema = z.object({
	posts: blogPostDetailsSchema.array()
});

// See: https://ghost.org/docs/content-api/#pagination
export const blogPaginationSchema = z.object({
	page: positiveInteger,
	limit: positiveInteger.or(z.literal('all')),
	pages: positiveInteger,
	total: positiveInteger,
	next: positiveInteger.nullable(),
	prev: positiveInteger.nullable()
});

export const blogPostIndexSchema = z.object({
	posts: blogPostIndexItemSchema.array(),
	meta: z.object({ pagination: blogPaginationSchema })
});

export type BlogPostIndex = z.infer<typeof blogPostIndexSchema>;

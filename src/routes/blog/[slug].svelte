<script context="module">
	import getGhostClient from '$lib/blog/client';

	// Pure server-side rendered page - no interactive JS
	import { buildBreadcrumbs } from '$lib/breadcrumb/builder';

	export async function load({ url, params, session }) {
		const ghostClient = getGhostClient(session.config.ghost);
		const { slug } = params;

		// See post data model
		// https://ghost.org/docs/content-api/#posts
		let post;
		try {
			post = await ghostClient.posts.read({ slug: slug }, { formats: ['html'] });
		} catch (error) {
			return {
				status: error.response?.status || 500,
				error: error.message
			};
		}

		const readableNames = {
			blog: 'Blog',
			[slug]: post.title
		};

		return {
			props: {
				post,
				breadcrumbs: buildBreadcrumbs(url.pathname, readableNames)
			}
		};
	}
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import SocialMetaTags from './_SocialMetaTags.svelte';
	import SocialLinks from './_SocialLinks.svelte';
	import BlogPostTimestamp from '$lib/components/BlogPostTimestamp.svelte';
	import BlogPostContent from './_BlogPostContent.svelte';

	export let post;
	export let breadcrumbs;
</script>

<SocialMetaTags url={$page.url} {post} />

<section class="ds-container">
	<header>
		<SocialLinks />
		<h1>{post.title}</h1>
		<BlogPostTimestamp publishedAt={post.published_at} />
		<img src={post.feature_image} alt={post.feature_image_alt} />
	</header>

	<BlogPostContent html={post.html} />
</section>

<style>
	.ds-container {
		--ds-container-max-width: 41rem;
		--ds-gap: 2rem;
	}

	header {
		margin-top: 2rem;
		display: grid;
		gap: 1.25rem;
	}

	h1 {
		font: var(--f-h2-medium);
	}

	img {
		max-width: 100%;
		aspect-ratio: 1.63;
		object-fit: cover;
	}
</style>

<script context="module">
	import getGhostClient from '$lib/blog/client';

	export async function load({ params, session }) {
		const ghostClient = getGhostClient(session.config.ghost);

		// See post data model: https://ghost.org/docs/content-api/#posts
		let post;
		try {
			post = await ghostClient.posts.read({ slug: params.slug }, { formats: ['html'] });
		} catch (error) {
			return {
				status: error.response?.status || 500,
				error: error.message
			};
		}

		return { props: { post } };
	}
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import SocialMetaTags from './_SocialMetaTags.svelte';
	import SocialLinks from './_SocialLinks.svelte';
	import BlogPostTimestamp from '$lib/components/BlogPostTimestamp.svelte';
	import BlogPostContent from './_BlogPostContent.svelte';

	export let post;
</script>

<SocialMetaTags url={$page.url} {post} />

<Breadcrumbs labels={{ [$page.params.slug]: post.title }} />

<article class="ds-container">
	<header>
		<SocialLinks layout="post" />
		<h1>{post.title}</h1>
		<BlogPostTimestamp publishedAt={post.published_at} />
		<img src={post.feature_image} alt={post.feature_image_alt} />
	</header>

	<BlogPostContent html={post.html} />
</article>

<style>
	article {
		--container-max-width: 720px;
		gap: 2rem;
	}

	header {
		margin-top: 1rem;
		display: grid;
		gap: 1.25rem;
	}

	h1 {
		font: var(--f-h2-medium);
		text-transform: capitalize;
	}

	article img {
		width: 100%;
		aspect-ratio: 1.5;
		min-height: 312px;
		max-height: 400px;
		object-fit: cover;
	}
</style>

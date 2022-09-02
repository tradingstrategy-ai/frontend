<script lang="ts">
	import type { PageData } from './$types';
	import fetchPosts from './fetchPosts';
	import { inview } from 'svelte-inview';
	import Spinner from 'svelte-spinner';
	import BlogPostTile from '$lib/components/BlogPostTile.svelte';
	import SocialLinks from './SocialLinks.svelte';

	export let data: PageData;

	let { posts, page } = data;

	async function fetchNextPage() {
		page.loading = true;
		try {
			const response = await fetchPosts(page);
			posts = [...posts, ...response.posts];
			page = response.page;
		} catch (e) {
			page.error = e.message;
			page.loading = false;
		}
	}
</script>

<svelte:head>
	<title>Blog</title>
	<meta name="description" content="Latest on algorithmic trading" />
</svelte:head>

<main>
	<header class="ds-container ds-2-col">
		<div>
			<h2>Trading Strategy blog</h2>
			<p>Follow our decentralised algorithmic trading protocol development</p>
		</div>
		<SocialLinks layout="index" />
	</header>

	<section class="ds-container posts">
		{#each posts as post, idx (post.id)}
			<BlogPostTile
				featured={idx === 0}
				title={post.title}
				excerpt={post.excerpt}
				imageUrl={post.feature_image}
				imageAltText={post.feature_image_alt}
				slug={post.slug}
				publishedAt={post.published_at}
			/>
		{:else}
			<p>No blog posts found (check if Ghost is properly configured)</p>
		{/each}
	</section>

	<section class="ds-container loading">
		<div>
			{#if page.loading}
				<Spinner />
			{:else if page.error}
				Error loading blog posts:
				<pre class="font-weight-normal">{page.error}</pre>
			{:else if page.next}
				<div use:inview={{ rootMargin: '500px' }} on:enter={fetchNextPage} />
			{:else}
				Congratulations – you've reached the end 🎉! Check back soon for new posts.
			{/if}
		</div>
	</section>
</main>

<style>
	header {
		margin-top: 1.5rem;
		align-items: center;
		gap: 1.5rem 2.5rem;
	}

	h2 {
		font: 600 var(--fs-heading-xl);
	}

	header p {
		margin-top: 0.75rem;
		font: var(--f-h4-roman);
	}

	.posts {
		padding-block: 2.5rem;
		grid-template-columns: repeat(auto-fit, minmax(21.25rem, 1fr));
		gap: 2.5rem;
		/** ensure featured post column gap matches the layout column gap */
		--blog-post-tile--column-gap: 2.5rem;
	}

	.loading {
		font: var(--f-ui-large-roman);
		text-align: center;
	}

	@media (--viewport-lg-up) {
		.posts {
			padding-block: 3.75rem;
		}
	}
</style>

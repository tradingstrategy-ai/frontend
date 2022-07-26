<script context="module">
	import getGhostClient from '$lib/blog/client';

	let ghostClient = {};
	const limit = 5;

	async function fetchPosts(page = { next: 1 }) {
		if (!page.next) return { page, posts: [] };
		const response = await ghostClient.posts?.browse({ limit, page: page.next });
		return {
			posts: [...response],
			page: response.meta.pagination
		};
	}

	export async function load({ session }) {
		ghostClient = getGhostClient(session.config.ghost);

		return {
			props: await fetchPosts()
		};
	}
</script>

<script>
	import BlogPostTile from '$lib/components/BlogPostTile.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Spinner from 'svelte-spinner';
	import { inview } from 'svelte-inview';

	export let posts = [];
	export let page = {};

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

<header class="ds-container">
	<div>
		<h2>Trading Strategy blog</h2>
		<p>Follow our decentralised algorithmic trading protocol development</p>
	</div>

	<div class="social-links">
		<a href="https://newsletter.tradingstrategy.ai/">
			<div style:font-size="24px"><Icon name="newspaper" /></div>
			<div><span class="long">Subscribe to our </span>Newsletter</div>
		</a>
		<a href="https://twitter.com/TradingProtocol">
			<div style:font-size="24px"><Icon name="twitter" /></div>
			<div><span class="long">Follow us on </span>Twitter</div>
		</a>
		<a href="/blog/rss.xml" rel="external">
			<div style:font-size="24px"><Icon name="rss" /></div>
			<div>RSS <span class="long">Feed</span></div>
		</a>
	</div>
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

<style>
	header {
		margin: 1.5rem 0;
		align-items: center;
	}

	header p {
		margin-top: 0.75rem;
		font: var(--f-h4-roman);
	}

	.social-links {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem 2.5rem;
	}

	.social-links a {
		display: grid;
		grid-template-columns: repeat(2, max-content);
		align-items: center;
		gap: 0.5em;
		font: 500 var(--fs-ui-md);
		letter-spacing: 0.01em;
		text-decoration: none;
	}

	.social-links a:hover {
		text-decoration: underline;
	}

	.posts {
		/** ensure featured post column gap matches the layout column gap */
		--blog-post-tile--column-gap: var(--ds-gap);
	}

	.loading {
		margin: 3rem 0;
		font: var(--f-ui-large-roman);
		text-align: center;
	}

	@media (max-width: 1024px) {
		.social-links {
			justify-content: space-between;
			flex-wrap: nowrap;
		}
	}

	@media (max-width: 660px) {
		.social-links .long {
			display: none;
		}
	}
</style>

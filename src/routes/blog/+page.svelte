<script lang="ts">
	import type { PageData } from './$types';
	import fetchPosts from './fetchPosts';
	import { inview } from 'svelte-inview';
	import Spinner from 'svelte-spinner';
	import { BlogRoll, HeroBanner, Section } from '$lib/components';
	import OptInBanner from '$lib/newsletter/OptInBanner.svelte';
	import SocialLinks from './SocialLinks.svelte';
	import heroImage from '$lib/assets/illustrations/newspaper-1.svg?raw';

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
	<title>Trading Strategy Blog</title>
	<meta name="description" content="Insights and research on DeFi and algorithmic trading." />
</svelte:head>

<main class="blog-index-page">
	<Section class="hero" header layout="boxed">
		<HeroBanner
			title="Trading Strategy Blog"
			subtitle="Read our insights into on-chain trading. We cover trading and investing in blockchains, decentralised finance (DeFi), decentralised exchanges (DEXes), automated trading strategies and web3."
			image={heroImage}
			hr={true}
		>
			<SocialLinks layout="index" />
		</HeroBanner>
	</Section>

	<Section class="posts" layout="boxed" padding="md">
		<BlogRoll {posts} />
	</Section>

	<Section class="loading" layout="boxed">
		{#if page.loading}
			<Spinner />
		{:else if page.error}
			Error loading blog posts:
			<pre class="font-weight-normal">{page.error}</pre>
		{:else if page.next}
			<div use:inview={{ rootMargin: '500px' }} on:enter={fetchNextPage} />
		{:else}
			<OptInBanner>
				<h3 slot="title">Congratulations – you've reached the end 🎉!</h3>
				<p slot="description">
					Want more? Subscribe to our newsletter and get fresh posts directly to your email inbox!
				</p>
			</OptInBanner>
		{/if}
	</Section>
</main>

<style lang="postcss">
	.blog-index-page :global {
		& .hero {
			& .social-links {
				margin-top: var(--space-sm);

				@media (--viewport-sm-down) {
					margin: var(--space-md) 0;
				}
			}

			@media (--viewport-sm-down) {
				& .media {
					display: none;
				}
			}
		}
	}

	.blog-index-page :global .loading .grid {
		place-items: center;
	}

	.blog-index-page :global .svelte-spinner {
		height: 4rem;
		width: 4rem;
		& circle {
			stroke: hsla(var(--hsl-text));
		}
	}

	.loading {
		font: var(--f-ui-large-roman);
		text-align: center;
	}
</style>

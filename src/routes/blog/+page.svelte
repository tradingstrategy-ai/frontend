<script lang="ts">
	import fetchPosts from './fetchPosts';
	import { inview } from 'svelte-inview';
	import { Alert, BlogRoll, HeroBanner, Section, Spinner } from '$lib/components';
	import OptInBanner from '$lib/newsletter/OptInBanner.svelte';
	import SocialLinks from './SocialLinks.svelte';
	import heroImage from '$lib/assets/illustrations/newspaper-1.svg?raw';

	export let data;

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
	<Section tag="header">
		<HeroBanner
			title="Trading Strategy Blog"
			subtitle="Read our insights into on-chain trading. We cover trading and investing in blockchains, decentralised finance (DeFi), decentralised exchanges (DEXes), automated trading strategies and web3."
			image={heroImage}
			hr
		>
			<div class="social-links-wrapper">
				<SocialLinks />
			</div>
		</HeroBanner>
	</Section>

	<Section padding="md">
		<BlogRoll {posts} />
	</Section>

	<Section>
		{#if page.loading}
			<div style:text-align="center">
				<Spinner size="60" />
			</div>
		{:else if page.error}
			<Alert title="Error loading blog posts">
				<pre>{page.error}</pre>
			</Alert>
		{:else if page.next}
			<div use:inview={{ rootMargin: '500px' }} on:enter={fetchNextPage} />
		{:else}
			<OptInBanner>
				<h2 slot="title">Congratulations – you've reached the end 🎉!</h2>
				<p slot="description">
					Want more? Subscribe to our newsletter and get fresh posts directly to your email inbox!
				</p>
			</OptInBanner>
		{/if}
	</Section>
</main>

<style>
	.social-links-wrapper {
		margin-top: var(--space-sm);

		@media (--viewport-sm-down) {
			margin: var(--space-md) 0;
		}
	}
</style>

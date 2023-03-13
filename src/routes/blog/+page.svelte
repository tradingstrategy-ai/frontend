<script lang="ts">
	import type { PageData } from './$types';
	import fetchPosts from './fetchPosts';
	import { inview } from 'svelte-inview';
	import Spinner from 'svelte-spinner';
	import { AlertItem, AlertList, BlogRoll, HeroBanner, Section } from '$lib/components';
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
				<Spinner size="4rem" color="hsla(var(--hsl-text))" />
			</div>
		{:else if page.error}
			<AlertList>
				<AlertItem title="Error loading blog posts">
					<pre>{page.error}</pre>
				</AlertItem>
			</AlertList>
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

<style lang="postcss">
	.social-links-wrapper {
		margin-top: var(--space-sm);

		@media (--viewport-sm-down) {
			margin: var(--space-md) 0;
		}
	}
</style>

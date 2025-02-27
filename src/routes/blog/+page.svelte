<script lang="ts">
	import { inview } from 'svelte-inview';
	import { getPosts } from '$lib/blog/client';
	import Alert from '$lib/components/Alert.svelte';
	import BlogRoll from '$lib/components/BlogRoll.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import OptInBanner from '$lib/newsletter/OptInBanner.svelte';
	import SocialLinks from './SocialLinks.svelte';
	import heroImage from '$lib/assets/illustrations/newspaper-1.svg?raw';

	let { data } = $props();

	let posts = $state(data.posts);
	let pagination = $state(data.meta.pagination);

	let loading = $state(false);
	let error: any = $state();

	async function fetchNextPage() {
		const { next: page, limit } = pagination;
		if (!page) return;

		loading = true;

		try {
			const { posts: newPosts, meta } = await getPosts(fetch, { page, limit });
			posts = [...posts, ...newPosts];
			pagination = meta.pagination;
		} catch (err: any) {
			error = err;
		} finally {
			loading = false;
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
			image={heroImage}
			title="Trading Strategy Blog"
			subtitle="Read our insights into on-chain trading. We cover trading and investing in blockchains, decentralised finance (DeFi), decentralised exchanges (DEXes), automated trading strategies and web3."
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
		{#if loading}
			<div style:text-align="center">
				<Spinner size="60" />
			</div>
		{:else if error}
			<Alert title="Error loading blog posts">
				<pre>{error.message ?? String(error)}</pre>
			</Alert>
		{:else if pagination.next}
			<div use:inview={{ rootMargin: '500px' }} oninview_enter={fetchNextPage}></div>
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

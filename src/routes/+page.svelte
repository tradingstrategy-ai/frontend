<!--
	Home page
-->
<script lang="ts">
	import { page } from '$app/state';
	import DebugFreshnessData from '$lib/components/DebugFreshnessData.svelte';
	import HomeHeroBanner from './_components/HomeHeroBanner.svelte';
	import FeaturedStrategies from './_components/FeaturedStrategies.svelte';
	import TopVaults from './_components/TopVaults.svelte';
	import VaultEcosystem from './_components/VaultEcosystem.svelte';

	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
	import BlogRoll from '$lib/components/BlogRoll.svelte';
	import Button from '$lib/components/Button.svelte';
	import Section from '$lib/components/Section.svelte';
	import { sitelinksSearchBox } from '$lib/helpers/google-meta';
	import { MetaTags } from 'svelte-meta-tags';

	let { data } = $props();

	let { posts, strategies, topVaults, savingsRate, treasuryRate } = $derived(data);

	const title = 'Trading Strategy';
	const description = 'Data-driven DeFi vault opportunities';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
</script>

<MetaTags
	{title}
	{description}
	canonical={pageUrl}
	openGraph={{ siteName: 'Trading Strategy', url: pageUrl, title, description, type: 'website' }}
	twitter={{ site: '@TradingProtocol', cardType: 'summary', title, description }}
/>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html sitelinksSearchBox()}
</svelte:head>

<main class="home-page">
	<DebugFreshnessData label="home-page" data={data.debugFreshness} />

	<HomeHeroBanner />

	<FeaturedStrategies {strategies} />

	{#if topVaults}
		<TopVaults vaults={topVaults.vaults} aggregates={topVaults.aggregates} />
		<VaultEcosystem {savingsRate} {treasuryRate} />
	{/if}

	{#if posts}
		<Section padding="md" gap="md" --section-background="var(--c-background-accent-1)">
			<h2>Blog</h2>
			<BlogRoll {posts} />
			<div style:text-align="center">
				<Button secondary label="Read all posts" href="/blog" />
			</div>
		</Section>
	{/if}

	<Section padding="md">
		<NewsletterOptInBanner />
	</Section>
</main>

<style>
	h2 {
		text-align: center;
	}

	/* limit to 3 posts on larger viewports (single row) */
	@media (width >= 1140px) {
		.home-page :global(.blog-roll > :nth-child(4)) {
			display: none;
		}
	}
</style>

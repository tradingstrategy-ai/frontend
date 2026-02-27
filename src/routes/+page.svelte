<!--
	Home page
-->
<script lang="ts">
	import HomeHeroBanner from './_components/HomeHeroBanner.svelte';
	import FeaturedStrategies from './_components/FeaturedStrategies.svelte';
	import TopVaults from './_components/TopVaults.svelte';
	import ImpressiveNumbers from './_components/ImpressiveNumbers.svelte';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
	import BlogRoll from '$lib/components/BlogRoll.svelte';
	import Button from '$lib/components/Button.svelte';
	import Section from '$lib/components/Section.svelte';
	import { sitelinksSearchBox } from '$lib/helpers/google-meta';

	let { data } = $props();

	let { impressiveNumbers, posts, strategies, topVaults } = $derived(data);
</script>

<svelte:head>
	<title>Trading Strategy - Algorithmic Trading Protocol</title>
	<meta name="description" content="AI-driven best profitable automated trading strategies" />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html sitelinksSearchBox()}
</svelte:head>

<main class="home-page">
	<HomeHeroBanner />

	<FeaturedStrategies {strategies} />

	<TopVaults {topVaults} />

	<ImpressiveNumbers {impressiveNumbers} />

	{#if posts}
		<Section padding="md" gap="md" --section-background="var(--c-background-accent-1)">
			<h2>Blog</h2>
			<BlogRoll {posts} />
			<div style:text-align="center">
				<Button label="Read all posts" href="/blog" />
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

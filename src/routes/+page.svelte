<!--
	Home page
-->
<script lang="ts">
	import HomeHeroBanner from './HomeHeroBanner.svelte';
	import FeaturedStrategies from './FeaturedStrategies.svelte';
	import ImpressiveNumbers from './ImpressiveNumbers.svelte';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
	import BlogRoll from '$lib/components/BlogRoll.svelte';
	import Button from '$lib/components/Button.svelte';
	import Section from '$lib/components/Section.svelte';
	import { sitelinksSearchBox } from '$lib/helpers/google-meta';

	let { data } = $props();

	const { impressiveNumbers, posts, strategies } = data;
</script>

<svelte:head>
	<title>Trading Strategy - Algorithmic Trading Protocol</title>
	<meta name="description" content="AI-driven best profitable automated trading strategies" />
	{@html sitelinksSearchBox()}
</svelte:head>

<main class="home-page">
	<HomeHeroBanner />

	<FeaturedStrategies {strategies} />

	<ImpressiveNumbers {impressiveNumbers} />

	{#if posts}
		<Section padding="md" gap="md">
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

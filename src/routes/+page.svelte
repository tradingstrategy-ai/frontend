<!--
	Home page
-->
<script lang="ts">
	import HomeHeroBanner from './HomeHeroBanner.svelte';
	import { BlogRoll, Button, Grid, Section, UspTile } from '$lib/components';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
	import FeaturedStrategies from './FeaturedStrategies.svelte';
	import { sitelinksSearchBox } from '$lib/helpers/google-meta';
	import { formatAmount, formatDollar } from '$lib/helpers/formatters';

	export let data;

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

	{#if impressiveNumbers}
		<Section gap="md" padding="md" testId="impressive-numbers" --section-background="var(--c-background-accent-1)">
			<h2 style="text-align: center;">Your strategy can trade</h2>
			<Grid cols={3} gap="lg">
				<UspTile
					title={formatAmount(impressiveNumbers.pairs)}
					subtitle="trading pairs"
					href="/trading-view/trading-pairs"
				/>
				<UspTile
					title={formatDollar(impressiveNumbers.liquidity)}
					subtitle="liquidity"
					href="/trading-view/trading-pairs"
				/>
				<UspTile title={impressiveNumbers.blockchains} subtitle="blockchains" href="/trading-view/blockchains" />
			</Grid>

			<p class="benefits">
				Decentralised finance offers significant new opportunities for algorithmic traders.
				<a class="body-link" rel="external" href="https://tradingstrategy.ai/about">
					Contact us to learn how to port your algorithms.
				</a>
			</p>
		</Section>
	{/if}

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

	p {
		font: var(--f-ui-xl-roman);
		letter-spacing: var(--f-ui-xl-spacing, normal);
	}

	/* limit to 3 posts on larger viewports (single row) */
	.home-page :global .blog-roll > :nth-child(4) {
		@media (width >= 1140px) {
			display: none;
		}
	}

	.benefits {
		text-align: center;
		max-width: 48ch;
		margin: 0 auto;
	}
</style>

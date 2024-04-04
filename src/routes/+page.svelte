<!--
	Home page
-->
<script lang="ts">
	import HomeHeroBanner from './HomeHeroBanner.svelte';
	import { BlogRoll, Button, Grid, Section, SummaryBox, UspTile } from '$lib/components';
	import TopTradesTable from '$lib/momentum/TopTradesTable.svelte';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
	import StrategyTile from './strategies/StrategyTile.svelte';
	import { sitelinksSearchBox } from '$lib/helpers/google-meta';
	import { formatAmount, formatDollar } from '$lib/helpers/formatters';
	import StrategyBadges from './strategies/StrategyBadges.svelte';

	export let data;
	let newsletterBanner: NewsletterOptInBanner;

	const { impressiveNumbers, posts, strategies, topMomentum } = data;
</script>

<svelte:head>
	<title>Trading Strategy - Algorithmic Trading Protocol</title>
	<meta name="description" content="AI-driven best profitable automated trading strategies" />
	{@html sitelinksSearchBox()}
</svelte:head>

<main class="home-page">
	<HomeHeroBanner />

	<Section padding="xl">
		<h2>Top strategies</h2>
		<div class="strategies">
			{#each strategies as strategy (strategy.id)}
				<StrategyTile {strategy} />
			{:else}
				<p class="strategies-fallback">Check back soon to see top-performing strategies.</p>
			{/each}
		</div>
		<div class="strategies-cta">
			<Button secondary label="See all strategies" href="/strategies" />
		</div>
	</Section>

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
				Decentralised finance offers significant opportunities and risk benefits for algorithmic traders, trading signal
				developers, and liquid hedge funds.
				<a class="body-link" rel="external" href="https://tradingstrategy.ai/docs">
					Read how to port your strategy to decentralised finance.
				</a>
			</p>
		</Section>
	{/if}

	{#if topMomentum}
		<Section padding="md" gap="md">
			<h2>Today's top trades</h2>

			<Grid cols={2} gap="lg">
				<SummaryBox title="Most profitable 24h">
					<Button
						slot="cta"
						let:position
						size={position === 'header' ? 'sm' : 'md'}
						label="View all winning pairs"
						href="/trading-view/top-list/daily-up"
					/>
					<TopTradesTable pairs={topMomentum.top_up_24h_min_liq_1m} />
				</SummaryBox>

				<SummaryBox title="Worst performance 24h">
					<Button
						slot="cta"
						let:position
						size={position === 'header' ? 'sm' : 'md'}
						label="View all losing pairs"
						href="/trading-view/top-list/daily-down"
					/>
					<TopTradesTable pairs={topMomentum.top_down_24h_min_liq_1m} />
				</SummaryBox>
			</Grid>
		</Section>
	{/if}

	{#if posts}
		<Section padding="md" gap="md">
			<h2 style:text-align="center">Blog</h2>
			<BlogRoll {posts} />
			<div style:text-align="center">
				<Button label="Read all posts" href="/blog" />
			</div>
		</Section>
	{/if}

	<Section padding="md">
		<NewsletterOptInBanner bind:this={newsletterBanner} />
	</Section>
</main>

<style lang="postcss">
	h2 {
		text-align: center;
	}

	p {
		font: var(--f-ui-xl-roman);
		letter-spacing: var(--f-ui-xl-spacing, normal);
	}

	.strategies {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		justify-content: center;
		padding: 3rem 0;
		overflow: hidden;

		> :global(*) {
			flex: 1;
			min-width: min(27.25rem, 100%);

			@media (--viewport-xl-up) {
				max-width: 36rem;
			}
		}
	}

	:is(.strategies-fallback, .strategies-cta) {
		text-align: center;
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

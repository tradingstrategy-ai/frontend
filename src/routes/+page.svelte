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
	import { formatAmount, formatDaysAgo, formatDollar } from '$lib/helpers/formatters';

	export let data;

	const { impressiveNumbers, posts, strategies, topMomentum } = data;

	function calculateOpenStrategiesLiveDuration() {
		const launchAt = new Date(2024, 3, 15);
		const daysText = formatDaysAgo(launchAt.getTime() / 1000);
		return daysText;
	}

	const openLiveDays = calculateOpenStrategiesLiveDuration();
</script>

<svelte:head>
	<title>Trading Strategy - Algorithmic Trading Protocol</title>
	<meta name="description" content="AI-driven best profitable automated trading strategies" />
	{@html sitelinksSearchBox()}
</svelte:head>

<main class="home-page">
	<HomeHeroBanner />

	<Section padding="xl">
		<h2>Open strategies</h2>
		<p class="live-ago">
			Open strategies have been live {openLiveDays}.
		</p>
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
				Decentralised finance offers significant new opportunities for algorithmic traders.
				<a class="body-link" rel="external" href="https://tradingstrategy.ai/about">
					Contact us to learn how ot port your algorithms.
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
		<NewsletterOptInBanner />
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
		--strategy-tile-gap: 1.5rem;
		display: flex;
		flex-wrap: wrap;
		gap: var(--strategy-tile-gap);
		justify-content: center;
		padding: 3rem 0;
		overflow: hidden;

		> :global(*) {
			flex: 1;
			min-width: min(27.25rem, 100%);

			@media (--viewport-lg-up) {
				/* limit tile width */
				max-width: 36rem;

				/* lone tile on last row should have same width as others */
				&:nth-child(2n + 3) {
					max-width: calc((100% - var(--strategy-tile-gap)) / 2);
				}
			}

			/* force single column below 1024px */
			@media (--viewport-md-down) {
				min-width: 100%;
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

	.live-ago {
		text-align: center;
		max-width: 48ch;
		margin: 0 auto;
		color: var(--c-text-extra-light);
	}
</style>

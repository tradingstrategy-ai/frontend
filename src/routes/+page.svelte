<!--
	Home page
-->
<script lang="ts">
	import HomeHeroBanner from './HomeHeroBanner.svelte';
	import { BlogRoll, Button, Grid, Section, SummaryBox, UspTile } from '$lib/components';
	import TopTradesTable from '$lib/momentum/TopTradesTable.svelte';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
	import { sitelinksSearchBox } from '$lib/helpers/google-meta';
	import { formatAmount, formatDollar } from '$lib/helpers/formatters';

	export let data;
	let newsletterBanner: NewsletterOptInBanner;

	const { topMomentum, impressiveNumbers, posts } = data;
</script>

<svelte:head>
	<title>Trading Strategy - Algorithmic Trading Protocol</title>
	<meta name="description" content="Automated trading for DEXes and DeFi protocols" />
	{@html sitelinksSearchBox()}
</svelte:head>

<main class="home-page">
	<HomeHeroBanner />

	{#if impressiveNumbers}
		<Section gap="md" padding="md" testId="impressive-numbers">
			<h2 style="text-align: center;">Automated trading and research on</h2>
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
		</Section>
	{/if}

	{#if topMomentum}
		<Section padding="md" gap="md">
			<h2>Top trades</h2>

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

	<Section padding="lg" --section-background="hsl(var(--hsla-background-accent-1))">
		<div class="strategies">
			<h2>Strategies</h2>
			<div class="coming-soon">Coming soon</div>
			<p>Follow us to be the first to know when our automated trading strategies go live.</p>
			<div class="ctas">
				<div class="newsletter-cta">
					<Button icon="newspaper" label="Subscribe to newsletter" on:click={newsletterBanner.scrollIntoView} />
				</div>
				<Button
					icon="twitter"
					label="Follow us on Twitter"
					href="https://twitter.com/TradingProtocol"
					target="_blank"
				/>
				<Button icon="telegram" label="Follow us on Telegram" href="https://t.me/trading_protocol" target="_blank" />
			</div>
		</div>
	</Section>

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

	.strategies {
		background: hsl(var(--hsla-box-2));
		border-radius: var(--radius-xl);
		display: grid;
		gap: var(--space-3xl);
		justify-self: center;
		max-width: 60rem;
		padding: var(--space-xl);
		place-items: center;
		text-align: center;

		@media (--viewport-md-up) {
			margin-top: var(--space-ss);
			padding: var(--space-5xl);
		}

		h2 {
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);
			@media (--viewport-md-up) {
				font: var(--f-heading-xl-medium);
				letter-spacing: var(--f-heading-xl-spacing, normal);
			}
		}

		.coming-soon {
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing, normal);
			color: hsl(var(--hsl-text-light));
			text-transform: uppercase;
			padding: var(--space-sl) var(--space-ls);
			border: 1px solid hsl(var(--hsl-text-extra-light));
			border-radius: var(--radius-xxl);
		}

		p {
			font: var(--f-ui-xl-roman);
			letter-spacing: var(--f-ui-xl-spacing, normal);
		}

		.ctas {
			display: flex;
			gap: var(--space-lg);
			width: 100%;

			@media (--viewport-sm-down) {
				flex-direction: column;
			}
		}

		/* hide on small displays due to label wrapping */
		.newsletter-cta {
			display: grid;

			@media (width < 390px) {
				display: none;
			}
		}
	}

	/* limit to 3 posts on larger viewports (single row) */
	.home-page :global .blog-roll > :nth-child(4) {
		@media (width >= 1140px) {
			display: none;
		}
	}
</style>

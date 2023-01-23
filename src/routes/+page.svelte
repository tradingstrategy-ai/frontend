<!--
	Home page
-->
<script lang="ts">
	import type { PageData } from './$types';
	import HomeHeroBanner from './HomeHeroBanner.svelte';
	import { BlogRoll, Button, Section, SummaryBox } from '$lib/components';
	import TopTradesTable from '$lib/momentum/TopTradesTable.svelte';
	import { sitelinksSearchBox } from '$lib/helpers/googleMeta';
	import NewsletterOptInBanner from '$lib/components/NewsletterOptInBanner.svelte';

	export let data: PageData;

	const { topMomentum, impressiveNumbers, posts } = data;
</script>

<svelte:head>
	<title>Trading Strategy - Algorithmic Trading Protocol</title>
	<meta name="description" content="DeFi market data and systematic trading" />
	{@html sitelinksSearchBox()}
</svelte:head>

<main class="home-page">
	<HomeHeroBanner {impressiveNumbers} />

	<Section class="top-trades" layout="boxed" padding="md" title="Top trades" cols={2} gap="lg">
		<SummaryBox title="Most profitable 24h">
			<Button size="sm" slot="headerCta" href="/trading-view/top-list/daily-up">View all winning pairs</Button>
			<Button size="md" slot="footerCta" href="/trading-view/top-list/daily-up">View all winning pairs</Button>
			<TopTradesTable pairs={topMomentum.top_up_24h_min_liq_1m} />
		</SummaryBox>

		<SummaryBox title="Worst performance 24h">
			<Button size="sm" slot="headerCta" href="/trading-view/top-list/daily-down">View all losing pairs</Button>
			<Button size="md" slot="footerCta" href="/trading-view/top-list/daily-down">View all losing pairs</Button>
			<TopTradesTable pairs={topMomentum.top_down_24h_min_liq_1m} />
		</SummaryBox>
	</Section>

	<Section class="strategies" layout="boxed" padding="lg">
		<div class="inner">
			<h2>Strategies</h2>
			<div class="coming-soon">Coming soon</div>
			<p>Sign up to the Trading Strategy newsletter and be the first to know when strategies are live.</p>
			<div class="ctas">
				<Button icon="newspaper" label="Subscribe to newsletter" href="#home-newsletter" />
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
		<Section title="Blog" class="blog" layout="boxed" padding="md">
			<BlogRoll {posts} />
			<Button label="Read more on Blog" href="/blog" slot="footer" />
		</Section>
	{/if}

	<Section class="newsletter" id="home-newsletter" layout="boxed" padding="md">
		<NewsletterOptInBanner />
	</Section>
</main>

<style lang="postcss">
	.home-page :global {
		& .strategies {
			background-color: hsla(var(--hsla-background-accent-1));

			& .inner {
				background: hsla(var(--hsl-box), var(--a-box-b));
				border-radius: var(--radius-xl);
				display: grid;
				gap: var(--space-3xl);
				max-width: 60rem;
				margin: auto;
				padding: var(--space-5xl);
				place-content: center;
				place-items: center;
				text-align: center;

				@media (--viewport-md-up) {
					margin-top: var(--space-ss);

					& h2 {
						font: var(--f-heading-xl-medium);
					}
				}
			}

			& .coming-soon {
				font: var(--f-ui-sm-medium);
				letter-spacing: var(--f-ui-sm-spacing, normal);
				color: var(--c-text-2-v1);
				text-transform: uppercase;
				padding: var(--space-sl) var(--space-ls);
				border: 1px solid var(--c-parchment-super-dark);
				border-radius: var(--radius-xxl);
			}

			& p {
				font: var(--f-ui-xl-roman);
			}
		}

		& :global .strategies .ctas {
			display: flex;
			gap: var(--space-lg);
		}

		& .blog {
			& .blog-roll {
				/* limit to 3 posts on larger viewports (single row) */
				@media (width >= 1140px) {
					& > :nth-child(4) {
						display: none;
					}
				}
			}

			& footer .button {
				justify-self: center;
			}
		}
	}
</style>

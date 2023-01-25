<!--
	Home page
-->
<script lang="ts">
	import type { PageData } from './$types';
	import HomeHeroBanner from './HomeHeroBanner.svelte';
	import { BlogRoll, Button, Illustration, Section, SummaryBox } from '$lib/components';
	import TopTradesTable from '$lib/momentum/TopTradesTable.svelte';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
	import { sitelinksSearchBox } from '$lib/helpers/googleMeta';

	export let data: PageData;

	const { topMomentum, impressiveNumbers, posts } = data;

	function scrollToNewsletterOptIn() {
		const el = document.querySelector('#home-newsletter input[type=email]');
		el?.scrollIntoView({ behavior: 'smooth' });
		el?.focus({ preventScroll: true });
	}
</script>

<svelte:head>
	<title>Trading Strategy - Algorithmic Trading Protocol</title>
	<meta name="description" content="DeFi market data and systematic trading" />
	{@html sitelinksSearchBox()}
</svelte:head>

<main class="home-page">
	<HomeHeroBanner {impressiveNumbers} />

	{#if topMomentum}
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
	{/if}

	<Section class="strategies" layout="boxed" padding="lg">
		<div class="inner">
			<h2>Strategies</h2>
			<Illustration name="bull-vs-bear" height="min(30vh, 20rem)" />
			<div class="coming-soon">Coming soon</div>
			<p>Follow us to be the first to know when our automated trading strategies go live.</p>
			<div class="ctas">
				<Button icon="newspaper" label="Subscribe to newsletter" on:click={scrollToNewsletterOptIn} />
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
				padding: var(--space-xl);
				place-content: center;
				place-items: center;
				text-align: center;

				& h2 {
					font: var(--f-heading-lg-medium);
					@media (--viewport-md-up) {
						font: var(--f-heading-xl-medium);
					}
				}

				@media (--viewport-md-up) {
					margin-top: var(--space-ss);
					padding: var(--space-5xl);
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
			width: 100%;

			@media (--viewport-sm-down) {
				flex-direction: column;

				& .button {
					width: 100%;
				}
			}
		}

		& :global .illustration {
			display: none;
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

<!--
	Home page
-->
<script lang="ts">
	import type { PageData } from './$types';
	import HomeHeroBanner from './HomeHeroBanner.svelte';
	import { BlogRoll, Button, Illustration, Section, SummaryBox } from '$lib/components';
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

	<Section title="Strategies" class="strategies" layout="boxed" padding="md">
		<div class="inner">
			<div class="coming-soon">Coming soon</div>
			<p>Sign up to the Trading Strategy newsletter and be the first to know when strategies are live.</p>
			<Button label="Sign up now" href="/newsletter" />
		</div>
	</Section>

	<Section class="newsletter" layout="boxed" padding="md">
		<NewsletterOptInBanner />
	</Section>

	{#if posts}
		<Section title="Blog" class="blog" layout="boxed" padding="md">
			<BlogRoll {posts} />
			<Button label="Read more on Blog" href="/blog" slot="footer" />
		</Section>
	{/if}
</main>

<style lang="postcss">
	.home-page :global {
		& .strategies {
			background-color: hsla(var(--hsla-background-accent-1));

			& .inner {
				display: grid;
				gap: var(--space-5xl);
				place-content: center;
				place-items: center;
				text-align: center;

				@media (--viewport-md-up) {
					margin-top: var(--space-ss);
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

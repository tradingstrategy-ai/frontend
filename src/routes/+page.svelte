<!--
	Home page
-->
<script lang="ts">
	import type { PageData } from './$types';
	import HomeHeroBanner from './home/HeroBanner.svelte';
	import TopMomentumTile from './TopMomentumTile.svelte';
	import { BlogPostTile, Button, Section, SummaryBox, TopTradesTable } from '$lib/components';
	import { toggleSubscribeDialog } from '$lib/newsletter/controller';
	import { sitelinksSearchBox } from '$lib/helpers/googleMeta';

	export let data: PageData;

	const { topMomentum, impressiveNumbers, posts } = data;

	$: console.log('topMomentum', topMomentum);
</script>

<svelte:head>
	<title>Trading Strategy - Algorithmic Trading Protocol</title>
	<meta name="description" content="DeFi market data and systematic trading" />
	{@html sitelinksSearchBox()}
</svelte:head>

<main>
	<HomeHeroBanner {impressiveNumbers} />

	<Section class="top-trades" layout="boxed" title="Top trades" cols={2} gap="lg">
		<SummaryBox title="Most profitable 24h">
			<Button sm slot="cta" href="/trading-view/top-list/daily-up">View all winning pairs</Button>
			<TopTradesTable pairs={topMomentum.top_up_24h_min_liq_1m} />
		</SummaryBox>

		<SummaryBox title="Worst performance 24h">
			<Button sm slot="cta" href="/trading-view/top-list/daily-down">View all losing pairs</Button>
			<TopTradesTable pairs={topMomentum.top_down_24h_min_liq_1m} />
		</SummaryBox>
	</Section>

	<Section title="Strategies" class="strategies" layout="boxed">
		<div class="inner">
			<div class="coming-soon">Coming soon</div>
			<p>Sign up to the Trading Strategy newsletter and be the first to know when strategies are live.</p>
			<Button label="Sign up now" on:click={toggleSubscribeDialog} />
		</div>
	</Section>

	{#if posts}
		<Section class="ds-container blog" gap="lg" layout="boxed" title="Blog" cols={2}>
			{#each posts as post (post.id)}
				<BlogPostTile
					title={post.title}
					excerpt={post.excerpt}
					imageUrl={post.feature_image}
					imageAltText={post.feature_image_alt}
					slug={post.slug}
					publishedAt={post.published_at}
				/>
			{/each}

			<div class="cta" slot="footer">
				<Button label="Read more on blog" href="/blog" />
			</div>
		</Section>
	{/if}
</main>

<style lang="postcss">
	:global(.strategies) :global {
		background-color: hsla(var(--hsla-v2-background-accent-1));
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
			font: var(--f-h5-roman);
		}
	}
</style>

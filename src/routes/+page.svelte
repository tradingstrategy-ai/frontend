<!--
	Home page
-->
<script lang="ts">
	import type { PageData } from './$types';
	import HeroBanner from './HeroBanner.svelte';
	import TopMomentumTile from './TopMomentumTile.svelte';
	import { BlogPostTile, Button, HeroVideo } from '$lib/components';
	import { toggleSubscribeDialog } from '$lib/newsletter/controller';
	import { sitelinksSearchBox } from '$lib/helpers/googleMeta';

	export let data: PageData;

	const { topMomentum, impressiveNumbers, posts } = data;
</script>

<svelte:head>
	<title>Trading Strategy - Algorithmic Trading Protocol</title>
	<meta name="description" content="DeFi market data and systematic trading" />
	{@html sitelinksSearchBox()}
</svelte:head>

<main>
	<HeroBanner {impressiveNumbers} />

	{#if topMomentum}
		<section class="ds-container top-momentum" style:gap="var(--space-lg)">
			<h2>Top trades</h2>
			<div class="ds-2-col">
				<TopMomentumTile
					name="Most profitable 24h"
					pairs={topMomentum.top_up_24h_min_liq_1m}
					linkTarget="/trading-view/top-list/daily-up"
					linkLabel="View all winning pairs"
				/>
				<TopMomentumTile
					name="Worst performance 24h"
					pairs={topMomentum.top_down_24h_min_liq_1m}
					linkTarget="/trading-view/top-list/daily-down"
					linkLabel="View all losing pairs"
				/>
			</div>
		</section>
	{/if}

	<HeroVideo youTubeId="iPXuqwYDv9U" title="Trading Strategy intro video" />

	<section class="ds-container strategies">
		<h2>Strategies</h2>
		<div>
			<div class="coming-soon">Coming soon</div>
			<p>Sign up to the Trading Strategy newsletter and be the first to know when strategies are live.</p>
			<Button label="Sign up now" on:click={toggleSubscribeDialog} />
		</div>
	</section>

	{#if posts}
		<section class="ds-container blog">
			<h2>Blog</h2>

			<div class="blog-posts">
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
			</div>

			<div class="cta">
				<Button label="Read more on blog" href="/blog" />
			</div>
		</section>
	{/if}
</main>

<style lang="postcss">
	section {
		padding-block: var(--space-xxxl);

		@media (--viewport-md-up) {
			padding-block: 4rem;
		}
	}

	h2 {
		text-align: center;
	}

	.top-momentum h2 {
		@media (--viewport-md-up) {
			margin-bottom: var(--space-xxxl);
		}
	}

	.strategies {
		gap: var(--space-xxxl);

		& > div {
			display: flex;
			flex-direction: column;
			align-items: center;
			text-align: center;
			gap: 4rem;

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

	.blog {
		gap: var(--space-xxxl);
		justify-items: center;
		padding-block: 4.5rem;
	}

	.blog-posts {
		display: grid;
		gap: var(--space-xxxl);

		@media (--viewport-md-up) {
			margin-top: var(--space-xl);
			grid-template-columns: 1fr 1fr;
		}

		@media (width >= 1148px) {
			grid-template-columns: 1fr 1fr 1fr;
			grid-template-rows: auto 0;
			overflow: hidden;
		}
	}
</style>

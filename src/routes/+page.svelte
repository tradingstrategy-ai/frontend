<!--
	Home page
-->
<script context="module">
	import config from '$lib/config';
	import getGhostClient from '$lib/blog/client';

	// Load top momentum data to display on the front page
	// https://tradingstrategy.ai/api/explorer/#/Trading%20signal/web_top_momentum
	export async function load({ fetch }) {
		const { backendUrl } = config;
		const ghostClient = getGhostClient(config.ghost);

		// Load frontpage API calls in parallel to cut that 1 ms
		// https://stackoverflow.com/q/59663929/315168
		const [momentumResp, impressiveNumbersResp, posts] = await Promise.all([
			fetch(`${backendUrl}/top-momentum?summary=true`),
			fetch(`${backendUrl}/impressive-numbers`),
			ghostClient.posts?.browse({ limit: 4 })
		]);

		let topMomentum, impressiveNumbers;

		// Gracefully degrade if API fails
		if (momentumResp.ok) {
			topMomentum = await momentumResp.json();
		}

		// Gracefully degrade if API fails
		if (impressiveNumbersResp.ok) {
			impressiveNumbers = await impressiveNumbersResp.json();
		}

		return {
			// Cache the landing data for 5 minutes at the Cloudflare edge,
			// so the pages are served really fast if they get popular,
			// and also for speed test
			cache: {
				maxage: 5 * 60, // 5 minutes
				private: false
			},
			props: { topMomentum, impressiveNumbers, posts }
		};
	}
</script>

<script>
	import TopMomentum from '$lib/content/TopMomentum.svelte';
	import ImpressiveNumbers from '$lib/content/ImpressiveNumbers.svelte';
	import BlogPostTile from '$lib/components/BlogPostTile.svelte';
	import Button from '$lib/components/Button.svelte';
	import { sitelinksSearchBox } from '$lib/helpers/googleMeta';
	import { goto } from '$app/navigation';

	export let topMomentum;
	export let impressiveNumbers;
	export let posts;

	function doSecretNavigation() {
		goto('/strategy');
	}
</script>

<svelte:head>
	<title>Trading Strategy - Algorithmic Trading Protocol</title>
	<meta name="description" content="DeFi market data and systematic trading" />
	{@html sitelinksSearchBox()}
</svelte:head>

<main>
	<header class="ds-container" on:dblclick={doSecretNavigation}>
		<div>
			<h1>
				<div>Next generation</div>
				<div>algorithmic trading protocol</div>
				<div class="secondary">for decentralised markets</div>
			</h1>

			{#if impressiveNumbers}
				<ImpressiveNumbers numbers={impressiveNumbers} />
			{/if}
		</div>
	</header>

	{#if topMomentum}
		<section class="ds-container top-momentum" style:gap="1.5rem">
			<h2>Top trades</h2>
			<div class="ds-2-col">
				<TopMomentum
					name="Most profitable 24h"
					pairs={topMomentum.top_up_24h_min_liq_1m}
					linkTarget="/trading-view/top-list/daily-up"
					linkLabel="View all winning pairs"
				/>
				<TopMomentum
					name="Worst performance 24h"
					pairs={topMomentum.top_down_24h_min_liq_1m}
					linkTarget="/trading-view/top-list/daily-down"
					linkLabel="View all losing pairs"
				/>
			</div>
		</section>
	{/if}

	<section class="ds-container strategies">
		<h2>Strategies</h2>
		<div>
			<div class="coming-soon">Coming soon</div>
			<p>Sign up to the Trading Strategy newsletter and be the first to know when strategies are live.</p>
			<Button label="Sign up now" href="https://newsletter.tradingstrategy.ai/" />
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

<style>
	header {
		--container-margin: 2rem;
		background: var(--c-background-1);
		padding-block: 3.5rem;
	}

	h1 {
		font: var(--f-h1-bold);
		margin-bottom: 2rem;
	}

	.secondary {
		color: var(--c-text-2);
	}

	section {
		padding-block: 2.5rem;
	}

	h2 {
		text-align: center;
	}

	.strategies {
		gap: 2.5rem;
	}

	.strategies > div {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 4rem;
	}

	.strategies .coming-soon {
		font: 500 var(--fs-ui-sm);
		color: var(--c-text-2);
		letter-spacing: 0.02em;
		text-transform: uppercase;
		padding: 0.75rem 1.25rem;
		border: 1px solid var(--c-parchment-super-dark);
		border-radius: 2rem;
	}

	.strategies p {
		font: var(--f-h5-roman);
	}

	.blog {
		gap: 2.5rem;
		justify-items: center;
		padding-block: 4.5rem;
	}

	.blog-posts {
		display: grid;
		gap: 2.5rem;
	}

	@media (--viewport-md-up) {
		header {
			padding-block: 12rem;
			text-align: center;
		}

		h1 {
			font: 600 56px/68px var(--ff-display);
			margin-bottom: 3.5rem;
		}

		.top-momentum h2 {
			margin-bottom: 2.5rem;
		}

		section {
			padding-block: 4rem;
		}

		.strategies > div {
			margin-top: 0.5rem;
		}

		.blog-posts {
			margin-top: 2rem;
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (width >= 1148px) {
		.blog-posts {
			grid-template-columns: 1fr 1fr 1fr;
			grid-template-rows: auto 0;
			overflow: hidden;
		}
	}
</style>

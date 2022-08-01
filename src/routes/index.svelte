<script context="module">
	/**
	 * Frontpage renderer
	 */
	import getGhostClient from '$lib/blog/client';

	// Load top momentum data to display on the front page
	// https://tradingstrategy.ai/api/explorer/#/Trading%20signal/web_top_momentum
	export async function load({ fetch, session }) {
		const { backendUrl } = session.config;
		const ghostClient = getGhostClient(session.config.ghost);

		// Load frontpage API calls in parallel to cut that 1 ms
		// https://stackoverflow.com/q/59663929/315168
		const [momentumResp, impressiveNumbersResp, posts] = await Promise.all([
			fetch(`${backendUrl}/top-momentum?summary=true`),
			fetch(`${backendUrl}/impressive-numbers`),
			ghostClient.posts?.browse({ limit: 3 })
		]);

		let topMomentum, impressiveNumbers;

		if (momentumResp.ok) {
			topMomentum = await momentumResp.json();
		} else {
			// Try render the frontpage even if the backend is down
			topMomentum = null;
		}

		if (impressiveNumbersResp.ok) {
			impressiveNumbers = await impressiveNumbersResp.json();
		} else {
			// Try render the frontpage even if the backend is down
			impressiveNumbers = null;
		}

		return {
			// Cache the landing data for 5 minutes at the Cloudflare edge,
			// so the pages are served really fast if they get popular,
			// and also for speed test
			maxage: 5 * 60, // 5 minutes,
			props: { topMomentum, impressiveNumbers, posts }
		};
	}
</script>

<script>
	import TopMomentum from '$lib/content/TopMomentum.svelte';
	import ImpressiveNumbers from '$lib/content/ImpressiveNumbers.svelte';
	import BlogPreviewCard from '$lib/blog/BlogPreviewCard.svelte';
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
	<title>Trading Strategy - Algorithmic trading strategy protocol</title>
	<meta name="description" content="DeFi market data and systematic trading" />
	{@html sitelinksSearchBox()}
</svelte:head>

<main>
	<header class="ds-container" on:dblclick={doSecretNavigation}>
		<div>
			<h1>
				<div>Next Generation</div>
				<div>Algorithmic Trading Protocol</div>
				<div class="secondary">for Decentralised Markets</div>
			</h1>

			{#if impressiveNumbers}
				<ImpressiveNumbers numbers={impressiveNumbers} />
			{/if}
		</div>
	</header>

	{#if topMomentum}
		<section class="top-momentum">
			<div class="container">
				<div class="row">
					<div class="col-md-12">
						<h3 class="heading-momentum text-center">Top trades</h3>
						<TopMomentum momentumDetails={topMomentum} />
					</div>
				</div>
			</div>
		</section>
	{/if}

	<section class="pool-preview">
		<div class="container">
			<div class="row">
				<div class="col-md-12 strategy-cards">
					<h3 class="heading-strategies text-center">Strategies</h3>

					<p class="lead coming-soon">
						<span class="badge text-uppercase">Coming soon</span>
					</p>

					<p class="lead coming-soon">Invest in non-custodial, active, trading strategies run by the oracle network.</p>
				</div>
			</div>
		</div>
	</section>

	{#if posts}
		<section class="blog">
			<div class="container">
				<h3 class="heading-blog text-center">Blog</h3>
				<div class="card-deck d-block d-lg-flex">
					{#each posts as post (post.id)}
						<BlogPreviewCard {post} layout="compact" />
					{/each}
				</div>
				<p class="text-center blog-all">
					<a class="btn" href="/blog/">View blog</a>
				</p>
			</div>
		</section>
	{/if}
</main>

<style>
	header {
		--ds-container-margin: 2rem;
		background: var(--c-parchment-dark);
		padding-top: 3.5rem;
		padding-bottom: 3.5rem;
	}

	h1 {
		font: var(--f-h1-bold);
		margin-bottom: 2rem;
	}

	h1 .secondary {
		color: var(--c-gray-dark);
	}

	.heading-strategies,
	.heading-momentum {
		margin-top: 60px;
	}

	.heading-blog {
		margin: 60px 0;
	}

	.coming-soon {
		text-align: center;
	}

	.pool-preview :global(.card) {
		margin: 60px 0;
	}

	.heading-momentum {
		margin-bottom: 60px;
	}

	.top-momentum :global(.card) {
		margin: 20px 0;
	}

	.blog {
		margin-bottom: 60px;
	}

	.blog-all {
		margin-top: 40px;
	}

	@media (--viewport-md-up) {
		header {
			padding-top: 12rem;
			padding-bottom: 12rem;
			text-align: center;
		}

		h1 {
			font: 600 56px/68px var(--ff-display);
			margin-bottom: 3.5rem;
		}
	}
</style>

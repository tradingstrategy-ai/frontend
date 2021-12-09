<script context="module">
	/**
	 * Frontpage renderer
	 */
    import { backendUrl } from '$lib/config';
	import {fetchBlogroll} from "$lib/blog/feed";

	// Load top momentum data to display on the front page
    // https://tradingstrategy.ai/api/explorer/#/Trading%20signal/web_top_momentum
    export async function load({ page, fetch }) {

		// Load frontpage API calls in parallel to cut that 1 ms
		// https://stackoverflow.com/q/59663929/315168
        const [momentumResp, impressiveNumbersResp, posts] = await Promise.all([fetch(`${backendUrl}/top-momentum`), fetch(`${backendUrl}/impressive-numbers`), fetchBlogroll(3)]);

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
            props: {
                topMomentum,
				impressiveNumbers,
				posts
            }
        };
    }
</script>

<script>
	import PoolPreviewEthLisbon from '$lib/pool/PoolPreviewEthLisbon.svelte';
	import TopMomentum from '$lib/content/TopMomentum.svelte';
	import ImpressiveNumbers from "$lib/content/ImpressiveNumbers.svelte";
	import '$lib/styles/bodytext.css';
	import HomeBlogroll from "$lib/content/HomeBlogroll.svelte";

	export let topMomentum;
	export let impressiveNumbers;
	export let posts;
</script>

<svelte:head>
	<title>TradingStrategy.ai - Algorithmic trading strategy protocol</title>
	<meta name="description" content="DeFi quantitative investing and trading">
</svelte:head>


<main>
	<section class="card-home card-jumbo">
		<div class="container">
			<h1>Algorithmic trading protocol for decentralised markets</h1>

			{#if impressiveNumbers}
				<ImpressiveNumbers numbers={impressiveNumbers} />
			{/if}
		</div>
	</section>

	{#if topMomentum}
		<section class="top-momentum">
			<div class="container">
				<div class="row">
					<div class="col-md-12">
						<h3 class="heading-momentum text-center">Top trades today</h3>
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

					<p class="lead coming-soon">
						Invest in non-custodial, active, trading strategies run by the oracle network.
					</p>

					<PoolPreviewEthLisbon
						title="EthLisbon Aave 👻 boosted 🔥 Double Seven"
						description="A volatility trading strategy that keeps capital accruing interest in Aave USDC pool when the strategy does not have a trading position open."
						tradesOn="1inch on Polygon"
						learnLink="https://tradingstrategy.ai/docs/programming/algorithms/double-7.html"
						preview={true} />


				</div>
			</div>
		</div>
	</section>

	{#if posts}
		<section class="blog">
			<div class="container">
				<h3 class="heading-blog text-center">Blog</h3>
				<HomeBlogroll {posts} />
			</div>
		</section>
	{/if}

</main>

<style>

	main {
		min-height: 100vw;
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center center;
	}

	.card-jumbo {
		background: #F2DFCE;
		box-shadow: none;
		padding: 60px 0;
	}

	.card-jumbo p {
		text-align: center;
	}

	h1 {
		width: 100%;
		color: black;
		font-size: 2.3rem;
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

	svg {
		max-height: 160px;
		margin: 0 auto;
	}

	@media(max-width: 768px) {
		svg {
			display: none;
		}
	}

</style>

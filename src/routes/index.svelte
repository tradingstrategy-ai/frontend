<script context="module">
	/**
	 * Frontpage renderer
	 */
    import { backendUrl } from '$lib/config';

	// Load top momentum data to display on the front page
    // https://tradingstrategy.ai/api/explorer/#/Trading%20signal/web_top_momentum
    export async function load({ page, fetch }) {

		// Load frontpage API calls in parallel to cut that 1 ms
		// https://stackoverflow.com/q/59663929/315168
        const [momentumResp, impressiveNumbersResp] = await Promise.all([fetch(`${backendUrl}/top-momentum`), fetch(`${backendUrl}/impressive-numbers`)]);

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
				impressiveNumbers
            }
        };
    }
</script>

<script>
	import PoolPreview from '$lib/pool/PoolPreview.svelte';
	import PoolPreviewEthLisbon from '$lib/pool/PoolPreviewEthLisbon.svelte';
	import '$lib/styles/bodytext.css';
	import ElevatorPitch from '$lib/content/ElevatorPitch.svelte';
	import TopMomentum from '$lib/content/TopMomentum.svelte';
	import ImpressiveNumbers from "$lib/site/ImpressiveNumbers.svelte";

	export let topMomentum;
	export let impressiveNumbers;
</script>

<svelte:head>
	<title>TradingStrategy.ai - Algorithmic trading strategy protocol</title>
	<meta name="description" content="DeFi quantitative investing and trading">
</svelte:head>


<main>
	<section class="card-home card-jumbo">
		<div class="container">
			<h1>Algorithmic trading protocol for decentralised markets</h1>

			<p>Invest in ready-made strategies or offer your own trading strategies run by a decentralised oracle network</p>
		</div>
	</section>

	<section class="pool-preview">
		<div class="container">
			<div class="row">
				<div class="col-md-12 strategy-cards">

					<h3 class="heading-strategies text-center">Strategies</h3>

					<PoolPreviewEthLisbon
						title="EthLisbon Aave 👻 boosted 🔥 Double Seven"
						description="A volatility trading strategy that keeps capital accruing interest in Aave USDC pool when the strategy does not have a trading position open."
						tradesOn="1inch on Polygon"
						learnLink="https://tradingstrategy.ai/docs/programming/algorithms/double-7.html"
						preview={true} />

					<PoolPreview
						title="ETH-USDC double seven"
						description="A school book strategy for a single trading pair volatility trading by using closing price momentum."
						tradesOn="Sushiswap on Ethereum"
						learnLink="https://tradingstrategy.ai/docs/programming/algorithms/double-7.html"
						preview={true} />

					<PoolPreview
						title="Pancake momentum"
						description="A momentum portfolio strategy for low cap tokens."
						tradesOn="PancakeSwap on Binance Smart Chain"
						learnLink={null}
						preview={true} />

				</div>
			</div>
		</div>
	</section>

	{#if topMomentum}
		<section class="top-momentum">
			<div class="container">
				<div class="row">
					<div class="col-md-12">
						<h3 class="heading-momentum text-center">Top momentum</h3>
							<TopMomentum momentumDetails={topMomentum} />
					</div>
				</div>
			</div>
		</section>
	{/if}

	{#if impressiveNumbers}
		<section class="network-status">
			<div class="container">
				<div class="row">
					<div class="col-md-12">
						<ImpressiveNumbers numbers={impressiveNumbers} />
					</div>
				</div>
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
		text-align: center;
		font-size: 2.3rem;
	}

	.heading-strategies {
		margin-top: 60px;
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

	.network-status {
		margin: 60px 0;
		padding: 60px 0;
		background: #80DEEA;
	}

	.learn-more {
		padding-bottom: 60px;
	}

	.image-wrapper {
	  display: flex;
	  align-items: center;
	  height: 100%;
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

	.pulse {
	  display: inline-block;
	  width: 16px;
	  height: 16px;
	  border-radius: 50%;
	  background: #f0f0f0;
	  cursor: pointer;
	  box-shadow: 0 0 0 rgba(255,255,255, 0.4);
	  animation: pulse 2s infinite;
	}
	.pulse:hover {
	  animation: none;
	}

	@-webkit-keyframes pulse {
	  0% {
		-webkit-box-shadow: 0 0 0 0 rgba(0, 0, 255, 0.4);
	  }
	  70% {
		  -webkit-box-shadow: 0 0 0 10px rgba(0,0,255, 0);
	  }
	  100% {
		  -webkit-box-shadow: 0 0 0 0 rgba(0,0,255, 0);
	  }
	}
	@keyframes pulse {
	  0% {
		-moz-box-shadow: 0 0 0 0 rgba(0,0,255, 0.4);
		box-shadow: 0 0 0 0 rgba(0,0,255, 0.4);
	  }
	  70% {
		  -moz-box-shadow: 0 0 0 10px rgba(0,0,255, 0);
		  box-shadow: 0 0 0 10px rgba(0,0,255, 0);
	  }
	  100% {
		  -moz-box-shadow: 0 0 0 0 rgba(0,0,255, 0);
		  box-shadow: 0 0 0 0 rgba(0,0,255, 0);
	  }
	}
</style>

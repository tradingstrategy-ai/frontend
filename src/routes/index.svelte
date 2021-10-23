<script context="module">
    import { backendUrl } from '$lib/config';

	// Load top momentum data to display on the front page
    // https://tradingstrategy.ai/api/explorer/#/Trading%20signal/web_top_momentum
    export async function load({ page, fetch }) {

        const apiUrl = `${backendUrl}/top-momentum`;

        const resp = await fetch(apiUrl);

		let topMomentum;

        if (!resp.ok) {
			// Try render the frontpage even if the backend is down
			topMomentum = null;
        } else {
			topMomentum = await resp.json();
		}

        return {
            props: {
                topMomentum
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

	export let topMomentum;
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

	<section class="network-status">
		<div class="container">
			<div class="row">
				<div class="col-md-12">
					<h3>Trading Strategy network status</h3>

					<p class="lead">
						<span class="pulse"></span> Currently running <strong>1</strong> oracle nodes, connected to <strong>1</strong> blockchains, <strong>264</strong> decentralised exchanges with <strong>57,359</strong> trading pairs and <strong>48,863</strong> tokens.
						Automated trading strategies make decisions based on <strong>181 GB</strong> oracle data.
					</p>
				</div>
			</div>
		</div>
	</section>

	<section class="learn-more">
		<div class="container">
			<div class="row">
				<div class="col-md-8">
					<h3>About Trading Strategy protocol</h3>

					<ElevatorPitch />
				</div>
				<div class="col-md-4">

					<div class="image-wrapper">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250">
						<g transform="matrix(10.416666666666666,0,0,10.416666666666666,0,0)"><g>
							<path d="M18.09,18.48a1.59,1.59,0,0,0,1.46-1.36A1.32,1.32,0,0,0,19.14,16a4.51,4.51,0,0,0-1.65-.77,2.11,2.11,0,0,1-.59-.26.39.39,0,0,1-.21-.27c-.06-.49.3-.68.73-.72A2.85,2.85,0,0,1,19,14.3a.29.29,0,1,0,.32-.48,3.35,3.35,0,0,0-.8-.41l.06-.08a1,1,0,0,0,.11-.23,1.84,1.84,0,0,0,.05-.25c.11-.89,0-1-.15-1s-.33-.09-.82.68a1,1,0,0,0-.12.23.62.62,0,0,0-.06.26,1.2,1.2,0,0,0,0,.19,3.15,3.15,0,0,0-.69,0,1.38,1.38,0,0,0-1.23,1.53,1.33,1.33,0,0,0,.57,1.06,6.25,6.25,0,0,0,1.59.69c.32.12.65.2.62.55s-.45.54-.89.58A2.82,2.82,0,0,1,16,17.32,1.27,1.27,0,0,1,15.7,17a2.16,2.16,0,0,1-.26-.47.33.33,0,0,0-.43-.17.32.32,0,0,0-.17.43,2.86,2.86,0,0,0,.36.72,1.9,1.9,0,0,0,.42.43,2.6,2.6,0,0,0,.44.23l0,0a1.13,1.13,0,0,0-.11.22,1.23,1.23,0,0,0-.05.25c-.12.9,0,1,.15,1s.33.09.82-.68a1.27,1.27,0,0,0,.12-.23,1.22,1.22,0,0,0,.06-.26v-.1A3.85,3.85,0,0,0,18.09,18.48Z" style="fill: #458b00;fill-rule: evenodd"></path>
							<path d="M9.79,10.94a1,1,0,0,0-.4-.51.35.35,0,0,0,.07-.15C9.52,8.55,11,7.46,11.63,6a3.45,3.45,0,0,0,.11-2.37,8.21,8.21,0,0,0-.29-.78A6.51,6.51,0,0,0,11,2.13C9.73.18,7-.37,4.59.27S.09,2.71,0,5.12A3.23,3.23,0,0,0,1,7.67,17.23,17.23,0,0,0,3.46,9.34a3.2,3.2,0,0,1,1.6,2c0,.05.05.07.07.11a.27.27,0,0,0-.07.26.28.28,0,0,0,.35.2L8,11.53c.19,0,.48-.12.76-.18l.23,0a6,6,0,0,1,0,1.23,6.25,6.25,0,0,1,.11.93.72.72,0,0,1-.09.37,1.57,1.57,0,0,1-1.39.71,1.6,1.6,0,0,1-1.42-.78l-.06-.14c.2,0,.41,0,.62,0a2.56,2.56,0,0,0,.78-.18c1.11-.41,1.18-.52,1.13-.76s-.18-.33-1.35-.25a2.44,2.44,0,0,0-.39,0,2.34,2.34,0,0,0-.4.11,7,7,0,0,0-.67.34,3.25,3.25,0,0,1-.17-.61.33.33,0,0,0-.38-.27.31.31,0,0,0-.27.37,5.12,5.12,0,0,0,.17.85,7.22,7.22,0,0,0,.29.82,2.44,2.44,0,0,0,2.08,1.41A2.59,2.59,0,0,0,10,14.46a1.63,1.63,0,0,0,.25-.73,5.32,5.32,0,0,0-.11-1.35A8.43,8.43,0,0,0,9.79,10.94Zm-1.15-.53c-.3.08-.62.24-.83.3l-2.18.54s0,0,0,0c-.33-2.06-2.69-2.75-4-4.15A2.36,2.36,0,0,1,1,5.17c.12-2,1.92-3.31,3.92-3.83s4.25-.25,5.35,1.34c.13.19.25.39.36.59a5.3,5.3,0,0,1,.28.65,2.55,2.55,0,0,1,0,1.79c-.56,1.53-2,2.75-2,4.56a.36.36,0,0,0,0,.11Z" style="fill: #458b00;fill-rule: evenodd"></path>
							<path d="M23.38,13a6.39,6.39,0,0,0-3.17-2.78A7.21,7.21,0,0,0,16,9.64a7.16,7.16,0,0,0-5.14,4.19,5.68,5.68,0,0,0,1.31,6.37,8.25,8.25,0,0,0,1,.86,5.23,5.23,0,0,0,1.17.66,5.29,5.29,0,0,0,1.52.32,11,11,0,0,0,2.24-.12.29.29,0,0,0,.25-.33.28.28,0,0,0-.32-.25,9.26,9.26,0,0,1-2.11.05,4.13,4.13,0,0,1-1.31-.32,4.64,4.64,0,0,1-1-.61,8.44,8.44,0,0,1-.87-.82,4.82,4.82,0,0,1-.92-5.4,6.18,6.18,0,0,1,4.4-3.52,6.18,6.18,0,0,1,3.55.45,5.41,5.41,0,0,1,2.74,2.25,5.3,5.3,0,0,1,.2,4.47A5.19,5.19,0,0,1,19.45,21a.33.33,0,0,0,.18.63,5.89,5.89,0,0,0,3.83-3.45A6.19,6.19,0,0,0,23.38,13Z" style="fill: #458b00;fill-rule: evenodd"></path>
							<path d="M15.62,4.56c.26.39.55.77.83,1.12a.31.31,0,0,0,.45.08A.32.32,0,0,0,17,5.31q-.36-.57-.66-1.17c-.21-.39-.39-.8-.56-1.2q0-.12-.06-.21a8.3,8.3,0,0,1,2.51,1,6.48,6.48,0,0,1,1.08.84,4,4,0,0,1,.82,1,4,4,0,0,1,.38.9c.15.53.25,1.08.37,1.59a.28.28,0,0,0,.33.24A.29.29,0,0,0,21.44,8c0-.55-.05-1.12-.13-1.68A5.22,5.22,0,0,0,21,5.16a4.87,4.87,0,0,0-1.73-2,7.23,7.23,0,0,0-2.67-1A12.67,12.67,0,0,1,18,1.82a14.58,14.58,0,0,1,1.85-.22.28.28,0,0,0,.3-.27.3.3,0,0,0-.28-.3A11.71,11.71,0,0,0,17.5,1a10.58,10.58,0,0,0-1.59.28,6.25,6.25,0,0,0-.87.27,1.24,1.24,0,0,0-.52.39.66.66,0,0,0-.1.52,5.89,5.89,0,0,0,.46.94C15.1,3.78,15.36,4.17,15.62,4.56Z" style="fill: #cc0000;fill-rule: evenodd"></path>
							<path d="M9,20.81c-.19-.19-.45-.38-.59-.52l-2.17-2a.28.28,0,0,0-.4,0,.28.28,0,0,0,0,.41l1.79,2.27a7,7,0,0,1-4.08-1.5A5,5,0,0,1,2,17.51a4.31,4.31,0,0,1-.31-2.45,3.36,3.36,0,0,1,.2-.77,5.4,5.4,0,0,1,.33-.74.29.29,0,0,0-.08-.4.3.3,0,0,0-.4.09,5.87,5.87,0,0,0-.47.79A6,6,0,0,0,1,14.9a4.88,4.88,0,0,0,.07,3,5.3,5.3,0,0,0,1.84,2.4A7.37,7.37,0,0,0,7.3,21.65L4.07,23.36a.33.33,0,0,0-.18.42.34.34,0,0,0,.44.18c.74-.26,1.48-.54,2.21-.84L8,22.51c.08,0,.75-.36,1-.5a.66.66,0,0,0,.32-.79A1.41,1.41,0,0,0,9,20.81Z" style="fill: #cc0000;fill-rule: evenodd"></path>
						  </g></g></svg>
					</div>
				</div>

				<div class="col-md-12">

					<p>
						<a class="body-link" href="/about">Learn more</a>
						•
						<a class="body-link" href="mailto:info@tradingstrategy.ai">Contact for business inquiries</a>

					</p>
				</div>
			</div>
		</div>
	</section>
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
		background: #80DEEA;
		padding: 60px 0;
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

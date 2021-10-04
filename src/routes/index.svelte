<script>
	import PoolPreview from '$lib//pool/PoolPreview.svelte';
	import '$lib/styles/bodytext.css';
</script>

<svelte:head>
	<title>TradingStrategy.ai - Algorithmic trading strategy protocol</title>
	<meta name="description" content="On-chain systematic investing and trading">
</svelte:head>


<main>
	<section class="card-home card-jumbo">
		<div class="container">
			<h1>Algorithmic trading strategy protocol</h1>

			<p>Invest and offer active trading strategies run by a decentralised oracle network</p>
		</div>
	</section>

	<section class="pool-preview">
		<div class="container">
			<div class="row">
				<div class="col-md-12 strategy-cards">
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
				<div class="col-md-12">
					<h3>About Trading Strategy</h3>

					<p>
						Trading Strategy is a decentralised protocol for the next generation quantitative finance. Easy-to-accesss automated strategies allow traders to invest with higher profit and lower risk.
						Strategies are run by a decentralised oracles. On-chain smart contract based asset management. Trading Strategy protocol disrupts
						centralised exchange, broker and hedge funds by giving investors direct access to high quality investing strategies and real-time control over their assets.
					</p>

					<p>
						<a class="body-link" rel="external" href="https://tradingstrategy.ai/docs/protocol/comparison.html">How Trading Strategy is different</a>
						•
						<a class="body-link" rel="external"  href="https://tradingstrategy.ai/docs/index.html">Learn how the protocol works</a>
						•
						<a class="body-link" rel="external" href="https://tradingstrategy.ai/docs/programming/examples/getting-started.html">Become a strategy developer to earn</a>
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
	}
	.pool-preview :global(.card) {
		margin: 60px 0;
	}

	.network-status {
		margin: 60px 0;
		background: #80DEEA;
		padding: 60px 0;
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
		-webkit-box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
	  }
	  70% {
		  -webkit-box-shadow: 0 0 0 10px rgba(255,255,255, 0);
	  }
	  100% {
		  -webkit-box-shadow: 0 0 0 0 rgba(255,255,255, 0);
	  }
	}
	@keyframes pulse {
	  0% {
		-moz-box-shadow: 0 0 0 0 rgba(255,255,255, 0.4);
		box-shadow: 0 0 0 0 rgba(255,255,255, 0.4);
	  }
	  70% {
		  -moz-box-shadow: 0 0 0 10px rgba(255,255,255, 0);
		  box-shadow: 0 0 0 10px rgba(255,255,255, 0);
	  }
	  100% {
		  -moz-box-shadow: 0 0 0 0 rgba(255,255,255, 0);
		  box-shadow: 0 0 0 0 rgba(255,255,255, 0);
	  }
	}
</style>

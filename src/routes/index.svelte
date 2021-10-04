<script>
	import PoolPreview from '$lib//pool/PoolPreview.svelte';
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

	<section class="section-pool-preview">
		<div class="container">
			<div class="row">
				<div class="col-md-6">
					<PoolPreview
						title="ETH-USDC on"
						preview={true} />
				</div>

				<div class="col-md-6">
					<PoolPreview
						title="CAKE-USDC on PancakeSwap"
						preview={true} />

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
	.section-pool-preview :global(.card) {
		margin: 60px 0;
	}
</style>

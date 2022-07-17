<script lang="ts">
	import Feature from './_Feature.svelte';
</script>

<section class="container">
	<div class="row">
		<div class="col text-center">
			<h2>The Trading Strategy protocol</h2>
			<p>Trading Strategy is the first protocol replacing investment managers with code.</p>
			<p>
				<a href="https://tradingstrategy.ai/docs/protocol/comparison.html">Read how</a>
				Trading Strategy protocol compares to yield farming and quantative hedge funds.
			</p>
		</div>
	</div>

	<Feature title="Active on-chain trading" image="blockchain-as-train.svg">
		<li>
			Protocol is fully compatible with 1M+ trading pairs on all major decentralised markets and blockchains such as
			Uniswap, PancakeSwap on Ethereum, Polygon and Binance Smart Chain
		</li>
		<li>
			Market signal analysis and trade entries/exits are executed on the decentralised Trading Strategy Oracle network,
			which is running off-chain and utilises high server capacity and provessing power not available on “pure” smart
			contracts
		</li>
		<li>Multipair and portfolio rebalancing strategies are supported</li>
	</Feature>

	<Feature title="100% control of your funds" image="database-1.svg">
		<li>
			Deposit and withdraw in real-time. As a non-custodial protocol, there is no counter-party risk with fund
			management or trade execution
		</li>
		<li>Invest into and exit a strategy whenever you chose</li>
	</Feature>

	<Feature title="Protocol security" image="security-2.svg">
		<li>Smart contracts allow fund transfer only into trades and withdrawals back to the investor’s own wallet</li>
		<li>
			Smart contract based fund management and Oracle consensus: No centralised parties that can enable insider fraud
		</li>
		<li>Strategies with low liquidity assets receive higher risk score</li>
		<li>Community vetting of strategies</li>
		<li>Before public access, testing live trading with private capital</li>
		<li>Audit partners to audit and verify smart contract code</li>
	</Feature>

	<Feature title="Market data" image="analyze-data-3.svg" ctaUrl="/trading-view">
		<li>
			We collect raw market data for 1M+ trading pairs directly from decentralised exchanges on multiple integrated
			blockchains
		</li>
		<li>Converts raw data to the familiar OHLCV candles and XY liquidity format</li>
	</Feature>

	<Feature
		title="Real-time API (REST)"
		image="analyze-data-1.svg"
		ctaUrl="https://tradingstrategy.ai/api/explorer/"
		ctaTarget="_blank"
	>
		<li>Price, volume and liquidity data for decentralised exchanges</li>
		<li>Trading pairs</li>
		<li>OHLCV candles for pricing</li>
		<li>OHLC candles for exchange liquidity</li>
	</Feature>

	<Feature title="Backtesting data" image="database-5.svg" ctaUrl="/trading-view/backtesting">
		<li>All historical price, volume and liquidity data for decentralised exchanges (DEX)</li>
		<li>Parquet file format</li>
		<li>Large files</li>
	</Feature>
</section>

<style>
	h2 {
		margin-bottom: 1.5rem;
	}

	p {
		font-size: 1.125rem;
		margin: 0;
	}

	a {
		font-weight: bold;
		text-decoration: underline;
	}
</style>

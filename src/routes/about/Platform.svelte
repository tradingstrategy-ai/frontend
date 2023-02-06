<script lang="ts">
	import Feature from './Feature.svelte';

	import BlockchainImage from '$lib/assets/illustrations/blockchain-1.svg?raw';
	import ControlFundsImage from '$lib/assets/illustrations/database-1.svg?raw';
	import SecurityImage from '$lib/assets/illustrations/security-1.svg?raw';
	import MarketDataImage from '$lib/assets/illustrations/analyze-data-1.svg?raw';
	import RealtimeApiImage from '$lib/assets/illustrations/analyze-data-2.svg?raw';
	import BacktestingImage from '$lib/assets/illustrations/database-2.svg?raw';
</script>

<section class="ds-container">
	<header>
		<h2>The Trading Strategy protocol</h2>
		<p>
			Trading Strategy is the first protocol replacing investment managers with code.<br />
			Read how Trading Strategy protocol
			<a href="https://tradingstrategy.ai/docs/protocol/comparison.html"
				>compares to yield farming and quantative hedge funds</a
			>.
		</p>
	</header>

	<Feature title="Active on-chain trading" image={BlockchainImage}>
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

	<Feature title="100% control of your funds" image={ControlFundsImage}>
		<li>
			Deposit and withdraw in real-time. As a non-custodial protocol, there is no counter-party risk with fund
			management or trade execution
		</li>
		<li>Invest into and exit a strategy whenever you chose</li>
	</Feature>

	<Feature title="Protocol security" image={SecurityImage}>
		<li>Smart contracts allow fund transfer only into trades and withdrawals back to the investor’s own wallet</li>
		<li>
			Smart contract based fund management and Oracle consensus: No centralised parties that can enable insider fraud
		</li>
		<li>Strategies with low liquidity assets receive higher risk score</li>
		<li>Community vetting of strategies</li>
		<li>Before public access, testing live trading with private capital</li>
		<li>Audit partners to audit and verify smart contract code</li>
	</Feature>

	<Feature title="Market data" image={MarketDataImage} ctaUrl="/trading-view">
		<li>
			We collect raw market data for 1M+ trading pairs directly from decentralised exchanges on multiple integrated
			blockchains
		</li>
		<li>Converts raw data to the familiar OHLCV candles and XY liquidity format</li>
	</Feature>

	<Feature
		title="Real-time API (REST)"
		image={RealtimeApiImage}
		ctaUrl="https://tradingstrategy.ai/api/explorer/"
		ctaTarget="_blank"
	>
		<li>Price, volume and liquidity data for decentralised exchanges</li>
		<li>Trading pairs</li>
		<li>OHLCV candles for pricing</li>
		<li>OHLC candles for exchange liquidity</li>
	</Feature>

	<Feature title="Backtesting data" image={BacktestingImage} ctaUrl="/trading-view/backtesting">
		<li>All historical price, volume and liquidity data for decentralised exchanges (DEX)</li>
		<li>Parquet file format</li>
		<li>Large files</li>
	</Feature>
</section>

<style lang="postcss">
	section {
		gap: 8rem;
		padding-top: var(--space-5xl);
		padding-bottom: 10rem;

		@media (--viewport-sm-down) {
			gap: 5rem;
			padding-top: var(--space-xl);
			padding-bottom: var(--space-7xl);
		}
	}

	header {
		margin-bottom: var(--space-lg);
	}

	h2 {
		margin-bottom: var(--space-lg);
		font: var(--f-heading-xl-medium);
		letter-spacing: var(--f-heading-xl-spacing, normal);
		text-align: center;

		@media (--viewport-sm-down) {
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);
		}
	}

	p {
		font: var(--f-heading-sm-roman);
		letter-spacing: var(--f-heading-sm-spacing);
		text-align: center;

		@media (--viewport-sm-down) {
			font: var(--f-heading-xs-roman);
			letter-spacing: var(--f-heading-xs-spacing);
			text-align: left;

			& br {
				display: none;
			}
		}

		& a {
			font-weight: 600;
			text-decoration: underline;
		}
	}
</style>

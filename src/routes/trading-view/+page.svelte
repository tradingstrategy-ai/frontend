<!--
	Trading data splash page renderer
-->
<script lang="ts">
	import { formatAmount, formatByteUnits } from '$lib/helpers/formatters';
	import heroImage from '$lib/assets/illustrations/data-cloud-1.svg?raw';
	import { Button, ContentCard, ContentCardsSection, ContentCardsTemplate, HeroBanner } from '$lib/components';
	import IconBacktesting from '~icons/local/backtesting';
	import Icon24h from '~icons/local/24h';
	import IconBlockchain from '~icons/local/blockchain';
	import IconBook from '~icons/local/book';

	import IconPython from '~icons/local/python';
	import IconWallet from '~icons/local/wallet';
	import { chains } from '$lib/helpers/chain';

	let { data } = $props();
	let { impressiveNumbers, topVaults } = $derived(data);

	let chainCount = new Set(chains.map((c) => c.slug)).size;
</script>

<ContentCardsTemplate pageTitle="DEX trading view" pageDescription="DEX trading view">
	<HeroBanner
		slot="hero"
		image={heroImage}
		title="Trading data"
		subtitle="The largest decentralised finance dataset for automated trading."
	/>

	<ContentCardsSection title="Explore data">
		<ContentCard title="Blockchains" href="/trading-view/blockchains">
			<IconBlockchain slot="icon" />
			<p>Trading Strategy provides powerful market data sets for on-chain trading on several blockchains.</p>
			<p>
				Currently tracking data across <strong>{chainCount} blockchains</strong>.
			</p>
			<Button slot="cta" label="Explore blockchains" />
		</ContentCard>

		<ContentCard title="Vaults" href="/trading-view/vaults">
			<IconWallet slot="icon" />
			<p>
				Explore top-performing vaults across supported chains. Compare TVL, returns, Sharpe ratio, and historical
				performance metrics.
			</p>
			{#if topVaults?.vaults.length}
				<p>
					Currently displaying
					<strong>{formatAmount(topVaults?.vaults.length)} vaults</strong> with minimum $50k USD TVL.
				</p>
			{/if}
			<Button slot="cta" label="Compare vaults" />
		</ContentCard>
	</ContentCardsSection>

	<ContentCardsSection title="Programmatic access">
		<ContentCard title="Backtesting" href="/trading-view/backtesting">
			<IconBacktesting slot="icon" />
			<p>
				Download historical OHLCV data for backtesting your trading algorithms. Liquidity information is available for
				calculating past slippage. Datasets are served in Parquet file format.
			</p>
			{#if impressiveNumbers}
				<p>
					Currently providing <strong>{formatByteUnits(impressiveNumbers.database_size)}</strong> of data.
				</p>
			{/if}
			<Button slot="cta" label="Download datasets" />
		</ContentCard>

		<ContentCard title="Realtime API" href="https://tradingstrategy.ai/api/explorer/" rel="external">
			<Icon24h slot="icon" />
			<p>Connect your trading algorithms for real-time market feeds for live trading.</p>
			<p>Real-time API is available in OpenAPI v3 format, no API keys or sign ups needed.</p>
			<Button slot="cta" label="Read API specification" />
		</ContentCard>

		<ContentCard title="Documentation" href="https://tradingstrategy.ai/docs" rel="external">
			<IconBook slot="icon" />
			<p>
				Trading Strategy provides Python libraries for strategy development and execution for decentralised exchanges.
				Read API documentation and tutorials to learn how to create your own strategies.
			</p>
			<Button slot="cta" label="Read documentation" />
		</ContentCard>

		<ContentCard title="Notebooks" href="https://github.com/tradingstrategy-ai/getting-started" rel="external">
			<IconPython slot="icon" />
			<p>
				Use popular Jupyter Notebook, Pandas and other data science libraries to model and backtest your strategies.
				View example notebooks to see how to use DeFi data in your notebooks.
			</p>
			<Button slot="cta" label="Go to notebooks" />
		</ContentCard>
	</ContentCardsSection>
</ContentCardsTemplate>

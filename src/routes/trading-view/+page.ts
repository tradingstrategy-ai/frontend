import type { PageLoad } from './$types';
import { backendUrl } from '$lib/config';
import { formatAmount, formatSizeGigabytes } from '$lib/helpers/formatters';

const apiUrl = `${backendUrl}/impressive-numbers`;

export const load: PageLoad = async ({ fetch }) => {
	const resp = await fetch(apiUrl);

	// render the page even if the backend is down
	if (resp.ok) {
		const impressiveNumbers = await resp.json();

		return {
			contentCardsSections: [
				{
					title: 'Explore data',
					cards: [
						{
							href: '/trading-view/blockchains',
							iconName: 'blockchain',
							title: 'Blockchains',
							subtitle:
								'Trading Strategy provides powerful market data sets for on-chain trading on several blockchains.',
							summaryLabel: 'Indexing data from',
							summaryValue: `${impressiveNumbers.blockchains} blockchains`
						},
						{
							href: '/trading-view/exchanges',
							iconName: 'exchange',
							title: 'DEXes',
							subtitle:
								'Trading Strategy provides data sets for decentralised exchanges. All market data is sourced from on-chain trades, across multiple DEXs.',
							summaryLabel: 'Indexing data from',
							summaryValue: `${formatAmount(impressiveNumbers.exchanges)} DEXes`
						},
						{
							href: '/trading-view/trading-pairs',
							iconName: 'pair',
							title: 'Trading pairs',
							subtitle:
								'Trading pairs have OHLCV candle data available between 1-minute to 30-day time frames. View historical and current datasets here.',
							summaryLabel: 'Indexing data from',
							summaryValue: `${formatAmount(impressiveNumbers.pairs)} trading pairs`
						},
						{
							href: '/trading-view/exchanges',
							iconName: 'search',
							title: 'Advanced search',
							subtitle:
								'Search tokens across multiple blockchains and exchanges. Sort and filter by liquidity, volume and/or price change.',
							summaryLabel: 'Browse data and customise results',
							summaryValue: '32 filters'
						}
					]
				},
				{
					title: 'Programmatic access',
					cards: [
						{
							href: '/trading-view/backtesting',
							iconName: 'backtesting',
							title: 'Backtesting',
							subtitle:
								'Download historical OHLCV data for backtesting your trading algorithms. Liquidity information is available for calculating past slippage. Datasets are served in Parquet file format.',
							summaryLabel: 'You can download',
							summaryValue: `${formatSizeGigabytes(impressiveNumbers.database_size)} GB worth of data`
						},
						{
							href: 'https://tradingstrategy.ai/api/explorer/',
							iconName: '24h',
							title: 'Realtime API',
							subtitle:
								'Connect your trading algorithms for real-time market feeds for live trading.<br /> Real-time API is available in OpenAPI v3 format, no API keys or sign ups needed.',
							summaryLabel: 'Available format',
							summaryValue: 'OpenAPI v3'
						},
						{
							href: 'https://tradingstrategy.ai/docs',
							iconName: 'book',
							title: 'Documentation',
							subtitle:
								'Trading Strategy provides Python libraries for strategy development and execution for decentralised exchanges. Read API documentation and tutorials to learn how to create your own strategies.',
							summaryLabel: 'Technical documentation',
							summaryValue: 'For strategy developers'
						},
						{
							href: 'https://tradingstrategy.ai/docs/programming/strategy-examples/index.html',
							iconName: 'python',
							title: 'Notebooks',
							subtitle:
								'Use popular Jupyter Notebook, Pandas and other data science libraries to model and backtest your strategies. View example notebooks to see how to use DeFi data in your notebooks.',
							summaryLabel: 'Available examples for',
							summaryValue: 'Jupyter Notebook, Pandas'
						}
					]
				}
			],
			impressiveNumbers
		};
	} else {
		console.error(`API error: ${resp.status} ${resp.statusText}`);
	}
};

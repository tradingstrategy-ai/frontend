<script lang="ts">
	import { formatPriceChange } from '$lib/helpers/formatters';
	import ProfitIndicator from './ProfitIndicator.svelte';

	interface TradingPairsTableItem {
		chain_slug: string;
		exchange_name: string;
		exchange_slug: string;
		pair_slug: string;
		pair_symbol: string;
		price_change_24h: number;
	}

	export let pairs: Array<TradingPairsTableItem>;
</script>

<table class="top-trades-table">
	<tbody>
		{#each pairs as { chain_slug, exchange_name, exchange_slug, pair_slug, pair_symbol, price_change_24h }}
			<a style="display: contents;" href={`/trading-view/${chain_slug}/${exchange_slug}/${pair_slug}`}>
				<tr>
					<td>{pair_symbol}</td>
					<td>{exchange_name}</td>
					<td>
						<ProfitIndicator bearish={price_change_24h < 0} bullish={price_change_24h > 0}>
							{formatPriceChange(price_change_24h)}
						</ProfitIndicator>
					</td>
				</tr>
			</a>
		{/each}
	</tbody>
</table>

<style lang="postcss">
	td {
		@media (--viewport-sm-down) {
			font: var(--f-ui-md-medium);
		}

		&:last-child {
			text-align: right;
		}
	}
</style>

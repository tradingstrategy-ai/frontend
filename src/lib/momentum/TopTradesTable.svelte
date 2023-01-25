<!--
@component
Display table of trading pairs, linking each row to the trading pair details page. Format
of pair records is based on the records returned by `top-momentum` API.

#### Usage:
```tsx
	<TopTradesTable pairs={topMomentum.top_up_24h_min_liq_1m} />
```
-->
<script lang="ts">
	import { formatPriceChange } from '$lib/helpers/formatters';
	import { UpDownIndicator } from '$lib/components';

	export let pairs: Record<string, string | number>[];
</script>

<table class="top-trades-table">
	<tbody>
		{#each pairs as pair}
			<a style:display="contents" href={`/trading-view/${pair.chain_slug}/${pair.exchange_slug}/${pair.pair_slug}`}>
				<tr>
					<td>{pair.pair_symbol}</td>
					<td>{pair.exchange_name}</td>
					<td>
						<UpDownIndicator value={pair.price_change_24h} formatter={formatPriceChange} />
					</td>
				</tr>
			</a>
		{/each}
	</tbody>
</table>

<style lang="postcss">
	td:last-child {
		text-align: right;
	}
</style>

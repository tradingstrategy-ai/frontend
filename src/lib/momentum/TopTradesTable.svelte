<!--
@component
Display table of trading pairs, linking each row to the trading pair details page. Format
of pair records is based on the records returned by `top-momentum` API.

**Note:** The "Top trades" section was removed from the home page in 09/2024 (see #fb6486a3).
This component should be removed if it is not repurposed and displayed on a different page.

@example

```svelte
	<TopTradesTable pairs={topMomentum.top_up_24h_min_liq_1m} />
```
-->
<script lang="ts">
	import { formatPriceChange } from '$lib/helpers/formatters';
	import { UpDownCell } from '$lib/components';

	export let pairs: Record<string, string | number>[];
</script>

<table class="top-trades-table datatable">
	<tbody>
		{#each pairs as pair}
			<a style:display="contents" href={`/trading-view/${pair.chain_slug}/${pair.exchange_slug}/${pair.pair_slug}`}>
				<tr>
					<td>{pair.pair_symbol}</td>
					<td>{pair.exchange_name}</td>
					<td class="price-change">
						<UpDownCell value={pair.price_change_24h} formatter={formatPriceChange} let:formatted>
							<span style:white-space="nowrap">{formatted}</span>
						</UpDownCell>
					</td>
				</tr>
			</a>
		{/each}
	</tbody>
</table>

<style>
	.top-trades-table {
		.price-change {
			padding: 0 var(--space-xs);
		}

		@media (--viewport-sm-down) {
			--up-down-font: var(--f-ui-xs-medium);
			--up-down-spacing: var(--f-ui-xs-spacing);
		}
	}
</style>

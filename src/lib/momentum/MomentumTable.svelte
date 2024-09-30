<script lang="ts">
	import { formatPriceChange } from '$lib/helpers/formatters';
	import { UpDownCell } from '$lib/components';

	interface MomentumPair {
		chain_name: string;
		chain_slug: string;
		exchange_name: string;
		exchange_slug: string;
		liquidity_change_24h: number;
		pair_slug: string;
		pair_symbol: string;
		price_change_24h: number;
	}

	// Trading pairs to render in this momentum table
	export let pairs: MomentumPair[];
</script>

<table class="momentum-table datatable">
	<thead>
		<tr>
			<th class="position" />
			<th>Trading pair</th>
			<th class="exchange">Exchange</th>
			<th class="blockchain">Blockchain</th>
			<th class="price-change right">Price change</th>
		</tr>
	</thead>
	<tbody>
		{#each pairs as pair, idx}
			<tr>
				<td class="position">
					#{idx + 1}
				</td>

				<td class="pair-name">
					<a href={`/trading-view/${pair.chain_slug}/${pair.exchange_slug}/${pair.pair_slug}`}>
						{pair.pair_symbol}
					</a>
				</td>

				<td class="exchange">
					<a href={`/trading-view/${pair.chain_slug}/${pair.exchange_slug}`}>
						{pair.exchange_name}
					</a>
				</td>

				<td class="blockchain">
					<a href={`/trading-view/${pair.chain_slug}`}>
						{pair.chain_name}
					</a>
				</td>

				<td class="price-change">
					<UpDownCell value={pair.price_change_24h} formatter={formatPriceChange} />
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.momentum-table {
		table-layout: fixed;

		.position {
			width: 3.5em;
			padding-right: 0;
			color: var(--c-text-extra-light);
		}

		.price-change {
			padding: 0 var(--space-xs);
		}

		/* Remove less relevant columns on mobile */
		@media (--viewport-sm-down) {
			.exchange {
				display: none;
			}
		}

		@media (--viewport-xs) {
			.blockchain {
				display: none;
			}
		}
	}
</style>

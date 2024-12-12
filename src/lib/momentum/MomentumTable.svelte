<script lang="ts" module>
	export type MomentumPair = {
		chain_name: string;
		chain_slug: string;
		exchange_name: string;
		exchange_slug: string;
		liquidity_change_24h: number;
		pair_slug: string;
		pair_symbol: string;
		price_change_24h: number;
	};
</script>

<script lang="ts">
	import Profitability from '$lib/components/Profitability.svelte';
	import TargetableLink from '$lib/components/TargetableLink.svelte';

	let { pairs }: { pairs: MomentumPair[] } = $props();
</script>

<table class="momentum-table datatable">
	<thead>
		<tr class="col-headers">
			<th class="position"></th>
			<th class="pair">Trading pair</th>
			<th class="exchange">Exchange</th>
			<th class="blockchain">Blockchain</th>
			<th class="price-change right">Price change</th>
		</tr>
	</thead>
	<tbody>
		{#each pairs as pair, idx}
			<tr class="targetable">
				<td class="position">
					#{idx + 1}
				</td>

				<td class="pair">
					{pair.pair_symbol}
				</td>

				<td class="exchange">
					{pair.exchange_name}
				</td>

				<td class="blockchain">
					{pair.chain_name}
				</td>

				<td class="price-change">
					<Profitability of={pair.price_change_24h} boxed class="price-change-value" />

					<TargetableLink
						href="/trading-view/{pair.chain_slug}/{pair.exchange_slug}/{pair.pair_slug}"
						label="View {pair.pair_symbol} pair details"
					/>
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
			padding-inline: 0.625em;
			text-align: right;

			:global(.price-change-value) {
				@media (--viewport-md-up) {
					font: var(--f-ui-sm-medium);
					letter-spacing: var(--f-ui-sm-spacing, normal);
				}
			}
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

<script lang="ts">
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { formatPriceChange } from '$lib/helpers/formatters';
	import { UpDownIndicator } from '$lib/components';

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
	[];

	$: console.log(pairs);

	// Trading pairs to render in this momentum table
	export let pairs: MomentumPair[];

	// Either "liquidity" or "price"
	export let kind: string;
</script>

<div>
	<table>
		<thead>
			<tr>
				<th />
				<th>Trading pair</th>
				<th class="exchange">Exchange</th>
				<th class="blockchain">Blockchain</th>
				<th class="right">Price change</th>
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

					{#if kind === 'liquidity'}
						<td class={determinePriceChangeClass(pair.liquidity_change_24h)}>
							{formatPriceChange(pair.liquidity_change_24h)}
						</td>
					{:else}
						<td class="right">
							<UpDownIndicator value={pair.price_change_24h} formatter={formatPriceChange} />
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	/* Remove less relevant columns on mobile */
	/* --breakpoint-md */
	@media (max-width: 992px) {
		.exchange,
		.blockchain {
			display: none;
		}
	}
</style>

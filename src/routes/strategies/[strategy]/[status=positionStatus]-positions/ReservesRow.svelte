<script lang="ts">
	import type { ReservePosition } from 'trade-executor/schemas/reserve';
	import TradingDescription from 'trade-executor/components/TradingDescription.svelte';
	import Profitability from '$lib/components/Profitability.svelte';
	import { getTokenLabel } from '$lib/eth-defi/helpers';
	import { formatDollar } from '$lib/helpers/formatters';

	type Props = {
		reserves: ReservePosition;
	};

	let { reserves }: Props = $props();
</script>

<tr class="reserves">
	<td class="description">
		<TradingDescription
			label={getTokenLabel(reserves.asset.token_symbol, reserves.asset.address)!}
			modifier="reserves"
		/>
	</td>
	<td class="flags"></td>
	<td class="profit">
		<Profitability of={0} boxed></Profitability>
	</td>
	<td class="current_value">
		{formatDollar(reserves.quantity)}
	</td>
	<td class="opened_at">always open</td>
	<td class="cta"></td>
</tr>

<style>
	.reserves {
		pointer-events: none;
		background: var(--c-box-3);

		:is(.opened_at, .profit) {
			color: var(--c-text-extra-light);
		}
	}
</style>

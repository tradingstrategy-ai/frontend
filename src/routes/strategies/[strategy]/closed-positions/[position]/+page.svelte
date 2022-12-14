<script lang="ts">
	import type { PageData } from './$types';
	import { getPositionLatestStats } from 'trade-executor-frontend/state/stats';
	import { formatDollar, formatTokenAmount } from 'trade-executor-frontend/helpers/formatters';
	import { getValueAtPeak } from 'trade-executor-frontend/state/positionHelpers';
	import { DataBox, DataBoxes, DateTime, PageHeading } from '$lib/components';
	import Profitability from '../../Profitability.svelte';
	import TradeTable from './TradeTable.svelte';

	export let data: PageData;

	const { summary, state, position } = data;
	const currentStats = getPositionLatestStats(position.position_id, state.stats);
	const positionStats = state.stats.positions[position.position_id];
</script>

<main class="ds-container">
	<PageHeading level={2}>
		<h1><a href="/strategies/{summary.id}">{summary.name}</a></h1>
		<h2>Position #{position.position_id}</h2>
	</PageHeading>

	<DataBoxes>
		<DataBox label="Pair">
			<a href={position.pair.info_url}>
				{position.pair.base.token_symbol}-{position.pair.quote.token_symbol}
			</a>
		</DataBox>
		<DataBox label="Profitability">
			<Profitability value={currentStats.profitability} />
		</DataBox>
		<DataBox label="Quantity">
			{formatTokenAmount(currentStats.quantity)}
			{position.pair.base.token_symbol}
		</DataBox>
		<DataBox label="Closed">
			<DateTime epoch={position.closed_at} />
		</DataBox>
		<DataBox label="Value now" value={formatDollar(currentStats.value)} />
		<DataBox label="Value (highest)" value={formatDollar(getValueAtPeak(positionStats))} />
	</DataBoxes>

	<TradeTable trades={Object.values(position.trades)} />
</main>

<style lang="postcss">
	main :global .data-boxes {
		margin-block: 1rem 3rem;

		@media (--viewport-sm-down) {
			margin-bottom: 2rem;
		}
	}
</style>

<script lang="ts">
	import type { PageData } from './$types';
	import { formatDollar, formatAmount, formatBPS } from 'trade-executor-frontend/helpers/formatters';
	import { DataBox, DataBoxes, DateTime, PageHeading } from '$lib/components';
	import TransactionTable from './TransactionTable.svelte';

	export let data: PageData;

	const { summary, position, trade } = data;
</script>

<main class="ds-container">
	<PageHeading level={2}>
		<h1>
			<a href=".">Position #{position.position_id}</a> in
			<a href="/strategies/{summary.id}/">{summary.name}</a>
		</h1>
		<h2>Trade #{trade.trade_id}</h2>
	</PageHeading>

	<DataBoxes>
		<DataBox label="Pair">
			<a href={position.pair.info_url}>
				{position.pair.base.token_symbol}-{position.pair.quote.token_symbol}
			</a>
		</DataBox>
		<DataBox label="Executed at">
			<DateTime epoch={trade.executed_at} />
		</DataBox>
		<DataBox label="Slippage tolerance" value="{formatBPS(trade.planned_max_slippage)} BPS" />
		<DataBox label="Expected value" value={formatDollar(trade.planned_reserve)} />
		<DataBox label="Realized value" value={formatDollar(trade.executed_reserve)} />
		<DataBox label="Liquidity provider fees" value="N/A" />
		<DataBox label="Expected quantity">
			{formatAmount(Number(trade.planned_quantity))}
			{trade.pair.quote.token_symbol}
		</DataBox>
		<DataBox label="Realized quantity">
			{formatAmount(Number(trade.executed_quantity))}
			{trade.pair.quote.token_symbol}
		</DataBox>
		<DataBox label="Gas fees" value="N/A" />
	</DataBoxes>

	<TransactionTable transactions={trade.blockchain_transactions} />
</main>

<style lang="postcss">
	main :global .data-boxes {
		margin-block: var(--space-md) var(--space-xxxxxl);

		@media (--viewport-sm-down) {
			margin-bottom: var(--space-xl);
		}
	}
</style>

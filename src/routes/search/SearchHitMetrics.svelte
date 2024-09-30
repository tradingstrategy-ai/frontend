<script lang="ts">
	import type { TradingEntityDocument } from '$lib/search/trading-entities';
	import { formatDollar, formatInterestRate } from '$lib/helpers/formatters';

	export let document: TradingEntityDocument;

	const hasTradingMetrics = document && [document.liquidity, document.tvl, document.volume_24h].some(Number.isFinite);
	const isLendingReserve = document?.type === 'lending_reserve';
</script>

{#if hasTradingMetrics}
	<ul>
		<div>
			<dt>Volume 24h</dt>
			<dd>{formatDollar(document.volume_24h, 1, 1)}</dd>
		</div>
		{#if Number.isFinite(document.tvl)}
			<div>
				<dt>TVL</dt>
				<dd>{formatDollar(document.tvl, 1, 1)}</dd>
			</div>
		{:else if document.liquidity}
			<div>
				<dt>Liquidity</dt>
				<dd>{formatDollar(document.liquidity, 1, 1)}</dd>
			</div>
		{/if}
	</ul>
{:else if isLendingReserve}
	{@const variableBorrowApr = document.variable_borrow_apr}
	<ul>
		<div>
			<dt>Supply APR</dt>
			<dd>{formatInterestRate(document.supply_apr)}</dd>
		</div>
		<div>
			<dt>Variable Borrow APR</dt>
			<dd>{variableBorrowApr > 0 ? formatInterestRate(variableBorrowApr) : 'N/A'}</dd>
		</div>
	</ul>
{/if}

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		padding: 0;
		font: var(--f-ui-sm-roman);
		letter-spacing: var(--f-ui-sm-spacing, normal);

		@media (--viewport-xs) {
			font: var(--f-ui-xs-roman);
			letter-spacing: var(--f-ui-xs-spacing, normal);
		}

		dt {
			display: inline-block;
			font-weight: 400;
			white-space: nowrap;
		}

		dd {
			display: inline-block;
			margin: 0;
			font-weight: 700;
		}
	}
</style>

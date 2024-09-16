<script lang="ts">
	import type { TradingPositionInfo } from 'trade-executor/state/position-info';
	import { positionTooltips } from 'trade-executor/state/position-tooltips';
	import { DataBadge, Tooltip, UpDownIndicator } from '$lib/components';
	import { formatProfitability } from 'trade-executor/helpers/formatters';
	import { determineProfitability } from 'trade-executor/helpers/profit';

	export let position: TradingPositionInfo;
</script>

<div class="position-profitability tile a">
	<Tooltip>
		<svelte:fragment slot="trigger">
			<UpDownIndicator
				value={position.profitability}
				formatter={formatProfitability}
				compareFn={determineProfitability}
				let:direction
				let:formatted
			>
				<span class="value">
					{formatted}
				</span>
				<span class="direction">
					{direction > 0 ? 'profit' : direction < 0 ? 'loss' : 'break even'}
				</span>
			</UpDownIndicator>
		</svelte:fragment>
		<span slot="popup">
			{#if position.stillOpen}
				{positionTooltips.unrealisedProfitability}
			{:else}
				{positionTooltips.realisedProfitability}
			{/if}
		</span>
	</Tooltip>
	{#if position.stopLossTriggered}
		<Tooltip>
			<DataBadge slot="trigger">Stop loss</DataBadge>
			<svelte:fragment slot="popup">
				{positionTooltips.stopLossTriggered}
			</svelte:fragment>
		</Tooltip>
	{/if}
</div>

<style lang="postcss">
	.position-profitability {
		padding: 1.25rem;
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;

		.value {
			font: var(--f-heading-xxl-medium);

			@media (--viewport-xs) {
				font: var(--f-heading-xl-medium);
			}
		}

		.direction {
			color: var(--c-text-extra-light);
			font: var(--f-heading-lg-medium);

			@media (--viewport-xs) {
				font: var(--f-heading-md-medium);
			}
		}
	}
</style>

<script lang="ts">
	import type { TradingPositionInfo } from 'trade-executor/models/position-info';
	import { positionTooltips } from 'trade-executor/models/position-tooltips';
	import { DataBadge, Profitability, Tooltip } from '$lib/components';

	export let position: TradingPositionInfo;
</script>

<div class="position-profitability tile a">
	<Tooltip>
		<Profitability of={position.profitability} slot="trigger">
			{#snippet children(profitInfo, getLabel)}
				<span class="value">
					{profitInfo}
				</span>
				<span class="direction">
					{getLabel('loss', 'break even', 'profit')}
				</span>
			{/snippet}
		</Profitability>
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

<style>
	.position-profitability {
		padding: 1.25rem;
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;

		.value {
			margin-right: 0.25ex;
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

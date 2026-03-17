<script lang="ts">
	import type { TradingPositionInfo } from 'trade-executor/models/position-info';
	import { positionTooltips } from 'trade-executor/models/position-tooltips';
	import { Button, DataBadge, Profitability, Tooltip } from '$lib/components';

	export let position: TradingPositionInfo;
	export let gmxPositionUrl: string | undefined = undefined;
</script>

<div class="position-profitability tile a">
	<div class="profitability-main">
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

		{#if gmxPositionUrl}
			<div class="gmx-button-row">
				<Button size="lg" target="_blank" rel="noreferrer" href={gmxPositionUrl}>View on GMX</Button>
			</div>
		{/if}
	</div>
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
		gap: 1rem;

		.profitability-main {
			display: grid;
			gap: 0.75rem;
		}

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

		.gmx-button-row {
			display: flex;
			justify-content: flex-start;
		}

		:global(.gmx-button-row .button) {
			--button-width: 100%;
		}
	}
</style>

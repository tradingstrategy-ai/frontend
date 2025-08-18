<!--
@component
Description column for strategy trading tables (position, trade). Includes a
primary label, a modifier (shown in lighter text), and a testing indicator
(displays a [test] badge).

Used in DataTable context (vs. standard svelte component context).

@example

```svelte
	table.column({
		header: 'Position',
		id: 'description',
		accessor: ({ pair, isTest }) => ({ label: pair.symbol, modifier: pair.kindShortLabel, isTest }),
		cell: ({ value }) => createRender(TradingDescription, value)
	})
```
-->
<script lang="ts">
	import type { TradeStatus } from 'trade-executor/models/trade-info';
	import type { TradeType } from 'trade-executor/schemas/trade';
	import DataBadge from '$lib/components/DataBadge.svelte';

	interface Props {
		label: string;
		modifier?: string;
		class?: string;
		status?: TradeStatus;
		type?: TradeType;
		isTest?: boolean;
		stopLoss?: boolean;
	}

	let { label, modifier, class: classes, status, type, isTest = false, stopLoss = false }: Props = $props();
</script>

<div class="description-cell {classes}">
	<span class="label">
		{label}
	</span>
	<span class="modifier">
		{modifier}
	</span>
	<span class="badges">
		{#if isTest}
			<DataBadge status="warning">Test</DataBadge>
		{/if}
		{#if status === 'failed'}
			<DataBadge status="error">Failed</DataBadge>
		{/if}
		{#if status === 'repaired'}
			<DataBadge status="warning">Repaired</DataBadge>
		{/if}
		{#if type === 'repair'}
			<DataBadge>Repair</DataBadge>
		{/if}
		{#if stopLoss}
			<DataBadge>Stop loss</DataBadge>
		{/if}
	</span>
</div>

<style>
	.description-cell {
		display: flex;
		gap: 1ex;
		align-items: center;
		white-space: nowrap;

		.modifier {
			color: var(--c-text-extra-light);
		}

		.badges {
			:global([data-css-props]) {
				--data-badge-background: var(--c-box-4);
			}

			font: var(--f-ui-xs-medium);
			letter-spacing: var(--ls-ui-xs);

			@media (--viewport-sm-down) {
				font: var(--f-ui-xxs-medium);
				letter-spacing: var(--ls-ui-xxs);
			}
		}
	}
</style>

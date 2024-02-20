<!--
@component
Description column for strategy trading tables (position, trade). Includes a
primary label, a modifier (shown in lighter text), and a testing indicator
(displays a [test] badge).

Used in DataTable context (vs. standard svelte component context).

#### Usage:
```ts
	table.column({
		header: 'Position',
		id: 'description',
		accessor: ({ pair, isTest }) => ({ label: pair.symbol, modifier: pair.kindShortLabel, isTest }),
		cell: ({ value }) => createRender(TradingDescription, value)
	})
```
-->
<script lang="ts">
	import { DataBadge } from '$lib/components';

	export let label: string;
	export let modifier: string | undefined;
	export let isTest = false;
</script>

<div class="description-cell">
	<span class="label">
		{label}
	</span>
	{#if modifier}
		<span class="modifier">
			{modifier}
		</span>
	{/if}
	{#if isTest}
		<span class="test-badge">
			<DataBadge status="warning">Test</DataBadge>
		</span>
	{/if}
</div>

<style lang="postcss">
	.description-cell {
		display: flex;
		gap: 1ex;
		align-items: center;
		white-space: nowrap;

		.modifier {
			color: hsl(var(--hsl-text-extra-light));
		}

		.test-badge {
			font: var(--f-ui-xs-medium);
			letter-spacing: var(--ls-ui-xs);

			@media (--viewport-sm-down) {
				font: var(--f-ui-xxs-medium);
				letter-spacing: var(--ls-ui-xxs);
			}
		}
	}
</style>

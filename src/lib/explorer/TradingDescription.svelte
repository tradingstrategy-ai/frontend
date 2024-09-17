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

	let classes = '';
	export { classes as class };
	export let label: string;
	export let modifier = '';
	export let isTest = false;
	export let failed = false;
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
		{#if failed}
			<DataBadge status="error">Failed</DataBadge>
		{/if}
	</span>
</div>

<style lang="postcss">
	.description-cell {
		display: flex;
		gap: 1ex;
		align-items: center;
		white-space: nowrap;

		.modifier {
			color: var(--c-text-extra-light);
		}

		.badges {
			font: var(--f-ui-xs-medium);
			letter-spacing: var(--ls-ui-xs);

			@media (--viewport-sm-down) {
				font: var(--f-ui-xxs-medium);
				letter-spacing: var(--ls-ui-xxs);
			}
		}
	}
</style>

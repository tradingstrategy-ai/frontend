<!--
@component
Custom variant of UpDownIndicator utility for displaying a value with red/green value color.
Displays a more stylized indicator with padding and colored background highlight. Use in tables
or other contexts where a stronger visual representation is desired.

@example

```svelte
<UpDownCell value={priceChange} formatter={formatPriceChange} />
<UpDownCell value={100}>Slot content</UpDownIndicator>
```
-->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { UpDownIndicator } from '$lib/components';

	export let value: ComponentProps<UpDownIndicator>['value'];
	export let formatter: ComponentProps<UpDownIndicator>['formatter'] = undefined;
	export let compareFn: ComponentProps<UpDownIndicator>['compareFn'] = undefined;
</script>

<div class="up-down-cell" data-css-props>
	<UpDownIndicator {value} {formatter} {compareFn} let:direction let:formatted>
		{#if $$slots.default}
			<slot {direction} {formatted} />
		{:else}
			<span class="truncate">{formatted}</span>
		{/if}
	</UpDownIndicator>
</div>

<style>
	.up-down-cell {
		display: flex;
		justify-content: flex-end;

		:global(.up-down-indicator) {
			background: var(--c-box-2);
			border-radius: var(--radius-sm);
			display: grid;
			font: var(--up-down-font, var(--f-ui-sm-medium));
			letter-spacing: var(--up-down-letter-spacing, var(--f-ui-sm-spacing, normal));
			gap: var(--space-xxs);
			padding: var(--space-ss) var(--space-ms);
			text-align: right;
			transition: all var(--time-sm) ease-out;
		}

		:global(:is(.bullish, .bearish)) {
			transition: none;
			background: color-mix(in srgb, transparent, currentColor 12%);
			--background-hover: color-mix(in srgb, transparent, currentColor 24%);

			&:hover {
				background: var(--background-hover);
			}
		}
	}
</style>

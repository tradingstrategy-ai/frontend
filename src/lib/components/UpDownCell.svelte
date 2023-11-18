<!--
@component
Custom variant of UpDownIndicator utility for displaying a value with red/green value color.
Displays a more stylized indicator with padding and colored background highlight. Use in tables
or other contexts where a stronger visual representation is desired.

#### Usage:
```tsx
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

<div class="up-down-cell">
	<UpDownIndicator {value} {formatter} {compareFn} let:direction let:formatted>
		{#if $$slots.default}
			<slot {direction} {formatted} />
		{:else}
			<span class="truncate">{formatted}</span>
		{/if}
	</UpDownIndicator>
</div>

<style lang="postcss">
	.up-down-cell {
		display: flex;
		justify-content: flex-end;

		:global(.up-down-indicator) {
			background: hsl(var(--hsla-box-2));
			border-radius: var(--radius-sm);
			display: grid;
			font: var(--up-down-font, var(--f-ui-sm-medium));
			letter-spacing: var(--up-down-letter-spacing, var(--f-ui-sm-spacing, normal));
			gap: var(--space-xxs);
			padding: var(--space-ss) var(--space-ms);
			text-align: right;
			transition: all var(--time-sm) ease-out;
		}

		:global(.bullish) {
			background: hsla(var(--hsl-bullish), 0.12);

			&:hover {
				background: hsla(var(--hsl-bullish), 0.24) !important;
			}
		}

		:global(.bearish) {
			background: hsla(var(--hsl-bearish), 0.12);

			&:hover {
				background: hsla(var(--hsl-bearish), 0.24) !important;
			}
		}
	}
</style>

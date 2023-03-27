<!--
@component
Utility component for displaying a value with red/green value color. Use in inline contexts where
a lightweight visual representation is needed. See `UpDownCell.svelte` for a more stylized variant.

#### Usage:
```tsx
	<UpDownIndicator value={priceChange} formatter={formatPriceChange} />
	<UpDownIndicator value={100}>Slot content</UpDownIndicator>
```
-->
<script lang="ts">
	import type { MaybeNumberOrString, Formatter } from '$lib/helpers/formatters';

	export let value: MaybeNumberOrString;
	export let formatter: Formatter<MaybeNumberOrString> | undefined = undefined;

	type CompareFn = (value: MaybeNumberOrString) => number;
	export let compareFn: CompareFn | undefined;

	const compare: CompareFn = (value) => (value ? Math.sign(Number(value)) : 0);

	$: direction = compareFn?.(value) ?? compare(value);
	$: formatted = formatter ? formatter(value) : value;
</script>

<span class="up-down-indicator" class:bullish={direction > 0} class:bearish={direction < 0}>
	<slot {direction} {formatted}>{formatted}</slot>
</span>

<style lang="postcss">
	.up-down-indicator {
		color: hsla(var(--hsl-text-light));

		&.bullish {
			color: hsla(var(--hsl-bullish));
		}

		&.bearish {
			color: hsla(var(--hsl-bearish));
		}
	}
</style>

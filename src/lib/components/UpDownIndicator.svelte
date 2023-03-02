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
	export let value: number | string | undefined | null;

	type Formatter = (value: any) => string;
	export let formatter: Formatter | undefined = undefined;

	$: formatted = formatter ? formatter(value) : value;
</script>

<span class="up-down-indicator" class:bullish={Number(value) > 0} class:bearish={Number(value) < 0}>
	<slot {formatted}>{formatted}</slot>
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

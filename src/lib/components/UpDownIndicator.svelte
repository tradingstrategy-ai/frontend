<!--
@component
Utility component for displaying a value with red/green value color.

#### Usage:
```tsx
	<UpDownIndicator value={priceChange} formatter={formatPriceChange} />
	<UpDownIndicator value={100}>Slot content</UpDownIndicator>
```
-->
<script lang="ts">
	export let value: number | string | undefined | null;
	export let formatter: Function | undefined = undefined;
</script>

<span class="profit-indicator" class:bullish={Number(value) > 0} class:bearish={Number(value) < 0}>
	<slot>{formatter ? formatter(value) : value}</slot>
</span>

<style lang="postcss">
	.bullish {
		&,
		& > :global(*) {
			color: hsla(var(--hsl-bullish));
		}
	}

	.bearish {
		&,
		& > :global(*) {
			color: hsla(var(--hsl-bearish));
		}
	}
</style>

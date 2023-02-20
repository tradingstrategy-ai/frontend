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

<div class="up-down-indicator-wrapper">
	<span class="up-down-indicator" class:bullish={Number(value) > 0} class:bearish={Number(value) < 0}>
		<slot>
			<span class="truncate">
				{formatter ? formatter(value) : value}
			</span>
		</slot>
	</span>
</div>

<style lang="postcss">
	.up-down-indicator-wrapper {
		display: flex;
		justify-content: flex-end;
	}
	.up-down-indicator {
		background: hsla(var(--hsl-box), var(--a-box-b));
		border-radius: var(--radius-sm);
		color: hsla(var(--hsl-text-light));
		display: grid;
		gap: var(--space-xxs);
		padding: var(--space-ss) var(--space-ms) !important;
		text-align: right;
		transition: all var(--time-sm) ease-out;

		& :global > * {
			font: var(--f-ui-sm-medium);
		}

		&.bullish {
			& {
				background: hsla(var(--hsl-bullish), 0.12);
				color: hsla(var(--hsl-bullish));
			}

			&:hover {
				background: hsla(var(--hsl-bullish), 0.24) !important;
			}
		}

		&.bearish {
			& {
				background: hsla(var(--hsl-bearish), 0.12);
				color: hsla(var(--hsl-bearish));
			}

			&:hover {
				background: hsla(var(--hsl-bearish), 0.24) !important;
			}
		}
	}
</style>

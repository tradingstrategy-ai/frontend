<!--
@component
Container for displaying a set of trading data key/value pairs. Use with <TradingDataInfoRow>

@example

```svelte
<TradingDataInfo>
  <TradingDataInfoRow ... />
  <TradingDataInfoRow ... />
</TradingDataInfo>
```
-->
<dl class="trading-data-info">
	<slot />
</dl>

<style>
	.trading-data-info {
		display: grid;
		grid-template-columns: auto auto;
		gap: var(--space-sl);
		margin: 0;

		:global(> *) {
			margin: 0;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
</style>

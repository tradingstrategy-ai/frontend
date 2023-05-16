<!--
@component
Container for displaying a set of trading data key/value pairs. Use with <TradingDataInfoRow>

#### Usage
```tsx
<TradingDataInfo>
  <TradingDataInfoRow ... />
  <TradingDataInfoRow ... />
</TradingDataInfo>
```
-->
<dl class="trading-data-info">
	<slot />
</dl>

<style lang="postcss">
	.trading-data-info {
		display: grid;
		grid-template-columns: auto auto;
		gap: var(--space-sl);
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;

		& :global > * {
			margin: 0;
		}
	}
</style>

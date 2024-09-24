<!--
@component
Display a single row of trading data (should be nested in <TradingDataInfo>). Accepts
`label` and `value` as a prop or named slot (e.g., to add additional styling or an
anchor tag).

#### Usage
```tsx
	<TradingDataInfo>
		<TradingDataInfoRow label="Row label" value="Row value"	/>
		<TradingDataInfoRow label="Row label">
			<a slot="value" href="http://example.com">
				Linked row value
			</a>
		</TradingDataInfoRow>
	</TradingDataInfo>
```
-->
<script lang="ts">
	export let label = '';
	export let value: string | number = '';
</script>

<dt>
	<slot name="label">{label}</slot>
</dt>
<dd>
	<slot name="value">{value}</slot>
</dd>

<style>
	dt {
		font: var(--f-ui-large-medium);
	}

	dd {
		font: var(--f-ui-large-bold);
	}

	:is(dt, dd) :global(a) {
		font: inherit;
		text-decoration: underline;
	}
</style>

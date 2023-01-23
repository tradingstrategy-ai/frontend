<!--
@component
Display a single row of trading data (should be nested in <TradingDataInfo>)

#### Usage
```tsx
	<TradingDataInfo>
		<TradingDataInfoRow
			label="Row label"
			labelHref="http://optional.label.href"
			value="Row value"
			valueHref="http://optional.value.href"
			class="optional-css-class"
		/>
	</TradingDataInfo>
```
-->
<script lang="ts">
	export let label: string;
	export let labelHref: string = '';
	export let value: string | number;
	export let valueHref: string = '';
	let className: string = '';
	export { className as class };
</script>

<dt>
	{#if labelHref}<a href={labelHref}>{label}</a>{:else}{label}{/if}
</dt>
<dd class={className}>
	{#if valueHref}<a href={valueHref}>{value}</a>{:else}{value}{/if}
</dd>

<style lang="postcss">
	dt {
		font: var(--f-ui-large-medium);
	}

	dd {
		font: var(--f-ui-large-bold);
	}

	a {
		font: inherit;
		text-decoration: underline;
	}
</style>

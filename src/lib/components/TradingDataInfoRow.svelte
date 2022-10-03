<!--
@component
Display a single row of trading data (should be nested in a <table>)

#### Usage
```tsx
	<TradingDataInfoRow
		label="Row label"
		labelHref="http://optional.label.href"
		value="Row value"
		valueHref="http://optional.value.href"
		class="optional-css-class"
	/>
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

<tr>
	<th scope="row">
		{#if labelHref}<a href={labelHref}>{label}</a>{:else}{label}{/if}
	</th>
	<td class={className}>
		{#if valueHref}<a href={valueHref}>{value}</a>{:else}{value}{/if}
	</td>
</tr>

<style lang="postcss">
	tr {
		&:not(:first-child) > * {
			padding-top: 0.375rem;
		}

		&:not(:last-child) > * {
			padding-bottom: 0.375rem;
		}

		& th {
			font: var(--f-ui-large-medium);
		}

		& td {
			font: var(--f-ui-large-bold);
		}

		& a {
			font: inherit;
			text-decoration: underline;
		}
	}
</style>

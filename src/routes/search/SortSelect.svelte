<!--
@component
Used for advanced searches; custom drop-down component for selecting from a
pre-defined set of sort options.

#### Usage:
```tsx
  <SortSelect bind:value />
```
-->
<script context="module" lang="ts">
	const options = {
		'tvl:desc': {
			label: '▼ TVL',
			params: ['tvl:desc', 'pool_swap_fee:asc', '_text_match:desc']
		},

		'volume:desc': {
			label: '▼ Volume',
			params: ['volume_24h:desc', 'pool_swap_fee:asc', '_text_match:desc']
		},

		'price_change:desc': {
			label: '▼ Price change',
			params: ['price_change_24h:desc', 'pool_swap_fee:asc', '_text_match:desc']
		},

		'price_change:asc': {
			label: '▲ Price change',
			params: ['price_change_24h:asc', 'pool_swap_fee:asc', '_text_match:desc']
		},

		'variable_borrow_apr:asc': {
			label: '▲ Borrow APR',
			params: ['_eval(variable_borrow_apr:>0):desc', 'variable_borrow_apr:asc', '_text_match:desc']
		},

		'supply_apr:desc': {
			label: '▼ Supply APR',
			params: ['supply_apr:desc', '_text_match:desc']
		}
	};

	type SortKey = keyof typeof options;

	export function getSortParams(key: SortKey): string[] {
		const sortOption = options[key] || Object.values(options)[0];
		return sortOption.params;
	}
</script>

<script lang="ts">
	import { Select } from '$lib/components';
	export let value: string;

	if (!(value in options)) {
		value = Object.keys(options)[0];
	}
</script>

<div class="sort-select">
	<Select bind:value>
		{#each Object.entries(options) as [key, option] (key)}
			<option value={key}>
				{option.label}
			</option>
		{/each}
	</Select>
</div>

<style>
	.sort-select {
		min-width: 11rem;
	}
</style>

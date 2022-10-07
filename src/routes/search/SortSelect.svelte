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
	export const sortOptions = {
		liquidity: {
			label: '▼ liquidity',
			direction: 'desc',
			value: ['liquidity:desc', '_text_match:desc']
		},

		volume: {
			label: '▼ volume',
			direction: 'desc',
			value: ['volume_24h:desc', '_text_match:desc']
		},

		priceChangeDesc: {
			label: '▼ price change',
			direction: 'desc',
			value: ['price_change_24h:desc', '_text_match:desc']
		},

		priceChangeAsc: {
			label: '▲ price change',
			direction: 'asc',
			value: ['price_change_24h:asc', '_text_match:desc']
		}
	};
</script>

<script lang="ts">
	import { DropDown } from '$lib/components';
	export let value: string;
</script>

<DropDown bind:value size="xl">
	{#each Object.entries(sortOptions) as [key, option] (key)}
		<option value={key}>
			{option.label}
		</option>
	{/each}
</DropDown>

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
			label: '▼ Liquidity',
			value: ['liquidity:desc', '_text_match:desc']
		},

		volume: {
			label: '▼ Volume',
			value: ['volume_24h:desc', '_text_match:desc']
		},

		priceChangeDesc: {
			label: '▼ Price change',
			value: ['price_change_24h:desc', '_text_match:desc']
		},

		priceChangeAsc: {
			label: '▲ Price change',
			value: ['price_change_24h:asc', '_text_match:desc']
		}
	};
</script>

<script lang="ts">
	import { DropDown } from '$lib/components';
	export let value: string;
</script>

<DropDown bind:value size="xl" --drop-down-width="100%">
	{#each Object.entries(sortOptions) as [key, option] (key)}
		<option value={key}>
			{option.label}
		</option>
	{/each}
</DropDown>

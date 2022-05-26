<!--
@component
Displays filter options for numeric filter search fields; dispatches valid
Typesense filter on:change.

#### Usage:
```tsx
  <NumericFilter
    bind:selected
    fieldName="numeric_field"
    filters={[filter1, filter2, ...]}
    labels={[label1, label2, ...]}
    on:change={({ fieldName, filter }) => setFilter(filter) )}
  />
```
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Filter from './_Filter.svelte';

	export let fieldName: string;
	export let selected: string[] = [];
	export let filters: string[] = [];
	export let labels: string[] = [];

	const options = filters.map((filter, idx) => {
		return {
			label: labels[idx],
			value: `${fieldName}:${filters[idx]}`
		};
	});

	const dispatch = createEventDispatcher();
	$: dispatch('change', { fieldName, filter: selected.join(' && ') });
</script>

<Filter bind:selected {fieldName} {options} />

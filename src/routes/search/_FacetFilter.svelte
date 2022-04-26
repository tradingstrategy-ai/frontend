<!--
@component
Display filter options for facet-based search fields; dispatches valid Typesense
filter on:change.

#### Usage:
```tsx
  <FacetFilter
    bind:selected
    fieldName="facet_field"
    options={[option1, option2]}
    on:change={({ fieldName, filter }) => setFilter(filter) )}
  />
```
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
  import Filter from "./_Filter.svelte";
  import type { FilterOption } from "./_Filter.svelte";

  export let fieldName: string;
  export let options: FilterOption[];
  export let selected: string[] = [];

  const dispatch = createEventDispatcher();
  $: dispatch("change", { fieldName, filter: getFilter(selected) });

  function getFilter(values) {
    return values.length ? `${fieldName}:=[${values}]` : null;
  }
</script>

<Filter bind:selected {fieldName} {options} />

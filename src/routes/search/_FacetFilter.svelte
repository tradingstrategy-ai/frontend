<!--
@component
**FacetFilter** extends the standard **Filter** component by dispatching a `filter`
string that can be used for filtering facet-based fields in Typesense searches.
- `options` must include a `value` prop; may include `label` and `count`
- selected values are assigned to the `selected` array
- the generated `filter` string is dispatched `on:change`

#### Usage:
```tsx
  <Filter bind:selected fieldName="product_types"
    options={[{ value: "shoes" }]}
    on:change={({ fieldName, filter }) => ... )}
  />
```
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
  import Filter, { FilterOption } from "./_Filter.svelte";

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

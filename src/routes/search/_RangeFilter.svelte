<!--
@component
**RangeFilter** extends the standard **Filter** component by dispatching a `filter`
string that can be used for filtering numeric fields in Typesense searches.
- `breakpoints` should be an array of numbers in ascending or descending order;
±`Infinity` can be included at start/end to search all values greater/lesser
- `formatter` (optional) formats values in auto-generated labels
- `labels` (optional) array of labels - overrides auto-generated labels
- selected values are assigned to the `selected` array
- the generated `filter` string is dispatched `on:change`.

#### Usage:
```tsx
  <Filter bind:selected fieldName="price"
    breakpoints={[0, 100, 1000, 10000, Infinity]}
    formatter={formatDollar} labels={['free',,,'expensive']}
    on:change={({ fieldName, filter }) => ... )}
  />
```
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
  import Filter from "./_Filter.svelte";

  export let fieldName: string;
  export let breakpoints: number[];
  export let selected: [number, number][] = [];
  export let labels: string[] = [];

  // default formatter returns value unchanged
  export let formatter = (n: number) => n;

  const dispatch = createEventDispatcher();  
  $: dispatch("change", { fieldName, filter: getFilter(selected) });

  const options = [];
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const value = breakpoints.slice(i, i + 2);
    const label = labels[i] || getLabel(value);
    options.push({ label, value });
  }

  function getLabel(range) {
    const [ min, max ] = range.sort();
    if (Number.isFinite(min) && Number.isFinite(max)) {
      return `${formatter(min)} - ${formatter(max)}`;
    } else if (Number.isFinite(min)) {
      return `> ${formatter(min)}`;
    } else if (Number.isFinite(max)) {
      return `< ${formatter(max)}`;
    }
  }

  function getFilter(values) {
    const allValues = values.flat();
    if (allValues.length > 0) {
      const min = Math.min(...allValues);
      const max = Math.max(...allValues);
      const filters = [];
      if (Number.isFinite(min)) filters.push(`${fieldName}:>=${min}`);
      if (Number.isFinite(max)) filters.push(`${fieldName}:<${max}`);
      return filters.join(" && ");
    }
  }
</script>

<Filter bind:selected {fieldName} {options} />

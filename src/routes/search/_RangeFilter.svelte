<!--
@component
Displays filter options as ranges for numeric filter search fields; generates
range options based on breakpoints; dispatches valid Typesense filter on:change.

#### Usage:
```tsx
  <RangeFilter
    bind:selected
    fieldName="range_field"
    breakpoints={[0, 100, 1000, 10000, Infinity]}
    formatter={formatFunction}
    labels={[label1, label2, ...]}
    on:change={({ fieldName, filter }) => setFilter(filter) )}
  />
```
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
  import Filter from "./_Filter.svelte";

  export let fieldName: string;
  export let selected: [number, number][] = [];

  /** array of numbers in ascending or descending order */
  export let breakpoints: number[];

  /** formats values in auto-generated labels; default: `toLocaleString("en")` */
  export let formatter = (n: number) => n.toLocaleString("en");

  /** override auto-generated labels */
  export let labels: string[] = [];

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

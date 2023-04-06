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
<script context="module" lang="ts">
	const defaultFormatter: Formatter<number> = (n) => n.toLocaleString('en');

	export function generateOptions(breakpoints: number[], labels: string[] = [], formatter = defaultFormatter) {
		const options = [];
		for (let i = 0; i < breakpoints.length - 1; i++) {
			const range = breakpoints.slice(i, i + 2);
			const label = labels[i] || getLabel(range, formatter);
			const value = range.join('-');
			options.push({ label, value });
		}
		return options;
	}

	export function getLabel(range: number[], formatter = defaultFormatter) {
		const [min, max] = [Math.min(...range), Math.max(...range)];
		if (Number.isFinite(min) && Number.isFinite(max)) {
			return `${formatter(min)} - ${formatter(max)}`;
		} else if (Number.isFinite(min)) {
			return `> ${formatter(min)}`;
		} else if (Number.isFinite(max)) {
			return `< ${formatter(max)}`;
		}
	}

	export function getFilter(fieldName: string, values: string[]) {
		const allValues = values.flatMap((v) => v.split('-')).map(Number);
		if (allValues.length > 0) {
			const [min, max] = [Math.min(...allValues), Math.max(...allValues)];
			const filters = [];
			if (Number.isFinite(min)) filters.push(`${fieldName}:>=${min}`);
			if (Number.isFinite(max)) filters.push(`${fieldName}:<${max}`);
			return filters.join(' && ');
		}
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Filter from './Filter.svelte';

	export let fieldName: string;
	export let selected: string[] = [];

	/** array of numbers in ascending or descending order */
	export let breakpoints: number[];

	/** formats values in auto-generated labels; default: `toLocaleString("en")` */
	export let formatter: Formatter<number> | undefined = undefined;

	/** override auto-generated labels */
	export let labels: string[] = [];

	const options = generateOptions(breakpoints, labels, formatter);

	const dispatch = createEventDispatcher();
	$: dispatch('change', { fieldName, filter: getFilter(fieldName, selected) });
</script>

<Filter bind:selected {fieldName} {options} />

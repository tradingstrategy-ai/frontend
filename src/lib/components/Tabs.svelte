<!--
@component
Display tabs and associated content panels. Optional `selected` prop defaults to first tab key. Use
`let:selected` to access state inside the component, or `bind:selected={someVar}` to access outside.

#### Usage
```tsx
	<Tabs items={overview: 'Overview', details: 'Details' } let:selected on:change={handleChange}>
		{#if selected === 'overview'}
			<OverviewComponent />
		{:else if selected === 'details'}
			<DetailsComponent />
		{/if}
	</Tabs>
```
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type Item = string | { label: string };
	export let items: Record<string, Item>;
	export let selected: string = Object.keys(items)[0];

	const uid = crypto.randomUUID().slice(0, 8);

	const dispatch = createEventDispatcher();

	function dispatchChange() {
		dispatch('change', { value: selected });
	}
</script>

<section class="tabs">
	{#each Object.entries(items) as [key, value]}
		{@const id = `${uid}-${key}`}
		{@const label = typeof value === 'string' ? value : value.label}
		<input {id} type="radio" name={uid} bind:group={selected} value={key} on:change={dispatchChange} />
		<label for={id}>{label}</label>
	{/each}

	<div class="content">
		<slot {selected} />
	</div>
</section>

<style lang="postcss">
	input {
		display: none;
	}

	label {
		display: inline-block;
		border-radius: var(--radius-md);
		color: var(--c-text-extra-light);
		cursor: pointer;
		padding: var(--space-md);
		font: var(--f-ui-lg-medium);

		input:checked + & {
			background: var(--c-box-2);
			color: var(--c-text);
			cursor: auto;
		}
	}

	.content {
		padding: var(--tab-padding);
	}
</style>

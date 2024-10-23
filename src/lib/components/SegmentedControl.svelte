<!--
@component
Control for selecting a one value from a set of values, displayed as a horizontal
button-like control with a segement for each possible value.

@example

```svelte
	<SegmentedControl options={['red', 'yellow', 'green']} bind:selected />
```
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let name: string | undefined = undefined;
	export let selected: string | undefined = undefined;
	export let options: readonly string[];
	export let secondary = false;

	const dispatch = createEventDispatcher();

	function dispatchChange(this: HTMLInputElement) {
		dispatch('change', {
			name: this.name,
			value: this.value
		});
	}
</script>

<div class="segmented-control ds-3 {secondary ? 'secondary' : 'primary'}" data-css-props>
	{#each options as option}
		<label class:selected={option === selected}>
			<div><slot {option}>{option}</slot></div>
			<input type="radio" {name} bind:group={selected} value={option} on:change={dispatchChange} />
		</label>
	{/each}
</div>

<style>
	[data-css-props] {
		--segmented-control-font: var(--f-ui-sm-medium);
		--segmented-control-letter-spacing: var(--ls-ui-sm);
	}

	.primary {
		--gap: 1px;
		--padding: 0.75em 1em;
		--background-default: var(--c-box-4);
		--background-selected: var(--c-text);
		--color-selected: var(--c-text-inverted);
	}

	.secondary {
		--gap: 2px;
		--padding: 0.75em;
		--background-selected: var(--c-box-3);
		--border-radius: 2em;
	}

	.segmented-control {
		display: grid;
		grid-auto-flow: column;
		gap: var(--gap);
		overflow: hidden;
	}

	label {
		display: flex;
		justify-content: center;
		align-items: center;
		background: var(--background-default, inherit);
		padding: var(--padding);
		border-radius: var(--border-radius, inherit);
		font: var(--segmented-control-font);
		letter-spacing: var(--segmented-control-letter-spacing, normal);
		transition: all var(--time-sm) ease-out;
		text-align: center;

		.primary & {
			&:first-child {
				border-radius: var(--radius-md) 0 0 var(--radius-md);

				div {
					padding-left: 0.25rem;
				}
			}

			&:last-child {
				border-radius: 0 var(--radius-md) var(--radius-md) 0;

				div {
					padding-right: 0.25rem;
				}
			}
		}

		&:not(.selected) {
			cursor: pointer;
		}

		&:is(:hover, .selected) {
			color: var(--color-selected, inherit);
			background: var(--background-selected, inherit);
		}
	}

	input {
		display: none;
	}
</style>

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
	import type { Snippet } from 'svelte';

	interface Props {
		name?: string;
		selected?: string | undefined;
		options: readonly string[];
		secondary?: boolean;
		children?: Snippet<[string]>;
		onchange?: (event: { name: string | undefined; value: string }) => void;
	}

	let { name, selected = $bindable(), options, secondary = false, children, onchange }: Props = $props();

	function dispatchChange(this: HTMLInputElement) {
		onchange?.({ name: this.name, value: this.value });
	}
</script>

<div class="segmented-control ds-3 {secondary ? 'secondary' : 'primary'}" data-css-props>
	{#each options as option (option)}
		<label class:selected={option === selected}>
			<div>
				{#if children}
					{@render children(option)}
				{:else}
					{option}
				{/if}
			</div>
			<input type="radio" {name} bind:group={selected} value={option} onchange={dispatchChange} />
		</label>
	{/each}
</div>

<style>
	[data-css-props] {
		--segmented-control-font: var(--f-ui-sm-medium);
		--segmented-control-letter-spacing: var(--ls-ui-sm);
		--segmented-control-padding: var(--padding);
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
		padding: var(--segmented-control-padding);
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

<!--
@component
Control for selecting a one value from a set of values, displayed as a horizontal
button-like control with a segement for each possible value.

#### Usage:
```tsx
	<SegmentedControl options={['red', 'yellow', 'green']} bind:selected />
```
-->
<script lang="ts">
	export let selected: string | undefined = undefined;
	export let options: string[];
</script>

<div class="segmented-control">
	{#each options as option}
		<label class:selected={option === selected}>
			<span>{option}</span>
			<input type="radio" bind:group={selected} value={option} />
		</label>
	{/each}
</div>

<style lang="postcss">
	.segmented-control {
		display: flex;
		gap: 1px;
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	label {
		background: hsla(var(--hsl-box), var(--a-box-d));
		padding: var(--space-sm) var(--space-md);
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--f-ui-sm-spacing, normal);
		color: hsla(var(--hsl-text));
		transition: all var(--time-sm) ease-out;

		@media (--viewport-sm-down) {
			padding: var(--space-ss) var(--space-sl);
			font: var(--f-ui-xs-medium);
			letter-spacing: var(--f-ui-xs-spacing, normal);
		}

		&:first-child span {
			padding-left: var(--space-xxs);
		}

		&:last-child span {
			padding-right: var(--space-xxs);
		}

		&:not(.selected) {
			cursor: pointer;
		}

		&:hover,
		&.selected {
			background: hsla(var(--hsl-text), 1);
			color: hsla(var(--hsl-text-inverted));
		}
	}

	input {
		display: none;
	}
</style>

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
	export let secondary = false;

	$: kind = secondary ? 'secondary' : 'primary';
</script>

<div class="segmented-control {kind}">
	{#each options as option}
		<label class:selected={option === selected}>
			<span>{option}</span>
			<input type="radio" bind:group={selected} value={option} on:change />
		</label>
	{/each}
</div>

<style lang="postcss">
	.primary {
		--gap: 1px;
		--padding: var(--space-sm) var(--space-md);
		--background-default: hsl(var(--hsla-box-4));
		--background-selected: hsl(var(--hsl-text));
		--color-selected: hsl(var(--hsl-text-inverted));

		@media (--viewport-sm-down) {
			--padding: var(--space-ss) var(--space-sl);
		}
	}

	.secondary {
		--gap: 2px;
		--padding: 0.75em;
		--background-selected: hsl(var(--hsla-box-3));
		--border-radius: 2em;
	}

	.segmented-control {
		display: flex;
		gap: var(--gap);
		overflow: hidden;
	}

	label {
		background: var(--background-default, inherit);
		padding: var(--padding);
		border-radius: var(--border-radius, inherit);

		font: var(--f-ui-sm-medium);
		letter-spacing: var(--f-ui-sm-spacing, normal);
		transition: all var(--time-sm) ease-out;

		@media (--viewport-sm-down) {
			font: var(--f-ui-xs-medium);
			letter-spacing: var(--f-ui-xs-spacing, normal);
		}

		.primary & {
			&:first-child {
				border-radius: var(--radius-md) 0 0 var(--radius-md);

				span {
					padding-left: var(--space-xxs);
				}
			}

			&:last-child {
				border-radius: 0 var(--radius-md) var(--radius-md) 0;

				span {
					padding-right: var(--space-xxs);
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

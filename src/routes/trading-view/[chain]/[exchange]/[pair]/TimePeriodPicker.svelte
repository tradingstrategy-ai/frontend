<!--
@component
Radio button options to select a time period.

#### Usage:
```tsx
	<TimePeriodPicker bind:selected />
```
-->
<script lang="ts">
	export let selected: string;

	const periods = ['hourly', 'daily', 'weekly', 'monthly'];
</script>

<form>
	{#each periods as period}
		<label class:selected={period === selected}>
			<span>{period}</span>
			<input type="radio" bind:group={selected} value={period} />
		</label>
	{/each}
</form>

<style lang="postcss">
	form {
		display: flex;
		gap: 1px;
		margin-top: var(--space-sl);
	}

	label {
		flex: 1;
		margin: 0;
		padding-block: var(--space-md);
		background: hsl(var(--hsla-box-4));
		font: var(--f-ui-md-medium);
		text-align: center;
		text-transform: capitalize;
		cursor: pointer;

		&:first-child {
			border-radius: var(--radius-lg) 0 0 var(--radius-lg);

			span {
				padding-left: var(--space-xs);
			}
		}

		&:last-child {
			border-radius: 0 var(--radius-lg) var(--radius-lg) 0;

			span {
				padding-right: var(--space-xs);
			}
		}

		&.selected {
			background: hsl(var(--hsl-text));
			color: hsl(var(--hsl-text-inverted));
		}
	}

	input {
		display: none;
	}
</style>

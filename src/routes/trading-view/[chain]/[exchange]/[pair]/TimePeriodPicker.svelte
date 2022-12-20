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
			{period}
			<input type="radio" bind:group={selected} value={period} />
		</label>
	{/each}
</form>

<style lang="postcss">
	form {
		display: flex;
		margin-top: var(--space-sm);
	}

	label {
		flex: 1;
		border: 2px solid var(--c-border-2-v1);
		margin: 0;
		padding-block: var(--space-md);
		font: var(--f-ui-large-medium);
		text-align: center;
		text-transform: capitalize;
		cursor: pointer;

		&:not(:first-child) {
			border-left-width: 1px;
		}

		&:not(:last-child) {
			border-right-width: 1px;
		}

		&.selected {
			background: var(--c-background-3-v1);
			color: var(--c-text-6-v1);
		}
	}

	input {
		display: none;
	}
</style>

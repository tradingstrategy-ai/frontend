<!--
@component
Uses together with SummaryBox to display a set of summary properties / statistics.
`value` may either be passed as a prop or as slot content if additional markup is required.

#### Usage
```tsx
<SummaryBox title="Fruits">
	<SummaryBoxItem label="Banana" value="Minions favorite" />
	<SummaryBoxItem label="Tomato">yes, it's <em>is</em> a fruit!</SummaryBoxItem>
</SummaryBox>
```
-->
<script lang="ts">
	export let label: string;
	export let value: string | undefined = undefined;
	export let valueClass: string = '';
</script>

<div>
	<span class="label">{label}</span>
	<span class="value {valueClass}"><slot>{value}</slot></span>
</div>

<style lang="postcss">
	div {
		border-radius: 1.25rem;
		background: var(--c-background-4);
		display: grid;
		gap: 0.5rem;
		padding: 1.25rem;
	}

	.label {
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-md-spacing);
		color: var(--c-text-light);
	}

	.value {
		font: var(--f-ui-xxxl-medium);
		letter-spacing: var(--f-ui-xxxl-spacing);

		@media (--viewport-md-down) {
			font: var(--f-ui-xl-medium);
			letter-spacing: var(--f-ui-xl-spacing);
		}
	}
</style>

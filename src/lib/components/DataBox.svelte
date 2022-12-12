<!--
@component
Uses together with SummaryBox or DataBoxes to display a set of properties / statistics.
`value` may either be passed as a prop or as slot content if additional markup is required.

#### Usage
```tsx
<SummaryBox title="Fruits">
	<DataBox label="Banana" value="Minions favorite" />
	<DataBox label="Tomato">yes, it's <em>is</em> a fruit!</DataBox>
</SummaryBox>
```
-->
<script lang="ts">
	export let label: string;
	export let value: string | undefined = undefined;
	export let valueClass: string = '';
</script>

<div class="data-box">
	<span class="label">{label}</span>
	<span class="value {valueClass}"><slot>{value}</slot></span>
</div>

<style lang="postcss">
	.data-box {
		border-radius: var(--border-radius-md);
		background: var(--c-background-5);
		display: grid;
		gap: 0.875rem;
		padding: 1.5rem;
	}

	.label {
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-md-spacing, normal);
		color: var(--c-text-extra-light);
	}

	.value {
		font: var(--f-ui-xxl-medium);
		letter-spacing: var(--f-ui-xxl-spacing, normal);

		@media (--viewport-md-down) {
			font: var(--f-ui-xl-medium);
			letter-spacing: var(--f-ui-xl-spacing, normal);
		}

		& :global a {
			font: inherit;
			text-decoration: underline;
		}
	}
</style>

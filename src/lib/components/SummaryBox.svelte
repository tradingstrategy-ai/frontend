<!--
@component
Uses together with DataBox to display a set of summary properties / statistics.

#### Usage
```tsx
	<SummaryBox title="Fruits">
		<DataBox label="Banana" value="Minions favorite" />
	</SummaryBox>
```
-->
<script lang="ts">
	export let title: string;
</script>

<section class="summary-box">
	<h3>{title}</h3>
	<slot />
</section>

<style lang="postcss">
	.summary-box {
		background: var(--c-background-5);
		border-radius: 1.25rem;
		display: grid;
		gap: 1.25rem;
		padding: 1.5rem 1.25rem;

		@media (--viewport-md-down) {
			gap: 1rem;
		}

		& h3 {
			font: var(--f-ui-xl-medium);
		}
	}

	.summary-box :global .data-box {
		background: var(--c-background-4);
		gap: 0.5rem;
		padding: 1.25rem;

		& .label {
			color: var(--c-text-light);
		}

		& .value {
			font: var(--f-ui-xxxl-medium);
			letter-spacing: var(--f-ui-xxxl-spacing, normal);
		}
	}
</style>

<!--
@component
Uses together with SummaryBoxItem to display a set of summary properties / statistics.

#### Usage
```tsx
	<SummaryBox title="Fruits">
		<SummaryBoxItem label="Banana" value="Minions favorite" />
	</SummaryBox>
```
-->
<script lang="ts">
	export let title: string;
</script>

<section>
	<h3>{title}</h3>
	<slot />
</section>

<style lang="postcss">
	section {
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
</style>

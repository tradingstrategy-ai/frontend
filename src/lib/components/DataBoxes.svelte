<!--
@component
Display a set of DataBox elements in a responsive grid.

#### Usage:
```tsx
	<DataBoxes>
		<DataBox label="Item 1 label" value="Item 1 value" />
		<DataBox label="Item 2 label" value="Item 2 value" />
	</DataBoxes>
```
-->
<section class="data-boxes">
	<slot />
</section>

<style lang="postcss">
	.data-boxes {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr));

		@media (--viewport-sm-down) {
			gap: 1rem;
		}
	}
</style>

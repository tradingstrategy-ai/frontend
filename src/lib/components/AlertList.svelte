<!--
@component
Display an alert callout box. This should only include AlertItem components
as children. The alert box is only displayed if one or more items are displayed
(based on their `displayWhen` prop).

#### Usage:
```tsx
	<AlertList>
		<AlertItem title="Optional title" displayWhen={boolean_defaults_to_true}>
			Warning message – e.g., data on this page may be incomplete!
		</AlertItem>
	</AlertList>
```
-->
<ul><slot /></ul>

<style lang="postcss">
	ul {
		display: grid;
		gap: 1.5rem;
		max-width: 1020px;
		margin-inline: auto;
		padding: 1.5rem;
		border: 2px solid var(--c-bearish);
		list-style: none;

		@media (--viewport-md-down) {
			padding: 1rem;
		}

		&:empty {
			display: none;
		}
	}
</style>

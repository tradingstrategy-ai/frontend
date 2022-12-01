<!--
@component
Display an alert callout box. This should only include AlertItem components
as children. The alert box is only displayed if one or more items are displayed
(based on their `displayWhen` prop).

#### Usage:
```tsx
	<AlertList status="warning">
		<AlertItem title="Optional title" displayWhen={boolean_defaults_to_true}>
			Warning message – e.g., data on this page may be incomplete!
		</AlertItem>
	</AlertList>
```
-->
<script lang="ts">
	export let status: 'error' | 'success' | 'warning' = 'error';
</script>

<ul class="alert-list {status}"><slot /></ul>

<style lang="postcss">
	.alert-list {
		border: 2px solid;
		border-radius: var(--border-radius-sm);
		display: grid;
		gap: 1.5rem;
		list-style: none;
		margin-inline: auto;
		padding: 2.5rem;
		font: var(--f-ui-xl-roman);
		letter-spacing: var(--f-ui-xl-spacing);

		@media (--viewport-md-down) {
			gap: 1.25rem;
			padding: 2rem;
			font: var(--f-ui-lg-roman);
			letter-spacing: var(--f-ui-lg-spacing);
		}

		@media (--viewport-sm-down) {
			gap: 1rem;
			padding: 1.5rem;
			font: var(--f-ui-md-roman);
			letter-spacing: var(--f-ui-md-spacing);
		}

		&:empty,
		&:-moz-only-whitespace {
			display: none;
		}

		/* For Chrome and Safari; don't combine with above selector */
		&:not(:has(li)) {
			display: none;
		}
	}

	.error {
		background: hsl(var(--hsl-error), 0.1);
		border-color: hsl(var(--hsl-error), 1);
	}

	.success {
		background: hsl(var(--hsl-success), 0.1);
		border-color: hsl(var(--hsl-success), 1);
	}

	.warning {
		background: hsl(var(--hsl-warning), 0.1);
		border-color: hsl(var(--hsl-warning), 1);
	}
</style>

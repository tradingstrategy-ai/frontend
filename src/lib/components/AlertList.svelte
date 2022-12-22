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
	let classes = '';
	export { classes as class };
	export let status: 'error' | 'success' | 'warning' = 'error';
</script>

<ul class="alert-list {status} {classes}"><slot /></ul>

<style lang="postcss">
	.alert-list {
		width: 100%;
		border: 2px solid;
		border-radius: var(--radius-sm);
		display: grid;
		gap: var(--space-lg);
		list-style: none;
		margin-inline: auto;
		padding: 2.5rem;
		font: var(--f-ui-xl-roman);
		letter-spacing: var(--f-ui-xl-spacing, normal);

		@media (--viewport-md-down) {
			gap: var(--space-ls);
			padding: var(--space-xl);
			font: var(--f-ui-lg-roman);
			letter-spacing: var(--f-ui-lg-spacing, normal);
		}

		@media (--viewport-sm-down) {
			gap: var(--space-md);
			padding: var(--space-lg);
			font: var(--f-ui-md-roman);
			letter-spacing: var(--f-ui-md-spacing, normal);
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

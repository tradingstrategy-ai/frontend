<!--
@component
Display an alert callout box. This should only include `AlertItem` components
as children. If you only need to display a single `AlertItem`, try the `Alert`
component instead.

#### Usage:
```tsx
	<AlertList status="warning" let:AlertItem>
		<AlertItem title="Optional title">
			Warning message – e.g., data on this page may be incomplete!
		</AlertItem>
	</AlertList>
```
-->
<script lang="ts">
	import { AlertItem } from '$lib/components';

	export let size: 'xs' | 'sm' | 'md' | 'lg' = 'lg';
	export let status: 'error' | 'success' | 'warning' | 'info' = 'error';
</script>

<ul class="alert-list {size} {status}"><slot {AlertItem} /></ul>

<style lang="postcss">
	.alert-list {
		width: 100%;
		border: 2px solid;
		border-radius: var(--radius-sm);
		display: grid;
		list-style: none;
		margin-inline: auto;
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

	.info {
		background: hsl(var(--hsl-box), var(--a-box-a));
		border-color: hsl(var(--hsl-box), var(--a-box-c));
	}

	.lg {
		gap: var(--space-lg);
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
	}

	.md {
		gap: var(--space-ml);
		padding: var(--space-ml);
		font: var(--f-ui-lg-roman);
		letter-spacing: var(--f-ui-lg-spacing, normal);

		@media (--viewport-md-down) {
			gap: var(--space-ml);
			padding: var(--space-md);
			font: var(--f-ui-md-roman);
			letter-spacing: var(--f-ui-md-spacing, normal);
		}
	}

	.sm {
		gap: var(--space-md);
		padding: var(--space-sl);
		font: var(--f-ui-md-roman);
		letter-spacing: var(--f-ui-md-spacing, normal);

		@media (--viewport-md-down) {
			gap: var(--space-sl);
			padding: var(--space-sl);
			font: var(--f-ui-sm-roman);
			letter-spacing: var(--f-ui-sm-spacing, normal);
		}
	}

	.xs {
		gap: var(--space-ss);
		padding: var(--space-sm);
		font: var(--f-ui-sm-roman);
		letter-spacing: var(--f-ui-sm-spacing, normal);
	}
</style>

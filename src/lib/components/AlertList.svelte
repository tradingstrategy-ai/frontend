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

<style>
	.alert-list {
		display: grid;
		width: 100%;
		border: 2px solid;
		border-radius: var(--radius-sm);
		margin-inline: auto;
		list-style: none;
		color: var(--c-text);
	}

	.error {
		background: color-mix(in srgb, transparent, var(--c-error) 10%);
		border-color: var(--c-error);
	}

	.success {
		background: color-mix(in srgb, transparent, var(--c-success) 10%);
		border-color: var(--c-success);
	}

	.warning {
		background: color-mix(in srgb, transparent, var(--c-warning) 10%);
		border-color: var(--c-warning);
	}

	.info {
		background: var(--c-box-1);
		border-color: var(--c-box-3);
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

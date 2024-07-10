<!--
@component
Display a single alert item (should always be nested within AlertList).

#### Usage:
```tsx
	<AlertItem title="Optional title">
		Warning message – e.g., data on this page may be incomplete!
	</AlertItem>
```
-->
<script lang="ts">
	import IconWarning from '~icons/local/warning';

	export let title = '';
</script>

<li class="alert-item">
	<IconWarning />
	<div class="inner">
		<span class="content">
			{#if title}
				<strong>{title}</strong>
			{/if}
			<span><slot /></span>
		</span>
		{#if $$slots.cta}
			<span class="cta"><slot name="cta" /></span>
		{/if}
	</div>
</li>

<style lang="postcss">
	.alert-item {
		container-type: inline-size;
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-md) var(--space-sm);
		font: inherit; /* see AlertList */

		:global(.icon) {
			transform: translateY(0.125em);
		}

		:global a {
			font-weight: 700;
			text-decoration: underline;
		}

		strong {
			font-weight: 700;

			@media (--viewport-lg-up) {
				&::after {
					content: ':';
				}
			}

			@media (--viewport-md-down) {
				display: block;
			}
		}

		.inner {
			display: grid;
			grid-template-columns: 1fr;
			gap: var(--space-md);

			@container (width > 576px) {
				grid-auto-flow: column;
			}
		}

		.content {
			overflow: hidden;
			overflow-wrap: break-word;
		}

		.cta {
			display: grid;
			align-content: start;
		}
	}
</style>

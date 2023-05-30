<!--
@component
Display a single alert item (should always be nested within AlertList).

#### Usage:
```tsx
	<AlertItem title="Optional title" displayWhen={boolean_defaults_to_true}>
		Warning message – e.g., data on this page may be incomplete!
	</AlertItem>
```
-->
<script lang="ts">
	import { Icon } from '$lib/components';

	export let title = '';
	export let displayWhen = true;
	export let icon = 'warning';
</script>

{#if displayWhen}
	<li class="alert-item">
		{#if icon}
			<Icon name={icon} />
		{/if}
		<span class="content">
			{#if title}
				<strong>{title}<span class="desktop">:</span></strong>
			{/if}
			<slot />
			<slot name="action" />
		</span>
	</li>
{/if}

<style lang="postcss">
	.alert-item :global {
		align-items: flex-start;
		display: flex;
		gap: var(--space-md) var(--space-sm);
		font: inherit; /* see AlertList */

		& .icon {
			display: block;
			margin-top: -0.1em;
		}

		& .button {
			@media (--viewport-sm-up) {
				width: auto !important;
			}

			& > span {
				white-space: normal;
			}
		}

		& .content {
			align-items: flex-start;
			display: inline-flex;
			flex-wrap: wrap;
			justify-content: space-between;
			gap: var(--space-sl);
		}

		& a {
			font-weight: 700;
			text-decoration: underline;
		}

		& strong {
			font-weight: 700;
		}

		& .desktop {
			@media (--viewport-md-down) {
				display: none;
			}
		}
	}
</style>

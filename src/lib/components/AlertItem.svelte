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
</script>

{#if displayWhen}
	<li class="alert-item">
		<Icon name="warning" />
		<span>
			{#if title}
				<strong>{title}<span class="desktop">:</span></strong>
				<br />
			{/if}
			<slot />
		</span>
	</li>
{/if}

<style lang="postcss">
	.alert-item :global {
		display: flex;
		gap: 0.625em;
		font: inherit; /* see AlertList */

		& .icon {
			display: block;
			margin-top: -0.1em;
		}

		& a {
			font-weight: 700;
			text-decoration: underline;
		}

		& strong {
			font-weight: 700;
		}

		& br {
			margin-bottom: 0.5rem;

			@media (--viewport-lg-up) {
				display: none;
			}
		}

		& .desktop {
			@media (--viewport-md-down) {
				display: none;
			}
		}
	}
</style>

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
		<span class="icon"><Icon name="warning" /></span>
		<span>
			{#if title}
				<strong>{title}:</strong>
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
			margin-top: -2px;
		}

		& a {
			font-weight: 700;
			text-decoration: underline;
		}

		& strong {
			font-weight: 700;
		}
	}
</style>

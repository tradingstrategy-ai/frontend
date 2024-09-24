<!--
@component
Convenience wrapper around `AlertList` and `AlertItem` for the common scenario
of a single alert item.

#### Usage:
```tsx
	<Alert size="md" status="warning" title="Warning">
		Warning message copy.
		<Button slot="cta" ... />
	</Alert>
```
-->

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { AlertList } from '$lib/components';

	type AlertListProps = ComponentProps<AlertList>;

	export let size: AlertListProps['size'] = 'lg';
	export let status: AlertListProps['status'] = 'error';
	export let title = '';
</script>

<div class="alert" class:has-cta={$$slots.cta}>
	<AlertList {size} {status} let:AlertItem>
		<AlertItem {title}>
			<slot />
			<slot slot="cta" name="cta" />
		</AlertItem>
	</AlertList>
</div>

<style>
	.alert {
		display: contents;

		/* can't conditionally include slot, so hide cta in child if not included */
		&:not(.has-cta) :global(.alert-item .cta) {
			display: none;
		}
	}
</style>

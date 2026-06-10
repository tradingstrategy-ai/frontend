<!--
@component
"Update info" button shown on vault protocol, curator and vault detail pages.

Links to the Community page; the tooltip explains that details are updated by
contacting the Trading Strategy Discord server.

@example

```svelte
	<UpdateInfoButton />
	<UpdateInfoButton size="md" />
```
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
	}

	let { size = 'sm' }: Props = $props();
</script>

<Tooltip>
	<Button slot="trigger" {size} secondary href={resolve('/community')}>Update info</Button>
	<svelte:fragment slot="popup">
		Contact us at Trading Strategy Discord server to update any details. Click here for Discord info.
	</svelte:fragment>
</Tooltip>

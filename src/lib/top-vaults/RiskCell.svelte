<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { resolve } from '$app/paths';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import Risk from './Risk.svelte';

	const props: ComponentProps<typeof Risk> = $props();
</script>

<span class="risk-cell">
	<Tooltip>
		<svelte:fragment slot="trigger">
			<Risk {...props} />
		</svelte:fragment>
		<svelte:fragment slot="popup">
			Read more about
			<a href={resolve('/blog/announcing-vault-technical-risk-framework-beta')} target="_blank">
				protocol technical risk
			</a>
		</svelte:fragment>
	</Tooltip>
</span>

<style>
	.risk-cell {
		font: var(--f-ui-xs-medium);
		letter-spacing: 0.02em;

		:global(.popup) {
			right: 0;
			white-space: nowrap;
		}
	}
</style>

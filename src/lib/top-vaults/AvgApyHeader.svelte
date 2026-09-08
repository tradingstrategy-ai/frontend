<!--
@component
Column heading for TVL-weighted average APY values in vault group listings.
-->
<script lang="ts">
	import Tooltip from '$lib/components/Tooltip.svelte';

	interface Props {
		/**
		 * Plain-text column label. Rendered on desktop as the tooltip trigger, and
		 * read back via `getColumnLabel()` for the mobile card label and sort select,
		 * which cannot render this component.
		 */
		label?: string;
		/** Tooltip text describing how the displayed APY was calculated. */
		tooltip?: string;
	}

	let { label = 'Avg. APY%', tooltip = 'Total value locked weighted returns, last 30 days' }: Props = $props();
</script>

<Tooltip>
	<span slot="trigger" class="underline">{label}</span>
	<svelte:fragment slot="popup">{tooltip}</svelte:fragment>
</Tooltip>

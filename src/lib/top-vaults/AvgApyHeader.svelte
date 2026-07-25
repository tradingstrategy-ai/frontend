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
	}

	let { label = 'Avg. APY%' }: Props = $props();

	const avgApyTooltip = 'Total value locked weighted returns, last 30 days';
</script>

<Tooltip>
	<span slot="trigger" class="underline">{label}</span>
	<svelte:fragment slot="popup">{avgApyTooltip}</svelte:fragment>
</Tooltip>

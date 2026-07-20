<!--
@component
Column heading for TVL-weighted average APY values in vault group listings.
-->
<script lang="ts">
	import Tooltip from '$lib/components/Tooltip.svelte';

	const avgApyTooltip = 'Total value locked weighted returns, last 30 days';
</script>

<Tooltip>
	<span slot="trigger" class="underline">Avg. APY%</span>
	<svelte:fragment slot="popup">{avgApyTooltip}</svelte:fragment>
</Tooltip>

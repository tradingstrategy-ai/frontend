<!--
Performance metrics subpage for YAML-configured strategies.
-->
<script lang="ts">
	import VaultPeriodicMetrics from '../../../trading-view/vaults/[vault=slug]/VaultPeriodicMetrics.svelte';

	export let data;

	$: ({ strategy, vaultInfo, chain } = data);
</script>

<svelte:head>
	<title>{strategy.name} – Performance | Trading Strategy</title>
	<meta name="description" content="Performance metrics for {strategy.name}" />
</svelte:head>

{#if vaultInfo && chain}
	<VaultPeriodicMetrics vault={vaultInfo} {chain} showRankings={false} />
{:else}
	<p class="no-data">Performance data is currently unavailable.</p>
{/if}

<style>
	.no-data {
		color: var(--c-text-extra-light);
		font: var(--f-ui-lg-roman);
	}
</style>

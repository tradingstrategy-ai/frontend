<!--
Vault info page for YAML-configured strategies — shows full technical details table.
-->
<script lang="ts">
	import VaultTechnicalDetailsTable from '../../../trading-view/vaults/[vault=slug]/VaultTechnicalDetailsTable.svelte';

	export let data;

	$: ({ strategy, vaultInfo, chain } = data);
</script>

<svelte:head>
	<title>Vault info | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="Vault technical details for {strategy.name} strategy" />
</svelte:head>

{#if vaultInfo && chain}
	<VaultTechnicalDetailsTable vault={vaultInfo} {chain} />
{:else}
	<p class="no-vault">Vault data is currently unavailable.</p>
{/if}

<style>
	.no-vault {
		color: var(--c-text-extra-light);
		font: var(--f-ui-lg-roman);
	}
</style>

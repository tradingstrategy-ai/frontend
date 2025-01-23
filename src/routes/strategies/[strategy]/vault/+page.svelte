<!--
	Page to display vault information. Currently only supports Enzyme.
-->
<script lang="ts">
	import { Button, CryptoAddressWidget, DataBox, EntitySymbol, SummaryBox } from '$lib/components';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { getExplorerUrl } from '$lib/helpers/chain';
	import { createVaultAdapter } from 'trade-executor/vaults';
	import enzymeLogo from '$lib/assets/logos/partners/enzyme.svg?raw';

	export let data;
	const { chain, onChainData, strategy } = data;

	const address = onChainData.smart_contracts.vault;
	const vault = createVaultAdapter(onChainData);
	const explorerUrl = address && getExplorerUrl(chain, address);
</script>

<svelte:head>
	<title>Enzyme vault | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="Enzyme vault information for {strategy.name} strategy" />
</svelte:head>

<section class="vault">
	<SummaryBox title="Vault information" ctaPosition="top">
		<div class="actions" slot="cta">
			{#if vault.depositEnabled()}
				<Button size="xs" label="View on Enzyme" href={vault.externalProviderUrl} rel="noreferrer" target="_blank">
					<img slot="icon" alt="Enzyme" src={getLogoUrl('token', 'enzyme')} />
				</Button>
			{/if}
			{#if explorerUrl}
				<Button size="xs" label="View on {chain.name} explorer" href={explorerUrl} rel="noreferrer" target="_blank">
					<img slot="icon" alt={chain.name} src={getLogoUrl('blockchain', chain.slug)} />
				</Button>
			{/if}
		</div>

		<div class="vault-info">
			<DataBox size="sm" label="Vault type">
				<div class="enzyme-logo">
					{@html enzymeLogo}
				</div>
			</DataBox>

			<DataBox size="sm" label="Blockchain">
				<EntitySymbol label={chain.name} logoUrl={getLogoUrl('blockchain', chain.slug)} />
			</DataBox>

			<DataBox size="sm" label="Address">
				{#if explorerUrl}
					<CryptoAddressWidget {address} href={explorerUrl} />
				{:else}
					---
				{/if}
			</DataBox>
		</div>
	</SummaryBox>
</section>

<style>
	.vault-info {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: inherit;
	}

	/* responsively scale relative to font-size */
	.enzyme-logo {
		width: 9em;
	}

	.actions {
		display: flex;
		gap: var(--space-ml);
		@media (--viewport-sm-down) {
			gap: var(--space-sm);
			flex-direction: column;
		}

		img {
			width: 1.5rem;
		}
	}
</style>

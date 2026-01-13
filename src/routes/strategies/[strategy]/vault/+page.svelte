<!--
	Page to display vault information.
-->
<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import CryptoAddressWidget from '$lib/components/CryptoAddressWidget.svelte';
	import DataBox from '$lib/components/DataBox.svelte';
	import EntitySymbol from '$lib/components/EntitySymbol.svelte';
	import SummaryBox from '$lib/components/SummaryBox.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { getExplorerUrl } from '$lib/helpers/chain';
	import IconArrowRightUp from '~icons/local/arrow-right-up';

	let { data } = $props();
	let { chain, strategy, vault } = $derived(data);
</script>

<svelte:head>
	<title>Enzyme vault | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="Enzyme vault information for {strategy.name} strategy" />
</svelte:head>

<section class="vault">
	<SummaryBox title="Vault information" ctaPosition="top">
		<div class="vault-info">
			<DataBox size="sm" label="Vault type">
				<div class="vault-type">
					<EntitySymbol label={vault.label} logoUrl={vault.logoUrl} />
					<Button size="sm" href={vault.externalProviderUrl} rel="noreferrer" target="_blank">
						View on {vault.label}
						<IconArrowRightUp slot="icon" --icon-size="0.875em" />
					</Button>
				</div>
			</DataBox>

			<DataBox size="sm" label="Blockchain">
				<EntitySymbol label={chain.name} logoUrl={getLogoUrl('blockchain', chain.slug)} />
			</DataBox>

			<DataBox size="sm" label="Address">
				<CryptoAddressWidget address={vault.address} href={getExplorerUrl(chain, vault.address)} />
			</DataBox>
		</div>
	</SummaryBox>
</section>

<style>
	.vault-info {
		display: grid;
		gap: inherit;
	}

	.vault-type {
		display: grid;
		gap: 0.875rem;
		grid-template-columns: 1fr auto;
		align-items: center;

		@media (--viewport-xs) {
			grid-template-columns: 1fr;
		}

		:global(.button *) {
			overflow: visible;
			stroke-width: 3;
		}
	}
</style>

<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import { type Chain, getExplorerUrl } from '$lib/helpers/chain';
	import Button from '$lib/components/Button.svelte';
	import CryptoAddressWidget from '$lib/components/CryptoAddressWidget.svelte';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import EntitySymbol from '$lib/components/EntitySymbol.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { resolve } from '$app/paths';
	import { hasSupportedProtocol } from '$lib/top-vaults/helpers';

	interface Props {
		vault: VaultInfo;
		chain?: Chain;
	}

	let { vault, chain }: Props = $props();

	let externalSiteName = $derived.by(() => {
		if (hasSupportedProtocol(vault)) return vault.protocol;
		if (vault.link) return new URL(vault.link).host;
	});
</script>

<PageHeader>
	{#snippet title()}
		<span class="page-title">
			<span>{vault.name}</span>
			{#each vault.flags as flag (flag)}
				<DataBadge class="badge" status="warning">{flag}</DataBadge>
			{/each}
		</span>
	{/snippet}

	{#snippet subtitle()}
		<span class="subtitle">
			{#if vault.ranking_overall_3m != null || vault.ranking_chain_3m != null || vault.ranking_protocol_3m != null}
				<EntitySymbol size="1.25em" logoUrl={getLogoUrl('blockchain', chain?.slug)} />
				<span class="ranking">
					Top
					{#if vault.ranking_overall_3m != null}
						<a href={resolve('/trading-view/vaults')}>#{vault.ranking_overall_3m} overall,</a
						>{/if}{#if vault.ranking_chain_3m != null}<a href={resolve(`/trading-view/vaults/chains/${chain?.slug}`)}
							>#{vault.ranking_chain_3m} on {chain?.name},</a
						>{/if}{#if vault.ranking_protocol_3m != null}<a
							href={resolve(`/trading-view/vaults/protocols/${vault.protocol_slug}`)}
							>#{vault.ranking_protocol_3m} on {vault.protocol}</a
						>{/if}
				</span>
			{:else}
				<span class="protocol-and-chain">
					vault on
					<a href={resolve(`/trading-view/vaults/protocols/${vault.protocol_slug}`)}>{vault.protocol}</a> on
					<EntitySymbol size="0.875em" logoUrl={getLogoUrl('blockchain', chain?.slug)}>
						<a href={resolve(`/trading-view/${chain?.slug}`)}>{chain?.name}</a>
					</EntitySymbol>
				</span>
			{/if}
			<CryptoAddressWidget
				size="sm"
				class="vault-address"
				address={vault.address}
				href={getExplorerUrl(chain, vault.address)}
			/>
		</span>
	{/snippet}

	{#snippet cta()}
		{#if vault.link}
			<Button href={vault.link} target="_blank" rel="noreferrer">
				View on {externalSiteName}
			</Button>
		{/if}
	{/snippet}
</PageHeader>

<style>
	.page-title {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.25em;
		align-items: center;

		:global(.badge) {
			font: var(--f-ui-lg-bold);
			letter-spacing: var(--ls-ui-lg, normal);
		}
	}

	.subtitle {
		@media (--viewport-sm-up) {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5rem;

			:global(.vault-address) {
				max-width: 10rem;
			}
		}

		.protocol-and-chain {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5ex;

			a {
				--shadow-color: var(--c-text-ultra-light);
				box-shadow: inset 0px -2px var(--shadow-color);
				transition: var(--transition-1);

				&:hover {
					color: var(--c-text-light);
					--shadow-color: currentColor;
				}
			}
		}
	}

	.ranking {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5ex;
		font: var(--f-h6-medium);
		a {
			--shadow-color: var(--c-text-ultra-light);
			box-shadow: inset 0px -2px var(--shadow-color);
			transition: var(--transition-1);

			&:hover {
				color: var(--c-text-light);
				--shadow-color: currentColor;
			}
		}
	}
</style>

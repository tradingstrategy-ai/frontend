<!--
@component
Shows one-month vault return rankings alongside linked strategy categories.
-->
<script lang="ts">
	import type { Chain } from '$lib/helpers/chain';
	import type { VaultCategoryLink } from '$lib/top-vaults/categories';
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import type { VaultProtocolMetadata } from '$lib/vault-protocol/schemas';
	import EntitySymbol from '$lib/components/EntitySymbol.svelte';
	import { resolve } from '$app/paths';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers.js';

	interface Props {
		vault: VaultInfo;
		chain: Chain | undefined;
		protocolMetadata: VaultProtocolMetadata | undefined;
		categories?: VaultCategoryLink[];
	}

	let { vault, chain, protocolMetadata, categories = [] }: Props = $props();
	const strategiesLabelId = $props.id();

	let period1m = $derived(vault.period_results.find((p) => p.period === '1M'));
	let hasRankings = $derived(
		period1m?.ranking_overall != null ||
			(period1m?.ranking_chain != null && chain != null) ||
			period1m?.ranking_protocol != null
	);
</script>

{#if hasRankings || categories.length > 0}
	<div class="vault-metadata" class:has-rankings={hasRankings}>
		{#if hasRankings}
			<div class="metadata-group rankings">
				<span class="metadata-label">Rank</span>
				<ul>
					{#if period1m?.ranking_overall != null}
						<li>
							<span class="rank">#{period1m.ranking_overall}</span>
							<a href={resolve('/vaults')}>overall</a>
						</li>
					{/if}
					{#if period1m?.ranking_chain != null && chain}
						<li>
							<span class="rank">#{period1m.ranking_chain}</span>
							on
							<EntitySymbol size="0.875em" logoUrl={getLogoUrl('blockchain', chain.slug)}>
								<a href={`/vaults/chains/${chain.slug}`}>
									{chain.name}
								</a>
							</EntitySymbol>
						</li>
					{/if}
					{#if period1m?.ranking_protocol != null}
						<li>
							<span class="rank">#{period1m.ranking_protocol}</span>
							on
							<EntitySymbol
								size="0.875em"
								logoUrl={protocolMetadata ? getVaultProtocolLogoUrl(protocolMetadata.slug) : undefined}
							>
								<a href={`/vaults/protocols/${vault.protocol_slug}`}>
									{vault.protocol}
								</a>
							</EntitySymbol>
						</li>
					{/if}
				</ul>
			</div>
		{/if}

		{#if categories.length > 0}
			<div class="metadata-group strategies">
				<span class="metadata-label" id={strategiesLabelId}>Strategies used by vault</span>
				<ul class="strategy-list" aria-labelledby={strategiesLabelId}>
					{#each categories as category (category.slug)}
						<li>
							<a href={resolve(`/vaults/strategies/${category.slug}`)}>{category.label}</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
{/if}

<style>
	.vault-metadata {
		--metadata-font: var(--f-ui-md-roman);
		--metadata-label-font: var(--f-ui-md-medium);

		display: grid;
		gap: 0.75rem;
		font: var(--metadata-font);

		@media (--viewport-md-up) {
			grid-template-columns: auto minmax(0, 1fr);
			gap: 1.5rem;

			&.has-rankings .strategies {
				padding-left: 1.5rem;
				border-left: 1px solid var(--c-box-4);
			}
		}

		@media (--viewport-sm-down) {
			--metadata-font: var(--f-ui-sm-roman);
			--metadata-label-font: var(--f-ui-sm-medium);
			gap: 0.5rem;
		}

		.metadata-group {
			display: grid;
			gap: 0.375rem;
		}

		.metadata-label {
			color: var(--c-text-extra-light);
			font: var(--metadata-label-font);
		}

		ul {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5rem 1.25rem;
			list-style: none;
			margin: 0;
			padding: 0;
		}

		li {
			display: flex;
			gap: 0.5ex;
			color: var(--c-text-extra-light);
		}

		.rank,
		a {
			color: var(--c-text);
			font-weight: 600;
		}

		a {
			border-bottom: 1px solid currentColor;

			&:hover {
				color: var(--c-text-light);
			}
		}

		.strategy-list {
			gap: 0;

			li {
				display: block;
				white-space: nowrap;

				&:not(:last-child)::after {
					content: ',';
					margin-right: 0.3em;
				}
			}
		}
	}
</style>

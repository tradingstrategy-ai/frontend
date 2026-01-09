<script lang="ts">
	import type { Chain } from '$lib/helpers/chain';
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import type { VaultProtocolMetadata } from '$lib/vault-protocol/schemas';
	import EntitySymbol from '$lib/components/EntitySymbol.svelte';
	import { resolve } from '$app/paths';
	import { getLogoUrl } from '$lib/helpers/assets';

	interface Props {
		vault: VaultInfo;
		chain: Chain | undefined;
		protocolMetadata: VaultProtocolMetadata | undefined;
	}

	let { vault, chain, protocolMetadata }: Props = $props();

	let period1m = $derived(vault.period_results.find((p) => p.period === '1M'))!;
</script>

<div class="vault-rankings">
	<span>🏆</span>

	<ul>
		<li>
			<span class="rank">#{period1m.ranking_overall}</span>
			<a href={resolve('/trading-view/vaults')}>overall</a>
		</li>
		<li>
			<span class="rank">#{period1m.ranking_chain}</span>
			on
			<EntitySymbol size="0.875em" logoUrl={getLogoUrl('blockchain', chain?.slug)}>
				<a href={resolve(`/trading-view/vaults/chains/${chain?.slug}`)}>
					{chain?.name}
				</a>
			</EntitySymbol>
		</li>
		<li>
			<span class="rank">#{period1m.ranking_protocol}</span>
			on
			<EntitySymbol size="0.875em" logoUrl={protocolMetadata?.logos.light}>
				<a href={resolve(`/trading-view/vaults/protocols/${vault.protocol_slug}`)}>
					{vault.protocol}
				</a>
			</EntitySymbol>
		</li>
	</ul>
</div>

<style>
	.vault-rankings {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1rem;
		font: var(--f-ui-lg-roman);

		@media (--viewport-md-down) {
			font: var(--f-ui-md-roman);
		}

		ul {
			display: flex;
			flex-wrap: wrap;
			gap: 0.75rem 1.75em;
			list-style: none;
			padding: 0;

			li {
				display: flex;
				gap: 0.5ex;
				color: var(--c-text-extra-light);
			}

			.rank {
				color: var(--c-text);
				font-weight: 600;
			}

			a {
				font-weight: 600;
				border-bottom: 1px solid currentColor;

				&:hover {
					color: var(--c-text-light);
				}
			}
		}
	}
</style>

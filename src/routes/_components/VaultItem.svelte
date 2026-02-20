<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import { vaultSparklinesUrl } from '$lib/config';
	import { formatPercentProfit } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { getChain } from '$lib/helpers/chain';
	import { resolveVaultDetails } from '$lib/top-vaults/helpers';

	interface Props {
		vault: VaultInfo;
	}

	let { vault }: Props = $props();

	// vault is static (keyed each block)
	// svelte-ignore state_referenced_locally
	let chain = getChain(vault.chain_id)!;

	let sparklineLoadError = $state(false);
</script>

<li class="vault-item">
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a href={resolveVaultDetails(vault)}>
		<img class="chain-logo" src={getLogoUrl('blockchain', getChain(vault.chain_id)?.slug)} alt={chain.name} />

		<div class="name">
			<div class="vault-name">
				{vault.name}
			</div>
			<div class="protocol-name">
				{vault.protocol}
			</div>
		</div>

		<div class="profitability">
			{formatPercentProfit(vault.one_month_cagr_net ?? vault.one_month_cagr)}
		</div>

		<div class="sparkline">
			{#if !vaultSparklinesUrl || sparklineLoadError}
				chart unavailable
			{:else}
				<img
					src="{vaultSparklinesUrl}/sparkline-90d-{vault.id}.svg"
					alt="{vault.name} 90 day price"
					onerror={() => (sparklineLoadError = true)}
				/>
			{/if}
		</div>
	</a>
</li>

<style>
	.vault-item {
		display: contents;
	}

	a {
		display: grid;
		grid-template-columns: auto 1fr auto auto;
		gap: 1rem;
		align-items: center;
		border-radius: var(--radius-md);
		border: 1px solid var(--c-box-3);
		padding: 1rem;
		background: var(--c-box-1);

		&:hover {
			border: 1px solid var(--c-box-4);
			background: var(--c-box-2);
		}
	}

	.chain-logo {
		width: 1.5rem;
		aspect-ratio: 1rem;
	}

	.name {
		display: grid;
		gap: 0.125rem;

		.vault-name {
			font: var(--f-ui-lg-medium);
			letter-spacing: var(--ls-ui-lg, normal);

			@media (--viewport-sm-down) {
				font: var(--f-ui-md-medium);
				letter-spacing: var(--ls-ui-md, normal);
			}
		}

		.protocol-name {
			font: var(--f-ui-sm-medium);
			color: var(--c-text-extra-light);
		}
	}

	.profitability {
		font: var(--f-heading-md-medium);
		color: var(--c-bullish);

		@media (--viewport-sm-down) {
			font: var(--f-heading-sm-medium);
		}
	}

	.sparkline {
		margin-left: 0.5rem;
		font: var(--f-ui-sm-roman);
		letter-spacing: var(--ls-ui-sm, normal);
		color: var(--c-text-ultra-light);
		text-align: center;

		img {
			scale: 1 1.25;

			@media (--viewport-sm-down) {
				scale: 1;
			}
		}
	}
</style>

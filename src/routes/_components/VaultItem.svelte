<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import { formatPercentProfit } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { getChain } from '$lib/helpers/chain';
	import { resolveVaultDetails } from '$lib/top-vaults/helpers';
	import VaultSparkline from '$lib/top-vaults/VaultSparkline.svelte';

	interface Props {
		vault: VaultInfo;
	}

	let { vault }: Props = $props();

	// vault is static (keyed each block)
	// svelte-ignore state_referenced_locally
	let chain = getChain(vault.chain_id)!;
</script>

<li class="vault-item">
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a href={resolveVaultDetails(vault)}>
		<img class="chain-logo" src={getLogoUrl('blockchain', getChain(vault.chain_id)?.slug)} alt={chain.name} />

		<div class="name">
			<div class="vault-name truncate lines-2">
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
			<VaultSparkline {vault} />
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

		@media (--viewport-sm-down) {
			padding: 0.5rem 0.75rem;
			gap: 0.75rem;
		}

		&:hover {
			border: 1px solid var(--c-box-4);
			background: var(--c-box-2);
		}
	}

	.chain-logo {
		width: 1.5rem;
		aspect-ratio: 1rem;

		@media (--viewport-sm-down) {
			width: 1.25rem;
		}
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

			@media (--viewport-xs) {
				display: none;
			}
		}
	}

	.profitability {
		font: var(--f-heading-md-medium);
		color: var(--c-bullish);

		@media (--viewport-sm-down) {
			font: var(--f-heading-sm-medium);
		}

		@media (--viewport-xs) {
			font: var(--f-heading-xs-medium);
		}
	}

	.sparkline {
		margin-left: 0.5rem;
		--sparkline-width: 96px;
		--sparkline-vertical-scale: 1.25;

		@media (--viewport-sm-down) {
			margin-left: 0.25rem;
			--sparkline-vertical-scale: 1.25;
			--sparkline-width: 72px;
		}

		@media (--viewport-xs) {
			margin-left: 0;
			--sparkline-vertical-scale: 1.5;
			--sparkline-width: 50px;
		}
	}
</style>

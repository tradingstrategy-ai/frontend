<script lang="ts">
	import type { RedeemWizardData, RedeemWizardDataSchema } from '../+layout';
	import type { EnzymeOnChainData } from 'trade-executor/schemas/summary';
	import { getWizardContext } from '$lib/wizard/state.svelte';
	import { config } from '$lib/wallet/client';
	import { formatBalance, getEvents } from '$lib/eth-defi/helpers';
	import { getRedemption } from '$lib/eth-defi/enzyme';
	import vaultABI from '$lib/eth-defi/abi/enzyme/VaultLib.json';
	import EntitySymbol from '$lib/components/EntitySymbol.svelte';
	import WalletInfo from '$lib/wallet/WalletInfo.svelte';
	import WalletInfoItem from '$lib/wallet/WalletInfoItem.svelte';
	import { formatNumber } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

	const { data } = $props();
	const { chain, strategy, denominationToken } = data;

	const wizard = getWizardContext<RedeemWizardDataSchema>();
	const { shares, transactionLogs } = wizard.data as Required<RedeemWizardData>;

	const onChainData = strategy.on_chain_data as EnzymeOnChainData;

	const events = getEvents(transactionLogs, vaultABI, 'AssetWithdrawn', onChainData.smart_contracts.vault);
</script>

<div class="redemption-success">
	<h3>The following tokens have been added to your wallet</h3>

	<WalletInfo alignValues="right">
		{#each events as { args: withdrawl }}
			{#await getRedemption(config, { withdrawl, denominationToken, chainId: chain.id })}
				<WalletInfoItem>
					<span slot="label" class="skeleton">-</span>
					<span class="skeleton">-</span>
				</WalletInfoItem>
			{:then balance}
				{@const { label, symbol } = balance}
				<WalletInfoItem>
					<EntitySymbol slot="label" size="1.5rem" {label} logoUrl={getLogoUrl('token', symbol)} />
					{formatBalance(balance, 2, 4)}
				</WalletInfoItem>
			{/await}
		{/each}
	</WalletInfo>

	<p>
		Congratulations! You've successfully redeemed <strong>{formatNumber(shares, 2, 5)} shares</strong> of
		<strong>{strategy.name}</strong>. Click "Done" to return to the strategy.
	</p>
</div>

<style>
	.redemption-success {
		display: grid;
		gap: var(--space-md);
	}

	h3 {
		color: var(--c-text-light);
		font: var(--f-ui-lg-medium);
	}

	.skeleton {
		display: inline-grid;
		width: 8ch;
	}
</style>

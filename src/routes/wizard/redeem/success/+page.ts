import type { Abi } from 'viem';
import type { RedeemWizardData } from '../+layout';
import { wizard } from 'wizard/store';
import { get } from 'svelte/store';
import { getTransactionReceipt } from '@wagmi/core';
import { config } from '$lib/wallet/client';
import { getEvents } from '$lib/eth-defi/helpers';
import { type AssetWithdrawlEvent, getRedemption } from '$lib/eth-defi/enzyme';
import vaultABI from '$lib/eth-defi/abi/enzyme/VaultLib.json';

export async function load() {
	const { chain, onChainData, denominationToken, transactionId } = get(wizard).data as Required<RedeemWizardData>;

	const transactionReceipt = await getTransactionReceipt(config, { hash: transactionId });

	const events = getEvents(
		transactionReceipt.logs,
		vaultABI as Abi,
		'AssetWithdrawn',
		onChainData.smart_contracts.vault
	) as unknown as AssetWithdrawlEvent[];

	const redemptions = events.map(({ args: withdrawl }) =>
		getRedemption(config, { withdrawl, denominationToken, chainId: chain.id })
	);

	return {
		receivedAssets: await Promise.all(redemptions)
	};
}

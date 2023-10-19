import { wizard } from 'wizard/store';
import { get } from 'svelte/store';
import { getPublicClient } from '@wagmi/core';
import type { Abi } from 'viem';
import { getEvents } from '$lib/eth-defi/helpers';
import { type AssetWithdrawl, getRedemption } from '$lib/eth-defi/enzyme';
import vaultABI from '$lib/eth-defi/abi/enzyme/VaultLib.json';

export async function load() {
	const { data } = get(wizard);
	const { chainId, contracts, denominationToken, transactionId } = data;
	let { transactionReceipt } = data;

	if (!transactionReceipt) {
		transactionReceipt = await getPublicClient().getTransactionReceipt({ hash: transactionId });
		wizard.updateData({ transactionReceipt });
	}

	const events = getEvents(transactionReceipt.logs, vaultABI as Abi, 'AssetWithdrawn', contracts.vault);

	const receivedAssets = await Promise.all(
		events.map(({ args }) => getRedemption(args as AssetWithdrawl, denominationToken, chainId))
	);

	return { receivedAssets };
}

import { wizard } from 'wizard/store';
import { get } from 'svelte/store';
import { getTransactionReceipt } from '@wagmi/core';
import type { Abi } from 'viem';
import { getEvents } from '$lib/eth-defi/helpers';
import { type AssetWithdrawl, getRedemption } from '$lib/eth-defi/enzyme';
import vaultABI from '$lib/eth-defi/abi/enzyme/VaultLib.json';
import { config } from '$lib/wallet';

export async function load() {
	const data = get(wizard).data!;
	const { chainId, contracts, denominationToken, transactionId } = data;
	let { transactionReceipt } = data;

	if (!transactionReceipt) {
		transactionReceipt = await getTransactionReceipt(config, { hash: transactionId });
		wizard.updateData({ transactionReceipt });
	}

	const events = getEvents(transactionReceipt.logs, vaultABI as Abi, 'AssetWithdrawn', contracts.vault);

	const receivedAssets = await Promise.all(
		events.map(({ args }) => {
			// manually cast event args to AssetWithdrawl (auto cast from ABI failed)
			const withdrawl = args as unknown as AssetWithdrawl;
			return getRedemption(config, { withdrawl, denominationToken, chainId });
		})
	);

	return { receivedAssets };
}

import type { Abi } from 'viem';
import type { EnzymeSmartContracts } from 'trade-executor/strategy/summary';
import { get } from 'svelte/store';
import { wizard } from 'wizard/store';
import { config } from '$lib/wallet';
import { readContracts, getAccount } from '@wagmi/core';
import { getTosInfo } from '$lib/eth-defi/helpers.js';
import tosABI from '$lib/eth-defi/abi/TermsOfService.json';

export async function load({ fetch }) {
	const data = get(wizard).data as { chainId: number; contracts: EnzymeSmartContracts };
	const { chainId, contracts } = data;
	const address = contracts.terms_of_service!;

	// FIXME: this may be `undefined` due to wallet reconnect race condition
	const account = getAccount(config).address;

	const [canProceed, version] = await readContracts(config, {
		contracts: [
			{ address, abi: tosABI as Abi, functionName: 'canAddressProceed', args: [account] },
			{ address, abi: tosABI as Abi, functionName: 'latestTermsOfServiceVersion' }
		]
	}).then((response) => response.map((item) => item.result) as [boolean, number]);

	const { fileName, acceptanceMessage } = getTosInfo(chainId, address, version);

	let tosText: string | undefined;

	try {
		const resp = await fetch(`/tos/${fileName}`);
		if (!resp.ok) throw new Error(resp.statusText);
		tosText = await resp.text();
	} catch (e) {
		console.error(e);
	}

	return { canProceed, version, fileName, tosText, acceptanceMessage };
}

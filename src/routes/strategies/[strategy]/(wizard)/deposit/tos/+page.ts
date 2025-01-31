import type { Abi } from 'viem';
import type { EnzymeOnChainData } from 'trade-executor/schemas/summary';
import { get } from 'svelte/store';
import { config, wallet } from '$lib/wallet/client';
import { readContracts } from '@wagmi/core';
import { getTosVersion } from 'trade-executor/helpers/tos';
import termsOfServiceABI from '$lib/eth-defi/abi/TermsOfService.json';

export async function load({ fetch, parent }) {
	const abi = termsOfServiceABI as Abi;
	const { chain, strategy } = await parent();
	const onChainData = strategy.on_chain_data as EnzymeOnChainData;

	const address = onChainData.smart_contracts.terms_of_service!;
	const account = get(wallet).address;

	const [canProceed, version] = await readContracts(config, {
		contracts: [
			{ address, abi, functionName: 'canAddressProceed', args: [account] },
			{ address, abi, functionName: 'latestTermsOfServiceVersion' }
		]
	}).then((response) => response.map((item) => item.result) as [boolean, number]);

	const { fileName, acceptanceMessage } = getTosVersion({ chainId: chain.id, address, version });

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

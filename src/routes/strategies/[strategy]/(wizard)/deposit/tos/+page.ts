import { get } from 'svelte/store';
import { error } from '@sveltejs/kit';
import { tosContracts } from '$lib/config.js';
import { config, wallet } from '$lib/wallet/client';
import { readContracts } from '@wagmi/core';
import abi from '$lib/eth-defi/abi/TermsOfService.json';

export async function load({ fetch, parent }) {
	const { chain } = await parent();
	const tosContractInfo = tosContracts[chain.slug];

	if (!tosContractInfo) {
		error(404, 'Not found');
	}

	const { address } = tosContractInfo;
	const account = get(wallet).address!;

	const [canProceed, version] = await readContracts(config, {
		contracts: [
			{ address, abi, functionName: 'canAddressProceed', args: [account] },
			{ address, abi, functionName: 'latestTermsOfServiceVersion' }
		]
	}).then((response) => response.map((item) => item.result) as [boolean, number]);

	let fileName: string | undefined;
	let acceptanceMessage: string | undefined;
	let tosText: string | undefined;

	if (version === tosContractInfo.version) {
		({ fileName, acceptanceMessage } = tosContractInfo);

		try {
			const resp = await fetch(`/tos/${fileName}`);
			if (!resp.ok) throw new Error(resp.statusText);
			tosText = await resp.text();
		} catch (e) {
			console.error(e);
		}
	}

	return { canProceed, version, fileName, tosText, acceptanceMessage };
}

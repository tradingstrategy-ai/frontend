import { get } from 'svelte/store';
import { error } from '@sveltejs/kit';
import { tosContracts } from '$lib/config.js';
import { config, wallet } from '$lib/wallet/client';
import { readContract } from '@wagmi/core';
import tosAbi from '$lib/eth-defi/abi/TermsOfService.json';

function getCanProceed(chainId: number, contract: Maybe<Address>, address: Maybe<Address>) {
	if (!(contract && address)) return false;

	return readContract(config, {
		abi: tosAbi,
		chainId,
		address: contract,
		functionName: 'canAddressProceed',
		args: [address]
	});
}

function getLatestContractVersion(chainId: number, address: Maybe<Address>) {
	if (!address) return 0;

	return readContract(config, {
		abi: tosAbi,
		chainId,
		address,
		functionName: 'latestTermsOfServiceVersion'
	});
}

async function getTosText(fileName: string) {
	try {
		const resp = await fetch(`/tos/${fileName}`);
		if (!resp.ok) throw new Error(resp.statusText);
		return resp.text();
	} catch (e) {
		console.error(e);
	}
}

export async function load({ fetch, parent }) {
	const { chain } = await parent();
	const tosContract = tosContracts[chain.slug];

	if (!tosContract) {
		error(404, 'Not found');
	}

	return {
		tosContract,
		canProceed: await getCanProceed(chain.id, tosContract.address, get(wallet).address),
		latestContractVersion: await getLatestContractVersion(chain.id, tosContract.address),
		tosText: await getTosText(tosContract.fileName)
	};
}

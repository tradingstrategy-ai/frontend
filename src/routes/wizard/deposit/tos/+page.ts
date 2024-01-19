import '$lib/wallet/client';
import { readContract } from '@wagmi/core';
import tosABI from '$lib/eth-defi/abi/TermsOfService.json';

// TODO: this will come from wizard.data.contracts
const address = '0xc0a66f20EEb3115a77cAB71ecbEE301fcf2eD5fa';

export async function load({ fetch }) {
	const version = await readContract({
		address,
		abi: tosABI,
		functionName: 'latestTermsOfServiceVersion'
	});

	// Temoporary hack - all versions = v0 until we launch
	// const fileName = `v${version}.txt`;
	const fileName = 'v0.txt';

	let tosText: string | undefined;

	try {
		const resp = await fetch(`/tos/${fileName}`);
		if (!resp.ok) throw new Error(resp.statusText);
		tosText = await resp.text();
	} catch (e) {
		console.error(e);
	}

	return { version, fileName, tosText };
}

import type { Abi } from 'viem';
import type { EnzymeSmartContracts } from 'trade-executor/strategy/summary';
import { get } from 'svelte/store';
import { wizard } from 'wizard/store';
import { readContract } from '@wagmi/core';
import { config } from '$lib/wallet';
import paymentForwarderABI from '$lib/eth-defi/abi/VaultUSDCPaymentForwarder.json';
import termsPaymentForwarderABI from '$lib/eth-defi/abi/TermedVaultUSDCPaymentForwarder.json';

async function paymentForwarderRequiresTos(address: Address) {
	try {
		return (await readContract(config, {
			address,
			abi: termsPaymentForwarderABI,
			functionName: 'isTermsOfServiceEnabled'
		})) as boolean;
	} catch (e) {
		if (e instanceof Error && e.name === 'ContractFunctionExecutionError') {
			return false;
		}
		throw e;
	}
}

export async function load() {
	const contracts = get(wizard).data!.contracts as EnzymeSmartContracts;
	const address = contracts.payment_forwarder;

	const tosRequired = await paymentForwarderRequiresTos(address);

	const paymentContract = tosRequired
		? {
				address,
				abi: termsPaymentForwarderABI as Abi,
				functionName: 'buySharesOnBehalfUsingTransferWithAuthorizationAndTermsOfService'
			}
		: {
				address,
				abi: paymentForwarderABI as Abi,
				functionName: 'buySharesOnBehalfUsingTransferWithAuthorization'
			};

	return { paymentContract, tosRequired };
}

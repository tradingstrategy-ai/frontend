import type { Abi, ContractFunctionParameters } from 'viem';
import type { DepositWizardData } from '../+layout';
import { get } from 'svelte/store';
import { wizard } from '$lib/wizard/store';
import { readContract } from '@wagmi/core';
import { config } from '$lib/wallet/client';
import comptrollerABI from '$lib/eth-defi/abi/enzyme/ComptrollerLib.json';
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
	const { canForwardPayment, onChainData } = get(wizard).data as DepositWizardData;
	const { comptroller, payment_forwarder } = onChainData.smart_contracts;

	let paymentContract: ContractFunctionParameters;
	let tosRequired = false;

	if (!canForwardPayment) {
		paymentContract = {
			address: comptroller,
			abi: comptrollerABI as Abi,
			functionName: 'buySharesOnBehalf'
		};
	} else {
		tosRequired = await paymentForwarderRequiresTos(payment_forwarder);

		paymentContract = tosRequired
			? {
					address: payment_forwarder,
					abi: termsPaymentForwarderABI as Abi,
					functionName: 'buySharesOnBehalfUsingTransferWithAuthorizationAndTermsOfService'
				}
			: {
					address: payment_forwarder,
					abi: paymentForwarderABI as Abi,
					functionName: 'buySharesOnBehalfUsingTransferWithAuthorization'
				};
	}

	return { paymentContract, tosRequired };
}

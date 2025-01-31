import type { Abi, ContractFunctionParameters } from 'viem';
import type { EnzymeSmartContracts } from 'trade-executor/schemas/summary';
import comptrollerABI from '$lib/eth-defi/abi/enzyme/ComptrollerLib.json';
import paymentForwarderABI from '$lib/eth-defi/abi/VaultUSDCPaymentForwarder.json';
import termsPaymentForwarderABI from '$lib/eth-defi/abi/TermedVaultUSDCPaymentForwarder.json';

export async function load({ parent }) {
	const { canForwardPayment, canForwardToS, strategy } = await parent();
	const { comptroller, payment_forwarder } = strategy.on_chain_data.smart_contracts as EnzymeSmartContracts;

	let paymentContract: ContractFunctionParameters;

	if (!canForwardPayment) {
		paymentContract = {
			address: comptroller,
			abi: comptrollerABI as Abi,
			functionName: 'buySharesOnBehalf'
		};
	} else {
		paymentContract = canForwardToS
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

	return { paymentContract };
}

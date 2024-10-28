import type { Chain } from '$lib/helpers/chain';
import type { EnzymeSmartContracts } from 'trade-executor/schemas/summary';

export type ConnectWizardData = {
	chain: Chain;
	strategyName: string;
	contracts: EnzymeSmartContracts;
};

export async function load() {
	return {
		title: 'Connect wallet',
		steps: [
			{ slug: 'introduction', label: 'Introduction' },
			{ slug: 'connect', label: 'Connect your wallet' },
			{ slug: 'balance', label: 'Wallet balance' },
			{ slug: 'success', label: 'Success' }
		]
	};
}

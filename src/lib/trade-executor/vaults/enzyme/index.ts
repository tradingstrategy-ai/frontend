import type { EnzymeSmartContracts } from 'trade-executor/schemas/summary';
import type { Config } from '@wagmi/core';
import type { TokenBalance } from '$lib/eth-defi/schemas/token';
import { BaseVault, DepositMethod } from '../base';
import { getTokenBalance } from '$lib/eth-defi/helpers';
import { simulateContract } from '@wagmi/core';

export class EnzymeVault extends BaseVault<EnzymeSmartContracts> {
	type = 'enzyme';
	label = 'Enzyme';
	logoUrl = '/logos/tokens/enzyme';
	address = this.contracts.vault;
	depositMethod = DepositMethod.INTERNAL;

	// Enzyme protocol fee and info; see:
	// https://docs.enzyme.finance/what-is-enzyme/faq#fees-performance-and-accounting
	protocolFee = 0.0025;
	protocolFeeTooltip = `
		The Enzyme protocol fee rate applied to the vault is 0.50%. Shares accrued can be bought
		back with MLN at a 50% discount, leading to an effective protocol fee rate of 0.25%.
	`;
	protocolFeeUrl = 'https://docs.enzyme.finance/what-is-enzyme/faq#fees-performance-and-accounting';

	get externalProviderUrl() {
		return `https://app.enzyme.finance/vault/${this.contracts.vault}?network=${this.chain.slug}`;
	}

	async getShareValueUSD(config: Config, address: Address): Promise<TokenBalance> {
		const { default: abi } = await import('./abi/FundValueCalculator.json');

		const { result } = await simulateContract(config, {
			abi,
			address: this.contracts.fund_value_calculator,
			functionName: 'calcNetValueForSharesHolder',
			args: [this.contracts.vault, address]
		});

		const [token, value] = result as [Address, bigint];
		const denominationToken = await getTokenBalance(config, { token, address });

		return { ...denominationToken, value };
	}
}

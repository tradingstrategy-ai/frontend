import type { EnzymeSmartContracts } from 'trade-executor/schemas/summary';
import type { Config } from '@wagmi/core';
import type { GetTokenBalanceReturnType } from '$lib/eth-defi/helpers';
import { BaseVault, DepositMethod } from '../base';
import fundValueCalculatorABI from '$lib/eth-defi/abi/enzyme/FundValueCalculator.json';

export class EnzymeVault extends BaseVault<EnzymeSmartContracts> {
	type = 'enzyme';
	label = 'Enzyme';
	logoUrl = '/logos/tokens/enzyme';

	depositMethod = DepositMethod.INTERNAL;

	get externalProviderUrl() {
		return `https://app.enzyme.finance/vault/${this.contracts.vault}?network=${this.chain.slug}`;
	}

	shareTokenAddress = this.contracts.vault;

	async getShareValueUSD(config: Config, address: Address): Promise<GetTokenBalanceReturnType> {
		const { simulateContract } = await import('@wagmi/core');
		const { getTokenBalance } = await import('$lib/eth-defi/helpers');

		const { result } = await simulateContract(config, {
			abi: fundValueCalculatorABI,
			address: this.contracts.fund_value_calculator,
			functionName: 'calcNetValueForSharesHolder',
			args: [this.contracts.vault, address]
		});

		const [token, value] = result as [Address, bigint];
		const denominationToken = await getTokenBalance(config, { token, address });
		const { decimals, symbol, label } = denominationToken;

		return {
			address: this.contracts.vault,
			decimals,
			symbol: symbol ?? '---',
			value,
			label
		};
	}
}

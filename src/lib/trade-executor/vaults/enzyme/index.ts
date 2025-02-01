import type { EnzymeSmartContracts } from 'trade-executor/schemas/summary';
import type { Config } from '@wagmi/core';
import type { TokenBalance } from '$lib/eth-defi/schemas/token';
import { BaseVault, DepositMethod, GetSharePriceError } from '../base';
import { getTokenBalance } from '$lib/eth-defi/helpers';
import { readContract, simulateContract } from '@wagmi/core';
import { formatUnits } from 'viem';

export class EnzymeVault extends BaseVault<EnzymeSmartContracts> {
	type = 'enzyme';
	label = 'Enzyme';
	logoUrl = '/logos/tokens/enzyme';
	address = this.contracts.vault;
	spender = this.contracts.comptroller;
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

	// Enzyme vaults support payment forwarding for USDC denominatoin token
	async canForwardPayment(config: Config): Promise<boolean> {
		const { symbol } = await this.getDenominationTokenInfo(config);
		return symbol === 'USDC';
	}

	// Enzyme vaults with the right type of payment forwarder can forward ToS
	async canForwardToS(config: Config): Promise<boolean> {
		try {
			return (await readContract(config, {
				abi: (await import('./abi/TermedVaultUSDCPaymentForwarder.json')).default,
				address: this.contracts.payment_forwarder,
				functionName: 'isTermsOfServiceEnabled'
			})) as boolean;
		} catch (e) {
			if (e instanceof Error && e.name === 'ContractFunctionExecutionError') {
				return false;
			}
			throw e;
		}
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

	async getSharePriceUSD(config: Config): Promise<number> {
		const { default: abi } = await import('./abi/FundValueCalculator.json');

		let value: bigint;

		try {
			const { result } = await simulateContract(config, {
				abi,
				address: this.contracts.fund_value_calculator,
				functionName: 'calcGrossShareValue',
				args: [this.contracts.vault]
			});
			value = result[1];
		} catch (e) {
			throw new GetSharePriceError(e);
		}

		const { decimals } = await this.getDenominationTokenInfo(config);
		return Number(formatUnits(value, decimals));
	}

	async getDenominationAsset(config: Config) {
		const { default: abi } = await import('./abi/ComptrollerLib.json');

		const asset = (await readContract(config, {
			chainId: this.chain.id,
			address: this.contracts.comptroller,
			abi,
			functionName: 'getDenominationAsset'
		})) as Address;

		// memoize
		this.getDenominationAsset = async () => asset;
		return asset;
	}
}

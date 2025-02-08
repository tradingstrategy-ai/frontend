import type { EnzymeSmartContracts } from 'trade-executor/schemas/summary';
import type { Config } from '@wagmi/core';
import type { TokenBalance } from '$lib/eth-defi/schemas/token';
import type { SignedArguments } from '$lib/eth-defi/eip-3009';
import type { HexString } from 'trade-executor/schemas/utility-types';
import { VaultWithInternalDeposits, GetSharePriceError } from '../base';
import { getTokenBalance, getTokenInfo } from '$lib/eth-defi/helpers';
import { readContract, simulateContract, writeContract } from '@wagmi/core';
import { formatUnits, parseUnits } from 'viem';

const SLIPPAGE_TOLERANCE = 0.02;

export class EnzymeVault extends VaultWithInternalDeposits<EnzymeSmartContracts> {
	readonly type = 'enzyme';
	readonly label = 'Enzyme';
	readonly logoUrl = '/logos/tokens/enzyme';
	readonly address = this.contracts.vault;
	readonly payee = this.contracts.comptroller;
	readonly paymentForwarder = this.contracts.payment_forwarder;

	// Enzyme protocol fee and info; see:
	// https://docs.enzyme.finance/what-is-enzyme/faq#fees-performance-and-accounting
	readonly protocolFee = 0.0025;
	readonly protocolFeeTooltip = `
		The Enzyme protocol fee rate applied to the vault is 0.50%. Shares accrued can be bought
		back with MLN at a 50% discount, leading to an effective protocol fee rate of 0.25%.
	`;
	readonly protocolFeeUrl = 'https://docs.enzyme.finance/what-is-enzyme/faq#fees-performance-and-accounting';

	get externalProviderUrl() {
		return `https://app.enzyme.finance/vault/${this.contracts.vault}?network=${this.chain.slug}`;
	}

	// Enzyme vaults support payment forwarding for USDC denominatoin token
	async canForwardPayment(config: Config): Promise<boolean> {
		const { symbol } = await this.getDenominationTokenInfo(config);
		// NOTE: memoization not needed since getDenominationTokenInfo is memoized
		return symbol === 'USDC';
	}

	// Enzyme vaults with the right type of payment forwarder can forward ToS
	async canForwardToS(config: Config): Promise<boolean> {
		const { default: abi } = await import('./abi/TermedVaultUSDCPaymentForwarder.json');
		let canForward = false;

		try {
			canForward = await readContract(config, {
				abi,
				address: this.contracts.payment_forwarder,
				functionName: 'isTermsOfServiceEnabled'
			});
		} catch (e) {
			if (!(e instanceof Error && e.name === 'ContractFunctionExecutionError')) {
				throw e;
			}
		}

		// memoize
		this.canForwardToS = async () => canForward;
		return canForward;
	}

	async getShareValueUSD(config: Config, address: Address): Promise<TokenBalance> {
		const { default: abi } = await import('./abi/FundValueCalculator.json');

		const { result } = await simulateContract(config, {
			abi,
			address: this.contracts.fund_value_calculator,
			functionName: 'calcNetValueForSharesHolder',
			args: [this.contracts.vault, address]
		});

		const [token, value] = result;
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

		const asset = await readContract(config, {
			abi,
			chainId: this.chain.id,
			address: this.contracts.comptroller,
			functionName: 'getDenominationAsset'
		});

		// memoize
		this.getDenominationAsset = async () => asset;
		return asset;
	}

	async buyShares(config: Config, buyer: Address, value: bigint): Promise<Address> {
		const { default: abi } = await import('./abi/ComptrollerLib.json');

		const minShares = await this.#calculateMinShares(config, value);

		const { request } = await simulateContract(config, {
			abi,
			address: this.payee,
			functionName: 'buySharesOnBehalf',
			args: [buyer, value, minShares]
		});

		return writeContract(config, request);
	}

	async buySharesWithAuthorization(
		config: Config,
		signedArgs: SignedArguments,
		tosHash?: HexString,
		tosSignature?: HexString
	) {
		const [canForwardPayment, canForwardToS] = await Promise.all([
			this.canForwardPayment(config),
			this.canForwardToS(config)
		]);

		if (!canForwardPayment) {
			throw new Error('Cannot forward payment for this vault');
		}

		const value = signedArgs[2]; // see eip-3009:getSignedArguments return type
		const minShares = await this.#calculateMinShares(config, value);
		const args = [...signedArgs, minShares] as [...SignedArguments, bigint];

		if (canForwardToS && tosHash && tosSignature) {
			const { request } = await this.#simulateBuySharesWithAuthorizationAndToS(config, [
				...args,
				tosHash,
				tosSignature
			]);
			return writeContract(config, request);
		}

		const { request } = await this.#simulateBuySharesWithAuthorization(config, args);
		return writeContract(config, request);
	}

	async #simulateBuySharesWithAuthorization(config: Config, args: [...SignedArguments, bigint]) {
		const { default: abi } = await import('./abi/VaultUSDCPaymentForwarder.json');

		return simulateContract(config, {
			abi,
			address: this.paymentForwarder,
			functionName: 'buySharesOnBehalfUsingTransferWithAuthorization',
			args
		});
	}

	async #simulateBuySharesWithAuthorizationAndToS(
		config: Config,
		args: [...SignedArguments, bigint, HexString, HexString]
	) {
		const { default: abi } = await import('./abi/TermedVaultUSDCPaymentForwarder.json');

		return simulateContract(config, {
			abi,
			address: this.paymentForwarder,
			functionName: 'buySharesOnBehalfUsingTransferWithAuthorizationAndTermsOfService',
			args
		});
	}

	// TODO: move to parent class (or eth-defi/helpers)
	async #calculateMinShares(config: Config, value: bigint): Promise<bigint> {
		const [sharePrice, vaultToken, denominationToken] = await Promise.all([
			this.getSharePriceUSD(config),
			getTokenInfo(config, { address: this.address }),
			this.getDenominationTokenInfo(config)
		]);

		const valueDecimal = Number(formatUnits(value, denominationToken.decimals));
		const minSharesDecimal = valueDecimal / (sharePrice * (1 + SLIPPAGE_TOLERANCE));
		return parseUnits(String(minSharesDecimal), vaultToken.decimals);
	}
}

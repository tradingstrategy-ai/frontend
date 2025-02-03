import type { LagoonSmartContracts } from 'trade-executor/schemas/summary';
import type { Config } from '@wagmi/core';
import type { TokenBalance } from '$lib/eth-defi/schemas/token';
import { VaultWithInternalDeposits } from '../base';
import { getTokenBalance, getTokenInfo } from '$lib/eth-defi/helpers';
import { readContract, simulateContract, writeContract } from '@wagmi/core';
import { formatUnits, parseUnits } from 'viem';

export class LagoonVault extends VaultWithInternalDeposits<LagoonSmartContracts> {
	type = 'lagoon';
	label = 'Lagoon';
	logoUrl = '/logos/tokens/lagoon';
	address = this.contracts.address;
	payee = this.address;

	// Lagoon protocol fee and info
	protocolFee = 0;
	protocolFeeTooltip = `During the introductory period, Lagoon is not charging a protocol fee.`;
	protocolFeeUrl = 'https://docs.lagoon.finance/vault-creators/fees-and-economics';

	get externalProviderUrl() {
		return `https://app.lagoon.finance/vault/${this.chain.id}/${this.contracts.address}`;
	}

	async getShareValueUSD(config: Config, address: Address): Promise<TokenBalance> {
		const [denominationToken, value] = await Promise.all([
			this.getDenominationTokenInfo(config),
			this.#getVaultAssetValue(config, address)
		]);

		return { ...denominationToken, value };
	}

	async getSharePriceUSD(config: Config): Promise<number> {
		const [denominationToken, value] = await Promise.all([
			this.getDenominationTokenInfo(config),
			this.#getShareAssetValue(config)
		]);

		return Number(formatUnits(value, denominationToken.decimals));
	}

	async getDenominationAsset(_config: Config) {
		return this.contracts.asset;
	}

	async buyShares(config: Config, buyer: Address, value: bigint): Promise<Address> {
		const { default: abi } = await import('./abi/Vault.json');

		const { request } = await simulateContract(config, {
			abi,
			address: this.address,
			functionName: 'requestDeposit',
			args: [value, buyer, buyer]
		});

		return writeContract(config, request);
	}

	// Get Lagoon vault fees from vault smart contract
	async getFees(config: Config) {
		const { default: abi } = await import('./abi/Vault.json');

		const fees = (await readContract(config, {
			abi,
			chainId: this.chain.id,
			address: this.contracts.address,
			functionName: 'feeRates'
		})) as { managementRate: number; performanceRate: number };

		// convert basis point values to decimal percentage values
		return {
			managementFee: fees.managementRate / 10_000,
			totalPerformanceFee: fees.performanceRate / 10_000
		};
	}

	async #getVaultAssetValue(config: Config, address: Address) {
		const { value } = await getTokenBalance(config, {
			chainId: this.chain.id,
			token: this.address,
			address
		});

		return this.#convertToAssets(config, value);
	}

	async #getShareAssetValue(config: Config) {
		const { decimals } = await getTokenInfo(config, {
			chainId: this.chain.id,
			address: this.address
		});

		const value = parseUnits('1', decimals);
		return this.#convertToAssets(config, value);
	}

	async #convertToAssets(config: Config, value: bigint) {
		const { default: abi } = await import('./abi/Vault.json');

		return readContract(config, {
			abi,
			chainId: this.chain.id,
			address: this.contracts.address,
			functionName: 'convertToAssets',
			args: [value]
		}) as Promise<bigint>;
	}
}

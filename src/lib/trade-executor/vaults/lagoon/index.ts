import type { LagoonSmartContracts } from 'trade-executor/schemas/summary';
import type { Config } from '@wagmi/core';
import type { TokenBalance } from '$lib/eth-defi/schemas/token';
import { BaseVault, DepositMethod } from '../base';
import { getTokenBalance } from '$lib/eth-defi/helpers';
import { readContract } from '@wagmi/core';

export class LagoonVault extends BaseVault<LagoonSmartContracts> {
	type = 'lagoon';
	label = 'Lagoon';
	logoUrl = '/logos/tokens/lagoon';
	address = this.contracts.address;
	depositMethod = DepositMethod.INTERNAL;

	// Lagoon protocol fee and info
	protocolFee = 0;
	protocolFeeTooltip = `During the introductory period, Lagoon is not charging a protocol fee.`;
	protocolFeeUrl = 'https://docs.lagoon.finance/vault-creators/fees-and-economics';

	get externalProviderUrl() {
		return `https://app.lagoon.finance/vault/${this.chain.id}/${this.contracts.address}`;
	}

	async getShareValueUSD(config: Config, address: Address): Promise<TokenBalance> {
		const [denominationToken, value] = await Promise.all([
			getTokenBalance(config, { chainId: this.chain.id, token: this.contracts.asset, address }),
			this.#getVaultAssetValue(config, address)
		]);

		return { ...denominationToken, value };
	}

	async #getVaultAssetValue(config: Config, address: Address) {
		const { default: abi } = await import('./abi/Vault.json');

		const vaultBalance = await getTokenBalance(config, {
			chainId: this.chain.id,
			token: this.contracts.address,
			address
		});

		return readContract(config, {
			abi,
			chainId: this.chain.id,
			address: this.contracts.address,
			functionName: 'convertToAssets',
			args: [vaultBalance.value]
		}) as Promise<bigint>;
	}

	async getDenominationAsset(_config: Config) {
		return this.contracts.asset;
	}

	// Get Lagoon vault fees from vault smart contract
	async getFees(config: Config) {
		const fees = (await readContract(config, {
			abi: (await import('./abi/Vault.json')).default,
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
}

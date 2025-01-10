import type { LagoonSmartContracts } from 'trade-executor/schemas/summary';
import type { Config } from '@wagmi/core';
import type { GetTokenBalanceReturnType } from '$lib/eth-defi/helpers';
import { BaseVault, DepositMethod } from '../base';
import { getTokenBalance } from '$lib/eth-defi/helpers';
import { readContract } from '@wagmi/core';

export class LagoonVault extends BaseVault<LagoonSmartContracts> {
	type = 'lagoon';
	label = 'Lagoon';
	logoUrl = '/logos/tokens/lagoon';

	depositMethod = DepositMethod.EXTERNAL;

	get externalProviderUrl() {
		return `https://app.lagoon.finance/vault/${this.chain.id}/${this.contracts.address}`;
	}

	shareTokenAddress = this.contracts.address;

	async getShareValueUSD(config: Config, address: Address): Promise<GetTokenBalanceReturnType> {
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
}

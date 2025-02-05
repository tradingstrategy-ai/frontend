import type { LagoonSmartContracts } from 'trade-executor/schemas/summary';
import type { Config } from '@wagmi/core';
import type { TokenBalance } from '$lib/eth-defi/schemas/token';
import type { PendingDeposit, SettlementRequired } from '../types';
import { VaultWithInternalDeposits } from '../base';
import { getTokenBalance, getTokenInfo } from '$lib/eth-defi/helpers';
import { readContract, readContracts, simulateContract, writeContract } from '@wagmi/core';
import { formatUnits, parseUnits } from 'viem';
import { vaultAbi } from './abi/Vault.json';

export class LagoonVault extends VaultWithInternalDeposits<LagoonSmartContracts> implements SettlementRequired {
	readonly type = 'lagoon';
	readonly label = 'Lagoon';
	readonly logoUrl = '/logos/tokens/lagoon';
	readonly address = this.contracts.address;
	readonly payee = this.address;

	// Lagoon protocol fee and info
	readonly protocolFee = 0;
	readonly protocolFeeTooltip = `During the introductory period, Lagoon is not charging a protocol fee.`;
	readonly protocolFeeUrl = 'https://docs.lagoon.finance/vault-creators/fees-and-economics';

	// Used by requiresSettlement() type predicate
	protected readonly _requiresSettlement = true;

	// private utility prop for generating vault contracts
	#vaultBaseContract = {
		abi: vaultAbi,
		chainId: this.chain.id,
		address: this.address
	} as const;

	get externalProviderUrl() {
		return `https://app.lagoon.finance/vault/${this.chain.id}/${this.address}`;
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
		const { request } = await simulateContract(config, {
			...this.#vaultBaseContract,
			functionName: 'requestDeposit',
			args: [value, buyer, buyer]
		});

		return writeContract(config, request);
	}

	async getPendingDeposit(config: Config, address: Address): Promise<PendingDeposit> {
		const [depositId, assetInfo] = await Promise.all([
			this.#getPendingDepositId(config, address),
			this.getDenominationTokenInfo(config)
		]);

		const baseContract = {
			...this.#vaultBaseContract,
			args: [depositId, address] as const
		};

		const response = await readContracts(config, {
			contracts: [
				{ ...baseContract, functionName: 'pendingDepositRequest' },
				{ ...baseContract, functionName: 'claimableDepositRequest' }
			]
		});

		const [pending, claimable] = response.map(({ result }) => result);
		const value = pending || claimable || 0n;
		const settled = Boolean(claimable);

		return {
			asset: { ...assetInfo, value },
			settled
		};
	}

	#getPendingDepositId(config: Config, address: Address): Promise<bigint> {
		return readContract(config, {
			...this.#vaultBaseContract,
			functionName: 'lastDepositRequestId',
			args: [address]
		}).then(BigInt);
	}

	// Get Lagoon vault fees from vault smart contract
	async getFees(config: Config) {
		const fees = await readContract(config, {
			...this.#vaultBaseContract,
			functionName: 'feeRates'
		});

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

	async #convertToAssets(config: Config, value: bigint): Promise<bigint> {
		return readContract(config, {
			...this.#vaultBaseContract,
			functionName: 'convertToAssets',
			args: [value]
		});
	}
}

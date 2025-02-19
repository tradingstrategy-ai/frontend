import type { LagoonSmartContracts } from 'trade-executor/schemas/summary';
import type { Config } from '@wagmi/core';
import type { Log } from 'viem';
import type { DepositResult, RedemptionResult, PendingExchange, SettlementRequired } from '../types';
import type { TokenBalance } from '$lib/eth-defi/schemas/token';
import type { HexString } from 'trade-executor/schemas/utility-types';
import { VaultWithInternalDeposits } from '../base';
import { getTokenBalance, getEvents } from '$lib/eth-defi/helpers';
import { readContract, readContracts, simulateContract, writeContract } from '@wagmi/core';
import { formatUnits, parseUnits } from 'viem';
import vaultAbi from './abi/Vault.json';

export class LagoonVault extends VaultWithInternalDeposits<LagoonSmartContracts> implements SettlementRequired {
	readonly type = 'lagoon';
	readonly label = 'Lagoon';
	readonly logoUrl = '/logos/tokens/lagoon';
	readonly address = this.contracts.address;
	readonly payee = this.address;
	readonly inKindRedemption = false;

	// Lagoon protocol fee and info
	readonly protocolFee = 0;
	readonly protocolFeeTooltip = `During the introductory period, Lagoon is not charging a protocol fee.`;
	readonly protocolFeeUrl = 'https://docs.lagoon.finance/vault-creators/fees-and-economics';

	// Used by requiresSettlement() type predicate
	protected readonly _requiresSettlement = true;

	readonly settlementInfoUrl = 'https://docs.lagoon.finance/introduction/readme/terminology#vault-settlement';

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

	async buyShares(config: Config, buyer: Address, value: bigint): Promise<HexString> {
		const { request } = await simulateContract(config, {
			...this.#vaultBaseContract,
			functionName: 'requestDeposit',
			args: [value, buyer, buyer]
		});

		return writeContract(config, request);
	}

	async getDepositResult(config: Config, transactionLogs: Log[]): Promise<DepositResult> {
		const [{ assets: assetValue }] = getEvents({
			abi: vaultAbi,
			address: this.address,
			eventName: 'DepositRequest',
			transactionLogs
		});

		const [denominationTokenInfo, vaultTokenInfo, shareValue] = await Promise.all([
			this.getDenominationTokenInfo(config),
			this.getVaultTokenInfo(config),
			this.#convertToShares(config, assetValue)
		]);

		return {
			assets: { ...denominationTokenInfo, value: assetValue },
			shares: { ...vaultTokenInfo, value: shareValue }
		};
	}

	async getPendingDeposit(config: Config, address: Address): Promise<PendingExchange> {
		const [depositId, assetToken, vaultToken] = await Promise.all([
			this.#getPendingDepositId(config, address),
			this.getDenominationTokenInfo(config),
			this.getVaultTokenInfo(config)
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
		const assetValue = pending || claimable || 0n;
		const settled = Boolean(claimable);

		let shareValue = 0n;

		if (assetValue > 0n) {
			const requestId = settled ? depositId : undefined;
			shareValue = await this.#convertToShares(config, assetValue, requestId);
		}

		return {
			type: 'deposit',
			assets: { ...assetToken, value: assetValue },
			shares: { ...vaultToken, value: shareValue },
			settled
		};
	}

	async cancelPendingDeposit(config: Config): Promise<HexString> {
		const { request } = await simulateContract(config, {
			...this.#vaultBaseContract,
			functionName: 'cancelRequestDeposit'
		});
		return writeContract(config, request);
	}

	async claimPendingDeposit(config: Config, address: Address, value: bigint): Promise<HexString> {
		const { request } = await simulateContract(config, {
			...this.#vaultBaseContract,
			functionName: 'deposit',
			args: [value, address]
		});
		return writeContract(config, request);
	}

	async redeemShares(config: Config, seller: Address, shares: bigint): Promise<HexString> {
		const { request } = await simulateContract(config, {
			...this.#vaultBaseContract,
			functionName: 'requestRedeem',
			args: [shares, seller, seller]
		});

		return writeContract(config, request);
	}

	async getRedemptionResult(config: Config, transactionLogs: Log[]): Promise<RedemptionResult> {
		const [{ shares: shareValue }] = getEvents({
			abi: vaultAbi,
			address: this.address,
			eventName: 'RedeemRequest',
			transactionLogs
		});

		const [denominationTokenInfo, vaultTokenInfo, assetValue] = await Promise.all([
			this.getDenominationTokenInfo(config),
			this.getVaultTokenInfo(config),
			this.#convertToAssets(config, shareValue)
		]);

		return {
			sharesRedeemed: { ...vaultTokenInfo, value: shareValue },
			assetsReceived: [],
			estimatedValue: { ...denominationTokenInfo, value: assetValue }
		};
	}

	async getPendingRedemption(config: Config, address: Address): Promise<PendingExchange> {
		const [redeemId, assetToken, vaultToken] = await Promise.all([
			this.#getPendingRedeemId(config, address),
			this.getDenominationTokenInfo(config),
			this.getVaultTokenInfo(config)
		]);

		const baseContract = {
			...this.#vaultBaseContract,
			args: [redeemId, address] as const
		};

		const response = await readContracts(config, {
			contracts: [
				{ ...baseContract, functionName: 'pendingRedeemRequest' },
				{ ...baseContract, functionName: 'claimableRedeemRequest' }
			]
		});

		const [pending, claimable] = response.map(({ result }) => result);
		const shareValue = pending || claimable || 0n;
		const settled = Boolean(claimable);

		let assetValue = 0n;

		if (shareValue > 0n) {
			const requestId = settled ? redeemId : undefined;
			assetValue = await this.#convertToAssets(config, shareValue, requestId);
		}

		return {
			type: 'redemption',
			shares: { ...vaultToken, value: shareValue },
			assets: { ...assetToken, value: assetValue },
			settled
		};
	}

	async claimPendingRedemption(config: Config, address: Address, value: bigint): Promise<HexString> {
		const { request } = await simulateContract(config, {
			...this.#vaultBaseContract,
			functionName: 'redeem',
			args: [value, address, address]
		});
		return writeContract(config, request);
	}

	#getPendingDepositId(config: Config, address: Address): Promise<bigint> {
		return readContract(config, {
			...this.#vaultBaseContract,
			functionName: 'lastDepositRequestId',
			args: [address]
		}).then(BigInt);
	}

	#getPendingRedeemId(config: Config, address: Address): Promise<bigint> {
		return readContract(config, {
			...this.#vaultBaseContract,
			functionName: 'lastRedeemRequestId',
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
		const { decimals } = await this.getVaultTokenInfo(config);
		const value = parseUnits('1', decimals);
		return this.#convertToAssets(config, value);
	}

	// Convert number of shares to value in denomination asset (with optional requestId)
	async #convertToAssets(config: Config, value: bigint, requestId?: bigint): Promise<bigint> {
		return readContract(config, {
			...this.#vaultBaseContract,
			functionName: 'convertToAssets',
			args: requestId ? [value, requestId] : [value]
		});
	}

	// Convert an asset value to number of shares (with optional requestId)
	async #convertToShares(config: Config, value: bigint, requestId?: bigint): Promise<bigint> {
		return readContract(config, {
			...this.#vaultBaseContract,
			functionName: 'convertToShares',
			args: requestId ? [value, requestId] : [value]
		});
	}
}

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
		const [denominationToken, shareBalance] = await Promise.all([
			this.getDenominationTokenInfo(config),
			this.getShareBalance(config, address)
		]);

		const value = await this.#convertValue(config, 'assets', shareBalance.value);
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
			this.#convertValue(config, 'shares', assetValue)
		]);

		return {
			assets: { ...denominationTokenInfo, value: assetValue },
			shares: { ...vaultTokenInfo, value: shareValue }
		};
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
			this.#convertValue(config, 'assets', shareValue)
		]);

		return {
			sharesRedeemed: { ...vaultTokenInfo, value: shareValue },
			assetsReceived: [],
			estimatedValue: { ...denominationTokenInfo, value: assetValue }
		};
	}

	getPendingDeposit(config: Config, address: Address): Promise<PendingExchange> {
		return this.#getPendingExchange(config, address, 'deposit');
	}

	getPendingRedemption(config: Config, address: Address): Promise<PendingExchange> {
		return this.#getPendingExchange(config, address, 'redemption');
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

	async claimPendingRedemption(config: Config, address: Address, value: bigint): Promise<HexString> {
		const { request } = await simulateContract(config, {
			...this.#vaultBaseContract,
			functionName: 'redeem',
			args: [value, address, address]
		});
		return writeContract(config, request);
	}

	// get a pending deposit or redemption
	async #getPendingExchange(
		config: Config,
		address: Address,
		type: 'deposit' | 'redemption'
	): Promise<PendingExchange> {
		const isDeposit = type === 'deposit';

		const [requestId, assetToken, vaultToken] = await Promise.all([
			this.#getLastRequestId(config, address, type),
			this.getDenominationTokenInfo(config),
			this.getVaultTokenInfo(config)
		]);

		const baseContract = {
			...this.#vaultBaseContract,
			args: [requestId, address] as const
		};

		const fnSuffix = isDeposit ? 'DepositRequest' : 'RedeemRequest';

		const response = await readContracts(config, {
			contracts: [
				{ ...baseContract, functionName: `pending${fnSuffix}` },
				{ ...baseContract, functionName: `claimable${fnSuffix}` }
			]
		});

		const [pending, claimable] = response.map(({ result }) => result);
		const settled = Boolean(claimable);

		// if deposit: from = assets, to = shares
		// if redemption: from = shares, to = assets
		const values = {
			from: pending || claimable || 0n,
			to: 0n
		};

		if (values.from > 0n) {
			const reqId = settled ? requestId : undefined;
			const convertTo = isDeposit ? 'shares' : 'assets';
			values.to = await this.#convertValue(config, convertTo, values.from, reqId);
		}

		return {
			type,
			settled,
			assets: { ...assetToken, value: isDeposit ? values.from : values.to },
			shares: { ...vaultToken, value: isDeposit ? values.to : values.from }
		};
	}

	#getLastRequestId(config: Config, address: Address, type: 'deposit' | 'redemption'): Promise<bigint> {
		const functionName = type === 'deposit' ? 'lastDepositRequestId' : 'lastRedeemRequestId';
		return readContract(config, {
			...this.#vaultBaseContract,
			functionName,
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

	async #getShareAssetValue(config: Config): Promise<bigint> {
		const { decimals } = await this.getVaultTokenInfo(config);
		const value = parseUnits('1', decimals);
		return this.#convertValue(config, 'assets', value);
	}

	// Convert asset value to shares or vice-versa
	async #convertValue(config: Config, to: 'assets' | 'shares', value: bigint, requestId?: bigint): Promise<bigint> {
		const functionName = to === 'assets' ? 'convertToAssets' : 'convertToShares';
		return readContract(config, {
			...this.#vaultBaseContract,
			functionName,
			args: requestId ? [value, requestId] : [value]
		});
	}
}

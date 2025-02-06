import type { Config } from '@wagmi/core';
import type { TokenBalance } from '$lib/eth-defi/schemas/token';

export type VaultFees = {
	managementFee: number;
	totalPerformanceFee: number;
	tradingStrategyProtocolFee?: number;
	strategyDeveloperFee?: number;
};

export type PendingDeposit = {
	asset: TokenBalance;
	shares: TokenBalance;
	settled: boolean;
};

export type SettlementRequired = {
	getPendingDeposit(config: Config, address: Address): Promise<PendingDeposit>;
};

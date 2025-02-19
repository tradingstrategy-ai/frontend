import type { VelvetSmartContracts } from 'trade-executor/schemas/summary';
import type { Config } from '@wagmi/core';
import type { TokenBalance } from '$lib/eth-defi/schemas/token';
import { BaseVault } from '../base';
import { getTokenInfo } from '$lib/eth-defi/helpers';

export class VelvetVault extends BaseVault<VelvetSmartContracts> {
	readonly type = 'velvet';
	readonly label = 'Velvet Capital';
	readonly logoUrl = '/logos/tokens/velvet';
	readonly address = this.contracts.portfolio;
	readonly inKindRedemption = true;

	// Velvet Capital protocol fee and info
	readonly protocolFee = 0.002;
	readonly protocolFeeTooltip = `
		To support further development & future token buy-backs Velvet Capital DeFi execution engine
		takes a 0.2% transaction fee. The fee can be further reduced by staking Velvet tokens (please
		refer to the Tokenomics section).
	`;
	readonly protocolFeeUrl = 'https://docs.velvet.capital/product/fees';

	get shortLabel() {
		return 'Velvet';
	}

	get externalProviderUrl() {
		return `https://dapp.velvet.capital/VaultDetails/${this.contracts.portfolio}`;
	}

	// TODO: this is a temporary stub that only returns if share balance is 0
	async getShareValueUSD(config: Config, address: Address): Promise<TokenBalance> {
		// hard-code USDC for now
		const usdcAddress = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

		const [usdcInfo, shareBalance] = await Promise.all([
			getTokenInfo(config, { chainId: this.chain.id, address: usdcAddress }),
			this.getShareBalance(config, address)
		]);

		// if share balance is 0, we know the value is 0
		if (shareBalance.value === 0n) {
			return { ...usdcInfo, value: 0n };
		}

		// otherwise, TBD (need to determine how to get share price or convert to share value)
		throw new Error('Unable to calculate share value.');
	}
}

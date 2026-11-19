import { BaseAssetManager } from '../base';

export class HyperliquidVault extends BaseAssetManager {
	type = 'hyperliquid';
	label = 'Hyperliquid';
	logoUrl = '/logos/blockchains/hyperliquid.svg';

	get mode(): string {
		return 'Hyperliquid vault';
	}
}

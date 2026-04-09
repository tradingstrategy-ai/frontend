import { BaseAssetManager } from '../base';

export class HyperliquidVault extends BaseAssetManager {
	type = 'hyperliquid';
	label = 'Hyperliquid';
	logoUrl = '/logos/blockchains/hyperliquid';

	get mode(): string {
		return 'Hyperliquid vault';
	}
}

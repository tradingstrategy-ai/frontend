import { BaseAssetManager } from '../base';

export class HotWallet extends BaseAssetManager {
	type = 'hot_wallet';
	label = 'Hot Wallet';
	logoUrl = '/logos/wallets/metamask';
}

import { BaseAssetManager, DepositMethod } from '../base';

export class HotWallet extends BaseAssetManager {
	type = 'hot_wallet';
	label = 'Hot Wallet';
	logoUrl = '/logos/wallets/metamask';

	depositMethod = DepositMethod.NONE;

	// FIXME: remove (see BaseAssetManagager for details)
	get externalProviderUrl() {
		return null;
	}
}
